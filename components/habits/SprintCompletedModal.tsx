"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Award,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import type { SprintAnalytics, SprintConfig } from '../../types/sprint';
import { getSprintDateRangeLabel } from '../../lib/utils/sprintDate';

interface SprintCompletedModalProps {
  isOpen: boolean;
  analytics: SprintAnalytics | null;
  onClose: () => void;
  onStartNextSprint: (customDuration?: number, customGoal?: string) => void;
}

export function SprintCompletedModal({
  isOpen,
  analytics,
  onClose,
  onStartNextSprint,
}: SprintCompletedModalProps) {
  const [nextDuration, setNextDuration] = useState<number>(analytics?.durationDays || 7);
  const [nextGoal, setNextGoal] = useState<string>('');

  if (!isOpen || !analytics) return null;

  const showUpRate = analytics.overallShowUpRate || 0;
  const strokeDash = 2 * Math.PI * 40;
  const strokeOffset = strokeDash - (strokeDash * showUpRate) / 100;

  const dateSpanLabel = getSprintDateRangeLabel(analytics.startDate, analytics.durationDays);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/50 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-floating"
        >
          {/* Header Banner */}
          <div className="flex items-start justify-between border-b border-line pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep shadow-xs">
                <Award className="h-6 w-6 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-sage-deep font-semibold">
                    Sprint {analytics.sprintNumber} Completed
                  </span>
                  <span className="rounded-full bg-canvas border border-line px-2 py-0.2 text-[10px] font-mono text-muted">
                    {dateSpanLabel}
                  </span>
                </div>
                <h2 className="mt-1 text-2xl sm:text-3xl font-serif text-ink">
                  Retrospective & Horizon Analytics
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Core Score & Momentum Card */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center rounded-3xl border border-sage/30 bg-sage-wash/40 p-5 sm:p-6">
            {/* Radial Gauge */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-line"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-sage-deep transition-all duration-1000 ease-out"
                    fill="transparent"
                    strokeDasharray={strokeDash}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-serif font-bold text-ink">
                    {showUpRate}%
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted">
                    Showed Up
                  </span>
                </div>
              </div>
            </div>

            {/* Score Narrative */}
            <div className="sm:col-span-7 space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-sage/30 px-2.5 py-0.5 text-xs font-mono font-medium text-sage-deep">
                <Sparkles className="h-3 w-3" />
                <span>
                  {showUpRate >= 80
                    ? 'High Identity Alignment'
                    : showUpRate >= 60
                    ? 'Solid Foundation'
                    : 'Friction Observed'}
                </span>
              </div>
              <p className="text-sm text-ink font-serif leading-relaxed">
                You fulfilled <strong>{analytics.totalCompletedEvents}</strong> out of{' '}
                <strong>{analytics.totalTargetEvents}</strong> ritual opportunities across your{' '}
                <strong>{analytics.durationDays}-day</strong> sprint horizon.
              </p>
              <div className="text-xs font-mono text-muted">
                {analytics.anchorHabits.length} anchor rituals solidly held
              </div>
            </div>
          </div>

          {/* Anchor Habits vs Slipped Habits */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Anchor Habits (Performed really well) */}
            <div className="rounded-2xl border border-sage/30 bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-sage-deep" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-ink">
                    Anchor Habits ({analytics.anchorHabits.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-sage-deep bg-sage-wash px-2 py-0.5 rounded-full">
                  ≥75% Show-Up
                </span>
              </div>

              {analytics.anchorHabits.length === 0 ? (
                <p className="text-xs text-muted font-mono py-2">
                  No habits reached the 75% threshold in this sprint.
                </p>
              ) : (
                <div className="space-y-2">
                  {analytics.anchorHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between rounded-xl bg-canvas p-2.5"
                    >
                      <div>
                        <span className="block text-xs font-semibold text-ink">
                          {habit.name}
                        </span>
                        <span className="text-[10px] font-mono text-muted uppercase">
                          {habit.circadianSlot}
                        </span>
                      </div>
                      <span className="rounded-full bg-sage-wash border border-sage/40 px-2.5 py-0.5 text-xs font-mono font-bold text-sage-deep">
                        {habit.showUpRate}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slipped Habits (Slipped / Ignored) */}
            <div className="rounded-2xl border border-clay/30 bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-clay" />
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-ink">
                    Slipped Habits ({analytics.slippedHabits.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-clay bg-clay-wash px-2 py-0.5 rounded-full">
                  Friction
                </span>
              </div>

              {analytics.slippedHabits.length === 0 ? (
                <p className="text-xs text-muted font-mono py-2">
                  Exceptional! All rituals held steady across the entire sprint.
                </p>
              ) : (
                <div className="space-y-2">
                  {analytics.slippedHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className="rounded-xl bg-canvas p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink">
                          {habit.name}
                        </span>
                        <span className="rounded-full bg-clay-wash border border-clay/40 px-2 py-0.5 text-xs font-mono font-bold text-clay">
                          {habit.showUpRate}%
                        </span>
                      </div>
                      <p className="text-[10px] text-muted font-mono">
                        {habit.frictionSummary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actionable Next-Sprint Recommendations */}
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-sage-deep" />
              <span>Prescriptive Guidance for Next Sprint</span>
            </h3>

            <div className="space-y-2.5">
              {analytics.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-2xl border border-line bg-canvas p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-serif font-bold text-ink">
                      {rec.title}
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-sage-deep bg-sage-wash px-2 py-0.5 rounded-full">
                      {rec.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {rec.description}
                  </p>
                  <div className="rounded-xl bg-surface border border-line/60 p-2.5 text-xs text-sage-deep font-mono">
                    💡 <strong>Suggested Adjustment:</strong> {rec.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Next Sprint Horizon (1 to 15 Days) */}
          <div className="mt-8 rounded-3xl border border-line bg-canvas/70 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-serif font-bold text-ink">
                  Launch Sprint {analytics.sprintNumber + 1} Horizon
                </h4>
                <p className="text-xs text-muted">
                  Choose your next sprint duration (1 to 15 days) and apply lessons learned.
                </p>
              </div>
              <span className="rounded-full bg-sage-wash border border-sage/40 px-3 py-1 text-xs font-mono font-bold text-sage-deep">
                {nextDuration} Days
              </span>
            </div>

            {/* Slider */}
            <div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={nextDuration}
                onChange={(e) => setNextDuration(parseInt(e.target.value, 10))}
                className="w-full accent-sage h-2 rounded-lg bg-line appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-faint px-1 mt-1">
                <span>1 Day</span>
                <span>5 Days</span>
                <span>7 Days (Standard)</span>
                <span>10 Days</span>
                <span>15 Days (Max)</span>
              </div>
            </div>

            {/* Next Sprint Intent */}
            <input
              type="text"
              value={nextGoal}
              onChange={(e) => setNextGoal(e.target.value)}
              placeholder="e.g. Integrate friction recommendations & sustain morning momentum..."
              className="w-full rounded-2xl border border-line bg-surface p-3 text-xs text-ink placeholder-faint focus:border-sage focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-5 py-2 text-xs font-mono uppercase tracking-wider text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              Close Archive
            </button>

            <button
              type="button"
              onClick={() => onStartNextSprint(nextDuration, nextGoal)}
              className="flex items-center gap-2 rounded-full bg-sage-deep px-6 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-white shadow-calm transition-all hover:bg-sage hover:shadow-hover"
            >
              <span>Launch Sprint {analytics.sprintNumber + 1}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
