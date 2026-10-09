import json
import os
import random
from typing import List, Dict, Any, Optional
from app.core.config import settings

MOCK_QUESTION_BANK = {
    "python developer": {
        "technical": [
            {
                "id": "py-t1",
                "question": "Can you explain the difference between a list and a tuple in Python, including memory overhead and mutability trade-offs?",
                "focus": "Mutability, memory allocation, and use cases.",
                "difficulty": "Easy",
                "expected_keywords": ["mutable", "immutable", "memory", "tuple", "list", "performance", "hashable"]
            },
            {
                "id": "py-t2",
                "question": "How does Python manage memory under the hood? Explain reference counting, cyclic garbage collection, and GIL (Global Interpreter Lock).",
                "focus": "Memory management, Garbage Collection, and CPython GIL.",
                "difficulty": "Intermediate",
                "expected_keywords": ["reference counting", "garbage collection", "gil", "concurrency", "thread", "cycles"]
            },
            {
                "id": "py-t3",
                "question": "Explain decorators in Python. How do `*args`, `**kwargs`, and `@functools.wraps` work together in a production logging decorator?",
                "focus": "Higher-order functions, closures, and metaprogramming.",
                "difficulty": "Advanced",
                "expected_keywords": ["closure", "wrapper", "decorator", "functools", "wraps", "metadata"]
            }
        ],
        "coding": [
            {
                "id": "py-c1",
                "question": "How would you implement a Generator in Python to process a 10 GB server log file line by line without exhausting memory?",
                "focus": "Generators, lazy evaluation, and streaming file I/O.",
                "difficulty": "Intermediate",
                "expected_keywords": ["yield", "generator", "memory", "stream", "chunk", "lazy"]
            },
            {
                "id": "py-c2",
                "question": "Write or describe an optimal algorithm in Python to find the two numbers in a list that add up to a target sum in O(N) time.",
                "focus": "Two Sum problem, Hash Map pattern, and lookup complexity.",
                "difficulty": "Easy",
                "expected_keywords": ["dict", "hash map", "complement", "o(n)", "lookup", "target"]
            }
        ],
        "hr": [
            {
                "id": "py-h1",
                "question": "Describe a challenging Python project you built. What library choices did you make (e.g. FastAPI vs Django), and what was the outcome?",
                "focus": "Technical decision-making, framework selection, and STAR structure.",
                "difficulty": "Intermediate",
                "expected_keywords": ["project", "framework", "architecture", "trade-off", "fastapi", "django", "result"]
            }
        ]
    },
    "software developer": {
        "technical": [
            {
                "id": "sde-t1",
                "question": "Can you explain the difference between a process and a thread, and how context switching differs between them?",
                "focus": "Operating system fundamentals and concurrency.",
                "difficulty": "Easy",
                "expected_keywords": ["process", "thread", "address space", "stack", "heap", "context switch"]
            },
            {
                "id": "sde-t2",
                "question": "Explain primary keys vs foreign keys in relational databases, and what happens when an ON DELETE CASCADE constraint triggers.",
                "focus": "Referential integrity and relational database modeling.",
                "difficulty": "Intermediate",
                "expected_keywords": ["primary key", "foreign key", "unique", "referential integrity", "cascade", "delete", "table"]
            },
            {
                "id": "sde-t3",
                "question": "Explain the CAP theorem. In a distributed key-value store, why can you not guarantee both Consistency and Availability under Partition Tolerance?",
                "focus": "Distributed systems, CAP theorem, and partition tolerance.",
                "difficulty": "Advanced",
                "expected_keywords": ["cap", "consistency", "availability", "partition", "network", "split-brain", "eventual"]
            }
        ],
        "coding": [
            {
                "id": "sde-c1",
                "question": "How would you detect a cycle in a singly linked list? Describe Floyd's Tortoise and Hare algorithm.",
                "focus": "Two-pointer linked list pattern and space complexity.",
                "difficulty": "Intermediate",
                "expected_keywords": ["slow", "fast", "pointer", "floyd", "cycle", "o(1) space", "two pointer"]
            },
            {
                "id": "sde-c2",
                "question": "Explain how a Hash Map handles collisions under the hood. Compare chaining with open addressing.",
                "focus": "Hash table internal mechanics and worst-case complexity.",
                "difficulty": "Intermediate",
                "expected_keywords": ["collision", "chaining", "linked list", "open addressing", "hash function", "bucket", "o(1)"]
            }
        ],
        "system design": [
            {
                "id": "sde-s1",
                "question": "How would you design a URL shortening service like TinyURL? Discuss database schema, hashing/encoding strategy, and caching.",
                "focus": "Scalability, unique hashing (Base62), Redis caching, and database read/write ratios.",
                "difficulty": "Advanced",
                "expected_keywords": ["base62", "hash", "cache", "redis", "read heavy", "database", "latency", "scale"]
            }
        ],
        "hr": [
            {
                "id": "sde-h1",
                "question": "Tell me about a time you encountered a difficult technical bug or team disagreement during a project. How did you resolve it?",
                "focus": "Problem-solving attitude, communication, conflict management, and STAR methodology.",
                "difficulty": "Intermediate",
                "expected_keywords": ["situation", "task", "action", "result", "debug", "team", "learned", "communication"]
            },
            {
                "id": "sde-h2",
                "question": "Where do you see your technical career progressing over the next 2-3 years, and why are you interested in our engineering culture?",
                "focus": "Career ambition, learning trajectory, and alignment with organizational goals.",
                "difficulty": "Easy",
                "expected_keywords": ["growth", "learn", "skills", "contribute", "mentor", "impact", "engineering"]
            }
        ]
    },
    "full stack developer": {
        "technical": [
            {
                "id": "fs-t1",
                "question": "Explain how the browser renders a web page from the initial HTTP request to the DOM, CSSOM, and Render Tree creation.",
                "focus": "Critical rendering path, browser engine, and repaints/reflows.",
                "difficulty": "Intermediate",
                "expected_keywords": ["dom", "cssom", "render tree", "layout", "paint", "critical rendering path", "dns"]
            },
            {
                "id": "fs-t2",
                "question": "Compare RESTful APIs with GraphQL. When would you choose GraphQL over REST in a high-traffic production application?",
                "focus": "API architecture, over-fetching, under-fetching, and caching.",
                "difficulty": "Intermediate",
                "expected_keywords": ["rest", "graphql", "over-fetching", "endpoints", "schema", "resolver", "caching"]
            }
        ],
        "coding": [
            {
                "id": "fs-c1",
                "question": "Explain how React's Virtual DOM diffing algorithm (Reconciliation) works and why using array indices as `key` props can cause bugs.",
                "focus": "React internals, reconciliation, and component keys.",
                "difficulty": "Intermediate",
                "expected_keywords": ["virtual dom", "reconciliation", "fiber", "diffing", "key", "re-render"]
            }
        ],
        "hr": [
            {
                "id": "fs-h1",
                "question": "How do you prioritize between adding new user-facing features versus refactoring technical debt in a fast-paced sprint?",
                "focus": "Pragmatic engineering trade-offs and team communication.",
                "difficulty": "Intermediate",
                "expected_keywords": ["trade-off", "tech debt", "sprint", "priority", "business value", "user impact"]
            }
        ]
    },
    "data analyst": {
        "technical": [
            {
                "id": "da-t1",
                "question": "Explain the difference between `WHERE` and `HAVING` in SQL, and when you would use Window functions like `ROW_NUMBER()` vs `DENSE_RANK()`.",
                "focus": "SQL aggregation, filtering lifecycle, and window ranking.",
                "difficulty": "Easy",
                "expected_keywords": ["where", "having", "aggregate", "group by", "window function", "dense_rank", "partition by"]
            },
            {
                "id": "da-t2",
                "question": "How do you detect and handle outliers and missing data in a structured dataset before exploratory analysis?",
                "focus": "Data cleaning, imputation, IQR, and z-score.",
                "difficulty": "Intermediate",
                "expected_keywords": ["missing values", "imputation", "outliers", "iqr", "z-score", "median", "distribution"]
            }
        ],
        "coding": [
            {
                "id": "da-c1",
                "question": "In Pandas, compare `.loc[]` vs `.iloc[]`, and explain how vectorized operations perform compared to Python for-loops.",
                "focus": "Pandas indexing and vectorization performance.",
                "difficulty": "Easy",
                "expected_keywords": ["loc", "iloc", "label", "integer", "vectorized", "numpy", "performance"]
            }
        ],
        "hr": [
            {
                "id": "da-h1",
                "question": "Tell me about a time you translated complex analytical data findings into clear recommendations for non-technical stakeholders.",
                "focus": "Stakeholder communication, data storytelling, and business impact.",
                "difficulty": "Intermediate",
                "expected_keywords": ["stakeholders", "visualization", "recommendation", "business", "metrics", "clarity"]
            }
        ]
    },
    "ai/ml engineer": {
        "technical": [
            {
                "id": "ml-t1",
                "question": "Explain the Bias-Variance tradeoff in supervised machine learning. What regularization techniques reduce overfitting?",
                "focus": "Model evaluation, overfitting, L1/L2 regularization, and dropout.",
                "difficulty": "Intermediate",
                "expected_keywords": ["bias", "variance", "overfitting", "underfitting", "regularization", "l1", "l2", "dropout"]
            },
            {
                "id": "ml-t2",
                "question": "How does the Self-Attention mechanism in Transformer architectures compute token representations compared to RNNs?",
                "focus": "Attention mechanism, Query-Key-Value matrices, and Transformers.",
                "difficulty": "Advanced",
                "expected_keywords": ["attention", "transformer", "query", "key", "value", "parallel", "tokens"]
            }
        ],
        "coding": [
            {
                "id": "ml-c1",
                "question": "How would you prevent data leakage during feature engineering and cross-validation splitting in a machine learning pipeline?",
                "focus": "Data leakage, Scikit-Learn Pipelines, and train-test splits.",
                "difficulty": "Intermediate",
                "expected_keywords": ["leakage", "pipeline", "fit_transform", "train test split", "cross validation"]
            }
        ],
        "hr": [
            {
                "id": "ml-h1",
                "question": "How do you evaluate whether an AI feature genuinely solves a real user problem versus adding unnecessary complexity?",
                "focus": "Product empathy, AI ethics, and ROI assessment.",
                "difficulty": "Intermediate",
                "expected_keywords": ["user problem", "metrics", "roi", "baseline", "simplicity", "validation"]
            }
        ]
    }
}

class MockInterviewService:
    @staticmethod
    def get_questions_for_role(
        role_title: str,
        category: str = "technical",
        difficulty: str = "Intermediate",
        count: int = 3
    ) -> List[Dict[str, Any]]:
        # Normalize role key
        role_lower = role_title.strip().lower()
        role_key = "software developer"
        for key in MOCK_QUESTION_BANK.keys():
            if key in role_lower or (key == "software developer" and ("sde" in role_lower or "software" in role_lower)):
                role_key = key
                break
            elif "python" in role_lower:
                role_key = "python developer"
                break
            elif "full" in role_lower or "web" in role_lower:
                role_key = "full stack developer"
                break
            elif "data" in role_lower or "analyst" in role_lower:
                role_key = "data analyst"
                break
            elif "ai" in role_lower or "ml" in role_lower or "machine" in role_lower:
                role_key = "ai/ml engineer"
                break

        role_bank = MOCK_QUESTION_BANK.get(role_key, MOCK_QUESTION_BANK["software developer"])
        cat_key = category.strip().lower()

        if cat_key == "mixed":
            # Mixed session: 1 technical, 1 coding, 1 hr
            collected: List[Dict[str, Any]] = []
            if "technical" in role_bank and role_bank["technical"]:
                collected.append(role_bank["technical"][0])
            if "coding" in role_bank and role_bank["coding"]:
                collected.append(role_bank["coding"][0])
            if "hr" in role_bank and role_bank["hr"]:
                collected.append(role_bank["hr"][0])
            elif "system design" in role_bank and role_bank["system design"]:
                collected.append(role_bank["system design"][0])
            # Fill if count > 3
            all_pool = [q for cats in role_bank.values() for q in cats if q not in collected]
            while len(collected) < count and all_pool:
                collected.append(all_pool.pop(0))
            return collected[:count]

        # Specific category
        questions = role_bank.get(cat_key)
        if not questions:
            # Fallback
            questions = role_bank.get("technical", MOCK_QUESTION_BANK["software developer"]["technical"])

        # Select by difficulty if possible, else take up to count
        diff_lower = difficulty.strip().lower()
        matched_diff = [q for q in questions if q.get("difficulty", "").lower() == diff_lower]
        other_diff = [q for q in questions if q.get("difficulty", "").lower() != diff_lower]
        final_list = matched_diff + other_diff
        return final_list[:count]

    @staticmethod
    def evaluate_answer(question: Dict[str, Any], user_answer: str, is_live_ai: bool = False) -> Dict[str, Any]:
        answer_text = (user_answer or "").strip()
        if len(answer_text) < 15:
            return {
                "source": "FALLBACK_DEMO" if not is_live_ai else "LIVE_AI",
                "score_out_of_100": 30,
                "technical_score": 1,
                "communication_score": 2,
                "completeness_score": 1,
                "strengths": ["Attempted to answer the prompt."],
                "improvement_areas": [
                    "Answer is too brief. Elaborate on core concepts, trade-offs, and concrete examples."
                ],
                "recommended_next_action": "Review the technical definitions and try re-answering with a full explanation.",
                "verdict": "Needs Significant Elaboration"
            }

        # Deterministic semantic heuristic evaluation
        expected_keywords = question.get("expected_keywords", [])
        answer_lower = answer_text.lower()
        matched_kw = [k for k in expected_keywords if k in answer_lower]

        kw_ratio = len(matched_kw) / max(1, len(expected_keywords))
        length_factor = min(1.0, len(answer_text) / 250.0)

        # Base scores 1-5
        tech_score = max(2, min(5, round(2 + (kw_ratio * 3.0))))
        comm_score = max(3, min(5, round(3 + (length_factor * 2.0))))
        comp_score = max(2, min(5, round(2 + (kw_ratio * 2.0) + (length_factor * 1.0))))

        overall_score = int(round(((tech_score + comm_score + comp_score) / 15.0) * 100))

        strengths = []
        improvements = []

        if matched_kw:
            strengths.append(f"Accurately addressed key terminology: {', '.join([k.title() for k in matched_kw[:4]])}.")
        if len(answer_text) > 120:
            strengths.append("Provided a structured and substantive explanation.")
        else:
            improvements.append("Expand on specific architectural or real-world use cases.")

        unmatched = [k for k in expected_keywords if k not in matched_kw]
        if unmatched:
            improvements.append(f"Consider touching on: {', '.join([k.title() for k in unmatched[:3]])}.")

        if not strengths:
            strengths.append("Clear tone and honest formulation.")

        return {
            "source": "FALLBACK_DEMO" if not is_live_ai else "LIVE_AI",
            "score_out_of_100": overall_score,
            "technical_score": tech_score,
            "communication_score": comm_score,
            "completeness_score": comp_score,
            "strengths": strengths,
            "improvement_areas": improvements,
            "recommended_next_action": f"Practice structuring answers using the Point-Reason-Example model for {question.get('focus', 'technical rounds')}.",
            "verdict": "Strong Response" if overall_score >= 75 else "Good Attempt, Room for Depth"
        }
