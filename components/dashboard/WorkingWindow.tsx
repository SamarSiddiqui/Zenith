"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function WorkingWindow() {
  const elapsed = 65;

  return (
    <div className="rounded-2xl border border-line bg-surface px-6 py-5 shadow-calm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.16em] text-faint">Working window</p>
        <p className="text-sm text-muted">
          <span className="font-medium text-ink">3.5 hours</span> remaining
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas">
        <motion.div
          className="h-full rounded-full bg-sage"
          initial={{ width: 0 }}
          animate={{ width: `${elapsed}%` }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        <span>9:00 AM</span>
        <span>Now · 3:30 PM</span>
        <span>7:00 PM</span>
      </div>
    </div>
  );
}
