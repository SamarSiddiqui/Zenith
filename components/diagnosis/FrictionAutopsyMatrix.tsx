"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Zap, Check, ArrowRight, Sun, Sunset, Moon } from 'lucide-react';
import type { ScheduleCollision, FrictionSeverity, CircadianSlot } from '../../types/diagnosis';

interface FrictionAutopsyMatrixProps {
  collisions: ScheduleCollision[];
  zoneFriction: {
    morning: FrictionSeverity;
    afternoon: FrictionSeverity;
    evening: FrictionSeverity;
  };
  overallVerdict?: string;
  appliedActions?: Record<string, boolean>;
  onApplySlot?: (habitId: string, newSlot: CircadianSlot) => void;
  onApplyDuration?: (habitId: string, newMinutes: number) => void;
}

export function FrictionAutopsyMatrix({
  collisions = [],
  zoneFriction,
  overallVerdict,
  appliedActions = {},
  onApplySlot,
  onApplyDuration,
}: FrictionAutopsyMatrixProps) {
  const getSeverityBadge = (sev: FrictionSeverity) => {
    switch (sev) {
      case 'high':
        return 'border-clay/40 bg-clay-wash text-clay font-bold';
      case 'moderate':
        return 'border-sand/40 bg-sand/15 text-sand font-semibold';
      case 'low':
      default:
        return 'border-sage/40 bg-sage-wash text-sage-deep font-semibold';
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-calm">
      {/* Header & Circadian Heat Map */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-line/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />
              Root-Cause Analysis
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-ink mt-0.5">
            Schedule vs. Willpower Autopsy
          </h3>
          <p className="text-xs sm:text-sm text-muted font-light mt-1 max-w-xl">
            {overallVerdict ||
              'Zenith proves that habit friction stems from schedule compression and time overruns, not personal discipline.'}
          </p>
        </div>

        {/* Circadian Energy Slots Heat Pills */}
        <div className="flex items-center gap-2 bg-canvas p-2 rounded-2xl border border-line shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-muted text-[11px]">Morning</span>
            <span className={`text-[10px] rounded-md px-1.5 py-0.5 uppercase border ${getSeverityBadge(zoneFriction.morning)}`}>
              {zoneFriction.morning}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border-x border-line/60">
            <Sunset className="h-3.5 w-3.5 text-sky-500" />
            <span className="text-muted text-[11px]">Afternoon</span>
            <span className={`text-[10px] rounded-md px-1.5 py-0.5 uppercase border ${getSeverityBadge(zoneFriction.afternoon)}`}>
              {zoneFriction.afternoon}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono">
            <Moon className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-muted text-[11px]">Evening</span>
            <span className={`text-[10px] rounded-md px-1.5 py-0.5 uppercase border ${getSeverityBadge(zoneFriction.evening)}`}>
              {zoneFriction.evening}
            </span>
          </div>
        </div>
      </div>

      {/* Collision Cards Grid */}
      {collisions.length === 0 ? (
        <div className="py-8 text-center text-muted font-light">
          <p className="text-sm text-ink font-serif">No schedule collisions detected in this sprint horizon.</p>
          <p className="text-xs font-mono text-muted mt-1">Your habits are flowing in harmony with your working window.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {collisions.map((collision, idx) => {
            const actionKey = `slot_${collision.habitId}_${collision.suggestedAction.newSlot}`;
            const isApplied = appliedActions[actionKey] || appliedActions[`duration_${collision.habitId}_${collision.suggestedAction.newMinutes}`];

            return (
              <motion.div
                key={collision.habitId || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="flex flex-col justify-between rounded-2xl border border-line bg-canvas/60 p-5 shadow-xs hover:border-sage/40 transition-colors"
              >
                <div>
                  {/* Top Collision Metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-ink font-serif">
                      {collision.habitName}
                    </span>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
                      {collision.confidencePercent}% Confidence
                    </span>
                  </div>

                  <h4 className="mt-1 text-xs font-mono font-bold text-ink">
                    {collision.title}
                  </h4>

                  <p className="mt-1.5 text-xs text-muted font-light leading-relaxed">
                    {collision.description}
                  </p>

                  {collision.evidence && (
                    <div className="mt-2.5 rounded-xl border border-line/60 bg-surface/80 px-3 py-2 text-[11px] font-mono text-faint">
                      <span className="font-semibold text-muted">Evidence: </span>
                      <span>{collision.evidence}</span>
                    </div>
                  )}
                </div>

                {/* 1-Click Action Resolution Button */}
                {collision.suggestedAction && (
                  <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-muted">
                      AI Recommendation:
                    </span>

                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 rounded-xl border border-sage/40 bg-sage-wash px-3 py-1.5 text-xs font-mono font-bold text-sage-deep">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (collision.suggestedAction.actionType === 'reschedule_slot' && collision.suggestedAction.newSlot) {
                            onApplySlot?.(collision.habitId, collision.suggestedAction.newSlot);
                          } else if (collision.suggestedAction.newMinutes) {
                            onApplyDuration?.(collision.habitId, collision.suggestedAction.newMinutes);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-sage px-3 py-1.5 text-xs font-mono font-semibold text-white shadow-xs hover:bg-sage-deep transition-all cursor-pointer"
                      >
                        <span>{collision.suggestedAction.label || 'Apply Optimization'}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
