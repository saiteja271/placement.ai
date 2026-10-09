import time
import uuid
import datetime
from typing import Dict, Any, List, Optional, Set
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import Job
from app.services.job_providers.base import BaseJobProvider, NormalizedJob
from app.services.job_providers.adzuna_provider import AdzunaJobProvider
from app.services.job_providers.jooble_provider import JoobleJobProvider

class JobProviderManager:
    """
    Central manager for external job search providers, local caching,
    deduplication, and synchronization with SQLite persistence.
    """
    _cache: Dict[str, Dict[str, Any]] = {}
    CACHE_TTL_SECONDS: int = 3600  # 1 hour cache

    def __init__(self):
        self.adzuna = AdzunaJobProvider()
        self.jooble = JoobleJobProvider()

    def get_active_provider(self) -> Optional[BaseJobProvider]:
        """
        Determines the active provider based on environment configuration.
        """
        config_provider = (settings.JOB_PROVIDER or "auto").strip().lower()

        if config_provider == "adzuna":
            return self.adzuna
        elif config_provider == "jooble":
            return self.jooble
        elif config_provider in ("local", "campus", "none"):
            return None

        # Auto detection: pick provider with valid credentials
        if self.adzuna.validate_credentials()["configured"]:
            return self.adzuna
        if self.jooble.validate_credentials()["configured"]:
            return self.jooble

        return None

    def get_status(self) -> Dict[str, Any]:
        """
        Reports current provider configuration status honestly without fabricating access.
        """
        adz_valid = self.adzuna.validate_credentials()["configured"]
        jbl_valid = self.jooble.validate_credentials()["configured"]
        active = self.get_active_provider()

        if active:
            return {
                "active_provider": active.name,
                "is_live_configured": True,
                "status": "LIVE_API_READY",
                "message": f"Connected to live provider '{active.name}' for real-world job discovery.",
                "supported_providers": ["Adzuna", "Jooble", "Campus Placement Cell"],
                "adzuna_configured": adz_valid,
                "jooble_configured": jbl_valid
            }
        else:
            return {
                "active_provider": "Campus Placement Cell",
                "is_live_configured": False,
                "status": "NO_CREDENTIALS",
                "message": (
                    "No live job provider API keys configured. Set ADZUNA_APP_ID & ADZUNA_APP_KEY "
                    "or JOOBLE_API_KEY in backend/.env for live vacancy searches. "
                    "Running in verified campus recruitment drives and cached records mode."
                ),
                "supported_providers": ["Adzuna", "Jooble", "Campus Placement Cell"],
                "adzuna_configured": adz_valid,
                "jooble_configured": jbl_valid
            }

    @staticmethod
    def _make_cache_key(query: str, location: Optional[str], page: int) -> str:
        q_norm = (query or "").strip().lower()
        loc_norm = (location or "").strip().lower()
        return f"{q_norm}::{loc_norm}::{page}"

    def search_jobs(
        self,
        query: str,
        location: Optional[str] = None,
        filters: Optional[dict] = None,
        page: int = 1,
        page_size: int = 10,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Searches jobs across live provider if configured, or searches database campus drives.
        Synchronizes live vacancies into SQLite so students can perform eligibility,
        gap analysis, and prep planning against them.
        """
        active_provider = self.get_active_provider()
        cache_key = self._make_cache_key(query, location, page)
        cached_entry = self._cache.get(cache_key)

        now = time.time()
        # 1. Check cache for live provider results
        if cached_entry and (now - cached_entry["timestamp"] < self.CACHE_TTL_SECONDS):
            cached_data = dict(cached_entry["data"])
            # Mark jobs as cached_provider
            for j in cached_data.get("jobs", []):
                j["source_type"] = "cached_provider"
            return cached_data

        # 2. Try live provider if available
        if active_provider:
            provider_result = active_provider.search(
                query=query,
                location=location,
                filters=filters,
                page=page,
                page_size=page_size
            )

            if provider_result.get("success"):
                jobs = provider_result.get("jobs", [])
                # Synchronize to DB if db session is provided
                if db and jobs:
                    self._sync_jobs_to_db(db, jobs)

                result_payload = {
                    "success": True,
                    "is_live": True,
                    "provider": active_provider.name,
                    "total_found": provider_result.get("total_found", len(jobs)),
                    "page": page,
                    "jobs": jobs,
                    "note": f"Live results retrieved directly from {active_provider.name} API."
                }
                self._cache[cache_key] = {"data": result_payload, "timestamp": now}
                return result_payload
            else:
                # Live provider returned an error (e.g. rate limit, bad key, network issue)
                # Fall back to DB search, but honestly report the provider failure!
                fallback_results = self._search_db_fallback(query, location, filters, db)
                return {
                    "success": True,
                    "is_live": False,
                    "provider": "Campus Placement Cell (Fallback)",
                    "provider_error": provider_result.get("error"),
                    "total_found": len(fallback_results),
                    "page": page,
                    "jobs": fallback_results,
                    "note": (
                        f"Live search via {active_provider.name} encountered an issue: {provider_result.get('error')}. "
                        "Displaying verified campus placement drives and cached records."
                    )
                }

        # 3. No live provider configured: search local DB campus drives
        db_results = self._search_db_fallback(query, location, filters, db)
        return {
            "success": True,
            "is_live": False,
            "provider": "Campus Placement Cell",
            "total_found": len(db_results),
            "page": page,
            "jobs": db_results,
            "note": (
                "Live job provider credentials are not configured in environment. "
                "Displaying verified campus recruitment drives and cached opportunities."
            )
        }

    def _sync_jobs_to_db(self, db: Session, jobs: List[Dict[str, Any]]):
        """
        Deduplicates and persists external provider vacancies into SQLite.
        """
        seen_ids: Set[str] = set()
        seen_signatures: Set[str] = set()

        for item in jobs:
            ext_id = item.get("external_job_id")
            title = (item.get("title") or "").strip()
            company = (item.get("company") or "").strip()
            loc = item.get("location")
            sig = f"{title.lower()}::{company.lower()}"

            # Check intra-batch duplication
            if (ext_id and ext_id in seen_ids) or (sig in seen_signatures):
                continue
            if ext_id:
                seen_ids.add(ext_id)
            if sig:
                seen_signatures.add(sig)

            # Check duplicate in DB by external_job_id
            existing = None
            if ext_id:
                existing = db.query(Job).filter(Job.external_job_id == ext_id).first()

            # Fallback duplicate check by title + company
            if not existing and title and company:
                existing = db.query(Job).filter(
                    Job.title.ilike(title),
                    Job.company.ilike(company)
                ).first()

            if not existing:
                job_id = f"EXT_{uuid.uuid4().hex[:6].upper()}"
                req_skills = item.get("required_skills", [])
                pref_skills = item.get("preferred_skills", [])
                deg_req = item.get("degree_requirements", ["B.Tech", "B.E.", "MCA"])
                branches = item.get("eligible_branches", ["Computer Science", "Information Technology"])

                new_job = Job(
                    id=job_id,
                    title=title,
                    company=company,
                    location=loc or "India",
                    work_mode=item.get("work_mode", "Full-time"),
                    degree_requirements=";".join(deg_req) if isinstance(deg_req, list) else str(deg_req),
                    eligible_branches=";".join(branches) if isinstance(branches, list) else str(branches),
                    min_cgpa=float(item.get("min_cgpa", 0.0)),
                    max_backlogs=int(item.get("max_backlogs", 99)),
                    graduation_year_min=int(item.get("graduation_year_min", 2024)),
                    graduation_year_max=int(item.get("graduation_year_max", 2028)),
                    experience_level=item.get("experience_level", "Fresher / Entry-Level"),
                    required_skills=";".join(req_skills) if isinstance(req_skills, list) else str(req_skills),
                    preferred_skills=";".join(pref_skills) if isinstance(pref_skills, list) else str(pref_skills),
                    salary_range=item.get("salary_range", "Competitive"),
                    description=item.get("description", ""),
                    source_type=item.get("source_type", "live_provider"),
                    provider_name=item.get("provider_name", "External Provider"),
                    external_job_id=ext_id,
                    original_url=item.get("original_url"),
                    posting_date=item.get("posting_date"),
                    retrieval_date=item.get("retrieval_date"),
                    freshness_status=item.get("freshness_status", "Verified Active")
                )
                db.add(new_job)
                # Assign internal ID back to dict item so callers have the DB ID
                item["id"] = job_id
            else:
                item["id"] = existing.id

        try:
            db.commit()
        except Exception:
            db.rollback()

    def _search_db_fallback(
        self,
        query: str,
        location: Optional[str],
        filters: Optional[dict],
        db: Optional[Session]
    ) -> List[Dict[str, Any]]:
        if not db:
            return []

        q = db.query(Job)
        query_text = (query or "").strip().lower()
        loc_text = (location or "").strip().lower()

        jobs = q.all()
        matched = []
        for j in jobs:
            corpus = f"{j.title} {j.company} {j.location} {j.required_skills} {j.preferred_skills} {j.description}".lower()
            if query_text and query_text != "all":
                # Match words
                words = [w for w in query_text.split() if len(w) > 2]
                if words and not any(w in corpus for w in words):
                    continue

            if loc_text and loc_text != "all":
                if loc_text not in (j.location or "").lower():
                    continue

            # Format to dict
            req_list = [s.strip() for s in (j.required_skills or "").split(";") if s.strip()]
            pref_list = [s.strip() for s in (j.preferred_skills or "").split(";") if s.strip()]
            deg_list = [s.strip() for s in (j.degree_requirements or "").split(";") if s.strip()]
            branch_list = [s.strip() for s in (j.eligible_branches or "").split(";") if s.strip()]

            matched.append({
                "id": j.id,
                "external_job_id": j.external_job_id,
                "title": j.title,
                "company": j.company,
                "location": j.location,
                "work_mode": j.work_mode,
                "degree_requirements": deg_list,
                "eligible_branches": branch_list,
                "min_cgpa": j.min_cgpa,
                "max_backlogs": j.max_backlogs,
                "graduation_year_min": j.graduation_year_min,
                "graduation_year_max": j.graduation_year_max,
                "experience_level": j.experience_level,
                "required_skills": req_list,
                "preferred_skills": pref_list,
                "salary_range": j.salary_range,
                "description": j.description,
                "original_url": j.original_url,
                "source_type": j.source_type or "campus_drive",
                "provider_name": j.provider_name or "Campus Placement Cell",
                "posting_date": j.posting_date,
                "retrieval_date": j.retrieval_date,
                "freshness_status": j.freshness_status or "Active"
            })

        return matched[:15]

# Singleton instance
job_provider_manager = JobProviderManager()
