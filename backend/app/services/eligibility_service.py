from typing import List, Optional, Tuple, Dict
from app.schemas.schemas import CriterionResult, EligibilityResult

# Branch aliases for intelligent standardisation
BRANCH_ALIASES = {
    "cse": "Computer Science",
    "cs": "Computer Science",
    "computer science": "Computer Science",
    "computer science and engineering": "Computer Science",
    "it": "Information Technology",
    "information technology": "Information Technology",
    "ece": "Electronics and Communication",
    "electronics and communication": "Electronics and Communication",
    "electronics and communication engineering": "Electronics and Communication",
    "eee": "Electrical and Electronics",
    "mech": "Mechanical Engineering",
    "mechanical": "Mechanical Engineering",
    "mechanical engineering": "Mechanical Engineering",
    "civil": "Civil Engineering",
    "mca": "Computer Applications",
    "computer applications": "Computer Applications",
    "data science": "Data Science",
    "ai": "Artificial Intelligence",
    "aiml": "Artificial Intelligence",
    "mathematics": "Mathematics",
    "statistics": "Statistics",
}

def normalize_branch(branch_name: Optional[str]) -> Optional[str]:
    if not branch_name or not branch_name.strip():
        return None
    cleaned = branch_name.strip().lower()
    return BRANCH_ALIASES.get(cleaned, branch_name.strip())

class EligibilityService:
    @staticmethod
    def evaluate_eligibility(student_data: dict, job_data: dict) -> EligibilityResult:
        criteria: List[CriterionResult] = []
        failed_mandatory = False
        has_unknown = False

        # 1. Degree & Branch Check
        raw_student_branch = student_data.get("branch")
        norm_student_branch = normalize_branch(raw_student_branch)
        eligible_branches_raw = job_data.get("eligible_branches", [])
        if isinstance(eligible_branches_raw, str):
            eligible_branches = [b.strip() for b in eligible_branches_raw.split(";") if b.strip()]
        else:
            eligible_branches = [str(b).strip() for b in eligible_branches_raw]

        norm_allowed_branches = [normalize_branch(b) for b in eligible_branches]

        if not norm_student_branch:
            criteria.append(CriterionResult(
                criterion_name="Degree & Branch",
                required_value=", ".join(eligible_branches) if eligible_branches else "Any",
                student_value="Not Specified",
                status="UNKNOWN",
                explanation="Student profile lacks branch information. Verification required."
            ))
            has_unknown = True
        else:
            # Check match
            is_branch_met = any(
                norm_student_branch.lower() == allowed.lower()
                for allowed in norm_allowed_branches if allowed
            ) or (norm_student_branch.lower() in [b.lower() for b in eligible_branches])

            if is_branch_met:
                criteria.append(CriterionResult(
                    criterion_name="Degree & Branch",
                    required_value=", ".join(eligible_branches),
                    student_value=raw_student_branch,
                    status="MET",
                    explanation=f"Your branch ({raw_student_branch}) is explicitly accepted for this role."
                ))
            else:
                criteria.append(CriterionResult(
                    criterion_name="Degree & Branch",
                    required_value=", ".join(eligible_branches),
                    student_value=raw_student_branch,
                    status="NOT_MET",
                    explanation=f"Your branch ({raw_student_branch}) is not in the allowed branch list ({', '.join(eligible_branches)})."
                ))
                failed_mandatory = True

        # 2. Minimum CGPA Check
        student_cgpa = student_data.get("cgpa")
        min_cgpa = float(job_data.get("min_cgpa", 0.0))

        if student_cgpa is None or float(student_cgpa) <= 0.0:
            criteria.append(CriterionResult(
                criterion_name="Minimum CGPA",
                required_value=f"{min_cgpa:.1f} / 10.0",
                student_value="Not Specified",
                status="UNKNOWN",
                explanation="Academic CGPA is missing from your profile. Cannot verify cutoff."
            ))
            has_unknown = True
        else:
            cgpa_val = float(student_cgpa)
            if cgpa_val >= min_cgpa:
                criteria.append(CriterionResult(
                    criterion_name="Minimum CGPA",
                    required_value=f"≥ {min_cgpa:.1f}",
                    student_value=f"{cgpa_val:.2f}",
                    status="MET",
                    explanation=f"Your CGPA of {cgpa_val:.2f} meets the minimum requirement of {min_cgpa:.1f}."
                ))
            else:
                criteria.append(CriterionResult(
                    criterion_name="Minimum CGPA",
                    required_value=f"≥ {min_cgpa:.1f}",
                    student_value=f"{cgpa_val:.2f}",
                    status="NOT_MET",
                    explanation=f"Your CGPA of {cgpa_val:.2f} is below the company threshold of {min_cgpa:.1f}."
                ))
                failed_mandatory = True

        # 3. Backlogs Check
        student_backlogs = student_data.get("backlogs")
        max_backlogs = int(job_data.get("max_backlogs", 0))

        if student_backlogs is None:
            criteria.append(CriterionResult(
                criterion_name="Active Backlogs",
                required_value=f"Max {max_backlogs}",
                student_value="Not Specified",
                status="UNKNOWN",
                explanation="Backlog status is unknown. Please confirm in your profile."
            ))
            has_unknown = True
        else:
            backlogs_val = int(student_backlogs)
            if backlogs_val <= max_backlogs:
                criteria.append(CriterionResult(
                    criterion_name="Active Backlogs",
                    required_value=f"Max {max_backlogs}",
                    student_value=str(backlogs_val),
                    status="MET",
                    explanation=f"You have {backlogs_val} active backlogs (permitted: max {max_backlogs})."
                ))
            else:
                criteria.append(CriterionResult(
                    criterion_name="Active Backlogs",
                    required_value=f"Max {max_backlogs}",
                    student_value=str(backlogs_val),
                    status="NOT_MET",
                    explanation=f"You have {backlogs_val} active backlogs exceeding the company limit of {max_backlogs}."
                ))
                failed_mandatory = True

        # 4. Graduation Year Check
        student_grad_year = student_data.get("graduation_year")
        grad_min = int(job_data.get("graduation_year_min", 2025))
        grad_max = int(job_data.get("graduation_year_max", 2028))

        if not student_grad_year:
            criteria.append(CriterionResult(
                criterion_name="Graduation Year",
                required_value=f"{grad_min} – {grad_max}",
                student_value="Not Specified",
                status="UNKNOWN",
                explanation="Graduation year is not specified in profile."
            ))
            has_unknown = True
        else:
            grad_val = int(student_grad_year)
            if grad_min <= grad_val <= grad_max:
                criteria.append(CriterionResult(
                    criterion_name="Graduation Year",
                    required_value=f"{grad_min} – {grad_max}",
                    student_value=str(grad_val),
                    status="MET",
                    explanation=f"Your graduation batch of {grad_val} falls inside the target window ({grad_min}-{grad_max})."
                ))
            else:
                criteria.append(CriterionResult(
                    criterion_name="Graduation Year",
                    required_value=f"{grad_min} – {grad_max}",
                    student_value=str(grad_val),
                    status="NOT_MET",
                    explanation=f"Your graduation batch ({grad_val}) is outside the hiring batch range ({grad_min}-{grad_max})."
                ))
                failed_mandatory = True

        # Determine overall status
        if failed_mandatory:
            overall_status = "NOT_ELIGIBLE"
            is_eligible = False
            summary = "Student fails one or more mandatory eligibility requirements."
        elif has_unknown:
            overall_status = "CONDITIONAL"
            is_eligible = False
            summary = "Eligibility is conditional: critical profile criteria need confirmation."
        else:
            overall_status = "ELIGIBLE"
            is_eligible = True
            summary = "Student satisfies all company mandatory eligibility standards."

        return EligibilityResult(
            job_id=job_data.get("id", ""),
            job_title=job_data.get("title", ""),
            company=job_data.get("company", ""),
            is_eligible=is_eligible,
            status=overall_status,
            failed_mandatory=failed_mandatory,
            criteria=criteria,
            summary=summary
        )
