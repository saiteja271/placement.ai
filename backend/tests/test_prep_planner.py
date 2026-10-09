import pytest
from app.services.prep_planner_service import PrepPlannerService

def test_prep_planner_generates_balanced_tasks():
    student = {
        "skills": "Python;SQL"
    }
    job = {
        "id": "J001",
        "title": "Software Development Engineer",
        "company": "Google",
        "required_skills": "Python;Java;System Design;DSA",
        "preferred_skills": "Cloud Computing;Docker"
    }

    tasks = PrepPlannerService.generate_plan(student, job, days=28)
    assert len(tasks) >= 6

    # Verify categories present
    categories = {t.category for t in tasks}
    assert "Technical" in categories
    assert "Coding" in categories
    assert "HR & Communication" in categories

    # Verify all tasks initialize as not completed
    for t in tasks:
        assert t.is_completed is False
        assert t.duration_minutes > 0

def test_prep_planner_60_days_curriculum():
    student = {"skills": "Python;SQL"}
    job = {
        "id": "J001",
        "title": "Software Development Engineer",
        "required_skills": "Python;DSA;System Design",
    }
    tasks = PrepPlannerService.generate_plan(student, job, days=60)
    weeks = {t.week for t in tasks}
    assert 5 in weeks
    assert 6 in weeks
    assert 7 in weeks
    assert 8 in weeks
    assert len(tasks) >= 10

def test_prep_planner_7_and_14_days_sprints():
    student = {"skills": "Python;SQL"}
    job = {
        "id": "J001",
        "title": "Software Development Engineer",
        "required_skills": "Python;DSA",
    }
    tasks_7 = PrepPlannerService.generate_plan(student, job, days=7)
    assert all(t.week == 1 for t in tasks_7)

    tasks_14 = PrepPlannerService.generate_plan(student, job, days=14)
    weeks_14 = {t.week for t in tasks_14}
    assert weeks_14 == {1, 2}
