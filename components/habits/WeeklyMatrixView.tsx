"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import type { Habit, HabitStatus } from '../../types/zenith';
import { weekDates, weekDays } from '../../data/zenith';

interface WeeklyMatrixViewProps {
  habits: Habit[];
  onToggleStatus: (habitId: string, dayIndex: number) => void;
  onOpenSkipModal: (habit: Habit, dayIndex: number) => void;
  onSelectHabit?: (habit: Habit) => void;
}

export function WeeklyMatrixView({
  habits,
  onToggleStatus,
  onOpenSkipModal,
  onSelectHabit,
}: WeeklyMatrixViewProps) {
  // Calculate daily totals across all habits
  const dailyTotals = weekDays.map((_, dayIndex) => {
    const completed = habits.filter((h) => h.week[dayIndex] === 'completed').length;
    const missed = habits.filter((h) => h.week[dayIndex] === 'missed').length;
    const total = habits.length;
    return { completed, missed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      {/* Weekly Horizon Matrix Container */}
      <div className="overflow-x-auto rounded-3xl border border-line bg-surface shadow-calm">
        <table className="w-full min-w-[700px] border-collapse">
          <caption className="sr-only">Weekly Habit Horizon Matrix</caption>
          
          {/* Header Row */}
          <thead>
            <tr className="border-b border-line bg-canvas/60">
              <th scope="col" className="px-6 py-4 text-left text-xs font-mono font-semibold uppercase tracking-[0.14em] text-faint">
                Mindful Ritual
              </th>
              {weekDays.map((day, i) => {
                const isToday = i === 3; // Wednesday anchor in sample
                return (
                  <th
                    key={day}
                    scope="col"
                    className={`px-3 py-4 text-center transition-colors ${
                      isToday ? 'bg-sage-wash/50 border-x border-sage/20' : ''
                    }`}
                  >
                    <span className={`block text-[11px] font-mono uppercase tracking-wider ${isToday ? 'text-sage-deep font-bold' : 'text-faint'}`}>
                      {day}
                    </span>
                    <span className={`mt-0.5 block text-sm font-serif ${isToday ? 'font-bold text-ink' : 'text-muted'}`}>
                      {weekDates[i]}
                    </span>
                    {isToday && (
                      <span className="mx-auto mt-1 block h-1 w-1 rounded-full bg-sage-deep" />
                    )}
                  </th>
                );
              })}
              <th scope="col" className="px-6 py-4 text-right text-xs font-mono font-semibold uppercase tracking-[0.14em] text-faint">
                Cumulative Health
              </th>
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-line/70">
            {habits.map((habit) => (
              <tr
                key={habit.id}
                className="transition-colors duration-150 ease-out hover:bg-canvas/50 group"
              >
                {/* Habit Info Column */}
                <th scope="row" className="px-6 py-4 text-left font-normal">
                  <div
                    className="cursor-pointer"
                    onClick={() => onSelectHabit && onSelectHabit(habit)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="block text-sm font-semibold text-ink group-hover:text-sage-deep transition-colors">
                        {habit.name}
                      </span>
                      {habit.category && (
                        <span className="rounded border border-line/60 bg-canvas px-1.5 py-0.2 text-[9px] font-mono uppercase text-faint">
                          {habit.category}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted font-mono">
                      <span>{habit.window}</span>
                      <span>·</span>
                      <span>{habit.minutes}m</span>
                    </div>
                  </div>
                </th>

                {/* 7 Daily Toggles */}
                {habit.week.map((status, i) => {
                  const isToday = i === 3;
                  const isCompleted = status === 'completed';
                  const isMissed = status === 'missed';

                  return (
                    <td
                      key={`${habit.id}-${i}`}
                      className={`px-3 py-4 text-center ${
                        isToday ? 'bg-sage-wash/20 border-x border-sage/10' : ''
                      }`}
                    >
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.88 }}
                        transition={{ duration: 0.12 }}
                        onClick={() => {
                          if (status === 'completed') {
                            onOpenSkipModal(habit, i);
                          } else {
                            onToggleStatus(habit.id, i);
                          }
                        }}
                        aria-label={`${habit.name} on ${weekDays[i]} — ${status}`}
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                          isCompleted
                            ? 'border-sage bg-sage text-white shadow-xs'
                            : isMissed
                            ? 'border-clay bg-clay text-white shadow-xs'
                            : 'border-dashed border-line bg-surface text-transparent hover:border-sage'
                        }`}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          {isCompleted && (
                            <motion.span
                              key="c"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            </motion.span>
                          )}
                          {isMissed && (
                            <motion.span
                              key="m"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <X className="h-3.5 w-3.5 stroke-[2.5]" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </td>
                  );
                })}

                {/* Cumulative Health Column */}
                <td className="px-6 py-4 text-right">
                  <span
                    className={`inline-block rounded-full border px-3 py-0.5 text-xs font-mono font-bold ${
                      habit.health >= 80
                        ? 'border-sage/40 bg-sage-wash text-sage-deep'
                        : habit.health >= 65
                        ? 'border-sand/40 bg-sand/10 text-sand'
                        : 'border-clay/40 bg-clay-wash text-clay'
                    }`}
                  >
                    {habit.health}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Daily Completion Summary Footer */}
          <tfoot>
            <tr className="border-t border-line bg-canvas/70">
              <td className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                Daily Completion
              </td>
              {dailyTotals.map((tot, i) => {
                const isToday = i === 3;
                return (
                  <td
                    key={i}
                    className={`px-3 py-3 text-center ${
                      isToday ? 'bg-sage-wash/40 border-x border-sage/20' : ''
                    }`}
                  >
                    <span className="block font-mono text-xs font-bold text-ink">
                      {tot.completed}/{tot.total}
                    </span>
                    <span className="block text-[10px] text-faint font-mono">
                      {tot.percentage}%
                    </span>
                  </td>
                );
              })}
              <td className="px-6 py-3 text-right">
                <span className="text-[11px] font-mono text-faint">
                  Weekly Avg
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend & Mindful Principles */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sage shadow-xs" /> Completed
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-clay shadow-xs" /> Missed (Auto-Recovery Queue)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-dashed border-line bg-surface" /> Unlogged
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-faint font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-sage-deep" />
          <span>Resilient Cumulative Health Engine</span>
        </div>
      </div>
    </div>
  );
}
