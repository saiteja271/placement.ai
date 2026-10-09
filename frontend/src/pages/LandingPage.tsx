import React from 'react';
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
  LogIn,
  UserPlus
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { ThemeSelector } from '../components/ThemeSelector';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { openAgentDrawer, openAuthModal, currentUser } = useApp();

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
    <div className="min-h-screen bg-canvas text-ink flex flex-col transition-colors overflow-x-hidden">
      {/* 1. Minimal Header Navbar */}
      <header className="border-b border-theme bg-surface/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <Logo size="md" />

        {/* Essential Navigation Items */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted">
          <a href="#features" className="hover:text-primary-app transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-primary-app transition-colors">
            How It Works
          </a>
          <a href="#ai-tutor" className="hover:text-primary-app transition-colors">
            AI Tutor
          </a>
          <a href="#about" className="hover:text-primary-app transition-colors">
            About
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeSelector compact align="right" />

          {/* Log In Button */}
          <button
            onClick={handleLogIn}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-theme text-ink hover:bg-surface-alt transition-colors cursor-pointer"
          >
            {currentUser ? 'My Account' : 'Log In'}
          </button>

          {/* Get Started Button */}
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-primary-app hover:opacity-95 text-white shadow-2xs transition-all cursor-pointer"
          >
            <span>{currentUser ? 'Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="px-4 sm:px-6 pt-12 pb-16 max-w-4xl mx-auto text-center flex-1">
        {/* Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary-accent border border-primary-light text-[11px] font-semibold mb-5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent College Placement Assistant</span>
        </div>

        {/* Prominent Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-ink mb-4 leading-tight max-w-3xl mx-auto">
          Your Next Opportunity Starts Here.
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-muted max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          Discover relevant opportunities, understand your skill gaps, prepare for interviews, and learn with an AI-powered placement assistant.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
          <button
            onClick={handleGetStarted}
            className="px-6 py-2.5 rounded-xl bg-primary-app hover:opacity-95 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Get Started</span>
          </button>

          <a
            href="#features"
            className="px-5 py-2.5 rounded-xl bg-surface border border-theme hover:bg-surface-alt text-ink font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore Features</span>
            <ChevronRight className="w-4 h-4 text-muted" />
          </a>

          <button
            onClick={() => openAgentDrawer('Summarize candidate profile and evaluate best job matches')}
            className="px-4 py-2.5 rounded-xl bg-primary-light text-primary-accent border border-primary-light hover:bg-primary-app hover:text-white font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Agent Copilot</span>
          </button>
        </div>

        {/* 3. Features Section */}
        <div id="features" className="pt-8 mb-16 scroll-mt-20">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider">
              Engineered Capabilities
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-ink mt-1">Grounded Placement Assistance</h2>
            <p className="text-xs text-muted mt-1 max-w-lg mx-auto">
              Transparent, deterministic rules combined with contextual AI intelligence. No fabricated listings or
              unsupported claims.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-primary-accent/40 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-ink">Intelligent Job Matching</h3>
              <p className="text-xs text-muted leading-relaxed">
                Multi-dimensional scoring evaluating skill overlap, role preferences, and domain alignment across verified
                campus vacancies.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-primary-accent/40 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-accent-green/15 text-accent-green flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-ink">Eligibility Analysis</h3>
              <p className="text-xs text-muted leading-relaxed">
                Deterministic verification of mandatory recruiter criteria: degree branch, CGPA cutoffs, active backlogs,
                and graduation year.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-primary-accent/40 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-accent-amber/15 text-accent-amber flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-ink">Skill-Gap Insights</h3>
              <p className="text-xs text-muted leading-relaxed">
                Pinpoints exact missing technical proficiencies and distinguishes mandatory recruiter requirements from
                secondary bonus skills.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-primary-accent/40 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-ink">Personalized Interview Preparation</h3>
              <p className="text-xs text-muted leading-relaxed">
                Curates structured 4-week roadmaps with daily milestones spanning DSA, System Design, Aptitude drills, and
                HR communication.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-primary-accent/40 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-accent-purple/15 text-primary-accent flex items-center justify-center">
                <BotMessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-ink">AI Mock Interviews</h3>
              <p className="text-xs text-muted leading-relaxed">
                Timed, role-specific technical and behavioral interviews with 3-dimensional rubric evaluations: Technical
                Accuracy, Communication, and Completeness.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 rounded-2xl bg-surface border border-theme shadow-2xs hover:border-primary-accent/40 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-primary-light text-primary-accent flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-ink">AI Placement Tutor & Doubt Solver</h3>
              <p className="text-xs text-muted leading-relaxed">
                Adaptive pedagogical coaching across 6 learning modes: concept explanations, doubt clearing, code debugging,
                interview challenges, quizzes, and answer reviews.
              </p>
            </div>
          </div>
        </div>

        {/* 4. How It Works Section */}
        <div id="how-it-works" className="pt-8 mb-16 scroll-mt-20">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold text-primary-accent uppercase tracking-wider">
              Clear 4-Step Methodology
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-ink mt-1">How PlaceMate AI Works</h2>
            <p className="text-xs text-muted mt-1 max-w-lg mx-auto">
              From profile entry to campus placement offer: a deterministic, transparent pipeline.
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
              <h4 className="font-bold text-sm text-ink pt-1">Prepare and Learn</h4>
              <p className="text-xs text-muted leading-relaxed">
                Execute daily structured preparation tasks, rehearse realistic technical rounds, and master concepts with the AI Tutor.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Dedicated AI Tutor Preview Section */}
        <div id="ai-tutor" className="pt-8 mb-16 scroll-mt-20 text-left">
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-theme shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-light text-primary-accent text-[11px] font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Interactive Placement Learning Workspace</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  AI Placement Tutor & Technical Doubt Solver
                </h2>
                <p className="text-xs text-muted mt-1 max-w-xl">
                  Whether you are debugging a runtime crash, mastering Python OOP, understanding SQL joins, or learning recursion,
                  our tutor provides question-aware explanations tailored to campus placement rounds.
                </p>
              </div>

              <button
                onClick={() => {
                  if (currentUser) {
                    navigate('/tutor');
                  } else {
                    openAuthModal('signin');
                  }
                }}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-primary-app hover:opacity-95 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Open AI Tutor Workspace</span>
              </button>
            </div>

            {/* 6 Learning Modes Grid Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Mode 1</span>
                <div className="font-bold text-xs text-ink">Learn a Topic</div>
                <p className="text-[10px] text-muted leading-tight">Fundamentals to interview rigor</p>
              </div>
              <div className="p-3 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Mode 2</span>
                <div className="font-bold text-xs text-ink">Explain a Doubt</div>
                <p className="text-[10px] text-muted leading-tight">Direct, clear answers to doubts</p>
              </div>
              <div className="p-3 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Mode 3</span>
                <div className="font-bold text-xs text-ink">Practice Questions</div>
                <p className="text-[10px] text-muted leading-tight">Targeted interview challenges</p>
              </div>
              <div className="p-3 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Mode 4</span>
                <div className="font-bold text-xs text-ink">Debug Code</div>
                <p className="text-[10px] text-muted leading-tight">Root cause & optimal fixes</p>
              </div>
              <div className="p-3 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Mode 5</span>
                <div className="font-bold text-xs text-ink">Quiz Me</div>
                <p className="text-[10px] text-muted leading-tight">4-option technical MCQs</p>
              </div>
              <div className="p-3 rounded-xl bg-canvas border border-theme space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-accent block">Mode 6</span>
                <div className="font-bold text-xs text-ink">Review My Answer</div>
                <p className="text-[10px] text-muted leading-tight">Rubric-based evaluation</p>
              </div>
            </div>

            {/* Quick Interactive Prompt Previews */}
            <div className="pt-2 border-t border-theme/60 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-muted">Try asking in the tutor:</span>
              {[
                'Explain Python inheritance with an example.',
                'What is the difference between a Python list and a tuple?',
                'Teach me SQL joins using two sample tables.',
                'Debug this code: print(10 / 0).'
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (currentUser) {
                      navigate('/tutor');
                    } else {
                      openAuthModal('signin');
                    }
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-alt border border-theme text-primary-accent hover:bg-primary-app hover:text-white transition-all cursor-pointer font-medium"
                >
                  💡 {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. About Section */}
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

        {/* Bottom CTA Banner */}
        <div className="p-8 rounded-2xl bg-primary-light/40 border border-primary-light text-center space-y-4">
          <h3 className="text-xl font-bold text-ink">Ready to launch your placement preparation?</h3>
          <p className="text-xs sm:text-sm text-muted max-w-lg mx-auto">
            Try our instant demo accounts or create your candidate profile in under 2 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 rounded-xl bg-primary-app text-white font-semibold text-xs sm:text-sm hover:opacity-95 shadow-2xs transition-all cursor-pointer"
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
