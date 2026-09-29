"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Compass, Calendar, ArrowUpRight, Sparkles, Award, Clock, CheckCircle2, Info } from 'lucide-react';
import Link from 'next/link';
import type { SprintSession } from '../../types/sprint';
import { getSprintDateRangeLabel } from '../../lib/utils/sprintDate';
import { useAuth } from '../../context/AuthContext';

function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
  const date = new Date();
  date.setHours(h || 0, m || 0, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

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
  const { user } = useAuth();

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

  // Working window configuration
  const startTimeStr = user?.workingWindow?.startTime || '09:00';
  const endTimeStr = user?.workingWindow?.endTime || '19:00';
  const startTimeFormatted = useMemo(() => formatTimeTo12Hour(startTimeStr), [startTimeStr]);
  const endTimeFormatted = useMemo(() => formatTimeTo12Hour(endTimeStr), [endTimeStr]);

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

  // Working window progression for today (from startTime to endTime)
  const [startH, startM] = startTimeStr.split(':').map((v) => parseInt(v, 10));
  const [endH, endM] = endTimeStr.split(':').map((v) => parseInt(v, 10));

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = (startH || 9) * 60 + (startM || 0);
  const endMinutes = (endH || 19) * 60 + (endM || 0);
  const totalWindowMinutes = Math.max(1, endMinutes - startMinutes);

  let todayFraction = 0;
  if (isPastMidnightEnd) {
    todayFraction = 1;
  } else if (currentMinutes < startMinutes) {
    todayFraction = 0;
  } else if (currentMinutes >= endMinutes) {
    todayFraction = 1;
  } else {
    todayFraction = (currentMinutes - startMinutes) / totalWindowMinutes;
  }

  const todayPercent = Math.min(100, Math.max(0, Math.round(todayFraction * 100)));

  // Time-dynamic overall progress (reaches 100% when final day concludes)
  const dynamicElapsedDays = isPastMidnightEnd ? durationDays : currentDayIndex + todayFraction;
  const progressPercent = isPastMidnightEnd
    ? 100
    : Math.min(100, Math.max(0, Math.round((dynamicElapsedDays / durationDays) * 100)));

  // Time remaining until midnight tonight
  const todayElapsedMs = Math.max(0, Math.min(24 * 60 * 60 * 1000, now.getTime() - todayStart.getTime()));
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
              className="flex items-center gap-1.5 rounded-xl bg-sage px-3.5 py-1.5 text-xs font-mono font-medium text-white shadow-xs hover:bg-sage-deep transition-all cursor-pointer"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Wrap Up Sprint</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-mono text-muted hover:border-sage hover:text-sage-deep transition-all cursor-pointer"
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
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-ink text-sm">
              Day {currentDayNumber} of {durationDays}
            </span>
            <span className="text-faint">·</span>
            <span className="text-muted flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-sage-deep inline-block shrink-0" />
              {isPastMidnightEnd ? (
                <span className="text-sage-deep font-semibold">
                  Sprint concluded at midnight · Ready to wrap up
                </span>
              ) : isConcludingToday ? (
                <span>
                  Ends tonight ·{' '}
                  <strong className="text-ink font-semibold">
                    {hoursUntilMidnight > 0
                      ? `${hoursUntilMidnight}h ${minsUntilMidnight}m remaining`
                      : `${minsUntilMidnight}m remaining`}
                  </strong>
                </span>
              ) : (
                <span>Ends at midnight</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            {/* Today % Badge with Info Tooltip */}
            {!isPastMidnightEnd && (
              <div className="group/tip relative inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage-wash/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sage-deep shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-sage-deep animate-pulse" />
                <span>Today {todayPercent}%</span>
                <span
                  tabIndex={0}
                  role="button"
                  aria-label="About Today Progress"
                  className="rounded-full text-sage-deep/70 hover:text-sage-deep focus:outline-none cursor-pointer"
                >
                  <Info className="h-3 w-3" />
                </span>

                {/* Tooltip Card */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:flex group-focus-within/tip:flex w-52 flex-col rounded-xl border border-line bg-ink/95 text-white p-2.5 text-[11px] font-sans font-normal normal-case leading-snug shadow-xl backdrop-blur-xs z-30 transition-all">
                  <p>Progress through today&apos;s focus window ({startTimeFormatted} – {endTimeFormatted}).</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink/95" />
                </div>
              </div>
            )}

            {/* Sprint Elapsed Badge with Info Tooltip */}
            <div className="group/tip relative inline-flex items-center gap-1">
              <span className="font-bold text-sage-deep text-xs">{progressPercent}% elapsed</span>
              <span
                tabIndex={0}
                role="button"
                aria-label="About Sprint Elapsed Progress"
                className="rounded-full text-sage-deep/70 hover:text-sage-deep focus:outline-none cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </span>

              {/* Tooltip Card */}
              <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover/tip:flex group-focus-within/tip:flex w-56 flex-col rounded-xl border border-line bg-ink/95 text-white p-2.5 text-[11px] font-sans font-normal normal-case leading-snug shadow-xl backdrop-blur-xs z-30 transition-all">
                <p>Continuous time elapsed across your full {durationDays}-day sprint horizon.</p>
                <div className="absolute top-full right-2.5 border-4 border-transparent border-t-ink/95" />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Segmented Days Track */}
        <div className="flex items-center gap-1 sm:gap-1.5 pt-1">
          {Array.from({ length: durationDays }).map((_, i) => {
            const isCompletedDay = i < currentDayIndex;
            const isToday = i === currentDayIndex;

            return (
              <div
                key={i}
                className="relative flex-1 group"
                title={`Day ${i + 1} of ${durationDays}${isToday ? ` (Today: ${todayPercent}%)` : isCompletedDay ? ' (Completed)' : ''}`}
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
              </div>
            );
          })}
        </div>

        {/* Sub-track horizon label indicators */}
        <div className="flex items-center justify-between text-[10px] font-mono text-faint px-0.5">
          <span>Day 1</span>
          <span className="text-center text-muted font-medium">
            {isPastMidnightEnd
              ? 'Sprint Horizon Completed'
              : `Day ${currentDayNumber} in progress (${todayPercent}% today)`}
          </span>
          <span>Day {durationDays}</span>
        </div>
      </div>
    </motion.div>
  );
}

