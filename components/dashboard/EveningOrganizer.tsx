"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Timer, Sparkles, CheckCircle2, Zap, ArrowUpRight } from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import { useSprint } from '../../hooks/useSprint';
import Link from 'next/link';

interface EveningOrganizerProps {
  currentDayIndex?: number;
}

export function EveningOrganizer({ currentDayIndex }: EveningOrganizerProps) {
  const [open, setOpen] = useState(true);
  const { habits, toggleStatus, logMicroStep } = useHabits();
  const { session } = useSprint(habits);

  const activeDayIndex = currentDayIndex ?? session.currentDayIndex ?? 0;

  // Filter remaining rituals for today (unlogged or missed)
  const remainingHabits = habits.filter(
    (h) => (h.week?.[activeDayIndex] || 'unlogged') !== 'completed'
  );
  const totalRemainingMinutes = remainingHabits.reduce((acc, h) => acc + (h.minutes || 10), 0);

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-sidebar shadow-calm" aria-label="Evening organizer">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface/40"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono uppercase tracking-widest text-faint">Evening Rhythm Guard</p>
            {remainingHabits.length === 0 ? (
              <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-mono text-sage-deep">
                All Cleared
              </span>
            ) : (
              <span className="rounded-full bg-clay/10 px-2 py-0.5 text-[10px] font-mono text-clay">
                {remainingHabits.length} pending
              </span>
            )}
          </div>
          <p className="mt-1.5 font-serif text-xl text-ink">
            {remainingHabits.length === 0
              ? 'All daily rituals completed · Rest & recover'
              : `Finish your day strong — ${remainingHabits.length} rituals remaining`}
          </p>
          <p className="mt-1 text-xs text-muted font-mono">
            {remainingHabits.length === 0 ? '0 mins required' : `${totalRemainingMinutes} minutes total investment`}
          </p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="shrink-0 text-muted"
        >
          <ChevronDown className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-6 pb-6">
              {remainingHabits.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sage/40 bg-sage-wash/30 p-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-sage-deep" />
                  <p className="mt-2 text-sm font-medium text-ink">Circadian momentum locked</p>
                  <p className="mt-0.5 text-xs text-muted">
                    No open loops tonight. Sleep peacefully and recharge.
                  </p>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-line rounded-2xl border border-line bg-surface overflow-hidden">
                    {remainingHabits.map((habit) => (
                      <li key={habit.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink">{habit.name}</p>
                          <p className="text-xs text-muted font-mono">
                            {habit.window || 'Evening'} · {habit.minutes} min
                            {habit.microVersion && ` (or ⚡ ${habit.microVersion})`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => logMicroStep(habit.id, activeDayIndex)}
                            title="Log 5-minute micro fallback"
                            className="inline-flex items-center gap-1 rounded-lg border border-sage/40 bg-sage-wash px-2.5 py-1 text-[11px] font-mono font-medium text-sage-deep hover:bg-sage hover:text-white transition-colors"
                          >
                            <Zap className="h-3 w-3 fill-current" />
                            <span>5m</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStatus(habit.id, activeDayIndex)}
                            title="Complete full routine"
                            className="rounded-lg border border-line bg-canvas px-2.5 py-1 text-[11px] font-mono font-medium text-ink hover:border-sage hover:text-sage-deep transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5">
                    <Link
                      href="/habits"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sage px-5 py-3 text-xs font-mono font-medium text-white shadow-xs transition-colors hover:bg-sage-deep"
                    >
                      <Timer className="h-4 w-4" strokeWidth={2} aria-hidden />
                      <span>Start {totalRemainingMinutes}m Focus Session</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}


