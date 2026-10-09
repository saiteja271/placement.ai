import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_demo_login_student():
    resp = client.post("/api/auth/demo-login?role=student")
    assert resp.status_code == 200
    data = resp.json()
    assert data["role"] == "student"
    assert data["email"] == "student@placemate.ai"
    assert "token" in data

def test_demo_login_officer():
    resp = client.post("/api/auth/demo-login?role=officer")
    assert resp.status_code == 200
    data = resp.json()
    assert data["role"] == "officer"
    assert data["email"] == "officer@placemate.ai"
    assert data["verification_status"] == "verified"

def test_officer_stats_endpoint():
    resp = client.get("/api/officer/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_students" in data
    assert "eligible_students" in data
    assert "active_recruitment_drives" in data
    assert data["total_students"] >= 1

def test_officer_students_directory():
    resp = client.get("/api/officer/students")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    first = data[0]
    assert "readiness_score" in first
    assert "eligible_jobs_count" in first

def test_officer_analytics():
    resp = client.get("/api/officer/analytics")
    assert resp.status_code == 200
    data = resp.json()
    assert "branch_distribution" in data
    assert "readiness_breakdown" in data
