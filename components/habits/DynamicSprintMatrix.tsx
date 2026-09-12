"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { Habit, HabitStatus } from '../../types/zenith';
import type { SprintConfig } from '../../types/sprint';
import { generateSprintDays } from '../../lib/utils/sprintDate';

interface DynamicSprintMatrixProps {
  habits: Habit[];
  config: SprintConfig;
  currentDayIndex: number;
  onToggleStatus: (habitId: string, dayIndex: number) => void;
  onOpenSkipModal: (habit: Habit, dayIndex: number) => void;
  onSelectHabit?: (habit: Habit) => void;
  onQuickMicroStep?: (habitId: string, dayIndex: number) => void;
}

export function DynamicSprintMatrix({
  habits,
  config,
  currentDayIndex,
  onToggleStatus,
  onOpenSkipModal,
  onSelectHabit,
  onQuickMicroStep,
}: DynamicSprintMatrixProps) {
  // Generate dynamic day metadata based on 1-15 day configuration
  const sprintDays = useMemo(() => {
    return generateSprintDays(config.startDate, config.durationDays);
  }, [config.startDate, config.durationDays]);

  // Compute daily totals across all habits for each sprint day
  const dailyTotals = useMemo(() => {
    return sprintDays.map((_, dayIndex) => {
      const completed = habits.filter((h) => h.week[dayIndex] === 'completed').length;
      const missed = habits.filter((h) => h.week[dayIndex] === 'missed').length;
      const total = habits.length;
      return {
        completed,
        missed,
        total,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [sprintDays, habits]);

  // Overall sprint show-up average across all habit days
  const overallShowUpAvg = useMemo(() => {
    const totalPossible = habits.length * config.durationDays;
    if (totalPossible === 0) return 0;
    let totalCompleted = 0;
    habits.forEach((h) => {
      for (let i = 0; i < config.durationDays; i++) {
        if (h.week[i] === 'completed') totalCompleted++;
      }
    });
    return Math.round((totalCompleted / totalPossible) * 100);
  }, [habits, config.durationDays]);

  return (
    <div className="space-y-6">
      {/* Sprint Matrix Horizon Table Container */}
      <div className="overflow-x-auto rounded-3xl border border-line bg-surface shadow-calm">
        <table className="w-full min-w-[720px] border-collapse">
          <caption className="sr-only">
            Dynamic {config.durationDays}-Day Sprint Habit Matrix
          </caption>

          {/* Header Row */}
          <thead>
            <tr className="border-b border-line bg-canvas/60">
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-mono font-semibold uppercase tracking-[0.14em] text-faint"
              >
                Mindful Ritual
              </th>

              {sprintDays.map((day) => {
                const isCurrentActiveDay = day.isToday || day.index === currentDayIndex;
                return (
                  <th
                    key={day.isoDate || day.index}
                    scope="col"
                    className={`px-3 py-3.5 text-center transition-colors ${
                      isCurrentActiveDay
                        ? 'bg-sage-wash/60 border-x border-sage/30 shadow-inner'
                        : 'border-r border-line/40'
                    }`}
                    style={{ minWidth: config.durationDays > 10 ? '48px' : '64px' }}
                  >
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider ${
                          isCurrentActiveDay ? 'font-bold text-sage-deep' : 'text-faint'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      <span
                        className={`mt-0.5 text-sm font-serif ${
                          isCurrentActiveDay ? 'font-bold text-ink' : 'text-muted'
                        }`}
                      >
                        {day.dateNumber}
                      </span>
                      {isCurrentActiveDay && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-sage-deep animate-pulse" />
                          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-sage-deep">
                            Today
                          </span>
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}

              <th
                scope="col"
                className="px-6 py-4 text-right text-xs font-mono font-semibold uppercase tracking-[0.14em] text-faint"
              >
                Sprint Health
              </th>
            </tr>
          </thead>

          {/* Body Rows */}
          <tbody className="divide-y divide-line/70">
            {habits.map((habit) => {
              // Calculate single habit completion in this sprint
              const habitSprintCompleted = habit.week
                .slice(0, config.durationDays)
                .filter((s) => s === 'completed').length;
              const habitSprintRate =
                config.durationDays > 0
                  ? Math.round((habitSprintCompleted / config.durationDays) * 100)
                  : 0;

              return (
                <tr
                  key={habit.id}
                  className="group transition-colors duration-150 ease-out hover:bg-canvas/50"
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
                        {habit.circadianSlot && (
                          <span className="rounded-full border border-line/60 bg-canvas px-2 py-0.5 text-[9px] font-mono uppercase text-muted">
                            {habit.circadianSlot}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted font-mono">
                        <span>{habit.window || 'Anytime'}</span>
                        <span>·</span>
                        <span>{habit.minutes}m</span>
                        {habit.microVersion && (
                          <>
                            <span>·</span>
                            <span className="text-sage-deep text-[11px] truncate max-w-[140px]">
                              ⚡ {habit.microVersion}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </th>

                  {/* Dynamic 1..15 Daily Toggles */}
                  {sprintDays.map((day) => {
                    const i = day.index;
                    const status: HabitStatus = habit.week[i] || 'unlogged';
                    const isToday = day.isToday || i === currentDayIndex;
                    const isCompleted = status === 'completed';
                    const isMissed = status === 'missed';

                    return (
                      <td
                        key={`${habit.id}-day-${i}`}
                        className={`px-2 py-4 text-center transition-colors ${
                          isToday
                            ? 'bg-sage-wash/30 border-x border-sage/20'
                            : 'border-r border-line/30'
                        }`}
                      >
                        <div className="relative flex items-center justify-center">
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
                            aria-label={`${habit.name} Day ${i + 1} (${day.dayName}) — ${status}`}
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
                        </div>
                      </td>
                    );
                  })}

                  {/* Habit Sprint Health Column */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-block rounded-full border px-3 py-0.5 text-xs font-mono font-bold ${
                          habitSprintRate >= 75
                            ? 'border-sage/40 bg-sage-wash text-sage-deep'
                            : habitSprintRate >= 50
                            ? 'border-sand/40 bg-sand/10 text-sand'
                            : 'border-clay/40 bg-clay-wash text-clay'
                        }`}
                      >
                        {habitSprintRate}%
                      </span>
                      <span className="text-[10px] font-mono text-faint">
                        {habitSprintCompleted}/{config.durationDays}d
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Daily Completion Summary Footer */}
          <tfoot>
            <tr className="border-t border-line bg-canvas/70">
              <td className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                Daily Show-Up Rate
              </td>
              {dailyTotals.map((tot, i) => {
                const day = sprintDays[i];
                const isToday = day?.isToday || i === currentDayIndex;
                return (
                  <td
                    key={i}
                    className={`px-2 py-3 text-center ${
                      isToday
                        ? 'bg-sage-wash/40 border-x border-sage/30'
                        : 'border-r border-line/30'
                    }`}
                  >
                    <span className="block font-mono text-xs font-bold text-ink">
                      {tot.completed}/{tot.total}
                    </span>
                    <span
                      className={`block text-[10px] font-mono ${
                        tot.percentage >= 75
                          ? 'text-sage-deep font-semibold'
                          : 'text-faint'
                      }`}
                    >
                      {tot.percentage}%
                    </span>
                  </td>
                );
              })}
              <td className="px-6 py-3 text-right">
                <span className="block text-[11px] font-mono font-semibold text-sage-deep">
                  {overallShowUpAvg}% Avg
                </span>
                <span className="text-[9px] font-mono text-faint">
                  Sprint Momentum
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend & Circadian Grounding Principles */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sage shadow-xs" /> Completed Ritual
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-clay shadow-xs" /> Missed (Recovery Mode)
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-dashed border-line bg-surface" /> Unlogged
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-faint font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-sage-deep" />
          <span>Dynamic {config.durationDays}-Day Horizon Engine</span>
        </div>
      </div>
    </div>
  );
}
