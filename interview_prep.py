"""
interview_prep.py
Generate role-specific practice questions, a time-aware plan, and mock interview feedback.
All question banks are local examples; no external AI/API is required.
"""

from typing import Any, Dict, List


QUESTION_BANK = {
    "software developer": {
        "technical": [
            {"question": "What is the difference between a list and a tuple in Python?",
             "focus": "Mutability, syntax, and use cases."},
            {"question": "Explain primary keys and foreign keys in SQL.",
             "focus": "Uniqueness, relationships, and referential integrity."},
            {"question": "What is the time complexity of binary search, and why?",
             "focus": "Sorted input and O(log n) time."},
        ],
        "coding": [
            {"question": "Write a function to check whether a string is a palindrome.",
             "difficulty": "easy", "practice_minutes": 20},
            {"question": "Find the second-largest distinct number in a list.",
             "difficulty": "easy", "practice_minutes": 25},
            {"question": "Count the frequency of each word in a sentence.",
             "difficulty": "medium", "practice_minutes": 30},
        ],
        "aptitude": [
            {"question": "A product costs ₹800 after a 20% discount. What was its original price?",
             "answer": "₹1,000", "topic": "Percentages"},
            {"question": "A car travels 150 km in 3 hours. What is its average speed?",
             "answer": "50 km/h", "topic": "Time, speed and distance"},
            {"question": "If 5 workers finish a task in 12 days, how long would 10 workers take at the same rate?",
             "answer": "6 days", "topic": "Work and time"},
        ],
        "hr": [
            "Tell me about yourself.",
            "Why do you want to become a software developer?",
            "Describe a challenge you faced while learning or building a project.",
            "What is one skill you are currently improving?",
        ],
    }
}


def _role_key(role: str) -> str:
    normalized = role.lower()
    for key in QUESTION_BANK:
        if key in normalized or normalized in key:
            return key
    return "software developer"


def generate_interview_prep(
    student: Dict[str, Any],
    role: str,
    available_minutes_per_day: int = 120,
    plan_days: int = 7,
    skill_gaps: List[str] = None,
) -> Dict[str, Any]:
    """Return question sets and a realistic preparation plan."""
    minutes = max(15, int(available_minutes_per_day))
    days = max(1, int(plan_days))
    gaps = skill_gaps or ["Data Structures", "Git", "REST APIs"]

    bank = QUESTION_BANK[_role_key(role)]
    daily_plan = []
    tasks = [
        ("Technical fundamentals", "Review core concepts and answer technical questions."),
        ("Coding practice", "Solve two coding problems and explain the approach aloud."),
        ("Aptitude practice", "Practice percentages, ratios, time/work, and reasoning."),
        ("Skill-gap focus", f"Study and practice: {', '.join(gaps[:2]) or 'your highest-priority skill gap'}."),
        ("Project discussion", "Prepare a project explanation: problem, approach, tools, result, and learning."),
        ("Mock interview", "Complete a timed mock interview and review weak answers."),
        ("Revision and HR", "Revise notes, rehearse HR answers, and prepare questions for the interviewer."),
    ]
    for day in range(1, days + 1):
        topic, task = tasks[(day - 1) % len(tasks)]
        daily_plan.append({
            "day": day,
            "focus": topic,
            "task": task,
            "duration_minutes": minutes,
            "completion_status": "not_started",
        })

    return {
        "module": "career_intelligence.interview_prep",
        "student_name": student.get("name", "Student"),
        "target_role": role,
        "available_minutes_per_day": minutes,
        "plan_days": days,
        "questions": {
            "technical": bank["technical"],
            "coding": bank["coding"],
            "aptitude": bank["aptitude"],
            "hr": bank["hr"],
        },
        "preparation_plan": daily_plan,
        "mock_interview_feedback_template": {
            "overall_score_out_of_100": None,
            "communication_score_out_of_5": None,
            "technical_knowledge_score_out_of_5": None,
            "problem_solving_score_out_of_5": None,
            "strengths": [],
            "improvement_areas": [],
            "next_practice_actions": [],
            "note": "Scores should be filled after a real mock interview; do not infer scores without answers.",
        },
        "disclaimer": "Practice material for preparation only; questions and plan are illustrative.",
    }


def evaluate_mock_interview(
    answers: List[Dict[str, Any]],
    rubric: Dict[str, int] = None,
) -> Dict[str, Any]:
    """
    Produce structured feedback from reviewer-provided scores and comments.
    Each answer may include: question, score (1-5), strengths, improvement, next_action.
    This does not automatically judge answer quality; a human or separate evaluator
    should supply the scores/comments.
    """
    rubric = rubric or {"technical_knowledge": 5, "communication": 5, "problem_solving": 5}
    valid = [a for a in answers if isinstance(a.get("score"), (int, float))]
    scores = [max(1, min(5, float(a["score"]))) for a in valid]
    average = round((sum(scores) / len(scores)) * 20) if scores else None

    strengths, improvements, actions = [], [], []
    for item in answers:
        strengths.extend(item.get("strengths", []))
        if item.get("improvement"):
            improvements.append(item["improvement"])
        if item.get("next_action"):
            actions.append(item["next_action"])

    return {
        "module": "career_intelligence.mock_feedback",
        "questions_reviewed": len(answers),
        "scored_answers": len(valid),
        "average_score_out_of_100": average,
        "rubric": rubric,
        "strengths": list(dict.fromkeys(strengths)),
        "improvement_areas": list(dict.fromkeys(improvements)),
        "next_practice_actions": list(dict.fromkeys(actions)),
        "status": "reviewed" if valid else "awaiting_reviewer_scores",
    }


if __name__ == "__main__":
    import json
    sample_student = {"name": "Arun"}
    result = generate_interview_prep(
        sample_student,
        "Software Developer",
        available_minutes_per_day=90,
        plan_days=7,
        skill_gaps=["Data Structures", "Git"],
    )
    print(json.dumps(result, indent=2))
