import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Building2,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Job, JobProviderStatus } from '../types';

export const JobMatchesPage: React.FC = () => {
  const { currentStudent, openAgentDrawer } = useApp();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [providerStatus, setProviderStatus] = useState<JobProviderStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('all'); // all, eligible, saved
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  const loadJobs = async () => {
    if (!currentStudent) return;
    try {
      setIsLoading(true);
      const data = await api.getJobs({
        search: searchTerm,
        location: selectedLocation === 'all' ? undefined : selectedLocation,
        work_mode: selectedMode === 'all' ? undefined : selectedMode,
        eligibility_filter: eligibilityFilter,
        student_id: currentStudent.id,
      });
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [currentStudent, selectedLocation, selectedMode, eligibilityFilter]);

  useEffect(() => {
    api.getJobProviderStatus()
      .then((status) => setProviderStatus(status))
      .catch((err) => console.error('Failed to load job provider status:', err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleToggleSave = async (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentStudent) return;
    setSavingJobId(job.id);
    try {
      if (job.is_saved) {
        await api.unsaveJob(currentStudent.id, job.id);
      } else {
        await api.saveJob(currentStudent.id, job.id);
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, is_saved: !j.is_saved } : j))
      );
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    } finally {
      setSavingJobId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Job Matches & Discovery
          </h2>
          <p className="text-xs text-muted mt-1">
            Personalized role recommendations scored against your academic eligibility and verified skills.
          </p>
        </div>

        <button
          onClick={() => openAgentDrawer('Rank jobs by relevance and check my eligibility')}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-tint text-primary-app text-xs font-semibold border border-theme hover:bg-primary-app hover:text-white transition-all cursor-pointer shadow-subtle"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Agent to Match Jobs</span>
        </button>
      </div>

      {/* Real Job Intelligence Provider Status Banner */}
      {providerStatus && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-surface border border-theme text-xs shadow-subtle">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary-app shrink-0" />
            <span className="font-semibold text-ink">Job Data Source:</span>
            <span className="text-muted">
              {providerStatus.is_live_configured
                ? `Live Provider API (${providerStatus.active_provider})`
                : 'Verified Campus Drives & Placement Records'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              providerStatus.is_live_configured
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-surface-tint text-primary-app border border-theme'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${providerStatus.is_live_configured ? 'bg-emerald-500 animate-pulse' : 'bg-primary-app'}`} />
              <span>{providerStatus.is_live_configured ? 'Live API Connected' : 'Campus Mode'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Search Bar & Filters */}
      <div className="p-4 bg-surface rounded-2xl border border-theme shadow-subtle space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs, companies or roles (e.g. Google, Python, Data Analyst)..."
              className="w-full bg-canvas border border-theme rounded-xl pl-10 pr-3.5 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-app/40"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-app hover:opacity-90 text-white rounded-xl text-xs font-semibold shadow-subtle transition-opacity cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-theme">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center bg-canvas border border-theme p-1 rounded-xl text-xs">
              <button
                onClick={() => setEligibilityFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  eligibilityFilter === 'all'
                    ? 'bg-surface text-primary-app font-bold shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                All Opportunities
              </button>
              <button
                onClick={() => setEligibilityFilter('eligible')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  eligibilityFilter === 'eligible'
                    ? 'bg-surface text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Eligible Only
              </button>
              <button
                onClick={() => setEligibilityFilter('saved')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  eligibilityFilter === 'saved'
                    ? 'bg-surface text-primary-app font-bold shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Saved Jobs
              </button>
            </div>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-canvas border border-theme text-xs text-ink rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-app/40 cursor-pointer"
            >
              <option value="all">All Locations</option>
              <option value="bangalore">Bangalore</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="pune">Pune</option>
              <option value="remote">Remote</option>
            </select>

            {/* Mode Filter */}
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-canvas border border-theme text-xs text-ink rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-app/40 cursor-pointer"
            >
              <option value="all">All Work Modes</option>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <span className="text-xs text-muted">
            Showing {jobs.length} opportunities
          </span>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-app mx-auto" />
          <p className="text-xs text-muted">Evaluating opportunities against profile rules...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && jobs.length === 0 && (
        <div className="py-16 text-center bg-surface rounded-2xl border border-theme p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-tint text-muted flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-ink">
            No matching opportunities found
          </h4>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Try adjusting your search query, location filter, or switching back to "All Opportunities".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedLocation('all');
              setSelectedMode('all');
              setEligibilityFilter('all');
            }}
            className="px-4 py-2 bg-surface-tint hover:bg-theme-border text-ink text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-theme"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="p-4 sm:p-5 rounded-2xl bg-surface border border-theme hover:border-primary-app/60 shadow-subtle transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              {/* Top Row: Company Monogram, Title, Match Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-surface-tint border border-theme flex items-center justify-center font-bold text-base text-primary-app shrink-0">
                    {job.company[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-ink group-hover:text-primary-app transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-muted flex items-center gap-1.5 mt-0.5 truncate">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{job.company}</span>
                      <span>·</span>
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{job.location}</span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                        job.source_type === 'live_provider'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                          : job.source_type === 'cached_provider'
                          ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300'
                          : 'bg-surface-tint text-primary-app'
                      }`}>
                        <Globe className="w-2.5 h-2.5" />
                        <span>{job.provider_name || 'Campus Placement Cell'}</span>
                      </span>
                      {job.posting_date && (
                        <span className="text-[10px] text-muted">
                          • {job.posting_date.includes('T') ? new Date(job.posting_date).toLocaleDateString() : job.posting_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Score Circle */}
                <div className="flex flex-col items-end shrink-0">
                  <div className="w-10 h-10 rounded-full bg-surface-tint border border-theme flex items-center justify-center font-extrabold text-xs text-primary-app">
                    {job.match_score}%
                  </div>
                  <span className="text-[10px] text-muted mt-0.5">Match</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 my-3">
                {job.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-canvas text-ink border border-theme"
                  >
                    {skill}
                  </span>
                ))}
                {job.preferred_skills.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-canvas/60 text-muted border border-dashed border-theme"
                  >
                    +{skill}
                  </span>
                ))}
              </div>

              {/* Match reasons snippet */}
              {job.match_reasons && job.match_reasons.length > 0 && (
                <p className="text-[11px] text-muted italic mb-3">
                  • {job.match_reasons[0]}
                </p>
              )}
            </div>

            {/* Bottom Row: Eligibility Badge & Actions */}
            <div className="pt-3 border-t border-theme flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    job.is_eligible
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                      : job.eligibility_status === 'CONDITIONAL'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400'
                  }`}
                >
                  {job.is_eligible ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : job.eligibility_status === 'CONDITIONAL' ? (
                    <HelpCircle className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{job.eligibility_status}</span>
                </span>
                <span className="text-[11px] font-medium text-muted">
                  {job.salary_range}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleSave(job, e)}
                  title={job.is_saved ? 'Unsave Job' : 'Save Job'}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    job.is_saved
                      ? 'bg-surface-tint border-primary-app text-primary-app'
                      : 'border-theme text-muted hover:text-ink'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${job.is_saved ? 'fill-current' : ''}`} />
                </button>

                {job.original_url && job.original_url.startsWith('http') && (
                  <a
                    href={job.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2.5 py-1.5 bg-surface-tint hover:bg-primary-app hover:text-white text-primary-app text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-theme"
                    title="Apply directly on original posting"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="hidden sm:inline text-[11px]">Apply</span>
                  </a>
                )}

                <button
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="px-3 py-1.5 bg-surface-tint hover:bg-primary-app hover:text-white text-ink text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-theme"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
