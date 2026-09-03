"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Ambient hairline rings behind the hero — an enso motif drawn in line art,
 * rotating slowly and continuously.
 */
export function EnsoBackdrop() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -right-40 -top-32 h-[640px] w-[640px] opacity-70 lg:-right-24">
        <motion.svg
          viewBox="0 0 400 400"
          className="h-full w-full"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={{ duration: 160, ease: 'linear', repeat: Infinity }}
        >
          <circle cx="200" cy="200" r="196" fill="none" stroke="var(--color-line)" strokeWidth="1" />
          <circle
            cx="200"
            cy="200"
            r="152"
            fill="none"
            stroke="var(--color-sage)"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="2 10"
          />
          <circle cx="200" cy="200" r="112" fill="none" stroke="var(--color-line)" strokeWidth="1" />
        </motion.svg>
      </div>

      <div className="absolute -left-32 bottom-0 h-[420px] w-[420px] opacity-60">
        <motion.svg
          viewBox="0 0 400 400"
          className="h-full w-full"
          animate={reduced ? undefined : { rotate: -360 }}
          transition={{ duration: 220, ease: 'linear', repeat: Infinity }}
        >
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="1"
            strokeDasharray="3 14"
          />
          <circle cx="200" cy="200" r="130" fill="none" stroke="var(--color-line)" strokeWidth="1" />
        </motion.svg>
      </div>
    </div>
  );
}
