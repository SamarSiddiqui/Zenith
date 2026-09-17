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
} from 'lucide-react';
import type { SprintConfig } from '../../types/sprint';
import {
  getSprintDateRangeLabel,
  getWeekNumber,
  getMondayOfWeek,
} from '../../lib/utils/sprintDate';

interface SprintSettingsModalProps {
  isOpen: boolean;
  currentConfig: SprintConfig;
  sprintNumber: number;
  onClose: () => void;
  onUpdateDuration: (days: number) => void;
  onUpdateGoal: (goal: string) => void;
  onStartFreshSprint: (customDuration?: number, customGoal?: string) => void;
}

const TARGET_PRESETS = [
  { target: '85%', label: 'Standard Circadian (85%)', desc: 'Sustainable, high-retention rhythm for typical weeks' },
  { target: '95%', label: 'Peak Flow (95%)', desc: 'Deep focus immersion for breakthrough progress' },
  { target: '75%', label: 'Gentle Restart (75%)', desc: 'Low-friction recovery for high-stress travel weeks' },
];

export function SprintSettingsModal({
  isOpen,
  currentConfig,
  sprintNumber,
  onClose,
  onUpdateDuration,
  onUpdateGoal,
  onStartFreshSprint,
}: SprintSettingsModalProps) {
  const [goal, setGoal] = useState<string>(
    currentConfig.sprintGoal || 'Ground daily circadian rituals and sustain steady momentum'
  );
  const [isNextWeekPlanning, setIsNextWeekPlanning] = useState<boolean>(false);

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
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (isNextWeekPlanning) {
      onStartFreshSprint(7, goal);
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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-floating"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-line pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage-wash text-sage-deep">
                  <Compass className="h-4 w-4" />
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  Weekly Sprint Horizon
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-serif text-ink">
                Week {activeWeekNum} Setup
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted">
                {isNextWeekPlanning
                  ? `Prime and configure your target focus for upcoming Week ${nextWeekNum}.`
                  : `Configure your active targets and focus intent for Week ${currentWeekNum}.`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="mt-6 space-y-5">
            {/* Horizon Mode Toggle: Current Week vs Next Week */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-canvas p-1.5">
              <button
                type="button"
                onClick={() => setIsNextWeekPlanning(false)}
                className={`rounded-xl py-2 px-3 text-xs font-mono font-medium transition-all ${
                  !isNextWeekPlanning
                    ? 'bg-surface text-ink shadow-xs border border-line'
                    : 'text-muted hover:text-ink'
                }`}
              >
                Current (Week {currentWeekNum})
              </button>
              <button
                type="button"
                onClick={() => setIsNextWeekPlanning(true)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-mono font-medium transition-all ${
                  isNextWeekPlanning
                    ? 'bg-sage text-white shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <span>Plan Week {nextWeekNum}</span>
                <Sparkles className="h-3 w-3" />
              </button>
            </div>

            {/* Date Span Live Preview */}
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas/70 p-4">
              <Calendar className="h-5 w-5 text-sage-deep shrink-0" />
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-faint">
                  {isNextWeekPlanning ? 'Upcoming Calendar Horizon' : 'Active Calendar Horizon'}
                </span>
                <span className="text-sm font-semibold text-ink font-mono">
                  {activeDateLabel}
                </span>
              </div>
            </div>

            {/* Target Consistency Presets */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted mb-2">
                Weekly Target Consistency
              </label>
              <div className="grid gap-2">
                {TARGET_PRESETS.map((preset) => {
                  const isSelected = goal.includes(preset.target);
                  return (
                    <button
                      key={preset.target}
                      type="button"
                      onClick={() =>
                        setGoal(`Target ${preset.target} Show-Up: ${preset.desc}`)
                      }
                      className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-sage bg-sage-wash/40 shadow-xs'
                          : 'border-line bg-canvas/60 hover:border-sage/40 hover:bg-canvas'
                      }`}
                    >
                      <Target className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? 'text-sage-deep' : 'text-muted'}`} />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-mono font-semibold text-ink block">
                          {preset.label}
                        </span>
                        <span className="text-[11px] text-muted leading-tight block mt-0.5">
                          {preset.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sprint Goal / Primary Focus */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted">
                Weekly Focus & Intent
              </label>
              <textarea
                rows={2}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Anchor morning deep work block and establish restorative evening wind-down..."
                className="mt-2 w-full rounded-2xl border border-line bg-canvas p-3.5 text-xs sm:text-sm text-ink placeholder-faint focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-line pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-5 py-2 text-xs font-mono uppercase tracking-wider text-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 rounded-full bg-sage-deep px-6 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-white shadow-calm transition-all hover:bg-sage hover:shadow-hover"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{isNextWeekPlanning ? `Launch Week ${nextWeekNum}` : 'Save Week Setup'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
