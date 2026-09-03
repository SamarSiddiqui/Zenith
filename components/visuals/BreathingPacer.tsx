"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** Continuous 8-second breathing pacer for the active recovery session. */
export function BreathingPacer({ size = 88 }: { size?: number }) {
  const reduced = useReducedMotion();

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {[0, 1].map((ring) => (
        <motion.span
          key={ring}
          className="absolute rounded-full border border-sage/40"
          style={{ width: size, height: size }}
          animate={reduced ? undefined : { scale: [0.72, 1, 0.72], opacity: [0.35, 0.85, 0.35] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: ring * 1.4
          }}
        />
      ))}
      <motion.span
        className="rounded-full bg-sage"
        style={{ width: size * 0.34, height: size * 0.34 }}
        animate={reduced ? undefined : { scale: [0.9, 1.08, 0.9] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
