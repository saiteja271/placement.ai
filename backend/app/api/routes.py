import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Student, Job, SavedJob, PrepPlan, MockInterviewSession, User
from app.core.security import hash_password, verify_password
from app.schemas.schemas import (
    StudentCreate, StudentUpdate, StudentResponse,
    JobResponse, JobWithMatchResponse,
    EligibilityResult, SkillGapAnalysis,
    PrepPlanResponse, PrepPlanCreate, TaskToggleRequest, TaskItem,
    MockSessionResponse, MockAnswerSubmit,
    AgentQueryRequest, AgentQueryResponse,
    TutorChatRequest, TutorChatResponse,
    UserRegisterRequest, UserLoginRequest, UserResponse,
    OfficerStatsResponse, JobCreateRequest,
    JobProviderStatusResponse
)
from app.services.eligibility_service import EligibilityService
from app.services.matching_service import MatchingService, parse_semicolon_list
from app.services.skill_gap_service import SkillGapService
from app.services.prep_planner_service import PrepPlannerService
from app.services.mock_interview_service import MockInterviewService
from app.services.tutor_service import TutorService
from app.agent.orchestrator import AgentOrchestrator

router = APIRouter()

# --- Health Check ---
@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PlaceMate AI Backend",
        "version": "1.0.0",
        "rules_engine": "deterministic_python",
        "llm_ready": False
    }

# --- Student Profile Endpoints ---
def compute_readiness_score(student: Student, db: Session) -> int:
    """
    Placement Readiness is a grounded deterministic formula:
    1. Profile Completeness (30%): fields filled, skills count >= 3, projects
    2. Eligibility Pass Rate across current jobs (40%)
    3. Preparation Plan Task Completion (30%)
    """
    # 1. Profile completeness
    fields = [student.full_name, student.email, student.branch, student.graduation_year, student.cgpa]
    skills = parse_semicolon_list(student.skills)
    completeness = (len([f for f in fields if f]) / len(fields)) * 50
    if len(skills) >= 4:
        completeness += 30
    elif len(skills) >= 2:
        completeness += 15
    if student.projects:
        completeness += 20
    comp_score = min(100, completeness)

    # 2. Eligibility rate
    jobs = db.query(Job).all()
    s_dict = {
        "branch": student.branch,
        "cgpa": student.cgpa,
        "backlogs": student.backlogs,
        "graduation_year": student.graduation_year
    }
    eligible_count = 0
    for j in jobs:
        j_dict = {
            "eligible_branches": j.eligible_branches,
            "min_cgpa": j.min_cgpa,
            "max_backlogs": j.max_backlogs,
            "graduation_year_min": j.graduation_year_min,
            "graduation_year_max": j.graduation_year_max,
        }
        res = EligibilityService.evaluate_eligibility(s_dict, j_dict)
        if res.is_eligible:
            eligible_count += 1
    elig_rate = (eligible_count / max(1, len(jobs))) * 100

    # 3. Task progress
    plans = db.query(PrepPlan).filter(PrepPlan.student_id == student.id).all()
    total_tasks = 0
    completed_tasks = 0
    for p in plans:
        try:
            tasks_list = json.loads(p.tasks_json)
            total_tasks += len(tasks_list)
            completed_tasks += len([t for t in tasks_list if t.get("is_completed")])
        except Exception:
            pass

    task_rate = (completed_tasks / max(1, total_tasks) * 100) if total_tasks > 0 else 50.0

    readiness = int(round((comp_score * 0.35) + (elig_rate * 0.40) + (task_rate * 0.25)))
    return max(10, min(98, readiness))

def format_student(student: Student, db: Session) -> StudentResponse:
    saved_count = db.query(SavedJob).filter(SavedJob.student_id == student.id).count()
    readiness = compute_readiness_score(student, db)
    return StudentResponse(
        id=student.id,
        full_name=student.full_name,
        email=student.email,
        degree=student.degree,
        branch=student.branch,
        graduation_year=student.graduation_year,
        cgpa=student.cgpa,
        backlogs=student.backlogs,
        skills=parse_semicolon_list(student.skills),
        projects=student.projects or "",
        experience_level=student.experience_level,
        preferred_role=student.preferred_role,
        preferred_location=student.preferred_location,
        readiness_score=readiness,
        saved_jobs_count=saved_count
    )

@router.get("/students", response_model=List[StudentResponse])
def list_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return [format_student(s, db) for s in students]

@router.get("/students/{student_id}", response_model=StudentResponse)
def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return format_student(student, db)

@router.post("/students", response_model=StudentResponse)
def create_student(data: StudentCreate, db: Session = Depends(get_db)):
    student_id = f"S{str(uuid.uuid4())[:6].upper()}"
    skills_str = ";".join(data.skills) if data.skills else ""
    student = Student(
        id=student_id,
        full_name=data.full_name.strip(),
        email=data.email.strip(),
        degree=data.degree,
        branch=data.branch.strip(),
        graduation_year=data.graduation_year,
        cgpa=data.cgpa,
        backlogs=data.backlogs,
        skills=skills_str,
        projects=data.projects,
        experience_level=data.experience_level,
        preferred_role=data.preferred_role,
        preferred_location=data.preferred_location,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return format_student(student, db)

@router.put("/students/{student_id}", response_model=StudentResponse)
def update_student(student_id: str, data: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if data.full_name is not None:
        if not data.full_name.strip():
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        student.full_name = data.full_name.strip()
    if data.email is not None:
        student.email = data.email.strip()
    if data.degree is not None:
        student.degree = data.degree
    if data.branch is not None:
        student.branch = data.branch.strip()
    if data.graduation_year is not None:
        student.graduation_year = data.graduation_year
    if data.cgpa is not None:
        if data.cgpa < 0.0 or data.cgpa > 10.0:
            raise HTTPException(status_code=400, detail="CGPA must be between 0.0 and 10.0")
        student.cgpa = data.cgpa
    if data.backlogs is not None:
        student.backlogs = max(0, data.backlogs)
    if data.skills is not None:
        student.skills = ";".join(data.skills)
    if data.projects is not None:
        student.projects = data.projects
    if data.experience_level is not None:
        student.experience_level = data.experience_level
    if data.preferred_role is not None:
        student.preferred_role = data.preferred_role
    if data.preferred_location is not None:
        student.preferred_location = data.preferred_location

    db.commit()
    db.refresh(student)
    return format_student(student, db)

# --- Job Endpoints ---
def format_job(job: Job) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "work_mode": job.work_mode,
        "degree_requirements": parse_semicolon_list(job.degree_requirements),
        "eligible_branches": parse_semicolon_list(job.eligible_branches),
        "min_cgpa": job.min_cgpa,
        "max_backlogs": job.max_backlogs,
        "graduation_year_min": job.graduation_year_min,
        "graduation_year_max": job.graduation_year_max,
        "experience_level": job.experience_level,
        "required_skills": parse_semicolon_list(job.required_skills),
        "preferred_skills": parse_semicolon_list(job.preferred_skills),
        "salary_range": job.salary_range,
        "description": job.description,
        "source_type": getattr(job, "source_type", "campus_drive") or "campus_drive",
        "provider_name": getattr(job, "provider_name", "Campus Placement Cell") or "Campus Placement Cell",
        "external_job_id": getattr(job, "external_job_id", None),
        "original_url": getattr(job, "original_url", None),
        "posting_date": getattr(job, "posting_date", None),
        "retrieval_date": getattr(job, "retrieval_date", None),
        "freshness_status": getattr(job, "freshness_status", "Active") or "Active"
    }

@router.get("/jobs/provider-status", response_model=JobProviderStatusResponse)
def get_job_provider_status():
    from app.services.job_providers.manager import job_provider_manager
    return job_provider_manager.get_status()

@router.get("/jobs", response_model=List[JobWithMatchResponse])
def get_jobs(
    search: Optional[str] = None,
    work_mode: Optional[str] = None,
    location: Optional[str] = None,
    eligibility_filter: Optional[str] = None, # all, eligible, saved
    student_id: Optional[str] = "S001",
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.id == student_id).first() if student_id else None
    student_dict = {
        "id": student.id,
        "full_name": student.full_name,
        "branch": student.branch,
        "graduation_year": student.graduation_year,
        "cgpa": student.cgpa,
        "backlogs": student.backlogs,
        "skills": student.skills,
        "preferred_role": student.preferred_role,
        "preferred_location": student.preferred_location
    } if student else {}

    saved_job_ids = set()
    if student:
        saved_records = db.query(SavedJob).filter(SavedJob.student_id == student.id).all()
        saved_job_ids = {r.job_id for r in saved_records}

    query = db.query(Job)
    all_jobs = query.all()

    formatted_jobs = []
    for j in all_jobs:
        job_dict = format_job(j)

        # Filters
        if search:
            s_low = search.lower()
            corpus = f"{j.title} {j.company} {j.location} {j.required_skills} {j.preferred_skills}".lower()
            if s_low not in corpus:
                continue

        if work_mode and work_mode.lower() != "all":
            if j.work_mode.lower() != work_mode.lower():
                continue

        if location and location.lower() != "all":
            if location.lower() not in j.location.lower():
                continue

        # Match calculation
        if student_dict:
            score, reasons = MatchingService.calculate_match(student_dict, job_dict)
            elig = EligibilityService.evaluate_eligibility(student_dict, job_dict)
            elig_status = elig.status
            is_elig = elig.is_eligible
        else:
            score = 75
            reasons = ["Generic match profile"]
            elig_status = "UNKNOWN"
            is_elig = False

        is_saved = j.id in saved_job_ids

        # Eligibility filter
        if eligibility_filter == "eligible" and not is_elig:
            continue
        if eligibility_filter == "saved" and not is_saved:
            continue

        item = {
            **job_dict,
            "match_score": score,
            "is_eligible": is_elig,
            "eligibility_status": elig_status,
            "match_reasons": reasons,
            "is_saved": is_saved
        }
        formatted_jobs.append(item)

    # Sort: Eligible first, then descending match_score
    def sort_order(x):
        st = {"ELIGIBLE": 3, "CONDITIONAL": 2, "NOT_ELIGIBLE": 1}.get(x["eligibility_status"], 0)
        return (st, x["match_score"])

    formatted_jobs.sort(key=sort_order, reverse=True)
    return formatted_jobs

@router.get("/jobs/{job_id}", response_model=JobWithMatchResponse)
def get_job_detail(job_id: str, student_id: Optional[str] = "S001", db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    student = db.query(Student).filter(Student.id == student_id).first() if student_id else None
    student_dict = {
        "id": student.id,
        "branch": student.branch,
        "graduation_year": student.graduation_year,
        "cgpa": student.cgpa,
        "backlogs": student.backlogs,
        "skills": student.skills,
        "preferred_role": student.preferred_role,
        "preferred_location": student.preferred_location
    } if student else {}

    job_dict = format_job(job)
    is_saved = False
    if student:
        is_saved = db.query(SavedJob).filter(SavedJob.student_id == student.id, SavedJob.job_id == job.id).first() is not None

    if student_dict:
        score, reasons = MatchingService.calculate_match(student_dict, job_dict)
        elig = EligibilityService.evaluate_eligibility(student_dict, job_dict)
        elig_status = elig.status
        is_elig = elig.is_eligible
    else:
        score = 80
        reasons = []
        elig_status = "UNKNOWN"
        is_elig = False

    return {
        **job_dict,
        "match_score": score,
        "is_eligible": is_elig,
        "eligibility_status": elig_status,
        "match_reasons": reasons,
        "is_saved": is_saved
    }

# --- Eligibility Check Endpoint ---
@router.post("/jobs/{job_id}/eligibility", response_model=EligibilityResult)
def check_job_eligibility(job_id: str, student_id: str = Query("S001"), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_dict = {
        "branch": student.branch,
        "cgpa": student.cgpa,
        "backlogs": student.backlogs,
        "graduation_year": student.graduation_year
    }
    job_dict = format_job(job)
    return EligibilityService.evaluate_eligibility(student_dict, job_dict)

# --- Skill Gap Analysis Endpoint ---
@router.post("/jobs/{job_id}/skill-gaps", response_model=SkillGapAnalysis)
def analyze_job_skill_gaps(job_id: str, student_id: str = Query("S001"), db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_dict = {"skills": student.skills}
    job_dict = format_job(job)
    return SkillGapService.analyze(student_dict, job_dict)

# --- Interview Prep Plan Endpoints ---
@router.post("/jobs/{job_id}/prep-plan", response_model=PrepPlanResponse)
def get_or_create_prep_plan(
    job_id: str,
    student_id: str = Query("S001"),
    days: int = Query(28),
    regenerate: bool = Query(False),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    existing_plan = db.query(PrepPlan).filter(
        PrepPlan.student_id == student_id,
        PrepPlan.job_id == job_id
    ).first()

    if existing_plan and not regenerate and existing_plan.total_days == days:
        tasks_raw = json.loads(existing_plan.tasks_json)
        tasks = [TaskItem(**t) for t in tasks_raw]
        completed_cnt = len([t for t in tasks if t.is_completed])
        progress = int(round((completed_cnt / max(1, len(tasks))) * 100))
        return PrepPlanResponse(
            id=existing_plan.id,
            student_id=student_id,
            job_id=job_id,
            role_title=existing_plan.role_title,
            total_days=existing_plan.total_days,
            completed_tasks_count=completed_cnt,
            total_tasks_count=len(tasks),
            progress_percentage=progress,
            tasks=tasks
        )

    # Generate new plan
    student_dict = {"skills": student.skills}
    job_dict = format_job(job)
    generated_tasks = PrepPlannerService.generate_plan(student_dict, job_dict, days=days)

    plan_id = existing_plan.id if existing_plan else f"plan-{uuid.uuid4().hex[:8]}"
    tasks_json = json.dumps([t.model_dump() for t in generated_tasks])

    if existing_plan:
        existing_plan.total_days = days
        existing_plan.tasks_json = tasks_json
        db.commit()
        plan_obj = existing_plan
    else:
        plan_obj = PrepPlan(
            id=plan_id,
            student_id=student_id,
            job_id=job_id,
            role_title=job.title,
            total_days=days,
            tasks_json=tasks_json
        )
        db.add(plan_obj)
        db.commit()
        db.refresh(plan_obj)

    completed_cnt = len([t for t in generated_tasks if t.is_completed])
    progress = int(round((completed_cnt / max(1, len(generated_tasks))) * 100))
    return PrepPlanResponse(
        id=plan_obj.id,
        student_id=student_id,
        job_id=job_id,
        role_title=plan_obj.role_title,
        total_days=plan_obj.total_days,
        completed_tasks_count=completed_cnt,
        total_tasks_count=len(generated_tasks),
        progress_percentage=progress,
        tasks=generated_tasks
    )

@router.post("/prep-plan/{plan_id}/task-toggle")
def toggle_prep_task(plan_id: str, req: TaskToggleRequest, db: Session = Depends(get_db)):
    plan = db.query(PrepPlan).filter(PrepPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    tasks_raw = json.loads(plan.tasks_json)
    found = False
    for t in tasks_raw:
        if t["id"] == req.task_id:
            t["is_completed"] = req.is_completed
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Task ID not found in plan")

    plan.tasks_json = json.dumps(tasks_raw)
    db.commit()

    completed_cnt = len([t for t in tasks_raw if t.get("is_completed")])
    progress = int(round((completed_cnt / max(1, len(tasks_raw))) * 100))
    return {
        "success": True,
        "task_id": req.task_id,
        "is_completed": req.is_completed,
        "progress_percentage": progress,
        "completed_count": completed_cnt
    }

# --- Saved Jobs Endpoints ---
@router.get("/students/{student_id}/saved-jobs", response_model=List[JobWithMatchResponse])
def get_saved_jobs(student_id: str, db: Session = Depends(get_db)):
    saved = db.query(SavedJob).filter(SavedJob.student_id == student_id).all()
    job_ids = [s.job_id for s in saved]
    if not job_ids:
        return []

    return get_jobs(eligibility_filter="saved", student_id=student_id, db=db)

@router.post("/students/{student_id}/saved-jobs/{job_id}")
def save_job(student_id: str, job_id: str, db: Session = Depends(get_db)):
    existing = db.query(SavedJob).filter(SavedJob.student_id == student_id, SavedJob.job_id == job_id).first()
    if existing:
        return {"saved": True, "message": "Job already saved"}

    sj = SavedJob(student_id=student_id, job_id=job_id)
    db.add(sj)
    db.commit()
    return {"saved": True, "message": "Job saved successfully"}

@router.delete("/students/{student_id}/saved-jobs/{job_id}")
def unsave_job(student_id: str, job_id: str, db: Session = Depends(get_db)):
    sj = db.query(SavedJob).filter(SavedJob.student_id == student_id, SavedJob.job_id == job_id).first()
    if sj:
        db.delete(sj)
        db.commit()
    return {"saved": False, "message": "Job removed from saved list"}

# --- AI Mock Interview Endpoints ---
@router.post("/mock-interview/start", response_model=MockSessionResponse)
def start_mock_interview(
    student_id: str = Query("S001"),
    role_title: str = Query("Software Development Engineer"),
    category: str = Query("technical"),
    difficulty: str = Query("Intermediate"),
    question_count: int = Query(3),
    db: Session = Depends(get_db)
):
    questions_data = MockInterviewService.get_questions_for_role(
        role_title=role_title,
        category=category,
        difficulty=difficulty,
        count=question_count
    )
    items = []
    for q in questions_data:
        items.append({
            "question_id": q["id"],
            "question": q["question"],
            "category": category.title(),
            "focus": q["focus"],
            "difficulty": q["difficulty"],
            "user_answer": None,
            "score": None,
            "feedback": None
        })

    session_id = f"mock-{uuid.uuid4().hex[:8]}"
    session_obj = MockInterviewSession(
        id=session_id,
        student_id=student_id,
        role_title=role_title,
        category=category.title(),
        current_question_index=0,
        questions_json=json.dumps(items),
        score=0,
        status="in_progress"
    )
    db.add(session_obj)
    db.commit()

    return MockSessionResponse(
        id=session_id,
        student_id=student_id,
        role_title=role_title,
        category=category.title(),
        current_question_index=0,
        total_questions=len(items),
        overall_score=None,
        status="in_progress",
        questions=items
    )

@router.post("/mock-interview/answer", response_model=MockSessionResponse)
def submit_mock_answer(data: MockAnswerSubmit, db: Session = Depends(get_db)):
    session = db.query(MockInterviewSession).filter(MockInterviewSession.id == data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Mock session not found")

    items = json.loads(session.questions_json)
    if data.question_index < 0 or data.question_index >= len(items):
        raise HTTPException(status_code=400, detail="Invalid question index")

    current_item = items[data.question_index]
    # Evaluate
    eval_result = MockInterviewService.evaluate_answer(current_item, data.user_answer, is_live_ai=False)

    current_item["user_answer"] = data.user_answer
    current_item["score"] = eval_result["score_out_of_100"]
    current_item["feedback"] = eval_result

    # Advance index if within range
    next_index = min(len(items) - 1, data.question_index + 1)
    session.current_question_index = next_index

    # Check if all answered
    answered = [it for it in items if it.get("score") is not None]
    if len(answered) == len(items):
        session.status = "completed"
        session.score = int(round(sum(it["score"] for it in answered) / len(answered)))

    session.questions_json = json.dumps(items)
    db.commit()

    return MockSessionResponse(
        id=session.id,
        student_id=session.student_id,
        role_title=session.role_title,
        category=session.category,
        current_question_index=session.current_question_index,
        total_questions=len(items),
        overall_score=session.score if session.status == "completed" else None,
        status=session.status,
        questions=items
    )

# --- Agent Query Endpoint ---
@router.post("/agent/query", response_model=AgentQueryResponse)
def run_agent_query(
    req: AgentQueryRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # Cross-User Security Isolation
    if authorization and authorization.startswith("token-"):
        uid = authorization.replace("token-", "").strip()
        user = db.query(User).filter(User.id == uid).first()
        if user and user.role == "student" and user.student_id:
            if user.student_id != req.student_id:
                raise HTTPException(
                    status_code=403,
                    detail=f"Access denied: You are authenticated as student '{user.student_id}' and cannot access data for student '{req.student_id}'."
                )

    return AgentOrchestrator.run_agent(
        db=db,
        student_id=req.student_id,
        query=req.query,
        mode=req.mode or "auto",
        conversation_history=req.conversation_history
    )

# --- Placement AI Learning Tutor Chatbot ---
@router.post("/tutor/chat", response_model=TutorChatResponse)
def tutor_chat(req: TutorChatRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == req.student_id).first()
    student_dict = {
        "id": student.id if student else "S001",
        "full_name": student.full_name if student else "Student",
        "branch": student.branch if student else "Computer Science",
        "skills": student.skills if student else "",
        "cgpa": student.cgpa if student else 8.0,
    }
    domain_val = req.domain or req.topic or "Python & Data Structures"
    return TutorService.generate_tutor_response(
        student_data=student_dict,
        domain=domain_val,
        topic=domain_val,
        mode=req.mode,
        user_message=req.message,
        difficulty=req.difficulty,
        code_snippet=req.code_snippet,
        language=req.language,
        conversation_id=req.conversation_id,
        conversation_history=req.history
    )

# --- Authentication & Role Endpoints ---
@router.post("/auth/register", response_model=UserResponse)
def register_user(data: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")

    user_id = f"user-{uuid.uuid4().hex[:8]}"
    student_id = None

    if data.role == "student":
        student_id = f"S{uuid.uuid4().hex[:6]}"
        new_student = Student(
            id=student_id,
            full_name=data.full_name,
            email=data.email.lower().strip(),
            degree="B.Tech",
            branch=data.branch or "Information Technology",
            graduation_year=data.graduation_year or 2027,
            cgpa=data.cgpa or 8.0,
            backlogs=0,
            skills=";".join(data.skills) if data.skills else "Python;SQL;Git",
            projects="College Projects Portfolio",
            preferred_role=data.preferred_role or "Software Development Engineer",
            preferred_location=data.preferred_location or "Hyderabad"
        )
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        verification_status = "verified"
    else:
        # Placement Officer role verification
        verification_status = "verified" if any(domain in data.email.lower() for domain in ["nit", "edu", "placemate.ai", "ac.in"]) else "pending"

    new_user = User(
        id=user_id,
        email=data.email.lower().strip(),
        password_hash=hash_password(data.password),
        role=data.role,
        full_name=data.full_name,
        institution=data.institution or "National Institute of Technology",
        department=data.department or ("Career Development Center" if data.role == "officer" else data.branch),
        designation=data.designation or ("Training & Placement Officer" if data.role == "officer" else "Student"),
        verification_status=verification_status,
        student_id=student_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        full_name=new_user.full_name,
        institution=new_user.institution,
        department=new_user.department,
        designation=new_user.designation,
        verification_status=new_user.verification_status,
        student_id=new_user.student_id,
        token=f"token-{new_user.id}"
    )

@router.post("/auth/login", response_model=UserResponse)
def login_user(data: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        institution=user.institution,
        department=user.department,
        designation=user.designation,
        verification_status=user.verification_status,
        student_id=user.student_id,
        token=f"token-{user.id}"
    )

@router.post("/auth/demo-login", response_model=UserResponse)
def demo_login(role: str = Query("student"), db: Session = Depends(get_db)):
    target_email = "student@placemate.ai" if role.lower() == "student" else "officer@placemate.ai"
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        if role.lower() == "student":
            user = User(
                id="user-demo-student",
                email="student@placemate.ai",
                password_hash=hash_password("password123"),
                role="student",
                full_name="Teja",
                institution="National Institute of Technology",
                department="Information Technology",
                designation="Final Year B.Tech Student",
                verification_status="verified",
                student_id="S001"
            )
        else:
            user = User(
                id="user-demo-officer",
                email="officer@placemate.ai",
                password_hash=hash_password("password123"),
                role="officer",
                full_name="Dr. Ramesh Kumar",
                institution="National Institute of Technology",
                department="Training & Placement Cell",
                designation="Head of Training & Placement",
                verification_status="verified",
                student_id=None
            )
        db.add(user)
        db.commit()
        db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        institution=user.institution,
        department=user.department,
        designation=user.designation,
        verification_status=user.verification_status,
        student_id=user.student_id,
        token=f"token-{user.id}"
    )

@router.get("/auth/me", response_model=UserResponse)
def get_current_user_profile(token: Optional[str] = Query(None), user_id: Optional[str] = Query(None), db: Session = Depends(get_db)):
    user = None
    if token and token.startswith("token-"):
        uid = token.replace("token-", "")
        user = db.query(User).filter(User.id == uid).first()
    elif user_id:
        user = db.query(User).filter(User.id == user_id).first()

    if not user:
        user = db.query(User).filter(User.email == "student@placemate.ai").first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        institution=user.institution,
        department=user.department,
        designation=user.designation,
        verification_status=user.verification_status,
        student_id=user.student_id,
        token=f"token-{user.id}"
    )

# --- Placement Officer Workspace Endpoints ---
@router.get("/officer/stats", response_model=OfficerStatsResponse)
def get_officer_stats(db: Session = Depends(get_db)):
    all_students = db.query(Student).all()
    all_jobs = db.query(Job).all()

    total_students = len(all_students)
    avg_cgpa = round(sum(s.cgpa for s in all_students) / max(1, total_students), 2)
    readiness_scores = [compute_readiness_score(s, db) for s in all_students]
    avg_readiness = int(round(sum(readiness_scores) / max(1, len(readiness_scores))))

    eligible_cnt = 0
    for s in all_students:
        s_dict = {"branch": s.branch, "cgpa": s.cgpa, "backlogs": s.backlogs, "graduation_year": s.graduation_year}
        if any(EligibilityService.evaluate_eligibility(s_dict, format_job(j)).is_eligible for j in all_jobs):
            eligible_cnt += 1

    return OfficerStatsResponse(
        total_students=total_students,
        eligible_students=eligible_cnt,
        average_cgpa=avg_cgpa,
        average_readiness_score=avg_readiness,
        active_recruitment_drives=len(all_jobs),
        placement_rate_percentage=min(100, int(round((eligible_cnt / max(1, total_students)) * 88)))
    )

@router.get("/officer/students")
def get_officer_students(
    branch: Optional[str] = None,
    min_cgpa: Optional[float] = None,
    graduation_year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if branch:
        query = query.filter(Student.branch.ilike(f"%{branch}%"))
    if min_cgpa:
        query = query.filter(Student.cgpa >= min_cgpa)
    if graduation_year:
        query = query.filter(Student.graduation_year == graduation_year)

    students = query.all()
    all_jobs = db.query(Job).all()

    result = []
    for s in students:
        s_dict = {"branch": s.branch, "cgpa": s.cgpa, "backlogs": s.backlogs, "graduation_year": s.graduation_year}
        eligible_jobs_count = len([j for j in all_jobs if EligibilityService.evaluate_eligibility(s_dict, format_job(j)).is_eligible])
        readiness = compute_readiness_score(s, db)
        result.append({
            "id": s.id,
            "full_name": s.full_name,
            "email": s.email,
            "degree": s.degree,
            "branch": s.branch,
            "graduation_year": s.graduation_year,
            "cgpa": s.cgpa,
            "backlogs": s.backlogs,
            "skills": parse_semicolon_list(s.skills),
            "preferred_role": s.preferred_role,
            "readiness_score": readiness,
            "eligible_jobs_count": eligible_jobs_count
        })
    return result

@router.post("/officer/jobs", response_model=JobResponse)
def create_officer_job(data: JobCreateRequest, db: Session = Depends(get_db)):
    job_id = f"J{uuid.uuid4().hex[:6]}"
    new_job = Job(
        id=job_id,
        title=data.title,
        company=data.company,
        location=data.location,
        work_mode=data.work_mode,
        degree_requirements="B.Tech;B.E.;MCA",
        eligible_branches=";".join(data.eligible_branches),
        min_cgpa=data.min_cgpa,
        max_backlogs=data.max_backlogs,
        graduation_year_min=data.graduation_year_min,
        graduation_year_max=data.graduation_year_max,
        experience_level="Fresher",
        required_skills=";".join(data.required_skills),
        preferred_skills=";".join(data.preferred_skills),
        salary_range=data.salary_range,
        description=data.description
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return format_job(new_job)

@router.get("/officer/analytics")
def get_officer_analytics(db: Session = Depends(get_db)):
    all_students = db.query(Student).all()
    all_jobs = db.query(Job).all()

    branch_distribution = {}
    for s in all_students:
        b = s.branch or "Other"
        branch_distribution[b] = branch_distribution.get(b, 0) + 1

    readiness_buckets = {"High (>=80)": 0, "Moderate (60-79)": 0, "Needs Prep (<60)": 0}
    for s in all_students:
        score = compute_readiness_score(s, db)
        if score >= 80:
            readiness_buckets["High (>=80)"] += 1
        elif score >= 60:
            readiness_buckets["Moderate (60-79)"] += 1
        else:
            readiness_buckets["Needs Prep (<60)"] += 1

    return {
        "branch_distribution": [{"branch": k, "count": v} for k, v in branch_distribution.items()],
        "readiness_breakdown": [{"tier": k, "count": v} for k, v in readiness_buckets.items()],
        "total_active_drives": len(all_jobs)
    }


