"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Hourglass,
  AlertTriangle,
  Activity,
  Minimize2,
  Search,
  HeartPulse
} from 'lucide-react';
import { Reveal } from '../visuals/Reveal';

const features = [
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
    icon: Search,
    title: 'Schedule-tied root cause',
    body: '“73% of your missed workouts happen on days you work past 7 PM.” Causes, not guilt.',
    stat: '73% explained'
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

      <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, body, stat }, i) => (
          <Reveal as="li" key={title} delay={i * 0.04} className="group relative flex flex-col pt-6">
            <span className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden />
            <motion.div
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="flex flex-1 flex-col"
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
