"use client";

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  X,
  ShieldCheck,
  Plus,
  Zap,
  ArrowRight,
  Sparkles,
  ArrowUpDown,
  Sun,
  Sunset,
  Moon,
  Clock,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import { useSprint } from '../../hooks/useSprint';
import type { Habit, HabitStatus, CircadianSlot } from '../../types/zenith';
import Link from 'next/link';

function healthTone(health: number) {
  if (health >= 80) return 'border-sage/40 bg-sage-wash text-sage-deep';
  if (health >= 65) return 'border-line bg-canvas text-muted';
  return 'border-clay/35 bg-clay-wash text-clay';
}

const slotBadgeTone: Record<string, string> = {
  morning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  afternoon: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
  evening: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
  anytime: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20',
};

const SLOT_ORDER: Record<string, number> = {
  morning: 1,
  afternoon: 2,
  evening: 3,
  anytime: 4,
};

type SortMode = 'circadian' | 'time-desc' | 'time-asc';
type FilterSlot = 'all' | CircadianSlot;

interface TodayHabitListProps {
  currentDayIndex?: number;
}

export function TodayHabitList({ currentDayIndex }: TodayHabitListProps) {
  const { habits, isLoading, toggleStatus, logMicroStep } = useHabits();
  const { session } = useSprint(habits);
  const [microStepFeedbackId, setMicroStepFeedbackId] = useState<string | null>(null);

  // Sorting & Filtering State
  const [sortMode, setSortMode] = useState<SortMode>('circadian');
  const [slotFilter, setSlotFilter] = useState<FilterSlot>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  // Active day index in sprint (0-indexed)
  const activeDayIndex = currentDayIndex ?? session.currentDayIndex ?? 0;

  const completedCount = habits.filter(
    (h) => (h.week?.[activeDayIndex] || 'unlogged') === 'completed'
  ).length;
  const totalCount = habits.length;

  const handleMicroStep = async (habitId: string) => {
    setMicroStepFeedbackId(habitId);
    await logMicroStep(habitId, activeDayIndex);
    setTimeout(() => {
      setMicroStepFeedbackId(null);
    }, 2000);
  };

  // Filter habits by selected Circadian Slot
  const filteredHabits = useMemo(() => {
    if (slotFilter === 'all') return habits;
    return habits.filter((h) => (h.circadianSlot || 'morning') === slotFilter);
  }, [habits, slotFilter]);

  // Sort helper
  const sortHabitList = (list: Habit[]) => {
    return [...list].sort((a, b) => {
      if (sortMode === 'circadian') {
        const slotA = SLOT_ORDER[a.circadianSlot || 'morning'] || 99;
        const slotB = SLOT_ORDER[b.circadianSlot || 'morning'] || 99;
        if (slotA !== slotB) return slotA - slotB;
        return (b.minutes || 0) - (a.minutes || 0);
      }
      if (sortMode === 'time-desc') {
        return (b.minutes || 0) - (a.minutes || 0);
      }
      if (sortMode === 'time-asc') {
        return (a.minutes || 0) - (b.minutes || 0);
      }
      return 0;
    });
  };

  // Separate pending (unlogged/missed) from completed habits
  const pendingHabits = useMemo(() => {
    const list = filteredHabits.filter(
      (h) => (h.week?.[activeDayIndex] || 'unlogged') !== 'completed'
    );
    return sortHabitList(list);
  }, [filteredHabits, activeDayIndex, sortMode]);

  const completedHabits = useMemo(() => {
    const list = filteredHabits.filter(
      (h) => (h.week?.[activeDayIndex] || 'unlogged') === 'completed'
    );
    return sortHabitList(list);
  }, [filteredHabits, activeDayIndex, sortMode]);

  if (isLoading) {
    return (
      <section aria-label="Today's focus" className="space-y-4 animate-pulse">
        <div className="h-7 w-48 rounded-lg bg-surface border border-line" />
        <div className="h-24 rounded-2xl bg-surface border border-line" />
        <div className="h-24 rounded-2xl bg-surface border border-line" />
      </section>
    );
  }

  const renderHabitItem = (habit: Habit, i: number, isCompletedGroup: boolean = false) => {
    const todayStatus = (habit.week?.[activeDayIndex] || 'unlogged') as HabitStatus;
    const isCompleted = todayStatus === 'completed';
    const isMissed = todayStatus === 'missed';
    const isMicroFeedback = microStepFeedbackId === habit.id;

    return (
      <motion.li
        layout
        key={habit.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isCompletedGroup ? 0.75 : 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.22, delay: i * 0.02, ease: [0.23, 1, 0.32, 1] }}
        className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border px-5 py-4 shadow-calm transition-all duration-150 ease-out ${
          isCompleted
            ? 'border-sage/35 bg-sage-wash/15 hover:opacity-100'
            : isMissed
            ? 'border-clay/35 bg-clay-wash/20'
            : 'border-line bg-surface hover:border-sage/40'
        }`}
      >
        {/* Left: Check Toggle & Name */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            onClick={() => toggleStatus(habit.id, activeDayIndex)}
            aria-label={`${habit.name} is ${todayStatus}. Click to cycle status.`}
            title="Click to cycle: Unlogged → Completed → Missed"
            className={[
              'mt-0.5 sm:mt-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors duration-150 ease-out shadow-xs',
              isCompleted
                ? 'border-sage bg-sage text-white'
                : isMissed
                ? 'border-clay bg-clay text-white'
                : 'border-dashed border-faint bg-canvas text-transparent hover:border-sage hover:text-sage-deep/40'
            ].join(' ')}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={todayStatus}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
              >
                {isMissed ? (
                  <X className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`truncate text-sm font-semibold transition-colors duration-150 ease-out ${
                  isCompleted ? 'text-muted line-through decoration-sage/60' : 'text-ink'
                }`}
              >
                {habit.name}
              </p>
              <span
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-mono capitalize ${
                  slotBadgeTone[habit.circadianSlot || 'morning']
                }`}
              >
                {habit.circadianSlot || 'morning'}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-muted flex-wrap font-mono">
              <span>{habit.window || 'Anytime'}</span>
              <span className="text-faint">·</span>
              <span>{habit.minutes}m routine</span>
              {habit.microVersion && (
                <>
                  <span className="text-faint">·</span>
                  <span className="text-[11px] text-sage-deep font-mono">
                    ⚡ {habit.microVersion}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Micro-Fallback Action & Health Badge */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/50">
          {!isCompleted && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleMicroStep(habit.id)}
              title={`Do 5-minute fallback: ${habit.microVersion || '5m micro session'}`}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-mono font-medium transition-all shadow-xs ${
                isMicroFeedback
                  ? 'border-sage bg-sage text-white'
                  : 'border-sage/40 bg-sage-wash text-sage-deep hover:bg-sage hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>{isMicroFeedback ? '5m Saved!' : '5m Micro'}</span>
            </motion.button>
          )}

          <span
            className={`shrink-0 rounded-xl border px-2.5 py-1 text-xs font-mono font-medium ${healthTone(
              habit.health
            )}`}
          >
            {habit.health}%
          </span>
        </div>
      </motion.li>
    );
  };

  return (
    <section aria-label="Today's focus" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl text-ink">Today&apos;s Focus</h2>
          <p className="mt-0.5 text-xs text-muted">Daily circadian execution &amp; rituals</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-muted">
            <motion.span
              key={completedCount}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="inline-block font-semibold text-ink"
            >
              {completedCount}
            </motion.span>
            {' '}/ {totalCount} completed
          </p>
          <Link
            href="/habits"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-sage-deep hover:underline ml-2"
          >
            <span>Planner</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Organizer Controls: Circadian Slot Filter + Duration / Flow Sorter */}
      {habits.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-line bg-surface/70 p-2.5">
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
              const active = slotFilter === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlotFilter(slot.id)}
                  className={`rounded-xl px-2.5 py-1 text-xs font-mono font-medium transition-all ${
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
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-faint hidden sm:inline">Sort:</span>
            <button
              type="button"
              onClick={() => {
                if (sortMode === 'circadian') setSortMode('time-desc');
                else if (sortMode === 'time-desc') setSortMode('time-asc');
                else setSortMode('circadian');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-2.5 py-1 text-xs font-mono font-medium text-ink hover:border-sage hover:text-sage-deep transition-all shadow-xs"
              title="Click to toggle sorting mode"
            >
              <ArrowUpDown className="h-3 w-3 text-sage-deep" />
              <span>
                {sortMode === 'circadian'
                  ? 'Circadian Flow'
                  : sortMode === 'time-desc'
                  ? 'Longest First (▼)'
                  : 'Quick Wins (▲)'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Habit List */}
      {habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-surface/50 p-8 text-center shadow-calm">
          <ShieldCheck className="h-8 w-8 text-faint stroke-[1.5]" />
          <h3 className="mt-2 font-serif text-base text-ink">No rituals anchored yet</h3>
          <p className="mt-1 text-xs text-muted max-w-xs">
            Start building your circadian rhythm in the Habit Planner.
          </p>
          <Link
            href="/habits"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sage-deep px-4 py-2 text-xs font-mono font-medium text-white shadow-xs hover:bg-sage transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Anchor Ritual</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active / Pending Habits (Sorted & Always on Top) */}
          <ul className="grid gap-3">
            <AnimatePresence initial={false}>
              {pendingHabits.map((habit, i) => renderHabitItem(habit, i, false))}
            </AnimatePresence>
          </ul>

          {pendingHabits.length === 0 && completedHabits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sage/40 bg-sage-wash/20 p-6 text-center"
            >
              <CheckCircle2 className="h-7 w-7 text-sage-deep" />
              <p className="mt-1.5 text-sm font-medium text-ink">All active rituals completed for today</p>
              <p className="text-xs text-muted font-mono">Circadian momentum locked · See completed rituals below</p>
            </motion.div>
          )}

          {/* Sunk Completed Habits Section (At the Bottom) */}
          {completedHabits.length > 0 && (
            <div className="mt-6 pt-3 border-t border-line/60">
              <button
                type="button"
                onClick={() => setShowCompleted((v) => !v)}
                className="flex items-center justify-between w-full py-1.5 text-left group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted group-hover:text-ink transition-colors">
                    Completed Today ({completedHabits.length})
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                </div>
                <motion.span
                  animate={{ rotate: showCompleted ? 180 : 0 }}
                  transition={{ duration: 0.16 }}
                  className="text-muted group-hover:text-ink"
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {showCompleted && (
                  <motion.ul
                    key="completed-list"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                    className="grid gap-2.5 mt-3 overflow-hidden"
                  >
                    {completedHabits.map((habit, i) => renderHabitItem(habit, i, true))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </section>
  );
}


