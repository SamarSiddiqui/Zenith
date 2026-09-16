"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Minimize2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useHabits } from '../../hooks/useHabits';
import { useSprint } from '../../hooks/useSprint';

interface RiskBannerProps {
  currentDayIndex?: number;
}

export function RiskBanner({ currentDayIndex }: RiskBannerProps) {
  const { habits, logMicroStep } = useHabits();
  const { session } = useSprint(habits);
  const [resolution, setResolution] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const activeDayIndex = currentDayIndex ?? session.currentDayIndex ?? 0;

  // Identify first habit needing attention (missed status today or health < 75)
  const atRiskHabit = habits.find(
    (h) => (h.week?.[activeDayIndex] || 'unlogged') === 'missed' || (h.health && h.health < 75)
  );

  if (dismissed || !atRiskHabit) return null;

  const isMissedToday = (atRiskHabit.week?.[activeDayIndex] || 'unlogged') === 'missed';

  const handleShrink = async () => {
    await logMicroStep(atRiskHabit.id, activeDayIndex);
    setResolution(
      `${atRiskHabit.name} logged as 5-min micro session (${atRiskHabit.microVersion || '5m micro'}). Rhythm protected.`
    );
  };

  return (
    <motion.section
      layout
      aria-label="Zenith risk alert"
      className="rounded-3xl border border-clay/35 bg-clay-wash p-6 sm:p-7 shadow-calm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex gap-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-clay/15 text-clay">
          <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-clay">
              Friction Radar
            </p>
            <span className="rounded-full bg-clay/10 px-2 py-0.5 text-[10px] font-mono text-clay">
              Health {atRiskHabit.health}%
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink">
            Your <span className="font-semibold text-ink">{atRiskHabit.name}</span> ritual is at risk
            {atRiskHabit.status === 'missed'
              ? ' — marked missed today.'
              : ` — health dropped to ${atRiskHabit.health}%.`}
            {' '}Protect your circadian momentum with zero guilt.
          </p>

          <AnimatePresence mode="wait">
            {resolution ? (
              <motion.div
                key="resolved"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mt-4 flex items-center gap-2 rounded-2xl border border-sage/40 bg-sage-wash px-4 py-3 text-sm text-sage-deep font-medium"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{resolution}</span>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="mt-5 flex flex-wrap gap-2.5"
              >
                <button
                  type="button"
                  onClick={handleShrink}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-mono font-medium text-white shadow-xs transition-colors duration-150 ease-out hover:bg-ink/85"
                >
                  <Minimize2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  <span>Shrink to 5 mins ({atRiskHabit.microVersion || '5m micro'})</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setResolution(`Rescheduled ${atRiskHabit.name} for tomorrow's morning window.`)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-mono font-medium text-ink transition-colors duration-150 ease-out hover:bg-canvas"
                >
                  <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                  <span>Shift to Tomorrow</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="rounded-xl px-3 py-2 text-xs font-mono text-muted transition-colors duration-150 ease-out hover:text-ink"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

