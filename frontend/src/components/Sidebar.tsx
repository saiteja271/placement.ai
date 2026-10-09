import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User as UserIcon,
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

export const Sidebar: React.FC = () => {
  const {
    currentStudent,
    studentsList,
    selectStudent,
    openAgentDrawer,
    currentUser,
    openAuthModal,
    logout
  } = useApp();

  const isOfficer = currentUser?.role === 'officer';

  const studentNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile', icon: UserIcon },
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

  return (
    <aside className="w-60 bg-surface border-r border-theme flex flex-col h-full select-none transition-colors shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-theme flex items-center justify-between">
        <NavLink to="/">
          <Logo size="sm" />
        </NavLink>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-tint text-primary-app border border-theme">
          {isOfficer ? 'Officer' : 'Student'}
        </span>
      </div>

      {/* Account / Role Switcher Header Box */}
      <div className="p-3 border-b border-theme bg-canvas/60 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary-app text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-subtle">
              {isOfficer ? 'PO' : (currentStudent?.full_name?.charAt(0) || 'S')}
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-ink truncate leading-tight">
                {currentUser ? currentUser.full_name : (currentStudent?.full_name || 'Teja')}
              </span>
              <span className="text-[10px] text-muted truncate block">
                {isOfficer ? 'Placement Head' : (currentStudent?.branch?.split(' ')[0] || 'IT Student')}
              </span>
            </div>
          </div>

          <button
            onClick={() => openAuthModal()}
            title="Switch demo role or sign in"
            className="px-2 py-1 text-[10px] font-bold rounded-lg bg-surface border border-theme text-primary-app hover:bg-surface-tint transition-colors cursor-pointer shrink-0"
          >
            Switch
          </button>
        </div>

        {/* Student Quick Switcher (visible for students) */}
        {!isOfficer && studentsList.length > 0 && (
          <div className="relative pt-1">
            <select
              value={currentStudent?.id || ''}
              onChange={(e) => selectStudent(e.target.value)}
              className="w-full bg-surface border border-theme text-[11px] font-medium text-ink rounded-lg py-1 pl-2 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-app truncate"
            >
              {studentsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.branch.split(' ')[0]} · {s.cgpa})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-muted absolute right-2 top-2.5 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Navigation Links (Stationary scrolling area) */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-surface-tint text-primary-app font-bold shadow-subtle border border-theme/60'
                    : 'text-muted hover:bg-canvas hover:text-ink'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Agent Copilot Mini Launcher Banner */}
      <div className="p-3 mx-2.5 mb-2.5 rounded-2xl bg-canvas border border-theme text-left shadow-subtle space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-primary-app text-white flex items-center justify-center shrink-0 shadow-subtle">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-ink">
              Agent Copilot
            </span>
          </div>
          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-surface-tint text-primary-app">
            AI Trace
          </span>
        </div>
        <p className="text-[10px] text-muted leading-tight">
          Bounded multi-step verification & deterministic tools.
        </p>
        <button
          onClick={() => openAgentDrawer()}
          className="w-full py-1.5 px-3 bg-primary-app hover:opacity-90 text-white text-[11px] font-bold rounded-xl shadow-subtle transition-opacity flex items-center justify-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Launch Copilot</span>
        </button>
      </div>

      {/* Footer controls: Labelled Theme Selector & Status */}
      <div className="p-2.5 border-t border-theme flex items-center justify-between bg-canvas/40">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-medium text-muted">
            Online
          </span>
        </div>
        <ThemeSelector compact={false} align="left" showLabel={true} />
      </div>
    </aside>
  );
};
