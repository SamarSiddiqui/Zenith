"use client";

import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, ShieldCheck, Zap } from 'lucide-react';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';

type Scenario = 'typical' | 'late' | 'crunch';

const START = 6;
const END = 23;
const SPAN = END - START;

const pos = (from: number, to: number) => ({
  left: `${((from - START) / SPAN) * 100}%`,
  width: `${((to - from) / SPAN) * 100}%`
});

interface Block {
  id: string;
  label: string;
  from: number;
  to: number;
  tone: 'work' | 'overrun' | 'habit' | 'risk' | 'shrunk' | 'deferred';
}

const commitments: Record<Scenario, Block[]> = {
  typical: [{ id: 'work', label: 'Work · 9:00 – 18:30', from: 9, to: 18.5, tone: 'work' }],
  late: [
    { id: 'work', label: 'Work · 9:00 – 18:30', from: 9, to: 18.5, tone: 'work' },
    { id: 'overrun', label: 'Ran late · until 20:30', from: 18.5, to: 20.5, tone: 'overrun' }
  ],
  crunch: [
    { id: 'work', label: 'Flight & Meetings · 8:00 – 21:30', from: 8, to: 21.5, tone: 'overrun' }
  ]
};

const habits: Record<Scenario, Block[]> = {
  typical: [
    { id: 'workout', label: 'Workout 45m', from: 6.5, to: 7.25, tone: 'habit' },
    { id: 'walk', label: 'Walk 20m', from: 13, to: 13.35, tone: 'habit' },
    { id: 'meditation', label: 'Meditate 15m', from: 19.0, to: 19.25, tone: 'habit' },
    { id: 'reading', label: 'Reading 30m', from: 20.0, to: 20.5, tone: 'habit' },
    { id: 'journal', label: 'Journal 10m', from: 21.0, to: 21.2, tone: 'habit' }
  ],
  late: [
    { id: 'workout', label: 'Workout 45m', from: 6.5, to: 7.25, tone: 'habit' },
    { id: 'walk', label: 'Walk 20m', from: 13, to: 13.35, tone: 'habit' },
    { id: 'meditation', label: 'Squeezed 10m', from: 20.6, to: 20.8, tone: 'risk' },
    { id: 'reading', label: 'Micro-read 5m', from: 21.0, to: 21.1, tone: 'shrunk' },
    { id: 'journal', label: 'Journal 10m', from: 21.5, to: 21.7, tone: 'habit' }
  ],
  crunch: [
    { id: 'workout', label: 'Workout Defer', from: 6.5, to: 7.25, tone: 'deferred' },
    { id: 'walk', label: 'Walk 10m', from: 13, to: 13.2, tone: 'habit' },
    { id: 'journal', label: 'Zenith 2-Min Reset', from: 21.8, to: 22.0, tone: 'shrunk' }
  ]
};

const toneClass: Record<Block['tone'], string> = {
  work: 'bg-sidebar border-line text-muted',
  overrun: 'bg-clay/15 border-clay/40 text-clay font-medium',
  habit: 'bg-sage/85 border-sage text-white',
  risk: 'bg-clay border-clay text-white',
  shrunk: 'bg-surface border-sage border-dashed text-sage-deep font-semibold',
  deferred: 'bg-canvas border-line text-faint line-through'
};

const ticks = [6, 9, 12, 15, 18, 21, 23];
const tickLabel = (h: number) =>
  h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;

const captions: Record<Scenario, { title: string; body: string; badge: string; iconTone: string }> = {
  typical: {
    title: 'On a normal day, everything fits seamlessly.',
    body: 'Five habits distributed across your 3h 30m evening window. No willpower required — just clear schedule room.',
    badge: '100% Window Utilization',
    iconTone: 'text-sage-deep'
  },
  late: {
    title: 'On an overrun day, Zenith auto-adapts your evening.',
    body: 'Work eats 2 hours of your evening. Instead of letting you fail, Zenith shrinks Reading to a 5-minute micro-session and protects your health score.',
    badge: 'Zenith Auto-Adapted (5m Micro-session)',
    iconTone: 'text-clay'
  },
  crunch: {
    title: 'On a travel or crunch day, Zenith activates Safe Deferral.',
    body: 'Your usable window shrinks to 45 mins. Zenith automatically defers long workouts to tomorrow without breaking your consistency score.',
    badge: 'Safe Deferral Active (0 Penalty)',
    iconTone: 'text-sage-deep'
  }
};

function Lane({ blocks, laneLabel }: { blocks: Block[]; laneLabel: string }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{laneLabel}</p>
      <div className="relative h-12 rounded-xl bg-canvas overflow-hidden">
        <AnimatePresence initial={false}>
          {blocks.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, ...pos(b.from, b.to) }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className={`absolute inset-y-1 flex items-center justify-center overflow-hidden rounded-lg border px-2 ${toneClass[b.tone]}`}
              style={pos(b.from, b.to)}
            >
              <span className="truncate text-[11px]">{b.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function DayRibbon() {
  const [scenario, setScenario] = useState<Scenario>('typical');
  const containerRef = useRef<HTMLDivElement>(null);
  const caption = captions[scenario];

  // GSAP ScrollTrigger entrance stagger for Chapter 02
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (containerRef.current) {
      tl.fromTo(
        containerRef.current.querySelectorAll('.gsap-ribbon-anim'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }
      );
    }

    return tl;
  });

  return (
    <section ref={sectionRef} id="chapter-02" className="scroll-mt-20 border-y border-line bg-surface">
      <div ref={containerRef} className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
        {/* Title & Selector Bar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="gsap-ribbon-anim text-xs font-semibold uppercase tracking-[0.18em] text-faint">
              Chapter 02 · The Working Window
            </p>
            <h2 className="gsap-ribbon-anim mt-3 font-serif text-3xl text-ink md:text-4xl">
              You don&apos;t have 24 hours. You have the gaps.
            </h2>
            <p className="gsap-ribbon-anim mt-4 text-base leading-relaxed text-muted">
              Traditional habit trackers assume an artificial, empty 24-hour canvas. Zenith calculates your real usable window around work, travel, and commitments — auto-scaling your habits in real time.
            </p>
            <p className="gsap-ribbon-anim mt-2 text-xs italic text-sage-deep">
              Because missing a habit after an 11-hour workday isn&apos;t a failure of willpower — it&apos;s a schedule design flaw.
            </p>
          </div>

          <div
            className="gsap-ribbon-anim inline-flex shrink-0 rounded-full border border-line bg-canvas p-1 shadow-xs"
            role="group"
            aria-label="Choose a day preset"
          >
            {[
              { id: 'typical', label: 'Typical Day' },
              { id: 'late', label: 'Late Overrun' },
              { id: 'crunch', label: 'Travel / Crunch' }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setScenario(item.id as Scenario)}
                aria-pressed={scenario === item.id}
                className="relative rounded-full px-4 py-2 text-xs font-medium transition-colors"
              >
                {scenario === item.id && (
                  <motion.span
                    layoutId="scenario-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                  />
                )}
                <span className={`relative ${scenario === item.id ? 'text-white' : 'text-muted'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Visualization Card */}
        <div className="gsap-ribbon-anim mt-12 rounded-3xl border border-line bg-canvas p-6 sm:p-8 shadow-calm">
          <div className="relative">
            {/* Hour Ticks */}
            <div className="absolute inset-x-0 -top-1 flex justify-between text-[10px] text-faint font-mono" aria-hidden>
              {ticks.map((t) => (
                <span key={t}>{tickLabel(t)}</span>
              ))}
            </div>

            {/* Ribbon Lanes */}
            <div className="space-y-5 pt-6">
              <div className="rounded-2xl bg-surface p-4 border border-line/60">
                <Lane blocks={commitments[scenario]} laneLabel="Commitments & Work" />
              </div>
              <div className="rounded-2xl bg-surface p-4 border border-line/60">
                <Lane blocks={habits[scenario]} laneLabel="Habit Schedule (Zenith Engine)" />
              </div>
            </div>
          </div>

          {/* Scenario Result Callout */}
          <div className="mt-8 grid gap-6 border-t border-line pt-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={scenario}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-full bg-surface border border-line px-2.5 py-0.5 text-[11px] font-semibold text-sage-deep flex items-center gap-1.5">
                    <ShieldCheck className={`h-3.5 w-3.5 ${caption.iconTone}`} />
                    {caption.badge}
                  </span>
                </div>
                <p className="font-serif text-xl text-ink">{caption.title}</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{caption.body}</p>
              </motion.div>
            </AnimatePresence>

            <dl className="flex gap-8 lg:justify-end">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-faint font-semibold">Usable Evening</dt>
                <dd className="mt-1 font-serif text-2xl text-ink flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-sage-deep" />
                  {scenario === 'typical' ? '3h 30m' : scenario === 'late' ? '1h 50m' : '0h 45m'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-faint font-semibold font-mono">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center gap-1 font-serif text-xl ${
                      scenario === 'typical'
                        ? 'text-sage-deep'
                        : scenario === 'late'
                        ? 'text-clay'
                        : 'text-ink'
                    }`}
                  >
                    <Zap className="h-4 w-4" />
                    {scenario === 'typical'
                      ? '5 Complete'
                      : scenario === 'late'
                      ? '1 Micro-adapted'
                      : 'Safe Deferral'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

