import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, CalendarCheck, User, Users, LineChart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileBottomNav: React.FC = () => {
  const { currentUser } = useApp();
  const isOfficer = currentUser?.role === 'officer';

  const studentItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Prep', path: '/prep', icon: CalendarCheck },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const officerItems = [
    { name: 'Overview', path: '/officer', icon: LayoutDashboard },
    { name: 'Students', path: '/officer/students', icon: Users },
    { name: 'Drives', path: '/officer/drives', icon: Briefcase },
    { name: 'Analytics', path: '/officer/analytics', icon: LineChart },
  ];

  const items = isOfficer ? officerItems : studentItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-theme z-30 px-3 py-1.5 flex items-center justify-around shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <NavLink
            key={it.path}
            to={it.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'text-primary-app font-bold'
                  : 'text-muted hover:text-ink'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{it.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
