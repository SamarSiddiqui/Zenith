"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Minimize2,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import { useSprint } from '../../hooks/useSprint';
import type { Habit } from '../../types/zenith';

interface RiskBannerProps {
  currentDayIndex?: number;
}

interface AtRiskHabitData {
  habit: Habit;
  missedCountInSprint: number;
  isMissedToday: boolean;
  health: number;
}

export function RiskBanner({ currentDayIndex }: RiskBannerProps) {
  const { habits, logMicroStep, toggleStatus } = useHabits();
  const { session } = useSprint(habits);
  const [resolvedHabitIds, setResolvedHabitIds] = useState<Record<string, string>>({});
  const [dismissed, setDismissed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeDayIndex = currentDayIndex ?? session.currentDayIndex ?? 0;
  const sprintNumber = session.sprintNumber || 1;

  // Scan sprint history up to today for habits with missed days or degraded health
  const atRiskList: AtRiskHabitData[] = habits
    .map((h) => {
      const sprintHistory = (h.week || []).slice(0, activeDayIndex + 1);
      const missedCount = sprintHistory.filter((s) => s === 'missed').length;
      const isMissedToday = (h.week?.[activeDayIndex] || 'unlogged') === 'missed';
      return {
        habit: h,
        missedCountInSprint: missedCount,
        isMissedToday,
        health: h.health || 80,
      };
    })
    .filter((item) => item.missedCountInSprint > 0 || item.health < 75);

  if (dismissed || atRiskList.length === 0) return null;

  const displayedList = atRiskList.slice(0, 2);
  const remainingCount = atRiskList.length - displayedList.length;

  const handleShrink = async (habit: Habit) => {
    await logMicroStep(habit.id, activeDayIndex);
    setResolvedHabitIds((prev) => ({
      ...prev,
      [habit.id]: `${habit.name} locked as 5-min micro step today (${habit.microVersion || '5m micro'}).`,
    }));
  };

  const handleMarkDone = async (habit: Habit) => {
    await toggleStatus(habit.id, activeDayIndex);
    setResolvedHabitIds((prev) => ({
      ...prev,
      [habit.id]: `${habit.name} marked completed for today!`,
    }));
  };

  return (
    <>
      <motion.section
        layout
        aria-label="Zenith friction radar"
        className="rounded-3xl border border-clay/35 bg-clay-wash p-6 sm:p-7 shadow-calm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-clay/15 text-clay shadow-xs">
            <AlertTriangle className="h-5 w-5" strokeWidth={2.2} aria-hidden />
          </span>

          <div className="min-w-0 flex-1">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-clay">
                  Friction Radar · Sprint {sprintNumber}
                </p>
                <span className="rounded-full bg-clay/15 px-2.5 py-0.5 text-[10px] font-mono font-medium text-clay">
                  {atRiskList.length} {atRiskList.length === 1 ? 'habit needs care' : 'habits need care'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {atRiskList.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-mono font-semibold text-clay hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All ({atRiskList.length})</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="text-xs font-mono text-muted hover:text-ink transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <p className="mt-1.5 text-sm sm:text-base text-ink leading-relaxed">
              These rituals were previously missed in this sprint. Give them extra focus today to protect your circadian rhythm and prevent a double slip.
            </p>

            {/* At-Risk Habits List (Top 2 items) */}
            <ul className="mt-4 grid gap-2.5">
              {displayedList.map(({ habit, missedCountInSprint, isMissedToday, health }) => {
                const resolutionMsg = resolvedHabitIds[habit.id];

                return (
                  <li
                    key={habit.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-clay/25 bg-surface/90 px-4 py-3.5 shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-ink">{habit.name}</span>
                        <span className="rounded-md border border-clay/20 bg-clay-wash px-1.5 py-0.5 text-[10px] font-mono text-clay font-medium">
                          {missedCountInSprint > 0
                            ? `${missedCountInSprint} ${missedCountInSprint === 1 ? 'skip' : 'skips'} in sprint`
                            : 'Health degraded'}
                        </span>
                        <span className="rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-mono text-muted">
                          Health: {health}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted font-mono truncate">
                        Scheduled: {habit.window || 'Anytime'} · 5m Fallback: {habit.microVersion || '5m micro session'}
                      </p>
                    </div>

                    {/* Actions / Resolution */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <AnimatePresence mode="wait">
                        {resolutionMsg ? (
                          <motion.span
                            key="resolved"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-sage-deep font-semibold"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Protected for Today</span>
                          </motion.span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleShrink(habit)}
                              title="Execute 5-min micro recovery step"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3 py-1.5 text-xs font-mono font-medium text-white shadow-xs hover:bg-ink/85 transition-colors"
                            >
                              <Zap className="h-3 w-3 fill-current text-amber-400" />
                              <span>Shrink to 5m</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkDone(habit)}
                              title="Mark full routine completed today"
                              className="rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-mono font-medium text-ink hover:border-sage hover:text-sage-deep transition-colors"
                            >
                              Done Today
                            </button>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Button to open full view modal if more than 2 */}
            {remainingCount > 0 && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-clay/40 bg-surface/60 py-2.5 text-xs font-mono text-clay hover:bg-surface hover:border-clay transition-all"
              >
                <span>+{remainingCount} more habits require attention · Open Full Radar</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Full View Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl z-10 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clay/15 text-clay border border-clay/20 shadow-xs">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-ink">
                        Sprint {sprintNumber} Friction Radar
                      </h3>
                      <span className="rounded-full bg-clay/15 px-2.5 py-0.5 text-[10px] font-mono text-clay font-medium">
                        {atRiskList.length} At-Risk
                      </span>
                    </div>
                    <p className="text-xs text-muted font-mono">
                      Zero-guilt recovery list for sustained circadian momentum
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-line p-2 text-muted hover:border-ink hover:text-ink transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Habits List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
                {atRiskList.map(({ habit, missedCountInSprint, health }) => {
                  const resolutionMsg = resolvedHabitIds[habit.id];

                  return (
                    <div
                      key={habit.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-line bg-canvas p-4 transition-all hover:border-clay/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-ink">{habit.name}</span>
                          <span className="rounded-md border border-clay/25 bg-clay-wash px-2 py-0.5 text-[10px] font-mono text-clay font-medium">
                            {missedCountInSprint > 0
                              ? `${missedCountInSprint} ${missedCountInSprint === 1 ? 'skip' : 'skips'} this sprint`
                              : 'Health low'}
                          </span>
                          <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-[10px] font-mono text-muted">
                            Health: {health}%
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted font-mono flex-wrap">
                          <span>Window: {habit.window || 'Anytime'}</span>
                          <span>·</span>
                          <span className="text-sage-deep">⚡ 5m Fallback: {habit.microVersion || '5m micro session'}</span>
                        </div>
                      </div>

                      {/* Modal Actions */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {resolutionMsg ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-sage-deep font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Protected Today</span>
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleShrink(habit)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-1.5 text-xs font-mono font-medium text-white shadow-xs hover:bg-ink/85 transition-colors"
                            >
                              <Zap className="h-3 w-3 fill-current text-amber-400" />
                              <span>5m Fallback</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkDone(habit)}
                              className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-mono font-medium text-ink hover:border-sage hover:text-sage-deep transition-colors"
                            >
                              Done Today
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-line pt-4 flex items-center justify-between">
                <p className="text-xs text-muted font-mono">
                  Reinforcing these rituals today protects your sprint show-up score.
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl bg-sage px-4 py-2 text-xs font-mono font-medium text-white hover:bg-sage-deep transition-colors shadow-xs"
                >
                  Done Reviewing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}



