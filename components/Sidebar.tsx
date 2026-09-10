"use client";

import React from 'react';
import { LayoutDashboard, CalendarRange, Stethoscope, HeartPulse, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  userName?: string;
  isOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ userName, isOpen = true, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const navItems = [
    {
      id: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: '/habits',
      label: 'Habits Planner',
      icon: CalendarRange,
    },
    {
      id: '/diagnosis',
      label: 'Diagnosis & Retro',
      icon: Stethoscope,
    },
    {
      id: '/recovery',
      label: 'Recovery Mode',
      icon: HeartPulse,
    },
    {
      id: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ] as const;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const displayName = user?.fullName || userName || 'Explorer';
  const displayEmail = user?.email || 'circadian@zenith.app';
  const avatarLetter = displayName.charAt(0).toUpperCase() || 'Z';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-line flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}
    >
      {/* Logo Area */}
      <div className="p-6 pb-8 border-b border-line/50">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage-wash text-sage-deep font-serif text-lg font-bold border border-sage/30 group-hover:scale-105 transition-transform">
            Z
          </div>
          <div>
            <h1 className="font-serif text-2xl text-ink tracking-tight">Zenith</h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-faint">Consistency Engine</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.id}
              onClick={onCloseMobile}
              className={`
                w-full flex items-center px-3.5 py-2.5 rounded-2xl transition-all duration-200 group relative text-xs font-medium
                ${isActive
                  ? 'bg-surface text-ink shadow-calm border border-line/60 font-semibold'
                  : 'text-muted hover:bg-surface/50 hover:text-ink'
                }
              `}
            >
              <Icon
                className={`w-4 h-4 mr-3 stroke-[1.75] transition-colors ${
                  isActive ? 'text-sage-deep' : 'text-faint group-hover:text-ink'
                }`}
              />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-sage rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="p-4 border-t border-line/70 bg-sidebar/50">
        <div className="flex items-center gap-3 mb-3 p-2 rounded-2xl bg-surface/80 border border-line/50">
          <div className="w-9 h-9 rounded-xl bg-sage-wash border border-sage/30 flex items-center justify-center text-sage-deep font-serif font-bold text-sm shrink-0">
            {avatarLetter}
          </div>
          <div className="overflow-hidden min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink truncate">{displayName}</p>
            <p className="text-[11px] text-faint truncate font-mono">{displayEmail}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-muted hover:text-clay hover:bg-clay-wash transition-colors rounded-xl border border-transparent hover:border-clay/20"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
