import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  User,
  Briefcase,
  LineChart,
  CalendarCheck,
  BotMessageSquare,
  Bookmark,
  Settings,
  Sparkles,
  ChevronDown,
  Users,
  ShieldCheck,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Logo } from './Logo';
import { ThemeSelector } from './ThemeSelector';
import { useApp } from '../context/AppContext';

export const MobileDrawer: React.FC = () => {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentStudent,
    studentsList,
    selectStudent,
    openAgentDrawer,
    currentUser,
    openAuthModal,
    logout
  } = useApp();

  if (!isMobileMenuOpen) return null;

  const isOfficer = currentUser?.role === 'officer';

  const studentNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Job Matches', path: '/jobs', icon: Briefcase },
    { name: 'Skill Analysis', path: '/skills', icon: LineChart },
    { name: 'Interview Prep', path: '/prep', icon: CalendarCheck },
    { name: 'Mock Interview', path: '/mock-interview', icon: BotMessageSquare },
    { name: 'Saved Jobs', path: '/saved', icon: Bookmark },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const officerNavItems = [
    { name: 'Officer Overview', path: '/officer', icon: LayoutDashboard },
    { name: 'Student Directory', path: '/officer/students', icon: Users },
    { name: 'Campus Drives', path: '/officer/drives', icon: Briefcase },
    { name: 'Drive Analytics', path: '/officer/analytics', icon: LineChart },
    { name: 'Mock Question Bank', path: '/mock-interview', icon: BotMessageSquare },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItems = isOfficer ? officerNavItems : studentNavItems;

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer Body */}
      <div className="relative w-4/5 max-w-xs bg-surface border-r border-theme h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 border-b border-theme flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-alt transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account / Role Box */}
        <div className="p-3 border-b border-theme bg-surface-alt">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
              {isOfficer ? 'Placement Officer Portal' : 'Candidate Profile'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-light text-primary-accent">
              {isOfficer ? 'Officer' : 'Student'}
            </span>
          </div>

          {!isOfficer ? (
            <div className="relative">
              <select
                value={currentStudent?.id || ''}
                onChange={(e) => {
                  selectStudent(e.target.value);
                }}
                className="w-full bg-surface border border-theme text-xs font-medium text-ink rounded-lg py-1.5 pl-2.5 pr-7 appearance-none cursor-pointer focus:outline-none"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.branch.split(' ')[0]} · {s.cgpa})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2 top-2 pointer-events-none" />
            </div>
          ) : (
            <div className="text-xs font-semibold text-ink flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-accent" />
              <span>Officer: {currentUser?.full_name}</span>
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-theme flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openAuthModal();
              }}
              className="text-primary-accent font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <UserCheck className="w-3 h-3" />
              <span>Switch Role</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="text-muted hover:text-danger font-medium flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary-light text-primary-accent font-bold shadow-2xs'
                      : 'text-muted hover:bg-surface-alt hover:text-ink'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Drawer Actions */}
        <div className="p-3 border-t border-theme space-y-2 bg-surface">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openAgentDrawer();
            }}
            className="w-full py-2 px-3 bg-primary-app text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Agent Copilot</span>
          </button>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-medium text-muted">Theme:</span>
            <ThemeSelector compact align="left" />
          </div>
        </div>
      </div>
    </div>
  );
};
