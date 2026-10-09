import uuid
from typing import List, Dict, Any
from app.schemas.schemas import TaskItem, PrepPlanResponse
from app.services.skill_gap_service import SkillGapService

class PrepPlannerService:
    @staticmethod
    def generate_plan(student_data: dict, job_data: dict, days: int = 28) -> List[TaskItem]:
        gap_analysis = SkillGapService.analyze(student_data, job_data)
        missing_skills = [item.skill for item in gap_analysis.skills_breakdown if item.status == "missing"]
        role_title = job_data.get("title", "Software Engineer")

        tasks: List[TaskItem] = []
        weeks_count = max(1, days // 7)

        # 1. Week 1: Foundations & High Priority Missing Skills
        day = 1
        tasks.append(TaskItem(
            id=f"task-{day}",
            week=1,
            day_number=day,
            category="Technical",
            title=f"Core Programming Foundations for {role_title}",
            description="Review memory models, execution lifecycle, object-oriented concepts, and common syntax pitfalls.",
            duration_minutes=90,
            priority="High",
            is_completed=False,
            resources=["Official Language Documentation", "Core Concepts Cheat Sheet"]
        ))
        day += 2

        if missing_skills:
            first_gap = missing_skills[0]
            tasks.append(TaskItem(
                id=f"task-{day}",
                week=1,
                day_number=day,
                category="Technical",
                title=f"Intensive Practice: {first_gap} Essentials",
                description=f"Focus on practical fundamentals of {first_gap}. Complete 3 hands-on sandbox exercises.",
                duration_minutes=90,
                priority="High",
                is_completed=False,
                resources=[f"{first_gap} Documentation", "Interactive Coding Sandbox"]
            ))
            day += 2

        tasks.append(TaskItem(
            id=f"task-{day}",
            week=1,
            day_number=day,
            category="Coding",
            title="Data Structures: Arrays, Strings & Hash Tables",
            description="Solve 4 LeetCode Easy/Medium problems focusing on two-pointer technique and frequency maps.",
            duration_minutes=90,
            priority="High",
            is_completed=False,
            resources=["LeetCode 75", "NeetCode Roadmap"]
        ))
        day += 3

        # 2. Week 2: Deep Technical & Secondary Skills
        week = 2
        second_gap = missing_skills[1] if len(missing_skills) > 1 else "Database Indexing & Query Tuning"
        tasks.append(TaskItem(
            id=f"task-{day}",
            week=week,
            day_number=day,
            category="Technical",
            title=f"Advanced Skills: {second_gap}",
            description=f"Implement an end-to-end module demonstrating proficiency in {second_gap}.",
            duration_minutes=90,
            priority="High",
            is_completed=False,
            resources=[f"Deep Dive: {second_gap}", "GitHub Example Architecture"]
        ))
        day += 2

        tasks.append(TaskItem(
            id=f"task-{day}",
            week=week,
            day_number=day,
            category="Coding",
            title="Algorithmic Patterns: Binary Search & Trees",
            description="Master tree traversals (BFS, DFS) and binary search boundaries. Solve 3 problems.",
            duration_minutes=90,
            priority="High",
            is_completed=False,
            resources=["Binary Tree Visualizer", "Blind 75 Curated List"]
        ))
        day += 3

        tasks.append(TaskItem(
            id=f"task-{day}",
            week=week,
            day_number=day,
            category="Aptitude",
            title="Quantitative & Analytical Aptitude Drills",
            description="Time-boxed test: Percentages, Profit & Loss, Work & Time, and Logical Syllogisms.",
            duration_minutes=60,
            priority="Medium",
            is_completed=False,
            resources=["IndiaBIX Placement Aptitude", "Speed Math Techniques"]
        ))
        day += 2

        # 3. Week 3: System Design & Mock Interviews
        week = 3
        tasks.append(TaskItem(
            id=f"task-{day}",
            week=week,
            day_number=day,
            category="Technical",
            title=f"System Design & Architecture for {role_title}",
            description="Analyze microservice vs monolithic trade-offs, caching (Redis), rate-limiting, and SQL vs NoSQL schema design.",
            duration_minutes=90,
            priority="High",
            is_completed=False,
            resources=["System Design Primer", "ByteByteGo Architecture Diagrams"]
        ))
        day += 2

        tasks.append(TaskItem(
            id=f"task-{day}",
            week=week,
            day_number=day,
            category="Coding",
            title="Mock Technical Interview: Coding Round",
            description="Live 45-minute timed coding session. Explain time and space complexity clearly before coding.",
            duration_minutes=60,
            priority="High",
            is_completed=False,
            resources=["PlaceMate AI Mock Interview", "Pramp / Peer Mock Practice"]
        ))
        day += 3

        # 4. Week 4: Final Polish & HR Prep
        week = 4
        tasks.append(TaskItem(
            id=f"task-{day}",
            week=week,
            day_number=day,
            category="HR & Communication",
            title="Behavioral & HR Round Mastery (STAR Technique)",
            description="Structure answers for 'Tell me about yourself', conflict resolution, project challenges, and strengths/weaknesses.",
            duration_minutes=60,
            priority="High",
            is_completed=False,
            resources=["STAR Interview Framework Guide", "30 Common HR Questions"]
        ))
        day += 2

        # If 60-day plan requested, add advanced Weeks 5 to 8
        if days >= 60:
            # Week 5: Advanced Algorithmic Patterns
            tasks.append(TaskItem(
                id=f"task-{day}",
                week=5,
                day_number=31,
                category="Coding",
                title="Advanced Graph Algorithms (Dijkstra, Topological Sort)",
                description="Solve 4 Hard/Medium problems on DAGs, cycle detection, and shortest paths in weighted graphs.",
                duration_minutes=90,
                priority="High",
                is_completed=False,
                resources=["Graph Theory Visualizer", "LeetCode Graph Exploration"]
            ))
            day += 2

            # Week 6: High-Scale Distributed Systems
            tasks.append(TaskItem(
                id=f"task-{day}",
                week=6,
                day_number=38,
                category="Technical",
                title="Distributed Systems, Sharding & Consistent Hashing",
                description="Design distributed key-value stores, database partitioning strategies, and write-ahead logs.",
                duration_minutes=90,
                priority="High",
                is_completed=False,
                resources=["Designing Data-Intensive Applications", "MIT 6.824 Lecture Summaries"]
            ))
            day += 2

            # Week 7: Production Architecture & Portfolio
            tasks.append(TaskItem(
                id=f"task-{day}",
                week=7,
                day_number=45,
                category="Technical",
                title="Production Architecture & Portfolio Code Polish",
                description="Refactor capstone projects with Docker compose, unit test suites (>80% coverage), and CI/CD pipelines.",
                duration_minutes=90,
                priority="Medium",
                is_completed=False,
                resources=["GitHub Actions Documentation", "Docker Best Practices"]
            ))
            day += 2

            # Week 8: Placement Marathon & Executive HR
            tasks.append(TaskItem(
                id=f"task-{day}",
                week=8,
                day_number=52,
                category="HR & Communication",
                title="Full-Day Placement Simulation & Executive Panel Round",
                description="Simulate complete campus recruitment day: Online Assessment, 2 Technical Rounds, and Leadership Interview.",
                duration_minutes=120,
                priority="High",
                is_completed=False,
                resources=["PlaceMate Mock Interview Suite", "Executive Leadership Principles"]
            ))

        # Adjust week mapping if short sprint (7 or 14 days)
        if days <= 7:
            for t in tasks:
                t.week = 1
        elif days <= 14:
            for i, t in enumerate(tasks):
                t.week = 1 if i < len(tasks) // 2 else 2

        return tasks

