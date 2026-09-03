"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface HealthRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  tone?: 'sage' | 'clay';
}

/** Circular habit-health gauge. The arc draws in once on mount. */
export function HealthRing({
  value,
  size = 92,
  stroke = 7,
  label,
  tone = 'sage'
}: HealthRingProps) {
  const reduced = useReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = tone === 'clay' ? 'var(--color-clay)' : 'var(--color-sage)';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${value} percent`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduced ? circumference * (1 - value / 100) : circumference }}
          whileInView={{ strokeDashoffset: circumference * (1 - value / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        />
      </svg>
      <span className="absolute flex flex-col items-center">
        <span className="font-serif text-xl leading-none text-ink">{value}%</span>
        {label && <span className="mt-1 text-[10px] uppercase tracking-[0.12em] text-faint">{label}</span>}
      </span>
    </div>
  );
}
