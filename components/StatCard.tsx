"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    icon?: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    delay?: number;
}

export function StatCard({ label, value, subtitle, icon: Icon, trend, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-zen-surface p-6 rounded-2xl shadow-sm border border-zen-border flex flex-col h-full hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
                <span className="text-zen-text-secondary text-sm font-medium uppercase tracking-wider">
                    {label}
                </span>
                {Icon && <Icon className="w-5 h-5 text-zen-text-muted stroke-[1.5]" />}
            </div>

            <div className="mt-auto">
                <div className="text-4xl md:text-5xl font-heading text-zen-text-primary mb-1">
                    {value}
                </div>
                {subtitle && (
                    <div className="flex items-center mt-2">
                        {trend === 'up' && <span className="text-zen-primary mr-1">↑</span>}
                        {trend === 'down' && <span className="text-zen-missed mr-1">↓</span>}
                        <span className="text-sm text-zen-text-muted">{subtitle}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
