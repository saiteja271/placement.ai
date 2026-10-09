import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronRight,
  Timer,
  SlidersHorizontal,
  Play,
  BookOpen,
  Building,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { MockSession, MockQuestionItem } from '../types';

export const MockInterviewPage: React.FC = () => {
  const { currentStudent } = useApp();
  const navigate = useNavigate();

  // Setup Configurations
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [roleTitle, setRoleTitle] = useState('Software Development Engineer');
  const [category, setCategory] = useState('technical');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [targetCompany, setTargetCompany] = useState('Google');

  const [session, setSession] = useState<MockSession | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [viewMode, setViewMode] = useState<'active' | 'report'>('active');

  const startSession = async () => {
    if (!currentStudent) return;
    setIsLoading(true);
    setIsConfiguring(false);
    try {
      const data = await api.startMockInterview(
        currentStudent.id,
        roleTitle,
        category,
        difficulty,
        questionCount
      );
      setSession(data);
      setUserAnswer('');
      setElapsedSeconds(0);
      setViewMode('active');
    } catch (err) {
      console.error('Failed to start mock interview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startSession();
  }, [currentStudent]);

  // Live timer tick for active question
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [session?.current_question_index]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredQuestions = session?.questions.filter((q) => q.feedback) || [];
  const isSessionComplete =
    session?.status === 'completed' ||
    Boolean(session?.questions && session.questions.length > 0 && answeredQuestions.length === session.questions.length);

  // Automatically switch to 'report' when session finishes
  useEffect(() => {
    if (isSessionComplete) {
      setViewMode('report');
    }
  }, [isSessionComplete]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !userAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updated = await api.submitMockAnswer(
        session.id,
        session.current_question_index,
        userAnswer.trim()
      );
      setSession(updated);
      if (updated.status === 'completed') {
        setViewMode('report');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;
    const nextIdx = session.current_question_index + 1;
    if (nextIdx < session.questions.length) {
      setSession({ ...session, current_question_index: nextIdx });
      setUserAnswer(session.questions[nextIdx]?.user_answer || '');
      setElapsedSeconds(0);
    }
  };

  const currentQIndex = session?.current_question_index || 0;
  const currentQuestion = session?.questions[currentQIndex];

  // Aggregated metrics for Final Assessment Report
  const avgTechnical =
    answeredQuestions.length > 0
      ? (
          answeredQuestions.reduce(
            (acc, q) => acc + (q.feedback?.technical_score || 0),
            0
          ) / answeredQuestions.length
        ).toFixed(1)
      : '0.0';

  const avgCommunication =
    answeredQuestions.length > 0
      ? (
          answeredQuestions.reduce(
            (acc, q) => acc + (q.feedback?.communication_score || 0),
            0
          ) / answeredQuestions.length
        ).toFixed(1)
      : '0.0';

  const avgCompleteness =
    answeredQuestions.length > 0
      ? (
          answeredQuestions.reduce(
            (acc, q) => acc + (q.feedback?.completeness_score || 0),
            0
          ) / answeredQuestions.length
        ).toFixed(1)
      : '0.0';

  const overallScore =
    session?.overall_score ??
    (answeredQuestions.length > 0
      ? Math.round(
          answeredQuestions.reduce(
            (acc, q) => acc + (q.feedback?.score_out_of_100 || 0),
            0
          ) / answeredQuestions.length
        )
      : 0);

  const allStrengths = Array.from(
    new Set(answeredQuestions.flatMap((q) => q.feedback?.strengths || []))
  );

  const allImprovements = Array.from(
    new Set(answeredQuestions.flatMap((q) => q.feedback?.improvement_areas || []))
  );

  const getTier = (score: number) => {
    if (score >= 80) {
      return {
        label: 'Placement Ready — Distinction',
        color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
      };
    }
    if (score >= 60) {
      return {
        label: 'Competitive Track — Solid Proficiency',
        color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800'
      };
    }
    return {
      label: 'Foundation Building — Needs Targeted Practice',
      color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
    };
  };

  const tier = getTier(overallScore);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
              AI Mock Interview Studio
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-tint text-primary-app border border-theme">
              Adaptive
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Simulate realistic technical and behavioral rounds tailored to role, seniority, and rubric evaluation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConfiguring(!isConfiguring)}
            className="px-3.5 py-2 rounded-xl bg-surface border border-theme text-xs font-bold text-ink hover:bg-canvas transition-colors shadow-subtle flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary-app" />
            <span>Configure Round</span>
          </button>

          <button
            onClick={startSession}
            title="Start fresh session"
            className="p-2 rounded-xl bg-surface border border-theme text-muted hover:text-ink hover:bg-canvas transition-colors shadow-subtle cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* INTERVIEW SETUP CONFIGURATION PANEL */}
      {isConfiguring && (
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-theme pb-2.5">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary-app" />
              <span>Interview Setup & Customization</span>
            </h3>
            <span className="text-[11px] text-muted">
              Select parameters to generate personalized questions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Target Role */}
            <div className="space-y-1">
              <label className="font-bold text-ink">Target Role</label>
              <select
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-primary-app cursor-pointer"
              >
                <option value="Software Development Engineer">Software Development Engineer</option>
                <option value="Python Developer">Python Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
              </select>
            </div>

            {/* Interview Type */}
            <div className="space-y-1">
              <label className="font-bold text-ink">Interview Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-primary-app cursor-pointer"
              >
                <option value="technical">Core Technical Concepts</option>
                <option value="coding">Algorithmic & Coding Patterns</option>
                <option value="system design">System Architecture & Scale</option>
                <option value="hr">Behavioral & HR (STAR)</option>
                <option value="mixed">Mixed Comprehensive Round</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <label className="font-bold text-ink">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink focus:outline-none focus:ring-1 focus:ring-primary-app cursor-pointer"
              >
                <option value="Beginner">Beginner (Campus Tier 2)</option>
                <option value="Intermediate">Intermediate (Product SDE-1)</option>
                <option value="Advanced">Advanced (High-Scale Tier 1)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            {/* Experience Level */}
            <div className="space-y-1">
              <label className="font-bold text-ink">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink cursor-pointer"
              >
                <option value="Fresher">College Fresher (0 Exp)</option>
                <option value="0-1 yrs">Intern / 0-1 Years</option>
                <option value="1-3 yrs">Junior Engineer (1-3 Years)</option>
              </select>
            </div>

            {/* Question Count */}
            <div className="space-y-1">
              <label className="font-bold text-ink">Question Count</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink cursor-pointer"
              >
                <option value={3}>3 Questions (Standard Round)</option>
                <option value={5}>5 Questions (Comprehensive)</option>
                <option value={8}>8 Questions (Full Marathon)</option>
              </select>
            </div>

            {/* Target Company Focus */}
            <div className="space-y-1">
              <label className="font-bold text-ink">Target Company Persona</label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full bg-canvas border border-theme rounded-xl px-3 py-2 text-ink cursor-pointer"
              >
                <option value="Google">Tier 1 MNC (Google, Microsoft)</option>
                <option value="Amazon">Product Scale (Amazon, Uber)</option>
                <option value="TCS Digital">Service Enterprise (TCS, Infosys)</option>
                <option value="Startup">High-Growth Tech Startup</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={startSession}
              className="px-5 py-2.5 bg-primary-app hover:opacity-90 text-white font-bold rounded-xl shadow-subtle transition-opacity cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Custom Interview Round</span>
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-primary-app mx-auto" />
          <p className="text-xs text-muted">Preparing interview question bank for {roleTitle}...</p>
        </div>
      )}

      {/* Completion Banner if Round is Done and user is reviewing questions */}
      {!isLoading && isSessionComplete && viewMode === 'active' && (
        <div className="p-4 rounded-2xl bg-surface-tint border border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-primary-app shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-ink">
                Interview Round Completed · Overall Score: {overallScore}/100
              </h4>
              <p className="text-[11px] text-muted">
                All questions have been evaluated. View the complete performance assessment report.
              </p>
            </div>
          </div>
          <button
            onClick={() => setViewMode('report')}
            className="px-4 py-2 bg-primary-app text-white text-xs font-bold rounded-xl shadow-subtle hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          >
            View Assessment Report
          </button>
        </div>
      )}

      {/* VIEW MODE 1: COMPREHENSIVE FINAL PERFORMANCE REPORT */}
      {!isLoading && isSessionComplete && viewMode === 'report' && session && (
        <div className="space-y-6">
          {/* Main Scorecard Card */}
          <div className="p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Final Performance Assessment
                </span>
                <h3 className="text-xl font-bold text-ink mt-0.5">
                  Mock Interview Complete · {session.category} Round
                </h3>
                <p className="text-xs text-muted mt-1">
                  Target Role: <strong className="text-ink">{session.role_title}</strong> · Questions Evaluated: {session.total_questions}
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary-app">
                    {overallScore}
                  </span>
                  <span className="text-xs font-bold text-muted">/ 100</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${tier.color}`}>
                  {tier.label}
                </span>
              </div>
            </div>

            {/* Dimension Breakdown Metrics (3 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 bg-canvas rounded-xl border border-theme text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
                  Technical Accuracy
                </span>
                <div className="text-xl font-bold text-primary-app">
                  {avgTechnical} <span className="text-xs text-muted font-normal">/ 5.0</span>
                </div>
                <span className="text-[10px] text-muted block">Core principles & mechanics</span>
              </div>

              <div className="p-4 bg-canvas rounded-xl border border-theme text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
                  Communication Clarity
                </span>
                <div className="text-xl font-bold text-primary-app">
                  {avgCommunication} <span className="text-xs text-muted font-normal">/ 5.0</span>
                </div>
                <span className="text-[10px] text-muted block">Structure & articulation</span>
              </div>

              <div className="p-4 bg-canvas rounded-xl border border-theme text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
                  Completeness & Depth
                </span>
                <div className="text-xl font-bold text-primary-app">
                  {avgCompleteness} <span className="text-xs text-muted font-normal">/ 5.0</span>
                </div>
                <span className="text-[10px] text-muted block">Trade-offs & corner cases</span>
              </div>
            </div>

            {/* Synthesized Strengths and Growth Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Demonstrated Strengths Across Round</span>
                </div>
                {allStrengths.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-ink pl-1">
                    {allStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span className="leading-snug">{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted">Responses met core requirements.</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Targeted Improvement Areas</span>
                </div>
                {allImprovements.length > 0 ? (
                  <ul className="space-y-1.5 text-xs text-ink pl-1">
                    {allImprovements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">⚠</span>
                        <span className="leading-snug">{imp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted">No critical weaknesses identified.</p>
                )}
              </div>
            </div>

            {/* Question Breakdown Cards */}
            <div className="space-y-3 pt-3 border-t border-theme">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                  Question Breakdown & Rubrics ({session.questions.length} Items)
                </h4>
                <button
                  onClick={() => setViewMode('active')}
                  className="text-xs font-semibold text-primary-app hover:underline cursor-pointer"
                >
                  Inspect Full Answers &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {session.questions.map((q, idx) => (
                  <div
                    key={q.question_id}
                    className="p-3.5 rounded-xl bg-canvas border border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">Q{idx + 1}: {q.focus}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-theme text-muted">
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-muted line-clamp-1 italic text-[11px]">
                        "{q.question}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="font-bold text-primary-app text-sm">
                        {q.score ?? 0} / 100
                      </span>
                      <button
                        onClick={() => {
                          setSession({ ...session, current_question_index: idx });
                          setUserAnswer(q.user_answer || '');
                          setViewMode('active');
                        }}
                        className="px-3 py-1 bg-surface border border-theme hover:bg-surface-tint hover:text-primary-app text-ink rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps Action Buttons */}
            <div className="pt-4 border-t border-theme flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate('/skills')}
                  className="px-4 py-2.5 bg-surface-tint hover:bg-primary-app hover:text-white text-primary-app text-xs font-bold rounded-xl border border-theme transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Target className="w-4 h-4" />
                  <span>View Skill Gaps</span>
                </button>

                <button
                  onClick={() => navigate('/prep')}
                  className="px-4 py-2.5 bg-canvas hover:bg-surface text-ink text-xs font-bold rounded-xl border border-theme transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Go to Prep Plan</span>
                </button>
              </div>

              <button
                onClick={() => { setIsConfiguring(true); setViewMode('active'); }}
                className="px-5 py-2.5 bg-primary-app hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-subtle transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Configure & Start New Round</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ACTIVE QUESTION INTERACTION & ANSWER EVALUATION */}
      {!isLoading && viewMode === 'active' && session && currentQuestion && (
        <div className="space-y-6">
          {/* Question Progression Bar */}
          <div className="p-4 rounded-2xl bg-surface border border-theme flex flex-wrap items-center justify-between gap-3 text-xs shadow-subtle">
            <div className="flex items-center gap-2 font-bold text-ink">
              <span className="w-6 h-6 rounded-lg bg-surface-tint text-primary-app flex items-center justify-center text-xs font-bold">
                {currentQIndex + 1}
              </span>
              <span>
                Question {currentQIndex + 1} of {session.total_questions}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-canvas text-ink border border-theme">
                Difficulty: {currentQuestion.difficulty}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-primary-app bg-surface-tint flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatTimer(elapsedSeconds)}
              </span>
              <span className="text-muted font-mono text-[11px] hidden sm:inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {session.role_title}
              </span>
            </div>
          </div>

          {/* AI Interviewer Prompt Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-surface-tint text-primary-app flex items-center justify-center shrink-0">
                <BotMessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-app">
                  Interviewer Prompt · Focus: {currentQuestion.focus}
                </span>
                <p className="text-sm md:text-base font-semibold text-ink leading-relaxed">
                  "{currentQuestion.question}"
                </p>
              </div>
            </div>

            {/* Answer Input Area */}
            <form onSubmit={handleSubmitAnswer} className="space-y-3 pt-3 border-t border-theme">
              <textarea
                rows={4}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your structured answer here. Be thorough: mention concepts, trade-offs, and examples..."
                className="w-full bg-canvas border border-theme rounded-xl p-3.5 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-app/40 leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-muted">
                  {userAnswer.length} characters entered
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || !userAnswer.trim()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-primary-app hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-subtle transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Answer & Evaluate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Feedback Display if question was answered */}
          {currentQuestion.feedback && (
            <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-theme shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-app" />
                  <h4 className="font-bold text-sm text-ink">
                    Evaluator Feedback & Rubric
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-canvas text-muted border border-theme">
                    Source: {currentQuestion.feedback.source}
                  </span>
                  <span className="text-base font-extrabold text-primary-app">
                    {currentQuestion.feedback.score_out_of_100} / 100
                  </span>
                </div>
              </div>

              {/* Rubric Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-canvas rounded-xl border border-theme">
                  <span className="text-muted block text-[10px]">Technical Accuracy</span>
                  <span className="font-bold text-primary-app text-sm">
                    {currentQuestion.feedback.technical_score} / 5
                  </span>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-theme">
                  <span className="text-muted block text-[10px]">Communication</span>
                  <span className="font-bold text-primary-app text-sm">
                    {currentQuestion.feedback.communication_score} / 5
                  </span>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-theme">
                  <span className="text-muted block text-[10px]">Completeness</span>
                  <span className="font-bold text-primary-app text-sm">
                    {currentQuestion.feedback.completeness_score} / 5
                  </span>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 p-3 rounded-xl bg-canvas border border-theme">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                    ✓ Demonstrated Strengths:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-ink">
                    {currentQuestion.feedback.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-canvas border border-theme">
                  <span className="font-bold text-amber-700 dark:text-amber-400 block">
                    ⚠ Areas to Deepen:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-ink">
                    {currentQuestion.feedback.improvement_areas.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 text-xs text-muted italic">
                Recommendation: {currentQuestion.feedback.recommended_next_action}
              </div>

              {/* Next Question Progression Button */}
              <div className="pt-3 border-t border-theme flex flex-wrap items-center justify-between gap-3">
                {isSessionComplete && (
                  <button
                    onClick={() => setViewMode('report')}
                    className="px-4 py-2 bg-surface border border-theme hover:bg-canvas text-ink text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    View Final Assessment Report
                  </button>
                )}

                <div className="ml-auto">
                  {currentQIndex < session.questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 bg-primary-app hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle"
                    >
                      <span>Next Question ({currentQIndex + 2} of {session.total_questions})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setViewMode('report')}
                      className="px-5 py-2.5 bg-primary-app hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-subtle"
                    >
                      <Award className="w-4 h-4" />
                      <span>Finish & View Assessment Report</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Session Overview List */}
          <div className="p-4 bg-surface rounded-2xl border border-theme shadow-subtle">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Question Navigator ({session.questions.length} Items)
            </h5>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {session.questions.map((q, idx) => (
                <button
                  key={q.question_id}
                  onClick={() => {
                    setSession({ ...session, current_question_index: idx });
                    setUserAnswer(q.user_answer || '');
                    setElapsedSeconds(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    currentQIndex === idx
                      ? 'bg-primary-app text-white shadow-subtle'
                      : q.score !== null && q.score !== undefined
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-canvas text-muted hover:text-ink border border-theme'
                  }`}
                >
                  Q{idx + 1} {q.score ? `(${q.score}%)` : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
