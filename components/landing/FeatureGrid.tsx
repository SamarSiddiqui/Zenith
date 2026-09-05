"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Hourglass,
  AlertTriangle,
  Activity,
  Minimize2,
  Search,
  HeartPulse,
  Sparkles,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';
import { RoadmapTeaser } from './RoadmapTeaser';

interface RootCausePreset {
  id: string;
  trigger: string;
  stat: string;
  habit: string;
  recommendation: string;
}

const rootCausePresets: RootCausePreset[] = [
  {
    id: 'late_work',
    trigger: 'Workday extends past 19:00',
    stat: '73% Correlation',
    habit: 'Evening Workout',
    recommendation: 'Auto-reschedules workout to 20-min morning mobility flow on late days.'
  },
  {
    id: 'long_hours',
    trigger: 'Workday duration > 9.5 hours',
    stat: '81% Correlation',
    habit: 'Nightly Reading',
    recommendation: 'Triggers 5-minute micro-read fallback to preserve habit health score.'
  },
  {
    id: 'heavy_meetings',
    trigger: 'Meetings exceed 4 hours',
    stat: '92% Correlation',
    habit: 'Meditation',
    recommendation: 'Places a 2-minute decompression reset immediately after final meeting.'
  }
];

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
  const [activePreset, setActivePreset] = useState<RootCausePreset>(rootCausePresets[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger entrance stagger
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (containerRef.current) {
      tl.fromTo(
        containerRef.current.querySelectorAll('.gsap-feature-anim'),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }
      );
    }

    return tl;
  });

  return (
    <section ref={sectionRef} id="features" className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
      <div ref={containerRef}>
        {/* Header */}
        <div className="max-w-2xl">
          <p className="gsap-feature-anim text-xs font-semibold uppercase tracking-[0.18em] text-faint">
            Intelligent Engine
          </p>
          <h2 className="gsap-feature-anim mt-3 font-serif text-3xl text-ink md:text-4xl">
            Six things a habit tracker never did for you
          </h2>
          <p className="gsap-feature-anim mt-4 text-base leading-relaxed text-muted">
            Zenith reads your schedule, your timing, and your fatigue — then adjusts the plan before it breaks.
          </p>
        </div>

        {/* Featured Card #1: Schedule-tied root cause */}
        <div className="gsap-feature-anim mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-sage/50 bg-sage-wash/50 p-7 lg:p-10 shadow-calm transition-all">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/40 bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sage-deep">
                <Sparkles className="h-3.5 w-3.5" />
                Core Innovation
              </span>
              <span className="rounded-full border border-sage/40 bg-surface px-3 py-1 text-xs font-semibold text-sage-deep">
                73% – 92% Root Cause Accuracy
              </span>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <div className="flex items-center gap-3 text-sage-deep">
                  <Search className="h-6 w-6" strokeWidth={2} />
                  <h3 className="font-serif text-2xl text-ink md:text-3xl">
                    Schedule-tied root cause diagnosis
                  </h3>
                </div>
                <p className="mt-4 text-base leading-relaxed text-muted">
                  Zenith cross-references your calendar commitments against habit completion to pinpoint exact contextual triggers. Causes, not guilt.
                </p>

                {/* Interactive Preset Buttons */}
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-faint">
                    Test Schedule Triggers:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rootCausePresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setActivePreset(preset)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                          activePreset.id === preset.id
                            ? 'bg-sage-deep text-white shadow-xs'
                            : 'bg-surface border border-line text-muted hover:text-ink'
                        }`}
                      >
                        {preset.trigger}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Correlation Simulator Box */}
              <div className="rounded-2xl border border-sage/30 bg-surface p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2 text-sage-deep font-semibold text-xs uppercase tracking-wider">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Correlation Engine Output</span>
                  </div>
                  <span className="rounded-full bg-clay-wash border border-clay/30 px-2.5 py-0.5 text-[11px] font-bold text-clay">
                    {activePreset.stat}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePreset.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 space-y-3"
                  >
                    <div className="rounded-xl border border-line bg-canvas p-4 text-xs font-medium text-ink">
                      <span className="text-muted">Detected Pattern:</span>
                      <p className="mt-1 font-serif text-sm text-ink italic">&ldquo;Missed {activePreset.habit} habit when {activePreset.trigger.toLowerCase()}.&rdquo;</p>
                    </div>

                    <div className="rounded-xl border border-sage/40 bg-sage-wash/60 p-4 text-xs text-sage-deep font-medium flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-sage-deep" />
                      <div>
                        <span className="font-bold">Zenith System Intervention:</span>
                        <p className="mt-0.5 text-muted">{activePreset.recommendation}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Remaining 5 Secondary Features */}
        <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryFeatures.map(({ icon: Icon, title, body, stat }) => (
            <li key={title} className="gsap-feature-anim group relative flex flex-col pt-6">
              <span className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden />
              <motion.div
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="flex flex-1 flex-col rounded-2xl border border-transparent p-5 transition-all duration-150 group-hover:border-line group-hover:bg-surface group-hover:shadow-xs"
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
                <span className="mt-4 inline-flex w-fit rounded-full border border-line bg-canvas px-3 py-1 text-[11px] font-semibold text-muted transition-colors duration-150 ease-out group-hover:border-sage/40 group-hover:bg-sage-wash group-hover:text-sage-deep">
                  {stat}
                </span>
              </motion.div>
            </li>
          ))}
        </ul>

        {/* Roadmap Teaser */}
        <div className="gsap-feature-anim">
          <RoadmapTeaser />
        </div>
      </div>
    </section>
  );
}
