# PlaceMate AI — Your AI-Powered Placement Companion

> **Agent-X 2026 Hackathon Prototype**  
> **Problem Statement No. 5:** AI College Placement Assistant  
> **Team:** Crafters (Sai Teja, Anjali, Arun, Yasin)  
> **Tagline:** *"Your next opportunity starts here."*

---

## 1. Executive Summary

**PlaceMate AI** is a production-grade, agentic career-readiness and college placement assistant. It bridges the critical gap between academic profiles and modern employer requirements by delivering:

1. **Smart Job Matching:** Multi-dimensional ranking prioritizing verified skill overlap, target roles, and location preferences.
2. **Deterministic Eligibility Verification:** Pure Python rule engine evaluating Branch, Minimum CGPA, Active Backlogs, and Graduation Batch. Missing data produces **UNKNOWN** rather than hallucinating passes or failures.
3. **Mandatory Gate Invariant:** High match scores **never** override failed mandatory criteria.
4. **Skill-Gap Diagnosis:** Identifies missing mandatory core skills (High priority) vs. preferred bonus skills (Medium priority), accompanied by structured learning roadmaps.
5. **Personalized 4-Week Interview Plan:** Role-specific roadmap with daily milestone tasks that persist in SQLite across page reloads.
6. **AI Mock Interview Support:** Timed question banks (Technical, Coding, System Design, HR) with rubric-based feedback.
7. **Agent Copilot Observability:** Visible trace panel recording real-time backend tool calling (`search_jobs`, `rank_job_matches`, `check_eligibility`, `analyze_skill_gaps`, `generate_prep_plan`).

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons.
- **Backend:** Python 3.14+, FastAPI, Pydantic V2, SQLAlchemy 2.0, SQLite.
- **AI Orchestration:** Native tool calling support with auto-detection for Gemini API / OpenAI API, paired with a deterministic local tool fallback orchestrator.
- **Testing:** Pytest (16 unit and API tests), automated end-to-end integration suite.

---

## 3. Visual Design System

Inspired by clean, human-centered career technology:
- **Canvas / Background:** `#F8F9FC` (Dark mode: `#0F172A`)
- **Surface / Cards:** `#FFFFFF` (Dark mode: `#1E293B`)
- **Primary Indigo Accent:** `#5548E8` (Hover: `#4336D6`)
- **Lavender Badge Surface:** `#EAE8FF` (Dark mode: `#2E286E`)
- **Typography Ink:** `#20243A` (Dark mode: `#F8FAFC`)
- **Status Badges:**
  - `ELIGIBLE` / `MET`: Emerald `#10B981` (tint: `#ECFDF5`)
  - `CONDITIONAL` / `UNKNOWN`: Amber `#F59E0B` (tint: `#FFFBEB`)
  - `NOT_ELIGIBLE` / `NOT_MET`: Crimson `#EF4444` (tint: `#FEF2F2`)

---

## 4. Project Directory Structure

```
AI College Management Assisstant/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entrypoint & startup lifecycle
│   │   ├── api/routes.py               # REST API endpoints
│   │   ├── core/config.py              # Environment configuration
│   │   ├── core/database.py            # SQLite engine & session management
│   │   ├── models/models.py            # SQLAlchemy database models
│   │   ├── schemas/schemas.py          # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── eligibility_service.py  # Deterministic rule engine & UNKNOWN handling
│   │   │   ├── matching_service.py     # Skill overlap & ranking logic
│   │   │   ├── skill_gap_service.py    # Gap diagnosis & priority categorization
│   │   │   ├── prep_planner_service.py # 4-week task generator
│   │   │   └── mock_interview_service.py # Rubric evaluation engine
│   │   └── agent/
│   │       ├── tools.py                # 5 validated backend agent tools
│   │       └── orchestrator.py         # Multi-step tool-calling orchestrator
│   ├── seed_data/seed.py               # Idempotent demo data seeder
│   └── tests/
│       ├── test_eligibility.py         # Unit tests for eligibility rules
│       ├── test_matching.py            # Unit tests for score & mandatory invariant
│       ├── test_skill_gaps.py          # Unit tests for gap categorization
│       ├── test_prep_planner.py        # Unit tests for roadmap tasks
│       ├── test_api.py                 # FastAPI integration tests
│       └── verify_e2e.py               # Live end-to-end validation script
├── frontend/
│   ├── src/
│   │   ├── App.tsx                     # React Router & shell layouts
│   │   ├── main.tsx                    # Application mount
│   │   ├── index.css                   # Tailwind CSS v4 design tokens
│   │   ├── components/
│   │   │   ├── Logo.tsx                # Brand monogram & wordmark
│   │   │   ├── Sidebar.tsx             # Desktop sticky navigation
│   │   │   ├── Navbar.tsx              # Header with candidate profile badge
│   │   │   ├── MobileBottomNav.tsx     # Compact mobile navigation
│   │   │   └── AgentDrawer.tsx         # Slide-over live tool execution trace
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx         # Hero, 4 capabilities & workflow
│   │   │   ├── DashboardPage.tsx       # Circular readiness gauge & metrics
│   │   │   ├── ProfilePage.tsx         # Candidate form, skills chips & personas
│   │   │   ├── JobMatchesPage.tsx      # Filterable job cards & match badges
│   │   │   ├── JobDetailPage.tsx       # Mandatory criteria checklist table
│   │   │   ├── SkillAnalysisPage.tsx   # Skill match donut & improvement guide
│   │   │   ├── InterviewPrepPage.tsx   # 4-week timeline with task checkboxes
│   │   │   ├── MockInterviewPage.tsx   # Timed question bank with rubric scores
│   │   │   ├── SavedJobsPage.tsx       # Bookmarked opportunities
│   │   │   └── SettingsPage.tsx        # Theme toggle & LLM key configuration
│   │   ├── context/AppContext.tsx      # Global candidate & state context
│   │   ├── services/api.ts             # Type-safe API client
│   │   └── types/index.ts              # Domain interfaces
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 5. Startup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Setup & Launch
```bash
# 1. From project root:
cd backend

# 2. Start the FastAPI server (auto-seeds database on first run)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/health`

### Frontend Setup & Launch
```bash
# 1. In a separate terminal, navigate to frontend:
cd frontend

# 2. Start the Vite development server
npm run dev -- --host 127.0.0.1 --port 5173
```
- Open browser at: `http://127.0.0.1:5173`

---

## 6. Hackathon Demonstration Flow (Step-by-Step)

1. **Landing Page:** Open `http://127.0.0.1:5173`. Walk through the 4 core pillars (Smart Job Matching, Detailed Eligibility Check, Personalized Learning Plans, AI Mock Interview).
2. **Profile & Persona Selection:** Navigate to **My Profile**. Demonstrate manual editing and 1-click candidate personas:
   - **Teja:** Information Technology, 8.2 CGPA, 0 backlogs (Eligible).
   - **Arun Kumar:** Mechanical Engineering, 5.8 CGPA, 2 backlogs (Ineligible).
   - **Sam Morgan:** Missing branch and CGPA (Triggers UNKNOWN status).
3. **Dashboard:** Observe the dynamic **Placement Readiness Gauge** (e.g. 78% for Teja) calculated from profile completeness, eligibility pass rate, and task completion.
4. **Job Matches:** Filter by location, work mode, or "Eligible Only". Inspect company cards (Google, Microsoft, Amazon, NexGen Labs) with match scores.
5. **Eligibility Checker Table:** Click on any job card. Inspect the 4 mandatory criteria (Branch, CGPA, Backlogs, Batch). Notice how Arun displays explicit `NOT_MET` red badges with plain-English rationales, while Sam displays amber `UNKNOWN` badges.
6. **Mandatory Invariant Verification:** Even if a student has an 85% skill match, a failed mandatory criterion strictly enforces an overall `NOT_ELIGIBLE` status.
7. **Skill Gap Diagnosis:** Navigate to **Skill Analysis**. Review the matched core skills (Python, SQL, Git) vs. missing high-priority gaps (DSA, System Design) and suggested learning days.
8. **Interview Prep Roadmap:** Open **Interview Prep**. Check off a daily task (e.g., Task 1: Core Programming Foundations). Refresh the browser page to demonstrate SQLite persistence.
9. **AI Mock Interview:** Select the Technical or Coding round. Submit an answer to receive structured rubric feedback (Technical accuracy, Communication, Completeness).
10. **Agent Copilot Drawer:** Click **Launch AI Agent** on the sidebar or navbar. Submit: `"Match top jobs and check my eligibility"`. Watch the real 5-step bounded tool execution trace execute live.

---

## 7. Verification & Test Results

```bash
# Run backend test suite
python -m pytest backend/tests -v
```
**Results:** `16 passed in 2.18s`
- `test_health_check_endpoint` PASSED
- `test_list_jobs_with_matches` PASSED
- `test_job_search_filters` PASSED
- `test_deterministic_eligibility_endpoint` PASSED
- `test_skill_gaps_endpoint` PASSED
- `test_prep_plan_persistence_and_toggle` PASSED
- `test_saved_jobs_workflow` PASSED
- `test_agent_query_execution` PASSED
- `test_student_meets_all_mandatory_rules` PASSED
- `test_student_misses_cgpa_cutoff` PASSED
- `test_student_has_excessive_backlogs` PASSED
- `test_unknown_cgpa_and_unknown_branch` PASSED
- `test_match_score_does_not_override_failed_mandatory_eligibility` PASSED
- `test_matching_prefers_eligible_jobs` PASSED
- `test_prep_planner_generates_balanced_tasks` PASSED
- `test_skill_gap_analysis_separation` PASSED

```bash
# Run frontend production build
cd frontend && npm run build
```
**Results:** `✓ built in 5.03s` with 0 TypeScript/JSX errors.

---

## 8. Disclaimer & Synthetic Data Notice

All job listings, recruiter attributes, and test cases included in this prototype are synthetic demonstration records created for prototyping and testing during the Agent-X 2026 Hackathon. They do not represent active commercial vacancies or legal hiring commitments.
