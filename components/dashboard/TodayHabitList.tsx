"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, ShieldCheck, Plus } from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import type { HabitStatus } from '../../types/zenith';
import Link from 'next/link';

function healthTone(health: number) {
  if (health >= 80) return 'border-sage/40 bg-sage-wash text-sage-deep';
  if (health >= 65) return 'border-line bg-canvas text-muted';
  return 'border-clay/35 bg-clay-wash text-clay';
}

export function TodayHabitList() {
  const { habits, isLoading, toggleStatus } = useHabits();

  const completedCount = habits.filter((h) => h.status === 'completed').length;
  const totalCount = habits.length;

  if (isLoading) {
    return (
      <section aria-label="Today's focus" className="space-y-4 animate-pulse">
        <div className="h-7 w-48 rounded-lg bg-surface border border-line" />
        <div className="h-24 rounded-2xl bg-surface border border-line" />
        <div className="h-24 rounded-2xl bg-surface border border-line" />
      </section>
    );
  }

  return (
    <section aria-label="Today's focus">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-2xl text-ink">Today&apos;s focus</h2>
        <p className="text-sm text-muted">
          <motion.span
            key={completedCount}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="inline-block font-medium text-ink"
          >
            {completedCount}
          </motion.span>{' '}
          of {totalCount} logged
        </p>
      </div>

      {habits.length === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 p-8 text-center shadow-calm">
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
        <ul className="mt-5 grid gap-3">
          {habits.map((habit, i) => {
            const isCompleted = habit.status === 'completed';
            const isMissed = habit.status === 'missed';

            return (
              <motion.li
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ x: 2 }}
                className={`flex items-center gap-4 rounded-2xl border bg-surface px-5 py-4 shadow-calm transition-colors duration-150 ease-out ${
                  isCompleted
                    ? 'border-sage/35'
                    : isMissed
                    ? 'border-clay/35'
                    : 'border-line'
                }`}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  onClick={() => toggleStatus(habit.id, 3)}
                  aria-label={`${habit.name} is ${habit.status}. Change status.`}
                  className={[
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ease-out',
                    isCompleted
                      ? 'border-sage bg-sage text-white'
                      : isMissed
                      ? 'border-clay bg-clay text-white'
                      : 'border-dashed border-faint bg-transparent text-transparent hover:border-sage'
                  ].join(' ')}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={habit.status}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {isMissed ? (
                        <X className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                      ) : (
                        <Check className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium transition-colors duration-150 ease-out ${
                      isCompleted ? 'text-muted line-through decoration-sage/60' : 'text-ink'
                    }`}
                  >
                    {habit.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {habit.window} · {habit.minutes} min
                  </p>
                  <div className="mt-2 h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-canvas">
                    <motion.div
                      className={`h-full rounded-full ${habit.health >= 65 ? 'bg-sage' : 'bg-clay'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${habit.health}%` }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${healthTone(
                    habit.health
                  )}`}
                >
                  {habit.health}% health
                </span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
