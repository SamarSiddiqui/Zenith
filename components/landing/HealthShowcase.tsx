"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HealthRing } from '../visuals/HealthRing';
import { Sparkbars } from '../visuals/Sparkbars';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';
import { Activity, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';

interface HabitItem {
  id: string;
  label: string;
  value: number;
  tone: 'sage' | 'clay';
  note: string;
  consistency: number;
  timeMatch: number;
  decay: number;
  rootCause: string;
}

const habitsList: HabitItem[] = [
  {
    id: 'reading',
    label: 'Reading',
    value: 61,
    tone: 'clay',
    note: 'At risk · 2 evening misses',
    consistency: 65,
    timeMatch: 80,
    decay: -24,
    rootCause: '5 of 5 dips occurred when work overrun pushed 21:00 slot past 22:30.'
  },
  {
    id: 'meditation',
    label: 'Meditation',
    value: 88,
    tone: 'sage',
    note: 'Steady at 19:15',
    consistency: 90,
    timeMatch: 95,
    decay: -7,
    rootCause: 'Placed immediately after workday close — 94% execution rate.'
  },
  {
    id: 'workout',
    label: 'Workout',
    value: 92,
    tone: 'sage',
    note: 'Best morning window',
    consistency: 95,
    timeMatch: 98,
    decay: -5,
    rootCause: 'Scheduled during 06:30 peak energy window — zero meeting conflicts.'
  }
];

const thirtyDays = [
  4, 5, 6, 5, 6, 3, 4, 6, 6, 5, 2, 4, 6, 6, 5, 6, 3, 5, 6, 6, 4, 2, 5, 6, 6, 5, 6, 4, 6, 5
];
const missDays = [5, 10, 16, 21, 27];

type FormulaFactor = 'all' | 'consistency' | 'timeMatch' | 'decay';

export function HealthShowcase() {
  const [selectedHabit, setSelectedHabit] = useState<HabitItem>(habitsList[0]);
  const [activeFactor, setActiveFactor] = useState<FormulaFactor>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger entrance animation
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    if (containerRef.current) {
      tl.fromTo(
        containerRef.current.querySelectorAll('.gsap-health-anim'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }
      );
    }
    return tl;
  });

  return (
    <section ref={sectionRef} id="chapter-03" className="scroll-mt-20 border-y border-line bg-canvas">
      <div ref={containerRef} className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="gsap-health-anim text-xs font-semibold uppercase tracking-[0.18em] text-faint">
            Chapter 03 · What Zenith Sees
          </p>
          <h2 className="gsap-health-anim mt-3 font-serif text-3xl text-ink md:text-4xl">
            Every habit carries a pulse, and every dip has a root cause.
          </h2>
          <p className="gsap-health-anim mt-4 text-base leading-relaxed text-muted">
            Health isn&apos;t a binary streak score. It is a dynamic formula accounting for execution consistency, preferred time window alignment, and schedule compression decay.
          </p>
        </div>

        {/* Interactive Formula Bar */}
        <div className="gsap-health-anim mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-sage-deep" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink">Formula Explorer:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Health Score (100%)' },
              { id: 'consistency', label: 'Consistency (40%)' },
              { id: 'timeMatch', label: 'Time Alignment (30%)' },
              { id: 'decay', label: 'Window Decay (-30%)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFactor(f.id as FormulaFactor)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeFactor === f.id
                    ? 'bg-ink text-white shadow-xs'
                    : 'bg-canvas text-muted hover:text-ink border border-line'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Grid */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          {/* Left: Habit Selector Cards */}
          <div className="gsap-health-anim space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
              Click a habit to inspect root cause & formula components:
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {habitsList.map((item) => {
                const isSelected = selectedHabit.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedHabit(item)}
                    className={`flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
                      isSelected
                        ? 'border-sage-deep bg-surface shadow-md ring-2 ring-sage/20'
                        : 'border-line bg-surface/60 hover:bg-surface hover:border-line/80'
                    }`}
                  >
                    <HealthRing value={item.value} tone={item.tone} size={84} />
                    <p className="mt-3 text-sm font-semibold text-ink">{item.label}</p>
                    <p className="mt-1 text-[11px] leading-tight text-muted">{item.note}</p>
                  </button>
                );
              })}
            </div>

            {/* Habit Inspector Panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedHabit.id + activeFactor}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="rounded-2xl border border-line bg-surface p-6 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-sage-deep" />
                    <span className="font-serif text-lg font-semibold text-ink">
                      {selectedHabit.label} Formula Breakdown
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                      selectedHabit.tone === 'clay'
                        ? 'bg-clay-wash text-clay border border-clay/30'
                        : 'bg-sage-wash text-sage-deep border border-sage/30'
                    }`}
                  >
                    Score: {selectedHabit.value}%
                  </span>
                </div>

                {/* Score Formula Components Bar */}
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className={`rounded-xl p-3 ${activeFactor === 'consistency' ? 'bg-sage-wash border border-sage/40' : 'bg-canvas'}`}>
                    <span className="block text-[10px] uppercase tracking-wider text-faint font-medium">Consistency</span>
                    <span className="mt-1 block font-serif text-lg font-bold text-ink">{selectedHabit.consistency}%</span>
                  </div>
                  <div className={`rounded-xl p-3 ${activeFactor === 'timeMatch' ? 'bg-sage-wash border border-sage/40' : 'bg-canvas'}`}>
                    <span className="block text-[10px] uppercase tracking-wider text-faint font-medium">Time Match</span>
                    <span className="mt-1 block font-serif text-lg font-bold text-ink">{selectedHabit.timeMatch}%</span>
                  </div>
                  <div className={`rounded-xl p-3 ${activeFactor === 'decay' ? 'bg-clay-wash border border-clay/40' : 'bg-canvas'}`}>
                    <span className="block text-[10px] uppercase tracking-wider text-faint font-medium">Window Decay</span>
                    <span className="mt-1 block font-serif text-lg font-bold text-clay">{selectedHabit.decay}%</span>
                  </div>
                </div>

                {/* Root Cause Analysis */}
                <div className="mt-5 rounded-xl border border-line bg-canvas p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink mb-1">
                    {selectedHabit.tone === 'clay' ? (
                      <AlertTriangle className="h-4 w-4 text-clay" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-sage-deep" />
                    )}
                    <span>Schedule Root Cause Identified:</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted">{selectedHabit.rootCause}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: 30-Day Sparkbars & Correlation */}
          <div className="gsap-health-anim rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-calm">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-ink">30-Day Execution & Overrun Correlation</p>
              <p className="text-xs text-muted">Habits completed per day</p>
            </div>

            <div className="mt-6">
              <Sparkbars values={thirtyDays} missed={missDays} height={100} />
            </div>

            <div className="mt-6 space-y-3 border-t border-line pt-5 text-xs text-muted">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sage/70" aria-hidden /> Normal Day (4-6 habits)
                </span>
                <span className="font-medium text-ink">25 Days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-clay/70" aria-hidden /> Work Overrun Dip (2-3 habits)
                </span>
                <span className="font-medium text-clay">5 Days</span>
              </div>

              <div className="mt-4 rounded-xl border border-sage/30 bg-sage-wash/60 p-3 text-xs text-sage-deep font-medium">
                💡 100% of consistency dips in this 30-day window correlated directly with work finishes after 19:00, not lack of willpower.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

