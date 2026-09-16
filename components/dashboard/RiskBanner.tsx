"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Minimize2, CheckCircle2, Clock, Sparkles, Zap, ArrowRight } from 'lucide-react';
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

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="text-xs font-mono text-muted hover:text-ink transition-colors"
            >
              Dismiss
            </button>
          </div>

          <p className="mt-1.5 text-sm sm:text-base text-ink leading-relaxed">
            These rituals were previously missed in this sprint. Give them extra focus today to protect your circadian rhythm and prevent a double slip.
          </p>

          {/* At-Risk Habits List */}
          <ul className="mt-4 grid gap-2.5">
            {atRiskList.map(({ habit, missedCountInSprint, isMissedToday, health }) => {
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
        </div>
      </div>
    </motion.section>
  );
}


