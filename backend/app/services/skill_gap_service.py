from typing import List, Dict, Any
from app.schemas.schemas import SkillGapAnalysis, SkillGapItem
from app.services.matching_service import parse_semicolon_list

SKILL_ACTION_GUIDE = {
    "python": {
        "days": 7,
        "action": "Complete Python OOP, data structures, and build a modular REST client.",
        "reason": "Core programming language for backend services, automation, and API development.",
    },
    "sql": {
        "days": 5,
        "action": "Practice complex joins, CTEs, aggregation, indexing, and write query optimization exercises.",
        "reason": "Vital for database querying, data validation, and transaction handling.",
    },
    "git": {
        "days": 2,
        "action": "Practice git branching, rebasing, merge conflicts, and opening pull requests.",
        "reason": "Standard version control tool for collaboration and production code deployment.",
    },
    "rest apis": {
        "days": 3,
        "action": "Build a CRUD REST API with FastAPI or Flask with OpenAPI documentation.",
        "reason": "Standard protocol for backend communication and microservices.",
    },
    "java": {
        "days": 7,
        "action": "Review Java collections framework, multithreading, and OOP design patterns.",
        "reason": "Foundational language for enterprise backend services and scalable applications.",
    },
    "spring boot": {
        "days": 7,
        "action": "Build a Spring Boot microservice with dependency injection and JPA/Hibernate.",
        "reason": "Industry-standard enterprise Java framework for REST microservices.",
    },
    "docker": {
        "days": 4,
        "action": "Write Dockerfiles, build multi-stage images, and manage containers via docker-compose.",
        "reason": "Essential for containerized local development and cloud production deployment.",
    },
    "system design": {
        "days": 6,
        "action": "Study caching strategies, database sharding, load balancers, and rate limiting architectures.",
        "reason": "Critical for senior engineering interviews and scalable software architecture.",
    },
    "data structures": {
        "days": 7,
        "action": "Solve medium-difficulty problems on arrays, linked lists, trees, graphs, and dynamic programming.",
        "reason": "Primary filter used in technical placement rounds and coding challenges.",
    },
    "statistics": {
        "days": 5,
        "action": "Review hypothesis testing, distributions, p-values, and linear regressions.",
        "reason": "Underpins reliable business analytics and machine learning modeling.",
    },
    "machine learning": {
        "days": 7,
        "action": "Train supervised regression/classification models, evaluate metrics, and explain feature importances.",
        "reason": "Required for predictive modeling and automated data insights.",
    },
    "excel": {
        "days": 3,
        "action": "Master VLOOKUP/XLOOKUP, INDEX-MATCH, pivot tables, and scenario analysis.",
        "reason": "Everyday tool for business data reporting and quick exploratory analysis.",
    },
    "power bi": {
        "days": 5,
        "action": "Build an interactive multi-page dashboard with DAX measures and clean data relationships.",
        "reason": "Industry standard for executive business intelligence and data visualization.",
    },
    "html": {
        "days": 2,
        "action": "Build semantic, accessible web markup with ARIA landmarks and responsive elements.",
        "reason": "Foundation of all modern web applications and frontend rendering.",
    },
    "css": {
        "days": 4,
        "action": "Practice CSS Flexbox, Grid, custom properties, and responsive media queries.",
        "reason": "Required to build clean, responsive, and adaptive user interfaces.",
    },
    "javascript": {
        "days": 6,
        "action": "Master asynchronous JavaScript (Promises, async/await), DOM events, and ES6+ syntax.",
        "reason": "Core scripting language for web dynamics and modern frontend applications.",
    },
    "react": {
        "days": 7,
        "action": "Build single-page apps using hooks (useState, useEffect, useMemo) and state management.",
        "reason": "Dominant modern frontend library used in commercial web products.",
    },
    "testing": {
        "days": 3,
        "action": "Write unit and integration tests using Pytest or Jest with fixtures and mocking.",
        "reason": "Ensures code quality, prevents regressions, and meets production engineering standards.",
    },
    "oop": {
        "days": 4,
        "action": "Implement SOLID principles, inheritance, encapsulation, and common design patterns.",
        "reason": "Core architectural paradigm tested in technical interviews.",
    },
}

class SkillGapService:
    @staticmethod
    def analyze(student_data: dict, job_data: dict) -> SkillGapAnalysis:
        student_skills = [s.strip().lower() for s in parse_semicolon_list(student_data.get("skills", []))]
        required_skills = [s.strip() for s in parse_semicolon_list(job_data.get("required_skills", []))]
        preferred_skills = [s.strip() for s in parse_semicolon_list(job_data.get("preferred_skills", []))]

        breakdown: List[SkillGapItem] = []
        matched_count = 0
        missing_req_count = 0
        missing_pref_count = 0

        # Process Required Skills
        for skill in required_skills:
            lowered = skill.lower()
            is_matched = lowered in student_skills or any(lowered in s for s in student_skills)
            guide = SKILL_ACTION_GUIDE.get(lowered, {
                "days": 5,
                "action": f"Study official documentation and implement 2 practice projects using {skill}.",
                "reason": f"Mandatory skill required for everyday tasks in the {job_data.get('title', 'role')} position.",
            })

            if is_matched:
                matched_count += 1
                breakdown.append(SkillGapItem(
                    skill=skill,
                    skill_type="required",
                    status="matched",
                    gap_percentage=0,
                    priority="Low",
                    impact_reason=f"Demonstrated in student profile. Meets mandatory hiring standard.",
                    recommended_action="Review advanced topics and interview edge cases.",
                    suggested_days=1
                ))
            else:
                missing_req_count += 1
                breakdown.append(SkillGapItem(
                    skill=skill,
                    skill_type="required",
                    status="missing",
                    gap_percentage=45,
                    priority="High",
                    impact_reason=guide["reason"],
                    recommended_action=guide["action"],
                    suggested_days=guide["days"]
                ))

        # Process Preferred Skills
        for skill in preferred_skills:
            lowered = skill.lower()
            is_matched = lowered in student_skills or any(lowered in s for s in student_skills)
            guide = SKILL_ACTION_GUIDE.get(lowered, {
                "days": 4,
                "action": f"Complete introductory tutorials and hands-on exercises for {skill}.",
                "reason": f"Preferred bonus skill that differentiates strong applicants for {job_data.get('title', 'this role')}.",
            })

            if is_matched:
                matched_count += 1
                breakdown.append(SkillGapItem(
                    skill=skill,
                    skill_type="preferred",
                    status="matched",
                    gap_percentage=0,
                    priority="Low",
                    impact_reason="Demonstrated in student profile. Enhances applicant competitiveness.",
                    recommended_action="Maintain familiarity through active coding.",
                    suggested_days=1
                ))
            else:
                missing_pref_count += 1
                breakdown.append(SkillGapItem(
                    skill=skill,
                    skill_type="preferred",
                    status="missing",
                    gap_percentage=25,
                    priority="Medium",
                    impact_reason=guide["reason"],
                    recommended_action=guide["action"],
                    suggested_days=guide["days"]
                ))

        total_skills = len(required_skills) + len(preferred_skills)
        if total_skills == 0:
            match_pct = 100
        else:
            # Weighted match: required skills weighted 70%, preferred 30%
            req_matched = len([b for b in breakdown if b.skill_type == "required" and b.status == "matched"])
            req_total = max(1, len(required_skills))
            pref_matched = len([b for b in breakdown if b.skill_type == "preferred" and b.status == "matched"])
            pref_total = max(1, len(preferred_skills)) if preferred_skills else 1

            if preferred_skills:
                match_pct = int(round((req_matched / req_total * 70.0) + (pref_matched / pref_total * 30.0)))
            else:
                match_pct = int(round(req_matched / req_total * 100.0))

        # Sort breakdown: Missing Required (High) -> Missing Preferred (Medium) -> Matched (Low)
        priority_sort = {"High": 1, "Medium": 2, "Low": 3}
        breakdown.sort(key=lambda x: (priority_sort.get(x.priority, 9), x.skill))

        return SkillGapAnalysis(
            job_id=job_data.get("id", ""),
            job_title=job_data.get("title", ""),
            company=job_data.get("company", ""),
            overall_match_percentage=match_pct,
            matched_skills_count=matched_count,
            missing_required_count=missing_req_count,
            missing_preferred_count=missing_pref_count,
            total_skills_count=total_skills,
            skills_breakdown=breakdown
        )
