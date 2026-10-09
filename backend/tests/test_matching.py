import pytest
from app.services.matching_service import MatchingService

def test_match_score_does_not_override_failed_mandatory_eligibility():
    """
    CRITICAL REQUIREMENT 5:
    'Match scores never override failed mandatory eligibility criteria.'
    A student may match 100% of skills, but if they fail mandatory criteria,
    is_eligible must be False and status must be NOT_ELIGIBLE.
    """
    student_with_high_skills_but_low_cgpa = {
        "branch": "Computer Science",
        "cgpa": 5.5,  # Cutoff is 8.0 -> FAILS
        "backlogs": 0,
        "graduation_year": 2027,
        "skills": "Python;Java;System Design;DSA;Cloud Computing;Docker", # Perfect skills match
        "preferred_role": "Software Development Engineer",
        "preferred_location": "Bangalore"
    }

    job = {
        "id": "J001",
        "title": "Software Development Engineer",
        "company": "Google",
        "location": "Bangalore",
        "work_mode": "Full-time",
        "eligible_branches": "Computer Science;Information Technology",
        "min_cgpa": 8.0,
        "max_backlogs": 0,
        "graduation_year_min": 2026,
        "graduation_year_max": 2028,
        "required_skills": "Python;Java;System Design;DSA",
        "preferred_skills": "Cloud Computing;Docker"
    }

    results = MatchingService.rank_and_evaluate(student_with_high_skills_but_low_cgpa, [job])
    evaluated_job = results[0]

    # Verify match score is high due to strong skill alignment
    assert evaluated_job["match_score"] >= 80

    # Verify mandatory failure was NOT overridden
    assert evaluated_job["is_eligible"] is False
    assert evaluated_job["eligibility_status"] == "NOT_ELIGIBLE"
    assert evaluated_job["failed_mandatory"] is True

def test_matching_prefers_eligible_jobs():
    student = {
        "branch": "Information Technology",
        "cgpa": 7.5,
        "backlogs": 0,
        "graduation_year": 2027,
        "skills": "Python;SQL",
        "preferred_role": "Python Developer",
        "preferred_location": "Hyderabad"
    }

    job_eligible = {
        "id": "J_ELIG",
        "title": "Python Developer",
        "company": "Company A",
        "location": "Hyderabad",
        "work_mode": "Hybrid",
        "eligible_branches": "Information Technology",
        "min_cgpa": 6.5,
        "max_backlogs": 0,
        "graduation_year_min": 2026,
        "graduation_year_max": 2028,
        "required_skills": "Python;SQL",
        "preferred_skills": ""
    }

    job_ineligible = {
        "id": "J_INELIG",
        "title": "Senior Python Specialist",
        "company": "Company B",
        "location": "Hyderabad",
        "work_mode": "Hybrid",
        "eligible_branches": "Information Technology",
        "min_cgpa": 9.5, # Ineligible cutoff
        "max_backlogs": 0,
        "graduation_year_min": 2026,
        "graduation_year_max": 2028,
        "required_skills": "Python;SQL",
        "preferred_skills": ""
    }

    ranked = MatchingService.rank_and_evaluate(student, [job_ineligible, job_eligible])
    # Eligible job must rank above ineligible job
    assert ranked[0]["id"] == "J_ELIG"
    assert ranked[0]["is_eligible"] is True
    assert ranked[1]["id"] == "J_INELIG"
    assert ranked[1]["is_eligible"] is False
