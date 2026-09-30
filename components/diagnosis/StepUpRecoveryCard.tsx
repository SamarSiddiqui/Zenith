"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Flame, Check, ArrowRight, Sparkles } from 'lucide-react';
import type { RecoveryProtocol } from '../../types/diagnosis';

interface StepUpRecoveryCardProps {
  protocols: RecoveryProtocol[];
  appliedActions?: Record<string, boolean>;
  onApplyProtocol?: (habitId: string, protocol: RecoveryProtocol) => void;
}

export function StepUpRecoveryCard({
  protocols = [],
  appliedActions = {},
  onApplyProtocol,
}: StepUpRecoveryCardProps) {
  if (protocols.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-calm">
      {/* Header */}
      <div className="border-b border-line/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sage-deep flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            Adaptive Momentum Restorer
          </span>
        </div>
        <h3 className="font-serif text-2xl font-bold text-ink mt-0.5">
          3-Day Step-Up Recovery Protocol
        </h3>
        <p className="text-xs sm:text-sm text-muted font-light mt-1">
          When life causes a friction dip, this 3-day guided ramp-up rebuilds self-trust and momentum with zero willpower exhaustion.
        </p>
      </div>

      {/* Protocols List */}
      <div className="space-y-6">
        {protocols.map((proto, idx) => {
          const actionKey = `recovery_${proto.habitId}`;
          const isApplied = appliedActions[actionKey];

          return (
            <motion.div
              key={proto.habitId || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="rounded-2xl border border-sage/30 bg-canvas/60 p-5 space-y-4 shadow-xs"
            >
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-lg font-bold text-ink">
                      {proto.habitName}
                    </h4>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold uppercase">
                      Momentum Dip
                    </span>
                  </div>
                  <p className="text-xs text-muted font-light mt-0.5">
                    {proto.triggerReason}
                  </p>
                </div>

                {isApplied ? (
                  <span className="inline-flex items-center gap-1 self-start sm:self-center rounded-xl border border-sage/40 bg-sage-wash px-3.5 py-1.5 text-xs font-mono font-bold text-sage-deep">
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    <span>Protocol Active</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onApplyProtocol?.(proto.habitId, proto)}
                    className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl bg-sage px-3.5 py-1.5 text-xs font-mono font-semibold text-white shadow-xs hover:bg-sage-deep transition-all cursor-pointer shrink-0"
                  >
                    <span>Apply 3-Day Protocol</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* 3-Step Visual Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {proto.steps.map((step) => (
                  <div
                    key={step.dayNumber}
                    className={`rounded-xl border p-4 space-y-2 shadow-xs transition-colors ${
                      step.dayNumber === 1
                        ? 'border-sage/40 bg-sage-wash/60'
                        : step.dayNumber === 2
                        ? 'border-line bg-surface'
                        : 'border-line bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-wider text-sage-deep">
                        Day {step.dayNumber} · {step.stepName}
                      </span>
                      <span className="rounded-md border border-line bg-canvas px-2 py-0.5 text-[10px] font-mono font-bold text-ink">
                        {step.targetMinutes}m
                      </span>
                    </div>

                    <p className="text-xs text-ink font-medium leading-snug">
                      {step.actionPrompt}
                    </p>

                    <p className="text-[11px] text-muted font-light leading-snug italic border-t border-line/50 pt-2">
                      &ldquo;{step.mindsetGrounding}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
