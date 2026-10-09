import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Building2,
  MapPin,
  Trash2,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Job } from '../types';

export const SavedJobsPage: React.FC = () => {
  const { currentStudent } = useApp();
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSaved = async () => {
    if (!currentStudent) return;
    try {
      setIsLoading(true);
      const data = await api.getSavedJobs(currentStudent.id);
      setSavedJobs(data);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [currentStudent]);

  const handleRemove = async (jobId: string) => {
    if (!currentStudent) return;
    try {
      await api.unsaveJob(currentStudent.id, jobId);
      setSavedJobs(savedJobs.filter((j) => j.id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job:', err);
    }
  };

  if (!currentStudent) {
    return <div className="p-8 text-center text-muted">Loading student profile...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
          Saved Opportunities
        </h2>
        <p className="text-xs text-muted mt-1">
          Review and manage job postings you have bookmarked for application deadlines and preparation.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-muted">
          Loading saved jobs...
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-surface rounded-2xl border border-theme shadow-subtle space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-tint text-primary-app flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-ink">
            No Saved Jobs Yet
          </h4>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Bookmark interesting opportunities from the Job Matches tab to track them here.
          </p>
          <button
            onClick={() => navigate('/jobs')}
            className="px-4 py-2 bg-primary-app hover:opacity-90 text-white text-xs font-semibold rounded-xl shadow-subtle transition-opacity cursor-pointer"
          >
            Explore Job Matches
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="p-4 sm:p-5 rounded-2xl bg-surface border border-theme shadow-subtle hover:border-primary-app/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-surface-tint border border-theme flex items-center justify-center font-bold text-base text-primary-app shrink-0">
                  {job.company[0]}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-0.5">
                    <span className="font-semibold text-ink">
                      {job.company}
                    </span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="font-medium text-ink">
                      {job.salary_range}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        job.is_eligible
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {job.eligibility_status}
                    </span>
                    <span className="text-[10px] font-semibold text-primary-app">
                      {job.match_score}% Match
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="px-3.5 py-2 bg-surface-tint hover:bg-primary-app hover:text-white text-ink text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-theme"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleRemove(job.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
