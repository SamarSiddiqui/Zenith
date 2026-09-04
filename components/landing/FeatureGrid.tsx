"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Hourglass,
  AlertTriangle,
  Activity,
  Minimize2,
  Search,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { Reveal } from '../visuals/Reveal';

const featuredFeature = {
  icon: Search,
  badge: 'Core Innovation',
  title: 'Schedule-tied root cause diagnosis',
  body: 'Zenith cross-references your calendar commitments against habit completion to pinpoint exact contextual triggers. Causes, not guilt.',
  examples: [
    '“73% of your missed workouts happen on days you work past 7:00 PM.”',
    '“81% of late-night reading skips correlate with >9-hour workday length.”'
  ],
  stat: '73% – 81% root cause accuracy'
};

const secondaryFeatures = [
  {
    icon: Hourglass,
    title: 'Working-hours core window',
    body: 'Schedule and diagnose habits inside your actual available time, not an artificial 24-hour day.',
    stat: '9:00 AM – 7:00 PM'
  },
  {
    icon: AlertTriangle,
    title: 'Proactive 2-day warning',
    body: 'Intervene while recovery still takes one step — long before streak abandonment sets in.',
    stat: 'Fires on miss #2'
  },
  {
    icon: Activity,
    title: 'Habit health index',
    body: 'A dynamic 0–100% score weighing consistency, preferred time, and risk. Goodbye fragile zero-counters.',
    stat: '0 – 100%'
  },
  {
    icon: Minimize2,
    title: '“Shrink, don’t skip” fallbacks',
    body: 'When your evening window runs out of time, Zenith offers the two-minute version instead of a miss.',
    stat: '15 min → 2 min'
  },
  {
    icon: HeartPulse,
    title: 'Adaptive recovery mode',
    body: 'Step-down routines — 5 min, then 10, then full — that rebuild momentum instead of restarting it.',
    stat: '3-day step-up'
  }
];

export function FeatureGrid() {
  const reduced = useReducedMotion();

  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
      <Reveal className="max-w-2xl">
        <h2 className="font-serif text-3xl text-ink md:text-4xl">
          Six things a habit tracker never did for you
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Zenith reads your schedule, your timing, and your fatigue — then adjusts the plan before
          it breaks.
        </p>
      </Reveal>

      {/* Featured #1 Card: Schedule-tied root cause */}
      <Reveal className="mt-12">
        <div className="group relative overflow-hidden rounded-3xl border border-sage/50 bg-sage-wash/50 p-8 shadow-calm transition-all duration-200 hover:border-sage hover:bg-sage-wash lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/40 bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sage-deep">
              <Sparkles className="h-3.5 w-3.5" />
              {featuredFeature.badge}
            </span>
            <span className="rounded-full border border-sage/40 bg-surface px-3 py-1 text-xs font-medium text-sage-deep">
              {featuredFeature.stat}
            </span>
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="flex items-center gap-3 text-sage-deep">
                <featuredFeature.icon className="h-6 w-6" strokeWidth={2} />
                <h3 className="font-serif text-2xl text-ink md:text-3xl">{featuredFeature.title}</h3>
              </div>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {featuredFeature.body}
              </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
              <p className="text-xs uppercase tracking-wider text-faint font-medium">Real correlation engine output</p>
              {featuredFeature.examples.map((ex) => (
                <div key={ex} className="rounded-xl border border-line bg-canvas p-3 text-xs italic text-ink">
                  {ex}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Remaining 5 Features */}
      <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {secondaryFeatures.map(({ icon: Icon, title, body, stat }, i) => (
          <Reveal as="li" key={title} delay={i * 0.04} className="group relative flex flex-col pt-6">
            <span className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden />
            <motion.div
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="flex flex-1 flex-col rounded-2xl border border-transparent p-4 transition-all duration-150 group-hover:border-line group-hover:bg-surface"
            >
              <motion.span
                className="absolute left-0 top-0 h-px bg-sage"
                variants={{ rest: { width: '0%' }, hover: { width: '100%' } }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                aria-hidden
              />
              <motion.span
                variants={reduced ? undefined : { rest: { y: 0 }, hover: { y: -2 } }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="inline-flex"
              >
                <Icon className="h-5 w-5 text-sage-deep" strokeWidth={1.75} aria-hidden />
              </motion.span>
              <h3 className="mt-4 font-serif text-xl leading-snug text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
              <span className="mt-4 inline-flex w-fit rounded-full border border-line bg-canvas px-3 py-1 text-[11px] font-medium text-muted transition-colors duration-150 ease-out group-hover:border-sage/40 group-hover:bg-sage-wash group-hover:text-sage-deep">
                {stat}
              </span>
            </motion.div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
