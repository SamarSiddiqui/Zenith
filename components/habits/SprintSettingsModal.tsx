"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Compass,
  Sparkles,
  Calendar,
  Check,
  Target,
  Clock,
  Lock,
  BookmarkCheck,
  ShieldAlert,
} from 'lucide-react';
import type { SprintConfig, SprintDraft } from '../../types/sprint';
import {
  getSprintDateRangeLabel,
  getWeekNumber,
  getMondayOfWeek,
  getNextSprintRunwayInfo,
} from '../../lib/utils/sprintDate';

interface SprintSettingsModalProps {
  isOpen: boolean;
  currentConfig: SprintConfig;
  sprintNumber: number;
  isCurrentWeekCompleted?: boolean;
  onClose: () => void;
  onUpdateDuration: (days: number) => void;
  onUpdateGoal: (goal: string) => void;
  onStartFreshSprint: (customDuration?: number, customGoal?: string) => void;
  onSaveDraft?: (draft: SprintDraft) => void;
}

const TARGET_PRESETS = [
  {
    target: '85%',
    tag: 'Recommended',
    label: 'Standard Rhythm (85%)',
    desc: 'Sustainable consistency for typical work weeks',
    color: 'sage',
  },
  {
    target: '95%',
    tag: 'Peak Focus',
    label: 'Deep Immersion (95%)',
    desc: 'Intense breakthrough sprint for key milestones',
    color: 'amber',
  },
  {
    target: '75%',
    tag: 'Gentle Restart',
    label: 'Low-Friction (75%)',
    desc: 'Steady baseline recovery for travel or high-stress periods',
    color: 'muted',
  },
];

export function SprintSettingsModal({
  isOpen,
  currentConfig,
  sprintNumber,
  isCurrentWeekCompleted = false,
  onClose,
  onUpdateDuration,
  onUpdateGoal,
  onStartFreshSprint,
  onSaveDraft,
}: SprintSettingsModalProps) {
  const [goal, setGoal] = useState<string>(
    currentConfig.sprintGoal || 'Ground daily circadian rituals and sustain steady momentum'
  );
  const [isNextWeekPlanning, setIsNextWeekPlanning] = useState<boolean>(false);
  const [draftSavedFeedback, setDraftSavedFeedback] = useState<boolean>(false);

  const currentStartDate = useMemo(() => {
    return new Date(currentConfig.startDate || new Date());
  }, [currentConfig.startDate]);

  const currentWeekNum = useMemo(() => {
    return getWeekNumber(currentStartDate);
  }, [currentStartDate]);

  // Next week's Monday and week number
  const nextWeekStartDate = useMemo(() => {
    const monday = getMondayOfWeek(new Date());
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    return nextMonday;
  }, []);

  const nextWeekNum = useMemo(() => {
    return getWeekNumber(nextWeekStartDate);
  }, [nextWeekStartDate]);

  // 24-Hour Prior Runway Info
  const runwayInfo = useMemo(() => {
    return getNextSprintRunwayInfo(new Date());
  }, []);

  // Can next week sprint be drafted/configured? Only if within 24h runway or current week completed
  const canPlanNextWeek = runwayInfo.isWithin24hRunway || isCurrentWeekCompleted;

  const activeWeekNum = isNextWeekPlanning ? nextWeekNum : currentWeekNum;
  const activeDateLabel = useMemo(() => {
    if (isNextWeekPlanning) {
      return getSprintDateRangeLabel(nextWeekStartDate.toISOString(), 7);
    }
    return getSprintDateRangeLabel(currentConfig.startDate, 7);
  }, [isNextWeekPlanning, nextWeekStartDate, currentConfig.startDate]);

  useEffect(() => {
    if (isOpen) {
      setGoal(
        currentConfig.sprintGoal || 'Ground daily circadian rituals and sustain steady momentum'
      );
      setIsNextWeekPlanning(false);
      setDraftSavedFeedback(false);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (isNextWeekPlanning) {
      if (!canPlanNextWeek) return;

      const draft: SprintDraft = {
        weekNumber: nextWeekNum,
        startDate: nextWeekStartDate.toISOString(),
        endDate: new Date(nextWeekStartDate.getTime() + 6 * 86400000).toISOString(),
        sprintGoal: goal,
        createdAt: new Date().toISOString(),
      };

      if (onSaveDraft) {
        onSaveDraft(draft);
      }
      setDraftSavedFeedback(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      if (goal !== currentConfig.sprintGoal) {
        onUpdateGoal(goal);
      }
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop with subtle blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/40 backdrop-blur-md transition-opacity"
        />

        {/* Rectangular Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-floating overflow-hidden"
        >
          {/* Subtle decorative background gradient glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sage-wash/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-sand/30 blur-3xl" />

          {/* Modal Header */}
          <div className="relative flex items-center justify-between border-b border-line pb-5">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep shadow-xs"
              >
                <Compass className="h-5 w-5 stroke-[2.2]" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    Weekly Sprint Horizon
                  </span>
                  <span className="rounded-full bg-sage/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sage-deep">
                    7 Days · Mon–Sun
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-ink tracking-tight">
                  Week {activeWeekNum} Setup
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted transition-all duration-150 hover:bg-canvas hover:text-ink"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Rectangular 2-Column Grid */}
          <div className="relative mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Timeline & Horizon Selector (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-4 rounded-2xl border border-line bg-canvas/60 p-4 sm:p-5">
              <div className="space-y-4">
                {/* Horizon Switcher Tabs */}
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
                    Select Horizon Window
                  </span>
                  <div className="relative flex rounded-xl border border-line bg-surface p-1">
                    <button
                      type="button"
                      onClick={() => setIsNextWeekPlanning(false)}
                      className={`relative flex-1 rounded-lg py-2 text-xs font-mono font-medium transition-all ${
                        !isNextWeekPlanning ? 'text-ink font-semibold' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {!isNextWeekPlanning && (
                        <motion.div
                          layoutId="activeHorizonTab"
                          className="absolute inset-0 rounded-lg bg-canvas border border-line shadow-xs"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">Week {currentWeekNum} (Active)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsNextWeekPlanning(true)}
                      className={`relative flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-mono font-medium transition-all ${
                        isNextWeekPlanning ? 'text-sage-deep font-semibold' : 'text-muted hover:text-ink'
                      }`}
                    >
                      {isNextWeekPlanning && (
                        <motion.div
                          layoutId="activeHorizonTab"
                          className="absolute inset-0 rounded-lg bg-sage-wash border border-sage/40 shadow-xs"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">Week {nextWeekNum}</span>
                      {canPlanNextWeek ? (
                        <Sparkles className="relative z-10 h-3 w-3 text-sage-deep" />
                      ) : (
                        <Lock className="relative z-10 h-3 w-3 text-faint" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Date Span Showcase */}
                <div className="rounded-xl border border-line bg-surface p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-sage-deep">
                    <Calendar className="h-4 w-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                      {isNextWeekPlanning ? 'Upcoming Calendar Cycle' : 'Active Calendar Cycle'}
                    </span>
                  </div>
                  <p className="text-sm font-mono font-bold text-ink tracking-tight">
                    {activeDateLabel}
                  </p>
                  <p className="text-[11px] text-muted leading-relaxed">
                    {isNextWeekPlanning
                      ? canPlanNextWeek
                        ? `24h Runway open: Save draft targets for Week ${nextWeekNum}. Automatically starts Monday.`
                        : `Current week is in progress. Week ${nextWeekNum} pre-planning unlocks on Sunday.`
                      : `Currently tracking Week ${currentWeekNum}. Sprints conclude on Sunday at midnight.`}
                  </p>
                </div>
              </div>

              {/* 24-Hour Runway Cadence Status Badge */}
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-mono transition-colors ${
                  canPlanNextWeek
                    ? 'bg-sage-wash/70 border-sage/30 text-sage-deep'
                    : 'bg-canvas border-line text-muted'
                }`}
              >
                {canPlanNextWeek ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-sage-deep" />
                    <span>24h Runway: Draft Enabled</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted" />
                    <span>{runwayInfo.unlockLabel}</span>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Consistency Presets & Intent OR 24h Lock Screen */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              {isNextWeekPlanning && !canPlanNextWeek ? (
                /* 24-Hour Pre-planning Runway Lock Screen */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-line bg-canvas/40">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-line shadow-xs mb-3 text-muted">
                    <Lock className="h-5 w-5 text-muted" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-ink">
                    Pre-Planning Unlocks on Sunday
                  </h3>
                  <p className="mt-1.5 text-xs text-muted max-w-sm leading-relaxed">
                    To maintain present circadian focus and prevent premature horizon drift, upcoming sprint drafts unlock strictly <strong>24 hours prior</strong> to the new week.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-mono text-sage-deep">
                    <Clock className="h-3 w-3" />
                    <span>{runwayInfo.unlockLabel}</span>
                  </div>
                </div>
              ) : (
                /* Active Setup / Draft Form */
                <>
                  {/* Consistency Target Presets */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                      {isNextWeekPlanning ? 'Upcoming Target Consistency (Draft)' : 'Weekly Target Consistency'}
                    </label>
                    <div className="grid gap-2">
                      {TARGET_PRESETS.map((preset) => {
                        const isSelected = goal.includes(preset.target);
                        return (
                          <motion.button
                            key={preset.target}
                            type="button"
                            whileHover={{ y: -1, scale: 1.005 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() =>
                              setGoal(`Target ${preset.target} Show-Up: ${preset.desc}`)
                            }
                            className={`group relative flex items-start gap-3 rounded-2xl border p-3 text-left transition-all ${
                              isSelected
                                ? 'border-sage bg-sage-wash/40 shadow-xs ring-1 ring-sage/30'
                                : 'border-line bg-canvas/60 hover:border-sage/40 hover:bg-canvas'
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                                isSelected
                                  ? 'border-sage bg-sage text-white'
                                  : 'border-line group-hover:border-sage/60'
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-mono font-semibold text-ink">
                                  {preset.label}
                                </span>
                                <span className="rounded-full bg-surface border border-line px-1.5 py-0.2 text-[9px] font-mono text-muted">
                                  {preset.tag}
                                </span>
                              </div>
                              <span className="text-[11px] text-muted leading-tight block mt-0.5">
                                {preset.desc}
                              </span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weekly Focus & Intent Input */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-1.5">
                      {isNextWeekPlanning ? 'Upcoming Focus Intent (Draft)' : 'Weekly Focus & Intent'}
                    </label>
                    <textarea
                      rows={2}
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g. Anchor morning deep work block and establish restorative evening wind-down..."
                      className="w-full rounded-2xl border border-line bg-canvas p-3 text-xs sm:text-sm text-ink placeholder-faint focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-all resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="relative mt-6 flex items-center justify-between border-t border-line pt-5">
            <div>
              {draftSavedFeedback && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-xs font-mono text-sage-deep font-semibold"
                >
                  <BookmarkCheck className="h-4 w-4" />
                  <span>Draft saved! Auto-launches Monday 00:00.</span>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-line px-5 py-2 text-xs font-mono uppercase tracking-wider text-muted transition-colors hover:bg-canvas hover:text-ink"
              >
                Cancel
              </button>

              {isNextWeekPlanning && !canPlanNextWeek ? (
                <button
                  type="button"
                  disabled
                  className="flex items-center gap-2 rounded-full bg-line px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-faint cursor-not-allowed"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Unlocks on Sunday</span>
                </button>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleApply}
                  className="flex items-center gap-2 rounded-full bg-sage-deep px-6 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-white shadow-calm transition-all hover:bg-sage hover:shadow-hover"
                >
                  {isNextWeekPlanning ? (
                    <>
                      <BookmarkCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Save Draft for Week {nextWeekNum}</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Save Week Setup</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


