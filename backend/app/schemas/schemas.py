from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator

class CriterionResult(BaseModel):
    criterion_name: str
    required_value: str
    student_value: str
    status: str  # MET, NOT_MET, UNKNOWN
    explanation: str

class EligibilityResult(BaseModel):
    job_id: str
    job_title: str
    company: str
    is_eligible: bool
    status: str  # ELIGIBLE, NOT_ELIGIBLE, CONDITIONAL
    failed_mandatory: bool
    criteria: List[CriterionResult]
    summary: str

class SkillGapItem(BaseModel):
    skill: str
    skill_type: str  # required, preferred
    status: str      # matched, missing
    gap_percentage: int
    priority: str    # High, Medium, Low
    impact_reason: str
    recommended_action: str
    suggested_days: int

class SkillGapAnalysis(BaseModel):
    job_id: str
    job_title: str
    company: str
    overall_match_percentage: int
    matched_skills_count: int
    missing_required_count: int
    missing_preferred_count: int
    total_skills_count: int
    skills_breakdown: List[SkillGapItem]

class StudentBase(BaseModel):
    full_name: str
    email: str
    degree: str = "B.Tech"
    branch: str
    graduation_year: int
    cgpa: float
    backlogs: int = 0
    skills: List[str] = []
    projects: Optional[str] = ""
    experience_level: str = "Fresher"
    preferred_role: str = "Software Development Engineer"
    preferred_location: str = "Hyderabad"

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    backlogs: Optional[int] = None
    skills: Optional[List[str]] = None
    projects: Optional[str] = None
    experience_level: Optional[str] = None
    preferred_role: Optional[str] = None
    preferred_location: Optional[str] = None

class StudentResponse(BaseModel):
    id: str
    full_name: str
    email: str
    degree: str
    branch: str
    graduation_year: int
    cgpa: float
    backlogs: int
    skills: List[str]
    projects: str
    experience_level: str
    preferred_role: str
    preferred_location: str
    readiness_score: int
    saved_jobs_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class JobBase(BaseModel):
    id: str
    title: str
    company: str
    location: str
    work_mode: str
    degree_requirements: List[str]
    eligible_branches: List[str]
    min_cgpa: float
    max_backlogs: int
    graduation_year_min: int
    graduation_year_max: int
    experience_level: str
    required_skills: List[str]
    preferred_skills: List[str]
    salary_range: str
    description: str
    source_type: Optional[str] = "campus_drive"
    provider_name: Optional[str] = "Campus Placement Cell"
    external_job_id: Optional[str] = None
    original_url: Optional[str] = None
    posting_date: Optional[str] = None
    retrieval_date: Optional[str] = None
    freshness_status: Optional[str] = "Active"

class JobResponse(JobBase):
    pass

class JobWithMatchResponse(JobBase):
    match_score: int
    is_eligible: bool
    eligibility_status: str
    match_reasons: List[str]
    is_saved: bool = False

class TaskItem(BaseModel):
    id: str
    week: int
    day_number: int
    category: str  # Technical, Coding, Aptitude, HR & Communication
    title: str
    description: str
    duration_minutes: int
    priority: str
    is_completed: bool = False
    resources: List[str] = []

class PrepPlanCreate(BaseModel):
    student_id: str
    job_id: str
    days: int = 28

class PrepPlanResponse(BaseModel):
    id: str
    student_id: str
    job_id: str
    role_title: str
    total_days: int
    completed_tasks_count: int
    total_tasks_count: int
    progress_percentage: int
    tasks: List[TaskItem]

class TaskToggleRequest(BaseModel):
    task_id: str
    is_completed: bool

class MockAnswerSubmit(BaseModel):
    session_id: str
    question_index: int
    user_answer: str

class MockQuestionItem(BaseModel):
    question_id: str
    question: str
    category: str
    focus: str
    difficulty: str
    user_answer: Optional[str] = None
    score: Optional[int] = None
    feedback: Optional[Dict[str, Any]] = None

class MockSessionResponse(BaseModel):
    id: str
    student_id: str
    role_title: str
    category: str
    current_question_index: int
    total_questions: int
    overall_score: Optional[int] = None
    status: str
    questions: List[MockQuestionItem]

class AgentTraceStep(BaseModel):
    step_number: int
    tool_name: str
    arguments: Dict[str, Any]
    status: str
    duration_ms: int
    result_summary: str
    data: Optional[Any] = None

class AgentQueryRequest(BaseModel):
    student_id: str
    query: str
    mode: Optional[str] = "auto" # "auto", "live", "demo"
    conversation_history: Optional[List[Dict[str, Any]]] = None

class AgentQueryResponse(BaseModel):
    query: str
    execution_mode: str # "LIVE_AI" or "FALLBACK_DEMO"
    trace: List[AgentTraceStep]
    final_answer: str
    suggested_actions: List[str] = []
    structured_result: Optional[Dict[str, Any]] = None

class TutorChatRequest(BaseModel):
    student_id: str = "S001"
    domain: Optional[str] = None
    topic: Optional[str] = None
    mode: str = "learn"  # "learn", "doubt", "practice", "debug", "quiz", "review"
    difficulty: str = "Intermediate"  # "Beginner", "Intermediate", "Advanced"
    message: str
    code_snippet: Optional[str] = None
    language: Optional[str] = None
    conversation_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        clean = (v or "").strip().lower()
        allowed = {"learn", "doubt", "practice", "debug", "quiz", "review", "concept"}
        if clean not in allowed:
            raise ValueError(f"Invalid learning mode '{v}'. Must be one of: learn, doubt, practice, debug, quiz, review.")
        return "learn" if clean == "concept" else clean

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        clean = (v or "").strip().lower()
        if clean not in {"beginner", "intermediate", "advanced"}:
            raise ValueError(f"Invalid difficulty '{v}'. Must be one of: Beginner, Intermediate, Advanced.")
        return clean.capitalize()

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Message cannot be empty.")
        return v.strip()

class TutorChatResponse(BaseModel):
    domain: str
    topic: str
    mode: str
    difficulty: str = "Intermediate"
    title: str
    response: str
    suggested_followups: List[str] = []
    provider: str = "Grounded Placement Engine"
    is_live_ai: bool = False
    timestamp: float

# --- Authentication & User Schemas ---
class UserRegisterRequest(BaseModel):
    role: str = "student" # "student" or "officer"
    email: str
    password: str
    full_name: str
    institution: Optional[str] = "National Institute of Technology"
    # Student specific
    branch: Optional[str] = "Information Technology"
    graduation_year: Optional[int] = 2027
    cgpa: Optional[float] = 8.0
    skills: Optional[List[str]] = []
    preferred_role: Optional[str] = "Software Development Engineer"
    preferred_location: Optional[str] = "Hyderabad"
    # Officer specific
    designation: Optional[str] = "Training & Placement Officer"
    department: Optional[str] = "Career Development Center"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    full_name: str
    institution: str
    department: Optional[str] = None
    designation: Optional[str] = None
    verification_status: str
    student_id: Optional[str] = None
    token: str

class OfficerStatsResponse(BaseModel):
    total_students: int
    eligible_students: int
    average_cgpa: float
    average_readiness_score: int
    active_recruitment_drives: int
    placement_rate_percentage: int

class JobCreateRequest(BaseModel):
    title: str
    company: str
    location: str
    work_mode: str = "Full-time"
    eligible_branches: List[str]
    min_cgpa: float = 6.5
    max_backlogs: int = 0
    graduation_year_min: int = 2025
    graduation_year_max: int = 2028
    required_skills: List[str]
    preferred_skills: List[str] = []
    salary_range: str = "₹8,00,000 - ₹14,00,000 / yr"
    description: str = ""
    source_type: Optional[str] = "campus_drive"
    provider_name: Optional[str] = "Campus Placement Cell"
    original_url: Optional[str] = None

class JobProviderStatusResponse(BaseModel):
    active_provider: str
    is_live_configured: bool
    status: str
    message: str
    supported_providers: List[str]
    adzuna_configured: bool
    jooble_configured: bool


