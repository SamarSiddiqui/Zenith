"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle2, Clock, RotateCcw, Sparkles } from 'lucide-react';

export function ChapterMicroFallback() {
  const [isShrunk, setIsShrunk] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Gently demonstrate the shrink transition after mount if user hasn't tapped yet
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsShrunk(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const handleToggle = () => {
    setHasInteracted(true);
    setIsShrunk((prev) => !prev);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-canvas/75 p-4 sm:p-5 space-y-4">
        {/* Simulated Energy Context */}
        <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
          <span className="text-muted">Scenario: Exhausted Evening</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-colors ${
              isShrunk
                ? 'border-sage/35 bg-sage-wash text-sage-deep'
                : 'border-clay/30 bg-clay-wash text-clay'
            }`}
          >
            {isShrunk ? 'Momentum Protected' : 'High Friction'}
          </span>
        </div>

        {/* Morphing Ritual Card */}
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className={`rounded-2xl border p-4 shadow-xs transition-colors duration-300 ${
            isShrunk
              ? 'border-sage bg-sage-wash/60'
              : 'border-line bg-surface'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <motion.span
                  layout="position"
                  className="text-sm sm:text-base font-semibold text-ink"
                >
                  {isShrunk ? 'Write 1 Paragraph Outline' : 'Deep Writing Session'}
                </motion.span>
                <motion.span
                  layout
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold ${
                    isShrunk
                      ? 'bg-sage-deep text-white'
                      : 'bg-canvas text-muted border border-line'
                  }`}
                >
                  <Clock className="h-2.5 w-2.5" />
                  <span>{isShrunk ? '5 mins' : '45 mins'}</span>
                </motion.span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={isShrunk ? 'micro' : 'full'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-muted leading-relaxed"
                >
                  {isShrunk
                    ? 'Micro-fallback activated. Easy enough to finish right now—your streak and health stay intact.'
                    : 'Too tired for a full 45-minute block? Do not skip—tap to shrink it.'}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Interactive Action Pill */}
            <div className="shrink-0 self-start sm:self-center">
              <AnimatePresence mode="wait">
                {isShrunk ? (
                  <motion.div
                    key="done-pill"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-surface border border-sage/40 px-3 py-2 text-xs font-mono font-semibold text-sage-deep shadow-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 text-sage-deep" />
                    <span>Saved · +2% Health</span>
                  </motion.div>
                ) : (
                  <motion.button
                    key="shrink-btn"
                    type="button"
                    onClick={handleToggle}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-mono font-medium text-white shadow-xs hover:bg-ink/85 transition-colors cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5 fill-current text-amber-400" />
                    <span>Shrink to 5m</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Visual Effort Comparison Bar */}
          <div className="mt-4 pt-3 border-t border-line/60 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted">
              <span>Activation Effort Required</span>
              <span className="font-semibold text-ink">
                {isShrunk ? '11% (Effortless)' : '100% (Overwhelming)'}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-canvas border border-line/60">
              <motion.div
                className={`h-full rounded-full ${isShrunk ? 'bg-sage-deep' : 'bg-clay/80'}`}
                initial={false}
                animate={{ width: isShrunk ? '14%' : '100%' }}
                transition={{ type: 'spring', stiffness: 160, damping: 22 }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Replay / Toggle Button */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={handleToggle}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-1.5 text-[11px] font-mono text-muted hover:border-sage/50 hover:text-sage-deep transition-colors cursor-pointer shadow-xs"
        >
          {isShrunk ? (
            <>
              <RotateCcw className="h-3 w-3" />
              <span>Restore 45m Full Ritual</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 text-sage-deep" />
              <span>Try Shrinking to 5 Minutes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

