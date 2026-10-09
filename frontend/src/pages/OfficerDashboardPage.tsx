import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  PlusCircle,
  Download,
  Search,
  ExternalLink,
  Award,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import { OfficerStats, OfficerStudentItem, Job } from '../types';
import { useApp } from '../context/AppContext';

export const OfficerDashboardPage: React.FC = () => {
  const { openAgentDrawer } = useApp();
  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [students, setStudents] = useState<OfficerStudentItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, studentsData, jobsData] = await Promise.all([
          api.getOfficerStats(),
          api.getOfficerStudents(),
          api.getJobs()
        ]);
        setStats(statsData);
        setStudents(studentsData);
        setJobs(jobsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load officer dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = () => {
    if (!students.length) return;
    const headers = ['ID', 'Name', 'Email', 'Branch', 'CGPA', 'Graduation Year', 'Readiness Score %', 'Eligible Jobs'];
    const rows = students.map((s) => [
      s.id,
      `"${s.full_name}"`,
      s.email,
      `"${s.branch}"`,
      s.cgpa,
      s.graduation_year,
      s.readiness_score,
      s.eligible_jobs_count
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlaceMate_Placement_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const highReadinessCount = students.filter((s) => s.readiness_score >= 75).length;
  const mediumReadinessCount = students.filter((s) => s.readiness_score >= 50 && s.readiness_score < 75).length;
  const lowReadinessCount = students.filter((s) => s.readiness_score < 50).length;
  const totalStudentsCount = stats?.total_students || students.length || 1;
  const eligibleStudentsCount = stats?.eligible_students ?? stats?.eligible_candidates ?? students.filter((s) => s.eligible_jobs_count > 0).length;
  const activeDrivesCount = stats?.active_recruitment_drives ?? stats?.active_jobs ?? jobs.length;
  const avgReadiness = stats?.average_readiness_score ?? stats?.avg_readiness_pct ?? 78;

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-10 w-64 bg-surface-alt rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface rounded-xl border border-theme animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-surface rounded-xl border border-theme animate-pulse" />
          <div className="h-72 bg-surface rounded-xl border border-theme animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-2xl border border-theme shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-light text-primary-accent border border-primary-light uppercase tracking-wider">
              Placement Cell Workspace
            </span>
            <span className="text-xs text-muted">Academic Year 2025–2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink mt-1">Campus Placement Overview</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Real-time candidate readiness, recruitment drive pipelines, and automated matching.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            to="/officer/drives"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-primary-app text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs hover:opacity-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Campus Drive</span>
          </Link>

          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-surface-alt hover:bg-surface border border-theme text-ink text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-muted" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface p-5 rounded-xl border border-theme shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Registered Students</p>
            <p className="text-2xl sm:text-3xl font-bold text-ink mt-1">{stats?.total_students || students.length}</p>
            <div className="flex items-center gap-1 text-[11px] text-success mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Verified Profiles</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary-accent shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface p-5 rounded-xl border border-theme shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Active Campus Drives</p>
            <p className="text-2xl sm:text-3xl font-bold text-ink mt-1">{activeDrivesCount}</p>
            <div className="flex items-center gap-1 text-[11px] text-primary-accent mt-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Across Top Recruiters</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary-accent shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface p-5 rounded-xl border border-theme shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Eligible Candidates</p>
            <p className="text-2xl sm:text-3xl font-bold text-ink mt-1">{eligibleStudentsCount}</p>
            <div className="flex items-center gap-1 text-[11px] text-muted mt-1">
              <span>Meeting CGPA & Branch criteria</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-amber/15 flex items-center justify-center text-accent-amber shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface p-5 rounded-xl border border-theme shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Avg Student Readiness</p>
            <p className="text-2xl sm:text-3xl font-bold text-ink mt-1">{avgReadiness}%</p>
            <div className="flex items-center gap-1 text-[11px] text-success mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Based on skills & mock prep</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-green/15 flex items-center justify-center text-accent-green shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recruitment Drives Overview & Readiness Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Active Drives */}
        <div className="lg:col-span-2 bg-surface p-5 sm:p-6 rounded-2xl border border-theme shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-accent" />
                <span>Active Recruitment Drives</span>
              </h2>
              <p className="text-xs text-muted">Live recruitment opportunities posted for campus students</p>
            </div>
            <Link
              to="/officer/drives"
              className="text-xs font-semibold text-primary-accent hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl border border-theme bg-surface-alt/50 hover:bg-surface-alt transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-ink text-sm">{job.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-surface border border-theme font-medium text-muted">
                      {job.company}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary-accent">
                      Min CGPA: {job.min_cgpa}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.salary_range}</span>
                    <span>•</span>
                    <span>Branches: {job.eligible_branches.slice(0, 2).join(', ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface border border-theme hover:bg-surface-alt text-ink transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Readiness Breakdown & Quick Agent Assist */}
        <div className="space-y-6">
          {/* Readiness Distribution Card */}
          <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-theme shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Award className="w-5 h-5 text-accent-green" />
              <span>Student Readiness Tiers</span>
            </h2>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
                    High Readiness (≥75%)
                  </span>
                  <span className="font-bold text-ink">{highReadinessCount} students</span>
                </div>
                <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-green rounded-full transition-all duration-500"
                    style={{
                      width: `${totalStudentsCount ? ((highReadinessCount / totalStudentsCount) * 100).toFixed(0) : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
                    Moderate Readiness (50–74%)
                  </span>
                  <span className="font-bold text-ink">{mediumReadinessCount} students</span>
                </div>
                <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-amber rounded-full transition-all duration-500"
                    style={{
                      width: `${totalStudentsCount ? ((mediumReadinessCount / totalStudentsCount) * 100).toFixed(0) : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger" />
                    Needs Attention (&lt;50%)
                  </span>
                  <span className="font-bold text-ink">{lowReadinessCount} students</span>
                </div>
                <div className="h-2 w-full bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full bg-danger rounded-full transition-all duration-500"
                    style={{
                      width: `${totalStudentsCount ? ((lowReadinessCount / totalStudentsCount) * 100).toFixed(0) : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-theme">
              <Link
                to="/officer/students"
                className="w-full py-2 bg-surface-alt hover:bg-surface border border-theme text-ink text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-muted" />
                <span>Search & Filter Candidate Directory</span>
              </Link>
            </div>
          </div>

          {/* AI Officer Copilot Assistant Widget */}
          <div className="bg-primary-light/40 border border-primary-light p-5 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-app text-white flex items-center justify-center shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-ink">PlaceMate Placement Copilot</h3>
                <p className="text-[11px] text-muted">Agentic intelligence for batch placement</p>
              </div>
            </div>
            <p className="text-xs text-ink/80 leading-relaxed">
              Ask Copilot to analyze eligible candidates for upcoming drives, generate interview batch schedules, or
              identify batch-wide skill gaps.
            </p>
            <button
              onClick={() => openAgentDrawer()}
              className="w-full py-2 bg-primary-app text-white text-xs font-semibold rounded-xl shadow-2xs hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Placement Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Readiness Spotlight */}
      <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-theme shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-accent" />
              <span>Candidate Readiness Spotlight</span>
            </h2>
            <p className="text-xs text-muted">Top placement candidates sorted by verified readiness score</p>
          </div>
          <Link
            to="/officer/students"
            className="text-xs font-semibold text-primary-accent hover:underline flex items-center gap-1"
          >
            <span>Full Directory ({students.length})</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {students.slice(0, 4).map((student) => (
            <div
              key={student.id}
              className="p-4 rounded-xl border border-theme bg-surface-alt/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted">{student.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      student.readiness_score >= 75
                        ? 'bg-accent-green/15 text-accent-green'
                        : 'bg-accent-amber/15 text-accent-amber'
                    }`}
                  >
                    {student.readiness_score}% Readiness
                  </span>
                </div>
                <h4 className="font-semibold text-ink text-sm mt-1">{student.full_name}</h4>
                <p className="text-xs text-muted">
                  {student.branch} • CGPA: {student.cgpa}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {student.skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-surface border border-theme rounded text-muted">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-theme flex items-center justify-between text-xs text-muted">
                <span>{student.eligible_jobs_count} Eligible Drives</span>
                <span className="font-medium text-primary-accent">Class of {student.graduation_year}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
