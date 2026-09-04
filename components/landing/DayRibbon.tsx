"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Reveal } from '../visuals/Reveal';

type Scenario = 'typical' | 'late';

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
  tone: 'work' | 'overrun' | 'habit' | 'risk' | 'shrunk';
}

const commitments: Record<Scenario, Block[]> = {
  typical: [{ id: 'work', label: 'Work · 9:00 – 7:00', from: 9, to: 19, tone: 'work' }],
  late: [
    { id: 'work', label: 'Work · 9:00 – 7:00', from: 9, to: 19, tone: 'work' },
    { id: 'overrun', label: 'Ran late · until 8:40', from: 19, to: 20.67, tone: 'overrun' }
  ]
};

const habits: Record<Scenario, Block[]> = {
  typical: [
    { id: 'workout', label: 'Workout', from: 6.5, to: 7.3, tone: 'habit' },
    { id: 'walk', label: 'Walk', from: 13, to: 13.5, tone: 'habit' },
    { id: 'meditation', label: 'Meditate', from: 19.25, to: 19.6, tone: 'habit' },
    { id: 'reading', label: 'Reading', from: 20.5, to: 21, tone: 'habit' },
    { id: 'journal', label: 'Journal', from: 21.5, to: 21.8, tone: 'habit' }
  ],
  late: [
    { id: 'workout', label: 'Workout', from: 6.5, to: 7.3, tone: 'habit' },
    { id: 'walk', label: 'Walk', from: 13, to: 13.5, tone: 'habit' },
    { id: 'meditation', label: 'Squeezed', from: 20.67, to: 21, tone: 'risk' },
    { id: 'reading', label: 'Reading · 5 min', from: 21, to: 21.4, tone: 'shrunk' },
    { id: 'journal', label: 'Journal', from: 21.5, to: 21.8, tone: 'habit' }
  ]
};

const toneClass: Record<Block['tone'], string> = {
  work: 'bg-sidebar border-line text-muted',
  overrun: 'bg-clay/15 border-clay/40 text-clay',
  habit: 'bg-sage/85 border-sage text-white',
  risk: 'bg-clay border-clay text-white',
  shrunk: 'bg-surface border-sage border-dashed text-sage-deep'
};

const ticks = [6, 9, 12, 15, 18, 21, 23];
const tickLabel = (h: number) =>
  h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;

const captions: Record<Scenario, { title: string; body: string }> = {
  typical: {
    title: 'On a normal day, everything fits.',
    body: 'Five habits, thirty-five minutes of evening. Nothing here needs willpower — it needs room, and today there is room.'
  },
  late: {
    title: 'On a late day, the evening disappears first.',
    body: 'The workday eats 1 hour 40 minutes of the window. Zenith does not mark you down — it shrinks Reading to five minutes and lets the rest slide to tomorrow morning.'
  }
};

function Lane({ blocks, laneLabel }: { blocks: Block[]; laneLabel: string }) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-faint">{laneLabel}</p>
      <div className="relative h-12 rounded-xl bg-canvas">
        <AnimatePresence initial={false}>
          {blocks.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1, ...pos(b.from, b.to) }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              className={`absolute inset-y-1 flex items-center justify-center overflow-hidden rounded-lg border px-2 ${toneClass[b.tone]}`}
              style={pos(b.from, b.to)}
            >
              <span className="truncate text-[11px] font-medium">{b.label}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function DayRibbon() {
  const [scenario, setScenario] = useState<Scenario>('typical');
  const caption = captions[scenario];

  return (
    <section id="chapter-02" className="scroll-mt-20 border-y border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-faint">
              Chapter 02 · The working window
            </p>
            <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
              You don&apos;t have 24 hours. You have the gaps.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Every other tracker plans against a blank, artificial 24-hour day — inducing guilt when life happens. Zenith plans against your real working hours, respecting work, commutes, and rest, and re-plans the moment your day changes.
            </p>
            <p className="mt-2 text-xs italic text-sage-deep">
              Because missing a habit at 11:59 PM after a 10-hour shift isn&apos;t a failure of willpower — it&apos;s a failure of schedule design.
            </p>
          </div>

          <div
            className="inline-flex shrink-0 rounded-full border border-line bg-canvas p-1"
            role="group"
            aria-label="Choose a day"
          >
            {(['typical', 'late'] as Scenario[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScenario(s)}
                aria-pressed={scenario === s}
                className="relative rounded-full px-5 py-2 text-sm font-medium"
              >
                {scenario === s && (
                  <motion.span
                    layoutId="scenario-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                  />
                )}
                <span className={`relative ${scenario === s ? 'text-white' : 'text-muted'}`}>
                  {s === 'typical' ? 'Typical day' : 'Late workday'}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="mt-12 rounded-3xl border border-line bg-canvas p-6 sm:p-8">
          <div className="relative">
            <div className="absolute inset-x-0 -top-1 flex justify-between text-[10px] text-faint" aria-hidden>
              {ticks.map((t) => (
                <span key={t}>{tickLabel(t)}</span>
              ))}
            </div>

            <div className="space-y-5 pt-6">
              <div className="rounded-2xl bg-surface p-4">
                <Lane blocks={commitments[scenario]} laneLabel="Commitments" />
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <Lane blocks={habits[scenario]} laneLabel="Habits" />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 border-t border-line pt-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={scenario}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              >
                <p className="font-serif text-xl text-ink">{caption.title}</p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{caption.body}</p>
              </motion.div>
            </AnimatePresence>

            <dl className="flex gap-8 lg:justify-end">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-faint">Usable evening</dt>
                <dd className="mt-1 font-serif text-2xl text-ink">
                  {scenario === 'typical' ? '3h 30m' : '1h 50m'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.14em] text-faint">Habits at risk</dt>
                <dd
                  className={`mt-1 font-serif text-2xl ${scenario === 'typical' ? 'text-ink' : 'text-clay'}`}
                >
                  {scenario === 'typical' ? '0' : '2'}
                </dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
