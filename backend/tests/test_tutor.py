import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.tutor_service import TutorService

client = TestClient(app)

STUDENT_MOCK = {
    "id": "S001",
    "full_name": "Teja Reddy",
    "branch": "Computer Science",
    "skills": "Python;SQL;Docker;Git"
}

# ---------------------------------------------------------------------------
# 1. Ten Mandatory Pedagogical Verification Tests (Phase 7)
# ---------------------------------------------------------------------------

def test_tutor_python_inheritance():
    """1. Explain Python inheritance with an example."""
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="Python",
        mode="learn",
        user_message="Explain Python inheritance with an example."
    )
    assert res["mode"] == "learn"
    assert "Inheritance" in res["response"]
    assert "class ElectricCar" in res["response"] or "Vehicle" in res["response"]
    assert "super()" in res["response"]
    assert len(res["suggested_followups"]) >= 2


def test_tutor_list_vs_tuple():
    """2. What is the difference between a Python list and a tuple?"""
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="Python",
        mode="doubt",
        user_message="What is the difference between a Python list and a tuple?"
    )
    assert "Mutable" in res["response"] or "mutable" in res["response"]
    assert "Immutable" in res["response"] or "immutable" in res["response"]
    assert "sys.getsizeof" in res["response"] or "Memory" in res["response"] or "Syntax" in res["response"]
    assert "tuple" in res["response"].lower()


def test_tutor_sql_joins_sample_tables():
    """3. Teach me SQL joins using two sample tables."""
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="SQL",
        mode="learn",
        user_message="Teach me SQL joins using two sample tables."
    )
    assert "Employees" in res["response"]
    assert "Departments" in res["response"]
    assert "INNER JOIN" in res["response"]
    assert "LEFT JOIN" in res["response"]


def test_tutor_recursion_using_factorial():
    """4. Explain recursion using factorial."""
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="DSA",
        mode="learn",
        user_message="Explain recursion using factorial."
    )
    assert "factorial" in res["response"].lower()
    assert "Base Case" in res["response"] or "base case" in res["response"].lower()
    assert "Call Stack" in res["response"] or "stack" in res["response"].lower()


def test_tutor_debug_code_zero_division():
    """5. Debug this code: print(10 / 0)."""
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="Python",
        mode="debug",
        user_message="Debug this code: print(10 / 0)."
    )
    assert res["mode"] == "debug"
    assert "ZeroDivisionError" in res["response"]
    assert "denominator" in res["response"].lower() or "exception" in res["response"].lower()


def test_tutor_three_beginner_oop_questions():
    """6. Give me three beginner questions about OOP."""
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="OOP",
        mode="practice",
        user_message="Give me three beginner questions about OOP."
    )
    assert "Encapsulation" in res["response"]
    assert "Polymorphism" in res["response"] or "Overriding" in res["response"]
    assert "Abstraction" in res["response"]


def test_tutor_supervised_vs_unsupervised():
    """7. Explain supervised versus unsupervised learning."""
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="Machine Learning",
        mode="learn",
        user_message="Explain supervised versus unsupervised learning."
    )
    assert "Labeled" in res["response"] or "labeled" in res["response"].lower()
    assert "Unlabeled" in res["response"] or "unlabeled" in res["response"].lower()
    assert "Clustering" in res["response"] or "Regression" in res["response"]


def test_tutor_adaptive_explain_simply_followup():
    """8. Explain the same topic more simply (with history context)."""
    history = [
        {"role": "user", "content": "Explain supervised versus unsupervised learning."},
        {"role": "assistant", "content": "Supervised uses labeled datasets while unsupervised uses unlabeled data."}
    ]
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="Machine Learning",
        mode="learn",
        user_message="Explain the same topic more simply.",
        conversation_history=history
    )
    # Verifies adaptive analogy
    assert "Analogy" in res["title"] or "Simplified" in res["title"] or "Teacher" in res["response"] or "Flashcards" in res["response"] or "Shapes" in res["response"]


def test_tutor_adaptive_practice_question_followup():
    """9. Now give me a practice question about that topic (with history context)."""
    history = [
        {"role": "user", "content": "Explain recursion using factorial."},
        {"role": "assistant", "content": "Recursion involves a base case and recursive step."}
    ]
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="DSA",
        mode="practice",
        user_message="Now give me a practice question about that topic.",
        conversation_history=history
    )
    assert res["mode"] == "practice"
    assert "Challenge" in res["title"] or "Problem" in res["response"] or "Reverse a String" in res["response"]


def test_tutor_check_answer_review():
    """10. Check my answer and explain what I missed."""
    student_ans = "A list is mutable with square brackets and tuple is immutable with parenthesis."
    res = TutorService.generate_tutor_response(
        student_data=STUDENT_MOCK,
        topic="Python",
        mode="review",
        user_message=f"Check my answer and explain what I missed: {student_ans}"
    )
    assert res["mode"] == "review"
    assert "Strengths" in res["response"] or "Demonstrated" in res["response"]
    assert "Missing" in res["response"] or "Watch-outs" in res["response"]


# ---------------------------------------------------------------------------
# 2. Regression Test: Verify Different Questions Produce Distinct Answers
# ---------------------------------------------------------------------------

def test_regression_different_questions_produce_distinct_answers():
    """
    Guarantees the system does NOT return a generic repeated template for different questions.
    """
    questions = [
        ("Python", "learn", "Explain Python inheritance with an example."),
        ("Python", "doubt", "What is the difference between a Python list and a tuple?"),
        ("SQL", "learn", "Teach me SQL joins using two sample tables."),
        ("DSA", "learn", "Explain recursion using factorial."),
        ("Python", "debug", "Debug this code: print(10 / 0)."),
        ("ML", "learn", "Explain supervised versus unsupervised learning.")
    ]

    responses = []
    for topic, mode, q in questions:
        res = TutorService.generate_tutor_response(
            student_data=STUDENT_MOCK,
            topic=topic,
            mode=mode,
            user_message=q
        )
        responses.append(res["response"])

    # Assert that all 6 generated responses are strictly unique
    assert len(set(responses)) == len(questions), "Tutor must not repeat identical answers across different questions!"


# ---------------------------------------------------------------------------
# 3. FastApi Endpoints Integration Tests
# ---------------------------------------------------------------------------

def test_tutor_api_endpoint_full_contract():
    payload = {
        "student_id": "S001",
        "topic": "Python",
        "mode": "learn",
        "difficulty": "Intermediate",
        "message": "Explain Python inheritance with an example."
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Python" in data["topic"]
    assert data["mode"] == "learn"
    assert "ElectricCar" in data["response"] or "Vehicle" in data["response"]
    assert "provider" in data
    assert len(data["suggested_followups"]) >= 1


def test_tutor_api_endpoint_debug_mode():
    payload = {
        "student_id": "S001",
        "topic": "Python",
        "mode": "debug",
        "message": "Debug this code: print(10 / 0)."
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "debug"
    assert "ZeroDivisionError" in data["response"]


# ---------------------------------------------------------------------------
# 4. Phase 8 Comprehensive Matrix & Regression Test Suite
# ---------------------------------------------------------------------------

def test_scenario_1_learn_python_beginner():
    """1. Learn a Topic + Python + Beginner"""
    payload = {
        "student_id": "S001",
        "domain": "Python & Data Structures",
        "mode": "learn",
        "difficulty": "Beginner",
        "message": "Explain Python variables, memory references, and data types for beginners."
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "learn"
    assert data["difficulty"] == "Beginner"
    assert "Python" in data["domain"]
    assert len(data["response"]) > 50


def test_scenario_2_doubt_sql_intermediate():
    """2. Explain a Doubt + SQL + Intermediate"""
    payload = {
        "student_id": "S001",
        "domain": "SQL & Database Queries",
        "mode": "doubt",
        "difficulty": "Intermediate",
        "message": "Why do duplicate rows occur in SQL joins and how do I prevent them?"
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "doubt"
    assert "SQL" in data["domain"]
    assert "One-to-Many" in data["response"] or "DISTINCT" in data["response"] or "duplicate" in data["response"].lower()


def test_scenario_3_practice_system_design_advanced():
    """3. Practice Questions + System Design + Advanced"""
    payload = {
        "student_id": "S001",
        "domain": "System Design & Architecture",
        "mode": "practice",
        "difficulty": "Advanced",
        "message": "Give me an advanced system design challenge for high-throughput architecture."
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "practice"
    assert data["difficulty"] == "Advanced"
    assert "System Design" in data["domain"]
    assert "Rate Limiter" in data["response"] or "Token Bucket" in data["response"] or "TinyURL" in data["response"]


def test_scenario_4_debug_code_javascript_intermediate():
    """4. Debug Code + JavaScript + Intermediate"""
    payload = {
        "student_id": "S001",
        "domain": "Python & Data Structures",
        "mode": "debug",
        "difficulty": "Intermediate",
        "language": "javascript",
        "code_snippet": "const user = null;\nconsole.log(user.profile.name);",
        "message": "Why does this JavaScript code throw an error?"
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "debug"
    assert "TypeError" in data["response"]
    assert "null" in data["response"].lower()
    assert "?." in data["response"] or "Optional Chaining" in data["response"] or "guard" in data["response"].lower()


def test_scenario_5_quiz_ai_ml_beginner():
    """5. Quiz Me + AI & Machine Learning + Beginner"""
    payload = {
        "student_id": "S001",
        "domain": "AI & Machine Learning",
        "mode": "quiz",
        "difficulty": "Beginner",
        "message": "Give me a beginner quiz on machine learning classification metrics."
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "quiz"
    assert "Machine Learning" in data["domain"]
    assert "False Negative" in data["response"] or "Accuracy" in data["response"] or "Correct Answer" in data["response"]


def test_scenario_6_review_sql_advanced():
    """6. Review My Answer + SQL + Advanced"""
    payload = {
        "student_id": "S001",
        "domain": "SQL & Database Queries",
        "mode": "review",
        "difficulty": "Advanced",
        "message": "Review my SQL query for finding top department salaries: SELECT dept_id, MAX(salary) FROM employees GROUP BY dept_id HAVING MAX(salary) > 80000;"
    }
    response = client.post("/api/tutor/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "review"
    assert "SQL" in data["domain"]
    assert "Strengths" in data["response"] or "Demonstrated" in data["response"]
    assert "Sargability" in data["response"] or "HAVING" in data["response"] or "Watch-outs" in data["response"] or "Optimization" in data["response"]


def test_scenario_7_consecutive_domain_switch_zero_python_leakage():
    """7. Change domain from Python to SQL: verify SQL response has ZERO Python leakage"""
    # 1st call: Python topic
    payload_py = {
        "student_id": "S001",
        "domain": "Python & Data Structures",
        "mode": "learn",
        "difficulty": "Intermediate",
        "message": "Explain Python inheritance."
    }
    res_py = client.post("/api/tutor/chat", json=payload_py)
    assert res_py.status_code == 200
    data_py = res_py.json()
    assert "Python" in data_py["domain"]

    # 2nd call: Switch domain to SQL with independent message
    payload_sql = {
        "student_id": "S001",
        "domain": "SQL & Database Queries",
        "mode": "learn",
        "difficulty": "Intermediate",
        "message": "Explain clustered and non-clustered indexes in SQL databases."
    }
    res_sql = client.post("/api/tutor/chat", json=payload_sql)
    assert res_sql.status_code == 200
    data_sql = res_sql.json()

    assert "SQL" in data_sql["domain"]
    # Check that SQL content is returned
    assert "index" in data_sql["response"].lower() or "b-tree" in data_sql["response"].lower() or "table" in data_sql["response"].lower()

    # Strictly assert ZERO Python DSA leakage in SQL response
    python_leaks = [
        "python problem solving requires choosing",
        "two-pointers / sliding window",
        "electriccar",
        "sys.getsizeof",
        "pep 8",
        "def factorial"
    ]
    for leak in python_leaks:
        assert leak not in data_sql["response"].lower(), f"Leak detected in SQL response: '{leak}'"


def test_scenario_8_difficulty_depth_progression():
    """8. Change difficulty from Beginner to Advanced: verify content depth changes"""
    payload_beg = {
        "student_id": "S001",
        "domain": "SQL & Database Queries",
        "mode": "practice",
        "difficulty": "Beginner",
        "message": "Give me a SQL practice problem."
    }
    res_beg = client.post("/api/tutor/chat", json=payload_beg)
    assert res_beg.status_code == 200
    data_beg = res_beg.json()

    payload_adv = {
        "student_id": "S001",
        "domain": "SQL & Database Queries",
        "mode": "practice",
        "difficulty": "Advanced",
        "message": "Give me a SQL practice problem."
    }
    res_adv = client.post("/api/tutor/chat", json=payload_adv)
    assert res_adv.status_code == 200
    data_adv = res_adv.json()

    assert data_beg["difficulty"] == "Beginner"
    assert data_adv["difficulty"] == "Advanced"
    # Ensure beginner problem is foundational and advanced problem focuses on window functions / DENSE_RANK
    assert "DENSE_RANK" in data_adv["response"] or "Window Functions" in data_adv["response"] or "rank" in data_adv["response"].lower()
    assert data_beg["response"] != data_adv["response"]


def test_scenario_9_contextual_adaptive_followups():
    """9. Contextual follow-up: 'Explain the same topic more simply' and 'Now give me a practice question'"""
    # Step 1: Initial conversation turn
    h1 = [
        {"role": "user", "content": "Explain CAP theorem in system design."},
        {"role": "assistant", "content": "The CAP theorem states that a distributed system can guarantee at most two out of Consistency, Availability, and Partition Tolerance."}
    ]

    # Step 2: Adaptive simplify
    payload_simpler = {
        "student_id": "S001",
        "domain": "System Design & Architecture",
        "mode": "doubt",
        "difficulty": "Intermediate",
        "message": "Explain the same topic more simply.",
        "history": h1
    }
    res_simpler = client.post("/api/tutor/chat", json=payload_simpler)
    assert res_simpler.status_code == 200
    data_simpler = res_simpler.json()
    assert "Analogy" in data_simpler.get("title", "") or "Simplified" in data_simpler.get("title", "") or "analogy" in data_simpler["response"].lower()

    # Step 3: Adaptive practice question follow-up
    h2 = h1 + [
        {"role": "user", "content": "Explain the same topic more simply."},
        {"role": "assistant", "content": data_simpler["response"]}
    ]
    payload_prac = {
        "student_id": "S001",
        "domain": "System Design & Architecture",
        "mode": "practice",
        "difficulty": "Intermediate",
        "message": "Now give me a practice question about that topic.",
        "history": h2
    }
    res_prac = client.post("/api/tutor/chat", json=payload_prac)
    assert res_prac.status_code == 200
    data_prac = res_prac.json()
    assert data_prac["mode"] == "practice"
    assert "Challenge" in data_prac["response"] or "Scenario" in data_prac["response"] or "Problem" in data_prac["response"]


def test_scenario_10_conversation_isolation():
    """10. Start a new conversation / conversation isolation"""
    # Conversation A asks about Java
    payload_a = {
        "student_id": "S001",
        "domain": "Python & Data Structures",
        "conversation_id": "conv_session_alpha",
        "mode": "learn",
        "message": "Explain Python recursion with factorial.",
        "history": []
    }
    res_a = client.post("/api/tutor/chat", json=payload_a)
    assert res_a.status_code == 200

    # Conversation B starts completely fresh on SQL with new conversation_id
    payload_b = {
        "student_id": "S001",
        "domain": "SQL & Database Queries",
        "conversation_id": "conv_session_beta",
        "mode": "learn",
        "message": "Teach me database normalization.",
        "history": []
    }
    res_b = client.post("/api/tutor/chat", json=payload_b)
    assert res_b.status_code == 200
    data_b = res_b.json()
    assert "SQL" in data_b["domain"]
    assert "Normalization" in data_b["response"] or "1NF" in data_b["response"]
    assert "factorial" not in data_b["response"].lower()


def test_scenario_11_backend_validation_rejects_invalid_inputs():
    """11. Validation tests: Reject invalid mode and invalid difficulty with HTTP 422"""
    # 1. Invalid mode
    bad_mode = {
        "student_id": "S001",
        "domain": "Python & Data Structures",
        "mode": "invalid_mode_xyz",
        "message": "Hello"
    }
    res_bad_mode = client.post("/api/tutor/chat", json=bad_mode)
    assert res_bad_mode.status_code == 422, f"Expected 422 for invalid mode, got {res_bad_mode.status_code}"

    # 2. Invalid difficulty
    bad_diff = {
        "student_id": "S001",
        "domain": "Python & Data Structures",
        "mode": "learn",
        "difficulty": "extreme_god_mode",
        "message": "Hello"
    }
    res_bad_diff = client.post("/api/tutor/chat", json=bad_diff)
    assert res_bad_diff.status_code == 422, f"Expected 422 for invalid difficulty, got {res_bad_diff.status_code}"

    # 3. Empty message
    bad_msg = {
        "student_id": "S001",
        "domain": "Python & Data Structures",
        "mode": "learn",
        "message": "    "
    }
    res_bad_msg = client.post("/api/tutor/chat", json=bad_msg)
    assert res_bad_msg.status_code == 422, f"Expected 422 for empty message, got {res_bad_msg.status_code}"


def test_scenario_12_non_python_domains_never_leak_default_python_dsa():
    """12. Assert that non-Python domains NEVER contain default Python DSA text"""
    non_python_cases = [
        ("SQL & Database Queries", "learn", "Explain relational schema architecture."),
        ("System Design & Architecture", "learn", "Explain distributed caching strategies."),
        ("AI & Machine Learning", "learn", "Explain the bias-variance trade-off."),
        ("Core CS (OS, Networks, OOP)", "learn", "Explain process scheduling algorithms."),
        ("Behavioral & HR (STAR Method)", "learn", "Explain the STAR framework structure.")
    ]

    forbidden_python_phrases = [
        "python problem solving requires choosing the optimal data structures",
        "two-pointers / sliding window",
        "class electriccar",
        "zero_division_error",
        "sys.getsizeof"
    ]

    for domain_name, mode, prompt in non_python_cases:
        payload = {
            "student_id": "S001",
            "domain": domain_name,
            "mode": mode,
            "difficulty": "Intermediate",
            "message": prompt
        }
        res = client.post("/api/tutor/chat", json=payload)
        assert res.status_code == 200, f"Failed for domain {domain_name}"
        data = res.json()
        assert domain_name in data["domain"], f"Expected domain '{domain_name}', got '{data['domain']}'"

        response_text = data["response"].lower()
        for forbidden in forbidden_python_phrases:
            assert forbidden not in response_text, (
                f"Domain '{domain_name}' leaked Python DSA text: '{forbidden}'! Response was:\n{data['response']}"
            )

