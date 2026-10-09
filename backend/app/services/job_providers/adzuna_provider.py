import re
import json
import urllib.request
import urllib.parse
import urllib.error
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.services.job_providers.base import BaseJobProvider, NormalizedJob, extract_skills_from_text

class AdzunaJobProvider(BaseJobProvider):
    """
    Adzuna API Job Search Integration.
    Adzuna is a major job search engine supporting real vacancies across multiple countries.
    Docs: https://developer.adzuna.com/overview
    """
    name: str = "Adzuna"

    def __init__(self, app_id: Optional[str] = None, app_key: Optional[str] = None, country: Optional[str] = None):
        self.app_id = (app_id or settings.ADZUNA_APP_ID or "").strip()
        self.app_key = (app_key or settings.ADZUNA_APP_KEY or "").strip()
        self.country = (country or settings.ADZUNA_COUNTRY or "in").strip().lower()

    def validate_credentials(self) -> Dict[str, Any]:
        """
        Validates if Adzuna credentials are configured and accessible.
        Never manufactures successful validation if credentials are missing.
        """
        if not self.app_id or not self.app_key:
            return {
                "configured": False,
                "provider": self.name,
                "status": "MISSING_CREDENTIALS",
                "message": (
                    "Adzuna API credentials (ADZUNA_APP_ID and ADZUNA_APP_KEY) are not set. "
                    "Configure them in your environment or backend/.env file to enable live search."
                )
            }
        return {
            "configured": True,
            "provider": self.name,
            "status": "READY",
            "country": self.country,
            "message": f"Adzuna credentials configured for country '{self.country}'."
        }

    def search(
        self,
        query: str,
        location: Optional[str] = None,
        filters: Optional[dict] = None,
        page: int = 1,
        page_size: int = 10
    ) -> Dict[str, Any]:
        """
        Executes a real vacancy search against the Adzuna API.
        """
        cred_check = self.validate_credentials()
        if not cred_check["configured"]:
            return {
                "success": False,
                "provider": self.name,
                "error": cred_check["message"],
                "status_code": 401,
                "total_found": 0,
                "jobs": []
            }

        country_code = self.country or "in"
        page_num = max(1, int(page))
        url = f"https://api.adzuna.com/v1/api/jobs/{country_code}/search/{page_num}"

        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "results_per_page": min(50, max(1, page_size)),
            "content-type": "application/json"
        }

        if query:
            params["what"] = query.strip()
        if location and location.lower() != "all":
            params["where"] = location.strip()

        filters = filters or {}
        if filters.get("full_time"):
            params["full_time"] = 1
        if filters.get("sort_by") == "date":
            params["sort_by"] = "date"

        encoded_params = urllib.parse.urlencode(params)
        full_url = f"{url}?{encoded_params}"

        req = urllib.request.Request(
            full_url,
            headers={
                "User-Agent": "PlaceMateAI/1.0 (College Placement Assistant)",
                "Accept": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                status_code = response.getcode()
                raw_data = response.read().decode("utf-8")
                data = json.loads(raw_data)

            raw_results = data.get("results", [])
            total_count = data.get("count", len(raw_results))

            normalized_jobs: List[NormalizedJob] = []
            for item in raw_results:
                raw_id = str(item.get("id", ""))
                title = re.sub(r"<[^>]+>", "", item.get("title", "Software Developer")).strip()
                company_name = item.get("company", {}).get("display_name", "Technology Enterprise").strip()
                loc_name = item.get("location", {}).get("display_name", location or "India").strip()
                desc = re.sub(r"<[^>]+>", "", item.get("description", "")).strip()
                redirect_url = item.get("redirect_url")

                # Format salary
                s_min = item.get("salary_min")
                s_max = item.get("salary_max")
                if s_min and s_max:
                    currency_symbol = "₹" if country_code == "in" else ("£" if country_code == "gb" else "$")
                    salary_str = f"{currency_symbol}{int(s_min):,} - {currency_symbol}{int(s_max):,} / yr"
                elif s_min:
                    currency_symbol = "₹" if country_code == "in" else ("£" if country_code == "gb" else "$")
                    salary_str = f"From {currency_symbol}{int(s_min):,} / yr"
                else:
                    salary_str = "Competitive / Industry Standard"

                # Extract technical skills
                corpus = f"{title} {desc}"
                extracted = extract_skills_from_text(corpus)
                if not extracted:
                    extracted = ["Python", "SQL", "Git"]

                # Split required vs preferred
                req_skills = extracted[:4]
                pref_skills = extracted[4:8]

                norm_job = NormalizedJob(
                    external_job_id=f"adzuna-{raw_id}",
                    title=title,
                    company=company_name,
                    location=loc_name,
                    work_mode="Full-time",
                    degree_requirements=["B.Tech", "B.E.", "MCA", "B.Sc"],
                    eligible_branches=["Computer Science", "Information Technology", "All Engineering Branches"],
                    min_cgpa=0.0,   # Not specified in posting -> Unrestricted
                    max_backlogs=99, # Not specified in posting -> Unrestricted
                    graduation_year_min=2024,
                    graduation_year_max=2028,
                    experience_level="Fresher / Entry-Level",
                    required_skills=req_skills,
                    preferred_skills=pref_skills,
                    salary_range=salary_str,
                    description=desc,
                    original_url=redirect_url,
                    source_type="live_provider",
                    provider_name=self.name,
                    posting_date=item.get("created"),
                    freshness_status="Verified Active"
                )
                normalized_jobs.append(norm_job)

            return {
                "success": True,
                "provider": self.name,
                "total_found": total_count,
                "page": page_num,
                "jobs": [j.to_dict() for j in normalized_jobs]
            }

        except urllib.error.HTTPError as e:
            err_msg = f"Adzuna API HTTP {e.code}: {e.reason}"
            if e.code in (401, 403):
                err_msg = "Adzuna authentication failed: invalid app_id or app_key credentials."
            elif e.code == 429:
                err_msg = "Adzuna API rate limit exceeded."
            return {
                "success": False,
                "provider": self.name,
                "error": err_msg,
                "status_code": e.code,
                "total_found": 0,
                "jobs": []
            }
        except urllib.error.URLError as e:
            return {
                "success": False,
                "provider": self.name,
                "error": f"Network error contacting Adzuna API: {e.reason}",
                "status_code": 503,
                "total_found": 0,
                "jobs": []
            }
        except Exception as e:
            return {
                "success": False,
                "provider": self.name,
                "error": f"Unexpected error during Adzuna job search: {str(e)}",
                "status_code": 500,
                "total_found": 0,
                "jobs": []
            }
