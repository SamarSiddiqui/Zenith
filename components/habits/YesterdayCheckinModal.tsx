"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sunrise,
  Check,
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { Habit, HabitStatus } from '../../types/zenith';

interface YesterdayCheckinModalProps {
  isOpen: boolean;
  yesterdayLabel: string;
  unloggedHabits: Habit[];
  onResolve: (decisions: Record<string, 'completed' | 'missed'>) => Promise<void>;
  onClose: () => void;
}

export function YesterdayCheckinModal({
  isOpen,
  yesterdayLabel,
  unloggedHabits,
  onResolve,
  onClose,
}: YesterdayCheckinModalProps) {
  // State mapping habitId -> 'completed' | 'missed'
  const [decisions, setDecisions] = useState<Record<string, 'completed' | 'missed'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize decisions when unloggedHabits change
  useEffect(() => {
    if (unloggedHabits.length > 0) {
      const initial: Record<string, 'completed' | 'missed'> = {};
      unloggedHabits.forEach((h) => {
        initial[h.id] = 'completed'; // default friendly recommendation to completed or neutral
      });
      setDecisions(initial);
    }
  }, [unloggedHabits]);

  if (!isOpen || unloggedHabits.length === 0) return null;

  const handleSetAll = (status: 'completed' | 'missed') => {
    const updated: Record<string, 'completed' | 'missed'> = {};
    unloggedHabits.forEach((h) => {
      updated[h.id] = status;
    });
    setDecisions(updated);
  };

  const handleToggleHabit = (habitId: string, status: 'completed' | 'missed') => {
    setDecisions((prev) => ({
      ...prev,
      [habitId]: status,
    }));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onResolve(decisions);
      onClose();
    } catch (err) {
      console.error('Failed to submit yesterday decisions:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = Object.values(decisions).filter((d) => d === 'completed').length;
  const missedCount = Object.values(decisions).filter((d) => d === 'missed').length;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-2xl overflow-hidden"
        >
          {/* Header Glow Effect */}
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-start gap-3.5 mb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-xs">
              <Sunrise className="h-6 w-6 stroke-[1.75]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">
                <span>Morning Reconciliation</span>
                <span>·</span>
                <span>{yesterdayLabel}</span>
              </div>
              <h2 className="font-serif text-xl text-ink font-bold">
                How did yesterday go?
              </h2>
              <p className="text-xs text-muted mt-0.5 font-light">
                You had <strong>{unloggedHabits.length} ritual{unloggedHabits.length > 1 ? 's' : ''}</strong> left unlogged from yesterday. Catch up in 1 click:
              </p>
            </div>
          </div>

          {/* Quick Batch Actions */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl border border-line bg-canvas/80 mb-4 text-xs font-mono">
            <span className="text-faint text-[11px] pl-1 font-sans">Quick batch:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSetAll('completed')}
                className="inline-flex items-center gap-1 rounded-xl bg-sage-wash hover:bg-sage border border-sage/40 hover:text-white text-sage-deep px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Mark All Done</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetAll('missed')}
                className="inline-flex items-center gap-1 rounded-xl bg-clay-wash hover:bg-clay border border-clay/40 hover:text-white text-clay px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                <span>Mark All Missed</span>
              </button>
            </div>
          </div>

          {/* Individual Habit List */}
          <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 mb-6">
            {unloggedHabits.map((habit) => {
              const currentDecision = decisions[habit.id] || 'completed';
              const isDone = currentDecision === 'completed';
              const isMissed = currentDecision === 'missed';

              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-line bg-surface hover:border-sage/30 transition-all shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink truncate">
                        {habit.name}
                      </p>
                      <span className="rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[10px] font-mono text-muted capitalize">
                        {habit.circadianSlot || 'anytime'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-faint mt-0.5 font-mono">
                      <Clock className="h-3 w-3" />
                      <span>{habit.minutes} mins</span>
                      {habit.window && (
                        <>
                          <span>•</span>
                          <span>{habit.window}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 1-by-1 Toggle Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleHabit(habit.id, 'completed')}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                        isDone
                          ? 'bg-sage text-white shadow-xs'
                          : 'border border-line bg-canvas text-muted hover:border-sage/40 hover:text-ink'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      <span>Done</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleHabit(habit.id, 'missed')}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                        isMissed
                          ? 'bg-clay text-white shadow-xs'
                          : 'border border-line bg-canvas text-muted hover:border-clay/40 hover:text-ink'
                      }`}
                    >
                      <X className="h-3 w-3" />
                      <span>Missed</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono text-muted hover:text-ink transition-colors order-2 sm:order-1"
            >
              I&apos;ll check in later
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-sage hover:bg-sage-deep text-white px-5 py-2.5 text-xs font-semibold shadow-calm transition-colors order-1 sm:order-2 disabled:opacity-50"
            >
              <span>Save &amp; Start Today ({completedCount} Done, {missedCount} Missed)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
