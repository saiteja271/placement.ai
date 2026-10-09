import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  CalendarCheck,
  LineChart,
  ShieldAlert,
  ShieldCheck,
  Check,
  Info,
  ExternalLink,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Job, EligibilityResult } from '../types';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentStudent, openAgentDrawer } = useApp();

  const [job, setJob] = useState<Job | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'eligibility' | 'overview' | 'skills'>('eligibility');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!id || !currentStudent) return;
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        const [jobData, eligData] = await Promise.all([
          api.getJob(id, currentStudent.id),
          api.checkEligibility(id, currentStudent.id),
        ]);
        setJob(jobData);
        setEligibility(eligData);
        setIsSaved(!!jobData.is_saved);
      } catch (err) {
        console.error('Failed to load job details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetails();
  }, [id, currentStudent]);

  const handleToggleSave = async () => {
    if (!job || !currentStudent) return;
    try {
      if (isSaved) {
        await api.unsaveJob(currentStudent.id, job.id);
        setIsSaved(false);
      } else {
        await api.saveJob(currentStudent.id, job.id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  if (isLoading || !job) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading opportunity details and running deterministic eligibility rules...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/jobs')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary-app transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Job Matches</span>
      </button>

      {/* Hero Header Card */}
      <div className="p-5 sm:p-6 md:p-8 bg-surface rounded-3xl border border-theme shadow-subtle space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface-tint text-primary-app flex items-center justify-center font-bold text-xl sm:text-2xl border border-theme shadow-xs shrink-0">
              {job.company[0]}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ink">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-1">
                <span className="font-semibold text-ink">
                  {job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted" />
                  {job.location}
                </span>
                <span>•</span>
                <span>{job.work_mode}</span>
                <span>•</span>
                <span className="font-medium text-ink">
                  {job.salary_range}
                </span>
              </div>

              {/* Provenance Badge & Posting Date */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-semibold border ${
                  job.source_type === 'live_provider'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900'
                    : job.source_type === 'cached_provider'
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-900'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                }`}>
                  <Globe className="w-3 h-3" />
                  <span>Source: {job.provider_name || 'Campus Placement Cell'}</span>
                </span>
                {job.posting_date && (
                  <span className="text-muted">
                    Published: {job.posting_date.includes('T') ? new Date(job.posting_date).toLocaleDateString() : job.posting_date}
                  </span>
                )}
                {job.freshness_status && (
                  <span className="text-muted border-l border-theme pl-2">
                    {job.freshness_status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Match Score & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-surface-tint border border-theme">
              <span className="text-base sm:text-lg font-extrabold text-primary-app">
                {job.match_score}%
              </span>
              <span className="text-[10px] font-semibold text-primary-app leading-tight">
                Match<br />Score
              </span>
            </div>

            <button
              onClick={handleToggleSave}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-surface-tint border-primary-app text-primary-app'
                  : 'border-theme text-muted hover:text-ink'
              }`}
              title={isSaved ? 'Unsave' : 'Save'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {job.original_url && job.original_url.startsWith('http') && (
              <a
                href={job.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-surface-tint border border-primary-app/50 text-primary-app hover:bg-primary-app hover:text-white text-xs font-bold shadow-subtle transition-all cursor-pointer"
                title="Apply directly on the original job board"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Apply on Original Site</span>
              </a>
            )}

            <button
              onClick={() => navigate(`/prep?jobId=${job.id}`)}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-primary-app hover:opacity-90 text-white text-xs font-bold shadow-subtle transition-opacity cursor-pointer"
            >
              Prepare Me for This Role
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-theme pt-2 gap-4 sm:gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'eligibility'
                ? 'border-primary-app text-primary-app'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Eligibility Criteria ({eligibility?.criteria.length || 4})</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-primary-app text-primary-app'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Required & Preferred Skills</span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-primary-app text-primary-app'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Role Overview & Company</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Eligibility Checker Table */}
      {activeTab === 'eligibility' && eligibility && (
        <div className="space-y-4">
          {/* Eligibility Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              eligibility.is_eligible
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : eligibility.status === 'CONDITIONAL'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {eligibility.is_eligible ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : eligibility.status === 'CONDITIONAL' ? (
                <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  Overall Status: {eligibility.status}
                </span>
                <span className="text-[11px] opacity-90">{eligibility.summary}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="font-semibold block">Deterministic Rule Engine</span>
              <span className="text-[10px] opacity-75">No hallucinated criteria</span>
            </div>
          </div>

          {/* Critical invariant notice */}
          {eligibility.failed_mandatory && job.match_score && job.match_score >= 70 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                <strong>Mandatory Enforcement:</strong> Even though your profile matches {job.match_score}% of requested skills, you do not meet one or more mandatory eligibility gates. High match scores never override mandatory company thresholds.
              </span>
            </div>
          )}

          {/* Criteria Breakdown - Responsive View */}
          <div className="bg-surface rounded-2xl border border-theme overflow-hidden shadow-subtle">
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-theme bg-surface-tint/50 text-xs font-bold text-muted uppercase tracking-wider">
              <span className="col-span-3">Criterion</span>
              <span className="col-span-3">Company Requirement</span>
              <span className="col-span-3">Your Value</span>
              <span className="col-span-3 text-right">Status</span>
            </div>

            {/* Criteria Rows */}
            <div className="divide-y divide-theme">
              {eligibility.criteria.map((crit) => (
                <div key={crit.criterion_name} className="p-4">
                  {/* Desktop Grid Layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center text-xs">
                    <div className="col-span-3">
                      <span className="font-bold text-ink block">
                        {crit.criterion_name}
                      </span>
                      <span className="text-[10px] text-muted">Mandatory Gate</span>
                    </div>

                    <div className="col-span-3 text-ink font-medium">
                      {crit.required_value}
                    </div>

                    <div className="col-span-3 text-ink font-semibold">
                      {crit.student_value}
                    </div>

                    <div className="col-span-3 flex flex-col items-end">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          crit.status === 'MET'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : crit.status === 'UNKNOWN'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400'
                        }`}
                      >
                        {crit.status === 'MET' && <Check className="w-3 h-3" />}
                        {crit.status === 'UNKNOWN' && <HelpCircle className="w-3 h-3" />}
                        {crit.status === 'NOT_MET' && <XCircle className="w-3 h-3" />}
                        <span>{crit.status}</span>
                      </span>
                      <span className="text-[10px] text-muted mt-1 text-right">
                        {crit.explanation}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Stacked Card Layout */}
                  <div className="md:hidden space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-ink block">
                          {crit.criterion_name}
                        </span>
                        <span className="text-[10px] text-muted">Mandatory Gate</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          crit.status === 'MET'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                            : crit.status === 'UNKNOWN'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-400'
                        }`}
                      >
                        {crit.status === 'MET' && <Check className="w-3 h-3" />}
                        {crit.status === 'UNKNOWN' && <HelpCircle className="w-3 h-3" />}
                        {crit.status === 'NOT_MET' && <XCircle className="w-3 h-3" />}
                        <span>{crit.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-canvas p-2.5 rounded-xl border border-theme text-[11px]">
                      <div>
                        <span className="text-muted block text-[10px]">Required:</span>
                        <span className="font-medium text-ink">{crit.required_value}</span>
                      </div>
                      <div>
                        <span className="text-muted block text-[10px]">Your Record:</span>
                        <span className="font-bold text-ink">{crit.student_value}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted">
                      {crit.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skills Breakdown */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-5 sm:p-6 rounded-2xl border border-theme shadow-subtle">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Required Core Skills (Mandatory)
            </h3>
            <div className="space-y-2">
              {job.required_skills.map((s) => {
                const isMatched = currentStudent?.skills?.some(
                  (cs) => cs.toLowerCase() === s.toLowerCase()
                ) ?? false;
                return (
                  <div
                    key={s}
                    className="p-3 rounded-xl bg-canvas border border-theme flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-ink">{s}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isMatched
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                      }`}
                    >
                      {isMatched ? 'Demonstrated' : 'Missing Gap'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Preferred Bonus Skills (Competitive Advantage)
            </h3>
            <div className="space-y-2">
              {job.preferred_skills.map((s) => {
                const isMatched = currentStudent?.skills?.some(
                  (cs) => cs.toLowerCase() === s.toLowerCase()
                ) ?? false;
                return (
                  <div
                    key={s}
                    className="p-3 rounded-xl bg-canvas border border-theme flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-ink">{s}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isMatched
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                          : 'bg-surface-tint text-muted'
                      }`}
                    >
                      {isMatched ? 'Demonstrated' : 'Optional Gap'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Overview */}
      {activeTab === 'overview' && (
        <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-theme space-y-4 text-xs leading-relaxed text-muted shadow-subtle">
          <h3 className="font-bold text-sm text-ink">
            Job Description & Overview
          </h3>
          <p>{job.description}</p>
          <div className="pt-4 border-t border-theme grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-muted block text-[11px]">Experience Level</span>
              <span className="text-ink font-medium">{job.experience_level}</span>
            </div>
            <div>
              <span className="font-semibold text-muted block text-[11px]">Permitted Backlogs</span>
              <span className="text-ink font-medium">Max {job.max_backlogs}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

