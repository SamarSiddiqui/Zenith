"use client";

import React from 'react';
import { LayoutDashboard, Target, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
    userName: string;
    isOpen?: boolean;
    onCloseMobile?: () => void;
}

export function Sidebar({ userName, isOpen = true, onCloseMobile }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        {
            id: '/',
            label: 'Dashboard',
            icon: LayoutDashboard,
        },
        {
            id: '/habits',
            label: 'Habits',
            icon: Target,
        },
        {
            id: '/settings',
            label: 'Settings',
            icon: Settings,
        },
    ] as const;

    const handleSignOut = () => {
        // In a real app, clear auth tokens here
        router.push('/login');
    };

    return (
        <aside
            className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-zen-sidebar border-r border-zen-border flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 md:static
    `}>
            {/* Logo Area */}
            <div className="p-8 pb-12">
                <h1 className="font-heading text-3xl text-zen-text-primary tracking-wide">
                    Zenith
                </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.id;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.id}
                            onClick={onCloseMobile}
                            className={`
                w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive ? 'bg-zen-sidebar-active text-zen-text-primary shadow-sm' : 'text-zen-text-secondary hover:bg-zen-accent hover:text-zen-text-primary'}
              `}>
                            <Icon
                                className={`w-5 h-5 mr-3 stroke-[1.5] transition-colors ${isActive ? 'text-zen-primary' : 'text-zen-text-muted group-hover:text-zen-text-primary'
                                    }`}
                            />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeIndicator"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-zen-primary rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile */}
            <div className="p-6 border-t border-zen-border">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-zen-surface border border-zen-border flex items-center justify-center text-zen-primary font-heading text-lg">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-medium text-zen-text-primary truncate">{userName}</p>
                        <p className="text-xs text-zen-text-muted truncate">Mindful Explorer</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-zen-text-secondary hover:text-zen-missed transition-colors rounded-lg hover:bg-zen-accent">
                    <LogOut className="w-4 h-4 mr-2 stroke-[1.5]" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
