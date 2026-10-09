import urllib.request
import json

def post(url, payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def delete(url):
    req = urllib.request.Request(url, method='DELETE')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("=== 1. ELIGIBILITY: TEJA (ELIGIBLE) ===")
teja_elig = post("http://127.0.0.1:8000/api/jobs/J001/eligibility?student_id=S001", {})
print("Status:", teja_elig["status"], "| Eligible:", teja_elig["is_eligible"], "| Failed Mandatory:", teja_elig["failed_mandatory"])

print("\n=== 2. ELIGIBILITY: ARUN (INELIGIBLE - FAILS MANDATORY) ===")
arun_elig = post("http://127.0.0.1:8000/api/jobs/J001/eligibility?student_id=S003", {})
print("Status:", arun_elig["status"], "| Eligible:", arun_elig["is_eligible"], "| Failed Mandatory:", arun_elig["failed_mandatory"])
for c in arun_elig["criteria"]:
    print(f"  - {c['criterion_name']}: {c['status']} ({c['explanation'][:60]}...)")

print("\n=== 3. ELIGIBILITY: SAM (UNKNOWN CRITERIA) ===")
sam_elig = post("http://127.0.0.1:8000/api/jobs/J001/eligibility?student_id=S004", {})
print("Status:", sam_elig["status"], "| Eligible:", sam_elig["is_eligible"], "| Failed Mandatory:", sam_elig["failed_mandatory"])
for c in sam_elig["criteria"]:
    if c["status"] == "UNKNOWN":
        print(f"  - UNKNOWN: {c['criterion_name']} ({c['explanation']})")

print("\n=== 4. SKILL GAPS FOR TEJA ON J001 ===")
gaps = post("http://127.0.0.1:8000/api/jobs/J001/skill-gaps?student_id=S001", {})
print(f"Match: {gaps['overall_match_percentage']}% | Matched: {gaps['matched_skills_count']} | Missing Core: {gaps['missing_required_count']}")
for b in gaps["skills_breakdown"][:3]:
    print(f"  - {b['skill']}: {b['status']} ({b['priority']} priority) -> Action: {b['recommended_action'][:50]}...")

print("\n=== 5. PREP PLAN & PERSISTENCE ===")
plan = post("http://127.0.0.1:8000/api/jobs/J001/prep-plan?student_id=S001&days=28", {})
t1 = plan["tasks"][0]
print("Plan ID:", plan["id"], "| Tasks:", len(plan["tasks"]), "| Task 1 before:", t1["title"], t1["is_completed"])
# Toggle
tog = post(f"http://127.0.0.1:8000/api/prep-plan/{plan['id']}/task-toggle", {"task_id": t1["id"], "is_completed": True})
print("Toggle result:", tog)
# Re-read
plan2 = post("http://127.0.0.1:8000/api/jobs/J001/prep-plan?student_id=S001&days=28", {})
print("Task 1 after re-fetch (persisted):", plan2["tasks"][0]["is_completed"], "| Progress:", plan2["progress_percentage"], "%")

print("\n=== 6. SAVED JOBS WORKFLOW ===")
save_res = post("http://127.0.0.1:8000/api/students/S001/saved-jobs/J003", {})
print("Save J003:", save_res)
saved_list = get("http://127.0.0.1:8000/api/students/S001/saved-jobs")
print("Saved count:", len(saved_list), "| Saved IDs:", [j["id"] for j in saved_list])
unsave_res = delete("http://127.0.0.1:8000/api/students/S001/saved-jobs/J003")
print("Unsave J003:", unsave_res)

print("\n=== 7. AGENT TRACE EXECUTION ===")
agent = post("http://127.0.0.1:8000/api/agent/query", {"student_id": "S001", "query": "Analyze my placement readiness and find best matches", "mode": "demo"})
print("Agent Mode:", agent["execution_mode"])
print("Steps executed:", len(agent["trace"]))
for step in agent["trace"]:
    print(f"  Step {step['step_number']}: {step['tool_name']} ({step['duration_ms']}ms) -> {step['result_summary']}")
print("\nFinal Answer Preview:\n", agent["final_answer"][:200], "...")
