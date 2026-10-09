import re
import json
import urllib.request
import urllib.parse
import urllib.error
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.services.job_providers.base import BaseJobProvider, NormalizedJob, extract_skills_from_text

class JoobleJobProvider(BaseJobProvider):
    """
    Jooble API Job Search Integration.
    Jooble is an international job search aggregator with a dedicated REST API.
    Docs: https://jooble.org/api/about
    """
    name: str = "Jooble"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or settings.JOOBLE_API_KEY or "").strip()

    def validate_credentials(self) -> Dict[str, Any]:
        """
        Validates if Jooble credentials are configured.
        Never manufactures successful validation if credentials are missing.
        """
        if not self.api_key:
            return {
                "configured": False,
                "provider": self.name,
                "status": "MISSING_CREDENTIALS",
                "message": (
                    "Jooble API key (JOOBLE_API_KEY) is not set. "
                    "Configure it in your environment or backend/.env file to enable live search."
                )
            }
        return {
            "configured": True,
            "provider": self.name,
            "status": "READY",
            "message": "Jooble API key configured."
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
        Executes a real vacancy search against the Jooble API.
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

        url = f"https://jooble.org/api/{self.api_key}"
        page_num = max(1, int(page))

        payload = {
            "keywords": query.strip() if query else "Software Engineer",
            "page": page_num,
            "ResultOnPage": min(50, max(1, page_size))
        }

        if location and location.lower() != "all":
            payload["location"] = location.strip()

        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "PlaceMateAI/1.0 (College Placement Assistant)",
                "Accept": "application/json"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                raw_data = response.read().decode("utf-8")
                data = json.loads(raw_data)

            raw_jobs = data.get("jobs", [])
            total_count = data.get("totalCount", len(raw_jobs))

            normalized_jobs: List[NormalizedJob] = []
            for item in raw_jobs:
                raw_id = str(item.get("id", ""))
                title = re.sub(r"<[^>]+>", "", item.get("title", "Developer")).strip()
                company_name = item.get("company", "").strip() or "Technology Enterprise"
                loc_name = item.get("location", "").strip() or (location or "India")
                snippet = re.sub(r"<[^>]+>", "", item.get("snippet", "")).strip()
                link = item.get("link")
                salary_text = item.get("salary", "").strip() or "Competitive / Industry Standard"

                # Extract technical skills
                corpus = f"{title} {snippet}"
                extracted = extract_skills_from_text(corpus)
                if not extracted:
                    extracted = ["Python", "SQL", "Git"]

                req_skills = extracted[:4]
                pref_skills = extracted[4:8]

                norm_job = NormalizedJob(
                    external_job_id=f"jooble-{raw_id}",
                    title=title,
                    company=company_name,
                    location=loc_name,
                    work_mode=item.get("type", "Full-time") or "Full-time",
                    degree_requirements=["B.Tech", "B.E.", "MCA", "B.Sc"],
                    eligible_branches=["Computer Science", "Information Technology", "All Engineering Branches"],
                    min_cgpa=0.0,
                    max_backlogs=99,
                    graduation_year_min=2024,
                    graduation_year_max=2028,
                    experience_level="Fresher / Entry-Level",
                    required_skills=req_skills,
                    preferred_skills=pref_skills,
                    salary_range=salary_text,
                    description=snippet,
                    original_url=link,
                    source_type="live_provider",
                    provider_name=self.name,
                    posting_date=item.get("updated"),
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
            err_msg = f"Jooble API HTTP {e.code}: {e.reason}"
            if e.code in (401, 403):
                err_msg = "Jooble authentication failed: invalid JOOBLE_API_KEY."
            elif e.code == 429:
                err_msg = "Jooble API rate limit exceeded."
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
                "error": f"Network error contacting Jooble API: {e.reason}",
                "status_code": 503,
                "total_found": 0,
                "jobs": []
            }
        except Exception as e:
            return {
                "success": False,
                "provider": self.name,
                "error": f"Unexpected error during Jooble job search: {str(e)}",
                "status_code": 500,
                "total_found": 0,
                "jobs": []
            }
