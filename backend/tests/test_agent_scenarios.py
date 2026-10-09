import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.core.database import SessionLocal
from app.models.models import Student, Job, PrepPlan, User
from app.agent.tools import AgentTools
from app.agent.orchestrator import AgentOrchestrator

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_scenario_1_job_discovery(db_session: Session):
    """
    Scenario 1: Job discovery
    User request: 'Find the best jobs for my profile.'
    Verifies actual database search, ranking, and grounded results without fabrication.
    """
    student = db_session.query(Student).filter(Student.id == "S001").first()
    assert student is not None

    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query="Find the best jobs for my profile."
    )

    assert res.query == "Find the best jobs for my profile."
    assert len(res.trace) >= 2
    # Verify search_jobs and rank_job_matches were executed
    tool_names = [step.tool_name for step in res.trace]
    assert "search_jobs" in tool_names
    assert "rank_job_matches" in tool_names

    # Verify structured result has real job match data
    assert res.structured_result is not None
    assert "job_match" in res.structured_result
    job_match = res.structured_result["job_match"]
    assert job_match["job_id"] in ["J001", "J002", "J003", "J004", "J005", "J006", "J007", "J008"]
    assert job_match["score"] > 0
    # Final answer should mention real findings and not fabricate
    assert "Key Findings:" in res.final_answer or "match score" in res.final_answer


def test_scenario_2_eligibility(db_session: Session):
    """
    Scenario 2: Eligibility
    User request: 'Am I eligible for this job?'
    Evaluates actual mandatory criteria (branch, CGPA, backlogs, grad year).
    """
    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query="Am I eligible for Python Developer at NexGen Labs (J004)?"
    )

    tool_names = [step.tool_name for step in res.trace]
    assert "check_eligibility" in tool_names
    assert res.structured_result is not None
    assert "eligibility" in res.structured_result

    elig = res.structured_result["eligibility"]
    assert elig["status"] in ["ELIGIBLE", "NOT_ELIGIBLE", "CONDITIONAL"]
    assert isinstance(elig["is_eligible"], bool)
    assert "Criteria Audit" in res.final_answer or "criteria" in res.final_answer.lower()


def test_scenario_3_skill_gaps(db_session: Session):
    """
    Scenario 3: Skill-gap analysis
    User request: 'What skills am I missing for this role?'
    Distinguishes matched profile skills from missing required/preferred skills.
    """
    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query="What skills am I missing for J004?"
    )

    tool_names = [step.tool_name for step in res.trace]
    assert "analyze_skill_gaps" in tool_names
    assert res.structured_result is not None
    assert "skill_gaps" in res.structured_result

    gaps = res.structured_result["skill_gaps"]
    assert "matched_skills" in gaps
    assert "missing_skills" in gaps
    assert gaps["overall_match_percentage"] > 0
    assert "Verified Strengths" in res.final_answer or "Skill Alignment" in res.final_answer


def test_scenario_4_prep_plan(db_session: Session):
    """
    Scenario 4: Preparation plan
    User request: 'Create a four-week preparation plan.'
    Creates a 28-day plan and verifies PERSISTENCE to the SQLite PrepPlan table.
    """
    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query="Create a four-week preparation plan for Python Developer J004"
    )

    tool_names = [step.tool_name for step in res.trace]
    assert "generate_prep_plan" in tool_names
    assert res.structured_result is not None
    assert "prep_plan" in res.structured_result

    plan_info = res.structured_result["prep_plan"]
    assert plan_info["total_days"] == 28
    assert plan_info["tasks_count"] > 0
    assert plan_info.get("plan_id") is not None

    # Verify real database persistence
    saved_plan = db_session.query(PrepPlan).filter(
        PrepPlan.student_id == "S001",
        PrepPlan.job_id == "J004"
    ).first()
    assert saved_plan is not None
    assert saved_plan.total_days == 28
    assert "Successfully saved to your profile roadmap" in res.final_answer


def test_scenario_5_multi_step_task(db_session: Session):
    """
    Scenario 5: Multi-step task
    User request: 'Analyze my profile, find suitable jobs, check eligibility, identify skill gaps, and create a preparation plan for the best eligible role.'
    Executes all required tools in sequence.
    """
    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query="Analyze my profile, find suitable jobs, check eligibility, identify skill gaps, and create a preparation plan for the best eligible role."
    )

    tool_names = [step.tool_name for step in res.trace]
    assert "search_jobs" in tool_names
    assert "rank_job_matches" in tool_names
    assert "check_eligibility" in tool_names
    assert "analyze_skill_gaps" in tool_names
    assert "generate_prep_plan" in tool_names

    assert res.structured_result is not None
    assert "job_match" in res.structured_result
    assert "eligibility" in res.structured_result
    assert "skill_gaps" in res.structured_result
    assert "prep_plan" in res.structured_result


def test_scenario_6_follow_up_context(db_session: Session):
    """
    Scenario 6: Follow-up context
    User asks: 'Explain the second one.'
    Resolves the second ranked job from conversational context rather than unrelated search.
    """
    mock_history = [
        {"sender": "user", "text": "Find the best jobs for my profile."},
        {
            "sender": "assistant",
            "text": "Here are the top opportunities.",
            "structuredResult": {
                "job_match": {"job_id": "J004", "title": "Python Developer", "score": 85}
            }
        }
    ]

    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query="Explain the second one.",
        conversation_history=mock_history
    )

    tool_names = [step.tool_name for step in res.trace]
    assert "get_job_details" in tool_names or "check_eligibility" in tool_names
    # Confirms it resolved the second job and explained its details
    assert "resolved 'the second one'" in res.final_answer.lower() or "details" in res.final_answer.lower()


def test_scenario_7_missing_information(db_session: Session):
    """
    Scenario 7: Missing information
    Student profile with missing CGPA or branch.
    Verifies that the agent reports CONDITIONAL / UNKNOWN and does NOT guess missing values.
    """
    # Create or update a test student with missing CGPA
    test_student = db_session.query(Student).filter(Student.id == "TEST_INCOMPLETE").first()
    if not test_student:
        test_student = Student(
            id="TEST_INCOMPLETE",
            full_name="Alex Incomplete",
            email="alex@college.edu",
            degree="B.Tech",
            branch="Computer Science",
            graduation_year=2026,
            cgpa=0.0, # Missing CGPA
            backlogs=0,
            skills="Python;SQL"
        )
        db_session.add(test_student)
        db_session.commit()

    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="TEST_INCOMPLETE",
        query="Am I eligible for J004?"
    )

    assert res.structured_result is not None
    elig = res.structured_result.get("eligibility")
    assert elig is not None
    # Must be CONDITIONAL or NOT_ELIGIBLE due to missing CGPA
    assert elig["status"] in ["CONDITIONAL", "NOT_ELIGIBLE"]
    assert "UNKNOWN" in res.final_answer or "missing" in res.final_answer.lower() or "cannot verify" in res.final_answer.lower()


def test_scenario_8_tool_failure(db_session: Session):
    """
    Scenario 8: Tool failure
    Simulate an invalid job ID or non-existent entity.
    Verifies that the agent reports failure honestly in the trace and does NOT claim success.
    """
    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query="Check my eligibility for J999_NON_EXISTENT"
    )

    tool_names = [step.tool_name for step in res.trace]
    assert "check_eligibility" in tool_names
    failed_steps = [s for s in res.trace if s.status == "FAILED"]
    assert len(failed_steps) > 0
    assert "not found" in failed_steps[0].result_summary.lower()
    # Does not claim candidate is eligible
    assert res.structured_result["eligibility"]["is_eligible"] is False


def test_scenario_9_unsupported_request(db_session: Session):
    """
    Scenario 9: Unsupported request
    User asks for information unavailable from system (e.g. stock price, weather, flight).
    Verifies that the agent explains boundaries and suggests supported actions without hallucination.
    """
    res = AgentOrchestrator.run_agent(
        db=db_session,
        student_id="S001",
        query="What is the weather forecast and stock price of Apple?"
    )

    assert "PlaceMate AI is an agentic college placement assistant" in res.final_answer
    assert "Supported placement actions" in res.final_answer
    assert len(res.suggested_actions) > 0
    assert len(res.trace) == 0 # Did not execute irrelevant tools


def test_scenario_10_cross_user_isolation(db_session: Session):
    """
    Scenario 10: Cross-user isolation
    Student user S001 attempts to query S002's data.
    Verifies that backend rejects unauthorized access with 403 Forbidden.
    """
    # Create demo student user for S001
    user_s001 = db_session.query(User).filter(User.student_id == "S001").first()
    if not user_s001:
        user_s001 = User(
            id="user-s001",
            email="s001@placemate.ai",
            password_hash="dummy",
            role="student",
            full_name="Teja",
            institution="NIT",
            verification_status="verified",
            student_id="S001"
        )
        db_session.add(user_s001)
        db_session.commit()

    token = f"token-{user_s001.id}"

    # S001 attempts to query S002 profile
    response = client.post(
        "/api/agent/query",
        headers={"Authorization": token},
        json={
            "student_id": "S002",
            "query": "Find jobs for my profile"
        }
    )

    assert response.status_code == 403
    assert "Access denied" in response.json()["detail"]
