"use client";

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Reveal } from '../visuals/Reveal';

const W = 320;
const H = 140;
const TOP = 14;
const BOTTOM = 126;

/** 22 days of a streak counter: climbs, then one bad week zeroes it out for good. */
const streak = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 0, 0, 0
];

/** The same 22 days scored as habit health: it dips, it is caught, it recovers. */
const health = [
  90, 92, 93, 94, 95, 94, 93, 95, 96, 94, 92, 88, 84, 79, 74, 68, 63, 61, 61, 68, 79, 88
];

function toPath(values: number[], max: number) {
  const stepX = W / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = BOTTOM - (v / max) * (BOTTOM - TOP);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function pointAt(values: number[], index: number, max: number) {
  const stepX = W / (values.length - 1);
  return {
    x: index * stepX,
    y: BOTTOM - (values[index] / max) * (BOTTOM - TOP)
  };
}

interface ChartProps {
  path: string;
  color: string;
  markers: Array<{ x: number; y: number; label: string; tone: 'sage' | 'clay' }>;
}

function Chart({ path, color, markers }: ChartProps) {
  const reduced = useReducedMotion();

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[150px] w-full" role="img" aria-hidden>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1="0"
          x2={W}
          y1={BOTTOM - g * (BOTTOM - TOP)}
          y2={BOTTOM - g * (BOTTOM - TOP)}
          stroke="var(--color-line)"
          strokeWidth="1"
        />
      ))}
      <line x1="0" x2={W} y1={BOTTOM} y2={BOTTOM} stroke="var(--color-line)" strokeWidth="1" />

      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      />

      {markers.map((m, i) => (
        <motion.g
          key={m.label}
          initial={{ opacity: reduced ? 1 : 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.24, delay: 0.55 + i * 0.08, ease: 'easeOut' }}
        >
          <circle
            cx={m.x}
            cy={m.y}
            r="4.5"
            fill="var(--color-surface)"
            stroke={m.tone === 'clay' ? 'var(--color-clay)' : 'var(--color-sage)'}
            strokeWidth="2"
          />
          <text
            x={Math.min(m.x + 9, W - 4)}
            y={Math.max(m.y - 8, 12)}
            textAnchor={m.x > W - 90 ? 'end' : 'start'}
            className="fill-current text-[9px]"
            style={{ color: m.tone === 'clay' ? 'var(--color-clay)' : 'var(--color-sage-deep)' }}
          >
            {m.label}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}

export function StreakVsHealth() {
  const streakDrop = pointAt(streak, 19, 19);
  const healthDip = pointAt(health, 18, 100);
  const healthBack = pointAt(health, 21, 100);

  return (
    <section id="chapter-01" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20 lg:px-10 lg:py-28">
      <Reveal className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.18em] text-faint">Chapter 01 · The problem</p>
        <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
          A streak has one bad week in it. Then it&apos;s over.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Same person. Same twenty-two days. The only difference is what the system was counting.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal className="flex flex-col rounded-3xl border border-line bg-surface p-7 shadow-calm">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-xl text-ink">Counting streaks</h3>
            <span className="rounded-full border border-clay/35 bg-clay-wash px-3 py-1 text-xs font-medium text-clay">
              Abandoned on day 19
            </span>
          </div>
          <div className="mt-6">
            <Chart
              path={toPath(streak, 19)}
              color="var(--color-clay)"
              markers={[{ x: streakDrop.x, y: streakDrop.y, label: 'back to zero', tone: 'clay' }]}
            />
          </div>
          <p className="mt-auto pt-6 text-sm leading-relaxed text-muted">
            Eighteen days of evidence, deleted by one late Tuesday. The number that was supposed to
            motivate you becomes the reason you stop opening the app.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="flex flex-col rounded-3xl border border-sage/40 bg-sage-wash p-7 shadow-calm">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-serif text-xl text-ink">Counting health</h3>
            <span className="rounded-full border border-sage/50 bg-surface px-3 py-1 text-xs font-medium text-sage-deep">
              Recovered by day 22
            </span>
          </div>
          <div className="mt-6">
            <Chart
              path={toPath(health, 100)}
              color="var(--color-sage-deep)"
              markers={[
                { x: healthDip.x, y: healthDip.y, label: 'warning at 61%', tone: 'clay' },
                { x: healthBack.x, y: healthBack.y, label: '88%', tone: 'sage' }
              ]}
            />
          </div>
          <p className="mt-auto pt-6 text-sm leading-relaxed text-muted">
            The same bad week reads as a slope, not a cliff. Zenith speaks up at the bend — while
            getting back takes one small evening, not a fresh start.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
