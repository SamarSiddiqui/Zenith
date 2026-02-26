"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { StatusCircle, StatusType } from './StatusCircle';
import { Plus } from 'lucide-react';

interface Habit {
    id: string;
    name: string;
    history: Record<string, StatusType>; // date string -> status
}

interface HabitGridProps {
    habits: Habit[];
    weekDates: Date[];
    onToggleStatus: (habitId: string, dateStr: string) => void;
    onAddHabit: () => void;
}

export function HabitGrid({ habits, weekDates, onToggleStatus, onAddHabit }: HabitGridProps) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Helper to format date as YYYY-MM-DD for keys
    const formatDateKey = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[800px]">
                {/* Header Row */}
                <div className="grid grid-cols-[200px_repeat(7,1fr)] gap-4 mb-6 px-4">
                    <div className="text-sm font-medium text-zen-text-muted uppercase tracking-wider self-end">
                        Habit
                    </div>
                    {weekDates.map((date, i) => (
                        <div key={i} className="flex flex-col items-center justify-center">
                            <span className="text-xs text-zen-text-muted uppercase mb-1">
                                {days[date.getDay()]}
                            </span>
                            <span
                                className={`
                text-lg font-heading w-8 h-8 flex items-center justify-center rounded-full
                ${date.toDateString() === new Date().toDateString()
                                        ? 'bg-zen-primary text-white'
                                        : 'text-zen-text-primary'
                                    }
              `}>
                                {date.getDate()}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Habits Rows */}
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                    {habits.map((habit) => (
                        <motion.div
                            key={habit.id}
                            variants={item}
                            className="grid grid-cols-[200px_repeat(7,1fr)] gap-4 items-center bg-zen-surface p-4 rounded-xl border border-zen-border hover:shadow-sm transition-shadow duration-200">
                            <div className="font-medium text-zen-text-primary truncate pr-4">{habit.name}</div>
                            {weekDates.map((date) => {
                                const dateKey = formatDateKey(date);
                                const status = habit.history[dateKey] || 'unlogged';

                                return (
                                    <div key={dateKey} className="flex justify-center">
                                        <StatusCircle
                                            status={status}
                                            onClick={() => onToggleStatus(habit.id, dateKey)}
                                        />
                                    </div>
                                );
                            })}
                        </motion.div>
                    ))}

                    {/* Add Habit Button */}
                    <motion.button
                        variants={item}
                        onClick={onAddHabit}
                        className="w-full mt-6 py-4 border-2 border-dashed border-zen-border rounded-xl flex items-center justify-center text-zen-text-secondary hover:border-zen-primary hover:text-zen-primary transition-colors duration-200 group">
                        <Plus className="w-5 h-5 mr-2 stroke-[1.5] group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Add New Habit</span>
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}
