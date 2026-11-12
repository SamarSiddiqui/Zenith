"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Calendar, ArrowUpRight, Award, Clock, Info, HelpCircle, X } from 'lucide-react';
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
  const [showDayExplain, setShowDayExplain] = useState<boolean>(false);

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

  const todayWeekdayShort = now.toLocaleDateString('en-US', { weekday: 'short' });
  const todayFullLabel = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const startWeekdayShort = startDate.toLocaleDateString('en-US', { weekday: 'short' });
  const endWeekdayShort = endDate.toLocaleDateString('en-US', { weekday: 'short' });

  const horizonDaysRibbon = useMemo(() => {
    return Array.from({ length: durationDays }).map((_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      return {
        index: i,
        dayNumber: i + 1,
        weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isPast: i < currentDayIndex,
        isToday: i === currentDayIndex && !isPastMidnightEnd,
      };
    });
  }, [durationDays, startDate.getTime(), currentDayIndex, isPastMidnightEnd]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-surface p-4 sm:p-6 lg:p-7 shadow-calm"
    >
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-3.5 sm:pb-4 mb-4 sm:mb-5">
        <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-sage-wash text-sage-deep border border-sage/30 shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <Compass className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest text-sage-deep">
                Sprint {sprintNumber} Active Horizon
              </span>
              <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[9px] sm:text-[10px] font-mono text-muted truncate max-w-[180px] sm:max-w-none">
                {dateRangeLabel}
              </span>
            </div>
            <h3 className="mt-0.5 text-sm sm:text-base lg:text-lg font-serif font-bold text-ink truncate">
              {sprintSession.config.sprintGoal || 'Sustain daily rhythm & momentum'}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          {isPastMidnightEnd && onCompleteSprint && (
            <button
              type="button"
              onClick={onCompleteSprint}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-sage px-3 py-1.5 text-xs font-mono font-medium text-white shadow-xs hover:bg-sage-deep transition-all cursor-pointer"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Wrap Up</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex-1 sm:flex-initial rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-mono text-muted hover:border-sage hover:text-sage-deep text-center transition-all cursor-pointer whitespace-nowrap"
            >
              Configure ({durationDays}d)
            </button>
          )}

          <Link
            href="/habits"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 rounded-xl bg-sage-wash border border-sage/30 px-3 py-1.5 text-xs font-mono font-medium text-sage-deep hover:bg-sage hover:text-white transition-all shadow-xs whitespace-nowrap"
          >
            <span>Horizon Matrix</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Horizon Day Progress Bar & Timeline Indicator */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="font-bold text-ink text-xs sm:text-sm">
              Day {currentDayNumber} of {durationDays}
              {!isPastMidnightEnd && (
                <span className="ml-1 font-normal text-muted">({todayWeekdayShort})</span>
              )}
            </span>

            {currentDayNumber > 1 && !isPastMidnightEnd && (
              <button
                type="button"
                onClick={() => setShowDayExplain((prev) => !prev)}
                aria-expanded={showDayExplain}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-mono transition-colors cursor-pointer ${
                  showDayExplain
                    ? 'border-sage bg-sage-wash text-sage-deep font-semibold'
                    : 'border-line bg-canvas text-muted hover:border-sage/50 hover:text-sage-deep'
                }`}
                title="Why does my sprint start mid-week?"
              >
                <HelpCircle className="h-3 w-3 shrink-0" />
                <span>Why Day {currentDayNumber}?</span>
              </button>
            )}

            <span className="text-faint">·</span>
            <span className="text-muted flex items-center gap-1.5 text-[11px] sm:text-xs">
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

          <div className="flex items-center justify-between sm:justify-end gap-2.5 font-mono w-full sm:w-auto pt-1 sm:pt-0 border-t border-line/40 sm:border-0">
            {/* Today % Badge with Info Tooltip */}
            {!isPastMidnightEnd && (
              <div className="group/tip relative inline-flex items-center gap-1 rounded-full border border-sage/30 bg-sage-wash/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-sage-deep shadow-xs">
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
                <div className="pointer-events-none absolute bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 hidden group-hover/tip:flex group-focus-within/tip:flex w-52 flex-col rounded-xl border border-line bg-ink/95 text-white p-2.5 text-[11px] font-sans font-normal normal-case leading-snug shadow-xl backdrop-blur-xs z-30 transition-all">
                  <p>Progress through today&apos;s focus window ({startTimeFormatted} – {endTimeFormatted}).</p>
                  <div className="absolute top-full left-4 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent border-t-ink/95" />
                </div>
              </div>
            )}

            {/* Sprint Elapsed Badge with Info Tooltip */}
            <div className="group/tip relative inline-flex items-center gap-1">
              <span className="font-bold text-sage-deep text-[11px] sm:text-xs">{progressPercent}% elapsed</span>
              <span
                tabIndex={0}
                role="button"
                aria-label="About Sprint Elapsed Progress"
                className="rounded-full text-sage-deep/70 hover:text-sage-deep focus:outline-none cursor-pointer"
              >
                <Info className="h-3 w-3" />
              </span>

              {/* Tooltip Card */}
              <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover/tip:flex group-focus-within/tip:flex w-52 sm:w-56 flex-col rounded-xl border border-line bg-ink/95 text-white p-2.5 text-[11px] font-sans font-normal normal-case leading-snug shadow-xl backdrop-blur-xs z-30 transition-all">
                <p>Continuous time elapsed across your full {durationDays}-day sprint horizon.</p>
                <div className="absolute top-full right-2.5 border-4 border-transparent border-t-ink/95" />
              </div>
            </div>
          </div>
        </div>

        {/* Creative Calendar-Aligned Horizon Info Card */}
        <AnimatePresence>
          {showDayExplain && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-sage/30 bg-sage-wash/45 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-surface text-sage-deep border border-sage/30 shrink-0 mt-0.5">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-ink">
                        {durationDays === 7
                          ? 'Synced to the Real Mon–Sun Calendar Week'
                          : `Calendar-Anchored ${durationDays}-Day Horizon`}
                      </p>
                      <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
                        {durationDays === 7 ? (
                          <>
                            Your sprint flows with the real week (<strong className="text-ink font-medium">{startWeekdayShort} – {endWeekdayShort}</strong>), so{' '}
                            <strong className="text-sage-deep font-semibold">{todayFullLabel}</strong> is naturally{' '}
                            <strong className="text-ink font-medium">Day {currentDayNumber}</strong>. Earlier days aren&apos;t missed—you&apos;re stepping cleanly into today&apos;s flow!
                          </>
                        ) : (
                          <>
                            This horizon began on <strong className="text-ink font-medium">{horizonDaysRibbon[0]?.shortDate}</strong>, making{' '}
                            <strong className="text-sage-deep font-semibold">{todayFullLabel}</strong> Day {currentDayNumber}. Past calendar days never penalize you.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDayExplain(false)}
                    aria-label="Close calendar explanation"
                    className="rounded-lg p-1 text-muted hover:text-ink hover:bg-surface/80 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Mini 7-day / Horizon Weekday Ribbon */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {horizonDaysRibbon.map((item) => (
                    <div
                      key={item.index}
                      className={`flex flex-col items-center justify-center rounded-xl border px-2 py-1.5 min-w-[44px] flex-1 text-center font-mono transition-colors ${
                        item.isToday
                          ? 'border-sage-deep bg-sage-deep text-white shadow-xs'
                          : item.isPast
                            ? 'border-line/70 bg-surface/60 text-faint'
                            : 'border-line bg-surface text-muted'
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider">{item.weekday}</span>
                      <span className="text-[11px] font-bold leading-tight">{item.dateNum}</span>
                      {item.isToday && (
                        <span className="mt-0.5 text-[8px] uppercase tracking-widest opacity-90">
                          Today
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Segmented Days Track */}
        <div className="flex items-center gap-1 sm:gap-1.5 pt-1">
          {horizonDaysRibbon.map((item) => {
            const isCompletedDay = item.isPast;
            const isToday = item.index === currentDayIndex;

            return (
              <div
                key={item.index}
                className="relative flex-1 group min-w-[8px]"
                title={`Day ${item.dayNumber} (${item.weekday} ${item.shortDate})${isToday ? ` · Today (${todayPercent}%)` : isCompletedDay ? ' · Elapsed this week' : ''}`}
              >
                {/* Segment Bar Container */}
                <div className="h-2 sm:h-2.5 w-full rounded-full bg-canvas border border-line overflow-hidden">
                  {isCompletedDay || isPastMidnightEnd ? (
                    <motion.div
                      className={`h-full w-full ${isPastMidnightEnd ? 'bg-sage' : 'bg-sage/55'}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ transformOrigin: 'left' }}
                      transition={{ duration: 0.3, delay: item.index * 0.03, ease: 'easeOut' }}
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
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-faint px-0.5">
          <span className="shrink-0">{startWeekdayShort} · Day 1</span>
          <span className="text-center text-muted font-medium truncate px-2">
            {isPastMidnightEnd
              ? 'Sprint Concluded'
              : `${todayWeekdayShort} · Day ${currentDayNumber} in progress (${todayPercent}% today)`}
          </span>
          <span className="shrink-0">{endWeekdayShort} · Day {durationDays}</span>
        </div>
      </div>
    </motion.div>
  );
}

