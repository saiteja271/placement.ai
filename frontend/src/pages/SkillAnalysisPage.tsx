import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart as LineChartIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Code,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Job, SkillGapAnalysis } from '../types';

export const SkillAnalysisPage: React.FC = () => {
  const { currentStudent, openAgentDrawer } = useApp();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('J001');
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [resourceTab, setResourceTab] = useState<'all' | 'courses' | 'practice' | 'docs'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load available target jobs
  useEffect(() => {
    if (!currentStudent) return;
    const fetchJobs = async () => {
      try {
        const list = await api.getJobs({ student_id: currentStudent.id });
        setJobs(list);
        if (list.length > 0 && !selectedJobId) {
          setSelectedJobId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load jobs for skill analysis:', err);
      }
    };
    fetchJobs();
  }, [currentStudent]);

  // Load skill analysis for selected job
  useEffect(() => {
    if (!currentStudent || !selectedJobId) return;
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const data = await api.getSkillGaps(selectedJobId, currentStudent.id);
        setAnalysis(data);
      } catch (err) {
        console.error('Failed to load skill gaps:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [currentStudent, selectedJobId]);

  if (!currentStudent) {
    return <div className="p-8 text-center text-slate-500">Loading student profile...</div>;
  }

  const overallMatch = analysis?.overall_match_percentage || 72;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallMatch / 100) * circumference;

  const resources = [
    {
      type: 'practice',
      title: 'NeetCode 150 & LeetCode Curated Placement Patterns',
      skill: 'Data Structures & Algorithms',
      link: 'https://leetcode.com',
      badge: 'Interactive Practice',
    },
    {
      type: 'courses',
      title: 'System Design Primer & Microservices Architecture',
      skill: 'System Design',
      link: 'https://github.com/donnemartin/system-design-primer',
      badge: 'Comprehensive Course',
    },
    {
      type: 'docs',
      title: 'Docker Hands-On Getting Started Guide',
      skill: 'Docker',
      link: 'https://docs.docker.com/get-started/',
      badge: 'Official Documentation',
    },
    {
      type: 'practice',
      title: 'AWS Skill Builder Cloud Practitioner Quest',
      skill: 'Cloud Computing (AWS)',
      link: 'https://aws.amazon.com/training/digital/',
      badge: 'Hands-on Labs',
    },
  ];

  const filteredResources =
    resourceTab === 'all'
      ? resources
      : resources.filter((r) => r.type === resourceTab);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Target Role Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Skill Gap Analysis
          </h2>
          <p className="text-xs text-muted mt-1">
            Compare your demonstrated competencies against specific industry vacancies.
          </p>
        </div>

        {/* Target Role Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted">Benchmark Role:</label>
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-surface border border-theme text-xs font-bold text-primary-app rounded-xl px-3.5 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-app/40 cursor-pointer shadow-subtle"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} · {j.company}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Skill Match Donut */}
        <div className="p-6 rounded-2xl bg-surface border border-theme shadow-subtle flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-ink mb-2">
            Overall Skill Match
          </h3>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-[var(--surface-tint)]"
                strokeWidth="11"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-[var(--primary)] transition-all duration-1000 ease-out"
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-ink">
                {overallMatch}%
              </span>
              <span className="text-[11px] font-semibold text-muted">Match</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-4 border-t border-theme text-center">
            <div>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block">
                {analysis?.matched_skills_count || 0}
              </span>
              <span className="text-[10px] text-muted">Matched</span>
            </div>
            <div>
              <span className="text-base font-bold text-red-500 block">
                {analysis?.missing_required_count || 0}
              </span>
              <span className="text-[10px] text-muted">Missing Core</span>
            </div>
            <div>
              <span className="text-base font-bold text-amber-500 block">
                {analysis?.missing_preferred_count || 0}
              </span>
              <span className="text-[10px] text-muted">Optional</span>
            </div>
          </div>
        </div>

        {/* Top Skills to Improve Breakdown */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-ink">
                Prioritized Skills to Improve
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Targeting <strong>{analysis?.job_title}</strong> at <strong>{analysis?.company}</strong>
              </p>
            </div>
            <button
              onClick={() => navigate(`/prep?jobId=${selectedJobId}`)}
              className="text-xs font-semibold text-primary-app hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Build Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-muted">
              Evaluating skill overlap...
            </div>
          ) : (
            <div className="space-y-3">
              {analysis?.skills_breakdown.map((item) => (
                <div
                  key={item.skill}
                  className="p-3.5 rounded-xl border border-theme bg-canvas flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-ink">
                        {item.skill}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'matched'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : item.priority === 'High'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {item.status === 'matched' ? 'Demonstrated' : `${item.priority} Priority Gap`}
                      </span>
                      <span className="text-[10px] text-muted">
                        {item.skill_type === 'required' ? 'Mandatory Core' : 'Preferred Bonus'}
                      </span>
                    </div>
                    <p className="text-muted text-[11px] leading-relaxed">
                      {item.impact_reason}
                    </p>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-[11px] font-semibold text-primary-app block">
                      ~{item.suggested_days} Days Learning
                    </span>
                    <span className="text-[10px] text-muted">
                      {item.recommended_action.slice(0, 35)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Learning Resources */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme">
          <div>
            <h3 className="text-sm font-bold text-ink">
              Recommended Learning Resources
            </h3>
            <p className="text-xs text-muted">
              Curated materials based on your active skill gaps.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-canvas border border-theme p-1 rounded-xl text-xs overflow-x-auto scrollbar-none">
            {(['all', 'courses', 'practice', 'docs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setResourceTab(tab)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  resourceTab === tab
                    ? 'bg-surface text-primary-app font-bold shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.title}
              className="p-4 rounded-xl border border-theme bg-canvas flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-app">
                  {res.badge} · {res.skill}
                </span>
                <h4 className="font-bold text-ink truncate">
                  {res.title}
                </h4>
              </div>
              <a
                href={res.link}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-surface border border-theme hover:border-primary-app/60 text-ink text-xs font-semibold rounded-lg flex items-center gap-1 shadow-subtle transition-colors shrink-0"
              >
                <span>Study</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
