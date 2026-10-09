import time
import json
import re
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.agent.tools import AgentTools
from app.models.models import Student, Job, PrepPlan
from app.schemas.schemas import AgentTraceStep, AgentQueryResponse

class AgentOrchestrator:
    """
    Intelligent, grounded agent orchestrator for PlaceMate AI.
    Executes intent-driven tool selection, manages conversational context across turns,
    validates arguments, respects security isolation, and grounds all responses in real database records.
    """

    @staticmethod
    def _extract_recent_context(history: Optional[List[Dict[str, Any]]]) -> Dict[str, Any]:
        """
        Extracts previous candidate jobs and active role references from conversation history.
        """
        context = {
            "last_jobs": [],
            "last_active_job_id": None,
            "last_active_role": None
        }
        if not history:
            return context

        # Iterate backwards through history to find the most recent assistant response with job data
        for turn in reversed(history):
            # Check structured results
            struct = turn.get("structuredResult") or turn.get("structured_result")
            if struct and isinstance(struct, dict):
                job_match = struct.get("job_match")
                if job_match and isinstance(job_match, dict):
                    jid = job_match.get("job_id")
                    if jid and not context["last_active_job_id"]:
                        context["last_active_job_id"] = jid
                        context["last_active_role"] = job_match.get("title")

            # Check trace or data for top matches
            trace = turn.get("trace") or []
            for step in trace:
                if step.get("tool_name") == "rank_job_matches":
                    data = step.get("data")
                    if data and isinstance(data, dict):
                        top_id = data.get("top_match_id")
                        if top_id and not context["last_active_job_id"]:
                            context["last_active_job_id"] = top_id

            # Check text for mentions
            text = turn.get("text", "") or turn.get("final_answer", "")
            matches = re.findall(r"\bJ\d{3}\b", text)
            if matches:
                context["last_jobs"].extend(matches)
                if not context["last_active_job_id"]:
                    context["last_active_job_id"] = matches[0]

        return context

    @staticmethod
    def _resolve_target_job(
        query: str,
        db: Session,
        context: Dict[str, Any],
        student_dict: dict
    ) -> Tuple[Optional[Job], Optional[str]]:
        """
        Resolves target job from query, ordinal references (e.g. 'the first one', 'the second one'),
        or conversation context.
        """
        q_lower = query.lower()

        # 1. Direct Job ID in query (e.g., J001, J004, J999)
        jid_match = re.search(r"\b(j\d{3}[a-zA-Z0-9_]*)\b", q_lower)
        if jid_match:
            target_id = jid_match.group(1).upper()
            job = db.query(Job).filter(Job.id == target_id).first()
            if job:
                return job, None
            else:
                class MissingJob:
                    id = target_id
                    title = f"Unknown Role ({target_id})"
                    company = "Unknown Organization"
                return MissingJob(), f"Job ID '{target_id}' not found in database"

        # 2. Ordinal references (first one, second one, top match, #2, etc.)
        all_jobs = db.query(Job).all()
        # Get ranked order for this student
        ranked_data = AgentTools.rank_job_matches(db, student_dict)
        top_matches = ranked_data.get("top_matches", [])

        if any(term in q_lower for term in ["second one", "second job", "#2", "2nd one", "2nd job"]):
            if len(top_matches) >= 2:
                target_id = top_matches[1]["job_id"]
                job = db.query(Job).filter(Job.id == target_id).first()
                if job:
                    return job, "Resolved 'the second one' from current ranked opportunities."
            elif len(all_jobs) >= 2:
                return all_jobs[1], "Resolved second available position."

        if any(term in q_lower for term in ["third one", "third job", "#3", "3rd one", "3rd job"]):
            if len(top_matches) >= 3:
                target_id = top_matches[2]["job_id"]
                job = db.query(Job).filter(Job.id == target_id).first()
                if job:
                    return job, "Resolved 'the third one' from ranked matches."

        if any(term in q_lower for term in ["first one", "first job", "#1", "top one", "top match", "best match"]):
            if top_matches:
                target_id = top_matches[0]["job_id"]
                job = db.query(Job).filter(Job.id == target_id).first()
                if job:
                    return job, "Resolved 'the first/top match' from ranked opportunities."

        # 3. Match by Company Name or Role Title in Query
        for job in all_jobs:
            if job.company.lower() in q_lower or job.title.lower() in q_lower:
                return job, f"Matched '{job.title}' at {job.company} by title/company keyword."

        # 4. Fallback to conversation context
        if context.get("last_active_job_id") and any(w in q_lower for w in ["it", "this job", "this role", "the job", "the role", "for it", "for this"]):
            job = db.query(Job).filter(Job.id == context["last_active_job_id"]).first()
            if job:
                return job, f"Resolved contextual reference to previously discussed role '{job.title}'."

        # 5. Default to student's highest ranked match if any
        if top_matches:
            target_id = top_matches[0]["job_id"]
            job = db.query(Job).filter(Job.id == target_id).first()
            if job:
                return job, None

        return (all_jobs[0] if all_jobs else None), None

    @staticmethod
    def run_agent(
        db: Session,
        student_id: str,
        query: str,
        mode: str = "auto",
        conversation_history: Optional[List[Dict[str, Any]]] = None
    ) -> AgentQueryResponse:
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            return AgentQueryResponse(
                query=query,
                execution_mode="FALLBACK_DEMO",
                trace=[],
                final_answer=f"Student record '{student_id}' could not be found. Please select a valid profile from the candidate dropdown.",
                suggested_actions=["Select Candidate Profile", "Verify Student ID"]
            )

        student_dict = {
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "degree": student.degree,
            "branch": student.branch,
            "graduation_year": student.graduation_year,
            "cgpa": student.cgpa,
            "backlogs": student.backlogs,
            "skills": student.skills,
            "preferred_role": student.preferred_role,
            "preferred_location": student.preferred_location,
        }

        context = AgentOrchestrator._extract_recent_context(conversation_history)
        q_lower = query.strip().lower()
        first_name = student.full_name.split()[0] if student.full_name else "Candidate"

        trace: List[AgentTraceStep] = []
        step_counter = 1

        # Check if query is completely outside the domain of placement/career
        unsupported_keywords = ["weather", "flight", "flights", "hotel", "stock price", "crypto", "bitcoin", "horoscope", "recipe", "pizza"]
        if any(w in q_lower for w in unsupported_keywords):
            return AgentQueryResponse(
                query=query,
                execution_mode="FALLBACK_DEMO",
                trace=[],
                final_answer=(
                    f"Hi {first_name}! PlaceMate AI is an agentic college placement assistant dedicated to "
                    "campus placements, job matching, eligibility verification, skill gap analysis, and interview preparation. "
                    "I cannot assist with general queries outside career and placement topics.\n\n"
                    "**Supported placement actions you can try:**\n"
                    "- *'Recommend the best jobs for my profile'*\n"
                    "- *'Am I eligible for Python Developer?'*\n"
                    "- *'Analyze my skill gaps for Software Engineer'*\n"
                    "- *'Create a 4-week interview preparation plan'*"
                ),
                suggested_actions=["Find Best Jobs", "Check Eligibility", "Skill Gap Analysis", "Create 4-Week Prep Plan"]
            )

        # -------------------------------------------------------------------------
        # Scenario A: Compare Two Jobs
        # -------------------------------------------------------------------------
        # Only trigger job vs job comparison if specifically comparing two jobs, not comparing search results with profile!
        is_two_job_comparison = (
            "compare" in q_lower and
            not any(phrase in q_lower for phrase in ["with my profile", "my profile", "find", "search", "roadmap", "plan", "four-week", "4-week", "best suitable", "vacancies"]) and
            (
                "two" in q_lower or
                "between" in q_lower or
                len(re.findall(r"\b(j\d{3})\b", q_lower)) >= 2 or
                ("jobs" in q_lower and "and" in q_lower)
            )
        )
        if is_two_job_comparison:
            all_jobs = db.query(Job).all()
            # Try to identify two jobs
            j1_id, j2_id = "J001", "J004"
            found_ids = re.findall(r"\b(j\d{3})\b", q_lower)
            if len(found_ids) >= 2:
                j1_id, j2_id = found_ids[0].upper(), found_ids[1].upper()
            elif len(all_jobs) >= 2:
                j1_id, j2_id = all_jobs[0].id, all_jobs[1].id

            t0 = time.time()
            comp_res = AgentTools.compare_jobs(db, student_dict, j1_id, j2_id)
            t1 = time.time()

            trace.append(AgentTraceStep(
                step_number=step_counter,
                tool_name="compare_jobs",
                arguments={"job_id_1": j1_id, "job_id_2": j2_id},
                status="COMPLETED" if "error" not in comp_res else "FAILED",
                duration_ms=int((t1 - t0) * 1000),
                result_summary=comp_res.get("verdict", "Evaluated side-by-side job criteria."),
                data=comp_res
            ))

            job1 = comp_res.get("job_1", {})
            job2 = comp_res.get("job_2", {})
            final_answer = (
                f"Hi {first_name}! Here is a side-by-side comparison of the two positions:\n\n"
                f"**1. {job1.get('title')} ({job1.get('company')})**\n"
                f"- **Match Score:** {job1.get('match_score')}%\n"
                f"- **Eligibility Status:** {job1.get('eligibility_status')} ({'Eligible' if job1.get('is_eligible') else 'Ineligible / Conditional'})\n"
                f"- **Salary Package:** {job1.get('salary_range')}\n\n"
                f"**2. {job2.get('title')} ({job2.get('company')})**\n"
                f"- **Match Score:** {job2.get('match_score')}%\n"
                f"- **Eligibility Status:** {job2.get('eligibility_status')} ({'Eligible' if job2.get('is_eligible') else 'Ineligible / Conditional'})\n"
                f"- **Salary Package:** {job2.get('salary_range')}\n\n"
                f"**Strategic Takeaway:** {comp_res.get('verdict')}"
            )

            return AgentQueryResponse(
                query=query,
                execution_mode="FALLBACK_DEMO",
                trace=trace,
                final_answer=final_answer,
                suggested_actions=[f"Prepare for {job1.get('title')}", f"Prepare for {job2.get('title')}"],
                structured_result={
                    "job_match": {
                        "title": job1.get("title", "Role 1"),
                        "company": job1.get("company", "Company 1"),
                        "score": job1.get("match_score", 75),
                        "is_eligible": bool(job1.get("is_eligible")),
                        "eligibility_status": job1.get("eligibility_status", "ELIGIBLE"),
                        "job_id": j1_id
                    }
                }
            )

        # -------------------------------------------------------------------------
        # Scenario B: What should I study today / next steps
        # -------------------------------------------------------------------------
        if "study today" in q_lower or "what should i study" in q_lower or "next task" in q_lower:
            # Check existing plan in DB
            plan = db.query(PrepPlan).filter(PrepPlan.student_id == student.id).first()
            target_job, _ = AgentOrchestrator._resolve_target_job(query, db, context, student_dict)
            target_job_id = target_job.id if target_job else "J001"

            t0 = time.time()
            gap_res = AgentTools.analyze_skill_gaps(db, student_dict, target_job_id)
            t1 = time.time()

            trace.append(AgentTraceStep(
                step_number=step_counter,
                tool_name="analyze_skill_gaps",
                arguments={"job_id": target_job_id},
                status="COMPLETED",
                duration_ms=int((t1 - t0) * 1000),
                result_summary=f"Evaluated skill gaps for {gap_res.get('job_title')}.",
                data={"missing_required_count": gap_res.get("missing_required_count")}
            ))
            step_counter += 1

            missing_req = gap_res.get("missing_required", [])
            primary_focus = missing_req[0] if missing_req else "DSA Two-Pointer Technique"

            final_answer = (
                f"Hi {first_name}! Based on your verified skill gap analysis for **{gap_res.get('job_title')}** at {gap_res.get('company')}, here is your high-impact study goal for today:\n\n"
                f"🎯 **Today's Primary Focus:** Master **{primary_focus}** fundamentals\n\n"
                f"**Structured 90-Minute Drill Plan:**\n"
                f"1. **Concept Review (25 min):** Review core architecture and best practices for {primary_focus}.\n"
                f"2. **Hands-on Exercise (40 min):** Build or debug a standalone script demonstrating {primary_focus}.\n"
                f"3. **Interview Practice (25 min):** Answer standard technical interview questions and explain time/space trade-offs.\n\n"
                f"Would you like me to generate a full 4-week roadmap or launch an AI Mock Interview focusing on {primary_focus}?"
            )

            return AgentQueryResponse(
                query=query,
                execution_mode="FALLBACK_DEMO",
                trace=trace,
                final_answer=final_answer,
                suggested_actions=["Generate 4-Week Prep Plan", f"Practice {primary_focus} in Mock Interview"],
                structured_result={
                    "skill_gaps": {
                        "overall_match_percentage": gap_res.get("overall_match_percentage", 70),
                        "matched_skills": gap_res.get("matched_skills", []),
                        "missing_skills": missing_req,
                        "missing_count": len(missing_req)
                    }
                }
            )

        # -------------------------------------------------------------------------
        # Scenario C: Dedicated Eligibility Evaluation
        # -------------------------------------------------------------------------
        is_eligibility_query = (
            "eligible" in q_lower or
            "eligibility" in q_lower or
            "criteria" in q_lower or
            "qualify" in q_lower
        ) and not any(w in q_lower for w in ["find", "search", "recommend", "best", "opportunities", "vacancies", "plan"])

        if is_eligibility_query:
            target_job, resolve_note = AgentOrchestrator._resolve_target_job(query, db, context, student_dict)
            if not target_job:
                return AgentQueryResponse(
                    query=query,
                    execution_mode="FALLBACK_DEMO",
                    trace=[],
                    final_answer="No active job vacancies found to evaluate eligibility against.",
                    suggested_actions=["Browse Available Jobs"]
                )

            t0 = time.time()
            elig_res = AgentTools.check_eligibility(db, student_dict, target_job.id)
            t1 = time.time()

            has_error = "error" in elig_res
            trace.append(AgentTraceStep(
                step_number=step_counter,
                tool_name="check_eligibility",
                arguments={"job_id": target_job.id},
                status="FAILED" if has_error else "COMPLETED",
                duration_ms=int((t1 - t0) * 1000),
                result_summary=elig_res.get("error") if has_error else f"Evaluated 4 criteria for '{target_job.title}': Status is {elig_res.get('status')}.",
                data=elig_res
            ))

            if has_error:
                return AgentQueryResponse(
                    query=query,
                    execution_mode="FALLBACK_DEMO",
                    trace=trace,
                    final_answer=f"Hi {first_name}! I could not verify eligibility: {elig_res.get('error')}. Please verify the target job ID or select an active campus drive.",
                    suggested_actions=["Browse Available Vacancies", "Search Jobs"],
                    structured_result={
                        "eligibility": {
                            "status": "UNKNOWN",
                            "is_eligible": False,
                            "summary": elig_res.get("error", "Target job not found.")
                        }
                    }
                )

            breakdown_lines = []
            for c in elig_res.get("criteria_breakdown", []):
                icon = "✅" if c.get("status") == "MET" else ("⚠️" if c.get("status") == "UNKNOWN" else "❌")
                breakdown_lines.append(f"- {icon} **{c.get('criterion_name')}**: {c.get('explanation')} (Required: `{c.get('required_value')}`, Your Profile: `{c.get('student_value')}`)")

            status_str = elig_res.get("status")
            status_desc = (
                "**Eligible to apply immediately**" if status_str == "ELIGIBLE" else
                ("**Conditional** — profile requires missing information verification" if status_str == "CONDITIONAL" else
                 "**Currently Ineligible** based on mandatory recruitment standards")
            )

            final_answer = (
                f"Hi {first_name}! Here is your verified eligibility breakdown for **{target_job.title}** at **{target_job.company}**:\n\n"
                f"**Overall Verdict:** {status_desc}\n\n"
                f"**Criteria Audit:**\n" + "\n".join(breakdown_lines) + "\n\n"
                f"*{elig_res.get('summary')}*"
            )

            return AgentQueryResponse(
                query=query,
                execution_mode="FALLBACK_DEMO",
                trace=trace,
                final_answer=final_answer,
                suggested_actions=[f"Analyze Skill Gaps for {target_job.title}", f"Create Prep Plan for {target_job.title}"],
                structured_result={
                    "eligibility": {
                        "status": elig_res.get("status", "ELIGIBLE"),
                        "is_eligible": bool(elig_res.get("is_eligible")),
                        "summary": elig_res.get("summary", "")
                    },
                    "job_match": {
                        "title": target_job.title,
                        "company": target_job.company,
                        "score": 80 if elig_res.get("is_eligible") else 50,
                        "is_eligible": bool(elig_res.get("is_eligible")),
                        "eligibility_status": elig_res.get("status", "ELIGIBLE"),
                        "job_id": target_job.id
                    }
                }
            )

        # -------------------------------------------------------------------------
        # Scenario D: Dedicated Skill Gap Analysis
        # -------------------------------------------------------------------------
        is_skill_gap_query = (
            "skill" in q_lower or
            "missing" in q_lower or
            "gap" in q_lower or
            "improve" in q_lower or
            "learn" in q_lower
        ) and not any(w in q_lower for w in ["find", "search", "recommend", "opportunities", "vacancies", "roadmap", "plan", "best suitable"])

        if is_skill_gap_query:
            target_job, resolve_note = AgentOrchestrator._resolve_target_job(query, db, context, student_dict)
            if not target_job:
                return AgentQueryResponse(
                    query=query,
                    execution_mode="FALLBACK_DEMO",
                    trace=[],
                    final_answer="Could not resolve target role for skill gap analysis.",
                    suggested_actions=["Browse Jobs"]
                )

            t0 = time.time()
            gap_res = AgentTools.analyze_skill_gaps(db, student_dict, target_job.id)
            t1 = time.time()

            trace.append(AgentTraceStep(
                step_number=step_counter,
                tool_name="analyze_skill_gaps",
                arguments={"job_id": target_job.id},
                status="COMPLETED" if "error" not in gap_res else "FAILED",
                duration_ms=int((t1 - t0) * 1000),
                result_summary=f"Analyzed skills for '{target_job.title}'. Match percentage is {gap_res.get('overall_match_percentage')}%.",
                data=gap_res
            ))

            matched = gap_res.get("matched_skills", [])
            missing_req = gap_res.get("missing_required", [])
            missing_pref = gap_res.get("missing_preferred", [])

            matched_str = ", ".join(matched) if matched else "None evidenced in profile"
            missing_req_str = ", ".join(missing_req) if missing_req else "None! You meet all mandatory skills."
            missing_pref_str = ", ".join(missing_pref) if missing_pref else "None"

            final_answer = (
                f"Hi {first_name}! Here is your skill competency audit for **{target_job.title}** at **{target_job.company}**:\n\n"
                f"📊 **Overall Skill Alignment:** **{gap_res.get('overall_match_percentage')}%**\n\n"
                f"**Verified Strengths (Matched):**\n- {matched_str}\n\n"
                f"**High Priority Missing Skills (Required by Recruiter):**\n- {missing_req_str}\n\n"
                f"**Secondary Improvement Areas (Preferred Skills):**\n- {missing_pref_str}\n\n"
                f"💡 **Recommended Next Step:** Would you like to generate a tailored interview preparation roadmap targeting {missing_req[0] if missing_req else 'advanced topics'}?"
            )

            return AgentQueryResponse(
                query=query,
                execution_mode="FALLBACK_DEMO",
                trace=trace,
                final_answer=final_answer,
                suggested_actions=[f"Create Preparation Plan for {target_job.title}", "Start AI Mock Interview"],
                structured_result={
                    "skill_gaps": {
                        "overall_match_percentage": gap_res.get("overall_match_percentage", 70),
                        "matched_skills": matched,
                        "missing_skills": missing_req + missing_pref,
                        "missing_count": len(missing_req) + len(missing_pref)
                    },
                    "job_match": {
                        "title": target_job.title,
                        "company": target_job.company,
                        "score": gap_res.get("overall_match_percentage", 70),
                        "is_eligible": True,
                        "eligibility_status": "ELIGIBLE",
                        "job_id": target_job.id
                    }
                }
            )

        # -------------------------------------------------------------------------
        # Scenario E: Dedicated Preparation Plan Generation
        # -------------------------------------------------------------------------
        is_prep_query = (
            "prep" in q_lower or
            "plan" in q_lower or
            "roadmap" in q_lower or
            "four-week" in q_lower or
            "4-week" in q_lower or
            "two-week" in q_lower or
            "2-week" in q_lower or
            "schedule" in q_lower
        ) and not any(w in q_lower for w in ["find", "search", "vacancies", "opportunities", "recommend"])

        if is_prep_query:
            target_job, resolve_note = AgentOrchestrator._resolve_target_job(query, db, context, student_dict)
            if not target_job:
                return AgentQueryResponse(
                    query=query,
                    execution_mode="FALLBACK_DEMO",
                    trace=[],
                    final_answer="Could not resolve target role for preparation roadmap.",
                    suggested_actions=["Browse Available Jobs"]
                )

            # Detect duration
            deadline_days = 28
            if "two-week" in q_lower or "2-week" in q_lower or "14 days" in q_lower or "two weeks" in q_lower:
                deadline_days = 14
            elif "one-week" in q_lower or "7 days" in q_lower or "one week" in q_lower:
                deadline_days = 7
            elif "60 days" in q_lower or "two months" in q_lower:
                deadline_days = 60

            t0 = time.time()
            plan_res = AgentTools.generate_prep_plan(db, student_dict, target_job.id, deadline_days=deadline_days, persist=True)
            t1 = time.time()

            trace.append(AgentTraceStep(
                step_number=step_counter,
                tool_name="generate_prep_plan",
                arguments={"job_id": target_job.id, "deadline_days": deadline_days, "persist": True},
                status="COMPLETED" if "error" not in plan_res else "FAILED",
                duration_ms=int((t1 - t0) * 1000),
                result_summary=f"Generated {plan_res.get('tasks_count')} structured milestones for '{target_job.title}'. Persisted to database: {plan_res.get('persisted')}.",
                data=plan_res
            ))

            samples = plan_res.get("sample_tasks", [])
            sample_lines = [f"- **Day {s.get('day_number')} [{s.get('category')}]:** {s.get('title')} ({s.get('duration_minutes')} min)" for s in samples[:3]]

            final_answer = (
                f"Hi {first_name}! I have generated and saved your personalized **{deadline_days}-day interview preparation roadmap** for **{target_job.title}** at **{target_job.company}**.\n\n"
                f"📅 **Total Milestones:** {plan_res.get('tasks_count')} daily structured tasks across {deadline_days // 7} weekly phases.\n"
                f"💾 **Persistence:** Successfully saved to your profile roadmap. You can track completion and check off milestones on the Interview Prep page.\n\n"
                f"**Initial Action Items:**\n" + "\n".join(sample_lines) + "\n\n"
                f"Ready to begin? You can open your full roadmap or take an AI Mock Interview to benchmark your current level."
            )

            return AgentQueryResponse(
                query=query,
                execution_mode="FALLBACK_DEMO",
                trace=trace,
                final_answer=final_answer,
                suggested_actions=["Open Preparation Roadmap", "Take Role Mock Interview"],
                structured_result={
                    "prep_plan": {
                        "tasks_count": plan_res.get("tasks_count", 9),
                        "total_days": deadline_days,
                        "role_title": target_job.title,
                        "job_id": target_job.id,
                        "plan_id": plan_res.get("plan_id")
                    },
                    "job_match": {
                        "title": target_job.title,
                        "company": target_job.company,
                        "score": 85,
                        "is_eligible": True,
                        "eligibility_status": "ELIGIBLE",
                        "job_id": target_job.id
                    }
                }
            )

        # -------------------------------------------------------------------------
        # Scenario F: Explain Specific Job (e.g., 'Explain the second one')
        # -------------------------------------------------------------------------
        is_explain_query = (
            "tell me about" in q_lower or
            "why did i get this match score" in q_lower or
            "details" in q_lower or
            ("explain" in q_lower and not any(w in q_lower for w in ["find", "search", "vacancies", "opportunities", "roadmap", "plan", "four-week", "4-week", "best suitable"]))
        )
        if is_explain_query:
            target_job, resolve_note = AgentOrchestrator._resolve_target_job(query, db, context, student_dict)
            if target_job:
                t0 = time.time()
                details = AgentTools.get_job_details(db, student_dict, target_job.id)
                t1 = time.time()
                trace.append(AgentTraceStep(
                    step_number=step_counter,
                    tool_name="get_job_details",
                    arguments={"job_id": target_job.id},
                    status="COMPLETED",
                    duration_ms=int((t1 - t0) * 1000),
                    result_summary=f"Retrieved job specifications for '{target_job.title}'.",
                    data=details
                ))
                step_counter += 1

                t0 = time.time()
                elig_res = AgentTools.check_eligibility(db, student_dict, target_job.id)
                t1 = time.time()
                trace.append(AgentTraceStep(
                    step_number=step_counter,
                    tool_name="check_eligibility",
                    arguments={"job_id": target_job.id},
                    status="COMPLETED",
                    duration_ms=int((t1 - t0) * 1000),
                    result_summary=f"Status: {elig_res.get('status')}.",
                    data=elig_res
                ))
                step_counter += 1

                t0 = time.time()
                gap_res = AgentTools.analyze_skill_gaps(db, student_dict, target_job.id)
                t1 = time.time()
                trace.append(AgentTraceStep(
                    step_number=step_counter,
                    tool_name="analyze_skill_gaps",
                    arguments={"job_id": target_job.id},
                    status="COMPLETED",
                    duration_ms=int((t1 - t0) * 1000),
                    result_summary=f"Match score: {gap_res.get('overall_match_percentage')}%.",
                    data=gap_res
                ))

                note_prefix = f"*(Note: {resolve_note})*\n\n" if resolve_note else ""
                final_answer = (
                    f"{note_prefix}Hi {first_name}! Here are the details for **{target_job.title}** at **{target_job.company}**:\n\n"
                    f"- **Compensation:** {target_job.salary_range}\n"
                    f"- **Location & Work Mode:** {target_job.location} ({target_job.work_mode})\n"
                    f"- **Mandatory Cutoffs:** Min CGPA: {target_job.min_cgpa} | Max Backlogs: {target_job.max_backlogs}\n"
                    f"- **Eligibility Verdict:** {'Eligible' if elig_res.get('is_eligible') else elig_res.get('status')} ({elig_res.get('summary')})\n"
                    f"- **Skill Match:** {gap_res.get('overall_match_percentage')}%\n"
                    f"- **Key Required Skills:** {', '.join(details.get('required_skills', []))}\n\n"
                    f"**Job Summary:** {target_job.description[:250]}..."
                )

                return AgentQueryResponse(
                    query=query,
                    execution_mode="FALLBACK_DEMO",
                    trace=trace,
                    final_answer=final_answer,
                    suggested_actions=[f"Check Eligibility for {target_job.title}", f"Create Prep Plan for {target_job.title}"],
                    structured_result={
                        "job_match": {
                            "title": target_job.title,
                            "company": target_job.company,
                            "score": gap_res.get("overall_match_percentage", 75),
                            "is_eligible": bool(elig_res.get("is_eligible")),
                            "eligibility_status": elig_res.get("status", "ELIGIBLE"),
                            "job_id": target_job.id
                        }
                    }
                )

        # -------------------------------------------------------------------------
        # Scenario G: Multi-Step / Comprehensive Job Discovery & Pipeline
        # (Default intent for "Find jobs", "Recommend jobs", or full multi-step request)
        # -------------------------------------------------------------------------
        # Step 1: Search jobs with detected keyword and location filters
        search_filter = {}
        if "remote" in q_lower:
            search_filter["work_mode"] = "Remote"

        # Extract location if mentioned
        for loc in ["hyderabad", "bangalore", "bengaluru", "pune", "delhi", "mumbai", "chennai", "noida", "gurgaon"]:
            if loc in q_lower:
                search_filter["location"] = loc.title()
                break

        # Extract role / keyword
        if "python developer" in q_lower or "python dev" in q_lower:
            search_filter["keyword"] = "Python Developer"
        elif "python" in q_lower:
            search_filter["keyword"] = "Python"
        elif "full stack" in q_lower:
            search_filter["keyword"] = "Full Stack"
        elif "backend" in q_lower:
            search_filter["keyword"] = "Backend"
        elif "frontend" in q_lower:
            search_filter["keyword"] = "Frontend"
        elif "java" in q_lower:
            search_filter["keyword"] = "Java"
        elif "data analyst" in q_lower or "data science" in q_lower or "analyst" in q_lower:
            search_filter["keyword"] = "Data Analyst"
        elif "cloud" in q_lower or "devops" in q_lower:
            search_filter["keyword"] = "Cloud"

        t0 = time.time()
        search_res = AgentTools.search_jobs(db, student_dict, search_filter)
        t1 = time.time()

        provider_name = search_res.get("provider", "Campus Placement Cell")
        is_live = search_res.get("is_live", False)

        trace.append(AgentTraceStep(
            step_number=step_counter,
            tool_name="search_jobs",
            arguments={"filters": search_filter},
            status="COMPLETED",
            duration_ms=int((t1 - t0) * 1000),
            result_summary=f"Queried vacancies via {provider_name}: Found {search_res['total_found']} matching positions.",
            data={"total_found": search_res["total_found"], "provider": provider_name, "is_live": is_live}
        ))
        step_counter += 1

        # Step 2: Rank matches
        t0 = time.time()
        candidate_ids = [j["id"] for j in search_res.get("jobs", [])] if search_filter else None
        rank_res = AgentTools.rank_job_matches(db, student_dict, candidate_ids)
        t1 = time.time()

        top_matches = rank_res.get("top_matches", [])
        if not top_matches:
            # Fallback to all jobs ranking if filter was too restrictive
            rank_res = AgentTools.rank_job_matches(db, student_dict)
            top_matches = rank_res.get("top_matches", [])

        # Identify best eligible job first, or top ranked overall
        eligible_matches = [m for m in top_matches if m.get("is_eligible")]
        best_match = eligible_matches[0] if eligible_matches else (top_matches[0] if top_matches else None)

        if not best_match:
            return AgentQueryResponse(
                query=query,
                execution_mode="FALLBACK_DEMO",
                trace=trace,
                final_answer=f"No matching job listings currently found. Please broaden your role or location filters.",
                suggested_actions=["View All Opportunities", "Reset Filters"]
            )

        best_job_id = best_match["job_id"]
        best_job_title = best_match["title"]
        best_company = best_match["company"]
        best_job_score = best_match["match_score"]

        trace.append(AgentTraceStep(
            step_number=step_counter,
            tool_name="rank_job_matches",
            arguments={"candidate_jobs": len(top_matches)},
            status="COMPLETED",
            duration_ms=int((t1 - t0) * 1000),
            result_summary=f"Ranked opportunities. Highest match is '{best_job_title}' at {best_company} with compatibility score {best_job_score}%.",
            data={"top_match_id": best_job_id, "score": best_job_score}
        ))
        step_counter += 1

        # Step 3: Check eligibility on the top candidate
        t0 = time.time()
        elig_res = AgentTools.check_eligibility(db, student_dict, best_job_id)
        t1 = time.time()

        trace.append(AgentTraceStep(
            step_number=step_counter,
            tool_name="check_eligibility",
            arguments={"job_id": best_job_id},
            status="COMPLETED",
            duration_ms=int((t1 - t0) * 1000),
            result_summary=f"Evaluated mandatory eligibility for {best_job_title}: Verdict is {elig_res.get('status')}.",
            data={
                "is_eligible": elig_res.get("is_eligible"),
                "status": elig_res.get("status"),
                "failed_mandatory": elig_res.get("failed_mandatory")
            }
        ))
        step_counter += 1

        # Step 4: Analyze skill gaps
        t0 = time.time()
        gap_res = AgentTools.analyze_skill_gaps(db, student_dict, best_job_id)
        t1 = time.time()

        trace.append(AgentTraceStep(
            step_number=step_counter,
            tool_name="analyze_skill_gaps",
            arguments={"job_id": best_job_id},
            status="COMPLETED",
            duration_ms=int((t1 - t0) * 1000),
            result_summary=f"Skill alignment {gap_res.get('overall_match_percentage')}%. Identified {gap_res.get('missing_required_count')} required skill gaps.",
            data={
                "missing_required": gap_res.get("missing_required_count"),
                "missing_preferred": gap_res.get("missing_preferred_count")
            }
        ))
        step_counter += 1

        # Step 5: Check if full multi-step task requested plan generation
        is_full_pipeline = "plan" in q_lower or "roadmap" in q_lower or "analyze my profile" in q_lower or "prepare" in q_lower
        plan_res = None
        if is_full_pipeline:
            t0 = time.time()
            plan_res = AgentTools.generate_prep_plan(db, student_dict, best_job_id, deadline_days=28, persist=True)
            t1 = time.time()
            trace.append(AgentTraceStep(
                step_number=step_counter,
                tool_name="generate_prep_plan",
                arguments={"job_id": best_job_id, "deadline_days": 28, "persist": True},
                status="COMPLETED",
                duration_ms=int((t1 - t0) * 1000),
                result_summary=f"Generated {plan_res.get('tasks_count')} structured milestones. Persisted to database: {plan_res.get('persisted')}.",
                data={"tasks_count": plan_res.get("tasks_count")}
            ))

        # Build detailed formatted findings
        elig_criteria = elig_res.get("criteria_breakdown", [])
        criteria_lines = []
        for c in elig_criteria:
            c_name = c.get("criterion_name")
            c_status = c.get("status")
            c_expl = c.get("explanation")
            symbol = "✅" if c_status == "MET" else ("❓" if c_status == "UNKNOWN" else "❌")
            criteria_lines.append(f"  - {symbol} **{c_name}:** `{c_status}` — {c_expl}")
        criteria_block = "\n".join(criteria_lines) if criteria_lines else f"  - Status: {elig_res.get('status')}"

        matched_skills = gap_res.get("matched_skills", [])
        missing_required = gap_res.get("missing_required", [])
        missing_preferred = gap_res.get("missing_preferred", [])

        matched_str = ", ".join(matched_skills[:4]) if matched_skills else "Core programming fundamentals"
        missing_req_str = ", ".join(missing_required[:4]) if missing_required else "None (all mandatory competencies demonstrated)"
        missing_pref_str = ", ".join(missing_preferred[:3]) if missing_preferred else "None"

        # Build top results list with posting links
        top_list_lines = []
        for i, match in enumerate(top_matches[:3], start=1):
            m_title = match.get("title")
            m_comp = match.get("company")
            m_score = match.get("match_score")
            m_status = match.get("eligibility_status")
            m_url = match.get("original_url")
            m_prov = match.get("provider_name", "Campus Placement Cell")

            if m_url and m_url.startswith("http"):
                link_text = f"[Apply on Original Site]({m_url})"
            else:
                link_text = "Campus Drive (Apply via Placement Cell)"

            top_list_lines.append(
                f"{i}. **{m_title}** at **{m_comp}** — Compatibility: **{m_score}%** | Eligibility: `{m_status}`\n"
                f"   - Source: *{m_prov}* | 🔗 {link_text}"
            )
        top_list_block = "\n".join(top_list_lines)

        plan_section = ""
        if plan_res:
            plan_section = (
                f"\n\n### 4-Week Preparation Roadmap\n"
                f"- **Milestones Generated:** {plan_res.get('tasks_count')} daily structured tasks across 4 weekly phases.\n"
                f"- **Persistence:** Saved directly to your SQLite database roadmap. Completed tasks are preserved on subsequent updates.\n"
                f"- **Phase 1 Focus:** Core Language Fundamentals & High-Priority Gap Practice (`{missing_required[0] if missing_required else 'OOP'}`)."
            )

        final_answer = (
            f"Hi {first_name}! Here is the complete intelligence report based on available vacancies:\n\n"
            f"**Key Findings:**\n"
            f"- **Evaluated Positions:** {search_res['total_found']} active job listings (Source: {provider_name})\n"
            f"- **Strongest Match:** **{best_job_title}** at **{best_company}** with a **{best_job_score}% compatibility match score**.\n\n"
            f"### Verified Opportunities\n"
            f"{top_list_block}\n\n"
            f"### Compatibility & Eligibility Breakdown for Best Match\n"
            f"**Target Role:** **{best_job_title}** at **{best_company}** (Compatibility Score: **{best_job_score}%** | Profile Match Score: **{best_job_score}%**)\n"
            f"**Overall Verdict:** `{elig_res.get('status')}` ({elig_res.get('summary')})\n"
            f"**Detailed Requirement Checks:**\n"
            f"{criteria_block}\n\n"
            f"### Skill-Gap Analysis\n"
            f"- **Demonstrated Strengths:** {matched_str}\n"
            f"- **Missing Required Skills:** {missing_req_str}\n"
            f"- **Preferred Enhancements:** {missing_pref_str}"
            f"{plan_section}\n\n"
            f"Would you like to start a practice mock interview for {best_job_title} or inspect a different role?"
        )

        suggested_actions = [
            f"View {best_job_title} Details",
            "Review Skill Gap Breakdown",
            "Open 4-Week Prep Roadmap",
            "Start AI Mock Interview"
        ]

        structured_result = {
            "job_match": {
                "title": best_job_title,
                "company": best_company,
                "score": best_job_score,
                "is_eligible": bool(elig_res.get("is_eligible")),
                "eligibility_status": elig_res.get("status", "ELIGIBLE"),
                "job_id": best_job_id,
                "original_url": best_match.get("original_url"),
                "source_type": best_match.get("source_type"),
                "provider_name": best_match.get("provider_name")
            },
            "skill_gaps": {
                "overall_match_percentage": gap_res.get("overall_match_percentage", 70),
                "matched_skills": matched_skills,
                "missing_skills": missing_required,
                "missing_count": len(missing_required)
            },
            "eligibility": {
                "status": elig_res.get("status", "ELIGIBLE"),
                "is_eligible": bool(elig_res.get("is_eligible")),
                "summary": elig_res.get("summary", "Meets mandatory criteria")
            }
        }

        if plan_res:
            structured_result["prep_plan"] = {
                "tasks_count": plan_res.get("tasks_count", 9),
                "total_days": 28,
                "role_title": best_job_title,
                "job_id": best_job_id,
                "plan_id": plan_res.get("plan_id")
            }

        return AgentQueryResponse(
            query=query,
            execution_mode="FALLBACK_DEMO",
            trace=trace,
            final_answer=final_answer,
            suggested_actions=suggested_actions,
            structured_result=structured_result
        )
