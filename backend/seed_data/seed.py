import os
import pandas as pd
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.models import Student, Job, User
from app.core.security import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 0. Seed Demo Accounts for Hackathon Judges
        existing_student_user = db.query(User).filter(User.email == "student@placemate.ai").first()
        if not existing_student_user:
            demo_student_user = User(
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
            db.add(demo_student_user)

        existing_officer_user = db.query(User).filter(User.email == "officer@placemate.ai").first()
        if not existing_officer_user:
            demo_officer_user = User(
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
            db.add(demo_officer_user)
        db.commit()
        # 1. Seed Demo Students
        existing_s = db.query(Student).filter(Student.id == "S001").first()
        if not existing_s:
            # Primary reference student: Teja (as seen in the design preview)
            demo_teja = Student(
                id="S001",
                full_name="Teja",
                email="teja@example.com",
                degree="B.Tech",
                branch="Information Technology",
                graduation_year=2027,
                cgpa=8.2,
                backlogs=0,
                skills="Python;Java;SQL;Web Development;Machine Learning;Git",
                projects="PlaceMate AI Prototype; Scalable Microservices API; Student Analytics Portal",
                experience_level="Fresher",
                preferred_role="Software Development Engineer",
                preferred_location="Hyderabad"
            )
            db.add(demo_teja)

            # Additional reference students for testing edge cases
            demo_anjali = Student(
                id="S002",
                full_name="Anjali Sharma",
                email="anjali@example.com",
                degree="B.Tech",
                branch="Computer Science",
                graduation_year=2026,
                cgpa=9.1,
                backlogs=0,
                skills="Python;SQL;Docker;REST APIs;Git;React",
                projects="Distributed Cache System; Cloud Native Pipeline",
                experience_level="Internship",
                preferred_role="Backend Developer",
                preferred_location="Bengaluru"
            )
            db.add(demo_anjali)

            # Ineligible student (CGPA below cutoff, has backlogs)
            demo_arun = Student(
                id="S003",
                full_name="Arun Kumar",
                email="arun@example.com",
                degree="B.Tech",
                branch="Mechanical Engineering",
                graduation_year=2025,
                cgpa=5.8,
                backlogs=2,
                skills="Python;Excel;AutoCAD",
                projects="CAD Simulation",
                experience_level="Fresher",
                preferred_role="Data Analyst",
                preferred_location="Pune"
            )
            db.add(demo_arun)

            # Student with UNKNOWN values (missing CGPA or branch)
            demo_unknown = Student(
                id="S004",
                full_name="Sam Morgan",
                email="sam@example.com",
                degree="B.Tech",
                branch="",  # Missing branch -> UNKNOWN
                graduation_year=2027,
                cgpa=0.0, # Missing CGPA -> UNKNOWN
                backlogs=0,
                skills="Python;SQL",
                projects="",
                experience_level="Fresher",
                preferred_role="Python Developer",
                preferred_location="Remote"
            )
            db.add(demo_unknown)
            db.commit()
            print("Successfully seeded demo students.")

        # 2. Seed Jobs
        existing_j = db.query(Job).first()
        if not existing_j:
            # Curated synthetic listings matching the reference UI showcase
            showcase_jobs = [
                Job(
                    id="J001",
                    title="Software Development Engineer",
                    company="Google",
                    location="Bangalore, India",
                    work_mode="Full-time",
                    degree_requirements="B.Tech;B.E.;MCA",
                    eligible_branches="Computer Science;Information Technology;Electronics and Communication",
                    min_cgpa=7.0,
                    max_backlogs=0,
                    graduation_year_min=2026,
                    graduation_year_max=2027,
                    experience_level="Fresher",
                    required_skills="Python;Java;System Design;DSA",
                    preferred_skills="Cloud Computing;Docker;Machine Learning",
                    salary_range="₹22,00,000 - ₹32,00,000 / yr",
                    description="Build next-generation distributed systems and high-throughput microservices. Synthetic demonstration listing."
                ),
                Job(
                    id="J002",
                    title="SDE Intern",
                    company="Microsoft",
                    location="Hyderabad, India",
                    work_mode="Internship",
                    degree_requirements="B.Tech;B.E.;MCA",
                    eligible_branches="Computer Science;Information Technology;Computer Applications",
                    min_cgpa=7.5,
                    max_backlogs=0,
                    graduation_year_min=2026,
                    graduation_year_max=2028,
                    experience_level="Internship",
                    required_skills="Python;Web Development;Cloud",
                    preferred_skills="C#;Azure;Testing",
                    salary_range="₹80,000 / month Internship Stipend",
                    description="Collaborate with engineering teams on intelligent cloud platforms and tooling. Synthetic demonstration listing."
                ),
                Job(
                    id="J003",
                    title="Backend Developer",
                    company="Amazon",
                    location="Bangalore, India",
                    work_mode="Full-time",
                    degree_requirements="B.Tech;B.E.;MCA",
                    eligible_branches="Computer Science;Information Technology",
                    min_cgpa=7.5,
                    max_backlogs=0,
                    graduation_year_min=2025,
                    graduation_year_max=2027,
                    experience_level="Fresher",
                    required_skills="Java;Spring Boot;AWS",
                    preferred_skills="Microservices;SQL;Kafka",
                    salary_range="₹18,00,000 - ₹26,00,000 / yr",
                    description="Design scalable transaction workflows and reliable commerce APIs. Synthetic demonstration listing."
                ),
                Job(
                    id="J004",
                    title="Python Developer",
                    company="NexGen Labs",
                    location="Hyderabad, India",
                    work_mode="Hybrid",
                    degree_requirements="B.Tech;B.E.;MCA",
                    eligible_branches="Computer Science;Information Technology;Computer Applications",
                    min_cgpa=6.5,
                    max_backlogs=0,
                    graduation_year_min=2026,
                    graduation_year_max=2028,
                    experience_level="Fresher",
                    required_skills="Python;SQL;Git",
                    preferred_skills="REST APIs;Testing;Docker",
                    salary_range="₹8,50,000 - ₹12,00,000 / yr",
                    description="Entry-level Python development and microservices maintenance. Synthetic demonstration listing."
                ),
                Job(
                    id="J005",
                    title="Data Analyst",
                    company="FinTech Matrix",
                    location="Hyderabad, India",
                    work_mode="Hybrid",
                    degree_requirements="B.Tech;B.E.;B.Sc.;MCA",
                    eligible_branches="Computer Science;Information Technology;Mathematics;Statistics;Electronics and Communication",
                    min_cgpa=6.0,
                    max_backlogs=1,
                    graduation_year_min=2025,
                    graduation_year_max=2028,
                    experience_level="Fresher",
                    required_skills="SQL;Excel;Statistics",
                    preferred_skills="Python;Power BI",
                    salary_range="₹7,00,000 - ₹10,50,000 / yr",
                    description="Analyze operational financial datasets, derive trends, and prepare business metrics. Synthetic demonstration listing."
                ),
                Job(
                    id="J006",
                    title="Frontend Web Developer",
                    company="Starlight Digital",
                    location="Remote",
                    work_mode="Remote",
                    degree_requirements="B.Tech;B.E.;MCA;B.Sc.",
                    eligible_branches="Computer Science;Information Technology;Computer Applications",
                    min_cgpa=6.0,
                    max_backlogs=0,
                    graduation_year_min=2025,
                    graduation_year_max=2028,
                    experience_level="Fresher",
                    required_skills="HTML;CSS;JavaScript",
                    preferred_skills="React;Git;Tailwind CSS",
                    salary_range="₹6,50,000 - ₹9,50,000 / yr",
                    description="Build responsive and accessible single-page web experiences. Synthetic demonstration listing."
                ),
                Job(
                    id="J007",
                    title="Junior QA Automation Engineer",
                    company="Quality Assurance Labs",
                    location="Pune, India",
                    work_mode="On-site",
                    degree_requirements="B.Tech;B.E.;MCA",
                    eligible_branches="Computer Science;Information Technology;Electronics and Communication",
                    min_cgpa=6.0,
                    max_backlogs=0,
                    graduation_year_min=2025,
                    graduation_year_max=2027,
                    experience_level="Fresher",
                    required_skills="Testing;SQL;Git",
                    preferred_skills="Python;API Testing;Selenium",
                    salary_range="₹5,50,000 - ₹8,00,000 / yr",
                    description="Author and automate regression test suites for web services. Synthetic demonstration listing."
                ),
                Job(
                    id="J008",
                    title="Data Science Trainee",
                    company="Cognitive Insights",
                    location="Bengaluru, India",
                    work_mode="Hybrid",
                    degree_requirements="B.Tech;B.E.;B.Sc.;MCA",
                    eligible_branches="Computer Science;Information Technology;Mathematics;Statistics",
                    min_cgpa=8.0,
                    max_backlogs=0,
                    graduation_year_min=2026,
                    graduation_year_max=2028,
                    experience_level="Fresher",
                    required_skills="Python;Statistics;SQL",
                    preferred_skills="Machine Learning;Pandas;Data Visualization",
                    salary_range="₹10,00,000 - ₹15,00,000 / yr",
                    description="Assist with machine learning exploration and model prototyping. Synthetic demonstration listing."
                )
            ]
            for j in showcase_jobs:
                db.add(j)
            db.commit()
            print("Successfully seeded jobs.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
