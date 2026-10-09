import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Mail,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { OfficerStudentItem } from '../types';
import { useApp } from '../context/AppContext';

export const OfficerStudentsPage: React.FC = () => {
  const { selectStudent } = useApp();
  const [students, setStudents] = useState<OfficerStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [minCgpa, setMinCgpa] = useState<number>(0);
  const [readinessTier, setReadinessTier] = useState<string>('ALL');

  // Selected student modal
  const [activeStudentModal, setActiveStudentModal] = useState<OfficerStudentItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await api.getOfficerStudents();
        setStudents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Unique branches
  const branches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.branch));
    return Array.from(set);
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBranch = selectedBranch === 'ALL' || s.branch === selectedBranch;
      const matchesCgpa = s.cgpa >= minCgpa;

      let matchesTier = true;
      if (readinessTier === 'HIGH') matchesTier = s.readiness_score >= 75;
      else if (readinessTier === 'MEDIUM') matchesTier = s.readiness_score >= 50 && s.readiness_score < 75;
      else if (readinessTier === 'LOW') matchesTier = s.readiness_score < 50;

      return matchesSearch && matchesBranch && matchesCgpa && matchesTier;
    });
  }, [students, searchQuery, selectedBranch, minCgpa, readinessTier]);

  const handleExportCSV = () => {
    if (!filteredStudents.length) return;
    const headers = ['ID', 'Name', 'Email', 'Branch', 'CGPA', 'Graduation Year', 'Readiness Score %', 'Eligible Jobs', 'Skills'];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.full_name}"`,
      s.email,
      `"${s.branch}"`,
      s.cgpa,
      s.graduation_year,
      s.readiness_score,
      s.eligible_jobs_count,
      `"${s.skills.join(', ')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlaceMate_Candidates_Filtered_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendInterviewNotification = (student: OfficerStudentItem) => {
    setActionNotice(`Interview notification dispatch sent to ${student.full_name} (${student.email})`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-2xl border border-theme shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-light text-primary-accent border border-primary-light uppercase tracking-wider">
              Talent Directory
            </span>
            <span className="text-xs text-muted">{students.length} Total Verified Candidates</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink mt-1">Campus Candidate Directory</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Filter, verify eligibility, inspect skills, and shortlist candidates for campus recruitment drives.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-surface-alt hover:bg-surface border border-theme text-ink text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-muted" />
          <span>Export Filtered ({filteredStudents.length})</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 bg-accent-green/10 border border-accent-green/30 text-ink rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs font-semibold text-muted hover:text-ink">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar Controls */}
      <div className="bg-surface p-4 sm:p-5 rounded-2xl border border-theme shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by candidate name, ID, email, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-alt border border-theme rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary-accent"
            />
          </div>

          {/* Branch Dropdown */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-xs sm:text-sm text-ink focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Engineering Branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Readiness Tier Dropdown */}
          <div>
            <select
              value={readinessTier}
              onChange={(e) => setReadinessTier(e.target.value)}
              className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-xs sm:text-sm text-ink focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Readiness Tiers</option>
              <option value="HIGH">High Readiness (≥75%)</option>
              <option value="MEDIUM">Moderate Readiness (50-74%)</option>
              <option value="LOW">Needs Attention (&lt;50%)</option>
            </select>
          </div>
        </div>

        {/* CGPA Slider & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-theme text-xs text-muted">
          <div className="flex items-center gap-3">
            <span className="font-medium text-ink">Minimum CGPA Cutoff:</span>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minCgpa}
              onChange={(e) => setMinCgpa(parseFloat(e.target.value))}
              className="w-32 accent-primary-app cursor-pointer"
            />
            <span className="font-bold text-ink px-2 py-0.5 bg-surface-alt border border-theme rounded">
              {minCgpa > 0 ? `≥ ${minCgpa}` : 'None'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>Showing {filteredStudents.length} of {students.length} candidates</span>
            {(searchQuery || selectedBranch !== 'ALL' || minCgpa > 0 || readinessTier !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBranch('ALL');
                  setMinCgpa(0);
                  setReadinessTier('ALL');
                }}
                className="text-xs text-primary-accent hover:underline font-semibold ml-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Candidates List / Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-surface rounded-xl border border-theme animate-pulse" />
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-surface p-12 rounded-2xl border border-theme text-center space-y-3">
          <Users className="w-10 h-10 text-muted mx-auto" />
          <h3 className="text-base font-bold text-ink">No Candidates Match Filters</h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Try lowering your CGPA cutoff or clearing search keywords to see all registered college students.
          </p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-theme overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-alt/60 border-b border-theme text-[11px] font-bold text-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Branch & Batch</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Verified Skills</th>
                  <th className="py-3 px-4">Readiness</th>
                  <th className="py-3 px-4">Eligible Drives</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme text-xs">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-alt/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-ink text-sm">{s.full_name}</div>
                        <div className="text-[11px] text-muted flex items-center gap-1.5">
                          <span className="font-mono">{s.id}</span>
                          <span>•</span>
                          <span>{s.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-ink">
                      <div>{s.branch}</div>
                      <div className="text-[11px] text-muted">Class of {s.graduation_year}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-ink px-2 py-0.5 rounded bg-surface-alt border border-theme">
                        {s.cgpa}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {s.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-surface-alt border border-theme text-muted"
                          >
                            {skill}
                          </span>
                        ))}
                        {s.skills.length > 3 && (
                          <span className="text-[10px] px-1 py-0.5 text-muted">+{s.skills.length - 3}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-ink">{s.readiness_score}%</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              s.readiness_score >= 75
                                ? 'bg-accent-green/15 text-accent-green'
                                : s.readiness_score >= 50
                                ? 'bg-accent-amber/15 text-accent-amber'
                                : 'bg-danger/15 text-danger'
                            }`}
                          >
                            {s.readiness_score >= 75 ? 'HIGH' : s.readiness_score >= 50 ? 'MED' : 'LOW'}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              s.readiness_score >= 75
                                ? 'bg-accent-green'
                                : s.readiness_score >= 50
                                ? 'bg-accent-amber'
                                : 'bg-danger'
                            }`}
                            style={{ width: `${s.readiness_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-primary-accent">{s.eligible_jobs_count} Drives</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveStudentModal(s)}
                          className="px-2.5 py-1 rounded-lg bg-surface-alt hover:bg-surface border border-theme text-xs font-semibold text-ink transition-colors cursor-pointer"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleSendInterviewNotification(s)}
                          title="Send drive invite"
                          className="p-1 rounded-lg bg-surface-alt hover:bg-surface border border-theme text-muted hover:text-primary-accent transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Modal Details */}
      {activeStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-theme max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-muted">{activeStudentModal.id}</span>
                <h3 className="text-lg font-bold text-ink">{activeStudentModal.full_name}</h3>
                <p className="text-xs text-muted">
                  {activeStudentModal.branch} • Class of {activeStudentModal.graduation_year}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-accent-green/15 text-accent-green">
                CGPA {activeStudentModal.cgpa}
              </span>
            </div>

            <div className="space-y-3 pt-2 border-t border-theme text-xs">
              <div>
                <span className="text-muted font-medium">Email: </span>
                <span className="text-ink font-semibold">{activeStudentModal.email}</span>
              </div>
              <div>
                <span className="text-muted font-medium">Placement Readiness Score: </span>
                <span className="text-ink font-bold">{activeStudentModal.readiness_score}%</span>
              </div>
              <div>
                <span className="text-muted font-medium block mb-1">Verified Technical Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeStudentModal.skills.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-surface-alt border border-theme text-ink text-xs font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted font-medium">Currently Eligible Drives: </span>
                <span className="text-primary-accent font-bold">
                  {activeStudentModal.eligible_jobs_count} Opportunities
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-theme">
              <button
                onClick={() => {
                  selectStudent(activeStudentModal.id);
                  setActiveStudentModal(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface border border-theme text-xs font-semibold text-ink cursor-pointer"
              >
                Inspect as Candidate
              </button>
              <button
                onClick={() => {
                  handleSendInterviewNotification(activeStudentModal);
                  setActiveStudentModal(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-primary-app text-white text-xs font-semibold hover:opacity-95 cursor-pointer"
              >
                Send Drive Invite
              </button>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="px-3 py-1.5 rounded-xl border border-theme text-xs font-semibold text-muted hover:text-ink cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
