import pytest
from app.services.skill_gap_service import SkillGapService

def test_skill_gap_analysis_separation():
    student = {
        "skills": "Python;SQL"
    }
    job = {
        "id": "J001",
        "title": "Backend Engineer",
        "company": "Tech Corp",
        "required_skills": "Python;SQL;Docker",
        "preferred_skills": "AWS;Kubernetes"
    }

    analysis = SkillGapService.analyze(student, job)
    assert analysis.matched_skills_count == 2
    assert analysis.missing_required_count == 1 # Docker
    assert analysis.missing_preferred_count == 2 # AWS, Kubernetes

    # Verify Docker is identified as High priority required gap
    docker_gap = next(g for g in analysis.skills_breakdown if g.skill == "Docker")
    assert docker_gap.status == "missing"
    assert docker_gap.skill_type == "required"
    assert docker_gap.priority == "High"

    # Verify AWS is identified as Medium priority preferred gap
    aws_gap = next(g for g in analysis.skills_breakdown if g.skill == "AWS")
    assert aws_gap.status == "missing"
    assert aws_gap.skill_type == "preferred"
    assert aws_gap.priority == "Medium"
