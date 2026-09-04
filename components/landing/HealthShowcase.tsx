"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Reveal } from '../visuals/Reveal';
import { HealthRing } from '../visuals/HealthRing';
import { Sparkbars } from '../visuals/Sparkbars';

const rings = [
  { label: 'Reading', value: 61, tone: 'clay' as const, note: 'At risk · 2 evening misses' },
  { label: 'Meditation', value: 88, tone: 'sage' as const, note: 'Steady at 7:15 PM' },
  { label: 'Workout', value: 92, tone: 'sage' as const, note: 'Best morning window' }
];

const thirtyDays = [
  4, 5, 6, 5, 6, 3, 4, 6, 6, 5, 2, 4, 6, 6, 5, 6, 3, 5, 6, 6, 4, 2, 5, 6, 6, 5, 6, 4, 6, 5
];

const missDays = [5, 10, 16, 21, 27];

export function HealthShowcase() {
  return (
    <section id="chapter-03" className="scroll-mt-20 border-y border-line bg-canvas">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-10 lg:py-24">
        <Reveal className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.18em] text-faint">
            Chapter 03 · What Zenith sees
          </p>
          <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
            Every habit carries a pulse, and every dip has a cause.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Health, preferred time, and risk in one score — then the schedule evidence behind it.
          </p>
          <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-xs text-muted shadow-sm">
            <span className="font-medium text-ink">How it&apos;s calculated:</span>
            <span className="font-mono text-sage-deep">Health = consistency + preferred-time match + recent risk</span>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.95fr_1fr] lg:items-center">
          <Reveal className="flex flex-wrap justify-between gap-8 sm:justify-start sm:gap-12">
            {rings.map((r) => (
              <motion.div
                key={r.label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="text-center"
              >
                <HealthRing value={r.value} tone={r.tone} size={96} />
                <p className="mt-3 text-sm font-medium text-ink">{r.label}</p>
                <p className="mt-1 max-w-[9rem] text-xs leading-relaxed text-muted">{r.note}</p>
              </motion.div>
            ))}
          </Reveal>

          <Reveal delay={0.06} className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-calm">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium text-ink">Last 30 days</p>
              <p className="text-xs text-muted">Habits completed per day</p>
            </div>
            <div className="mt-5">
              <Sparkbars values={thirtyDays} missed={missDays} height={92} />
            </div>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-4 text-xs text-muted">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sage/70" aria-hidden /> On plan
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-clay/60" aria-hidden /> Late workday
              </span>
              <span className="ml-auto text-ink">5 of 5 dips followed a 7 PM finish</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
