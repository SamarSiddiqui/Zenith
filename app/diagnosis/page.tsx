"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { WeekChart } from '../../components/diagnosis/WeekChart';
import { Reveal } from '../../components/visuals/Reveal';
import { CountUp } from '../../components/visuals/CountUp';
import { HealthRing } from '../../components/visuals/HealthRing';

const retroMetrics = [
  { label: 'Consistency', value: '87%', tone: 'good' as const, note: 'Above your 30-day average' },
  { label: 'Recovery rate', value: 'Good', tone: 'good' as const, note: '4 of 6 slips recovered' },
  { label: 'Overcommitment', value: 'High', tone: 'warn' as const, note: '42 planned · 36 done' },
  { label: 'Timing mismatch', value: 'Needs attention', tone: 'warn' as const, note: '5 habits ran past window' }
];

export default function DiagnosisPage() {
  const [accepted, setAccepted] = useState<'accepted' | 'kept' | null>(null);

  return (
    <Layout userName="Samar">
      <div className="flex flex-col gap-10">
        <header>
          <p className="text-sm text-muted">Week of Oct 12</p>
          <h1 className="mt-1.5 font-serif text-4xl text-ink md:text-5xl">Weekly diagnosis</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            What actually happened this week, and what your schedule says about it.
          </p>
        </header>

        <Reveal
          as="section"
          className="rounded-3xl border border-line bg-surface p-7 shadow-calm sm:p-9"
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {retroMetrics.map((m) => (
              <div key={m.label} className="flex flex-col border-t border-line pt-4">
                <p className="text-xs uppercase tracking-[0.14em] text-faint">{m.label}</p>
                <p
                  className={`mt-2 font-serif text-2xl ${m.tone === 'warn' ? 'text-clay' : 'text-ink'}`}
                >
                  {m.value}
                </p>
                <p className="mt-auto pt-2 text-xs text-muted">{m.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-canvas p-6">
            <WeekChart />
          </div>

          <div className="mt-4 rounded-2xl bg-sidebar p-6">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" strokeWidth={1.9} aria-hidden />
              <div>
                <p className="max-w-2xl text-base leading-relaxed text-ink">
                  You planned <span className="font-medium">42 habit sessions</span> this week but
                  completed 36. You are overcommitting on late workdays.
                </p>
                <p className="mt-3 text-sm text-muted">
                  Recommendation: reduce your daily target from 6 habits to 4.
                </p>
              </div>
            </div>

            {accepted ? (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="mt-5 rounded-xl border border-sage/35 bg-sage-wash px-4 py-3 text-sm text-ink"
              >
                {accepted === 'accepted'
                  ? 'Daily target set to 4 habits starting Monday. Zenith will re-evaluate in 7 days.'
                  : 'Keeping 6 habits. Zenith will watch for overcommitment again next week.'}
              </motion.p>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAccepted('accepted')}
                  className="rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-sage-deep"
                >
                  Accept recommendation
                </button>
                <button
                  type="button"
                  onClick={() => setAccepted('kept')}
                  className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-sidebar"
                >
                  Keep current plan
                </button>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal as="section" className="rounded-3xl border border-clay/30 bg-clay-wash p-7 sm:p-9">
          <p className="text-xs uppercase tracking-[0.16em] text-clay">Habit autopsy</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">What happened to Gym 5x/week?</h2>

          <dl className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-6">
            {[
              { k: 'Active for', node: <><CountUp value={16} /> days</> },
              { k: 'Completion', node: <CountUp value={69} suffix="%" /> }
            ].map(({ k, node }) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-[0.14em] text-clay/80">{k}</dt>
                <dd className="mt-1 font-serif text-xl text-ink">{node}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-clay/80">Final health</dt>
              <dd className="mt-2">
                <HealthRing value={38} tone="clay" size={68} stroke={6} />
              </dd>
            </div>
          </dl>

          <p className="mt-7 max-w-2xl text-base leading-relaxed text-ink">
            4 of 5 skips happened after you worked past 7 PM. The frequency was unrealistic for your
            actual work schedule — not for you.
          </p>

          <motion.button
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="group mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-ink/85"
          >
            Switch to Gym 3x/week (Mon / Wed / Fri)
            <ArrowRight
              className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
              strokeWidth={1.9}
              aria-hidden
            />
          </motion.button>
        </Reveal>
      </div>
    </Layout>
  );
}
