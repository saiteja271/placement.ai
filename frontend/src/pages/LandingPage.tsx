import React, { useState, useEffect } from 'react';
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
  Building2,
  Star,
  Compass,
  Code2,
  Terminal,
  Activity,
  SlidersHorizontal,
  FileCheck
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeSelector } from '../components/ThemeSelector';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAgentDrawer, openAuthModal, currentUser } = useApp();

  // Mouse Parallax for Floating Elements
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Interactive Placement Simulator State
  const [selectedRole, setSelectedRole] = useState<'amazon' | 'google' | 'microsoft'>('amazon');
  const [simulatorTab, setSimulatorTab] = useState<'match' | 'eligibility' | 'trace'>('match');

  // Interactive Readiness Calculator State
  const [calcBranch, setCalcBranch] = useState<'CSE' | 'IT' | 'ECE' | 'MECH'>('CSE');
  const [calcCgpa, setCalcCgpa] = useState<number>(8.2);
  const [calcSkill, setCalcSkill] = useState<'Python' | 'React' | 'Java' | 'SQL' | 'Cloud'>('Python');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20; // -10px to +10px
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

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

  // Demo Roles Data for Interactive Simulator
  const roleData = {
    amazon: {
      title: 'Cloud Support / SDE Intern',
      company: 'Amazon Web Services',
      matchScore: 96,
      skillsMatch: 95,
      branchMatch: 100,
      cgpaCutoff: 7.5,
      actualCgpa: 8.0,
      backlogsCutoff: 0,
      actualBacklogs: 0,
      branchReq: 'CSE, IT, ECE',
      mandatorySkills: ['Python', 'SQL', 'Docker'],
      bonusSkills: ['Kubernetes', 'AWS Lambda'],
      trace: [
        { step: 1, tool: 'search_jobs(keywords="Cloud Support", location="Bangalore")', status: 'FOUND 3 VACANCIES', ms: 142 },
        { step: 2, tool: 'check_eligibility(student="S001", cgpa=8.0, backlogs=0)', status: 'ELIGIBLE (CUTOFF 7.5 MET)', ms: 89 },
        { step: 3, tool: 'analyze_skill_gaps(skills=["Python", "SQL", "Docker"])', status: 'MATCH: 96% · 0 MANDATORY GAPS', ms: 115 },
        { step: 4, tool: 'generate_prep_plan(duration=28, role="Cloud SDE")', status: 'CURATED 9 DAILY MILESTONES', ms: 198 }
      ],
      copilotPrompt: 'Check my eligibility and skill gaps for Amazon AWS SDE Intern'
    },
    google: {
      title: 'Associate Software Engineer',
      company: 'Google India',
      matchScore: 92,
      skillsMatch: 90,
      branchMatch: 100,
      cgpaCutoff: 8.0,
      actualCgpa: 8.0,
      backlogsCutoff: 0,
      actualBacklogs: 0,
      branchReq: 'CSE, IT',
      mandatorySkills: ['Algorithms', 'Python', 'System Design'],
      bonusSkills: ['Distributed Systems', 'Go'],
      trace: [
        { step: 1, tool: 'search_jobs(company="Google", role="Software Engineer")', status: 'VERIFIED 2 OPEN DRIVES', ms: 135 },
        { step: 2, tool: 'check_eligibility(student="S001", min_cgpa=8.0)', status: 'ELIGIBLE (EXACT CUTOFF MET)', ms: 94 },
        { step: 3, tool: 'analyze_skill_gaps(skills=["Python", "DSA"])', status: 'MATCH: 92% · 1 BONUS GAP (Distributed)', ms: 120 },
        { step: 4, tool: 'draft_interview_prep(focus="System Design & LeetCode")', status: '28-DAY ROADMAP READY', ms: 210 }
      ],
      copilotPrompt: 'Evaluate my readiness for Google Associate Software Engineer'
    },
    microsoft: {
      title: 'Full Stack & AI Engineer',
      company: 'Microsoft IDC',
      matchScore: 89,
      skillsMatch: 88,
      branchMatch: 100,
      cgpaCutoff: 7.0,
      actualCgpa: 8.0,
      backlogsCutoff: 0,
      actualBacklogs: 0,
      branchReq: 'CSE, IT, ECE, EEE',
      mandatorySkills: ['TypeScript', 'Python', 'React', 'Azure'],
      bonusSkills: ['OpenAI APIs', 'GraphQL'],
      trace: [
        { step: 1, tool: 'search_jobs(company="Microsoft", role="AI Engineer")', status: 'FOUND CAMPUS RECRUITMENT POST', ms: 128 },
        { step: 2, tool: 'check_eligibility(student="S001", min_cgpa=7.0)', status: 'ELIGIBLE (+1.0 ABOVE CUTOFF)', ms: 78 },
        { step: 3, tool: 'analyze_skill_gaps(skills=["Python", "SQL", "React"])', status: 'MATCH: 89% · RECOMMENDS AZURE DRILL', ms: 105 },
        { step: 4, tool: 'generate_prep_plan(role="Full Stack AI")', status: 'MILESTONES PERSISTED TO SQLITE', ms: 185 }
      ],
      copilotPrompt: 'Assess top jobs at Microsoft IDC and draft a preparation plan'
    }
  };

  const activeRole = roleData[selectedRole];

  // Dynamic Calculation for Readiness Quick-Check
  const calculateEstimatedReadiness = () => {
    let base = 60;
    if (calcCgpa >= 8.5) base += 25;
    else if (calcCgpa >= 7.5) base += 18;
    else if (calcCgpa >= 6.5) base += 10;

    if (calcBranch === 'CSE' || calcBranch === 'IT') base += 10;
    else if (calcBranch === 'ECE') base += 5;

    if (calcSkill === 'Python' || calcSkill === 'React') base += 5;
    return Math.min(98, Math.max(55, base));
  };

  const estReadiness = calculateEstimatedReadiness();
  const estEligibleDrives = Math.min(8, Math.max(3, Math.round((estReadiness / 100) * 8)));

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-canvas text-ink flex flex-col transition-colors overflow-x-hidden relative selection:bg-primary-app selection:text-white"
    >
      {/* =========================================================================
          1. FLOATING BACKGROUND ELEMENTS: 3D GLASS SPHERES, GLOWING ORBS & GRID
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Subtle dot-grid canvas texture */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

        {/* Ambient Glowing Gradient Blur-Orbs */}
        <div
          className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, var(--primary-light) 0%, transparent 70%)',
            filter: 'blur(75px)',
            opacity: 0.55
          }}
        />
        <div
          className="absolute top-1/4 -right-36 w-[560px] h-[560px] rounded-full animate-float-slow"
          style={{
            background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
            filter: 'blur(85px)',
            opacity: 0.6
          }}
        />
        <div
          className="absolute top-2/3 left-1/4 w-[480px] h-[480px] rounded-full animate-float-reverse"
          style={{
            background: 'radial-gradient(circle, var(--primary-border) 0%, transparent 70%)',
            filter: 'blur(90px)',
            opacity: 0.35
          }}
        />

        {/* 3D-Styled Realistic Floating Glass Spheres ("Balls") */}
        {/* Sphere 1: Top-Left Hero Orbit */}
        <div
          className="absolute top-[12%] left-[6%] w-16 h-16 glass-sphere animate-float-slow transition-transform duration-300 hidden sm:block"
          style={{
            transform: `translate3d(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px, 0)`
          }}
        />

        {/* Sphere 2: Top-Right Hero Accent */}
        <div
          className="absolute top-[16%] right-[8%] w-12 h-12 glass-sphere-accent animate-float-reverse transition-transform duration-300 hidden sm:block"
          style={{
            transform: `translate3d(${-mousePos.x * 0.7}px, ${-mousePos.y * 0.7}px, 0)`
          }}
        />

        {/* Sphere 3: Mid-Left Floating Pearl */}
        <div
          className="absolute top-[44%] left-[4%] w-9 h-9 glass-sphere animate-float-drift transition-transform duration-300 hidden md:block"
          style={{
            opacity: 0.85,
            transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`
          }}
        />

        {/* Sphere 4: Mid-Right Floating Shimmer Ball */}
        <div
          className="absolute top-[52%] right-[5%] w-20 h-20 glass-sphere-accent animate-sphere-shimmer transition-transform duration-300 hidden md:block"
          style={{
            transform: `translate3d(${-mousePos.x * 0.9}px, ${-mousePos.y * 0.9}px, 0)`
          }}
        />

        {/* Sphere 5: Bottom Ambient Orb */}
        <div
          className="absolute bottom-[18%] left-[12%] w-14 h-14 glass-sphere animate-float-slow transition-transform duration-300 hidden lg:block"
          style={{
            opacity: 0.7,
            transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)`
          }}
        />

        {/* Floating Glass Micro-Badge A (Top-Left) */}
        <div
          className="absolute top-[22%] left-[10%] glass-badge p-2.5 rounded-2xl animate-float-slow hidden xl:flex items-center gap-2.5 transition-transform duration-300"
          style={{
            transform: `translate3d(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px, 0)`
          }}
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-ink leading-tight">Amazon SDE · 96% Match</span>
            <span className="text-[10px] text-muted">Deterministic Cutoff Passed</span>
          </div>
        </div>

        {/* Floating Glass Micro-Badge B (Top-Right) */}
        <div
          className="absolute top-[26%] right-[11%] glass-badge p-2.5 rounded-2xl animate-float-reverse hidden xl:flex items-center gap-2.5 transition-transform duration-300"
          style={{
            transform: `translate3d(${-mousePos.x * 0.6}px, ${-mousePos.y * 0.6}px, 0)`
          }}
        >
          <div className="w-7 h-7 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center font-bold text-xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-[11px] font-bold text-ink leading-tight">Agent Copilot Trace</span>
            <span className="text-[10px] text-muted">4 Real Tools Executed</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. HEADER NAVBAR
          ========================================================================= */}
      <header className="border-b border-theme bg-surface/85 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
        <Logo size="md" />

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted">
          <a href="#features" className="hover:text-primary-app transition-colors">
            Features
          </a>
          <a href="#simulator" className="hover:text-primary-app transition-colors">
            Interactive Demo
          </a>
          <a href="#readiness-calc" className="hover:text-primary-app transition-colors">
            Readiness Check
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

          <button
            onClick={handleLogIn}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-theme text-ink hover:bg-surface-alt transition-colors cursor-pointer"
          >
            {currentUser ? 'My Account' : 'Log In'}
          </button>

          <button
            onClick={handleGetStarted}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-primary-app hover:opacity-95 text-white shadow-2xs transition-all cursor-pointer"
          >
            <span>{currentUser ? 'Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          3. HERO SECTION
          ========================================================================= */}
      <section className="relative z-10 px-4 sm:px-6 pt-10 sm:pt-14 pb-12 max-w-5xl mx-auto text-center flex-1">
        {/* Animated Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light text-primary-accent border border-primary-border text-[11px] font-semibold mb-6 shadow-2xs animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="w-2 h-2 rounded-full bg-primary-app animate-ping" />
          <span>Grounded AI College Placement Assistant</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-theme">v2.4</span>
        </div>

        {/* Dynamic Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink mb-4 leading-tight max-w-4xl mx-auto">
          Your Next Opportunity <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary-app via-primary-accent to-accent-amber bg-clip-text text-transparent">
            Starts Right Here.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-muted max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Discover verified campus job opportunities, evaluate mandatory eligibility deterministically,
          identify actionable skill gaps, and rehearse interview rounds with an explainable AI assistant.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <button
            onClick={handleGetStarted}
            className="px-6 py-3 rounded-xl bg-primary-app hover:opacity-90 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Launch Student Portal</span>
          </button>

          <a
            href="#simulator"
            className="px-5 py-3 rounded-xl bg-surface border border-theme hover:bg-surface-alt text-ink font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5"
          >
            <Play className="w-3.5 h-3.5 text-primary-accent" />
            <span>Try Live Simulator</span>
          </a>

          <button
            onClick={() => openAgentDrawer('Summarize candidate profile and evaluate top matching campus drives')}
            className="px-4 py-3 rounded-xl bg-primary-light text-primary-accent border border-primary-border hover:bg-primary-app hover:text-white font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Agent Copilot</span>
          </button>
        </div>

        {/* =========================================================================
            4. INTERACTIVE HERO PRODUCT SIMULATOR (LIVE PLACEMENT ENGINE PREVIEW)
            ========================================================================= */}
        <div
          id="simulator"
          className="w-full max-w-4xl mx-auto rounded-3xl bg-surface/90 backdrop-blur-xl border border-theme shadow-2xl p-4 sm:p-6 text-left transition-all duration-300 relative overflow-hidden scroll-mt-24 mb-16"
          style={{
            transform: `perspective(1000px) rotateX(${-mousePos.y * 0.15}deg) rotateY(${mousePos.x * 0.15}deg)`
          }}
        >
          {/* Subtle Inner Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/40 rounded-full blur-3xl pointer-events-none" />

          {/* Simulator Window Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-theme/80">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-bold text-ink ml-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-primary-accent" />
                <span>PlaceMate Placement Engine Simulator</span>
              </span>
            </div>

            {/* Live Interactive Role Selector Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-canvas border border-theme">
              {(['amazon', 'google', 'microsoft'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all capitalize cursor-pointer ${
                    selectedRole === r
                      ? 'bg-primary-app text-white shadow-2xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Content Area */}
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Role Snapshot & Match Gauge */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-canvas border border-theme space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">
                    {activeRole.company}
                  </span>
                  <h3 className="text-sm font-bold text-ink mt-0.5">{activeRole.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary-accent leading-none">
                    {activeRole.matchScore}%
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600">Match Score</span>
                </div>
              </div>

              {/* Verified Criteria Verification Grid */}
              <div className="space-y-2 pt-2 border-t border-theme/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted text-[11px]">CGPA Cutoff (Min {activeRole.cgpaCutoff}):</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 text-[11px]">
                    <Check className="w-3 h-3" /> {activeRole.actualCgpa} (Met)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-[11px]">Max Backlogs ({activeRole.backlogsCutoff}):</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 text-[11px]">
                    <Check className="w-3 h-3" /> 0 Backlogs (Passed)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted text-[11px]">Branch Eligibility:</span>
                  <span className="font-bold text-ink text-[11px]">{activeRole.branchReq}</span>
                </div>
              </div>

              {/* Required Skills Tags */}
              <div className="pt-2 border-t border-theme/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1.5">
                  Verified Skill Overlap
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeRole.mandatorySkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                    >
                      ✓ {sk}
                    </span>
                  ))}
                  {activeRole.bonusSkills.map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20"
                    >
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Multi-Tool Execution Trace or Interactive Tabs */}
            <div className="lg:col-span-7 space-y-3">
              {/* Simulator Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-theme/70 pb-2">
                <button
                  onClick={() => setSimulatorTab('match')}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    simulatorTab === 'match'
                      ? 'bg-surface text-primary-app border border-theme shadow-2xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Skill Match
                </button>
                <button
                  onClick={() => setSimulatorTab('eligibility')}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    simulatorTab === 'eligibility'
                      ? 'bg-surface text-primary-app border border-theme shadow-2xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Eligibility Audit
                </button>
                <button
                  onClick={() => setSimulatorTab('trace')}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    simulatorTab === 'trace'
                      ? 'bg-surface text-primary-app border border-theme shadow-2xs'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Agent Tool Trace</span>
                </button>
              </div>

              {/* Sub-Tab 1: Skill Breakdown */}
              {simulatorTab === 'match' && (
                <div className="space-y-3 p-3 rounded-2xl bg-canvas border border-theme">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Core Technical Skills Overlap</span>
                      <span className="text-primary-accent">{activeRole.skillsMatch}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full bg-primary-app rounded-full transition-all duration-500"
                        style={{ width: `${activeRole.skillsMatch}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Department / Branch Affinity</span>
                      <span className="text-emerald-600">100%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full" />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted leading-relaxed pt-1">
                    💡 <strong>Deterministic Analysis</strong>: Match score weights skill overlap (50%), mandatory eligibility (30%),
                    and preferred domain alignment (20%).
                  </p>
                </div>
              )}

              {/* Sub-Tab 2: Eligibility Audit */}
              {simulatorTab === 'eligibility' && (
                <div className="space-y-2 p-3 rounded-2xl bg-canvas border border-theme text-xs">
                  <div className="p-2 rounded-xl bg-surface border border-theme flex items-center justify-between">
                    <span className="text-muted">Minimum CGPA (Recruiter rule):</span>
                    <span className="font-bold text-ink">≥ {activeRole.cgpaCutoff}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface border border-theme flex items-center justify-between">
                    <span className="text-muted">Candidate CGPA (Anjali):</span>
                    <span className="font-bold text-emerald-600">8.0 (PASS)</span>
                  </div>
                  <div className="p-2 rounded-xl bg-surface border border-theme flex items-center justify-between">
                    <span className="text-muted">Active Backlogs:</span>
                    <span className="font-bold text-emerald-600">0 (PASS)</span>
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Real Agent Trace */}
              {simulatorTab === 'trace' && (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {activeRole.trace.map((tr) => (
                    <div key={tr.step} className="p-2.5 rounded-xl bg-canvas border border-theme space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-primary-accent">
                          Step {tr.step}: {tr.tool}
                        </span>
                        <span className="text-[9px] font-mono text-muted">{tr.ms}ms</span>
                      </div>
                      <div className="text-[11px] text-ink font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{tr.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Bar inside Simulator */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => openAgentDrawer(activeRole.copilotPrompt)}
                  className="px-3.5 py-2 rounded-xl bg-primary-app hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run this in Copilot</span>
                </button>

                <button
                  onClick={handleGetStarted}
                  className="text-xs font-semibold text-primary-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore full 8-job dataset</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. TRUSTED HIRING PARTNERS MARQUEE TICKER
            ========================================================================= */}
        <div className="mb-20 pt-2 border-y border-theme/60 py-5 overflow-hidden relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-3 text-center">
            Verified Recruitment Cutoffs From Top Engineering Employers
          </span>

          <div className="flex gap-8 items-center animate-marquee select-none">
            {[
              'Google India',
              'Amazon AWS',
              'Microsoft IDC',
              'Cisco Systems',
              'Oracle Cloud',
              'Infosys Labs',
              'Tata Consultancy Services',
              'Qualcomm Technologies',
              'Adobe Systems',
              'Accenture Digital',
              'Google India',
              'Amazon AWS',
              'Microsoft IDC',
              'Cisco Systems',
              'Oracle Cloud',
              'Infosys Labs',
              'Tata Consultancy Services',
              'Qualcomm Technologies',
              'Adobe Systems',
              'Accenture Digital'
            ].map((company, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-theme text-xs font-bold text-ink shrink-0 shadow-2xs hover:border-primary-app transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-primary-accent" />
                <span>{company}</span>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            6. FEATURES SECTION
            ========================================================================= */}
        <div id="features" className="pt-4 mb-20 scroll-mt-20">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider">
              Engineered Capabilities
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-ink mt-1">
              Grounded Placement Assistance
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-lg mx-auto">
              Transparent, deterministic rules combined with contextual AI intelligence. No fabricated listings or
              unsupported claims.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-primary-accent/50 hover:-translate-y-1 transition-all space-y-3 group cursor-pointer"
              onClick={() => currentUser ? navigate('/jobs') : handleGetStarted()}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-ink">Intelligent Job Matching</h3>
              <p className="text-xs text-muted leading-relaxed">
                Multi-dimensional scoring evaluating skill overlap, role preferences, and domain alignment across verified
                campus vacancies.
              </p>
              <div className="text-[11px] font-semibold text-primary-accent flex items-center gap-1 pt-1">
                <span>View Job Matching</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-accent-green/50 hover:-translate-y-1 transition-all space-y-3 group cursor-pointer"
              onClick={() => currentUser ? navigate('/jobs') : handleGetStarted()}
            >
              <div className="w-10 h-10 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-ink">Eligibility Analysis</h3>
              <p className="text-xs text-muted leading-relaxed">
                Deterministic verification of mandatory recruiter criteria: degree branch, CGPA cutoffs, active backlogs,
                and graduation year.
              </p>
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 pt-1">
                <span>Audit Criteria</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-accent-amber/50 hover:-translate-y-1 transition-all space-y-3 group cursor-pointer"
              onClick={() => currentUser ? navigate('/skills') : handleGetStarted()}
            >
              <div className="w-10 h-10 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-ink">Skill-Gap Insights</h3>
              <p className="text-xs text-muted leading-relaxed">
                Pinpoints exact missing technical proficiencies and distinguishes mandatory recruiter requirements from
                secondary bonus skills.
              </p>
              <div className="text-[11px] font-semibold text-amber-600 flex items-center gap-1 pt-1">
                <span>Explore Skill Sandbox</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-primary-accent/50 hover:-translate-y-1 transition-all space-y-3 group cursor-pointer"
              onClick={() => currentUser ? navigate('/prep') : handleGetStarted()}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-ink">Personalized Interview Preparation</h3>
              <p className="text-xs text-muted leading-relaxed">
                Curates structured 4-week roadmaps with daily milestones spanning DSA, System Design, Aptitude drills, and
                HR communication.
              </p>
              <div className="text-[11px] font-semibold text-primary-accent flex items-center gap-1 pt-1">
                <span>View Prep Roadmaps</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-accent-purple/50 hover:-translate-y-1 transition-all space-y-3 group cursor-pointer"
              onClick={() => currentUser ? navigate('/mock-interview') : handleGetStarted()}
            >
              <div className="w-10 h-10 rounded-xl bg-accent-purple/15 text-primary-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <BotMessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-ink">AI Mock Interviews</h3>
              <p className="text-xs text-muted leading-relaxed">
                Timed, role-specific technical and behavioral interviews with 3-dimensional rubric evaluations: Technical
                Accuracy, Communication, and Completeness.
              </p>
              <div className="text-[11px] font-semibold text-primary-accent flex items-center gap-1 pt-1">
                <span>Start Mock Session</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-surface border border-theme shadow-2xs hover:shadow-md hover:border-primary-accent/50 hover:-translate-y-1 transition-all space-y-3 group cursor-pointer"
              onClick={() => openAgentDrawer()}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-ink">Agent Copilot & Activity Trace</h3>
              <p className="text-xs text-muted leading-relaxed">
                Bounded multi-step reasoning agent executing real deterministic tools with step-by-step audit logs, execution traces, and instant tool actions.
              </p>
              <div className="text-[11px] font-semibold text-primary-accent flex items-center gap-1 pt-1">
                <span>Launch Copilot</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            7. INTERACTIVE READINESS QUICK-CHECK WIDGET
            ========================================================================= */}
        <div id="readiness-calc" className="pt-4 mb-20 scroll-mt-20 text-left">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-theme shadow-xl relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-green/15 text-emerald-600 text-[11px] font-bold mb-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Instant Diagnostic Tool</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  Placement Readiness Quick-Estimator
                </h2>
                <p className="text-xs text-muted mt-1 max-w-xl">
                  Adjust your branch, CGPA, and core competency below to instantly preview verified campus drive eligibility.
                </p>
              </div>

              {/* Dynamic Score Display Badge */}
              <div className="p-4 rounded-2xl bg-canvas border border-theme text-center sm:text-right shrink-0">
                <div className="text-3xl font-black text-primary-app leading-none">
                  {estReadiness}%
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">
                  {estEligibleDrives} of 8 Drives Eligible
                </span>
              </div>
            </div>

            {/* Interactive Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
              {/* Branch Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink block">Academic Branch</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['CSE', 'IT', 'ECE', 'MECH'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setCalcBranch(b)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        calcBranch === b
                          ? 'bg-primary-app text-white border-primary-app shadow-2xs font-bold'
                          : 'bg-canvas border-theme text-muted hover:text-ink hover:bg-surface-alt'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* CGPA Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-ink">Cumulative CGPA</label>
                  <span className="text-xs font-extrabold text-primary-accent px-2 py-0.5 rounded-md bg-canvas border border-theme">
                    {calcCgpa.toFixed(1)} / 10.0
                  </span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="10.0"
                  step="0.1"
                  value={calcCgpa}
                  onChange={(e) => setCalcCgpa(parseFloat(e.target.value))}
                  className="w-full accent-primary-app cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>6.0 (Tier-3 min)</span>
                  <span>7.5 (Amazon cutoff)</span>
                  <span>8.5+ (High priority)</span>
                </div>
              </div>

              {/* Primary Skill */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink block">Top Skill Focus</label>
                <div className="flex flex-wrap gap-1.5">
                  {(['Python', 'React', 'Java', 'SQL', 'Cloud'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setCalcSkill(s)}
                      className={`py-1.5 px-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        calcSkill === s
                          ? 'bg-primary-app text-white border-primary-app shadow-2xs font-bold'
                          : 'bg-canvas border-theme text-muted hover:text-ink'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Result Action */}
            <div className="p-3.5 rounded-2xl bg-canvas border border-theme flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted">
                Based on current criteria for <strong>{calcBranch}</strong> with <strong>{calcCgpa} CGPA</strong>, you qualify for
                top software engineering drives.
              </span>
              <button
                onClick={handleGetStarted}
                className="px-4 py-2 rounded-xl bg-primary-app text-white text-xs font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                Create Candidate Profile
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            8. HOW IT WORKS (4-STEP METHODOLOGY)
            ========================================================================= */}
        <div id="how-it-works" className="pt-4 mb-20 scroll-mt-20">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider">
              Clear 4-Step Methodology
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-ink mt-1">
              How PlaceMate AI Works
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1 max-w-lg mx-auto">
              From profile modeling to campus placement offer: a deterministic, transparent pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs space-y-2 relative">
              <span className="font-mono text-xs font-bold text-primary-accent px-2 py-0.5 rounded bg-primary-light">
                Step 01
              </span>
              <h4 className="font-bold text-sm text-ink pt-1">Create Profile</h4>
              <p className="text-xs text-muted leading-relaxed">
                Model academic credentials, branch, CGPA, graduation batch, and demonstrated skill inventory in a clean
                dashboard.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs space-y-2 relative">
              <span className="font-mono text-xs font-bold text-accent-green px-2 py-0.5 rounded bg-accent-green/15">
                Step 02
              </span>
              <h4 className="font-bold text-sm text-ink pt-1">Analyze Opportunities</h4>
              <p className="text-xs text-muted leading-relaxed">
                Browse verified campus drives with deterministic eligibility checks and multi-factor match ranking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs space-y-2 relative">
              <span className="font-mono text-xs font-bold text-accent-amber px-2 py-0.5 rounded bg-accent-amber/15">
                Step 03
              </span>
              <h4 className="font-bold text-sm text-ink pt-1">Understand Skill Gaps</h4>
              <p className="text-xs text-muted leading-relaxed">
                Diagnose exact competencies required by recruiter JDs with targeted sandbox exercises and learning paths.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs space-y-2 relative">
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

        {/* =========================================================================
            9. DEDICATED AGENT COPILOT SHOWCASE
            ========================================================================= */}
        <div id="agent-copilot" className="pt-4 mb-20 scroll-mt-20 text-left">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-theme shadow-xl space-y-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light text-primary-accent text-[11px] font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explainable Agentic AI Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  PlaceMate Copilot — Autonomous Placement Assistant
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
                  Ask complex placement queries in natural language. Our bounded agent decomposes requests, calls deterministic backend tools, verifies eligibility, analyzes skill gaps, and returns verifiable answers with full execution traces.
                </p>
              </div>

              <button
                onClick={() => openAgentDrawer()}
                className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary-app hover:opacity-95 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Agent Copilot</span>
              </button>
            </div>

            {/* 4 Core Deterministic Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Tool 1</span>
                <div className="font-bold text-xs text-ink">Job Discovery & Scoring</div>
                <p className="text-[10px] text-muted leading-tight">Searches verified listings and computes multi-factor match percentages.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-green block">Tool 2</span>
                <div className="font-bold text-xs text-ink">Eligibility Verification</div>
                <p className="text-[10px] text-muted leading-tight">Evaluates mandatory CGPA, backlog, and branch criteria deterministically.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-amber block">Tool 3</span>
                <div className="font-bold text-xs text-ink">Skill Gap Diagnosis</div>
                <p className="text-[10px] text-muted leading-tight">Separates missing mandatory requirements from secondary bonus skills.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Tool 4</span>
                <div className="font-bold text-xs text-ink">Prep Roadmap Drafting</div>
                <p className="text-[10px] text-muted leading-tight">Generates tailored preparation plans with balanced DSA and system design tasks.</p>
              </div>
            </div>

            {/* Quick Interactive Prompt Previews */}
            <div className="pt-2 border-t border-theme/60 flex flex-wrap items-center gap-2">
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
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-alt border border-theme text-primary-accent hover:bg-primary-app hover:text-white transition-all cursor-pointer font-medium"
                >
                  ⚡ {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            10. ABOUT SECTION
            ========================================================================= */}
        <div id="about" className="pt-4 mb-16 scroll-mt-20">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-theme text-left shadow-xl space-y-4">
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
              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <GraduationCap className="w-4 h-4 text-primary-accent" />
                  <span>For Students</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Clear feedback on why you qualify or fall short for a position, what specific skills you need to build,
                  and an actionable plan to get hired.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
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
            11. BOTTOM CTA BANNER
            ========================================================================= */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-primary-light/60 via-surface to-accent/30 border border-primary-border text-center space-y-4 shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold text-ink">
            Ready to launch your placement preparation?
          </h3>
          <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto">
            Try our instant demo accounts or create your candidate profile in under 2 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGetStarted}
              className="px-6 py-3 rounded-xl bg-primary-app text-white font-semibold text-xs sm:text-sm hover:opacity-95 shadow-md transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Started Now
            </button>
            <button
              onClick={handleLogIn}
              className="px-5 py-3 rounded-xl bg-surface border border-theme text-ink font-semibold text-xs sm:text-sm hover:bg-surface-alt transition-colors cursor-pointer hover:-translate-y-0.5"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          12. FOOTER
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
