"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Minimize2, Clock } from 'lucide-react';

export function RiskBanner() {
  const [resolution, setResolution] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.section
      layout
      aria-label="Zenith risk alert"
      className="rounded-3xl border border-clay/35 bg-clay-wash p-6 sm:p-7"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex gap-4">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay/15 text-clay">
          <AlertTriangle className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.16em] text-clay">Zenith noticed</p>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink">
            Your <span className="font-medium">Reading</span> habit is at risk — 2 skips this week.
            You usually complete this at 8:30 PM, but your workday ran late.
          </p>

          <AnimatePresence mode="wait">
            {resolution ? (
              <motion.p
                key="resolved"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mt-4 rounded-2xl border border-sage/40 bg-sage-wash px-4 py-3 text-sm text-ink"
              >
                {resolution}
              </motion.p>
            ) : (
              <motion.div
                key="actions"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="mt-5 flex flex-wrap gap-2"
              >
                <button
                  type="button"
                  onClick={() =>
                    setResolution('Reading is now a 5-minute session tonight. Health protected.')
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-ink/85"
                >
                  <Minimize2 className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                  Shrink to 5 mins
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setResolution('Moved to 7:15 AM tomorrow, inside your free morning window.')
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-canvas"
                >
                  <Clock className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                  Reschedule for tomorrow morning
                </button>
                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="rounded-full px-4 py-2.5 text-sm text-muted transition-colors duration-150 ease-out hover:text-ink"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}
