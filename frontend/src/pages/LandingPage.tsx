import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ShieldCheck,
  CalendarCheck,
  BotMessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Target,
  GraduationCap,
  Users,
  UserPlus,
  Menu,
  X,
  Activity,
  Check,
  Compass,
  Zap,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeSelector } from '../components/ThemeSelector';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAgentDrawer, openAuthModal, currentUser } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const handleGetStarted = () => {
    if (currentUser) {
      if (currentUser.role === 'officer') {
        navigate('/officer');
      } else {
        navigate('/dashboard');
      }
    } else {
      openAuthModal('signup');
    }
  };

  const handleLogIn = () => {
    if (currentUser) {
      if (currentUser.role === 'officer') {
        navigate('/officer');
      } else {
        navigate('/dashboard');
      }
    } else {
      openAuthModal('signin');
    }
  };

  const handleFeatureNavigate = (path: string) => {
    if (currentUser) {
      navigate(path);
    } else {
      openAuthModal('signin');
    }
  };

  const sampleCopilotQueries = [
    {
      title: 'Assess top jobs & verify my eligibility',
      prompt: 'Assess top jobs & verify my eligibility',
      tag: 'Job Matching + Cutoff Check',
      tools: [
        { name: 'discover_and_rank_jobs', result: 'Found 8 verified campus openings (Top match: 94%)' },
        { name: 'verify_eligibility', result: 'CGPA 8.0 >= 7.5 cutoff, 0 active backlogs (ELIGIBLE)' }
      ],
      answer: 'You meet 100% of mandatory recruiter criteria for Python Developer at NexGen Labs with an outstanding 94% profile match. No eligibility blocks found.'
    },
    {
      title: 'Analyze skill gaps for Google SDE',
      prompt: 'Analyze skill gaps for Google SDE',
      tag: 'Competency Diagnosis',
      tools: [
        { name: 'analyze_skill_gaps', result: 'Mandatory competencies: Python, SQL verified. 0 gaps.' },
        { name: 'recommend_sandbox_drills', result: 'Suggested bonus: Distributed Caching (Redis) & Docker.' }
      ],
      answer: 'All mandatory recruiter requirements are met. Recommended 2-week focus on distributed caching and concurrency to boost round-2 system design scores.'
    },
    {
      title: 'Generate a 4-week preparation plan',
      prompt: 'Generate a 4-week preparation plan',
      tag: 'Curriculum Roadmap',
      tools: [
        { name: 'draft_preparation_roadmap', result: '9 targeted milestones generated across 28 days.' },
        { name: 'balance_curriculum_workload', result: 'Balanced: 40% DSA, 30% System Design, 30% HR/Mock.' }
      ],
      answer: 'Your personalized 4-week roadmap is ready! Day 1–7 focuses on LeetCode two-pointer problems and SQL window functions, followed by mock behavioral interviews.'
    },
    {
      title: 'Find eligible Software Engineer positions',
      prompt: 'Find eligible Software Engineer positions',
      tag: 'Deterministic Filter',
      tools: [
        { name: 'filter_eligible_opportunities', result: '4 verified campus drives match Computer Science degree.' },
        { name: 'calculate_readiness_index', result: 'Candidate readiness index: 88/100 (High qualification).' }
      ],
      answer: 'Identified 4 campus placement drives actively accepting applications from your batch with zero backlog restrictions.'
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col transition-colors overflow-x-hidden selection:bg-primary-app selection:text-white">
      {/* 1. Sleek, Centered & Properly Aligned Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-theme/60 bg-surface/85 backdrop-blur-md transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Logo size="md" />
          </div>

          {/* Center: Dedicated Centered Floating Pill Navigation */}
          <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-alt/80 border border-theme/60 shadow-2xs backdrop-blur-md text-xs font-semibold text-muted">
            <a
              href="#features"
              className="px-3.5 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-all"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-3.5 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-all"
            >
              How It Works
            </a>
            <a
              href="#agent-copilot"
              className="px-3.5 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-app" />
              <span>Agent Copilot</span>
            </a>
            <a
              href="#about"
              className="px-3.5 py-1.5 rounded-full hover:text-ink hover:bg-surface transition-all"
            >
              About
            </a>
          </nav>

          {/* Right: Actions Container */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Theme Selector */}
            <ThemeSelector compact align="right" />

            {/* Account / Log In Button */}
            <button
              onClick={handleLogIn}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-theme text-ink hover:bg-surface-alt transition-colors cursor-pointer"
            >
              {currentUser ? 'My Account' : 'Log In'}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={handleGetStarted}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-primary-app hover:opacity-95 text-white shadow-sm hover:shadow transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{currentUser ? 'Dashboard' : 'Get Started'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Toggle mobile navigation"
              className="md:hidden p-2 rounded-xl border border-theme bg-surface text-ink hover:bg-surface-alt transition-colors cursor-pointer"
            >
              {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Sheet */}
        {isMobileNavOpen && (
          <div className="md:hidden border-t border-theme bg-surface/95 backdrop-blur-lg px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
            <a
              href="#features"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-ink hover:bg-surface-alt transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-ink hover:bg-surface-alt transition-colors"
            >
              How It Works
            </a>
            <a
              href="#agent-copilot"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-ink hover:bg-surface-alt transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary-app" />
              <span>Agent Copilot</span>
            </a>
            <a
              href="#about"
              onClick={() => setIsMobileNavOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-ink hover:bg-surface-alt transition-colors"
            >
              About
            </a>
          </div>
        )}
      </header>

      {/* 2. Hero Section with Ambient Glow */}
      <section className="relative px-4 sm:px-6 pt-14 pb-16 max-w-5xl mx-auto text-center flex-1">
        {/* Soft Ambient Theme Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary-app/10 rounded-full blur-3xl -z-10"
        />

        {/* Live Engine Badge with Pulsing Dot */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light/80 text-primary-accent border border-primary-light text-xs font-semibold mb-6 shadow-2xs backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-primary-app" />
          <span>Intelligent College Placement Assistant · Live Engine</span>
        </div>

        {/* Prominent Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-ink mb-5 leading-[1.15] max-w-3xl mx-auto">
          Your Next Opportunity Starts Here.
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-muted max-w-2xl mx-auto mb-9 leading-relaxed font-normal">
          Discover relevant opportunities, understand your skill gaps, prepare for interviews, and learn with an AI-powered placement assistant.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <button
            onClick={handleGetStarted}
            className="px-6 py-3 rounded-xl bg-primary-app hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Get Started Free</span>
          </button>

          <a
            href="#features"
            className="px-5 py-3 rounded-xl bg-surface border border-theme hover:bg-surface-alt text-ink font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5"
          >
            <span>Explore Features</span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </a>

          <button
            onClick={() => openAgentDrawer('Summarize candidate profile and evaluate best job matches')}
            className="px-5 py-3 rounded-xl bg-surface-tint text-primary-app border border-theme/60 hover:bg-primary-app hover:text-white font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Agent Copilot</span>
          </button>
        </div>

        {/* Interactive Platform Live Stats Strip */}
        <div className="max-w-4xl mx-auto mb-16 p-4 sm:p-5 rounded-2xl bg-surface/90 border border-theme shadow-subtle backdrop-blur-sm grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-canvas/60 border border-theme/40 space-y-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">94%</span>
            <p className="text-[11px] font-bold text-primary-app uppercase tracking-wider">Match Accuracy</p>
            <p className="text-[10px] text-muted">Multi-factor role & skill scoring</p>
          </div>
          <div className="p-3 rounded-xl bg-canvas/60 border border-theme/40 space-y-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">100%</span>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Deterministic</p>
            <p className="text-[10px] text-muted">Zero fabricated eligibility rules</p>
          </div>
          <div className="p-3 rounded-xl bg-canvas/60 border border-theme/40 space-y-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">1,200+</span>
            <p className="text-[11px] font-bold text-primary-app uppercase tracking-wider">Verified Roles</p>
            <p className="text-[10px] text-muted">Real campus drive opportunities</p>
          </div>
          <div className="p-3 rounded-xl bg-canvas/60 border border-theme/40 space-y-0.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-primary-app tracking-tight">4-Week</span>
            <p className="text-[11px] font-bold text-primary-app uppercase tracking-wider">Curriculum</p>
            <p className="text-[10px] text-muted">Personalized daily prep tasks</p>
          </div>
        </div>

        {/* 3. Features Section */}
        <div id="features" className="pt-8 mb-16 scroll-mt-20">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-light">
              Engineered Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mt-2">Grounded Placement Assistance</h2>
            <p className="text-xs sm:text-sm text-muted mt-1.5 max-w-lg mx-auto">
              Transparent, deterministic rules combined with contextual AI intelligence. No fabricated listings or unsupported claims.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {/* Feature 1: Job Matching */}
            <div
              onClick={() => handleFeatureNavigate('/jobs')}
              className="group p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-primary-app/60 transition-all duration-300 hover:-translate-y-1 space-y-3 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5 text-primary-app" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink group-hover:text-primary-app transition-colors">
                  Intelligent Job Matching
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Multi-dimensional scoring evaluating skill overlap, role preferences, and domain alignment across verified campus vacancies.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-primary-app gap-1 group-hover:gap-2 transition-all">
                <span>View Job Matches</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2: Eligibility */}
            <div
              onClick={() => handleFeatureNavigate('/jobs')}
              className="group p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-emerald-500/60 transition-all duration-300 hover:-translate-y-1 space-y-3 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Eligibility Analysis
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Deterministic verification of mandatory recruiter criteria: degree branch, CGPA cutoffs, active backlogs, and graduation year.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1 group-hover:gap-2 transition-all">
                <span>Check Cutoffs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3: Skill Gaps */}
            <div
              onClick={() => handleFeatureNavigate('/skills')}
              className="group p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-amber-500/60 transition-all duration-300 hover:-translate-y-1 space-y-3 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Skill-Gap Insights
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Pinpoints exact missing technical proficiencies and distinguishes mandatory recruiter requirements from secondary bonus skills.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 gap-1 group-hover:gap-2 transition-all">
                <span>Diagnose Gaps</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4: Prep Plan */}
            <div
              onClick={() => handleFeatureNavigate('/prep')}
              className="group p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-primary-app/60 transition-all duration-300 hover:-translate-y-1 space-y-3 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-5 h-5 text-primary-app" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink group-hover:text-primary-app transition-colors">
                  Personalized Interview Preparation
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Curates structured 4-week roadmaps with daily milestones spanning DSA, System Design, Aptitude drills, and HR communication.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-primary-app gap-1 group-hover:gap-2 transition-all">
                <span>View Daily Roadmap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5: Mock Interviews */}
            <div
              onClick={() => handleFeatureNavigate('/mock-interview')}
              className="group p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-purple-500/60 transition-all duration-300 hover:-translate-y-1 space-y-3 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <BotMessageSquare className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  AI Mock Interviews
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Timed, role-specific technical and behavioral interviews with 3-dimensional rubric evaluations: Technical Accuracy, Communication, and Completeness.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 gap-1 group-hover:gap-2 transition-all">
                <span>Start Mock Session</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6: Agent Copilot */}
            <div
              onClick={() => openAgentDrawer('Assess top jobs & verify eligibility')}
              className="group p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-primary-app/60 transition-all duration-300 hover:-translate-y-1 space-y-3 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-primary-app" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-ink group-hover:text-primary-app transition-colors">
                  Agent Copilot & Activity Trace
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Bounded multi-step reasoning agent executing real deterministic tools with step-by-step audit logs, execution traces, and instant tool actions.
                </p>
              </div>
              <div className="pt-2 flex items-center text-xs font-bold text-primary-app gap-1 group-hover:gap-2 transition-all">
                <span>Open Agent Copilot</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* 4. How It Works Section */}
        <div id="how-it-works" className="pt-8 mb-16 scroll-mt-20">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-light">
              Clear 4-Step Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mt-2">How PlaceMate AI Works</h2>
            <p className="text-xs sm:text-sm text-muted mt-1.5 max-w-lg mx-auto">
              From profile entry to campus placement offer: a deterministic, transparent pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs space-y-2.5 relative hover:border-primary-app/40 transition-all">
              <span className="font-mono text-xs font-bold text-primary-accent px-2 py-0.5 rounded bg-primary-light">
                Step 01
              </span>
              <h4 className="font-bold text-sm text-ink pt-1">Create Profile</h4>
              <p className="text-xs text-muted leading-relaxed">
                Model academic credentials, branch, CGPA, graduation batch, and demonstrated skill inventory in a clean dashboard.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs space-y-2.5 relative hover:border-emerald-500/40 transition-all">
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15">
                Step 02
              </span>
              <h4 className="font-bold text-sm text-ink pt-1">Analyze Opportunities</h4>
              <p className="text-xs text-muted leading-relaxed">
                Browse verified campus drives with deterministic eligibility checks and multi-factor match ranking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs space-y-2.5 relative hover:border-amber-500/40 transition-all">
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/15">
                Step 03
              </span>
              <h4 className="font-bold text-sm text-ink pt-1">Understand Skill Gaps</h4>
              <p className="text-xs text-muted leading-relaxed">
                Diagnose exact competencies required by recruiter JDs with targeted sandbox exercises and learning paths.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs space-y-2.5 relative hover:border-primary-app/40 transition-all">
              <span className="font-mono text-xs font-bold text-primary-accent px-2 py-0.5 rounded bg-primary-light">
                Step 04
              </span>
              <h4 className="font-bold text-sm text-ink pt-1">Prepare and Rehearse</h4>
              <p className="text-xs text-muted leading-relaxed">
                Execute daily structured preparation tasks, rehearse realistic technical rounds with AI mock interviews, and track readiness.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Dedicated Agent Copilot Showcase (Interactive Workspace) */}
        <div id="agent-copilot" className="pt-8 mb-16 scroll-mt-20 text-left">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-theme shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary-accent text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary-app" />
                  <span>Explainable Agentic AI Engine</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  PlaceMate Copilot — Autonomous Assistant
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1.5 max-w-xl leading-relaxed">
                  Ask complex placement queries in natural language. Our bounded agent decomposes requests, calls deterministic backend tools, verifies eligibility, analyzes skill gaps, and returns verifiable answers with full execution traces.
                </p>
              </div>

              <button
                onClick={() => openAgentDrawer()}
                className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-primary-app hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all cursor-pointer shrink-0 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Agent Copilot</span>
              </button>
            </div>

            {/* 4 Core Deterministic Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              <div className="p-4 rounded-xl bg-canvas border border-theme/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Tool 1</span>
                <div className="font-bold text-xs sm:text-sm text-ink">Job Discovery & Scoring</div>
                <p className="text-[11px] text-muted leading-tight">Searches verified listings and computes multi-factor match percentages.</p>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-theme/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Tool 2</span>
                <div className="font-bold text-xs sm:text-sm text-ink">Eligibility Verification</div>
                <p className="text-[11px] text-muted leading-tight">Evaluates mandatory CGPA, backlog, and branch criteria deterministically.</p>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-theme/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Tool 3</span>
                <div className="font-bold text-xs sm:text-sm text-ink">Skill Gap Diagnosis</div>
                <p className="text-[11px] text-muted leading-tight">Separates missing mandatory requirements from secondary bonus skills.</p>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-theme/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Tool 4</span>
                <div className="font-bold text-xs sm:text-sm text-ink">Prep Roadmap Drafting</div>
                <p className="text-[11px] text-muted leading-tight">Generates tailored preparation plans with balanced DSA and system design tasks.</p>
              </div>
            </div>

            {/* Interactive Prompt Switcher Tabs */}
            <div className="pt-2 border-t border-theme/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-primary-app" />
                  <span>Interactive Agent Query Sandbox:</span>
                </span>
                <span className="text-[10px] text-muted hidden sm:inline">Click a prompt to preview execution trace</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {sampleCopilotQueries.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePromptIndex(idx)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                      activePromptIndex === idx
                        ? 'bg-primary-app text-white border-primary-app shadow-2xs font-bold'
                        : 'bg-surface-alt border-theme text-muted hover:text-ink hover:bg-canvas'
                    }`}
                  >
                    <span>⚡ {item.title}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Live Trace Preview Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-canvas border border-theme shadow-inner space-y-3.5 mt-2 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-ink">
                      Active Query: "{sampleCopilotQueries[activePromptIndex].prompt}"
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface text-primary-accent border border-theme">
                    {sampleCopilotQueries[activePromptIndex].tag}
                  </span>
                </div>

                {/* Simulated Real Trace Steps */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Deterministic Multi-Tool Trace:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sampleCopilotQueries[activePromptIndex].tools.map((t, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-2.5 rounded-xl bg-surface border border-theme/70 flex items-start gap-2 text-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-mono text-[11px] font-bold text-primary-app block truncate">
                            {t.name}()
                          </span>
                          <span className="text-[11px] text-muted leading-tight">{t.result}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Grounded Answer */}
                <div className="p-3 rounded-xl bg-surface-alt/70 border border-theme/60 text-xs space-y-1">
                  <span className="font-bold text-[11px] text-ink block">
                    Grounded Placement Response:
                  </span>
                  <p className="text-muted leading-relaxed text-xs">
                    {sampleCopilotQueries[activePromptIndex].answer}
                  </p>
                </div>

                {/* Action to Run Live in Drawer */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => openAgentDrawer(sampleCopilotQueries[activePromptIndex].prompt)}
                    className="px-4 py-2 rounded-xl bg-primary-app text-white hover:opacity-95 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    <span>Run This Query in Live Copilot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. About Section */}
        <div id="about" className="pt-8 mb-12 scroll-mt-20">
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-theme text-left shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-accent" />
              <h3 className="text-lg font-bold text-ink">About PlaceMate AI</h3>
            </div>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              PlaceMate AI is built to transform campus placements into an explainable, data-driven experience. Rather
              than relying on opaque keyword filtering or fabricated vacancies, the platform integrates deterministic
              eligibility rules engines with agentic multi-tool workflows.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface-alt border border-theme space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <GraduationCap className="w-4 h-4 text-primary-accent" />
                  <span>For Students</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Clear feedback on why you qualify or fall short for a position, what specific skills you need to build,
                  and an actionable plan to get hired.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-alt border border-theme space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>For Placement Officers</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Real-time visibility into batch-wide readiness distributions, departmental skill coverage, and streamlined
                  campus drive publishing with instant candidate cutoffs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Bottom CTA Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-primary-light/40 border border-primary-light text-center space-y-4 shadow-subtle">
          <h3 className="text-xl sm:text-2xl font-bold text-ink">Ready to launch your placement preparation?</h3>
          <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto">
            Try our instant demo accounts or create your candidate profile in under 2 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 rounded-xl bg-primary-app text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started Now
            </button>
            <button
              onClick={handleLogIn}
              className="px-5 py-2.5 rounded-xl bg-surface border border-theme text-ink font-semibold text-xs sm:text-sm hover:bg-surface-alt transition-colors cursor-pointer"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-theme bg-surface py-6 px-4 sm:px-6 text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[11px] text-muted">· Agent-X 2026 Hackathon Prototype</span>
          </div>
          <div className="text-[11px] text-muted">
            PlaceMate AI — Your Next Opportunity Starts Here.
          </div>
          <div className="text-[10px] text-muted">Verified SQLite & Pure Python Rules Engine</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
