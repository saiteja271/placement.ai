import json
import pytest
import urllib.error
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.main import app
from app.models.models import Job, Student, PrepPlan, User
from app.services.job_providers.base import extract_skills_from_text, NormalizedJob
from app.services.job_providers.adzuna_provider import AdzunaJobProvider
from app.services.job_providers.jooble_provider import JoobleJobProvider
from app.services.job_providers.manager import JobProviderManager, job_provider_manager
from app.services.eligibility_service import EligibilityService
from app.services.matching_service import MatchingService
from app.services.skill_gap_service import SkillGapService
from app.services.prep_planner_service import PrepPlannerService
from app.agent.tools import AgentTools
from app.agent.orchestrator import AgentOrchestrator

client = TestClient(app)

# ---------------------------------------------------------------------------
# 1. Live Job Provider Adapter with Mocked HTTP Responses (Adzuna & Jooble)
# ---------------------------------------------------------------------------
def test_adzuna_provider_mock_response():
    provider = AdzunaJobProvider(app_id="test_id", app_key="test_key", country="in")

    mock_payload = {
        "count": 1,
        "results": [
            {
                "id": "12345678",
                "title": "Senior <strong>Python Developer</strong>",
                "description": "Building microservices with Python, FastAPI, Docker, and PostgreSQL.",
                "company": {"display_name": "Tech Corp India"},
                "location": {"display_name": "Hyderabad, Telangana"},
                "salary_min": 1200000,
                "salary_max": 1800000,
                "redirect_url": "https://www.adzuna.in/land/ad/12345678",
                "created": "2026-04-01T10:00:00Z"
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.getcode.return_value = 200
    mock_resp.read.return_value = json.dumps(mock_payload).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        res = provider.search(query="Python Developer", location="Hyderabad")

    assert res["success"] is True
    assert res["total_found"] == 1
    assert len(res["jobs"]) == 1
    job = res["jobs"][0]
    assert job["title"] == "Senior Python Developer"  # Stripped HTML
    assert job["company"] == "Tech Corp India"
    assert job["location"] == "Hyderabad, Telangana"
    assert job["original_url"] == "https://www.adzuna.in/land/ad/12345678"
    assert job["source_type"] == "live_provider"
    assert "Python" in job["required_skills"]
    assert "₹1,200,000" in job["salary_range"]


def test_jooble_provider_mock_response():
    provider = JoobleJobProvider(api_key="test_jooble_key")

    mock_payload = {
        "totalCount": 1,
        "jobs": [
            {
                "id": "98765",
                "title": "Full Stack Engineer",
                "company": "CloudWave Global",
                "location": "Bengaluru",
                "snippet": "Requires React, Node.js, TypeScript and AWS experience.",
                "salary": "₹15,00,000 / yr",
                "link": "https://jooble.org/desc/98765",
                "type": "Full-time",
                "updated": "2026-04-02"
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.read.return_value = json.dumps(mock_payload).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        res = provider.search(query="Full Stack Engineer", location="Bengaluru")

    assert res["success"] is True
    assert res["total_found"] == 1
    assert len(res["jobs"]) == 1
    job = res["jobs"][0]
    assert job["title"] == "Full Stack Engineer"
    assert job["company"] == "CloudWave Global"
    assert job["original_url"] == "https://jooble.org/desc/98765"
    assert job["source_type"] == "live_provider"
    assert "React" in job["required_skills"]


# ---------------------------------------------------------------------------
# 2. Provider Authentication Failures & Timeouts
# ---------------------------------------------------------------------------
def test_adzuna_unconfigured_credentials():
    provider = AdzunaJobProvider(app_id="", app_key="")
    res = provider.search(query="Python")
    assert res["success"] is False
    assert res["status_code"] == 401
    assert "not set" in res["error"]


def test_adzuna_http_auth_failure():
    provider = AdzunaJobProvider(app_id="invalid", app_key="invalid")
    http_error = urllib.error.HTTPError(
        url="https://api.adzuna.com",
        code=401,
        msg="Unauthorized",
        hdrs={},
        fp=None
    )
    with patch("urllib.request.urlopen", side_effect=http_error):
        res = provider.search(query="Python")
    assert res["success"] is False
    assert res["status_code"] == 401
    assert "authentication failed" in res["error"].lower()


def test_adzuna_timeout_handling():
    provider = AdzunaJobProvider(app_id="valid_id", app_key="valid_key")
    url_error = urllib.error.URLError(reason="timed out")
    with patch("urllib.request.urlopen", side_effect=url_error):
        res = provider.search(query="Python")
    assert res["success"] is False
    assert res["status_code"] == 503
    assert "Network error" in res["error"]


# ---------------------------------------------------------------------------
# 3. Empty Search Results
# ---------------------------------------------------------------------------
def test_empty_search_results():
    provider = AdzunaJobProvider(app_id="valid_id", app_key="valid_key")
    mock_payload = {"count": 0, "results": []}
    mock_resp = MagicMock()
    mock_resp.getcode.return_value = 200
    mock_resp.read.return_value = json.dumps(mock_payload).encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp

    with patch("urllib.request.urlopen", return_value=mock_resp):
        res = provider.search(query="NonExistentRoleXYZ12345", location="Antarctica")
    assert res["success"] is True
    assert res["total_found"] == 0
    assert len(res["jobs"]) == 0


# ---------------------------------------------------------------------------
# 4. Duplicate Job Records Deduplication
# ---------------------------------------------------------------------------
def test_job_deduplication(db_session: Session):
    # Clean up any leftover test company records for idempotency
    db_session.query(Job).filter(Job.company == "DeepMind Innovations").delete()
    db_session.commit()

    manager = JobProviderManager()
    duplicate_items = [
        {
            "external_job_id": "ext-dup-001",
            "title": "Machine Learning Engineer",
            "company": "DeepMind Innovations",
            "location": "Hyderabad",
            "work_mode": "Hybrid",
            "degree_requirements": ["B.Tech", "MCA"],
            "eligible_branches": ["Computer Science"],
            "required_skills": ["Python", "Machine Learning"],
            "preferred_skills": ["PyTorch"],
            "salary_range": "₹20,00,000 / yr",
            "original_url": "https://example.com/jobs/dup-001",
            "source_type": "live_provider",
            "provider_name": "Adzuna"
        },
        {
            "external_job_id": "ext-dup-001",  # Same external ID
            "title": "Machine Learning Engineer",
            "company": "DeepMind Innovations",
            "location": "Hyderabad",
            "work_mode": "Hybrid",
            "degree_requirements": ["B.Tech", "MCA"],
            "eligible_branches": ["Computer Science"],
            "required_skills": ["Python", "Machine Learning"],
            "preferred_skills": ["PyTorch"],
            "salary_range": "₹20,00,000 / yr",
            "original_url": "https://example.com/jobs/dup-001",
            "source_type": "live_provider",
            "provider_name": "Adzuna"
        }
    ]

    initial_count = db_session.query(Job).filter(Job.company == "DeepMind Innovations").count()
    manager._sync_jobs_to_db(db_session, duplicate_items)
    new_count = db_session.query(Job).filter(Job.company == "DeepMind Innovations").count()

    # Deduplication ensures only 1 job is inserted
    assert new_count == initial_count + 1


# ---------------------------------------------------------------------------
# 5. Job Ranking against Student Profile
# ---------------------------------------------------------------------------
def test_job_ranking_compatibility():
    student_profile = {
        "skills": "Python;SQL;Docker;Git",
        "preferred_role": "Python Developer",
        "preferred_location": "Hyderabad"
    }

    jobs = [
        {
            "id": "J1",
            "title": "Python Developer",
            "company": "PySoft",
            "location": "Hyderabad",
            "work_mode": "Hybrid",
            "required_skills": "Python;SQL;Git",
            "preferred_skills": "Docker",
            "min_cgpa": 6.0,
            "max_backlogs": 1
        },
        {
            "id": "J2",
            "title": "Java Spring Developer",
            "company": "Enterprise Java",
            "location": "Pune",
            "work_mode": "On-site",
            "required_skills": "Java;Spring Boot",
            "preferred_skills": "Kafka",
            "min_cgpa": 6.0,
            "max_backlogs": 1
        }
    ]

    ranked = MatchingService.rank_and_evaluate(student_profile, jobs)
    assert len(ranked) == 2
    # J1 should have higher match score than J2
    assert ranked[0]["id"] == "J1"
    assert ranked[0]["match_score"] > ranked[1]["match_score"]


# ---------------------------------------------------------------------------
# 6. Mandatory Eligibility Failure
# ---------------------------------------------------------------------------
def test_mandatory_eligibility_failure():
    student_profile = {
        "branch": "Mechanical Engineering",
        "cgpa": 5.8,
        "backlogs": 3,
        "graduation_year": 2029
    }
    job_profile = {
        "id": "JOB_STRICT",
        "title": "Software Engineer",
        "company": "StrictTech",
        "eligible_branches": "Computer Science;Information Technology",
        "min_cgpa": 7.5,
        "max_backlogs": 0,
        "graduation_year_min": 2026,
        "graduation_year_max": 2027
    }

    elig = EligibilityService.evaluate_eligibility(student_profile, job_profile)
    assert elig.is_eligible is False
    assert elig.status == "NOT_ELIGIBLE"
    assert elig.failed_mandatory is True
    # Verify criteria outcomes
    statuses = {c.criterion_name: c.status for c in elig.criteria}
    assert statuses["Degree & Branch"] == "NOT_MET"
    assert statuses["Minimum CGPA"] == "NOT_MET"
    assert statuses["Active Backlogs"] == "NOT_MET"
    assert statuses["Graduation Year"] == "NOT_MET"


# ---------------------------------------------------------------------------
# 7. Unknown Eligibility when Information is Missing
# ---------------------------------------------------------------------------
def test_unknown_eligibility_missing_info():
    student_profile = {
        "branch": "",      # Missing
        "cgpa": 0.0,      # Missing
        "backlogs": None, # Missing
        "graduation_year": None
    }
    job_profile = {
        "id": "JOB_CRITERIA",
        "title": "Software Engineer",
        "company": "TechCorp",
        "eligible_branches": "Computer Science",
        "min_cgpa": 7.0,
        "max_backlogs": 0,
        "graduation_year_min": 2026,
        "graduation_year_max": 2027
    }

    elig = EligibilityService.evaluate_eligibility(student_profile, job_profile)
    assert elig.is_eligible is False
    assert elig.status == "CONDITIONAL"
    unknown_criteria = [c for c in elig.criteria if c.status == "UNKNOWN"]
    assert len(unknown_criteria) >= 2


# ---------------------------------------------------------------------------
# 8. Skill-Gap Analysis Using Actual Requirements
# ---------------------------------------------------------------------------
def test_skill_gap_analysis_separation():
    student_profile = {"skills": "Python;SQL"}
    job_profile = {
        "id": "JOB_SKILLS",
        "title": "Data Engineer",
        "company": "DataHub",
        "required_skills": "Python;SQL;Docker;AWS",
        "preferred_skills": "Kafka;Kubernetes"
    }

    gaps = SkillGapService.analyze(student_profile, job_profile)
    matched = [s.skill for s in gaps.skills_breakdown if s.status == "matched"]
    missing_req = [s.skill for s in gaps.skills_breakdown if s.status == "missing" and s.skill_type == "required"]
    missing_pref = [s.skill for s in gaps.skills_breakdown if s.status == "missing" and s.skill_type == "preferred"]

    assert "Python" in matched
    assert "SQL" in matched
    assert "Docker" in missing_req
    assert "AWS" in missing_req
    assert "Kafka" in missing_pref
    assert "Kubernetes" in missing_pref


# ---------------------------------------------------------------------------
# 9. Preparation-Plan Generation and Preservation of Completed Tasks
# ---------------------------------------------------------------------------
def test_prep_plan_preserves_completed_tasks(db_session: Session):
    student_id = "S001"
    job_id = "J004"
    student = db_session.query(Student).filter(Student.id == student_id).first()
    student_dict = {"id": student.id, "skills": student.skills}

    # Generate initial plan
    plan1 = AgentTools.generate_prep_plan(db_session, student_dict, job_id, deadline_days=28, persist=True)
    assert plan1["persisted"] is True

    # Mark first task completed in DB
    db_plan = db_session.query(PrepPlan).filter(PrepPlan.id == plan1["plan_id"]).first()
    tasks_data = json.loads(db_plan.tasks_json)
    first_title = tasks_data[0]["title"]
    tasks_data[0]["is_completed"] = True
    db_plan.tasks_json = json.dumps(tasks_data)
    db_session.commit()

    # Regenerate / revise plan
    plan2 = AgentTools.generate_prep_plan(db_session, student_dict, job_id, deadline_days=28, persist=True)
    db_plan_revised = db_session.query(PrepPlan).filter(PrepPlan.id == plan2["plan_id"]).first()
    revised_tasks = json.loads(db_plan_revised.tasks_json)

    # Completed milestone should be preserved!
    preserved = [t for t in revised_tasks if t.get("title") == first_title]
    assert len(preserved) > 0
    assert preserved[0]["is_completed"] is True


# ---------------------------------------------------------------------------
# 10. Multi-Step Agent Tool Execution (End-to-End Evaluation Scenario)
# ---------------------------------------------------------------------------
def test_evaluation_scenario_e2e(db_session: Session):
    """
    Test scenario:
    'Find current Python Developer jobs in Hyderabad. Show the original posting links,
    compare the best results with my profile, explain which eligibility requirements I satisfy
    or cannot verify, identify my skill gaps, and prepare a four-week roadmap for my best suitable role.'
    """
    query = (
        "Find current Python Developer jobs in Hyderabad. Show the original posting links, "
        "compare the best results with my profile, explain which eligibility requirements I satisfy "
        "or cannot verify, identify my skill gaps, and prepare a four-week roadmap for my best suitable role."
    )

    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query=query
    )

    # 1. Verify trace executed all key tools
    tool_names = [step.tool_name for step in res.trace]
    assert "search_jobs" in tool_names
    assert "rank_job_matches" in tool_names
    assert "check_eligibility" in tool_names
    assert "analyze_skill_gaps" in tool_names
    assert "generate_prep_plan" in tool_names

    # 2. Verify answer reflects findings
    assert "Verified Opportunities" in res.final_answer
    assert "Eligibility Breakdown" in res.final_answer
    assert "Skill-Gap Analysis" in res.final_answer
    assert "4-Week Preparation Roadmap" in res.final_answer

    # 3. Verify structured result
    assert res.structured_result is not None
    assert "job_match" in res.structured_result
    assert "prep_plan" in res.structured_result
    assert "skill_gaps" in res.structured_result
    assert res.structured_result["prep_plan"]["total_days"] == 28


# ---------------------------------------------------------------------------
# 11. Follow-up References to Previous Job Results
# ---------------------------------------------------------------------------
def test_follow_up_ordinal_and_compare(db_session: Session):
    history = [
        {"role": "user", "content": "Find software developer jobs in Hyderabad"},
        {"role": "assistant", "content": "Top opportunities: 1. S001 2. J004 NexGen Labs Python Developer"}
    ]

    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query="Explain the second one",
        conversation_history=history
    )

    tools = [step.tool_name for step in res.trace]
    assert "get_job_details" in tools
    assert "check_eligibility" in tools
    assert "analyze_skill_gaps" in tools


# ---------------------------------------------------------------------------
# 12. Honest Tool Failure Handling (Non-existent Job IDs)
# ---------------------------------------------------------------------------
def test_honest_tool_failure_nonexistent_job(db_session: Session):
    student = db_session.query(Student).filter(Student.id == "S001").first()
    student_dict = {"id": student.id, "skills": student.skills}

    res = AgentTools.check_eligibility(db_session, student_dict, "J999_NON_EXISTENT")
    assert "error" in res
    assert "not found" in res["error"].lower()
    assert res["is_eligible"] is False


# ---------------------------------------------------------------------------
# 13. Cross-User Data Isolation via API
# ---------------------------------------------------------------------------
def test_cross_user_isolation_api(db_session: Session):
    # S001 student token trying to access S002 data
    resp = client.post(
        "/api/agent/query",
        headers={"Authorization": "token-user-demo-student"}, # Authenticated as S001
        json={
            "student_id": "S002", # Target student S002
            "query": "Recommend jobs for me"
        }
    )
    assert resp.status_code == 403
    assert "Access denied" in resp.json()["detail"]


# ---------------------------------------------------------------------------
# 14. Job Provider Status Endpoint
# ---------------------------------------------------------------------------
def test_job_provider_status_endpoint():
    resp = client.get("/api/jobs/provider-status")
    assert resp.status_code == 200
    data = resp.json()
    assert "active_provider" in data
    assert "is_live_configured" in data
    assert "supported_providers" in data
    assert "Adzuna" in data["supported_providers"]
    assert "Jooble" in data["supported_providers"]
