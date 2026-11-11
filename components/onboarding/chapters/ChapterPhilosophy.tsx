"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ShieldCheck, RotateCcw, Sparkles } from 'lucide-react';

interface ChapterPhilosophyProps {
  firstName?: string;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ChapterPhilosophy({ firstName }: ChapterPhilosophyProps) {
  const [missDaySimulated, setMissDaySimulated] = useState(false);

  // Gently auto-demonstrate a missed day after initial mount so users see the contrast effortlessly
  useEffect(() => {
    const timer = setTimeout(() => {
      setMissDaySimulated(true);
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-4">
      {firstName && (
        <p className="text-xs font-mono text-sage-deep">
          Welcome, {firstName} — here is how Zenith thinks differently.
        </p>
      )}

      {/* Side-by-side (desktop) / Stacked (mobile) Animated Contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card A: Traditional Apps */}
        <div className="rounded-2xl border border-line bg-canvas/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
              Traditional Apps
            </span>
            <motion.span
              key={missDaySimulated ? 'broken' : 'intact'}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${
                missDaySimulated
                  ? 'bg-clay-wash text-clay border border-clay/30'
                  : 'bg-surface text-muted border border-line'
              }`}
            >
              <Flame className="h-3 w-3" />
              <span>{missDaySimulated ? '0d Reset!' : '5d Streak'}</span>
            </motion.span>
          </div>

          {/* 7-day chain */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {DAY_LABELS.map((label, idx) => {
              const isMissed = missDaySimulated && idx === 5;
              const isLostFuture = missDaySimulated && idx === 6;
              const isActive = idx < 5;

              return (
                <motion.div
                  key={idx}
                  animate={
                    isMissed
                      ? { x: [0, -3, 3, -2, 2, 0], scale: [1, 0.92, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.45 }}
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border text-[10px] font-mono font-bold transition-colors duration-300 ${
                    isMissed
                      ? 'border-clay bg-clay text-white shadow-xs'
                      : isLostFuture
                        ? 'border-dashed border-line bg-surface/40 text-faint'
                        : isActive
                          ? missDaySimulated
                            ? 'border-line bg-surface text-faint line-through opacity-60'
                            : 'border-ink/20 bg-surface text-ink'
                          : 'border-line bg-surface/50 text-faint'
                  }`}
                >
                  {isMissed ? '✕' : label}
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={missDaySimulated ? 'guilt' : 'fragile'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-[11px] text-muted leading-snug min-h-[2.2rem]"
            >
              {missDaySimulated
                ? 'One busy Saturday wipes out your entire week. Zeroed out.'
                : 'Five strong days built... one miss away from breaking.'}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Card B: Zenith Momentum */}
        <div className="rounded-2xl border border-sage/40 bg-sage-wash/45 p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-sage-deep">
              Zenith Momentum
            </span>
            <motion.span
              key={missDaySimulated ? 'protected' : 'steady'}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-mono font-bold text-sage-deep border border-sage/30 shadow-xs"
            >
              <ShieldCheck className="h-3 w-3" />
              <span>{missDaySimulated ? '84% Health' : '92% Health'}</span>
            </motion.span>
          </div>

          {/* 7-day calm wave nodes */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {DAY_LABELS.map((label, idx) => {
              const isPaused = missDaySimulated && idx === 5;
              const isRecovered = missDaySimulated && idx === 6;
              const isActive = idx < 5;

              return (
                <motion.div
                  key={idx}
                  initial={false}
                  animate={{
                    y: isPaused ? 3 : isRecovered ? -2 : 0,
                    scale: isRecovered ? [1, 1.12, 1] : 1,
                  }}
                  transition={{ duration: 0.45, delay: isRecovered ? 0.15 : 0 }}
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl border text-[10px] font-mono font-bold transition-colors duration-300 ${
                    isPaused
                      ? 'border-amber-500/40 bg-amber-500/15 text-amber-700'
                      : isRecovered
                        ? 'border-sage-deep bg-sage-deep text-white shadow-xs'
                        : isActive
                          ? 'border-sage/50 bg-surface text-sage-deep'
                          : 'border-sage/30 bg-surface/60 text-sage-deep/70'
                  }`}
                >
                  {isPaused ? '~' : isRecovered ? '✓' : label}
                </motion.div>
              );
            })}
          </div>

          {/* Animated Wave Path Indicator */}
          <svg
            viewBox="0 0 260 28"
            className="w-full h-5 overflow-visible"
            aria-hidden="true"
          >
            <motion.path
              d={
                missDaySimulated
                  ? 'M 6 12 Q 48 6, 90 10 T 175 10 Q 202 22, 222 18 T 254 8'
                  : 'M 6 14 Q 55 8, 105 12 T 205 10 T 254 10'
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-sage-deep"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
            />
          </svg>

          <AnimatePresence mode="wait">
            <motion.p
              key={missDaySimulated ? 'resilient' : 'calm'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="text-[11px] text-ink/80 leading-snug min-h-[2.2rem]"
            >
              {missDaySimulated
                ? 'Saturday is absorbed gently. Sunday bounces right back—no reset.'
                : 'Recent weight matters most. Momentum bends smoothly instead of snapping.'}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Interactive Toggle Control */}
      <div className="flex items-center justify-center pt-1">
        <button
          type="button"
          onClick={() => setMissDaySimulated((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-1.5 text-[11px] font-mono text-muted hover:border-sage/50 hover:text-sage-deep transition-colors cursor-pointer shadow-xs"
        >
          {missDaySimulated ? (
            <>
              <RotateCcw className="h-3 w-3" />
              <span>Reset Week Preview</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 text-sage-deep" />
              <span>Simulate a Missed Saturday</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

