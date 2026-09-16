"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Calendar, ArrowUpRight, Sparkles, Award, Clock, CheckCircle2 } from 'lucide-react';
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
  // Live local clock state (updates every 30s)
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // 30s refresh interval

    return () => clearInterval(timer);
  }, []);

  const durationDays = sprintSession.config.durationDays || 7;
  const sprintNumber = sprintSession.sprintNumber || 1;

  // Start date at 00:00:00
  const startDate = new Date(sprintSession.config.startDate || new Date());
  startDate.setHours(0, 0, 0, 0);

  // End date at 23:59:59 of the final day (midnight)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + durationDays - 1);
  endDate.setHours(23, 59, 59, 999);

  // Today start at 00:00:00
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Day index calculation
  const diffDaysFromStart = Math.floor(
    (todayStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const currentDayIndex = Math.max(0, Math.min(durationDays - 1, diffDaysFromStart));
  const currentDayNumber = currentDayIndex + 1;
  const isPastMidnightEnd = now.getTime() > endDate.getTime();
  const isConcludingToday = currentDayNumber === durationDays && !isPastMidnightEnd;
  const daysRemaining = Math.max(0, durationDays - currentDayNumber);

  // Intra-day fraction (0 to 1) for today
  const todayElapsedMs = Math.max(0, Math.min(24 * 60 * 60 * 1000, now.getTime() - todayStart.getTime()));
  const todayFraction = isPastMidnightEnd ? 1 : todayElapsedMs / (24 * 60 * 60 * 1000);
  const todayPercent = Math.min(100, Math.max(0, Math.round(todayFraction * 100)));

  // Time-dynamic overall progress (reaches 100% exactly at midnight of the last day)
  const dynamicElapsedDays = isPastMidnightEnd ? durationDays : currentDayIndex + todayFraction;
  const progressPercent = isPastMidnightEnd
    ? 100
    : Math.min(99, Math.max(1, Math.round((dynamicElapsedDays / durationDays) * 100)));

  // Time remaining until midnight tonight
  const msUntilMidnight = Math.max(0, 24 * 60 * 60 * 1000 - todayElapsedMs);
  const hoursUntilMidnight = Math.floor(msUntilMidnight / (1000 * 60 * 60));
  const minsUntilMidnight = Math.floor((msUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));

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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isPastMidnightEnd && onCompleteSprint && (
            <button
              type="button"
              onClick={onCompleteSprint}
              className="flex items-center gap-1.5 rounded-xl bg-sage px-3.5 py-1.5 text-xs font-mono font-medium text-white shadow-xs hover:bg-sage-deep transition-all"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Wrap Up Sprint</span>
            </button>
          )}

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
            <span className="text-muted flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-sage-deep inline-block" />
              {isPastMidnightEnd ? (
                <span className="text-sage-deep font-semibold">
                  Sprint concluded at midnight · Ready to wrap up
                </span>
              ) : isConcludingToday ? (
                <span>
                  Ends tonight at midnight ·{' '}
                  <strong className="text-ink font-semibold">
                    {hoursUntilMidnight > 0
                      ? `${hoursUntilMidnight}h ${minsUntilMidnight}m remaining`
                      : `${minsUntilMidnight}m remaining`}
                  </strong>
                </span>
              ) : (
                <span>
                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining · Ends at midnight
                </span>
              )}
            </span>
          </div>
          <span className="font-bold text-sage-deep">{progressPercent}% elapsed</span>
        </div>

        {/* Dynamic Segmented Days Track */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {Array.from({ length: durationDays }).map((_, i) => {
            const isCompletedDay = i < currentDayIndex;
            const isToday = i === currentDayIndex;

            return (
              <div
                key={i}
                className="relative flex-1 group"
              >
                {/* Segment Bar Container */}
                <div className="h-2.5 w-full rounded-full bg-canvas border border-line overflow-hidden">
                  {isCompletedDay || isPastMidnightEnd ? (
                    <motion.div
                      className="h-full w-full bg-sage"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ transformOrigin: 'left' }}
                      transition={{ duration: 0.3, delay: i * 0.03, ease: 'easeOut' }}
                    />
                  ) : isToday ? (
                    <div className="relative h-full w-full bg-sage-wash/40">
                      <motion.div
                        className="h-full rounded-full bg-sage-deep shadow-xs"
                        initial={{ width: 0 }}
                        animate={{ width: `${todayPercent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                  ) : null}
                </div>

                {isToday && !isPastMidnightEnd && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-widest text-sage-deep">
                    <span className="h-1.5 w-1.5 rounded-full bg-sage-deep animate-pulse" />
                    Today ({todayPercent}%)
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

