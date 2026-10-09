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
  Zap,
  TrendingUp,
  Award,
  Layers,
  GraduationCap,
  Users,
  UserPlus,
  Play,
  Check,
  Compass,
  Cpu,
  Terminal,
  Activity,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeSelector } from '../components/ThemeSelector';
import { useApp } from '../context/AppContext';

// Sample Live Placement Roles for Interactive Hero Widget
const DEMO_ROLES = [
  {
    id: 'sde',
    title: 'Software Development Engineer',
    company: 'NexGen Cloud Labs',
    matchScore: 96,
    eligibilityStatus: 'ELIGIBLE',
    cgpaReq: '7.0 (Candidate: 8.0)',
    backlogReq: '0 Backlogs',
    matchedSkills: ['Python', 'SQL', 'FastAPI', 'DSA'],
    missingSkills: ['Docker', 'AWS'],
    avgPackage: '₹14 - 18 LPA',
    copilotPrompt: 'Evaluate my profile for Software Development Engineer at NexGen Cloud Labs with eligibility and skill gaps'
  },
  {
    id: 'data',
    title: 'Data & Analytics Engineer',
    company: 'FinTech Dynamics',
    matchScore: 92,
    eligibilityStatus: 'ELIGIBLE',
    cgpaReq: '7.5 (Candidate: 8.0)',
    backlogReq: '0 Backlogs',
    matchedSkills: ['SQL', 'Python', 'Pandas', 'Statistics'],
    missingSkills: ['Tableau', 'Spark'],
    avgPackage: '₹12 - 16 LPA',
    copilotPrompt: 'Check my fit and eligibility for Data & Analytics Engineer at FinTech Dynamics'
  },
  {
    id: 'ai',
    title: 'AI / Machine Learning Engineer',
    company: 'Cognitive Matrix',
    matchScore: 88,
    eligibilityStatus: 'ELIGIBLE',
    cgpaReq: '8.0 (Candidate: 8.0)',
    backlogReq: '0 Backlogs',
    matchedSkills: ['Python', 'Machine Learning', 'Linear Algebra'],
    missingSkills: ['PyTorch', 'MLOps'],
    avgPackage: '₹18 - 24 LPA',
    copilotPrompt: 'Analyze skill gaps and prepare a roadmap for AI / Machine Learning Engineer'
  },
  {
    id: 'devops',
    title: 'Cloud & DevOps Associate',
    company: 'ScaleGrid Systems',
    matchScore: 91,
    eligibilityStatus: 'ELIGIBLE',
    cgpaReq: '6.5 (Candidate: 8.0)',
    backlogReq: '0 Backlogs',
    matchedSkills: ['Linux', 'Git', 'Python Scripting', 'Networking'],
    missingSkills: ['Kubernetes', 'Terraform'],
    avgPackage: '₹10 - 15 LPA',
    copilotPrompt: 'Assess readiness for Cloud & DevOps Associate and generate a 4-week prep plan'
  }
];

// 4-Step Interactive Methodology
const STEPS_DATA = [
  {
    number: '01',
    title: 'Create Verified Profile',
    summary: 'Model academic credentials, branch, CGPA, graduation batch, and demonstrated skill inventory.',
    detail: 'Deterministic profile parsing ensures every student record has validated CGPA, active backlog tallies, and clean skill tags ready for recruiter cutoff matching.',
    badge: 'Step 01 · Data Modeling',
    badgeColor: 'text-primary-accent bg-primary-light'
  },
  {
    number: '02',
    title: 'Analyze Opportunities',
    summary: 'Browse verified campus drives with deterministic eligibility checks and multi-factor match ranking.',
    detail: 'No fabricated listings. Every opportunity is scored across skill overlap, location preferences, and hard academic eligibility gates with full transparency.',
    badge: 'Step 02 · Match Engine',
    badgeColor: 'text-accent-green bg-accent-green/15'
  },
  {
    number: '03',
    title: 'Understand Skill Gaps',
    summary: 'Diagnose exact competencies required by recruiter JDs with targeted sandbox exercises and learning paths.',
    detail: 'Separates mandatory recruiter prerequisites from secondary nice-to-have skills. Shows exact readiness percentage and curated practice links.',
    badge: 'Step 03 · Gap Diagnosis',
    badgeColor: 'text-accent-amber bg-accent-amber/15'
  },
  {
    number: '04',
    title: 'Prepare and Rehearse',
    summary: 'Execute daily structured preparation tasks, rehearse realistic technical rounds with AI mock interviews.',
    detail: 'Interactive 4-week day-by-day roadmap with balanced DSA, system design, and aptitude milestones, plus role-specific mock interviews with 3D rubric feedback.',
    badge: 'Step 04 · Interview Readiness',
    badgeColor: 'text-primary-accent bg-primary-light'
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAgentDrawer, openAuthModal, currentUser } = useApp();

  // Interactive Live Hero State
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const currentRole = DEMO_ROLES[activeRoleIndex];

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

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col transition-colors overflow-x-hidden relative select-none">
      {/* =========================================================================
          FLOATING LIGHT OBJECTS, BALLS & AMBIENT GLOW LAYER (Background Atmosphere)
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Soft Radial Ambient Aurora Glows */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[38rem] sm:w-[50rem] h-[26rem] bg-gradient-to-b from-primary-light/50 via-primary-light/20 to-transparent blur-3xl rounded-full opacity-60 animate-pulse-soft" />
        <div className="absolute top-[38rem] -left-20 w-[30rem] h-[30rem] bg-gradient-to-tr from-primary-light/40 via-amber-200/20 to-transparent blur-3xl rounded-full opacity-50 animate-float-drift" />
        <div className="absolute top-[70rem] -right-20 w-[36rem] h-[36rem] bg-gradient-to-bl from-primary-light/40 via-sky-200/20 to-transparent blur-3xl rounded-full opacity-50 animate-float-reverse" />

        {/* Floating Light Surface Glass Balls / Spheres */}
        {/* Sphere 1: Top Left - Translucent 3D Glass Sphere with Specular Highlight */}
        <div className="absolute top-16 left-4 sm:left-14 w-24 h-24 sm:w-32 sm:h-32 rounded-full glass-orb animate-float-slow opacity-85 shadow-lg border border-white/70">
          <div className="w-7 h-7 rounded-full bg-white/60 blur-xs absolute top-3 left-4" />
          <div className="w-3 h-3 rounded-full bg-white/80 absolute top-2 left-5" />
        </div>

        {/* Sphere 2: Top Right - Soft Pastel Floating Orb */}
        <div className="absolute top-24 right-5 sm:right-20 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-primary-light/80 via-white/80 to-primary/20 backdrop-blur-md animate-float-reverse opacity-80 border border-white/80 shadow-md">
          <div className="w-5 h-5 rounded-full bg-white/70 blur-2xs absolute top-3 right-4" />
        </div>

        {/* Sphere 3: Mid-Left Floating Bubble */}
        <div className="absolute top-[32rem] left-8 sm:left-24 w-14 h-14 sm:w-16 sm:h-16 rounded-full glass-orb animate-float-drift opacity-75 shadow-sm">
          <div className="w-3 h-3 rounded-full bg-white/70 blur-2xs absolute top-2 left-2" />
        </div>

        {/* Sphere 4: Mid-Right Floating Light Sphere */}
        <div className="absolute top-[45rem] -right-6 sm:right-16 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-white/95 via-primary-light/50 to-white/40 backdrop-blur-lg animate-float-slow opacity-70 border border-white/60 shadow-xl">
          <div className="w-8 h-8 rounded-full bg-white/50 blur-xs absolute top-4 left-6" />
        </div>

        {/* Sphere 5: Lower Left Floating Bubble */}
        <div className="absolute top-[68rem] left-6 sm:left-16 w-20 h-20 sm:w-24 sm:h-24 rounded-full glass-orb animate-float-reverse opacity-70 shadow-md">
          <div className="w-4 h-4 rounded-full bg-white/60 blur-2xs absolute top-3 left-3" />
        </div>

        {/* Sphere 6: Lower Right Subtle Orb */}
        <div className="absolute top-[92rem] right-10 sm:right-32 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-white via-primary-light/60 to-white/70 backdrop-blur-md animate-float-drift opacity-75 border border-white/70 shadow-sm" />

        {/* Tiny Floating Micro-Bubbles */}
        <div className="absolute top-48 left-1/4 w-5 h-5 rounded-full bg-white/80 border border-white/90 shadow-2xs animate-float-reverse opacity-60" />
        <div className="absolute top-80 right-1/4 w-7 h-7 rounded-full glass-orb animate-float-slow opacity-70" />
        <div className="absolute top-[56rem] left-1/3 w-6 h-6 rounded-full bg-primary-light/70 border border-white shadow-2xs animate-float-drift opacity-60" />
      </div>

      {/* Floating Interactive Badge Pills (Visible on Tablet/Desktop for High Visual Polish) */}
      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/85 backdrop-blur-md border border-theme shadow-md text-xs font-semibold animate-float-slow absolute top-28 left-6 xl:left-14 z-10 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-ink">94% Match Verified</span>
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/85 backdrop-blur-md border border-theme shadow-md text-xs font-semibold animate-float-reverse absolute top-36 right-6 xl:right-16 z-10 pointer-events-none">
        <ShieldCheck className="w-3.5 h-3.5 text-accent-green" />
        <span className="text-ink">Deterministic Eligibility Engine</span>
      </div>

      <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/85 backdrop-blur-md border border-theme shadow-md text-xs font-semibold animate-float-drift absolute top-[30rem] left-8 xl:left-12 z-10 pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-primary-app" />
        <span className="text-ink">Bounded Multi-Tool Trace</span>
      </div>

      {/* =========================================================================
          1. HEADER NAVBAR
          ========================================================================= */}
      <header className="border-b border-theme bg-surface/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
        <Logo size="md" />

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted">
          <a href="#features" className="hover:text-primary-app transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-primary-app transition-colors">
            How It Works
          </a>
          <a href="#agent-copilot" className="hover:text-primary-app transition-colors">
            Agent Copilot
          </a>
          <a href="#about" className="hover:text-primary-app transition-colors">
            About
          </a>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSelector compact align="right" />

          {/* Log In Button */}
          <button
            onClick={handleLogIn}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-theme text-ink hover:bg-surface-alt transition-colors cursor-pointer"
          >
            {currentUser ? 'My Account' : 'Log In'}
          </button>

          {/* Get Started Button */}
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-primary-app hover:opacity-95 text-white shadow-2xs transition-all cursor-pointer"
          >
            <span>{currentUser ? 'Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-16 pb-16 max-w-5xl mx-auto text-center flex-1 relative z-10">
        {/* Glowing Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface/85 backdrop-blur-md text-primary-accent border border-primary-light text-[11px] font-semibold mb-6 shadow-subtle hover:border-primary-app/50 transition-all cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-primary-app animate-pulse" />
          <span>Intelligent College Placement Assistant · Agent-X 2026</span>
        </div>

        {/* Prominent Headline with Gradient Shimmer */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-5 leading-tight sm:leading-tight max-w-4xl mx-auto">
          Your Next Opportunity{' '}
          <span className="bg-gradient-to-r from-primary-app via-primary-accent to-amber-600 bg-clip-text text-transparent">
            Starts Here.
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-muted max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Discover relevant campus opportunities, verify hard eligibility rules, pinpoint skill gaps, and rehearse
          with an explainable, multi-tool AI placement copilot.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={handleGetStarted}
            className="px-6 py-3 rounded-xl bg-primary-app hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Get Started Free</span>
          </button>

          <a
            href="#interactive-demo"
            className="px-5 py-3 rounded-xl bg-surface/90 backdrop-blur-md border border-theme hover:bg-surface text-ink font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5"
          >
            <span>Try Interactive Demo</span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </a>

          <button
            onClick={() => openAgentDrawer('Summarize candidate profile and evaluate best job matches')}
            className="px-4 py-3 rounded-xl bg-primary-light text-primary-accent border border-primary-light hover:bg-primary-app hover:text-white font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Agent Copilot</span>
          </button>
        </div>

        {/* =========================================================================
            INTERACTIVE LIVE PLACEMENT SIMULATOR WIDGET (Hero Highlight)
            ========================================================================= */}
        <div id="interactive-demo" className="mb-16 scroll-mt-24 text-left">
          <div className="p-5 sm:p-7 rounded-3xl bg-surface/95 backdrop-blur-md border border-theme shadow-xl relative overflow-hidden transition-all">
            {/* Soft Ambient Inner Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-light/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            {/* Widget Header & Role Switcher Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-theme/60 pb-4 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-accent">
                    Live Placement Matcher Simulation
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-0.5">
                  Click a role to preview candidate fit, hard eligibility verification, and gap diagnosis in real time:
                </p>
              </div>

              {/* Verified Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>Deterministic Rules Engine</span>
              </div>
            </div>

            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 relative z-10">
              {DEMO_ROLES.map((r, idx) => {
                const isActive = idx === activeRoleIndex;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveRoleIndex(idx)}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-surface-tint border-primary-app shadow-sm ring-1 ring-primary-app/20'
                        : 'bg-canvas/80 border-theme/80 hover:bg-surface hover:border-theme text-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted truncate">
                        {r.company}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-primary-app text-white' : 'bg-surface border border-theme text-ink'
                        }`}
                      >
                        {r.matchScore}%
                      </span>
                    </div>
                    <div className={`text-xs font-bold mt-1 line-clamp-1 ${isActive ? 'text-ink' : 'text-ink/80'}`}>
                      {r.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Role Dynamic Preview Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 sm:p-5 rounded-2xl bg-canvas/70 border border-theme relative z-10">
              {/* Left Column: Role Overview & Eligibility */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
                      <span>{currentRole.title}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                      <span className="font-semibold text-primary-accent">{currentRole.company}</span>
                      <span>•</span>
                      <span>Package: {currentRole.avgPackage}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                    <CheckCircle className="w-3 h-3" />
                    <span>{currentRole.eligibilityStatus}</span>
                  </span>
                </div>

                {/* Hard Eligibility Checklist */}
                <div className="p-3 rounded-xl bg-surface border border-theme/80 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Hard Recruiter Cutoffs Verified
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-ink">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>CGPA Cutoff: <strong>{currentRole.cgpaReq}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Backlogs: <strong>{currentRole.backlogReq}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Matched vs Missing Skills */}
                <div className="space-y-2 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-muted block mb-1">
                      Matched Candidate Skills ({currentRole.matchedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentRole.matchedSkills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-medium"
                        >
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-muted block mb-1">
                      Target Skill Gaps to Bridge ({currentRole.missingSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentRole.missingSkills.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[11px] font-medium"
                        >
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Match Score Dial & Direct Copilot Launcher */}
              <div className="md:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-surface border border-theme/80 space-y-4">
                <div className="text-center">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                    Multi-Factor Match Score
                  </div>

                  {/* Circular Score Visual */}
                  <div className="relative inline-flex items-center justify-center w-24 h-24 my-1">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-surface-alt"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-primary-app transition-all duration-700 ease-out"
                        strokeDasharray={`${currentRole.matchScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-ink">{currentRole.matchScore}%</span>
                      <span className="text-[9px] font-bold text-muted uppercase">Match</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted px-2 mt-1">
                    Strong alignment across primary requirements and core branch credentials.
                  </p>
                </div>

                {/* Instant Copilot Test Trigger */}
                <button
                  onClick={() => openAgentDrawer(currentRole.copilotPrompt)}
                  className="w-full py-2.5 px-3 rounded-xl bg-primary-app hover:opacity-95 text-white text-xs font-bold shadow-subtle transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Agent Trace for This Role</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            KEY STATS ROW (Social Proof & Verifiability)
            ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-20 text-left">
          <div className="p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-ink">500+</div>
            <div className="text-xs font-semibold text-primary-accent mt-0.5">Verified Campus Vacancies</div>
            <p className="text-[10px] text-muted mt-1">Live active drives with zero synthetic records.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs font-semibold text-primary-accent mt-0.5">Deterministic Rules</div>
            <p className="text-[10px] text-muted mt-1">Hard CGPA, backlog, and branch eligibility gates.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-ink">3-Axis</div>
            <div className="text-xs font-semibold text-primary-accent mt-0.5">Mock Rubric Scoring</div>
            <p className="text-[10px] text-muted mt-1">Accuracy, Communication, and Completeness feedback.</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:shadow-md transition-all">
            <div className="text-2xl sm:text-3xl font-extrabold text-ink">&lt; 1.5s</div>
            <div className="text-xs font-semibold text-primary-accent mt-0.5">Multi-Tool Trace Speed</div>
            <p className="text-[10px] text-muted mt-1">Bounded step-by-step audit logs & instant actions.</p>
          </div>
        </div>

        {/* =========================================================================
            3. FEATURES SECTION (Engineered Capabilities)
            ========================================================================= */}
        <div id="features" className="pt-8 mb-20 scroll-mt-20">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider">
              Engineered Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1">Grounded Placement Assistance</h2>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-lg mx-auto">
              Transparent, deterministic rules combined with contextual AI intelligence. No fabricated listings or
              unsupported claims.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {/* Feature 1 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:border-primary-app/50 hover:shadow-lg hover:-translate-y-1 transition-all space-y-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5 text-primary-app" />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-primary-app transition-colors">
                Intelligent Job Matching
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Multi-dimensional scoring evaluating skill overlap, role preferences, and domain alignment across verified
                campus vacancies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:border-emerald-500/50 hover:shadow-lg hover:-translate-y-1 transition-all space-y-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-emerald-600 transition-colors">
                Eligibility Analysis
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Deterministic verification of mandatory recruiter criteria: degree branch, CGPA cutoffs, active backlogs,
                and graduation year.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:border-amber-500/50 hover:shadow-lg hover:-translate-y-1 transition-all space-y-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-amber-600 transition-colors">
                Skill-Gap Insights
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Pinpoints exact missing technical proficiencies and distinguishes mandatory recruiter requirements from
                secondary bonus skills.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:border-primary-app/50 hover:shadow-lg hover:-translate-y-1 transition-all space-y-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5 text-primary-app" />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-primary-app transition-colors">
                Personalized Interview Preparation
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Curates structured 4-week roadmaps with daily milestones spanning DSA, System Design, Aptitude drills, and
                HR communication.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:border-purple-500/50 hover:shadow-lg hover:-translate-y-1 transition-all space-y-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BotMessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-purple-600 transition-colors">
                AI Mock Interviews
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Timed, role-specific technical and behavioral interviews with 3-dimensional rubric evaluations: Technical
                Accuracy, Communication, and Completeness.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme shadow-2xs hover:border-primary-app/50 hover:shadow-lg hover:-translate-y-1 transition-all space-y-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-primary-app" />
              </div>
              <h3 className="font-bold text-sm text-ink group-hover:text-primary-app transition-colors">
                Agent Copilot & Activity Trace
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Bounded multi-step reasoning agent executing real deterministic tools with step-by-step audit logs, execution traces, and instant tool actions.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. HOW IT WORKS SECTION (Interactive Stepper)
            ========================================================================= */}
        <div id="how-it-works" className="pt-8 mb-20 scroll-mt-20">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider">
              Clear 4-Step Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1">How PlaceMate AI Works</h2>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-lg mx-auto">
              From candidate profile entry to verified campus placement offer: a deterministic, transparent pipeline.
            </p>
          </div>

          {/* Stepper Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {STEPS_DATA.map((step, idx) => {
              const isSelected = idx === activeStepIndex;
              return (
                <div
                  key={step.number}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-5 rounded-2xl border shadow-2xs space-y-2.5 relative transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-surface border-primary-app shadow-md ring-1 ring-primary-app/20 -translate-y-1'
                      : 'bg-surface/85 backdrop-blur-md border-theme hover:bg-surface hover:border-theme/90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${step.badgeColor}`}>
                      {step.number}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-primary-accent bg-surface-tint px-2 py-0.5 rounded-full border border-theme">
                        Active Step
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-ink pt-1">{step.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">
                    {step.summary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Expanded Step Deep Dive */}
          <div className="mt-4 p-5 rounded-2xl bg-surface/90 backdrop-blur-md border border-theme text-left shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STEPS_DATA[activeStepIndex].badgeColor}`}>
                {STEPS_DATA[activeStepIndex].badge}
              </span>
              <h4 className="text-sm font-bold text-ink pt-1">
                {STEPS_DATA[activeStepIndex].title} Logic
              </h4>
              <p className="text-xs text-muted max-w-2xl leading-relaxed">
                {STEPS_DATA[activeStepIndex].detail}
              </p>
            </div>

            <button
              onClick={handleGetStarted}
              className="px-4 py-2 rounded-xl bg-primary-app text-white text-xs font-semibold hover:opacity-95 transition-opacity shrink-0 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Try Step {STEPS_DATA[activeStepIndex].number}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            5. DEDICATED AGENT COPILOT SHOWCASE
            ========================================================================= */}
        <div id="agent-copilot" className="pt-8 mb-20 scroll-mt-20 text-left">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface/95 backdrop-blur-md border border-theme shadow-xl space-y-6 relative overflow-hidden">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light text-primary-accent text-[11px] font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explainable Agentic AI Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  PlaceMate Copilot — Multi-Step Autonomous Assistant
                </h2>
                <p className="text-xs text-muted mt-1 max-w-xl">
                  Ask complex placement queries in natural language. Our bounded agent decomposes requests, calls deterministic backend tools, verifies eligibility, analyzes skill gaps, and returns verifiable answers with full execution traces.
                </p>
              </div>

              <button
                onClick={() => openAgentDrawer()}
                className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-primary-app hover:opacity-95 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0 hover:shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Agent Copilot</span>
              </button>
            </div>

            {/* 4 Core Deterministic Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 relative z-10">
              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5 hover:border-primary-app/40 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Tool 1</span>
                <div className="font-bold text-xs text-ink">Job Discovery & Scoring</div>
                <p className="text-[10px] text-muted leading-tight">Searches verified listings and computes multi-factor match percentages.</p>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5 hover:border-emerald-500/40 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-green block">Tool 2</span>
                <div className="font-bold text-xs text-ink">Eligibility Verification</div>
                <p className="text-[10px] text-muted leading-tight">Evaluates mandatory CGPA, backlog, and branch criteria deterministically.</p>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5 hover:border-amber-500/40 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-amber block">Tool 3</span>
                <div className="font-bold text-xs text-ink">Skill Gap Diagnosis</div>
                <p className="text-[10px] text-muted leading-tight">Separates missing mandatory requirements from secondary bonus skills.</p>
              </div>
              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5 hover:border-primary-app/40 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Tool 4</span>
                <div className="font-bold text-xs text-ink">Prep Roadmap Drafting</div>
                <p className="text-[10px] text-muted leading-tight">Generates tailored preparation plans with balanced DSA and system design tasks.</p>
              </div>
            </div>

            {/* Quick Interactive Prompt Previews */}
            <div className="pt-2 border-t border-theme/60 flex flex-wrap items-center gap-2 relative z-10">
              <span className="text-[11px] font-semibold text-muted">Try asking the Copilot:</span>
              {[
                'Assess top jobs & verify my eligibility',
                'Analyze skill gaps for Google SDE',
                'Generate a 4-week preparation plan',
                'Find eligible Software Engineer positions'
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => openAgentDrawer(sample)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-surface border border-theme text-primary-accent hover:bg-primary-app hover:text-white transition-all cursor-pointer font-medium shadow-2xs hover:shadow-xs"
                >
                  ⚡ {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. ABOUT SECTION
            ========================================================================= */}
        <div id="about" className="pt-8 mb-16 scroll-mt-20">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-md border border-theme text-left shadow-md space-y-5">
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
              <div className="p-4 rounded-2xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <GraduationCap className="w-4 h-4 text-primary-accent" />
                  <span>For Students</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Clear feedback on why you qualify or fall short for a position, what specific skills you need to build,
                  and an actionable plan to get hired.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <Users className="w-4 h-4 text-accent-green" />
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

        {/* =========================================================================
            7. BOTTOM CTA BANNER
            ========================================================================= */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-primary-light/70 via-surface/90 to-primary-light/50 backdrop-blur-md border border-primary-light text-center space-y-4 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-extrabold text-ink">
            Ready to launch your placement preparation?
          </h3>
          <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto">
            Try our instant demo accounts or create your candidate profile in under 2 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 rounded-xl bg-primary-app text-white font-semibold text-xs sm:text-sm hover:opacity-95 shadow-md hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5"
            >
              Get Started Now
            </button>
            <button
              onClick={handleLogIn}
              className="px-5 py-2.5 rounded-xl bg-surface border border-theme text-ink font-semibold text-xs sm:text-sm hover:bg-surface-alt transition-colors cursor-pointer shadow-2xs hover:-translate-y-0.5"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
          ========================================================================= */}
      <footer className="border-t border-theme bg-surface py-6 px-4 sm:px-6 text-xs text-muted relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
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
