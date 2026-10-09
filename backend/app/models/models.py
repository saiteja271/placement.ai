import datetime
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String(50), primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False)
    degree = Column(String(50), default="B.Tech")
    branch = Column(String(100), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    cgpa = Column(Float, nullable=False)
    backlogs = Column(Integer, default=0)
    skills = Column(Text, default="")  # semicolon separated
    projects = Column(Text, default="")
    experience_level = Column(String(50), default="Fresher")
    preferred_role = Column(String(100), default="Software Development Engineer")
    preferred_location = Column(String(100), default="Hyderabad")
    resume_filename = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    saved_jobs = relationship("SavedJob", back_populates="student", cascade="all, delete-orphan")
    prep_plans = relationship("PrepPlan", back_populates="student", cascade="all, delete-orphan")
    mock_sessions = relationship("MockInterviewSession", back_populates="student", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    company = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    work_mode = Column(String(50), default="Hybrid")
    degree_requirements = Column(Text, default="B.Tech;B.E.;MCA")
    eligible_branches = Column(Text, default="Computer Science;Information Technology")
    min_cgpa = Column(Float, default=6.5)
    max_backlogs = Column(Integer, default=0)
    graduation_year_min = Column(Integer, default=2025)
    graduation_year_max = Column(Integer, default=2028)
    experience_level = Column(String(50), default="Fresher")
    required_skills = Column(Text, default="")  # semicolon separated
    preferred_skills = Column(Text, default="") # semicolon separated
    salary_range = Column(String(100), default="₹8,00,000 - ₹14,00,000 / yr")
    description = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Real-World Provider Integration & Provenance Fields
    source_type = Column(String(50), default="campus_drive")  # "live_provider", "cached_provider", "campus_drive", "demo"
    provider_name = Column(String(100), default="Campus Placement Cell") # "Adzuna", "Jooble", "Campus Placement Cell"
    external_job_id = Column(String(100), nullable=True)
    original_url = Column(String(500), nullable=True)
    posting_date = Column(String(100), nullable=True)
    retrieval_date = Column(String(100), nullable=True)
    freshness_status = Column(String(50), default="Active")

    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")


class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False)
    job_id = Column(String(50), ForeignKey("jobs.id"), nullable=False)
    saved_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    student = relationship("Student", back_populates="saved_jobs")
    job = relationship("Job", back_populates="saved_by")


class PrepPlan(Base):
    __tablename__ = "prep_plans"

    id = Column(String(50), primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False)
    job_id = Column(String(50), ForeignKey("jobs.id"), nullable=False)
    role_title = Column(String(150), nullable=False)
    total_days = Column(Integer, default=28)
    tasks_json = Column(Text, nullable=False)  # JSON serialized list of tasks
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    student = relationship("Student", back_populates="prep_plans")


class MockInterviewSession(Base):
    __tablename__ = "mock_interview_sessions"

    id = Column(String(50), primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False)
    role_title = Column(String(150), nullable=False)
    category = Column(String(50), default="Technical")
    current_question_index = Column(Integer, default=0)
    questions_json = Column(Text, nullable=False) # JSON list with answers & feedback
    score = Column(Integer, default=0)
    status = Column(String(50), default="in_progress")
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    student = relationship("Student", back_populates="mock_sessions")


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(20), default="student")  # "student" or "officer"
    full_name = Column(String(100), nullable=False)
    institution = Column(String(150), default="National Institute of Technology")
    department = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    verification_status = Column(String(20), default="verified")  # "verified" or "pending"
    student_id = Column(String(50), ForeignKey("students.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    student = relationship("Student", backref="user")

