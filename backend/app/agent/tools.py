import time
import json
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Job, Student, PrepPlan
from app.services.eligibility_service import EligibilityService
from app.services.matching_service import MatchingService, parse_semicolon_list
from app.services.skill_gap_service import SkillGapService
from app.services.prep_planner_service import PrepPlannerService

class AgentTools:
    """
    Validated, deterministic tool executions grounded in real SQLite database records.
    Every tool implements strict argument validation, error handling, and structured outputs.
    """

    @staticmethod
    def search_jobs(db: Session, student_profile: dict, filters: Optional[dict] = None) -> Dict[str, Any]:
        """
        Tool 1: search_jobs
        Searches available vacancies via configured job provider (or campus placement drives),
        honoring keywords, location, role, and work mode filters.
        """
        if filters is not None and not isinstance(filters, dict):
            return {"error": "Invalid filters parameter: expected a dictionary", "total_found": 0, "jobs": []}

        filters = filters or {}
        query_text = str(filters.get("keyword") or filters.get("role") or "").strip()
        location = str(filters.get("location") or "").strip()

        from app.services.job_providers.manager import job_provider_manager
        res = job_provider_manager.search_jobs(
            query=query_text,
            location=location if location and location.lower() != "all" else None,
            filters=filters,
            page=1,
            page_size=10,
            db=db
        )

        jobs_list = res.get("jobs", [])

        # Secondary filtering
        work_mode = str(filters.get("work_mode") or "").strip().lower()
        company = str(filters.get("company") or "").strip().lower()
        min_cgpa_max = filters.get("min_cgpa_max")

        filtered = []
        for j in jobs_list:
            if work_mode and work_mode not in (j.get("work_mode") or "").lower():
                continue
            if company and company not in (j.get("company") or "").lower():
                continue
            if min_cgpa_max is not None:
                try:
                    if float(j.get("min_cgpa", 0.0)) > float(min_cgpa_max):
                        continue
                except (ValueError, TypeError):
                    pass
            filtered.append(j)

        return {
            "total_found": len(filtered),
            "jobs": filtered[:8],
            "provider": res.get("provider", "Campus Placement Cell"),
            "is_live": res.get("is_live", False),
            "provider_error": res.get("provider_error"),
            "note": res.get("note"),
            "applied_filters": filters
        }

    @staticmethod
    def rank_job_matches(db: Session, student_profile: dict, job_ids: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Tool 2: rank_job_matches
        Calculates match scores and ranks jobs against student profile skills, role, and eligibility.
        """
        query = db.query(Job)
        if job_ids:
            if not isinstance(job_ids, list):
                return {"error": "job_ids must be a list of strings", "ranked_count": 0, "top_matches": []}
            query = query.filter(Job.id.in_(job_ids))
        jobs = query.all()

        if not jobs:
            return {"ranked_count": 0, "top_matches": [], "message": "No jobs found matching criteria."}

        job_dicts = []
        for j in jobs:
            job_dicts.append({
                "id": j.id,
                "title": j.title,
                "company": j.company,
                "location": j.location,
                "work_mode": j.work_mode,
                "eligible_branches": j.eligible_branches,
                "min_cgpa": j.min_cgpa,
                "max_backlogs": j.max_backlogs,
                "graduation_year_min": j.graduation_year_min,
                "graduation_year_max": j.graduation_year_max,
                "required_skills": j.required_skills,
                "preferred_skills": j.preferred_skills,
                "salary_range": j.salary_range,
                "description": j.description,
                "original_url": getattr(j, "original_url", None),
                "source_type": getattr(j, "source_type", "campus_drive") or "campus_drive",
                "provider_name": getattr(j, "provider_name", "Campus Placement Cell") or "Campus Placement Cell",
                "freshness_status": getattr(j, "freshness_status", "Active") or "Active"
            })

        ranked = MatchingService.rank_and_evaluate(student_profile, job_dicts)
        top_matches = []
        for r in ranked[:8]:
            top_matches.append({
                "job_id": r["id"],
                "title": r["title"],
                "company": r["company"],
                "match_score": r["match_score"],
                "is_eligible": r["is_eligible"],
                "eligibility_status": r["eligibility_status"],
                "failed_mandatory": r["failed_mandatory"],
                "match_reasons": r["match_reasons"],
                "salary_range": r.get("salary_range", "Competitive"),
                "original_url": r.get("original_url"),
                "source_type": r.get("source_type", "campus_drive"),
                "provider_name": r.get("provider_name", "Campus Placement Cell"),
                "freshness_status": r.get("freshness_status", "Active")
            })

        return {
            "ranked_count": len(ranked),
            "top_matches": top_matches
        }

    @staticmethod
    def check_eligibility(db: Session, student_profile: dict, job_id: str) -> Dict[str, Any]:
        """
        Tool 3: check_eligibility
        Runs deterministic business logic to verify mandatory criteria (Branch, CGPA, Backlogs, Grad Year).
        """
        if not job_id or not isinstance(job_id, str):
            return {"error": "Invalid job_id provided", "is_eligible": False, "status": "UNKNOWN"}

        job = db.query(Job).filter(Job.id == job_id.strip()).first()
        if not job:
            return {"error": f"Job ID '{job_id}' not found in database", "is_eligible": False, "status": "UNKNOWN"}

        job_dict = {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "eligible_branches": job.eligible_branches,
            "min_cgpa": job.min_cgpa,
            "max_backlogs": job.max_backlogs,
            "graduation_year_min": job.graduation_year_min,
            "graduation_year_max": job.graduation_year_max,
        }

        res = EligibilityService.evaluate_eligibility(student_profile, job_dict)
        return {
            "job_id": job.id,
            "job_title": job.title,
            "company": job.company,
            "is_eligible": res.is_eligible,
            "status": res.status,  # "ELIGIBLE" | "NOT_ELIGIBLE" | "CONDITIONAL"
            "failed_mandatory": res.failed_mandatory,
            "criteria_breakdown": [c.model_dump() for c in res.criteria],
            "summary": res.summary
        }

    @staticmethod
    def analyze_skill_gaps(db: Session, student_profile: dict, job_id: str) -> Dict[str, Any]:
        """
        Tool 4: analyze_skill_gaps
        Compares candidate verified profile skills against required and preferred job competencies.
        """
        if not job_id or not isinstance(job_id, str):
            return {"error": "Invalid job_id provided"}

        job = db.query(Job).filter(Job.id == job_id.strip()).first()
        if not job:
            return {"error": f"Job ID '{job_id}' not found in database"}

        job_dict = {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "required_skills": job.required_skills,
            "preferred_skills": job.preferred_skills,
        }

        res = SkillGapService.analyze(student_profile, job_dict)
        matched_skills = [s.skill for s in res.skills_breakdown if s.status == "matched"]
        missing_required = [s.skill for s in res.skills_breakdown if s.status == "missing" and s.skill_type == "required"]
        missing_preferred = [s.skill for s in res.skills_breakdown if s.status == "missing" and s.skill_type == "preferred"]

        return {
            "job_id": job.id,
            "job_title": job.title,
            "company": job.company,
            "overall_match_percentage": res.overall_match_percentage,
            "matched_skills": matched_skills,
            "missing_required": missing_required,
            "missing_preferred": missing_preferred,
            "matched_skills_count": res.matched_skills_count,
            "missing_required_count": res.missing_required_count,
            "missing_preferred_count": res.missing_preferred_count,
            "skills_breakdown": [g.model_dump() for g in res.skills_breakdown]
        }

    @staticmethod
    def generate_prep_plan(
        db: Session,
        student_profile: dict,
        job_id: str,
        deadline_days: int = 28,
        persist: bool = True
    ) -> Dict[str, Any]:
        """
        Tool 5: generate_prep_plan
        Creates a structured daily/weekly interview preparation roadmap and persists it to SQLite.
        """
        if not job_id or not isinstance(job_id, str):
            return {"error": "Invalid job_id provided"}

        job = db.query(Job).filter(Job.id == job_id.strip()).first()
        if not job:
            return {"error": f"Job ID '{job_id}' not found in database"}

        student_id = student_profile.get("id")
        if not student_id:
            return {"error": "Student ID is missing from profile"}

        job_dict = {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "required_skills": job.required_skills,
            "preferred_skills": job.preferred_skills,
        }

        # Enforce reasonable deadline range: 7 to 90 days
        days = max(7, min(90, int(deadline_days)))

        existing = db.query(PrepPlan).filter(
            PrepPlan.student_id == student_id,
            PrepPlan.job_id == job.id
        ).first()

        completed_task_ids = set()
        completed_task_titles = set()
        if existing and existing.tasks_json:
            try:
                old_tasks = json.loads(existing.tasks_json)
                for ot in old_tasks:
                    if ot.get("is_completed"):
                        completed_task_ids.add(ot.get("id"))
                        if ot.get("title"):
                            completed_task_titles.add(ot.get("title").strip().lower())
            except Exception:
                pass

        tasks = PrepPlannerService.generate_plan(student_profile, job_dict, days=days)
        tasks_dicts = [t.model_dump() for t in tasks]
        # Preserve completed milestones upon roadmap revision
        for td in tasks_dicts:
            if td.get("id") in completed_task_ids or td.get("title", "").strip().lower() in completed_task_titles:
                td["is_completed"] = True

        tasks_json = json.dumps(tasks_dicts)

        plan_id = f"plan-{uuid.uuid4().hex[:8]}"
        is_persisted = False

        if persist:
            if existing:
                existing.total_days = days
                existing.tasks_json = tasks_json
                existing.role_title = job.title
                db.commit()
                plan_id = existing.id
                is_persisted = True
            else:
                new_plan = PrepPlan(
                    id=plan_id,
                    student_id=student_id,
                    job_id=job.id,
                    role_title=job.title,
                    total_days=days,
                    tasks_json=tasks_json
                )
                db.add(new_plan)
                db.commit()
                is_persisted = True

        return {
            "plan_id": plan_id,
            "job_id": job.id,
            "job_title": job.title,
            "company": job.company,
            "deadline_days": days,
            "tasks_count": len(tasks),
            "persisted": is_persisted,
            "sample_tasks": tasks_dicts[:4]
        }

    @staticmethod
    def get_job_details(db: Session, student_profile: dict, job_id: str) -> Dict[str, Any]:
        """
        Tool 6: get_job_details
        Retrieves detailed specification, CTC, location, and requirements for a target vacancy.
        """
        if not job_id or not isinstance(job_id, str):
            return {"error": "Invalid job_id provided"}

        job = db.query(Job).filter(Job.id == job_id.strip()).first()
        if not job:
            return {"error": f"Job ID '{job_id}' not found"}

        return {
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "work_mode": job.work_mode,
            "salary_range": job.salary_range,
            "min_cgpa": job.min_cgpa,
            "max_backlogs": job.max_backlogs,
            "eligible_branches": parse_semicolon_list(job.eligible_branches),
            "required_skills": parse_semicolon_list(job.required_skills),
            "preferred_skills": parse_semicolon_list(job.preferred_skills),
            "description": job.description,
            "original_url": getattr(job, "original_url", None),
            "source_type": getattr(job, "source_type", "campus_drive") or "campus_drive",
            "provider_name": getattr(job, "provider_name", "Campus Placement Cell") or "Campus Placement Cell",
            "posting_date": getattr(job, "posting_date", None),
            "freshness_status": getattr(job, "freshness_status", "Active") or "Active"
        }

    @staticmethod
    def compare_jobs(db: Session, student_profile: dict, job_id_1: str, job_id_2: str) -> Dict[str, Any]:
        """
        Tool 7: compare_jobs
        Performs a side-by-side comparison of two opportunities evaluating CTC, eligibility, and skill matches.
        """
        j1 = db.query(Job).filter(Job.id == job_id_1.strip()).first()
        j2 = db.query(Job).filter(Job.id == job_id_2.strip()).first()

        if not j1 or not j2:
            return {"error": f"One or both job IDs ({job_id_1}, {job_id_2}) could not be found"}

        e1 = AgentTools.check_eligibility(db, student_profile, j1.id)
        e2 = AgentTools.check_eligibility(db, student_profile, j2.id)

        m1, _ = MatchingService.calculate_match(student_profile, {
            "required_skills": j1.required_skills,
            "preferred_skills": j1.preferred_skills,
            "title": j1.title,
            "location": j1.location,
            "work_mode": j1.work_mode
        })
        m2, _ = MatchingService.calculate_match(student_profile, {
            "required_skills": j2.required_skills,
            "preferred_skills": j2.preferred_skills,
            "title": j2.title,
            "location": j2.location,
            "work_mode": j2.work_mode
        })

        return {
            "job_1": {
                "id": j1.id,
                "title": j1.title,
                "company": j1.company,
                "salary_range": j1.salary_range,
                "match_score": m1,
                "eligibility_status": e1.get("status"),
                "is_eligible": e1.get("is_eligible")
            },
            "job_2": {
                "id": j2.id,
                "title": j2.title,
                "company": j2.company,
                "salary_range": j2.salary_range,
                "match_score": m2,
                "eligibility_status": e2.get("status"),
                "is_eligible": e2.get("is_eligible")
            },
            "verdict": (
                f"You have a higher match score ({m1}%) for '{j1.title}' at {j1.company} compared to ({m2}%) for '{j2.title}'."
                if m1 >= m2 else
                f"You have a higher match score ({m2}%) for '{j2.title}' at {j2.company} compared to ({m1}%) for '{j1.title}'."
            )
        }
