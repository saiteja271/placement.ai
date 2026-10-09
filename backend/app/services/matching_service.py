from typing import List, Dict, Any, Tuple
from app.services.eligibility_service import EligibilityService

def parse_semicolon_list(raw_val: Any) -> List[str]:
    if not raw_val:
        return []
    if isinstance(raw_val, list):
        return [str(x).strip() for x in raw_val if str(x).strip()]
    return [str(x).strip() for x in str(raw_val).split(";") if str(x).strip()]

class MatchingService:
    @staticmethod
    def calculate_match(student_data: dict, job_data: dict) -> Tuple[int, List[str]]:
        student_skills = [s.lower() for s in parse_semicolon_list(student_data.get("skills", []))]
        required_skills = [s.lower() for s in parse_semicolon_list(job_data.get("required_skills", []))]
        preferred_skills = [s.lower() for s in parse_semicolon_list(job_data.get("preferred_skills", []))]

        reasons: List[str] = []

        # 1. Required skills match (55% weight)
        req_matched = [s for s in required_skills if s in student_skills]
        req_score = (len(req_matched) / len(required_skills)) if required_skills else 1.0
        if req_matched:
            reasons.append(f"Matched {len(req_matched)}/{len(required_skills)} required skills ({', '.join([s.title() for s in req_matched])})")
        elif required_skills:
            reasons.append(f"Missing core required skills ({', '.join([s.title() for s in required_skills])})")

        # 2. Preferred skills match (25% weight)
        pref_matched = [s for s in preferred_skills if s in student_skills]
        pref_score = (len(pref_matched) / len(preferred_skills)) if preferred_skills else 1.0
        if pref_matched:
            reasons.append(f"Possesses {len(pref_matched)} preferred skills ({', '.join([s.title() for s in pref_matched])})")

        # 3. Role alignment (10% weight)
        student_pref_role = (student_data.get("preferred_role") or "").lower()
        job_title = (job_data.get("title") or "").lower()
        role_score = 0.5
        if student_pref_role:
            if student_pref_role in job_title or job_title in student_pref_role:
                role_score = 1.0
                reasons.append(f"Direct match with preferred role '{student_data.get('preferred_role')}'")
            elif any(w in job_title for w in student_pref_role.split() if len(w) > 3):
                role_score = 0.8
                reasons.append("Relevant role domain overlap")

        # 4. Location alignment (10% weight)
        student_pref_loc = (student_data.get("preferred_location") or "").lower()
        job_loc = (job_data.get("location") or "").lower()
        job_mode = (job_data.get("work_mode") or "").lower()
        loc_score = 0.5
        if "remote" in job_mode or "remote" in job_loc:
            loc_score = 1.0
            reasons.append("Remote flexibility matches open location preferences")
        elif student_pref_loc and student_pref_loc in job_loc:
            loc_score = 1.0
            reasons.append(f"Desired location matches '{job_data.get('location')}'")

        # Calculate final percentage
        weighted = (req_score * 55.0) + (pref_score * 25.0) + (role_score * 10.0) + (loc_score * 10.0)
        match_score = int(round(weighted))
        match_score = max(5, min(99, match_score))

        return match_score, reasons

    @staticmethod
    def rank_and_evaluate(student_data: dict, jobs: List[dict]) -> List[dict]:
        results = []
        for job in jobs:
            match_score, match_reasons = MatchingService.calculate_match(student_data, job)
            eligibility = EligibilityService.evaluate_eligibility(student_data, job)

            item = dict(job)
            item["match_score"] = match_score
            item["is_eligible"] = eligibility.is_eligible
            item["eligibility_status"] = eligibility.status
            item["failed_mandatory"] = eligibility.failed_mandatory
            item["match_reasons"] = match_reasons
            item["eligibility_summary"] = eligibility.summary
            results.append(item)

        # Sort primarily by eligibility (Eligible first, then Conditional, then Not Eligible)
        # and secondarily by match_score descending
        def sort_key(x):
            status_order = {"ELIGIBLE": 3, "CONDITIONAL": 2, "NOT_ELIGIBLE": 1}
            return (status_order.get(x["eligibility_status"], 0), x["match_score"])

        results.sort(key=sort_key, reverse=True)
        return results
