import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["rules_engine"] == "deterministic_python"

def test_list_jobs_with_matches():
    res = client.get("/api/jobs?student_id=S001")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    first = data[0]
    assert "match_score" in first
    assert "eligibility_status" in first
    assert "is_eligible" in first
    assert "match_reasons" in first

def test_job_search_filters():
    # Search for Python
    res = client.get("/api/jobs?search=Python&student_id=S001")
    assert res.status_code == 200
    data = res.json()
    for j in data:
        corpus = f"{j['title']} {j['company']} {' '.join(j['required_skills'])} {' '.join(j['preferred_skills'])}".lower()
        assert "python" in corpus

def test_deterministic_eligibility_endpoint():
    res = client.post("/api/jobs/J001/eligibility?student_id=S001")
    assert res.status_code == 200
    data = res.json()
    assert "is_eligible" in data
    assert "criteria" in data
    assert len(data["criteria"]) == 4

def test_skill_gaps_endpoint():
    res = client.post("/api/jobs/J001/skill-gaps?student_id=S001")
    assert res.status_code == 200
    data = res.json()
    assert "overall_match_percentage" in data
    assert "skills_breakdown" in data
    assert len(data["skills_breakdown"]) > 0

def test_prep_plan_persistence_and_toggle():
    # 1. Create or get plan
    res = client.post("/api/jobs/J001/prep-plan?student_id=S001&days=28")
    assert res.status_code == 200
    plan = res.json()
    assert len(plan["tasks"]) > 0
    plan_id = plan["id"]
    first_task_id = plan["tasks"][0]["id"]
    initial_completed = plan["tasks"][0]["is_completed"]

    # 2. Toggle task
    toggle_res = client.post(f"/api/prep-plan/{plan_id}/task-toggle", json={
        "task_id": first_task_id,
        "is_completed": not initial_completed
    })
    assert toggle_res.status_code == 200
    assert toggle_res.json()["is_completed"] == (not initial_completed)

    # 3. Retrieve plan again and check persistence
    recheck_res = client.post("/api/jobs/J001/prep-plan?student_id=S001&days=28")
    assert recheck_res.status_code == 200
    rechecked_plan = recheck_res.json()
    toggled_task = next(t for t in rechecked_plan["tasks"] if t["id"] == first_task_id)
    assert toggled_task["is_completed"] == (not initial_completed)

def test_saved_jobs_workflow():
    # 1. Save J002
    res_save = client.post("/api/students/S001/saved-jobs/J002")
    assert res_save.status_code == 200
    assert res_save.json()["saved"] is True

    # 2. Check saved list
    res_list = client.get("/api/students/S001/saved-jobs")
    assert res_list.status_code == 200
    saved_ids = [j["id"] for j in res_list.json()]
    assert "J002" in saved_ids

    # 3. Unsave J002
    res_unsave = client.delete("/api/students/S001/saved-jobs/J002")
    assert res_unsave.status_code == 200
    assert res_unsave.json()["saved"] is False

def test_agent_query_execution():
    res = client.post("/api/agent/query", json={
        "student_id": "S001",
        "query": "Find me the best software engineering opportunities and check my eligibility",
        "mode": "demo"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["execution_mode"] in ["FALLBACK_DEMO", "LIVE_AI"]
    assert len(data["trace"]) >= 4
    # Real tool execution logged
    tool_names = [step["tool_name"] for step in data["trace"]]
    assert "search_jobs" in tool_names
    assert "check_eligibility" in tool_names
    assert "analyze_skill_gaps" in tool_names
    assert len(data["final_answer"]) > 50
