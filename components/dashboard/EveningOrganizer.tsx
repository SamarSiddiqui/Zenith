"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Timer, BookOpen, Flower2, PenTool } from 'lucide-react';

const remaining = [
  { id: 'reading', label: 'Reading', minutes: 15, icon: BookOpen },
  { id: 'meditation', label: 'Meditation', minutes: 10, icon: Flower2 },
  { id: 'journaling', label: 'Journaling', minutes: 5, icon: PenTool }
];

export function EveningOrganizer() {
  const [open, setOpen] = useState(true);

  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-sidebar" aria-label="Evening organizer">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-faint">8:30 PM organizer</p>
          <p className="mt-1.5 font-serif text-xl text-ink">
            Your day isn&apos;t over yet — 3 habits remaining
          </p>
          <p className="mt-1 text-sm text-muted">30 minutes total</p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="shrink-0 text-muted"
        >
          <ChevronDown className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-6 pb-6">
              <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
                {remaining.map(({ id, label, minutes, icon: Icon }) => (
                  <li key={id} className="flex items-center gap-3 px-5 py-4">
                    <Icon className="h-[18px] w-[18px] text-sage-deep" strokeWidth={1.75} aria-hidden />
                    <span className="flex-1 text-sm font-medium text-ink">{label}</span>
                    <span className="text-sm text-muted">{minutes} min</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sage px-6 py-3.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-sage-deep sm:w-auto"
              >
                <Timer className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                Start 30-min evening focus session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
