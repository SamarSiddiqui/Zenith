"use client";

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Search,
  Plus,
  Compass,
  Award,
  History,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { SprintSession } from '../../types/sprint';
import {
  formatFullTodayDate,
  getSprintDateRangeLabel,
  ShiftedWeekInfo,
} from '../../lib/utils/sprintDate';

interface HabitHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateModal: () => void;
  totalHabits: number;
  completedToday: number;
  averageHealth: number;
  // Sprint Horizon Props
  sprintSession?: SprintSession;
  onOpenSprintSettings?: () => void;
  onCompleteSprint?: () => void;
  onOpenPastSprints?: () => void;
  // Week Navigation Props
  weekOffset?: number;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
  onResetToCurrentWeek?: () => void;
  viewingWeekInfo?: ShiftedWeekInfo;
}

export function HabitHeader({
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  totalHabits,
  completedToday,
  averageHealth,
  sprintSession,
  onOpenSprintSettings,
  onCompleteSprint,
  onOpenPastSprints,
  weekOffset = 0,
  onPrevWeek,
  onNextWeek,
  onResetToCurrentWeek,
  viewingWeekInfo,
}: HabitHeaderProps) {
  const { user } = useAuth();
  const windowStart = user?.workingWindow?.startTime || '09:00';
  const windowEnd = user?.workingWindow?.endTime || '19:00';
  const todayLabel = formatFullTodayDate();

  const sprintDuration = sprintSession?.config.durationDays || 7;
  const sprintNumber = sprintSession?.sprintNumber || 1;
  const currentDayNumber = (sprintSession?.currentDayIndex ?? 0) + 1;
  const dateRangeLabel = viewingWeekInfo?.label || (sprintSession
    ? getSprintDateRangeLabel(sprintSession.config.startDate, sprintDuration)
    : '');

  const isHistorical = weekOffset < 0;
  const isFuture = weekOffset > 0;
  const isLiveWeek = weekOffset === 0;

  return (
    <div className="space-y-6">
      {/* Top Title & Stats Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage-wash/70 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-sage-deep shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-sage-deep animate-pulse" />
              <span>{todayLabel}</span>
            </div>

            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted hover:border-sage/40 hover:text-sage-deep transition-colors"
              title="Click to configure your daily working window in Settings"
            >
              <Clock className="h-3 w-3 text-faint" />
              <span>Window: {windowStart} — {windowEnd}</span>
            </Link>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
            Habit & Sprint Planner
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted font-light max-w-xl">
            {sprintSession?.config.sprintGoal ||
              'Track daily rituals across your custom sprint horizons. Micro-fallbacks preserve momentum without guilt.'}
          </p>
        </div>

        {/* Aggregate Health & Sprint Metric Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {sprintSession && (
            <div className={`rounded-2xl border px-4 py-2.5 shadow-calm text-center transition-colors ${
              isHistorical
                ? 'border-amber-500/30 bg-amber-500/10'
                : 'border-sage/40 bg-sage-wash/40'
            }`}>
              <span className={`block text-[10px] uppercase font-mono tracking-wider font-semibold ${
                isHistorical ? 'text-amber-600 dark:text-amber-400' : 'text-sage-deep'
              }`}>
                {dateRangeLabel.startsWith('Week') ? dateRangeLabel.split('·')[0].trim() : `Sprint ${sprintNumber}`} {isHistorical ? 'Archive' : 'Horizon'}
              </span>
              <span className="block font-serif text-lg font-bold text-ink mt-0.5">
                {isHistorical ? (
                  <span className="text-xs font-mono uppercase text-muted">Completed Week</span>
                ) : (
                  <>Day {currentDayNumber} <span className="text-xs font-sans font-light text-muted">/ {sprintDuration}d</span></>
                )}
              </span>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-calm text-center">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-faint">
              Today&apos;s Rituals
            </span>
            <span className="block font-serif text-lg font-bold text-ink mt-0.5">
              {completedToday} <span className="text-xs font-sans font-light text-muted">/ {totalHabits}</span>
            </span>
          </div>

          <div className="rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-calm text-center">
            <span className="block text-[10px] uppercase font-mono tracking-wider text-faint">
              Avg Health
            </span>
            <span className="block font-serif text-lg font-bold text-sage-deep mt-0.5">
              {averageHealth}%
            </span>
          </div>
        </div>
      </div>

      {/* Sprint Horizon Action Banner with Left / Right Week Navigation */}
      {sprintSession && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-line text-sage-deep">
              <Compass className="h-4 w-4" />
            </span>

            {/* Week Left & Right Browser Controller */}
            <div className="flex items-center rounded-xl border border-line bg-surface p-0.5 shadow-xs">
              <button
                type="button"
                onClick={onPrevWeek}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-canvas hover:text-ink transition-colors"
                title="View previous calendar week"
                aria-label="Previous week"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="px-2.5 text-center min-w-[170px] sm:min-w-[200px]">
                <span className="font-mono text-xs font-bold text-ink block truncate">
                  {dateRangeLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={onNextWeek}
                disabled={isLiveWeek}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                  isLiveWeek
                    ? 'text-faint/40 cursor-not-allowed opacity-30'
                    : 'text-muted hover:bg-canvas hover:text-ink'
                }`}
                title={isLiveWeek ? 'Already viewing current live week' : 'View next calendar week'}
                aria-label="Next week"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Historical Status & Quick Reset to Live Week */}
            {isHistorical && (
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <History className="h-3 w-3" />
                  <span>Historical Week</span>
                </span>
                {onResetToCurrentWeek && (
                  <button
                    type="button"
                    onClick={onResetToCurrentWeek}
                    className="flex items-center gap-1 rounded-full border border-sage/40 bg-sage-wash px-2.5 py-0.5 text-[10px] font-mono font-semibold text-sage-deep hover:bg-sage hover:text-white transition-colors"
                    title="Jump back to active live week"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Return to Live Week</span>
                  </button>
                )}
              </div>
            )}

            {isLiveWeek && (
              <span className="rounded-full border border-sage/40 bg-sage-wash px-2.5 py-0.5 text-[10px] font-mono text-sage-deep">
                Live Week Horizon · 85% Target
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenPastSprints && (
              <button
                type="button"
                onClick={onOpenPastSprints}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-[11px] font-mono text-muted hover:border-line-hover hover:text-ink transition-colors"
              >
                <History className="h-3.5 w-3.5 text-faint" />
                <span>Past Sprints / Weeks</span>
              </button>
            )}

            {onOpenSprintSettings && (
              <button
                type="button"
                onClick={onOpenSprintSettings}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-[11px] font-mono text-muted hover:border-line-hover hover:text-ink transition-colors"
              >
                <Compass className="h-3.5 w-3.5 text-sage-deep" />
                <span>Configure Horizon ({sprintDuration}d)</span>
              </button>
            )}

            {onCompleteSprint && (
              <button
                type="button"
                onClick={onCompleteSprint}
                className="flex items-center gap-1.5 rounded-xl bg-sage-wash border border-sage/40 px-3.5 py-1.5 text-[11px] font-mono font-semibold text-sage-deep hover:bg-sage hover:text-white transition-colors"
              >
                <Award className="h-3.5 w-3.5" />
                <span>Complete Horizon</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Control Bar: Search & New Ritual CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2 rounded-3xl border border-line/80 bg-surface/90 shadow-calm backdrop-blur-md">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rituals or categories..."
            className="w-full rounded-2xl border border-line/70 bg-canvas py-2 pl-9 pr-4 text-xs text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/20 transition-all"
          />
        </div>

        {/* New Habit Anchor CTA */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 rounded-2xl bg-sage px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-sage-deep transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Anchor Ritual</span>
        </button>
      </div>
    </div>
  );
}
