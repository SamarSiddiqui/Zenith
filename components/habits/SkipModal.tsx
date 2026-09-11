"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Sparkles, ShieldCheck, Zap, ArrowRight, Check } from 'lucide-react';
import { skipReasons } from '../../data/zenith';
import type { Habit } from '../../types/zenith';

interface SkipModalProps {
  habit: Habit | null;
  dayIndex?: number;
  onClose: () => void;
  onLogMicroStep?: (habitId: string, dayIndex?: number) => void;
  onConfirmMiss?: (habitId: string, dayIndex?: number) => void;
}

export function SkipModal({
  habit,
  dayIndex = 3,
  onClose,
  onLogMicroStep,
  onConfirmMiss,
}: SkipModalProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>('tired');
  const [isLoggedMicro, setIsLoggedMicro] = useState(false);

  if (!habit) return null;

  const currentReason = skipReasons.find((r) => r.id === selectedReasonId) || skipReasons[0];

  const handleClose = () => {
    setSelectedReasonId('tired');
    setIsLoggedMicro(false);
    onClose();
  };

  const handleAcceptMicroStep = () => {
    if (onLogMicroStep && habit) {
      onLogMicroStep(habit.id, dayIndex);
      setIsLoggedMicro(true);
      setTimeout(() => {
        handleClose();
      }, 900);
    }
  };

  const handleSaveMissReason = () => {
    if (onConfirmMiss && habit) {
      onConfirmMiss(habit.id, dayIndex);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Mindful Friction Diagnostic"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-calm"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-5 top-5 rounded-full p-1.5 text-faint transition-colors hover:text-ink hover:bg-canvas"
        >
          <X className="h-4 w-4" strokeWidth={1.9} />
        </button>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sand/40 bg-sand/10 px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-sand mb-3">
          <Sparkles className="h-3 w-3" />
          <span>Zero-Guilt Diagnostic</span>
        </div>

        <h2 className="font-serif text-2xl leading-snug text-ink">
          What got in the way of <span className="text-sage-deep italic">{habit.name}</span> today?
        </h2>
        <p className="mt-1 text-xs text-muted font-light">
          Zenith uses this to diagnose schedule friction — never to penalize your streak.
        </p>

        {/* Friction Reason Pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          {skipReasons.map((reason) => {
            const isSelected = selectedReasonId === reason.id;
            return (
              <button
                key={reason.id}
                type="button"
                onClick={() => setSelectedReasonId(reason.id)}
                className={`rounded-2xl border px-3.5 py-2 text-xs transition-all ${
                  isSelected
                    ? 'border-sage bg-sage text-white shadow-xs font-medium'
                    : 'border-line bg-canvas text-muted hover:border-line/80 hover:text-ink'
                }`}
              >
                {reason.label}
              </button>
            );
          })}
        </div>

        {/* Behavioral Recommendation Box */}
        <div className="mt-5 rounded-2xl border border-sage/30 bg-sage-wash/60 p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-sage-deep shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-ink font-light">
              {currentReason.response}
            </p>
          </div>

          {/* 1-Click 5-Min Micro Step Offer */}
          <div className="rounded-xl border border-sage/40 bg-surface p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
            <div>
              <span className="block text-[10px] uppercase font-mono tracking-widest text-faint">
                Friction-Free Fallback
              </span>
              <span className="block text-xs font-semibold text-ink mt-0.5">
                {habit.microVersion || '5-minute micro action'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAcceptMicroStep}
              disabled={isLoggedMicro}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all shrink-0 ${
                isLoggedMicro
                  ? 'bg-sage text-white'
                  : 'bg-sage-deep text-white hover:bg-sage shadow-xs'
              }`}
            >
              {isLoggedMicro ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Logged! Health Preserved</span>
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>Log 5-Min Micro Version</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-line/60">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-2xl border border-line px-4 py-2 text-xs font-medium text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveMissReason}
            className="rounded-2xl border border-clay/40 bg-clay-wash px-5 py-2 text-xs font-medium text-clay hover:bg-clay hover:text-white transition-colors"
          >
            Mark as Missed
          </button>
        </div>
      </motion.div>
    </div>
  );
}
