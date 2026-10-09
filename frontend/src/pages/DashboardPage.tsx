import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ShieldCheck,
  CalendarCheck,
  BotMessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  MapPin
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Job } from '../types';

export const DashboardPage: React.FC = () => {
  const { currentStudent, openAgentDrawer } = useApp();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!currentStudent) return;
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await api.getJobs({ student_id: currentStudent.id });
        setJobs(data);
      } catch (err) {
        console.error('Failed to load dashboard jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [currentStudent]);

  if (!currentStudent) {
    return (
      <div className="p-8 text-center text-xs text-muted">
        Loading student profile...
      </div>
    );
  }

  const eligibleJobsCount = jobs.filter((j) => j.is_eligible).length;
  const readiness = currentStudent.readiness_score || 78;

  // Proportionate compact SVG Gauge calculations (104px box)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      {/* Personalized Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Hello, {currentStudent.full_name}! 👋
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Placement readiness summary for the upcoming recruitment cycle.
          </p>
        </div>

        <button
          onClick={() => openAgentDrawer('Assess my current placement readiness and top 3 jobs')}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-app hover:bg-primary-hover text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Agent Copilot</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="p-3.5 rounded-xl bg-surface border border-theme card-shadow">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted">
              Job Matches
            </span>
            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-ink">
            {jobs.length}
          </div>
          <p className="text-[10px] text-muted mt-0.5">
            Indexed opportunities
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 rounded-xl bg-surface border border-theme card-shadow">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted">
              Eligible Jobs
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-ink">
            {eligibleJobsCount}
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
            Passed mandatory gates
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 rounded-xl bg-surface border border-theme card-shadow">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted">
              Core Skill Gaps
            </span>
            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-ink">
            3
          </div>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5 truncate">
            DSA, System Design, Cloud
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-3.5 rounded-xl bg-surface border border-theme card-shadow">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted">
              Days to Prepare
            </span>
            <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-ink">
            24
          </div>
          <p className="text-[10px] text-muted mt-0.5">
            Target drive deadline
          </p>
        </div>
      </div>

      {/* Main Grid: Gauge & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Placement Readiness Gauge Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-theme card-shadow flex flex-col items-center justify-center text-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              Placement Readiness
            </h3>
            <div title="Formula: 35% Profile Completeness, 40% Eligibility Pass Rate, 25% Prep Plan Tasks">
              <Info className="w-3.5 h-3.5 text-muted cursor-help" />
            </div>
          </div>

          {/* Compact Circular Gauge */}
          <div className="relative w-28 h-28 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r={radius}
                className="stroke-surface-alt"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="56"
                cy="56"
                r={radius}
                style={{ stroke: 'var(--primary)' }}
                className="transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-ink leading-none">
                {readiness}%
              </span>
              <span className="text-[10px] font-bold text-emerald-600 mt-0.5">
                On Track
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted font-medium mt-1 leading-relaxed">
            Close your 3 core skill gaps to maximize placement matching.
          </p>

          <div className="mt-3 pt-3 border-t border-theme w-full text-left space-y-1 text-[10px] text-muted">
            <div className="flex justify-between">
              <span>Profile Completeness</span>
              <span className="font-semibold text-ink">92%</span>
            </div>
            <div className="flex justify-between">
              <span>Eligibility Rate</span>
              <span className="font-semibold text-ink">
                {Math.round((eligibleJobsCount / Math.max(1, jobs.length)) * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Calculation Engine</span>
              <span className="font-semibold text-primary-accent">Deterministic</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-surface border border-theme card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Quick Actions
                </h3>
                <p className="text-[11px] text-muted mt-0.5">
                  Launch the 4 core workflows tailored to your profile:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate('/jobs')}
                className="p-3 rounded-xl bg-surface-alt border border-theme hover:border-primary-app text-left transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-light text-primary-accent border border-primary-app flex items-center justify-center mb-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-ink group-hover:text-primary-app transition-colors">
                  View Job Matches
                </h4>
                <p className="text-[11px] text-muted mt-0.5">
                  Explore {jobs.length} roles scored against your degree & CGPA.
                </p>
              </button>

              <button
                onClick={() => navigate('/skills')}
                className="p-3 rounded-xl bg-surface-alt border border-theme hover:border-primary-app text-left transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-ink group-hover:text-primary-app transition-colors">
                  Analyze Skill Gaps
                </h4>
                <p className="text-[11px] text-muted mt-0.5">
                  Diagnose missing requirements with targeted exercises.
                </p>
              </button>

              <button
                onClick={() => navigate('/prep')}
                className="p-3 rounded-xl bg-surface-alt border border-theme hover:border-primary-app text-left transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-1.5">
                  <CalendarCheck className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-ink group-hover:text-primary-app transition-colors">
                  Start Interview Prep
                </h4>
                <p className="text-[11px] text-muted mt-0.5">
                  Access 4-week daily tasks with persistent milestones.
                </p>
              </button>

              <button
                onClick={() => navigate('/mock-interview')}
                className="p-3 rounded-xl bg-surface-alt border border-theme hover:border-primary-app text-left transition-all hover:shadow-2xs group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-1.5">
                  <BotMessageSquare className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-ink group-hover:text-primary-app transition-colors">
                  Take a Mock Interview
                </h4>
                <p className="text-[11px] text-muted mt-0.5">
                  Practice timed technical & HR questions with rubric scores.
                </p>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-theme flex flex-wrap items-center justify-between text-[11px] text-muted gap-2">
            <span>Target Role: <strong className="text-ink">{currentStudent.preferred_role}</strong></span>
            <span>Branch: <strong className="text-ink">{currentStudent.branch}</strong> · CGPA: <strong className="text-ink">{currentStudent.cgpa}</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Top Matched */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="p-4 rounded-2xl bg-surface border border-theme card-shadow">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
            Recent System Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase className="w-3 h-3" />
              </div>
              <div className="text-[11px]">
                <p className="font-semibold text-ink">
                  Analyzed {jobs.length} opportunities
                </p>
                <span className="text-[10px] text-muted">2 hours ago</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <div className="text-[11px]">
                <p className="font-semibold text-ink">
                  Deterministic check passed for Google SDE
                </p>
                <span className="text-[10px] text-muted">5 hours ago</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3" />
              </div>
              <div className="text-[11px]">
                <p className="font-semibold text-ink">
                  Agent executed 5-step bounded tool trace
                </p>
                <span className="text-[10px] text-muted">1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Matched Opportunities */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-surface border border-theme card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
              Top Matched Opportunities
            </h3>
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs font-semibold text-primary-accent hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="p-3 rounded-xl border border-theme hover:border-primary-app bg-surface-alt flex items-center justify-between gap-3 transition-all hover:shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-surface border border-theme flex items-center justify-center font-bold text-xs text-primary-app shrink-0 shadow-2xs">
                    {job.company[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-ink truncate">
                      {job.title}
                    </h4>
                    <p className="text-[11px] text-muted truncate">
                      {job.company} · {job.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      job.is_eligible
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : job.eligibility_status === 'CONDITIONAL'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {job.eligibility_status}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-primary-accent">
                      {job.match_score}%
                    </span>
                    <span className="block text-[9px] text-muted leading-none">Match</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
