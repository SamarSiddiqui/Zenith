"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Compass,
  Sparkles,
  Calendar,
  Clock,
  Check,
  ChevronRight,
  RotateCcw,
  Zap,
} from 'lucide-react';
import type { SprintConfig } from '../../types/sprint';
import { getSprintDateRangeLabel } from '../../lib/utils/sprintDate';

interface SprintSettingsModalProps {
  isOpen: boolean;
  currentConfig: SprintConfig;
  sprintNumber: number;
  onClose: () => void;
  onUpdateDuration: (days: number) => void;
  onUpdateGoal: (goal: string) => void;
  onStartFreshSprint: (customDuration?: number, customGoal?: string) => void;
}

const PRESET_DURATIONS = [
  { days: 3, label: '3 Days', badge: 'Micro Sprint', desc: 'Low-friction weekend or recovery restart' },
  { days: 5, label: '5 Days', badge: 'Workweek', desc: 'Focused Monday-Friday momentum rhythm' },
  { days: 7, label: '7 Days', badge: 'Standard', desc: 'Full weekly circadian grounding cycle' },
  { days: 10, label: '10 Days', badge: 'Extended', desc: 'Deeper habit lock-in & sustained focus' },
  { days: 14, label: '14 Days', badge: 'Bi-Weekly', desc: 'Two-week structured transformation' },
  { days: 15, label: '15 Days', badge: 'Max Horizon', desc: 'Maximum allowable sprint horizon' },
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
  const [selectedDays, setSelectedDays] = useState<number>(currentConfig.durationDays || 7);
  const [goal, setGoal] = useState<string>(
    currentConfig.sprintGoal || 'Ground daily circadian rituals and sustain steady momentum'
  );
  const [isFreshLaunch, setIsFreshLaunch] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedDays(currentConfig.durationDays || 7);
      setGoal(
        currentConfig.sprintGoal || 'Ground daily circadian rituals and sustain steady momentum'
      );
      setIsFreshLaunch(false);
    }
  }, [isOpen, currentConfig]);

  const dateSpanPreview = useMemo(() => {
    return getSprintDateRangeLabel(currentConfig.startDate, selectedDays);
  }, [currentConfig.startDate, selectedDays]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (isFreshLaunch) {
      onStartFreshSprint(selectedDays, goal);
    } else {
      if (selectedDays !== currentConfig.durationDays) {
        onUpdateDuration(selectedDays);
      }
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
          className="relative w-full max-w-xl rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-floating"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-line pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sage-wash text-sage-deep">
                  <Compass className="h-4 w-4" />
                </span>
                <span className="font-mono text-xs uppercase tracking-widest text-muted">
                  Sprint Configuration
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-serif text-ink">
                Sprint Horizon {sprintNumber}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Configure your dynamic sprint horizon (1 to 15 days) and focus intent.
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
          <div className="mt-6 space-y-6">
            {/* Dynamic Days Slider & Stepper */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-muted">
                  Sprint Duration (1 – 15 Days)
                </label>
                <span className="rounded-full border border-sage/40 bg-sage-wash px-3 py-0.5 text-xs font-mono font-bold text-sage-deep">
                  {selectedDays} {selectedDays === 1 ? 'Day' : 'Days'}
                </span>
              </div>

              {/* Range Slider */}
              <div className="mt-3 space-y-2">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(parseInt(e.target.value, 10))}
                  className="w-full accent-sage h-2 rounded-lg bg-line appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-faint px-1">
                  <span>1 Day</span>
                  <span>5 Days</span>
                  <span>10 Days</span>
                  <span>15 Days (Max)</span>
                </div>
              </div>

              {/* Quick Preset Badges */}
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_DURATIONS.map((preset) => {
                  const isSelected = selectedDays === preset.days;
                  return (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => setSelectedDays(preset.days)}
                      className={`flex flex-col items-center rounded-xl border p-2 text-center transition-all ${
                        isSelected
                          ? 'border-sage bg-sage-wash text-sage-deep shadow-xs'
                          : 'border-line bg-canvas/60 text-muted hover:border-line-hover hover:text-ink'
                      }`}
                    >
                      <span className="text-xs font-mono font-bold">{preset.label}</span>
                      <span className="text-[9px] text-faint truncate max-w-full">
                        {preset.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Span Live Preview */}
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas/70 p-4">
              <Calendar className="h-5 w-5 text-sage-deep shrink-0" />
              <div>
                <span className="block text-xs font-mono uppercase tracking-wider text-faint">
                  Horizon Window
                </span>
                <span className="text-sm font-semibold text-ink">
                  {dateSpanPreview}
                </span>
              </div>
            </div>

            {/* Sprint Goal / Primary Focus */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-muted">
                Sprint Focus & Intent
              </label>
              <textarea
                rows={2}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Anchor morning deep work block and establish restorative evening wind-down..."
                className="mt-2 w-full rounded-2xl border border-line bg-canvas p-3.5 text-sm text-ink placeholder-faint focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
              />
            </div>

            {/* Launch Mode Selector */}
            <div className="flex items-center justify-between rounded-2xl border border-line/60 bg-canvas/40 p-3.5">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="h-4 w-4 text-muted" />
                <span className="text-xs font-mono text-muted">
                  Start as brand new sprint cycle
                </span>
              </div>
              <input
                type="checkbox"
                checked={isFreshLaunch}
                onChange={(e) => setIsFreshLaunch(e.target.checked)}
                className="h-4 w-4 accent-sage rounded border-line cursor-pointer"
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
              <span>{isFreshLaunch ? 'Launch New Horizon' : 'Save Horizon'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
