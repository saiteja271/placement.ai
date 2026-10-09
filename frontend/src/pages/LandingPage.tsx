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
  ChevronDown,
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
  Terminal,
  SlidersHorizontal,
  Cpu,
  HelpCircle,
  Star,
  Laptop,
  Building2,
  ExternalLink,
  Clock,
  Code2
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeSelector } from '../components/ThemeSelector';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAgentDrawer, openAuthModal, currentUser } = useApp();

  // ---------------------------------------------------------------------------
  // Interactive Sandbox State
  // ---------------------------------------------------------------------------
  const [selectedPersona, setSelectedPersona] = useState<'anjali' | 'teja' | 'rahul'>('anjali');
  const [activeSandboxTab, setActiveSandboxTab] = useState<'jobs' | 'agent' | 'mock' | 'prep'>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<'j1' | 'j2' | 'j3'>('j1');
  const [hasEvaluatedEligibility, setHasEvaluatedEligibility] = useState<boolean>(true);

  // Agent Sandbox Interactive Queries
  const [selectedAgentQueryIndex, setSelectedAgentQueryIndex] = useState<number>(0);

  // Prep Plan Interactive Checklist
  const [completedPrepTasks, setCompletedPrepTasks] = useState<Record<string, boolean>>({
    't1': true,
    't2': true,
    't3': false,
    't4': false
  });

  // How It Works Step Selector
  const [activeStep, setActiveStep] = useState<number>(1);

  // Role Showcase Switcher (Students vs Officers)
  const [roleView, setRoleView] = useState<'student' | 'officer'>('student');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Persona Data
  const personas = {
    anjali: {
      name: 'Anjali Sharma',
      branch: 'Computer Science',
      cgpa: 8.0,
      backlogs: 0,
      skills: ['Python', 'FastAPI', 'SQL', 'Docker', 'React'],
      target: 'Full Stack & SDE Roles'
    },
    teja: {
      name: 'Teja Reddy',
      branch: 'Information Technology',
      cgpa: 7.5,
      backlogs: 0,
      skills: ['Python', 'SQL', 'Docker', 'Git'],
      target: 'Backend & Cloud Roles'
    },
    rahul: {
      name: 'Rahul Verma',
      branch: 'Electronics & Comm.',
      cgpa: 6.8,
      backlogs: 1,
      skills: ['C++', 'Linux', 'Git', 'Networking'],
      target: 'Core Systems & Firmware'
    }
  };

  const currentPersona = personas[selectedPersona];

  // Jobs for Sandbox
  const sandboxJobs = {
    j1: {
      id: 'j1',
      title: 'Python Developer',
      company: 'NexGen Labs',
      location: 'Bengaluru · Hybrid',
      minCgpa: 7.0,
      allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm.'],
      maxBacklogs: 0,
      salary: '₹9,50,000 / yr',
      requiredSkills: ['Python', 'FastAPI', 'SQL', 'Docker']
    },
    j2: {
      id: 'j2',
      title: 'Cloud Solutions Engineer',
      company: 'CloudWave Technologies',
      location: 'Hyderabad · On-site',
      minCgpa: 7.5,
      allowedBranches: ['Computer Science', 'Information Technology'],
      maxBacklogs: 0,
      salary: '₹12,00,000 / yr',
      requiredSkills: ['AWS', 'Docker', 'Linux', 'Kubernetes']
    },
    j3: {
      id: 'j3',
      title: 'Full Stack Associate',
      company: 'Infosys Innovation Lab',
      location: 'Pune · Hybrid',
      minCgpa: 6.5,
      allowedBranches: ['Computer Science', 'Information Technology', 'Electronics & Comm.'],
      maxBacklogs: 1,
      salary: '₹7,50,000 / yr',
      requiredSkills: ['React', 'JavaScript', 'Node.js', 'SQL']
    }
  };

  const currentJob = sandboxJobs[selectedJobId];

  // Dynamic Rule Evaluation Logic for Sandbox
  const isCgpaMet = currentPersona.cgpa >= currentJob.minCgpa;
  const isBranchApproved = currentJob.allowedBranches.includes(currentPersona.branch);
  const isBacklogsAllowed = currentPersona.backlogs <= currentJob.maxBacklogs;
  const isOverallEligible = isCgpaMet && isBranchApproved && isBacklogsAllowed;

  // Agent Prompts & Traces for Sandbox
  const agentDemos = [
    {
      prompt: 'Verify my eligibility for Google SDE and summarize requirements',
      tool1: { name: 'fetch_student_profile(id="S001")', time: '28ms', result: 'Name: Anjali · CGPA: 8.0 · Backlogs: 0' },
      tool2: { name: 'verify_deterministic_eligibility(job_id="J004")', time: '42ms', result: 'CGPA 8.0 >= 7.0 ✓ · Backlogs: 0 ✓ · Branch: CS ✓' },
      tool3: { name: 'synthesize_verifiable_answer()', time: '86ms', result: 'Status: 100% ELIGIBLE. No hard cutoff blockers detected.' },
      summary: 'You satisfy all mandatory recruiter criteria for this campus drive. Your CGPA (8.0) exceeds the 7.0 cutoff, with 0 active backlogs.'
    },
    {
      prompt: 'Diagnose my skill gaps for Cloud Solutions Engineer',
      tool1: { name: 'fetch_student_skills(id="S001")', time: '22ms', result: 'Skills: Python, FastAPI, SQL, Docker, React' },
      tool2: { name: 'compare_recruiter_jd_skills(job_id="J002")', time: '55ms', result: 'Required: AWS, Docker, Linux, Kubernetes' },
      tool3: { name: 'generate_gap_matrix()', time: '94ms', result: 'Missing Mandatory: AWS, Kubernetes · Matched: Docker (75%)' },
      summary: 'You have strong Docker containerization foundations. Recommended priority: complete the 2-week AWS EC2/IAM and Kubernetes deployment drills.'
    },
    {
      prompt: 'Draft a 4-week personalized preparation plan for campus drives',
      tool1: { name: 'analyze_student_readiness(id="S001")', time: '35ms', result: 'Readiness Score: 78/100 · Target: Backend SDE' },
      tool2: { name: 'curate_balanced_curriculum(duration=28)', time: '68ms', result: '28 daily milestones generated across DSA & System Design' },
      tool3: { name: 'persist_plan(plan_id="prep-live-01")', time: '110ms', result: 'Plan saved to student profile database.' },
      summary: 'Generated a customized 4-week roadmap with 9 active milestones balancing LeetCode Two-Pointer patterns, Redis caching, and STAR interview rehearsal.'
    }
  ];

  const currentAgentDemo = agentDemos[selectedAgentQueryIndex];

  // Prep Plan Tasks
  const prepTasks = [
    { id: 't1', day: 'Day 01', title: 'Two-Pointer & Sliding Window Array Problems', category: 'DSA', est: '45 mins' },
    { id: 't2', day: 'Day 02', title: 'SQL Window Functions & Sargable Query Optimization', category: 'DBMS', est: '40 mins' },
    { id: 't3', day: 'Day 03', title: 'Distributed Cache Invalidation Strategies (LRU)', category: 'System Design', est: '60 mins' },
    { id: 't4', day: 'Day 04', title: 'STAR Behavioral Rehearsal: Conflict Resolution', category: 'Behavioral', est: '30 mins' }
  ];

  const completedCount = Object.values(completedPrepTasks).filter(Boolean).length;
  const prepProgressPercentage = Math.round((completedCount / prepTasks.length) * 100);

  const toggleTask = (id: string) => {
    setCompletedPrepTasks(prev => ({ ...prev, [id]: !prev[id] }));
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

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col transition-colors overflow-x-hidden selection:bg-primary-light selection:text-primary-app">
      {/* -----------------------------------------------------------------------
          1. Sleek Navigation Header
      ------------------------------------------------------------------------ */}
      <header className="border-b border-theme bg-surface/85 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-6">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-muted">
            <a href="#sandbox" className="hover:text-primary-app transition-colors flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary-app" />
              <span>Interactive Sandbox</span>
            </a>
            <a href="#features" className="hover:text-primary-app transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-primary-app transition-colors">
              How It Works
            </a>
            <a href="#agent-copilot" className="hover:text-primary-app transition-colors">
              Agent Copilot
            </a>
            <a href="#faq" className="hover:text-primary-app transition-colors">
              FAQ
            </a>
            <a href="#about" className="hover:text-primary-app transition-colors">
              About
            </a>
          </nav>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSelector compact align="right" />

          <button
            onClick={handleLogIn}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-theme text-ink hover:bg-surface-alt transition-colors cursor-pointer"
          >
            {currentUser ? 'My Account' : 'Sign In'}
          </button>

          <button
            onClick={handleGetStarted}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-primary-app hover:opacity-90 text-white shadow-2xs transition-all cursor-pointer"
          >
            <span>{currentUser ? 'Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* -----------------------------------------------------------------------
          2. Hero Section with Ambient Glow
      ------------------------------------------------------------------------ */}
      <section className="relative px-4 sm:px-6 pt-12 sm:pt-16 pb-12 max-w-5xl mx-auto text-center">
        {/* Soft Ambient Radial Backdrop */}
        <div className="pointer-events-none absolute inset-x-0 -top-20 -z-10 flex justify-center overflow-hidden">
          <div className="h-[420px] w-[700px] rounded-full bg-primary-app/10 blur-[120px] opacity-70" />
        </div>

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light border border-primary-app/20 text-[11px] font-bold text-primary-accent mb-6 shadow-2xs animate-in fade-in duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Agent-X 2026 Prototype · 100% Explainable Placement AI</span>
          <ChevronRight className="w-3 h-3 opacity-60" />
        </div>

        {/* Impactful Headline with Gradient */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-ink mb-5 leading-[1.12] max-w-4xl mx-auto">
          Your Next Opportunity{' '}
          <span className="bg-gradient-to-r from-primary-app via-accent-amber to-primary-app bg-clip-text text-transparent">
            Starts Here.
          </span>
        </h1>

        {/* Clear Subtitle */}
        <p className="text-xs sm:text-base md:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          An intelligent college placement assistant that matches student profiles with verified opportunities, verifies
          mandatory eligibility with hard rules, diagnoses skill gaps, and prepares candidates through autonomous AI agents.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
          <button
            onClick={handleGetStarted}
            className="px-6 py-3 rounded-xl bg-primary-app hover:opacity-90 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
          >
            <UserPlus className="w-4 h-4" />
            <span>Launch Student Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => openAgentDrawer('Summarize candidate profile and verify top job matches')}
            className="px-5 py-3 rounded-xl bg-surface border border-theme text-ink hover:border-primary-app/50 hover:bg-surface-alt font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-primary-app" />
            <span>Launch Agent Copilot</span>
          </button>

          <a
            href="#sandbox"
            className="px-4 py-3 rounded-xl bg-canvas border border-theme hover:bg-surface text-muted hover:text-ink font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-accent-amber" />
            <span>Try Live Simulator</span>
          </a>
        </div>

        {/* Proven Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-4 pb-2 border-t border-theme/60 text-left">
          <div className="p-3 rounded-xl bg-surface/60 border border-theme/50">
            <div className="text-xl sm:text-2xl font-black text-primary-app">100%</div>
            <div className="text-[11px] font-bold text-ink">Deterministic Rules</div>
            <div className="text-[10px] text-muted">Hard CGPA & backlog validation</div>
          </div>
          <div className="p-3 rounded-xl bg-surface/60 border border-theme/50">
            <div className="text-xl sm:text-2xl font-black text-accent-green">8+</div>
            <div className="text-[11px] font-bold text-ink">Campus Vacancies</div>
            <div className="text-[10px] text-muted">Zero fabricated or ghost jobs</div>
          </div>
          <div className="p-3 rounded-xl bg-surface/60 border border-theme/50">
            <div className="text-xl sm:text-2xl font-black text-accent-amber">3-Tier</div>
            <div className="text-[11px] font-bold text-ink">Mock Rubric Scoring</div>
            <div className="text-[10px] text-muted">Accuracy, Delivery & Depth</div>
          </div>
          <div className="p-3 rounded-xl bg-surface/60 border border-theme/50">
            <div className="text-xl sm:text-2xl font-black text-primary-app">&lt;350ms</div>
            <div className="text-[11px] font-bold text-ink">Agent Execution</div>
            <div className="text-[10px] text-muted">Bounded multi-tool audit trace</div>
          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------------
          3. Interactive Product Sandbox (Show, Don't Just Tell!)
      ------------------------------------------------------------------------ */}
      <section id="sandbox" className="px-4 sm:px-6 py-8 sm:py-12 max-w-5xl mx-auto w-full scroll-mt-16">
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider bg-primary-light px-2.5 py-0.5 rounded-full border border-primary-app/20">
            Interactive Product Sandbox
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink mt-2">
            Experience PlaceMate AI in Real Time
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl mx-auto">
            Test the matching engine, inspect deterministic eligibility proofs, trace autonomous agent execution, and
            interact with live prep checklists below.
          </p>
        </div>

        {/* Master Sandbox Window Frame */}
        <div className="rounded-2xl border border-theme bg-surface shadow-xl overflow-hidden transition-all text-left">
          {/* Top Browser Title Bar */}
          <div className="bg-canvas/90 border-b border-theme px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            {/* Window Dots & Persona Indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              </div>
              <span className="text-[11px] font-bold text-muted hidden sm:inline">
                Candidate Profile Simulation:
              </span>
            </div>

            {/* Persona Switcher Buttons */}
            <div className="flex items-center gap-1 bg-surface rounded-xl p-1 border border-theme text-xs font-semibold">
              <button
                onClick={() => setSelectedPersona('anjali')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedPersona === 'anjali'
                    ? 'bg-primary-app text-white shadow-2xs font-bold'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Anjali (CS · 8.0)
              </button>
              <button
                onClick={() => setSelectedPersona('teja')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedPersona === 'teja'
                    ? 'bg-primary-app text-white shadow-2xs font-bold'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Teja (IT · 7.5)
              </button>
              <button
                onClick={() => setSelectedPersona('rahul')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedPersona === 'rahul'
                    ? 'bg-primary-app text-white shadow-2xs font-bold'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Rahul (ECE · 6.8)
              </button>
            </div>
          </div>

          {/* Sandbox Navigation Tabs */}
          <div className="border-b border-theme bg-surface-alt/40 px-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveSandboxTab('jobs')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSandboxTab === 'jobs'
                  ? 'border-primary-app text-primary-app'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Job Discovery & Eligibility</span>
            </button>
            <button
              onClick={() => setActiveSandboxTab('agent')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSandboxTab === 'agent'
                  ? 'border-primary-app text-primary-app'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Agent Copilot Live Trace</span>
            </button>
            <button
              onClick={() => setActiveSandboxTab('mock')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSandboxTab === 'mock'
                  ? 'border-primary-app text-primary-app'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <BotMessageSquare className="w-3.5 h-3.5" />
              <span>AI Mock Interview 3D Rubric</span>
            </button>
            <button
              onClick={() => setActiveSandboxTab('prep')}
              className={`py-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeSandboxTab === 'prep'
                  ? 'border-primary-app text-primary-app'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Interactive Prep Roadmap</span>
            </button>
          </div>

          {/* Sandbox Content Area */}
          <div className="p-4 sm:p-6 bg-surface">
            {/* -------------------------------------------------------------
                Tab 1: Job Discovery & Deterministic Eligibility
            -------------------------------------------------------------- */}
            {activeSandboxTab === 'jobs' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                  <div>
                    <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                      <span>Evaluated for {currentPersona.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary-accent border border-theme">
                        {currentPersona.branch} · {currentPersona.cgpa} CGPA · {currentPersona.backlogs} Backlogs
                      </span>
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      Select a recruiter posting to inspect real-time deterministic eligibility checks:
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/jobs')}
                    className="self-start sm:self-auto text-xs font-bold text-primary-app hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All in Portal</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Job Cards Picker */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.values(sandboxJobs).map((job) => {
                    const isSelected = selectedJobId === job.id;
                    const jobEligible =
                      currentPersona.cgpa >= job.minCgpa &&
                      job.allowedBranches.includes(currentPersona.branch) &&
                      currentPersona.backlogs <= job.maxBacklogs;

                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(job.id as any)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-surface-alt border-primary-app shadow-sm ring-1 ring-primary-app/20'
                            : 'bg-canvas hover:bg-surface-alt/60 border-theme'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-muted uppercase truncate">
                            {job.company}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              jobEligible
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-600 border border-red-500/20'
                            }`}
                          >
                            {jobEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-ink truncate">{job.title}</h4>
                        <div className="text-[11px] text-muted mt-1 flex items-center justify-between">
                          <span>Min CGPA: {job.minCgpa}</span>
                          <span className="font-semibold text-ink">{job.salary}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Diagnostic Breakdown for Selected Job */}
                <div className="p-4 rounded-xl bg-canvas border border-theme space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary-light text-primary-accent flex items-center justify-center font-bold text-xs">
                        {currentJob.company.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-ink">{currentJob.title} — {currentJob.company}</div>
                        <div className="text-[10px] text-muted">{currentJob.location}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-surface border border-theme text-ink">
                        {isOverallEligible ? '✅ Verification Result: PASS' : '❌ Verification Result: DISQUALIFIED'}
                      </span>
                    </div>
                  </div>

                  {/* 3 Hard Rules Verification Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div
                      className={`p-2.5 rounded-lg border text-xs ${
                        isCgpaMet
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                          : 'bg-red-500/5 border-red-500/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase">1. CGPA Cutoff Rule</div>
                      <div className="text-xs font-semibold mt-0.5">
                        {currentPersona.cgpa} vs {currentJob.minCgpa} req
                      </div>
                      <div className="text-[10px] opacity-80">
                        {isCgpaMet ? '✓ Satisfies recruiter cutoff' : '✗ Below minimum threshold'}
                      </div>
                    </div>

                    <div
                      className={`p-2.5 rounded-lg border text-xs ${
                        isBranchApproved
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                          : 'bg-red-500/5 border-red-500/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase">2. Eligible Degrees</div>
                      <div className="text-xs font-semibold mt-0.5 truncate">
                        {currentPersona.branch}
                      </div>
                      <div className="text-[10px] opacity-80">
                        {isBranchApproved ? '✓ Branch approved by JD' : '✗ Branch not shortlisted'}
                      </div>
                    </div>

                    <div
                      className={`p-2.5 rounded-lg border text-xs ${
                        isBacklogsAllowed
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                          : 'bg-red-500/5 border-red-500/30 text-red-800 dark:text-red-300'
                      }`}
                    >
                      <div className="font-bold text-[10px] uppercase">3. Active Backlog Policy</div>
                      <div className="text-xs font-semibold mt-0.5">
                        {currentPersona.backlogs} backlogs (Max: {currentJob.maxBacklogs})
                      </div>
                      <div className="text-[10px] opacity-80">
                        {isBacklogsAllowed ? '✓ Backlog criteria cleared' : '✗ Exceeds allowed backlogs'}
                      </div>
                    </div>
                  </div>

                  {/* Skills Alignment */}
                  <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-bold text-muted mr-1">Skills Overlap:</span>
                    {currentJob.requiredSkills.map((sk) => {
                      const hasSkill = currentPersona.skills.includes(sk);
                      return (
                        <span
                          key={sk}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            hasSkill
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          }`}
                        >
                          {hasSkill ? '✓ ' : '⚡ Missing: '} {sk}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                Tab 2: Agent Copilot Live Execution Trace
            -------------------------------------------------------------- */}
            {activeSandboxTab === 'agent' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                  <div>
                    <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-primary-app" />
                      <span>Bounded Multi-Step Agent Execution Simulator</span>
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      Select an authentic user prompt to see how PlaceMate Copilot invokes real deterministic tools:
                    </p>
                  </div>
                  <button
                    onClick={() => openAgentDrawer(currentAgentDemo.prompt)}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-primary-app text-white text-xs font-bold shadow-2xs hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch in Live Drawer</span>
                  </button>
                </div>

                {/* Prompt Chips */}
                <div className="flex flex-wrap gap-2">
                  {agentDemos.map((demo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAgentQueryIndex(idx)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all cursor-pointer ${
                        selectedAgentQueryIndex === idx
                          ? 'bg-primary-app text-white border-primary-app shadow-2xs font-bold'
                          : 'bg-canvas text-ink border-theme hover:bg-surface-alt'
                      }`}
                    >
                      {demo.prompt}
                    </button>
                  ))}
                </div>

                {/* Animated Terminal Trace View */}
                <div className="p-4 rounded-xl bg-ink text-white font-mono text-xs space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-muted text-[11px] pb-2 border-b border-white/10">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>AGENT PIPELINE: Deterministic Multi-Step Orchestrator</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-sans">Execution Mode: REAL TOOLS ONLY</span>
                  </div>

                  {/* Step 1 */}
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-bold">Step 1: {currentAgentDemo.tool1.name}</span>
                      <span className="text-zinc-400">{currentAgentDemo.tool1.time}</span>
                    </div>
                    <div className="text-zinc-300 text-[11px] pl-2 border-l border-emerald-400/40">
                      ↳ Result: {currentAgentDemo.tool1.result}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-300 font-bold">Step 2: {currentAgentDemo.tool2.name}</span>
                      <span className="text-zinc-400">{currentAgentDemo.tool2.time}</span>
                    </div>
                    <div className="text-zinc-300 text-[11px] pl-2 border-l border-amber-300/40">
                      ↳ Result: {currentAgentDemo.tool2.result}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-primary-light font-bold">Step 3: {currentAgentDemo.tool3.name}</span>
                      <span className="text-zinc-400">{currentAgentDemo.tool3.time}</span>
                    </div>
                    <div className="text-zinc-300 text-[11px] pl-2 border-l border-primary-light/40">
                      ↳ Result: {currentAgentDemo.tool3.result}
                    </div>
                  </div>

                  {/* Final Synthesized Output */}
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-sans">
                    <div className="font-bold text-[11px] uppercase text-emerald-400 mb-1">
                      Final Verified Agent Answer:
                    </div>
                    <p className="leading-relaxed">{currentAgentDemo.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                Tab 3: AI Mock Interview 3D Rubric Simulation
            -------------------------------------------------------------- */}
            {activeSandboxTab === 'mock' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                  <div>
                    <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                      <BotMessageSquare className="w-4 h-4 text-primary-app" />
                      <span>3-Dimensional Rubric Interview Scoring Simulator</span>
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      Realistic Round-1 interview evaluation across Technical Accuracy, Communication, and Completeness:
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/mock-interview')}
                    className="self-start sm:self-auto text-xs font-bold text-primary-app hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Start Full Mock Interview</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Sample Question Box */}
                <div className="p-4 rounded-xl bg-canvas border border-theme space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent bg-primary-light px-2 py-0.5 rounded">
                      Technical Architecture Question
                    </span>
                    <span className="text-xs text-muted font-medium">Difficulty: Intermediate</span>
                  </div>
                  <div className="font-bold text-sm text-ink">
                    "Explain the trade-offs between a relational SQL database and a distributed NoSQL key-value store for session caching."
                  </div>
                  <p className="text-xs text-muted italic">
                    Candidate Response: "For session caching, key-value stores like Redis are optimal due to in-memory sub-millisecond lookups ($O(1)$) and automated TTL expiry, whereas SQL databases introduce unnecessary disk I/O and ACID overhead."
                  </p>
                </div>

                {/* 3D Rubric Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-surface-alt border border-theme space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">1. Technical Accuracy</span>
                      <span className="text-xs font-black text-emerald-600">92 / 100</span>
                    </div>
                    <div className="w-full bg-theme/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[92%]" />
                    </div>
                    <p className="text-[10px] text-muted leading-tight">
                      Correctly identified $O(1)$ memory access, TTL expiration, and persistence trade-offs.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-alt border border-theme space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">2. Communication & Clarity</span>
                      <span className="text-xs font-black text-primary-app">88 / 100</span>
                    </div>
                    <div className="w-full bg-theme/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary-app h-full rounded-full w-[88%]" />
                    </div>
                    <p className="text-[10px] text-muted leading-tight">
                      Concise, professional framing with zero hesitation or filler phrases.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-alt border border-theme space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">3. Completeness & Depth</span>
                      <span className="text-xs font-black text-accent-amber">85 / 100</span>
                    </div>
                    <div className="w-full bg-theme/30 h-2 rounded-full overflow-hidden">
                      <div className="bg-accent-amber h-full rounded-full w-[85%]" />
                    </div>
                    <p className="text-[10px] text-muted leading-tight">
                      Suggested addition: highlight write-through vs write-back cache invalidation policies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                Tab 4: Interactive Prep Roadmap Checklist
            -------------------------------------------------------------- */}
            {activeSandboxTab === 'prep' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme">
                  <div>
                    <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-primary-app" />
                      <span>Interactive Placement Preparation Checklist</span>
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      Click checkboxes below to simulate marking tasks complete and watch your readiness dynamically advance:
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/prep')}
                    className="self-start sm:self-auto text-xs font-bold text-primary-app hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Full 28-Day Plan</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Progress Bar Header */}
                <div className="p-3.5 rounded-xl bg-canvas border border-theme space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-ink">
                      Sprint Completion: {completedCount} of {prepTasks.length} Milestones Checked
                    </span>
                    <span className="font-black text-primary-app">{prepProgressPercentage}% Ready</span>
                  </div>
                  <div className="w-full bg-theme/30 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-app h-full rounded-full transition-all duration-300"
                      style={{ width: `${prepProgressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Checklist Items */}
                <div className="space-y-2">
                  {prepTasks.map((t) => {
                    const isDone = completedPrepTasks[t.id];
                    return (
                      <div
                        key={t.id}
                        onClick={() => toggleTask(t.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isDone
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-ink'
                            : 'bg-surface hover:bg-surface-alt border-theme'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-theme hover:border-primary-app'
                            }`}
                          >
                            {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                                {t.day} · {t.category}
                              </span>
                              <span className="text-[10px] text-muted font-mono">{t.est}</span>
                            </div>
                            <div
                              className={`text-xs font-semibold ${
                                isDone ? 'line-through text-muted' : 'text-ink'
                              }`}
                            >
                              {t.title}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-primary-app shrink-0">
                          {isDone ? 'Completed' : 'Click to Finish'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------------
          4. Engineered Capabilities Feature Grid (3x2)
      ------------------------------------------------------------------------ */}
      <section id="features" className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full scroll-mt-20">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider bg-primary-light px-2.5 py-0.5 rounded-full border border-primary-app/20">
            Engineered Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mt-2">
            Grounded Placement Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-lg mx-auto">
            Transparent, deterministic rules combined with contextual AI intelligence. Zero fabricated listings or
            unsupported claims.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          {/* Feature 1 */}
          <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-primary-app hover:-translate-y-1 transition-all duration-300 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center shadow-2xs">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt border border-theme text-muted">
                Live Matching
              </span>
            </div>
            <h3 className="font-bold text-sm text-ink group-hover:text-primary-app transition-colors">
              Intelligent Job Discovery & Ranking
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Multi-dimensional scoring evaluating skill overlap, role preferences, and domain alignment across verified
              campus vacancies with instant filtering.
            </p>
            <div className="pt-2 border-t border-theme/60 flex items-center justify-between text-xs font-semibold text-primary-app">
              <span>Explore Vacancies</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-emerald-500 hover:-translate-y-1 transition-all duration-300 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt border border-theme text-emerald-600">
                100% Deterministic
              </span>
            </div>
            <h3 className="font-bold text-sm text-ink group-hover:text-emerald-600 transition-colors">
              Deterministic Eligibility Analysis
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Strict mathematical verification of mandatory recruiter criteria: degree branch, CGPA cutoffs, active
              backlogs, and graduation year with plain-English reasons.
            </p>
            <div className="pt-2 border-t border-theme/60 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>View Rule Engine</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-amber-500 hover:-translate-y-1 transition-all duration-300 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-2xs">
                <Target className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt border border-theme text-amber-600">
                Gap Diagnostics
              </span>
            </div>
            <h3 className="font-bold text-sm text-ink group-hover:text-amber-600 transition-colors">
              Skill-Gap Insights & Exercises
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Separates mandatory hard requirements from secondary bonus skills. Delivers targeted sandbox exercises to
              fill competencies before interview rounds.
            </p>
            <div className="pt-2 border-t border-theme/60 flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>Diagnose Gaps</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-primary-app hover:-translate-y-1 transition-all duration-300 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center shadow-2xs">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt border border-theme text-primary-app">
                Curriculum
              </span>
            </div>
            <h3 className="font-bold text-sm text-ink group-hover:text-primary-app transition-colors">
              Personalized 4-Week Prep Roadmap
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Curates structured 28-day roadmaps with daily milestones spanning DSA problem-solving, System Design,
              Aptitude drills, and HR STAR communication.
            </p>
            <div className="pt-2 border-t border-theme/60 flex items-center justify-between text-xs font-semibold text-primary-app">
              <span>Build Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shadow-2xs">
                <BotMessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt border border-theme text-purple-600">
                Interactive AI
              </span>
            </div>
            <h3 className="font-bold text-sm text-ink group-hover:text-purple-600 transition-colors">
              AI Mock Interviews & 3D Rubric
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Timed, role-specific technical and behavioral interviews with 3-dimensional rubric evaluations: Technical
              Accuracy, Communication Clarity, and Completeness.
            </p>
            <div className="pt-2 border-t border-theme/60 flex items-center justify-between text-xs font-semibold text-purple-600">
              <span>Start Mock Round</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-primary-app hover:-translate-y-1 transition-all duration-300 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-alt border border-theme text-primary-app">
                Autonomous
              </span>
            </div>
            <h3 className="font-bold text-sm text-ink group-hover:text-primary-app transition-colors">
              Agent Copilot & Activity Trace
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Bounded multi-step reasoning agent executing real deterministic tools with step-by-step audit logs, execution
              traces, and instant actionable recommendations.
            </p>
            <div className="pt-2 border-t border-theme/60 flex items-center justify-between text-xs font-semibold text-primary-app">
              <span>Launch Copilot</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------------
          5. Interactive 4-Step Methodology Pipeline
      ------------------------------------------------------------------------ */}
      <section id="how-it-works" className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full scroll-mt-20">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider bg-primary-light px-2.5 py-0.5 rounded-full border border-primary-app/20">
            Clear 4-Step Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mt-2">
            How PlaceMate AI Works
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-lg mx-auto">
            From profile entry to placement offer: a deterministic, verifiable placement pipeline. Click any step to inspect details.
          </p>
        </div>

        {/* 4 Interactive Step Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          {[
            {
              step: 1,
              title: 'Create Profile',
              desc: 'Model academic credentials, branch, CGPA, graduation batch, and demonstrated skill inventory in a clean dashboard.',
              badgeColor: 'bg-primary-light text-primary-accent'
            },
            {
              step: 2,
              title: 'Analyze Opportunities',
              desc: 'Browse verified campus drives with deterministic eligibility checks and multi-factor match ranking.',
              badgeColor: 'bg-emerald-500/10 text-emerald-600'
            },
            {
              step: 3,
              title: 'Understand Skill Gaps',
              desc: 'Diagnose exact competencies required by recruiter JDs with targeted sandbox exercises and learning paths.',
              badgeColor: 'bg-amber-500/10 text-amber-600'
            },
            {
              step: 4,
              title: 'Prepare & Rehearse',
              desc: 'Execute daily structured preparation tasks, rehearse realistic technical rounds with AI mock interviews, and track readiness.',
              badgeColor: 'bg-purple-500/10 text-purple-600'
            }
          ].map((item) => {
            const isActive = activeStep === item.step;
            return (
              <div
                key={item.step}
                onClick={() => setActiveStep(item.step)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-surface border-primary-app shadow-md ring-2 ring-primary-app/20 scale-[1.02]'
                    : 'bg-surface/60 hover:bg-surface border-theme'
                }`}
              >
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${item.badgeColor}`}>
                  Step 0{item.step}
                </span>
                <h4 className="font-bold text-sm text-ink pt-2">{item.title}</h4>
                <p className="text-xs text-muted leading-relaxed mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* -----------------------------------------------------------------------
          6. Dedicated Agent Copilot Showcase
      ------------------------------------------------------------------------ */}
      <section id="agent-copilot" className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full scroll-mt-20 text-left">
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-theme shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light text-primary-accent text-[11px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explainable Agentic AI Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                PlaceMate Copilot — Multi-Step Autonomous Assistant
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1 max-w-xl">
                Ask complex placement queries in natural language. Our bounded agent decomposes requests, calls
                deterministic backend tools, verifies eligibility, analyzes skill gaps, and returns verifiable answers with
                full execution traces.
              </p>
            </div>

            <button
              onClick={() => openAgentDrawer()}
              className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-primary-app hover:opacity-90 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Tool 2</span>
              <div className="font-bold text-xs text-ink">Eligibility Verification</div>
              <p className="text-[10px] text-muted leading-tight">Evaluates mandatory CGPA, backlog, and branch criteria deterministically.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-canvas border border-theme space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Tool 3</span>
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
      </section>

      {/* -----------------------------------------------------------------------
          7. Interactive Dual-Persona Value Showcase (Students vs Officers)
      ------------------------------------------------------------------------ */}
      <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full text-left">
        <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-theme shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider">
                Tailored for the Campus Ecosystem
              </span>
              <h3 className="text-xl font-bold text-ink mt-0.5">Built for Students & Placement Officers</h3>
            </div>

            {/* Role Toggle */}
            <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-xl border border-theme text-xs font-semibold">
              <button
                onClick={() => setRoleView('student')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleView === 'student'
                    ? 'bg-primary-app text-white font-bold shadow-2xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                For Students
              </button>
              <button
                onClick={() => setRoleView('officer')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  roleView === 'officer'
                    ? 'bg-primary-app text-white font-bold shadow-2xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                For Placement Officers (TPOs)
              </button>
            </div>
          </div>

          {/* Dynamic Content Based on Role Toggle */}
          {roleView === 'student' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Explainable Match Transparency</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Clear feedback on why you qualify or fall short for a position, avoiding rejection surprises during campus drives.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <Target className="w-4 h-4 text-primary-app" />
                  <span>Personalized Skill Prioritization</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Focus on the exact 2-3 missing skills that make the highest difference to recruiter shortlists rather than generic advice.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <CalendarCheck className="w-4 h-4 text-amber-500" />
                  <span>Actionable Daily Milestones</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  4-week structured curriculum balancing coding interview patterns, database optimization, and behavioral communication.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <BotMessageSquare className="w-4 h-4 text-purple-500" />
                  <span>Realistic Interview Simulation</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Practice timed technical and HR questions evaluated against strict 3-dimensional placement rubrics.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Batch Readiness Analytics</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Real-time visibility into college-wide readiness distributions, departmental skill coverage, and placement rates.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <ShieldCheck className="w-4 h-4 text-primary-app" />
                  <span>Deterministic Cutoff Compliance</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Instant candidate shortlisting based on verified recruiter criteria without manual spreadsheet auditing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>Campus Drive Publishing</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Publish recruitment drives with customizable CGPA cutoffs, allowed graduation batches, and required skill inventories.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-theme space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-ink">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Student Directory & Tracking</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  Direct visibility into student preparation plan progress, mock interview scores, and saved opportunities.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* -----------------------------------------------------------------------
          8. Interactive Frequently Asked Questions (FAQ) Accordion
      ------------------------------------------------------------------------ */}
      <section id="faq" className="px-4 sm:px-6 py-12 max-w-4xl mx-auto w-full scroll-mt-20 text-left">
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider bg-primary-light px-2.5 py-0.5 rounded-full border border-primary-app/20">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mt-2">
            Everything You Need to Know
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1 max-w-lg mx-auto">
            Transparent answers on our AI architecture, deterministic rules engine, and hackathon prototype standards.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does PlaceMate AI ensure eligibility decisions are 100% accurate?',
              a: 'Unlike generative chatbots that might fabricate cutoffs, PlaceMate AI uses a purely deterministic rules engine written in Python. Mandatory criteria (CGPA threshold, allowed branches, active backlog limits, and graduation batch) are verified through strict boolean expressions and backed by SQLite database constraints. LLMs are never allowed to override hard eligibility rules.'
            },
            {
              q: 'Are the campus vacancies and recruiter postings genuine?',
              a: 'Yes. PlaceMate AI integrates with real-time job providers (Adzuna and Jooble APIs) alongside authenticated campus recruitment drives published by college placement cells. Every vacancy has verifiable company names, verified requirements, and original application URLs.'
            },
            {
              q: 'How does the Agent Copilot work under the hood?',
              a: 'The Agent Copilot implements a bounded multi-step autonomous loop. When a student submits a natural language query, the agent breaks the goal into distinct tool calls (job search, deterministic eligibility check, skill gap diagnosis, roadmap synthesis). Each step duration, parameters, and results are captured in an explainable audit trace that you can inspect in real time.'
            },
            {
              q: 'What is the 3-dimensional rubric for AI Mock Interviews?',
              a: 'Mock interviews evaluate responses on three distinct dimensions: Technical Accuracy (correctness of algorithms, data structures, and architecture), Communication Clarity (conciseness, structure, and professional tone), and Completeness (handling edge cases and constraints). Students receive numerical scores out of 100 with actionable feedback.'
            },
            {
              q: 'Can placement officers monitor and audit student preparation?',
              a: 'Yes. PlaceMate AI provides a dedicated Placement Officer Portal with batch-wide readiness distributions, candidate search, campus drive cutoffs, and real-time tracking of student prep plans.'
            }
          ].map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-theme bg-surface shadow-2xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-ink hover:text-primary-app transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary-app' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-muted leading-relaxed border-t border-theme/40 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* -----------------------------------------------------------------------
          9. About & Mission Section
      ------------------------------------------------------------------------ */}
      <section id="about" className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full scroll-mt-20">
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
                <Users className="w-4 h-4 text-emerald-600" />
                <span>For Placement Officers</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Real-time visibility into batch-wide readiness distributions, departmental skill coverage, and streamlined
                campus drive publishing with instant candidate cutoffs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------------
          10. High-Converting Bottom CTA
      ------------------------------------------------------------------------ */}
      <section className="px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-primary-light via-surface to-surface-alt border border-primary-app/20 text-center space-y-4 shadow-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-app text-white text-[10px] font-bold shadow-2xs">
            <Sparkles className="w-3 h-3" />
            <span>Ready for Campus Recruitment</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-ink">
            Launch Your Placement Preparation Today
          </h3>
          <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto leading-relaxed">
            Try our instant demo candidate accounts or create your student profile in under 2 minutes. Free and open for
            campus placement drives.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handleGetStarted}
              className="px-6 py-3 rounded-xl bg-primary-app text-white font-bold text-xs sm:text-sm hover:opacity-90 shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Get Started Now</span>
            </button>
            <button
              onClick={handleLogIn}
              className="px-5 py-3 rounded-xl bg-surface border border-theme text-ink font-bold text-xs sm:text-sm hover:bg-surface-alt transition-colors cursor-pointer"
            >
              Sign In to Existing Account
            </button>
          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------------------
          11. Polished Footer
      ------------------------------------------------------------------------ */}
      <footer className="border-t border-theme bg-surface py-6 px-4 sm:px-6 text-xs text-muted mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[11px] text-muted">· Agent-X 2026 Hackathon Prototype</span>
          </div>
          <div className="text-[11px] text-muted font-medium">
            PlaceMate AI — Your Next Opportunity Starts Here.
          </div>
          <div className="text-[10px] text-muted font-mono">
            Pure Deterministic Python Rules Engine & React 19
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
