"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Calendar, ArrowUpRight, Sparkles, Award } from 'lucide-react';
import Link from 'next/link';
import type { SprintSession } from '../../types/sprint';
import { getSprintDateRangeLabel } from '../../lib/utils/sprintDate';

interface SprintHorizonWidgetProps {
  sprintSession: SprintSession;
  onOpenSettings?: () => void;
  onCompleteSprint?: () => void;
}

export function SprintHorizonWidget({
  sprintSession,
  onOpenSettings,
  onCompleteSprint,
}: SprintHorizonWidgetProps) {
  const durationDays = sprintSession.config.durationDays || 7;
  const sprintNumber = sprintSession.sprintNumber || 1;
  const currentDayNumber = (sprintSession.currentDayIndex ?? 0) + 1;
  const daysRemaining = Math.max(0, durationDays - currentDayNumber);
  const progressPercent = Math.min(100, Math.round((currentDayNumber / durationDays) * 100));

  const dateRangeLabel = getSprintDateRangeLabel(
    sprintSession.config.startDate,
    durationDays
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-calm"
    >
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep border border-sage/30 shadow-xs">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-sage-deep">
                Sprint {sprintNumber} Active Horizon
              </span>
              <span className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[10px] font-mono text-muted">
                {dateRangeLabel}
              </span>
            </div>
            <h3 className="mt-0.5 text-base sm:text-lg font-serif font-bold text-ink">
              {sprintSession.config.sprintGoal || 'Sustain daily rhythm & momentum'}
            </h3>
          </div>
        </div>

        {/* Action Link to Habit Matrix */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-mono text-muted hover:border-sage hover:text-sage-deep transition-all"
            >
              Configure ({durationDays}d)
            </button>
          )}

          <Link
            href="/habits"
            className="flex items-center gap-1 rounded-xl bg-sage-wash border border-sage/30 px-3.5 py-1.5 text-xs font-mono font-medium text-sage-deep hover:bg-sage hover:text-white transition-all shadow-xs"
          >
            <span>Horizon Matrix</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Horizon Day Progress Bar & Timeline Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink text-sm">
              Day {currentDayNumber} of {durationDays}
            </span>
            <span className="text-faint">·</span>
            <span className="text-muted">
              {daysRemaining === 0 ? 'Horizon concluding today' : `${daysRemaining} days remaining`}
            </span>
          </div>
          <span className="font-bold text-sage-deep">{progressPercent}% elapsed</span>
        </div>

        {/* Dynamic Segmented Days Track */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {Array.from({ length: durationDays }).map((_, i) => {
            const isCompletedDay = i < currentDayNumber;
            const isToday = i === currentDayNumber - 1;

            return (
              <div
                key={i}
                className="relative flex-1 group"
              >
                <motion.div
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isToday
                      ? 'bg-sage-deep shadow-xs ring-2 ring-sage/30'
                      : isCompletedDay
                      ? 'bg-sage'
                      : 'bg-canvas border border-line'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ transformOrigin: 'left' }}
                  transition={{ duration: 0.3, delay: i * 0.03, ease: 'easeOut' }}
                />
                {isToday && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden sm:block text-[9px] font-mono font-bold uppercase tracking-widest text-sage-deep">
                    Today
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
