import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  Sliders,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Job, PrepPlan, TaskItem } from '../types';

const WEEK_LABELS: Record<number, string> = {
  1: 'Foundations & High Priority Skills',
  2: 'Technical Depth & Aptitude',
  3: 'System Design & Problem Solving',
  4: 'HR, Behavioral & Final Polish',
  5: 'Advanced Graphs & Algorithms',
  6: 'Scalable Distributed Systems',
  7: 'Production Architecture & CI/CD',
  8: 'Executive HR & Capstone Marathon',
};

export const InterviewPrepPage: React.FC = () => {
  const { currentStudent, openAgentDrawer } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlJobId = searchParams.get('jobId');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(urlJobId || 'J001');
  const [deadlineDays, setDeadlineDays] = useState<number>(30);
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [plan, setPlan] = useState<PrepPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // If urlJobId changes, update selectedJobId
  useEffect(() => {
    if (urlJobId) {
      setSelectedJobId(urlJobId);
    }
  }, [urlJobId]);

  // Load target jobs
  useEffect(() => {
    if (!currentStudent) return;
    const fetchJobs = async () => {
      try {
        const list = await api.getJobs({ student_id: currentStudent.id });
        setJobs(list);
        if (list.length > 0 && !urlJobId && !selectedJobId) {
          setSelectedJobId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load jobs for prep plan:', err);
      }
    };
    fetchJobs();
  }, [currentStudent]);

  // Load or generate prep plan
  const loadPlan = async (regenerate: boolean = false) => {
    if (!currentStudent || !selectedJobId) return;
    try {
      setIsLoading(true);
      const data = await api.getPrepPlan(selectedJobId, currentStudent.id, deadlineDays, regenerate);
      setPlan(data);
    } catch (err) {
      console.error('Failed to load prep plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlan(false);
  }, [currentStudent, selectedJobId, deadlineDays]);

  const handleToggleTask = async (task: TaskItem) => {
    if (!plan) return;
    setIsToggling(task.id);
    const newStatus = !task.is_completed;
    try {
      const res = await api.toggleTask(plan.id, task.id, newStatus);
      setPlan((prev) => {
        if (!prev) return null;
        const updatedTasks = prev.tasks.map((t) =>
          t.id === task.id ? { ...t, is_completed: newStatus } : t
        );
        return {
          ...prev,
          tasks: updatedTasks,
          completed_tasks_count: res.completed_count,
          progress_percentage: res.progress_percentage,
        };
      });
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
    } finally {
      setIsToggling(null);
    }
  };

  if (!currentStudent) {
    return <div className="p-8 text-center text-muted">Loading student profile...</div>;
  }

  const availableWeeks = plan?.tasks && plan.tasks.length > 0
    ? Array.from(new Set(plan.tasks.map((t) => t.week))).sort((a, b) => a - b)
    : [1];

  useEffect(() => {
    if (availableWeeks.length > 0 && !availableWeeks.includes(activeWeek)) {
      setActiveWeek(availableWeeks[0]);
    }
  }, [availableWeeks, activeWeek]);

  const tasksInWeek = plan?.tasks.filter((t) => t.week === activeWeek) || [];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Interview Preparation Plan
          </h2>
          <p className="text-xs text-muted mt-1">
            Personalized, time-aware preparation roadmap targeted at your desired employer and skill gaps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Target job selector */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-surface border border-theme text-xs font-bold text-primary-app rounded-xl px-3 py-2 focus:outline-none shadow-subtle cursor-pointer"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                Target: {j.title} ({j.company})
              </option>
            ))}
          </select>

          {/* Duration Selector */}
          <select
            value={deadlineDays}
            onChange={(e) => setDeadlineDays(Number(e.target.value))}
            className="bg-surface border border-theme text-xs font-semibold text-ink rounded-xl px-3 py-2 focus:outline-none shadow-subtle cursor-pointer"
            title="Custom preparation duration"
          >
            <option value={7}>7 Days (Crash Course)</option>
            <option value={14}>14 Days (Accelerated Sprint)</option>
            <option value={30}>30 Days (Standard 4-Week)</option>
            <option value={60}>60 Days (Comprehensive 8-Week)</option>
          </select>

          <button
            onClick={() => loadPlan(true)}
            title="Regenerate plan"
            className="p-2 bg-surface border border-theme text-muted hover:text-ink rounded-xl hover:bg-canvas transition-colors shadow-subtle cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Timeline Bar Card */}
      {plan && (
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Target Role: {plan.role_title}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-ink mt-0.5">
                Preparation Timeline · {plan.total_days} Days Total
              </h3>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold">
              <span className="text-muted">
                Completed: <strong className="text-ink">{plan.completed_tasks_count} / {plan.total_tasks_count}</strong> Tasks
              </span>
              <span className="px-3 py-1 rounded-full bg-surface-tint text-primary-app font-extrabold text-xs">
                {plan.progress_percentage}% Done
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-canvas border border-theme/60 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary-app h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${plan.progress_percentage}%` }}
            />
          </div>

          {/* Week Tabs */}
          <div className="flex border-t border-theme pt-3 gap-2 overflow-x-auto scrollbar-none">
            {availableWeeks.map((wk) => (
              <button
                key={wk}
                onClick={() => setActiveWeek(wk)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeWeek === wk
                    ? 'bg-primary-app text-white shadow-subtle'
                    : 'bg-canvas text-muted hover:text-ink border border-theme'
                }`}
              >
                Week {wk} {WEEK_LABELS[wk] ? `· ${WEEK_LABELS[wk]}` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task List for Active Week */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
            Tasks for Week {activeWeek} ({tasksInWeek.length} Modules)
          </h4>
          <span className="text-[11px] text-muted">
            Tick checkboxes to record persistent completion
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted">
            Loading preparation tasks...
          </div>
        ) : tasksInWeek.length === 0 ? (
          <div className="p-8 text-center text-muted text-xs bg-surface rounded-2xl border border-theme">
            No specific tasks allocated for this week.
          </div>
        ) : (
          tasksInWeek.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 ${
                task.is_completed
                  ? 'bg-canvas/80 border-theme opacity-80'
                  : 'bg-surface border border-theme shadow-subtle hover:border-primary-app/50'
              }`}
            >
              <div className="flex items-start gap-3 sm:gap-3.5">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task)}
                  disabled={isToggling === task.id}
                  className="mt-0.5 text-primary-app hover:scale-110 transition-transform cursor-pointer shrink-0"
                >
                  {task.is_completed ? (
                    <CheckSquare className="w-5 h-5 text-primary-app fill-surface-tint" />
                  ) : (
                    <Square className="w-5 h-5 text-muted hover:text-primary-app" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold ${
                        task.is_completed
                          ? 'line-through text-muted'
                          : 'text-ink'
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-tint text-primary-app">
                      {task.category}
                    </span>
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.duration_minutes} mins
                    </span>
                  </div>

                  <p className="text-xs text-muted leading-relaxed">
                    {task.description}
                  </p>

                  {task.resources && task.resources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-muted">
                        Practice Targets:
                      </span>
                      {task.resources.map((res) => (
                        <span
                          key={res}
                          className="text-[10px] bg-canvas text-muted px-2 py-0.5 rounded-md border border-theme"
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => navigate('/mock-interview')}
                  className="px-3 py-1.5 rounded-xl bg-surface-tint hover:bg-primary-app hover:text-white text-primary-app text-xs font-semibold transition-colors cursor-pointer border border-theme"
                >
                  Practice
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
