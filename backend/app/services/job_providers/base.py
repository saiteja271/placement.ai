import re
import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict, field

COMMON_TECH_SKILLS = [
    "Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "React", "Angular", "Vue",
    "Node.js", "FastAPI", "Flask", "Django", "Spring Boot", "SQL", "PostgreSQL", "MySQL",
    "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "Linux",
    "Machine Learning", "Deep Learning", "NLP", "Data Structures", "Algorithms", "REST APIs",
    "GraphQL", "HTML", "CSS", "Tailwind CSS", "Microservices", "CI/CD", "Kafka", "PySpark",
    "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "Testing", "Unit Testing",
    "System Design", "OOP", "Agile"
]

def extract_skills_from_text(text: str) -> List[str]:
    """
    Extracts recognized technical skills and competencies from a job title and description.
    """
    if not text:
        return []
    text_lower = f" {text.lower()} "
    found_skills = []
    for skill in COMMON_TECH_SKILLS:
        skill_lower = skill.lower()
        # Word boundary matching
        pattern = r'(?<![a-zA-Z0-9_])' + re.escape(skill_lower) + r'(?![a-zA-Z0-9_])'
        if re.search(pattern, text_lower):
            found_skills.append(skill)
    return found_skills

@dataclass
class NormalizedJob:
    external_job_id: str
    title: str
    company: str
    location: str
    work_mode: str = "Full-time"
    degree_requirements: List[str] = field(default_factory=lambda: ["B.Tech", "B.E.", "MCA"])
    eligible_branches: List[str] = field(default_factory=lambda: ["Computer Science", "Information Technology", "All Engineering Branches"])
    min_cgpa: float = 0.0  # 0.0 means open / not specified in posting
    max_backlogs: int = 99 # 99 means open / not specified in posting
    graduation_year_min: int = 2024
    graduation_year_max: int = 2028
    experience_level: str = "Fresher / Entry-Level"
    required_skills: List[str] = field(default_factory=list)
    preferred_skills: List[str] = field(default_factory=list)
    salary_range: str = "Competitive"
    description: str = ""
    original_url: Optional[str] = None
    source_type: str = "live_provider"  # "live_provider", "cached_provider", "campus_drive", "demo"
    provider_name: str = "External Provider"  # "Adzuna", "Jooble", "Campus Placement Cell"
    posting_date: Optional[str] = None
    retrieval_date: str = field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())
    freshness_status: str = "Active"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class BaseJobProvider:
    """
    Abstract interface for real-world external job search providers.
    Every provider must implement credential validation and normalized searching.
    """
    name: str = "BaseProvider"

    def validate_credentials(self) -> Dict[str, Any]:
        raise NotImplementedError

    def search(
        self,
        query: str,
        location: Optional[str] = None,
        filters: Optional[dict] = None,
        page: int = 1,
        page_size: int = 10
    ) -> Dict[str, Any]:
        raise NotImplementedError
