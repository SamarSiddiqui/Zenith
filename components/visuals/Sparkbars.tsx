"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface SparkbarsProps {
  values: number[];
  /** Indexes rendered in the clay "miss" tone. */
  missed?: number[];
  height?: number;
  labels?: string[];
}

/** Compact bar chart. Bars grow in a short stagger the first time they're seen. */
export function Sparkbars({ values, missed = [], height = 56, labels }: SparkbarsProps) {
  const reduced = useReducedMotion();
  const max = Math.max(...values, 1);

  return (
    <div>
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {values.map((v, i) => {
          const pct = Math.max((v / max) * 100, 6);
          const isMiss = missed.includes(i);
          return (
            <motion.span
              key={i}
              className={`group relative flex-1 rounded-full ${isMiss ? 'bg-clay/60' : 'bg-sage/70'}`}
              style={{ transformOrigin: 'bottom' }}
              initial={{ height: reduced ? `${pct}%` : '4%', opacity: reduced ? 1 : 0.4 }}
              whileInView={{ height: `${pct}%`, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.28,
                delay: reduced ? 0 : Math.min(i * 0.012, 0.28),
                ease: [0.23, 1, 0.32, 1]
              }}
            />
          );
        })}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between text-[10px] text-faint">
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
