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
  History,
  ArrowRight,
  ArrowUpDown,
} from 'lucide-react';
import type { Habit, HabitStatus, CircadianSlot } from '../../types/zenith';
import type { SprintConfig } from '../../types/sprint';
import { generateSprintDays, getSprintDateRangeLabel } from '../../lib/utils/sprintDate';

export type HabitSortMode = 'circadian' | 'time-desc' | 'time-asc' | 'health-desc';
export type HabitSlotFilter = 'all' | CircadianSlot;

interface DynamicSprintMatrixProps {
  habits: Habit[];
  config: SprintConfig;
  currentDayIndex: number;
  isHistoricalView?: boolean;
  sortMode?: HabitSortMode;
  onSortModeChange?: (mode: HabitSortMode) => void;
  slotFilter?: HabitSlotFilter;
  onSlotFilterChange?: (slot: HabitSlotFilter) => void;
  onResetToCurrentWeek?: () => void;
  onToggleStatus: (habitId: string, dayIndex: number) => void;
  onOpenSkipModal: (habit: Habit, dayIndex: number) => void;
  onSelectHabit?: (habit: Habit) => void;
  onQuickMicroStep?: (habitId: string, dayIndex: number) => void;
}

export function DynamicSprintMatrix({
  habits,
  config,
  currentDayIndex,
  isHistoricalView = false,
  sortMode = 'circadian',
  onSortModeChange,
  slotFilter = 'all',
  onSlotFilterChange,
  onResetToCurrentWeek,
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
    <div className="space-y-4">
      {/* Historical Archive Notice Banner */}
      {isHistoricalView && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs shadow-xs"
        >
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-muted">
              Viewing archived sprint history for <strong>{config.startDate ? getSprintDateRangeLabel(config.startDate, config.durationDays) : 'Past Week'}</strong>.
            </span>
          </div>
          {onResetToCurrentWeek && (
            <button
              type="button"
              onClick={onResetToCurrentWeek}
              className="flex items-center gap-1 font-mono text-xs font-semibold text-sage-deep hover:text-ink transition-colors shrink-0"
            >
              <span>Return to Live Week</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </motion.div>
      )}

      {/* Organizer Controls: Circadian Slot Filter + Duration / Flow Sorter */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-line bg-surface/80 p-2.5 shadow-calm">
        {/* Circadian Slot Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All Slots' },
              { id: 'morning', label: 'Morning' },
              { id: 'afternoon', label: 'Afternoon' },
              { id: 'evening', label: 'Evening' },
            ] as const
          ).map((slot) => {
            const active = (slotFilter || 'all') === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSlotFilterChange?.(slot.id)}
                className={`rounded-xl px-3 py-1 text-xs font-mono font-medium transition-all ${
                  active
                    ? 'bg-sage text-white shadow-xs'
                    : 'text-muted hover:text-ink hover:bg-canvas'
                }`}
              >
                {slot.label}
              </button>
            );
          })}
        </div>

        {/* Sort Selector */}
        {onSortModeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-faint hidden sm:inline">Sort:</span>
            <button
              type="button"
              onClick={() => {
                if (sortMode === 'circadian') onSortModeChange('time-desc');
                else if (sortMode === 'time-desc') onSortModeChange('time-asc');
                else if (sortMode === 'time-asc') onSortModeChange('health-desc');
                else onSortModeChange('circadian');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-mono font-medium text-ink hover:border-sage hover:text-sage-deep transition-all shadow-xs cursor-pointer"
              title="Click to toggle sorting: Circadian Flow → Longest First → Quick Wins → Health Score"
            >
              <ArrowUpDown className="h-3 w-3 text-sage-deep" />
              <span>
                {sortMode === 'circadian'
                  ? 'Circadian Flow'
                  : sortMode === 'time-desc'
                  ? 'Longest First (▼)'
                  : sortMode === 'time-asc'
                  ? 'Quick Wins (▲)'
                  : 'Health Score (▼)'}
              </span>
            </button>
          </div>
        )}
      </div>

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
                <button
                  type="button"
                  onClick={() => {
                    if (onSortModeChange) {
                      if (sortMode === 'circadian') onSortModeChange('time-desc');
                      else if (sortMode === 'time-desc') onSortModeChange('time-asc');
                      else if (sortMode === 'time-asc') onSortModeChange('health-desc');
                      else onSortModeChange('circadian');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 hover:text-ink transition-colors cursor-pointer group"
                  title="Click to toggle sorting order"
                >
                  <span>Mindful Ritual</span>
                  <ArrowUpDown className="h-3 w-3 text-faint group-hover:text-sage-deep transition-colors" />
                  {sortMode && sortMode !== 'circadian' && (
                    <span className="text-[10px] lowercase text-sage-deep font-normal font-sans">
                      ({sortMode === 'time-desc' ? 'longest first' : sortMode === 'time-asc' ? 'quick wins' : 'health'})
                    </span>
                  )}
                </button>
              </th>

              {sprintDays.map((day) => {
                const isCurrentActiveDay = !isHistoricalView && (day.isToday || day.index === currentDayIndex);
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
            {habits.length === 0 ? (
              <tr>
                <td
                  colSpan={sprintDays.length + 2}
                  className="px-6 py-12 text-center text-muted font-light"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ShieldCheck className="h-8 w-8 text-faint stroke-[1.5]" />
                    <p className="text-sm text-ink font-serif">No rituals anchored in this sprint horizon yet.</p>
                    <p className="text-xs text-muted font-mono">Use the &quot;+ Anchor Ritual&quot; button above to craft your first habit.</p>
                  </div>
                </td>
              </tr>
            ) : (
              habits.map((habit) => {
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
                        {habit.category && (
                          <span className="rounded-full border border-line/60 bg-canvas px-2 py-0.5 text-[9px] font-mono uppercase text-muted">
                            {habit.category}
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
            })
          )}
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
