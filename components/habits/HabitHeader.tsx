"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Layers,
  Search,
  Plus,
  Compass,
  Award,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { SprintSession } from '../../types/sprint';
import { formatFullTodayDate, getSprintDateRangeLabel } from '../../lib/utils/sprintDate';

export type PlannerViewMode = 'circadian' | 'matrix';

interface HabitHeaderProps {
  viewMode: PlannerViewMode;
  onChangeViewMode: (mode: PlannerViewMode) => void;
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
}

export function HabitHeader({
  viewMode,
  onChangeViewMode,
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
}: HabitHeaderProps) {
  const { user } = useAuth();
  const windowStart = user?.workingWindow?.startTime || '09:00';
  const windowEnd = user?.workingWindow?.endTime || '19:00';
  const todayLabel = formatFullTodayDate();

  const sprintDuration = sprintSession?.config.durationDays || 7;
  const sprintNumber = sprintSession?.sprintNumber || 1;
  const currentDayNumber = (sprintSession?.currentDayIndex ?? 0) + 1;
  const dateRangeLabel = sprintSession
    ? getSprintDateRangeLabel(sprintSession.config.startDate, sprintDuration)
    : '';

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

            <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted">
              <Clock className="h-3 w-3 text-faint" />
              <span>Window: {windowStart} — {windowEnd}</span>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
            Habits & Circadian Planner
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted font-light max-w-xl">
            {sprintSession?.config.sprintGoal ||
              'Align daily rituals with your biological energy curve. Micro-fallbacks preserve momentum without guilt.'}
          </p>
        </div>

        {/* Aggregate Health & Sprint Metric Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {sprintSession && (
            <div className="rounded-2xl border border-sage/40 bg-sage-wash/40 px-4 py-2.5 shadow-calm text-center">
              <span className="block text-[10px] uppercase font-mono tracking-wider text-sage-deep font-semibold">
                Sprint {sprintNumber} Horizon
              </span>
              <span className="block font-serif text-lg font-bold text-ink mt-0.5">
                Day {currentDayNumber} <span className="text-xs font-sans font-light text-muted">/ {sprintDuration}d</span>
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

      {/* Sprint Horizon Action Banner */}
      {sprintSession && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-canvas/80 px-4 py-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-line text-sage-deep">
              <Compass className="h-4 w-4" />
            </span>
            <div>
              <span className="font-mono text-xs font-semibold text-ink">
                Sprint {sprintNumber} Active Horizon
              </span>
              <span className="mx-2 text-faint">·</span>
              <span className="text-muted font-mono text-[11px]">
                {dateRangeLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPastSprints && (
              <button
                type="button"
                onClick={onOpenPastSprints}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-[11px] font-mono text-muted hover:border-line-hover hover:text-ink transition-colors"
              >
                <History className="h-3.5 w-3.5 text-faint" />
                <span>Past Sprints</span>
              </button>
            )}

            {onOpenSprintSettings && (
              <button
                type="button"
                onClick={onOpenSprintSettings}
                className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-[11px] font-mono text-muted hover:border-line-hover hover:text-ink transition-colors"
              >
                <Compass className="h-3.5 w-3.5 text-sage-deep" />
                <span>Configure ({sprintDuration}d)</span>
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

      {/* Control Bar: View Switcher, Search & New Ritual CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-2 rounded-3xl border border-line/80 bg-surface/90 shadow-calm backdrop-blur-md">
        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1 bg-canvas p-1 rounded-2xl border border-line/60">
          <button
            type="button"
            onClick={() => onChangeViewMode('circadian')}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'circadian'
                ? 'text-ink font-semibold shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            {viewMode === 'circadian' && (
              <motion.div
                layoutId="viewTab"
                className="absolute inset-0 bg-surface rounded-xl border border-line/60"
                transition={{ duration: 0.2 }}
              />
            )}
            <Layers className="relative z-10 h-3.5 w-3.5 text-sage-deep" />
            <span className="relative z-10">Circadian Flow</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeViewMode('matrix')}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'matrix'
                ? 'text-ink font-semibold shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            {viewMode === 'matrix' && (
              <motion.div
                layoutId="viewTab"
                className="absolute inset-0 bg-surface rounded-xl border border-line/60"
                transition={{ duration: 0.2 }}
              />
            )}
            <Calendar className="relative z-10 h-3.5 w-3.5 text-sage" />
            <span className="relative z-10">Sprint Horizon ({sprintDuration}d)</span>
          </button>
        </div>

        {/* Search & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search rituals or category..."
              className="w-full rounded-2xl border border-line/70 bg-canvas py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/20 transition-all"
            />
          </div>

          {/* New Habit Anchor CTA */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 rounded-2xl bg-sage px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sage-deep transition-colors shrink-0"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Anchor Ritual</span>
          </button>
        </div>
      </div>
    </div>
  );
}
