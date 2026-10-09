import pytest
from app.services.eligibility_service import EligibilityService

def test_student_meets_all_mandatory_rules():
    student = {
        "branch": "Information Technology",
        "cgpa": 8.5,
        "backlogs": 0,
        "graduation_year": 2027
    }
    job = {
        "id": "J001",
        "title": "Software Development Engineer",
        "company": "Google",
        "eligible_branches": "Computer Science;Information Technology",
        "min_cgpa": 7.0,
        "max_backlogs": 0,
        "graduation_year_min": 2026,
        "graduation_year_max": 2028
    }

    result = EligibilityService.evaluate_eligibility(student, job)
    assert result.is_eligible is True
    assert result.status == "ELIGIBLE"
    assert result.failed_mandatory is False
    assert len(result.criteria) == 4
    for c in result.criteria:
        assert c.status == "MET"

def test_student_misses_cgpa_cutoff():
    student = {
        "branch": "Computer Science",
        "cgpa": 6.2,  # Cutoff is 7.5
        "backlogs": 0,
        "graduation_year": 2027
    }
    job = {
        "id": "J002",
        "title": "Backend Developer",
        "company": "Amazon",
        "eligible_branches": "Computer Science;Information Technology",
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "graduation_year_min": 2026,
        "graduation_year_max": 2028
    }

    result = EligibilityService.evaluate_eligibility(student, job)
    assert result.is_eligible is False
    assert result.status == "NOT_ELIGIBLE"
    assert result.failed_mandatory is True
    cgpa_crit = next(c for c in result.criteria if c.criterion_name == "Minimum CGPA")
    assert cgpa_crit.status == "NOT_MET"

def test_student_has_excessive_backlogs():
    student = {
        "branch": "Computer Science",
        "cgpa": 8.0,
        "backlogs": 2,  # Max allowed is 0
        "graduation_year": 2027
    }
    job = {
        "id": "J001",
        "title": "Software Development Engineer",
        "company": "Google",
        "eligible_branches": "Computer Science;Information Technology",
        "min_cgpa": 7.0,
        "max_backlogs": 0,
        "graduation_year_min": 2026,
        "graduation_year_max": 2028
    }

    result = EligibilityService.evaluate_eligibility(student, job)
    assert result.is_eligible is False
    assert result.status == "NOT_ELIGIBLE"
    assert result.failed_mandatory is True
    backlog_crit = next(c for c in result.criteria if c.criterion_name == "Active Backlogs")
    assert backlog_crit.status == "NOT_MET"

def test_unknown_cgpa_and_unknown_branch():
    student = {
        "branch": "",  # Missing
        "cgpa": None,  # Missing
        "backlogs": 0,
        "graduation_year": 2027
    }
    job = {
        "id": "J001",
        "title": "Software Development Engineer",
        "company": "Google",
        "eligible_branches": "Computer Science;Information Technology",
        "min_cgpa": 7.0,
        "max_backlogs": 0,
        "graduation_year_min": 2026,
        "graduation_year_max": 2028
    }

    result = EligibilityService.evaluate_eligibility(student, job)
    # Crucial rule: UNKNOWN must NOT be treated as a false pass OR a hard failure
    assert result.is_eligible is False
    assert result.status == "CONDITIONAL"
    assert result.failed_mandatory is False  # Didn't fail, it's UNKNOWN
    unknown_crits = [c for c in result.criteria if c.status == "UNKNOWN"]
    assert len(unknown_crits) == 2
