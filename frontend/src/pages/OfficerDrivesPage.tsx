import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Sparkles,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { Job, JobCreateInput } from '../types';

export const OfficerDrivesPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const initialForm: JobCreateInput = {
    title: '',
    company: '',
    role_category: 'Software Engineering',
    job_type: 'Full-time',
    location: 'Bengaluru / Hybrid',
    salary_range: '10 - 16 LPA',
    min_cgpa: 7.0,
    required_skills: ['Python', 'SQL'],
    preferred_skills: ['Docker', 'AWS'],
    eligible_branches: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
    description: '',
    application_deadline: '2026-05-30'
  };

  const [formData, setFormData] = useState<JobCreateInput>(initialForm);
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('Python, SQL, FastApi');
  const [preferredSkillsInput, setPreferredSkillsInput] = useState('Docker, AWS, Git');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    'Computer Science',
    'Information Technology',
    'Electronics & Communication'
  ]);

  const branchOptions = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Data Science & AI'
  ];

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const data = await api.getJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recruitment drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleBranchToggle = (branch: string) => {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter((b) => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.description) {
      setError('Please fill in Job Title, Company, and Job Description');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const reqSkills = requiredSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const prefSkills = preferredSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: JobCreateInput = {
        ...formData,
        work_mode: formData.job_type || formData.work_mode || 'Full-time',
        required_skills: reqSkills,
        preferred_skills: prefSkills,
        eligible_branches: selectedBranches
      };

      const newJob = await api.createOfficerJob(payload);
      setJobs([newJob, ...jobs]);
      setSuccessMessage(`Recruitment drive for "${newJob.title}" at ${newJob.company} published successfully!`);
      setIsModalOpen(false);
      setFormData(initialForm);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to post recruitment drive');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-5 sm:p-6 rounded-2xl border border-theme shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-light text-primary-accent border border-primary-light uppercase tracking-wider">
              Campus Drives Portal
            </span>
            <span className="text-xs text-muted">{jobs.length} Active Placement Drives</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink mt-1">Recruitment Drives Management</h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Configure recruiter eligibility criteria, CGPA cutoffs, required skillsets, and monitor candidate pools.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-app text-white text-xs sm:text-sm font-semibold rounded-xl shadow-2xs hover:opacity-95 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Campus Drive</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-accent-green/10 border border-accent-green/30 text-ink rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs font-semibold text-muted hover:text-ink">
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

      {/* Drives Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-56 bg-surface rounded-2xl border border-theme animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-surface rounded-2xl border border-theme p-5 flex flex-col justify-between shadow-2xs hover:border-primary-accent/40 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary-accent uppercase">
                      {job.job_type || job.work_mode || 'Full-time'}
                    </span>
                    <h3 className="font-bold text-ink text-base mt-1 line-clamp-1">{job.title}</h3>
                    <p className="text-xs font-semibold text-muted flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{job.company}</span>
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-surface-alt border border-theme text-ink">
                    ≥ {job.min_cgpa} CGPA
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted pt-2 border-t border-theme">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-ink">
                    <IndianRupee className="w-3.5 h-3.5 shrink-0 text-accent-green" />
                    <span>{job.salary_range}</span>
                  </div>
                  {job.application_deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Deadline: {job.application_deadline}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted block">Required Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.slice(0, 4).map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-surface-alt border border-theme text-ink"
                      >
                        {sk}
                      </span>
                    ))}
                    {job.required_skills.length > 4 && (
                      <span className="text-[10px] px-1 py-0.5 text-muted">+{job.required_skills.length - 4}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted block">Eligible Branches:</span>
                  <p className="text-[11px] text-muted line-clamp-1">
                    {job.eligible_branches.join(', ')}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-theme flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted">{job.id}</span>
                <Link
                  to={`/jobs/${job.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-accent hover:underline"
                >
                  <span>Drive Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Drive Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface rounded-2xl border border-theme max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-accent" />
                <h3 className="text-lg font-bold text-ink">Publish Campus Recruitment Drive</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-alt transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-ink block mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SDE - Cloud Backend"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Microsoft India"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Role Category</label>
                  <select
                    value={formData.role_category}
                    onChange={(e) => setFormData({ ...formData, role_category: e.target.value })}
                    className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none cursor-pointer"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Product & Design">Product & Design</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Job Type</label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                    className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Intern + Full-time">Intern + Full-time</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Hybrid"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Salary Package / CTC</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 - 20 LPA"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Minimum CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.min_cgpa}
                    onChange={(e) => setFormData({ ...formData, min_cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-ink block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                    className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Required Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, SQL, REST APIs, Git"
                  value={requiredSkillsInput}
                  onChange={(e) => setRequiredSkillsInput(e.target.value)}
                  className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Preferred Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Docker, AWS, FastAPI, CI/CD"
                  value={preferredSkillsInput}
                  onChange={(e) => setPreferredSkillsInput(e.target.value)}
                  className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1.5">Eligible Engineering Branches</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {branchOptions.map((branch) => {
                    const checked = selectedBranches.includes(branch);
                    return (
                      <label
                        key={branch}
                        onClick={() => handleBranchToggle(branch)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                          checked
                            ? 'bg-primary-light border-primary-accent text-primary-accent font-semibold'
                            : 'bg-surface-alt border-theme text-muted'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="rounded accent-primary-app pointer-events-none"
                        />
                        <span className="truncate">{branch}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Job Description & Eligibility Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the recruitment drive rounds, selection process, key responsibilities, and qualifications..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surface-alt border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-theme">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-theme text-xs font-semibold rounded-xl text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-app text-white text-xs font-semibold rounded-xl hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Publishing...' : 'Publish Drive'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
