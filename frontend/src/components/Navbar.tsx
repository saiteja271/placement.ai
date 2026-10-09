import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Menu, Cpu, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThemeSelector } from './ThemeSelector';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const {
    currentStudent,
    openAgentDrawer,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentUser,
    openAuthModal
  } = useApp();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Placement Dashboard';
      case '/profile':
        return 'Candidate Profile';
      case '/jobs':
        return 'Job Discovery & Matching';
      case '/skills':
        return 'Skill Gap Analysis';
      case '/prep':
        return 'Interview Preparation Plan';
      case '/mock-interview':
        return 'AI Mock Interview';
      case '/saved':
        return 'Saved Opportunities';
      case '/settings':
        return 'System & Appearance Settings';
      case '/officer':
        return 'Officer Placement Portal';
      case '/officer/students':
        return 'Student Directory & Readiness';
      case '/officer/drives':
        return 'Campus Recruitment Drives';
      case '/officer/analytics':
        return 'Drive Analytics & Reports';
      default:
        if (path.startsWith('/jobs/')) return 'Opportunity Details & Eligibility';
        return 'PlaceMate AI';
    }
  };

  const isOfficer = currentUser?.role === 'officer';

  return (
    <header className="h-14 border-b border-theme bg-surface sticky top-0 z-20 px-3 sm:px-5 md:px-6 flex items-center justify-between transition-colors shrink-0">
      <div className="flex items-center gap-2.5">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Open mobile menu"
          className="md:hidden p-1.5 rounded-lg border border-theme text-ink hover:bg-canvas transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Mobile Brand Logo */}
        <div className="md:hidden">
          <Logo size="sm" showText={false} />
        </div>

        {/* Breadcrumb / Page Title */}
        <h1 className="text-sm md:text-base font-bold text-ink tracking-tight truncate max-w-[180px] sm:max-w-xs md:max-w-none">
          {getPageTitle(location.pathname)}
        </h1>

        <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-surface-tint text-primary-app border border-theme">
          <Cpu className="w-3 h-3" />
          Deterministic Rules Engine
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Interactive Labelled Theme Switcher */}
        <ThemeSelector compact={false} align="right" showLabel={false} />

        {/* Ask AI Agent Trigger */}
        <button
          onClick={() => openAgentDrawer()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-app hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-subtle transition-opacity cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Copilot</span>
        </button>

        {/* User Account / Role Switcher Pill */}
        <button
          onClick={() => openAuthModal()}
          title="Switch role or sign in (Hackathon Judge Demo)"
          className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-theme text-left cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-surface-tint text-primary-app font-bold text-xs flex items-center justify-center border border-theme shrink-0 shadow-subtle">
            {isOfficer ? (
              <Briefcase className="w-4 h-4" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-ink block leading-none">
              {currentUser?.full_name || (currentStudent?.full_name ?? 'Teja')}
            </span>
            <span className="text-[10px] text-primary-app font-medium leading-tight">
              {isOfficer ? 'Placement Officer' : 'Student'} · Demo
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
