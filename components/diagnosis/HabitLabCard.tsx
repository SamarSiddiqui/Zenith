"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, ShieldCheck, Check, Sparkles, ArrowRight } from 'lucide-react';
import type { HabitOptimization, CircadianSlot } from '../../types/diagnosis';

interface HabitLabCardProps {
  optimizations: HabitOptimization[];
  appliedActions?: Record<string, boolean>;
  onApplySlot?: (habitId: string, newSlot: CircadianSlot) => void;
  onApplyMicro?: (habitId: string, microStep: string) => void;
  onApplyDuration?: (habitId: string, minutes: number) => void;
}

export function HabitLabCard({
  optimizations = [],
  appliedActions = {},
  onApplySlot,
  onApplyMicro,
  onApplyDuration,
}: HabitLabCardProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-calm">
      {/* Header */}
      <div className="border-b border-line/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sage-deep flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            AI Calibration Lab
          </span>
        </div>
        <h3 className="font-serif text-2xl font-bold text-ink mt-0.5">
          Gemini Habit Laboratory & Identity Scaler
        </h3>
        <p className="text-xs sm:text-sm text-muted font-light mt-1">
          Scale rituals into flexible 3-tier horizons to protect your identity momentum on both peak and crunch days.
        </p>
      </div>

      {/* Optimizations List */}
      <div className="space-y-6">
        {optimizations.map((opt, idx) => {
          const slotKey = `slot_${opt.habitId}_${opt.recommendedSlot}`;
          const isSlotApplied = appliedActions[slotKey] || opt.isSlotOptimal;
          const isMicroApplied = appliedActions[`micro_${opt.habitId}`];

          return (
            <motion.div
              key={opt.habitId || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
              className="rounded-2xl border border-line bg-canvas/60 p-5 space-y-4 shadow-xs"
            >
              {/* Top Row: Habit Name & Slot Alignment */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-ink">
                    {opt.habitName}
                  </h4>
                  <p className="text-xs text-muted font-light mt-0.5">
                    {opt.reasoning}
                  </p>
                </div>

                {/* Slot Adjustment Pill */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-faint">
                    Slot: <span className="uppercase text-muted">{opt.currentSlot}</span>
                  </span>

                  {!opt.isSlotOptimal && (
                    <>
                      <ArrowRight className="h-3 w-3 text-sage-deep" />
                      {isSlotApplied ? (
                        <span className="inline-flex items-center gap-1 rounded-xl border border-sage/40 bg-sage-wash px-2.5 py-1 text-xs font-mono font-bold text-sage-deep">
                          <Check className="h-3 w-3 stroke-[2.5]" />
                          <span>{opt.recommendedSlot}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onApplySlot?.(opt.habitId, opt.recommendedSlot)}
                          className="inline-flex items-center gap-1 rounded-xl bg-sage px-2.5 py-1 text-xs font-mono font-semibold text-white shadow-xs hover:bg-sage-deep transition-all cursor-pointer"
                        >
                          <span>Move to {opt.recommendedSlot}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 3-Tier Horizon Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Tier 1: Gold Horizon */}
                <div className="rounded-xl border border-line bg-surface p-3.5 space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 uppercase">
                      <Award className="h-3.5 w-3.5" />
                      Gold (Full)
                    </span>
                    <span className="text-xs font-mono font-bold text-ink">
                      {opt.tieredVersions?.gold?.durationMins || 30}m
                    </span>
                  </div>
                  <p className="text-xs text-muted font-light leading-snug">
                    {opt.tieredVersions?.gold?.description || 'Full intended ritual routine.'}
                  </p>
                </div>

                {/* Tier 2: Silver Flow */}
                <div className="rounded-xl border border-line bg-surface p-3.5 space-y-1.5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-sky-600 dark:text-sky-400 uppercase">
                        <Zap className="h-3.5 w-3.5" />
                        Silver (Flow)
                      </span>
                      <span className="text-xs font-mono font-bold text-ink">
                        {opt.tieredVersions?.silver?.durationMins || 15}m
                      </span>
                    </div>
                    <p className="text-xs text-muted font-light leading-snug mt-1">
                      {opt.tieredVersions?.silver?.description || 'Compressed routine during standard busy days.'}
                    </p>
                  </div>

                  <div className="pt-2">
                    {appliedActions[`duration_${opt.habitId}_${opt.tieredVersions?.silver?.durationMins}`] ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-sage-deep font-bold">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                        <span>Active Target</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onApplyDuration?.(opt.habitId, opt.tieredVersions?.silver?.durationMins || 15)
                        }
                        className="text-[11px] font-mono text-sage-deep hover:text-ink font-semibold transition-colors cursor-pointer"
                      >
                        Set as Target ({opt.tieredVersions?.silver?.durationMins}m) →
                      </button>
                    )}
                  </div>
                </div>

                {/* Tier 3: Bronze Micro-Fallback */}
                <div className="rounded-xl border border-sage/30 bg-sage-wash/40 p-3.5 space-y-1.5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-sage-deep uppercase">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Bronze (Micro)
                      </span>
                      <span className="text-xs font-mono font-bold text-sage-deep">
                        {opt.tieredVersions?.bronzeMicro?.durationMins || 3}m
                      </span>
                    </div>
                    <p className="text-xs text-ink font-medium leading-snug mt-1">
                      {opt.tieredVersions?.bronzeMicro?.description || '2-5 minute zero-guilt identity anchor.'}
                    </p>
                  </div>

                  <div className="pt-2">
                    {isMicroApplied ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-sage-deep font-bold">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                        <span>Saved as Micro-Step</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onApplyMicro?.(
                            opt.habitId,
                            opt.tieredVersions?.bronzeMicro?.description || '3-min micro-step'
                          )
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-sage-deep hover:text-ink transition-colors cursor-pointer"
                      >
                        <span>Save as Fallback</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Identity Motive Statement */}
              {opt.identityMotiveUpgrade && (
                <div className="rounded-xl border border-line/60 bg-surface/80 px-3.5 py-2 text-xs font-mono text-muted flex items-center gap-2">
                  <span className="text-sage-deep font-bold shrink-0">Identity Anchor:</span>
                  <span className="italic text-ink font-serif text-sm">&ldquo;{opt.identityMotiveUpgrade}&rdquo;</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
