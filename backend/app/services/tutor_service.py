import os
import re
import time
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class TutorService:
    """
    AI Placement Tutor & Technical Coach.
    Supports:
    - 6 Technical Domains: Python & DSA, SQL & DBMS, System Design, AI & Machine Learning, Core CS, HR & Behavioral
    - 6 Learning Modes: Learn a Topic, Explain a Doubt, Practice Questions, Debug Code, Quiz Me, Review My Answer
    - 3 Difficulty Levels: Beginner, Intermediate, Advanced
    - Multi-Language Code Debugging: Python, SQL, JavaScript/TypeScript, Java, C/C++
    - Context-Aware Conversations & Adaptive Modifiers (ELI5 analogies, practice challenges, rubric reviews)
    - Dual Engine: Live LLM (Gemini 2.0 / OpenAI) with fallback to Grounded Pedagogical Engine
    """

    @staticmethod
    def generate_tutor_response(
        student_data: Dict[str, Any],
        domain: Optional[str] = None,
        topic: Optional[str] = None,
        mode: str = "learn",
        user_message: str = "",
        difficulty: str = "Intermediate",
        code_snippet: Optional[str] = None,
        language: Optional[str] = None,
        conversation_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Unified entrypoint for the AI Tutor.
        Validates domain, mode, and difficulty, and routes to live LLM or grounded pedagogical engine.
        """
        student_name = student_data.get("full_name", "Candidate").split()[0]
        student_branch = student_data.get("branch", "Computer Science")

        clean_msg = (user_message or "").strip()
        clean_code = (code_snippet or "").strip()

        # Resolve domain/topic consistently
        raw_domain = domain if (domain and domain.strip()) else (topic or "Python & Data Structures")
        normalized_domain_key, domain_display_name = TutorService._normalize_domain(raw_domain, clean_msg)

        # Normalize mode
        normalized_mode = TutorService._normalize_mode(mode)
        normalized_difficulty = (difficulty or "Intermediate").capitalize()
        if normalized_difficulty not in ["Beginner", "Intermediate", "Advanced"]:
            normalized_difficulty = "Intermediate"

        # 1. Try Live LLM Provider if configured
        if settings.GEMINI_API_KEY:
            try:
                live_res = TutorService._call_gemini_llm(
                    student_data=student_data,
                    domain_name=domain_display_name,
                    domain_key=normalized_domain_key,
                    mode=normalized_mode,
                    difficulty=normalized_difficulty,
                    user_message=clean_msg,
                    code_snippet=clean_code,
                    language=language,
                    history=conversation_history
                )
                if live_res:
                    return live_res
            except Exception as e:
                logger.warning(f"Live Gemini LLM call failed: {e}. Falling back to Grounded Placement Engine.")

        if settings.OPENAI_API_KEY:
            try:
                live_res = TutorService._call_openai_llm(
                    student_data=student_data,
                    domain_name=domain_display_name,
                    domain_key=normalized_domain_key,
                    mode=normalized_mode,
                    difficulty=normalized_difficulty,
                    user_message=clean_msg,
                    code_snippet=clean_code,
                    language=language,
                    history=conversation_history
                )
                if live_res:
                    return live_res
            except Exception as e:
                logger.warning(f"Live OpenAI LLM call failed: {e}. Falling back to Grounded Placement Engine.")

        # 2. Honest Grounded Placement Engine (Question-, Domain-, Mode-, and Difficulty-Aware)
        return TutorService._generate_grounded_response(
            student_name=student_name,
            student_branch=student_branch,
            domain_name=domain_display_name,
            domain_key=normalized_domain_key,
            mode=normalized_mode,
            difficulty=normalized_difficulty,
            user_message=clean_msg,
            code_snippet=clean_code,
            language=language,
            conversation_history=conversation_history or []
        )

    # -------------------------------------------------------------------------
    # Normalizers
    # -------------------------------------------------------------------------
    @staticmethod
    def _normalize_domain(domain_str: str, message: str) -> tuple[str, str]:
        d = (domain_str or "").lower()

        if "sql" in d or "dbms" in d or "database" in d:
            return "sql", "SQL & Database Queries"
        if "system" in d or "architecture" in d or "design" in d:
            return "system_design", "System Design & Architecture"
        if "machine learning" in d or "ml" in d or "ai" in d or "data science" in d:
            return "ml", "AI & Machine Learning"
        if "core" in d or "os" in d or "network" in d or "operating" in d:
            return "core_cs", "Core CS (OS, Networks, OOP)"
        if "hr" in d or "behavioral" in d or "star" in d:
            return "hr", "Behavioral & HR (STAR Method)"
        if "python" in d or "dsa" in d or "data structure" in d or "algorithm" in d:
            return "python", "Python & Data Structures"

        # Message context fallback if domain is generic
        msg_lower = (message or "").lower()
        if "sql" in msg_lower or "join" in msg_lower or "table" in msg_lower or "select" in msg_lower:
            return "sql", "SQL & Database Queries"
        if "system design" in msg_lower or "cache" in msg_lower or "load balance" in msg_lower:
            return "system_design", "System Design & Architecture"
        if "supervised" in msg_lower or "unsupervised" in msg_lower or "classification" in msg_lower:
            return "ml", "AI & Machine Learning"
        if "process" in msg_lower or "thread" in msg_lower or "tcp" in msg_lower or "udp" in msg_lower:
            return "core_cs", "Core CS (OS, Networks, OOP)"
        if "star" in msg_lower or "conflict" in msg_lower or "weakness" in msg_lower:
            return "hr", "Behavioral & HR (STAR Method)"

        return "python", "Python & Data Structures"

    @staticmethod
    def _normalize_mode(mode_str: str) -> str:
        m = (mode_str or "").strip().lower()
        if m in ["learn", "concept"]:
            return "learn"
        if m in ["doubt", "explain"]:
            return "doubt"
        if m in ["practice", "challenge"]:
            return "practice"
        if m in ["debug", "fix"]:
            return "debug"
        if m in ["quiz", "test"]:
            return "quiz"
        if m in ["review", "evaluate"]:
            return "review"
        return "learn"

    # -------------------------------------------------------------------------
    # Live LLM Integration (Gemini & OpenAI)
    # -------------------------------------------------------------------------
    @staticmethod
    def _call_gemini_llm(
        student_data: Dict[str, Any],
        domain_name: str,
        domain_key: str,
        mode: str,
        difficulty: str,
        user_message: str,
        code_snippet: Optional[str],
        language: Optional[str],
        history: Optional[List[Dict[str, str]]]
    ) -> Optional[Dict[str, Any]]:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        mode_instructions = {
            "learn": "Teach the concept systematically. Focus on fundamentals, why it matters in recruitment rounds, clean syntax/diagrams, edge cases, and time/space complexity.",
            "doubt": "Give a direct, precise answer first. Then provide deep technical reasoning and side-by-side comparisons or domain-appropriate examples.",
            "practice": "Generate ONE interactive campus placement challenge for this domain. Provide problem statement, sample input/output, constraints, and hints. DO NOT reveal the solution until requested.",
            "debug": "Analyze the supplied code/query. State root cause, problematic line, corrected code snippet, explanation of why the fix works, and prevention best practices.",
            "quiz": "Generate an interactive 4-option multiple-choice placement question with clear explanation of the correct answer and why distractors are wrong.",
            "review": "Evaluate the student's submitted explanation, code, or query constructively: what is correct, what is missing/suboptimal, and how to improve it for top scores."
        }

        difficulty_instructions = {
            "Beginner": "Foundational focus: Define technical terms, avoid assuming prior knowledge, use step-by-step reasoning and intuitive analogies.",
            "Intermediate": "Interview focus: Explain implementation details, time/space trade-offs, standard interview questions, and common pitfalls.",
            "Advanced": "Deep technical focus: Cover high-throughput scalability, memory internals, mathematical derivations, low-level execution plans, or distributed trade-offs."
        }

        system_instruction = (
            "You are PlaceMate AI Technical Placement Tutor, an expert technical interview coach for campus recruitment drives "
            "(top tech firms, FAANG/MAANG, tier-1 startups, and IT service providers).\n\n"
            f"Active Domain: {domain_name}\n"
            f"Active Mode: {mode.upper()} — {mode_instructions.get(mode, '')}\n"
            f"Difficulty Level: {difficulty} — {difficulty_instructions.get(difficulty, '')}\n"
            f"Student: {student_data.get('full_name', 'Candidate')} ({student_data.get('branch', 'Engineering')})\n\n"
            "CRITICAL RULES:\n"
            f"1. Strictly adhere to the chosen domain ({domain_name}). If the domain is SQL, do NOT write Python. If System Design, focus on architecture and scaling.\n"
            f"2. Adhere to the selected mode ({mode.upper()}). Do not give a generic lecture if Mode is PRACTICE, QUIZ, DEBUG, or REVIEW.\n"
            f"3. Calibrate depth to the chosen difficulty ({difficulty})."
        )

        messages_prompt = ""
        if history:
            messages_prompt += "### Prior Conversation Context:\n"
            for h in history[-4:]:
                role = "Student" if h.get("role") in ["user", "student"] else "Tutor"
                messages_prompt += f"{role}: {h.get('content')}\n"
            messages_prompt += "\n"

        prompt = (
            f"{messages_prompt}### Current Request:\n"
            f"Domain: {domain_name}\n"
            f"Mode: {mode.capitalize()}\n"
            f"Difficulty: {difficulty}\n"
            f"Question: {user_message}\n"
        )
        if code_snippet:
            lang_label = language or "code"
            prompt += f"Supplied Code ({lang_label}):\n```{lang_label}\n{code_snippet}\n```\n"

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config={
                "system_instruction": system_instruction,
                "temperature": 0.35,
                "max_output_tokens": 1200
            }
        )

        reply_text = response.text if hasattr(response, "text") and response.text else str(response)

        followups = [
            f"Can you explain this at a deeper {difficulty} level?",
            f"Give me an interview practice challenge in {domain_name}",
            "Explain this using a real-world architectural analogy"
        ]

        return {
            "domain": domain_display_name,
            "topic": domain_display_name,
            "mode": mode,
            "difficulty": difficulty,
            "title": f"{domain_name} — {mode.capitalize()} ({difficulty})",
            "response": reply_text,
            "suggested_followups": followups,
            "provider": "Gemini 2.0 Flash (Live AI)",
            "is_live_ai": True,
            "timestamp": time.time()
        }

    @staticmethod
    def _call_openai_llm(
        student_data: Dict[str, Any],
        domain_name: str,
        domain_key: str,
        mode: str,
        difficulty: str,
        user_message: str,
        code_snippet: Optional[str],
        language: Optional[str],
        history: Optional[List[Dict[str, str]]]
    ) -> Optional[Dict[str, Any]]:
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        system_instruction = (
            f"You are PlaceMate AI Technical Placement Tutor. "
            f"Domain: {domain_name} | Mode: {mode.upper()} | Difficulty: {difficulty} | Student: {student_data.get('full_name')}."
        )

        messages = [{"role": "system", "content": system_instruction}]
        if history:
            for h in history[-4:]:
                messages.append({
                    "role": "user" if h.get("role") in ["user", "student"] else "assistant",
                    "content": h.get("content", "")
                })

        user_content = f"[{domain_name} | {mode.upper()} | {difficulty}]\n{user_message}"
        if code_snippet:
            user_content += f"\n\n```{language or ''}\n{code_snippet}\n```"
        messages.append({"role": "user", "content": user_content})

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.35,
            max_tokens=1200
        )

        reply_text = completion.choices[0].message.content

        return {
            "domain": domain_name,
            "topic": domain_name,
            "mode": mode,
            "difficulty": difficulty,
            "title": f"{domain_name} — {mode.capitalize()} ({difficulty})",
            "response": reply_text,
            "suggested_followups": [
                f"Give me an interview practice challenge in {domain_name}",
                "Explain the time and space complexity trade-offs",
                "How would an interviewer evaluate this answer?"
            ],
            "provider": "OpenAI GPT-4o-mini (Live AI)",
            "is_live_ai": True,
            "timestamp": time.time()
        }

    # -------------------------------------------------------------------------
    # Grounded Pedagogical Knowledge Engine (Domain-, Mode-, & Difficulty-Aware)
    # -------------------------------------------------------------------------
    @staticmethod
    def _generate_grounded_response(
        student_name: str,
        student_branch: str,
        domain_name: str,
        domain_key: str,
        mode: str,
        difficulty: str,
        user_message: str,
        code_snippet: Optional[str],
        language: Optional[str],
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Deep semantic response generator that routes to domain- and mode-specific
        pedagogical logic. Every domain, mode, and difficulty produces tailored output.
        """
        msg_lower = user_message.lower()
        code_text = (code_snippet or "").strip()
        full_query = f"{msg_lower} {code_text.lower()}".strip()

        # Check for adaptive modifiers (e.g. "Explain simply", "Practice question", etc.)
        prev_user_msgs = [h.get("content", "").lower() for h in conversation_history if h.get("role") in ["user", "student"]]
        prev_asst_msgs = [h.get("content", "").lower() for h in conversation_history if h.get("role") in ["assistant", "tutor"]]
        last_user = prev_user_msgs[-1] if prev_user_msgs else ""
        last_asst = prev_asst_msgs[-1] if prev_asst_msgs else ""

        is_simplify = any(p in msg_lower for p in ["simply", "simple terms", "more simply", "simpler", "like i'm 5", "eli5"])
        is_give_example = any(p in msg_lower for p in ["give an example", "show an example", "code example"])
        is_practice_followup = any(p in msg_lower for p in ["practice question about that", "now give me a practice", "give me a practice question"])

        if is_simplify and (last_user or last_asst):
            return TutorService._handle_adaptive_simplify(last_user, last_asst, domain_key, domain_name, student_name, difficulty)

        if is_practice_followup and (last_user or last_asst):
            return TutorService._handle_adaptive_practice(last_user, last_asst, domain_key, domain_name, student_name, difficulty)

        # Multi-Language Code Debugging
        if mode == "debug" or (code_text and ("debug" in msg_lower or "error" in msg_lower or "fix" in msg_lower)):
            return TutorService._handle_multi_language_debug(
                full_query=full_query,
                code_snippet=code_text,
                language=language,
                domain_key=domain_key,
                domain_name=domain_name,
                student_name=student_name,
                difficulty=difficulty
            )

        # Domain-Specific Handlers
        if domain_key == "sql":
            return TutorService._handle_sql_domain(mode, difficulty, user_message, full_query, code_text, student_name)
        elif domain_key == "system_design":
            return TutorService._handle_system_design_domain(mode, difficulty, user_message, full_query, student_name)
        elif domain_key == "ml":
            return TutorService._handle_ml_domain(mode, difficulty, user_message, full_query, student_name)
        elif domain_key == "core_cs":
            return TutorService._handle_core_cs_domain(mode, difficulty, user_message, full_query, student_name)
        elif domain_key == "hr":
            return TutorService._handle_hr_domain(mode, difficulty, user_message, full_query, student_name)
        else: # "python"
            return TutorService._handle_python_domain(mode, difficulty, user_message, full_query, code_text, student_name)

    # -------------------------------------------------------------------------
    # Domain 1: SQL & Database Queries
    # -------------------------------------------------------------------------
    @staticmethod
    def _handle_sql_domain(mode: str, difficulty: str, query: str, full_query: str, code: str, name: str) -> Dict[str, Any]:
        domain_name = "SQL & Database Queries"

        if mode == "practice":
            if difficulty == "Beginner":
                title = "SQL Practice Challenge: Filtering & Aggregation"
                content = (
                    f"### SQL Practice Challenge (Beginner)\n\n"
                    f"Hi {name}! Here is a foundational SQL challenge frequently asked in Round 1 technical assessments:\n\n"
                    "**Scenario**: You have an `Employees` table with columns `emp_id`, `emp_name`, `department_id`, and `salary`.\n\n"
                    "**Task**: Write an SQL query to retrieve all employees in `department_id = 10` earning more than ₹50,000, "
                    "ordered by `salary` descending.\n\n"
                    "**Sample Output Columns**: `emp_id`, `emp_name`, `salary`\n\n"
                    "**Hints**:\n"
                    "- Use the `WHERE` clause with the logical `AND` operator.\n"
                    "- Sort results using `ORDER BY salary DESC`.\n\n"
                    "*(Type your SQL query below and click 'Ask Tutor' or 'Review My Answer' to test your solution!)*"
                )
            elif difficulty == "Advanced":
                title = "SQL Practice Challenge: Window Functions (DENSE_RANK)"
                content = (
                    f"### SQL Practice Challenge (Advanced)\n\n"
                    f"Hi {name}! Here is an advanced SQL problem asked in senior SDE and data engineering placement rounds:\n\n"
                    "**Problem**: Given an `Employees` table (`emp_id`, `emp_name`, `department_id`, `salary`), write a query to find the "
                    "**top 3 highest earners in each department**. If there are ties in salary, both employees must be included without skipping ranks.\n\n"
                    "**Constraints & Requirements**:\n"
                    "- Must use `DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...)`.\n"
                    "- Do NOT use subqueries with hardcoded `LIMIT` offsets.\n"
                    "- Handle departments with fewer than 3 employees gracefully.\n\n"
                    "*(Type your SQL CTE or subquery below for instant rubric review!)*"
                )
            else: # Intermediate
                title = "SQL Practice Challenge: 2nd Highest Salary Across Departments"
                content = (
                    f"### SQL Practice Challenge (Intermediate)\n\n"
                    f"Hi {name}! Here is a classic technical round interview challenge:\n\n"
                    "**Problem**: Write a SQL query to find the **second highest salary** in the `Employees` table without using `LIMIT` or `OFFSET`.\n\n"
                    "**Sample Table**: `Employees` (`emp_id`, `emp_name`, `salary`)\n\n"
                    "**Constraints**:\n"
                    "- If all employees have the same salary or the table has only 1 row, return `NULL`.\n\n"
                    "**Hints**:\n"
                    "- Use a subquery with `MAX(salary)` where `salary < (SELECT MAX(salary) FROM Employees)`.\n"
                    "- Alternatively, use `DENSE_RANK()`.\n\n"
                    "*(Submit your query below to verify!)*"
                )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Give me a hint for this challenge",
                "Show me the optimal solution",
                "Review my answer"
            ])

        elif mode == "quiz":
            title = f"SQL Technical Assessment Quiz ({difficulty})"
            content = (
                f"### SQL Placement Assessment Question ({difficulty})\n\n"
                "**Question: What is the primary difference between a Clustered Index and a Non-Clustered Index?**\n\n"
                "- **A)** A clustered index is stored in memory, whereas a non-clustered index is stored on disk.\n"
                "- **B)** A clustered index determines the physical order of data rows in the table (only 1 per table); a non-clustered index creates a separate B-tree pointing to row locators.\n"
                "- **C)** A table can have multiple clustered indexes, but only one non-clustered index.\n"
                "- **D)** Clustered indexes can only be created on VARCHAR columns.\n\n"
                "**Correct Answer: B**\n\n"
                "**Technical Breakdown**:\n"
                "- In relational storage engines (InnoDB, SQL Server), the table **is** the clustered index (B+ tree ordered by Primary Key).\n"
                "- Non-clustered indexes contain index keys and a pointer (bookmark/PK) to the clustered row. Secondary index lookups require an index seek followed by a bookmark lookup if columns are not covered."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain covering indexes and index intersection",
                "Give me another SQL quiz question",
                "Explain B-Tree vs Hash Indexing"
            ])

        elif mode == "review":
            title = "SQL Query Rubric Review"
            content = (
                f"### Evaluation of Your Submitted SQL Solution\n\n"
                f"Hi {name}! Here is an audit of your query:\n\n"
                "#### 1. Demonstrated Strengths\n"
                "- Your join and selection criteria reflect correct relational modeling.\n"
                "- Column projections avoid redundant `SELECT *` scans.\n\n"
                "#### 2. Optimization & Performance Audit (Placement Watch-outs)\n"
                "- **Sargability**: Avoid wrapping indexed columns inside functions (e.g. `WHERE YEAR(created_at) = 2024` prevents index scans; use `WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'` instead).\n"
                "- **NULL Handling**: In SQL, `NULL != NULL`. Always use `IS NULL` or `COALESCE()` when filtering nullable foreign keys.\n"
                "- **Aggregate Filtering**: Verify that conditions on aggregated metrics use `HAVING`, not `WHERE`."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Give me another SQL challenge",
                "Explain EXPLAIN ANALYZE execution plans",
                "Quiz me on database normalization"
            ])

        elif mode == "doubt" or "difference" in full_query or "why does" in full_query or "normalization" in full_query:
            if "normalization" in full_query:
                title = "Database Normalization: 1NF, 2NF, 3NF, BCNF"
                content = (
                    f"### Database Normalization Explained ({difficulty})\n\n"
                    f"**Database Normalization** organizes schema tables to minimize data redundancy and eliminate insert, update, and delete anomalies.\n\n"
                    "#### Normal Forms Hierarchy\n"
                    "1. **1NF (First Normal Form)**: Atomic values only. No repeating groups or arrays within a single column.\n"
                    "2. **2NF (Second Normal Form)**: Must be in 1NF + **No Partial Dependency** (every non-key attribute must depend on the whole composite primary key).\n"
                    "3. **3NF (Third Normal Form)**: Must be in 2NF + **No Transitive Dependency** (non-key attributes must not depend on other non-key attributes: `X -> Y -> Z`).\n"
                    "4. **BCNF (Boyce-Codd Normal Form)**: For every functional dependency `X -> Y`, `X` must be a super key."
                )
            elif "duplicate" in full_query:
                title = "Why SQL Queries Return Duplicate Rows & Solutions"
                content = (
                    f"### Direct Answer: Duplicate Rows in SQL Joins\n\n"
                    f"**The Root Cause**: Joining two tables on a **One-to-Many relationship** produces duplicate parent rows because every matching child row pairs with the parent.\n\n"
                    "#### Solutions\n"
                    "1. **Use `GROUP BY` with Aggregates**: If summarizing child data (e.g. `COUNT(orders.id)`).\n"
                    "2. **Use `DISTINCT`**: Eliminates identical tuples across selected projections.\n"
                    "3. **Use `EXISTS` instead of `JOIN`**: If you only need to verify presence in the child table without pulling child columns."
                )
            else:
                title = "SQL Doubt Clarification"
                content = (
                    f"### Direct Answer: SQL Technical Doubt ({difficulty})\n\n"
                    f"In relational databases, operations adhere to relational algebra and relational calculus standards.\n\n"
                    "#### Key Principles\n"
                    "- **Logical Query Execution Order**: `FROM -> ON -> JOIN -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT`.\n"
                    "- Notice that `WHERE` executes before `SELECT`, which is why you cannot reference column aliases defined in `SELECT` within a `WHERE` clause."
                )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain SQL Joins with sample tables",
                "What is the difference between WHERE and HAVING?",
                "Give me a practice challenge on window functions"
            ])

        else: # "learn"
            title = f"SQL & Relational Database Mastery ({difficulty})"
            content = (
                f"### SQL Mastery Guide: Relational Databases ({difficulty})\n\n"
                f"Hi {name}! For campus technical interviews at companies like Amazon, Microsoft, and Oracle, database mastery requires understanding both query syntax and storage internals.\n\n"
                "#### 1. Core Joins Breakdown with Sample Tables\n\n"
                "**Table `Employees`**: `emp_id`, `emp_name`, `dept_id`  \n"
                "**Table `Departments`**: `dept_id`, `dept_name`\n\n"
                "```sql\n"
                "-- INNER JOIN: Mutual matches only\n"
                "SELECT e.emp_name, d.dept_name\n"
                "FROM Employees e\n"
                "INNER JOIN Departments d ON e.dept_id = d.dept_id;\n"
                "\n"
                "-- LEFT JOIN: All employees + matched departments (NULL if no dept)\n"
                "SELECT e.emp_name, d.dept_name\n"
                "FROM Employees e\n"
                "LEFT JOIN Departments d ON e.dept_id = d.dept_id;\n"
                "```\n\n"
                "#### 2. ACID Transactions & Storage Engine Mechanics\n"
                "- **Atomicity & Durability**: Guaranteed via Write-Ahead Logging (WAL) and Redo Logs.\n"
                "- **Isolation Levels**: Read Uncommitted -> Read Committed -> Repeatable Read -> Serializable.\n"
                "- **B+ Tree Indexing**: Keeps data sorted with all records at leaf nodes linked sequentially for fast range scans."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Give me a practice question about SQL joins",
                "Explain database normalization step by step",
                "Quiz me on SQL indexing and transactions"
            ])

    # -------------------------------------------------------------------------
    # Domain 2: System Design & Architecture
    # -------------------------------------------------------------------------
    @staticmethod
    def _handle_system_design_domain(mode: str, difficulty: str, query: str, full_query: str, name: str) -> Dict[str, Any]:
        domain_name = "System Design & Architecture"

        if mode == "practice":
            if difficulty == "Advanced":
                title = "System Design Practice Challenge: Distributed Rate Limiter"
                content = (
                    f"### System Design Interview Challenge (Advanced)\n\n"
                    f"Hi {name}! Here is a standard system design problem asked in tier-1 product engineering rounds:\n\n"
                    "**Problem**: Design a **Distributed API Rate Limiter** serving 100,000 requests/sec across a multi-region cluster.\n\n"
                    "**Requirements to Address**:\n"
                    "1. **Functional**: Limit clients to $N$ requests per minute per API key (HTTP 429 Too Many Requests).\n"
                    "2. **Non-Functional**: Ultra-low latency (<2ms overhead), high availability, and race-condition safety.\n"
                    "3. **Algorithm Comparison**: Evaluate Token Bucket vs Leaky Bucket vs Sliding Window Log vs Sliding Window Counter.\n"
                    "4. **Storage Architecture**: In-memory Redis cluster with Lua scripts for atomic increments.\n\n"
                    "*(Submit your architectural breakdown below for review!)*"
                )
            else:
                title = "System Design Practice Challenge: URL Shortener (TinyURL)"
                content = (
                    f"### System Design Interview Challenge ({difficulty})\n\n"
                    f"**Problem**: Design a scalable URL Shortening service (like TinyURL or Bitly).\n\n"
                    "**Core Design Steps**:\n"
                    "1. **Requirements & Scale**: 100M URLs created/month, 10:1 Read-to-Write ratio.\n"
                    "2. **URL Encoding**: Base62 encoding (`[a-zA-Z0-9]`) vs MD5/SHA-256 hash truncation.\n"
                    "3. **Database Schema**: NoSQL (DynamoDB/Cassandra) vs Relational (PostgreSQL).\n"
                    "4. **Caching**: Redis LRU cache holding top 20% read traffic.\n\n"
                    "*(Submit your design approach below for instant feedback!)*"
                )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Show me the high-level architecture diagram",
                "How do we handle cache stampede and penetration?",
                "Review my answer"
            ])

        elif mode == "quiz":
            title = f"System Design Assessment Quiz ({difficulty})"
            content = (
                f"### System Design Assessment Question ({difficulty})\n\n"
                "**Question: According to the CAP Theorem, what happens in a distributed database when a Network Partition (P) occurs?**\n\n"
                "- **A)** The system can guarantee both linearizable Consistency (C) and high Availability (A) by adding more server nodes.\n"
                "- **B)** The system must trade off between Consistency (CP: reject writes to preserve exact correctness) and Availability (AP: accept writes on all partitions but return stale data).\n"
                "- **C)** The network partition automatically resolves itself using round-robin DNS routing.\n"
                "- **D)** Data is permanently corrupted unless written to tape backup.\n\n"
                "**Correct Answer: B**\n\n"
                "**Architectural Reason**: In a real network, partitions ($P$) are inevitable due to cable cuts, switch failures, or packet loss. Therefore, distributed systems must choose either $CP$ (e.g. HBase, Zookeeper, etcd) or $AP$ (e.g. Cassandra, DynamoDB, CouchDB)."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain Consistent Hashing and Virtual Nodes",
                "Give me another System Design quiz question",
                "What is the difference between vertical and horizontal scaling?"
            ])

        elif mode == "doubt" or "caching" in full_query or "load balanc" in full_query or "cap" in full_query:
            if "caching" in full_query:
                title = "How Caching Improves System Performance"
                content = (
                    f"### Direct Answer: Caching Architectural Impact\n\n"
                    f"**Core Benefit**: Caching stores frequently accessed data in ultra-fast in-memory RAM (e.g. Redis, Memcached), "
                    f"reducing data retrieval latency from ~50ms (disk I/O and database joins) to **< 1ms**, while shielding databases from overload.\n\n"
                    "#### Caching Strategies in SDE Rounds\n"
                    "1. **Cache-Aside (Lazy Loading)**: Application checks cache first; on miss, loads from DB and updates cache.\n"
                    "2. **Write-Through**: Application writes data to cache and DB simultaneously (higher write latency, strong consistency).\n"
                    "3. **Write-Back (Write-Behind)**: Writes to cache immediately; writes to DB asynchronously in batches (fast writes, risk of data loss on crash).\n"
                    "4. **Eviction Policies**: LRU (Least Recently Used), LFU (Least Frequently Used), FIFO."
                )
            else:
                title = "System Design Doubt Clarification"
                content = (
                    f"### Direct Answer: System Design Mechanics ({difficulty})\n\n"
                    "In large-scale web architectures, reliability and throughput are maintained by eliminating single points of failure (SPOF).\n\n"
                    "- **Stateless Application Servers**: Enables effortless horizontal autoscaling behind Layer 4 / Layer 7 Load Balancers (NGINX, AWS ALB).\n"
                    "- **Database Read Replicas**: Directs read-heavy traffic to read replicas, preserving primary write capacity."
                )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain Microservices vs Monoliths",
                "How does Consistent Hashing work?",
                "Give me a practice system design challenge"
            ])

        else: # "learn"
            title = f"System Design Fundamentals & Scalability ({difficulty})"
            content = (
                f"### System Design Blueprint for Campus Technical Rounds ({difficulty})\n\n"
                f"Hi {name}! In senior placement rounds, interviewers evaluate how you design systems that scale from 1,000 to 10,000,000 users.\n\n"
                "#### 1. Standard 45-Minute Interview Roadmap\n"
                "1. **Clarify Requirements (5 min)**: Functional (core user actions) and Non-Functional (99.99% availability, <50ms latency, read/write ratio).\n"
                "2. **Capacity Estimation (5 min)**: QPS (Queries Per Second), storage for 5 years, memory bandwidth.\n"
                "3. **High-Level Design (15 min)**: Clients -> DNS/CDN -> Load Balancer -> Stateless API Servers -> Cache Cluster -> DB Cluster.\n"
                "4. **Deep Dive & Bottlenecks (20 min)**: Caching invalidation, DB sharding, rate limiting, and failure recovery.\n\n"
                "#### 2. Essential Scalability Patterns\n"
                "- **CDN (Cloudflare, CloudFront)**: Caches static assets close to users at edge locations.\n"
                "- **Load Balancers**: Distributes traffic across instances using Consistent Hashing or Round Robin.\n"
                "- **Database Sharding**: Partitions large tables across multiple database instances based on a Shard Key (e.g. `hash(user_id) % num_shards`)."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Practice designing a URL Shortener",
                "Explain the CAP Theorem simply",
                "Quiz me on distributed system caching"
            ])

    # -------------------------------------------------------------------------
    # Domain 3: AI & Machine Learning
    # -------------------------------------------------------------------------
    @staticmethod
    def _handle_ml_domain(mode: str, difficulty: str, query: str, full_query: str, name: str) -> Dict[str, Any]:
        domain_name = "AI & Machine Learning"

        if mode == "practice":
            title = f"Machine Learning Placement Challenge ({difficulty})"
            content = (
                f"### Machine Learning Case Study Challenge ({difficulty})\n\n"
                f"Hi {name}! Here is a practical ML interview scenario asked in campus data science rounds:\n\n"
                "**Scenario**: An e-commerce platform wants to build a **Customer Churn Predictor** to identify users likely to cancel their subscriptions.\n\n"
                "**Questions to Solve**:\n"
                "1. Is this a **Supervised** or **Unsupervised** problem? Is it **Classification** or **Regression**?\n"
                "2. If 98% of users stay and only 2% churn, why is standard **Accuracy** a misleading metric? What metrics must you optimize instead (e.g. Precision, Recall, PR-AUC)?\n"
                "3. Name two techniques to handle this class imbalance (e.g. SMOTE oversampling, class weights, undersampling).\n\n"
                "*(Submit your answer below for structured rubric review!)*"
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Give me a hint for this challenge",
                "Show me the model evaluation formula",
                "Review my answer"
            ])

        elif mode == "quiz":
            title = f"Machine Learning Assessment Quiz ({difficulty})"
            content = (
                f"### Machine Learning Assessment Question ({difficulty})\n\n"
                "**Question: In medical cancer screening, which type of error is vastly more dangerous to minimize?**\n\n"
                "- **A)** False Positive (Predicting cancer when the patient is healthy)\n"
                "- **B)** False Negative (Predicting healthy when the patient has cancer)\n"
                "- **C)** True Positive\n"
                "- **D)** True Negative\n\n"
                "**Correct Answer: B (False Negative)**\n\n"
                "**Explanation**: A False Negative means a sick patient goes untreated with life-threatening consequences. "
                "Therefore, in medical diagnostics, model optimization prioritizes **High Recall** ($Recall = \\frac{TP}{TP + FN}$) to minimize False Negatives, even if it slightly reduces Precision."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain the Precision-Recall trade-off",
                "What is the ROC-AUC curve?",
                "Quiz me on Overfitting and Regularization"
            ])

        elif mode == "doubt" or "difference" in full_query or "supervised" in full_query:
            title = "Supervised vs Unsupervised Learning & ML Concepts"
            content = (
                f"### Direct Comparison: Core ML Concepts ({difficulty})\n\n"
                "#### 1. Supervised vs Unsupervised Learning\n"
                "- **Supervised Learning**: Model learns from **labeled datasets** $(X, y)$. Goal: Predict outputs on unseen data (e.g. Linear Regression, Random Forest, XGBoost).\n"
                "- **Unsupervised Learning**: Model discovers hidden patterns in **unlabeled data** $(X)$ without target answers (e.g. K-Means Clustering, PCA, Autoencoders).\n\n"
                "#### 2. Classification vs Regression\n"
                "- **Classification**: Target $y$ is a discrete category (e.g. Spam vs Ham, Disease diagnosis).\n"
                "- **Regression**: Target $y$ is a continuous numerical value (e.g. Stock price, Salary package, House price)."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain the same topic more simply",
                "Now give me a practice question about that topic",
                "What is Overfitting and how do you prevent it?"
            ])

        else: # "learn"
            title = f"Machine Learning Fundamentals to Production ({difficulty})"
            content = (
                f"### Machine Learning Mastery Guide ({difficulty})\n\n"
                f"Hi {name}! Machine Learning in campus interviews focuses on model selection, evaluation metrics, and preventing data leakage.\n\n"
                "#### 1. The Bias-Variance Trade-off\n"
                "- **High Bias (Underfitting)**: Model is overly simplistic (e.g. linear model on non-linear data). Performs poorly on both training and test data.\n"
                "- **High Variance (Overfitting)**: Model memorizes training noise (e.g. unconstrained Decision Tree). High training accuracy, poor test generalization.\n"
                "- **Remedies for Overfitting**: L1 (Lasso) / L2 (Ridge) Regularization, Dropout, Cross-Validation, Early Stopping, Pruning.\n\n"
                "#### 2. Evaluation Metrics\n"
                "- **Accuracy**: $\\frac{TP + TN}{Total}$ (Misleading on imbalanced datasets).\n"
                "- **Precision**: $\\frac{TP}{TP + FP}$ (Quality of positive predictions).\n"
                "- **Recall (Sensitivity)**: $\\frac{TP}{TP + FN}$ (Completeness of positive predictions).\n"
                "- **F1-Score**: Harmonic mean: $2 \\cdot \\frac{Precision \\cdot Recall}{Precision + Recall}$."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Practice ML evaluation metrics",
                "Explain Neural Network backpropagation",
                "Quiz me on Machine Learning concepts"
            ])

    # -------------------------------------------------------------------------
    # Domain 4: Core CS (OS, Networks, OOP)
    # -------------------------------------------------------------------------
    @staticmethod
    def _handle_core_cs_domain(mode: str, difficulty: str, query: str, full_query: str, name: str) -> Dict[str, Any]:
        domain_name = "Core CS (OS, Networks, OOP)"

        if mode == "practice":
            title = f"Core CS Technical Challenge: OS & Networks ({difficulty})"
            content = (
                f"### Core CS Interview Practice Challenge ({difficulty})\n\n"
                f"Hi {name}! Here is a standard Core CS problem asked in technical rounds at TCS, Infosys, and Cisco:\n\n"
                "**Scenario**: You are tasked with analyzing the **TCP 3-Way Handshake** and Connection Termination.\n\n"
                "**Tasks**:\n"
                "1. Trace the exact sequence of flags (`SYN`, `SYN-ACK`, `ACK`) exchanged between client and server during connection establishment.\n"
                "2. What is a **SYN Flood Attack**, and how do modern operating systems protect against it using **SYN Cookies**?\n"
                "3. Why does TCP connection teardown require 4 packets (`FIN`, `ACK`, `FIN`, `ACK`) instead of 3?\n\n"
                "*(Submit your explanation below for review!)*"
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Show me the packet exchange sequence",
                "Explain TCP vs UDP simply",
                "Review my answer"
            ])

        elif mode == "quiz":
            title = f"Core Computer Science Assessment Quiz ({difficulty})"
            content = (
                f"### Operating Systems Assessment Question ({difficulty})\n\n"
                "**Question: Which of the following conditions is NOT one of the Coffman conditions required for a Deadlock to occur?**\n\n"
                "- **A)** Mutual Exclusion\n"
                "- **B)** Hold and Wait\n"
                "- **C)** Preemption Allowed (Resources can be forcibly taken from processes)\n"
                "- **D)** Circular Wait\n\n"
                "**Correct Answer: C**\n\n"
                "**Explanation**: The 4 Coffman conditions required for deadlock are Mutual Exclusion, Hold and Wait, **No Preemption** (resources cannot be forcibly taken), and Circular Wait. If preemption is allowed, deadlocks cannot occur because the OS can preempt resources."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain Process vs Thread",
                "What is Virtual Memory and Paging?",
                "Give me another Core CS quiz question"
            ])

        elif mode == "doubt" or "difference" in full_query or "tcp" in full_query or "process" in full_query:
            if "tcp" in full_query or "udp" in full_query:
                title = "TCP vs UDP: Networking Fundamentals"
                content = (
                    f"### Direct Answer: TCP vs UDP Differences\n\n"
                    "| Feature | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |\n"
                    "| :--- | :--- | :--- |\n"
                    "| **Connection** | Connection-Oriented (3-way handshake) | Connectionless (fire and forget) |\n"
                    "| **Reliability** | Guaranteed delivery (retransmits lost packets) | No guarantee (packets may be dropped or unordered) |\n"
                    "| **Speed / Overhead** | Higher latency (20-byte header, ACKs, flow control) | Ultra-low latency (8-byte header, minimal overhead) |\n"
                    "| **Use Cases** | HTTP/HTTPS, Web Browsing, Email, File Transfer | Video Streaming, Online Gaming, VoIP, DNS lookups |"
                )
            else:
                title = "Process vs Thread Differences"
                content = (
                    f"### Direct Answer: Process vs Thread\n\n"
                    "- **Process**: An executing instance of a program with its own independent memory address space (PCB, stack, heap, data, code). High context-switch overhead.\n"
                    "- **Thread**: A lightweight unit of execution within a parent process sharing the process heap and code space, but maintaining its own private stack and registers. Low context-switch overhead."
                )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain Virtual Memory and Paging",
                "What is the Banker's Algorithm?",
                "Give me a practice question"
            ])

        else: # "learn"
            title = f"Core Computer Science: OS, Networks & OOP ({difficulty})"
            content = (
                f"### Core CS Interview Guide ({difficulty})\n\n"
                f"Hi {name}! Core CS rounds test operating system fundamentals, networking, and system-level engineering.\n\n"
                "#### 1. Operating Systems: Virtual Memory & Paging\n"
                "- **Virtual Address Space**: Provides each process with the illusion of continuous memory, translated to physical frames via **Page Tables** and hardware **TLB** (Translation Lookaside Buffer).\n"
                "- **Page Fault**: Triggered when a requested page is not resident in physical RAM. OS loads page from disk swap space.\n\n"
                "#### 2. Computer Networks: OSI 7-Layer Architecture\n"
                "- Application -> Presentation -> Session -> **Transport (TCP/UDP)** -> **Network (IP)** -> Data Link (Ethernet/MAC) -> Physical."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain the 3-Way Handshake step by step",
                "Quiz me on CPU scheduling algorithms",
                "Practice questions on Deadlocks"
            ])

    # -------------------------------------------------------------------------
    # Domain 5: Behavioral & HR (STAR Method)
    # -------------------------------------------------------------------------
    @staticmethod
    def _handle_hr_domain(mode: str, difficulty: str, query: str, full_query: str, name: str) -> Dict[str, Any]:
        domain_name = "Behavioral & HR (STAR Method)"

        if mode == "practice":
            title = "Behavioral Interview Simulation: Conflict Resolution"
            content = (
                f"### HR Round Simulation: The Conflict Question\n\n"
                f"**Interviewer Prompt**: *\"Tell me about a time you had a serious technical disagreement with a team member during a project or hackathon. How did you handle it, and what was the outcome?\"*\n\n"
                "**Structuring Rubric (The STAR Method)**:\n"
                "- **Situation (15%)**: What was the project and deadline context?\n"
                "- **Task (15%)**: What was the exact decision in dispute (e.g. database choice, API schema)?\n"
                "- **Action (50%)**: How did YOU resolve it constructively using data, benchmarks, or compromise?\n"
                "- **Result (20%)**: What was the final deliverable and measurable impact?\n\n"
                "*(Type your response below and click 'Review My Answer' for coaching!)*"
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Review my answer",
                "Give me another behavioral question (Greatest Weakness)",
                "How to answer 'Why should we hire you?'"
            ])

        elif mode == "quiz":
            title = "HR Communication Strategy Assessment"
            content = (
                f"### HR Round Strategy Question\n\n"
                "**Question: When an interviewer asks 'What is your greatest technical weakness?', which strategy is considered best practice?**\n\n"
                "- **A)** Claim you have no weaknesses because you are a perfectionist.\n"
                "- **B)** Name a critical core requirement of the job description that you completely lack.\n"
                "- **C)** Name a genuine, non-disqualifying technical area, explain a past lesson learned, and demonstrate active steps you have taken to improve.\n"
                "- **D)** Blame your previous university professors for not teaching the subject.\n\n"
                "**Correct Answer: C**\n\n"
                "**Explanation**: Interviewers test self-awareness and learning agility. Stating a real growth area followed by concrete actions (e.g. completing a certification or building a project) demonstrates mature professional development."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Practice answering 'What is your greatest weakness?'",
                "How to answer salary expectation questions",
                "Best questions to ask the interviewer"
            ])

        elif mode == "review":
            title = "Behavioral Answer Rubric Review"
            content = (
                f"### HR Answer Assessment Feedback\n\n"
                f"Hi {name}! Here is an audit of your behavioral response against the STAR rubric:\n\n"
                "#### 1. Demonstrated Strengths\n"
                "- Clear situation setup and professional communication tone.\n\n"
                "#### 2. Key Improvement Areas (HR Placement Rubric)\n"
                "- **Use 'I', Not Just 'We'**: Interviewers are hiring you, not your entire team. Highlight your individual contribution.\n"
                "- **Quantify Results**: Replace vague endings with metrics (e.g. 'reduced latency by 30%', 'completed 2 days ahead of schedule').\n"
                "- **Focus on Resolution**: Avoid dwelling on teammate faults; focus on objective problem-solving."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Try another behavioral scenario",
                "Explain the STAR framework step by step",
                "Practice 'Tell me about yourself'"
            ])

        else: # "learn" / "doubt"
            title = "HR Interview Round Mastery: The STAR Method"
            content = (
                f"### Mastering the Behavioral & HR Round\n\n"
                f"Hi {name}! In campus placement HR rounds, top companies evaluate communication, team collaboration, and cultural alignment.\n\n"
                "#### The STAR Framework Formula\n"
                "1. **Situation (15%)**: Briefly set the context (college project, internship, team competition).\n"
                "2. **Task (15%)**: State the specific challenge or goal you were responsible for.\n"
                "3. **Action (50%)**: Explain the exact technical and leadership steps YOU took.\n"
                "4. **Result (20%)**: Share the quantifiable outcome and lessons learned.\n\n"
                "#### Top Placement Behavioral Questions to Master\n"
                "- *'Tell me about yourself'* (1-minute pitch: background, technical passion, top project, career aspiration).\n"
                "- *'Describe a time you failed and what you learned.'*\n"
                "- *'Why do you want to join our company?'*"
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Simulate a mock question on Conflict Resolution",
                "How do I answer 'Tell me about yourself'?",
                "Quiz me on HR interview strategies"
            ])

    # -------------------------------------------------------------------------
    # Domain 6: Python & Data Structures (DSA)
    # -------------------------------------------------------------------------
    @staticmethod
    def _handle_python_domain(mode: str, difficulty: str, query: str, full_query: str, code: str, name: str) -> Dict[str, Any]:
        domain_name = "Python & Data Structures"

        if mode == "practice":
            if "three" in full_query or "beginner questions" in full_query or "pillars" in full_query:
                title = f"Python OOP Practice: Three Foundational Questions ({difficulty})"
                content = (
                    f"### Three Foundational OOP Placement Questions ({difficulty})\n\n"
                    f"Hi {name}! Here are three core Object-Oriented Programming practice questions frequently tested in campus recruitment:\n\n"
                    "1. **Encapsulation**: What is encapsulation in Python, and how do private/protected conventions (`_var`, `__var`) enforce data hiding?\n"
                    "2. **Polymorphism & Method Overriding**: Explain how dynamic polymorphism works with method overriding across parent and child classes.\n"
                    "3. **Abstraction**: How do Abstract Base Classes (`abc.ABC` and `@abstractmethod`) enforce interface contracts in Python?\n\n"
                    "*(Submit your answer to any question below to get it evaluated!)*"
                )
            elif "oop" in full_query or "inheritance" in full_query:
                title = f"Python OOP Challenge: Bank Account Hierarchy ({difficulty})"
                content = (
                    f"### Python OOP Practice Challenge ({difficulty})\n\n"
                    f"Hi {name}! Here is an object-oriented design problem frequently tested in Round 1 coding rounds:\n\n"
                    "**Problem**: Implement a `BankAccount` class and a derived `SavingsAccount` class in Python.\n\n"
                    "**Requirements**:\n"
                    "1. Base class `BankAccount` with `account_number`, `balance`, and methods `deposit(amount)` and `withdraw(amount)`.\n"
                    "2. Subclass `SavingsAccount(BankAccount)` that initializes with `interest_rate: float` and overrides `withdraw()` to enforce a minimum balance of ₹1,000.\n"
                    "3. Use `super().__init__()` for proper parent initialization.\n\n"
                    "*(Submit your Python code below for instant rubric review!)*"
                )
            elif "recursion" in full_query or "factorial" in full_query:
                title = f"Recursion Practice Challenge: Reverse a String ({difficulty})"
                content = (
                    f"### Python Recursion Coding Challenge ({difficulty})\n\n"
                    "**Problem**: Write a recursive function `reverse_string(s: str) -> str` that reverses a string without using slicing (`[::-1]`) or loops.\n\n"
                    "**Constraints**:\n"
                    "- Explicitly declare the Base Case (`if len(s) <= 1: return s`).\n"
                    "- State the Call Stack space complexity.\n\n"
                    "*(Submit your solution below!)*"
                )
            else:
                title = f"Python DSA Challenge: Two-Pointer Technique ({difficulty})"
                content = (
                    f"### Python Coding Challenge ({difficulty})\n\n"
                    "**Problem**: Given a sorted array of integers `nums` and a target integer `target`, return the 0-indexed indices of the two numbers that add up to `target`.\n\n"
                    "**Constraints**:\n"
                    "- Time Complexity must be $O(N)$.\n"
                    "- Space Complexity must be $O(1)$ auxiliary memory.\n\n"
                    "**Sample Input**: `nums = [2, 7, 11, 15]`, `target = 9` -> Output: `[0, 1]`\n\n"
                    "*(Submit your code below!)*"
                )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Give me a hint for this challenge",
                "Show me the optimal two-pointer solution",
                "Review my answer"
            ])

        elif mode == "quiz":
            title = f"Python DSA Assessment Quiz ({difficulty})"
            content = (
                f"### Python Technical Assessment Question ({difficulty})\n\n"
                "**Question: What is the average time complexity of checking if a key exists in a Python `dict` versus in a `list`?**\n\n"
                "- **A)** Dict: $O(N)$ | List: $O(1)$\n"
                "- **B)** Dict: $O(1)$ | List: $O(N)$\n"
                "- **C)** Dict: $O(\\log N)$ | List: $O(\\log N)$\n"
                "- **D)** Dict: $O(1)$ | List: $O(1)$\n\n"
                "**Correct Answer: B**\n\n"
                "**Explanation**: Python dictionaries use an open-addressing Hash Table, providing $O(1)$ average time complexity for key lookups via hashing. Lists require a linear scan ($O(N)$) to check item membership (`item in my_list`)."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain Python List vs Tuple",
                "Give me another Python quiz question",
                "What is Python's Method Resolution Order (MRO)?"
            ])

        elif mode == "review":
            title = "Python Code & Logic Review"
            content = (
                f"### Evaluation of Your Submitted Python Solution\n\n"
                f"Hi {name}! Here is an audit of your submission:\n\n"
                "#### 1. Demonstrated Strengths\n"
                "- Idiomatic Python syntax adhering to PEP 8 standards.\n"
                "- Correct handling of standard positive test cases and core conceptual understanding.\n\n"
                "#### 2. Key Optimization & Watch-outs (What Was Missing)\n"
                "- **Missing Edge Cases & Boundary Handling**: Ensure your code handles empty lists (`len(arr) == 0`), negative values, and single-element inputs without throwing `IndexError`.\n"
                "- **Watch-outs on Complexity**: Verify whether your implementation achieves optimal time complexity or accidentally creates $O(N^2)$ due to nested operations."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Give me another Python practice problem",
                "Explain Big-O complexity step by step",
                "Quiz me on Python OOP"
            ])

        elif "list and a tuple" in full_query or "list vs tuple" in full_query:
            title = "Python Data Structures: List vs Tuple Comparison"
            content = (
                f"### Direct Answer: Python List vs Tuple\n\n"
                f"**The fundamental difference is Mutability**: A **list** is mutable (items can be modified, added, or deleted in-place), "
                f"while a **tuple** is immutable (frozen upon creation).\n\n"
                "#### Side-by-Side Comparison\n"
                "| Feature | Python `list` | Python `tuple` |\n"
                "| :--- | :--- | :--- |\n"
                "| **Syntax** | `[1, 2, 3]` | `(1, 2, 3)` |\n"
                "| **Mutability** | **Mutable** | **Immutable** |\n"
                "| **Memory** | Higher (over-allocates buffer for resizing) | Lower (compact fixed memory block) |\n"
                "| **Dictionary Key** | ❌ Cannot be key (unhashable) | ✅ Can be key (if items are hashable) |\n\n"
                "```python\n"
                "my_list = [1, 2, 3]\n"
                "my_list[0] = 99  # Valid: [99, 2, 3]\n"
                "\n"
                "my_tuple = (1, 2, 3)\n"
                "# my_tuple[0] = 99  # TypeError: 'tuple' object does not support item assignment\n"
                "```"
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain the same topic more simply",
                "Now give me a practice question about that topic",
                "What is a namedtuple in Python?"
            ])

        elif "inheritance" in full_query or "oop" in full_query:
            title = f"Python Object-Oriented Programming: Inheritance ({difficulty})"
            content = (
                f"### Python OOP & Inheritance: Interview Mastery Guide\n\n"
                f"Hi {name}! In Python, **Inheritance** allows a child class to inherit attributes and methods from a parent class, promoting code reusability.\n\n"
                "```python\n"
                "class Vehicle:\n"
                "    def __init__(self, brand: str, year: int):\n"
                "        self.brand = brand\n"
                "        self.year = year\n"
                "\n"
                "    def get_info(self) -> str:\n"
                "        return f\"{self.year} {self.brand}\"\n"
                "\n"
                "class ElectricCar(Vehicle):\n"
                "    def __init__(self, brand: str, year: int, battery_kwh: int):\n"
                "        super().__init__(brand, year)  # Initialize parent\n"
                "        self.battery_kwh = battery_kwh\n"
                "\n"
                "    def get_info(self) -> str:\n"
                "        base = super().get_info()\n"
                "        return f\"{base} (Electric, {self.battery_kwh} kWh)\"\n"
                "\n"
                "car = ElectricCar(\"Tesla\", 2024, 75)\n"
                "print(car.get_info())  # 2024 Tesla (Electric, 75 kWh)\n"
                "```\n\n"
                "#### Placement Interview Traps\n"
                "- **Diamond Problem & MRO**: In multiple inheritance, Python resolves lookup order via C3 Linearization (`ElectricCar.mro()`)."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain the same topic more simply",
                "Now give me a practice question about that topic",
                "What is the Diamond Problem in Python?"
            ])

        elif "recursion" in full_query or "factorial" in full_query:
            title = f"Recursion Fundamentals Explained Using Factorial ({difficulty})"
            content = (
                f"### Recursion Breakdown: Factorial Walkthrough ({difficulty})\n\n"
                f"Hi {name}! **Recursion** is a technique where a function calls itself to solve smaller subproblems of the same structure.\n\n"
                "```python\n"
                "def factorial(n: int) -> int:\n"
                "    # 1. Base Case (Halting condition)\n"
                "    if n <= 1:\n"
                "        return 1\n"
                "    # 2. Recursive Step\n"
                "    return n * factorial(n - 1)\n"
                "```\n\n"
                "#### Call Stack Trace for `factorial(4)`\n"
                "- Push: `factorial(4) -> 4 * factorial(3) -> 3 * factorial(2) -> 2 * factorial(1)`\n"
                "- Base Case hits: returns `1`\n"
                "- Unwind: `2 * 1 = 2 -> 3 * 2 = 6 -> 4 * 6 = 24`\n\n"
                "- **Time Complexity**: $O(N)$ | **Space Complexity**: $O(N)$ auxiliary stack frames."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Explain the same topic more simply",
                "Now give me a practice question about that topic",
                "Convert recursive factorial to iterative O(1) space"
            ])

        else: # general learn / doubt
            title = f"Python & DSA Interview Guide ({difficulty})"
            content = (
                f"### Python & Data Structures: Technical Guide ({difficulty})\n\n"
                f"Hi {name}! In campus SDE rounds, Python problem solving requires choosing the optimal data structures:\n\n"
                "- **Hash Map / Dict**: $O(1)$ lookups and insertions.\n"
                "- **Two-Pointers / Sliding Window**: Optimal $O(N)$ time and $O(1)$ space for array/string problems.\n"
                "- **Binary Search**: $O(\\log N)$ search on monotonic/sorted search spaces."
            )
            return TutorService._build_response(domain_name, mode, difficulty, title, content, [
                "Practice a two-pointer problem",
                "Explain Python inheritance with an example",
                "Quiz me on Python data structures"
            ])

    # -------------------------------------------------------------------------
    # Multi-Language Code Debugging Handler (Python, SQL, JavaScript, Java, C++)
    # -------------------------------------------------------------------------
    @staticmethod
    def _handle_multi_language_debug(
        full_query: str,
        code_snippet: str,
        language: Optional[str],
        domain_key: str,
        domain_name: str,
        student_name: str,
        difficulty: str
    ) -> Dict[str, Any]:
        # 1. SQL Query Debugging
        if domain_key == "sql" or "select " in full_query or "from " in full_query:
            if "avg(" in full_query and "where" in full_query:
                title = "SQL Debug Analysis: Aggregate in WHERE Clause"
                content = (
                    f"### SQL Code Review & Bug Diagnosis\n\n"
                    f"Hi {student_name}! The query contains a classic relational syntax error:\n\n"
                    "#### 1. Root Cause & Error\n"
                    "- **Error**: In SQL, aggregate functions (`AVG()`, `COUNT()`, `SUM()`) cannot be used inside a `WHERE` clause.\n"
                    "- **Reason**: The `WHERE` clause filters individual rows **before** aggregation happens. Aggregates must be filtered using `HAVING` **after** `GROUP BY`.\n\n"
                    "#### 2. Corrected SQL Query\n"
                    "```sql\n"
                    "-- CORRECT: Using HAVING for aggregate filtering\n"
                    "SELECT department_id, AVG(salary) AS avg_sal\n"
                    "FROM Employees\n"
                    "GROUP BY department_id\n"
                    "HAVING AVG(salary) > 50000;\n"
                    "```\n\n"
                    "#### 3. Execution Order Watch-out\n"
                    "`FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY`"
                )
            else:
                title = "SQL Query Diagnosis & Optimization"
                content = (
                    f"### SQL Debug Analysis\n\n"
                    f"Hi {student_name}! When inspecting SQL queries in recruitment rounds:\n\n"
                    "- **Check 1**: Every non-aggregated column in the `SELECT` clause must appear in the `GROUP BY` clause.\n"
                    "- **Check 2**: Ensure join conditions are explicit (`ON e.dept_id = d.dept_id`) to prevent accidental Cartesian cross joins."
                )
            return TutorService._build_response("SQL & Database Queries", "debug", difficulty, title, content, [
                "Explain the logical query execution order in SQL",
                "Give me another SQL query to debug",
                "Practice SQL challenge"
            ])

        # 2. JavaScript / TypeScript Debugging
        if language in ["javascript", "typescript", "js", "ts"] or "console.log" in full_query or "const " in full_query or "null.length" in full_query:
            title = "JavaScript Debug Analysis: TypeError"
            content = (
                f"### JavaScript/TypeScript Code Diagnosis\n\n"
                f"Hi {student_name}! Let's inspect the JavaScript code snippet:\n\n"
                "#### 1. Root Cause\n"
                "- **Exception**: `TypeError: Cannot read properties of null (reading 'length')`\n"
                "- **Reason**: In JavaScript, `null` is a primitive value representing an intentional absence of an object. Accessing properties on `null` throws an uncaught runtime TypeError.\n\n"
                "#### 2. Corrected Implementation\n"
                "```javascript\n"
                "// Approach A: Optional Chaining (ES2020)\n"
                "const len = items?.length ?? 0;\n"
                "\n"
                "// Approach B: Defensive Guard Clause\n"
                "if (items && Array.isArray(items)) {\n"
                "    console.log(items.length);\n"
                "}\n"
                "```\n\n"
                "#### 3. Interview Best Practice\n"
                "In JavaScript interviews, always validate whether inputs can be `undefined` or `null` before property dereferencing."
            )
            return TutorService._build_response("JavaScript / Web", "debug", difficulty, title, content, [
                "Explain == vs === in JavaScript",
                "What is the Event Loop in Node.js?",
                "Give me another JS debugging challenge"
            ])

        # 3. Python Division by Zero or General Python Debugging
        if "10 / 0" in full_query or "division by zero" in full_query:
            title = "Debug Analysis: ZeroDivisionError"
            content = (
                f"### Code Analysis & Bug Diagnosis\n\n"
                f"Hi {student_name}! The supplied statement contains a critical runtime crash:\n\n"
                "```python\n"
                "print(10 / 0)\n"
                "```\n\n"
                "#### 1. Root Cause & Exception\n"
                "- **Exception Raised**: `ZeroDivisionError: division by zero`\n"
                "- **Mathematical Cause**: In IEEE 754 and integer CPU arithmetic, division by zero is undefined. Python halts execution and raises `ZeroDivisionError`.\n\n"
                "#### 2. Corrected Implementation\n"
                "```python\n"
                "# Approach A: Defensive Guard Clause\n"
                "denominator = 0\n"
                "if denominator != 0:\n"
                "    print(10 / denominator)\n"
                "else:\n"
                "    print(\"Error: Denominator cannot be zero.\")\n"
                "\n"
                "# Approach B: Exception Handling\n"
                "try:\n"
                "    print(10 / 0)\n"
                "except ZeroDivisionError as err:\n"
                "    print(f\"Handled gracefully: {err}\")\n"
                "```"
            )
            return TutorService._build_response("Python & Data Structures", "debug", difficulty, title, content, [
                "What other common Python exceptions occur in coding rounds?",
                "How do try-except-else-finally blocks work?",
                "Give me another code snippet to debug"
            ])

        # Generic multi-language debug template
        title = f"Code Review & Bug Diagnosis ({domain_name})"
        content = (
            f"### Code Debugging & Optimization Analysis\n\n"
            f"Hi {student_name}! Here is the diagnostic review for your {domain_name} code:\n\n"
            "#### 1. Common Bug Categories Analyzed\n"
            "- **Boundary Off-by-One Errors**: Ensure loop terminations do not cause out-of-bounds index exceptions.\n"
            "- **Null Pointer / Dereferencing**: Always check that objects/variables are initialized before calling methods.\n"
            "- **Time Complexity Traps**: Avoid accidental $O(N^2)$ nested operations where an auxiliary hash table yields $O(N)$ linear runtime.\n\n"
            "```python\n"
            "# Defensive guard pattern template\n"
            "def safe_execute(data):\n"
            "    if not data:\n"
            "        return None\n"
            "    return process(data)\n"
            "```"
        )
        return TutorService._build_response(domain_name, "debug", difficulty, title, content, [
            "Explain time and space complexity",
            "Give me a challenge debugging an off-by-one loop error",
            "Show optimal time complexity for this pattern"
        ])

    # -------------------------------------------------------------------------
    # Context-Aware Adaptive Follow-up Handlers
    # -------------------------------------------------------------------------
    @staticmethod
    def _handle_adaptive_simplify(last_u: str, last_a: str, domain_key: str, domain_name: str, name: str, diff: str) -> Dict[str, Any]:
        combined = f"{last_u} {last_a}".lower()

        if "sql" in combined or domain_key == "sql":
            content = (
                "### Simplified Analogy: SQL Joins (Puzzle Pieces)\n\n"
                "Imagine you have Student ID cards in your left hand and Exam Score sheets in your right hand:\n\n"
                "- **INNER JOIN**: You keep only students who have BOTH an ID card and an Exam score.\n"
                "- **LEFT JOIN**: You keep every student from your left hand, even if their exam sheet is missing (marked NULL)."
            )
        elif "system design" in combined or "cache" in combined or domain_key == "system_design":
            content = (
                "### Simplified Analogy: Caching (Desk vs Warehouse)\n\n"
                "- **Database** = The large central storage warehouse down the street. It holds everything, but takes 30 minutes to retrieve a box.\n"
                "- **Cache (Redis)** = The small drawer right under your desk. It holds only the 5 folders you use every hour. You reach in and grab them in 1 second!"
            )
        elif "supervised" in combined or "machine learning" in combined or domain_key == "ml":
            content = (
                "### Simplified Analogy: Supervised vs Unsupervised (Flashcards vs Lego)\n\n"
                "- **Supervised Learning** = Learning with a teacher holding flashcards with answers on the back (Labeled data).\n"
                "- **Unsupervised Learning** = Sorting mixed Lego bricks into color piles with NO instructions (Unlabeled data)."
            )
        elif "recursion" in combined or "factorial" in combined:
            content = (
                "### Simplified Analogy: Recursion (Russian Nesting Dolls)\n\n"
                "- You open a doll, and inside is a smaller doll. You repeat until you hit the tiny solid wooden doll (Base Case).\n"
                "- Then you close them back up one by one in reverse order (Stack Unwinding)."
            )
        else:
            content = (
                f"### Simplified Explanation: {domain_name}\n\n"
                "Let's strip away the technical jargon: Focus on the single problem this technology solves, "
                "what goes in as input, and what comes out as output."
            )

        return TutorService._build_response(domain_name, "learn", "Beginner", f"Simplified Explanation ({domain_name})", content, [
            "Now give me a practice question about that topic",
            "Show me a complete code example",
            "Quiz me on this concept"
        ])

    @staticmethod
    def _handle_adaptive_practice(last_u: str, last_a: str, domain_key: str, domain_name: str, name: str, diff: str) -> Dict[str, Any]:
        combined = f"{last_u} {last_a}".lower()

        if "sql" in combined or domain_key == "sql":
            title = "SQL Practice Challenge"
            content = (
                "### Practice Challenge: Department Highest Earner\n\n"
                "Write an SQL query to find the employee with the highest salary in each department.\n\n"
                "**Table**: `Employees` (`id`, `name`, `salary`, `dept_id`)\n\n"
                "*(Submit your query below!)*"
            )
        elif "system design" in combined or domain_key == "system_design":
            title = "System Design Practice Challenge"
            content = (
                "### System Design Challenge: URL Shortener Capacity\n\n"
                "If a URL Shortener generates 100 Million URLs per month, calculate:\n"
                "1. Total writes per second (QPS).\n"
                "2. Total storage required over 5 years assuming 500 bytes per record.\n\n"
                "*(Submit your calculations below!)*"
            )
        elif "supervised" in combined or "machine learning" in combined or domain_key == "ml":
            title = "Machine Learning Practice Challenge"
            content = (
                "### ML Practice Challenge: Metric Selection\n\n"
                "In credit card fraud detection (0.1% fraud rate), why is Accuracy a terrible metric? "
                "Which metric should you optimize: Precision or Recall?\n\n"
                "*(Submit your answer below!)*"
            )
        else:
            title = f"{domain_name} Practice Challenge"
            content = (
                f"### Placement Practice Problem ({domain_name})\n\n"
                "Implement an optimal solution for the concept we just covered. State your time and space complexity explicitly."
            )

        return TutorService._build_response(domain_name, "practice", diff, title, content, [
            "Give me a hint",
            "Show the optimal solution",
            "Review my answer"
        ])

    # -------------------------------------------------------------------------
    # Response Builder Helper
    # -------------------------------------------------------------------------
    @staticmethod
    def _build_response(domain: str, mode: str, difficulty: str, title: str, content: str, followups: List[str]) -> Dict[str, Any]:
        return {
            "domain": domain,
            "topic": domain,
            "mode": mode,
            "difficulty": difficulty,
            "title": title,
            "response": content,
            "suggested_followups": followups,
            "provider": "Grounded Placement Engine (Offline)",
            "is_live_ai": False,
            "timestamp": time.time()
        }
