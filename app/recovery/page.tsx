"use client";

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HeartPulse, Check } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { recoverySteps } from '../../data/zenith';
import { BreathingPacer } from '../../components/visuals/BreathingPacer';
import { HealthRing } from '../../components/visuals/HealthRing';

const stepTone = {
  active: 'border-sage bg-sage text-white',
  next: 'border-line bg-surface text-muted',
  later: 'border-line bg-surface text-muted'
};

export default function RecoveryPage() {
  const [committed, setCommitted] = useState(false);
  const reduced = useReducedMotion();

  return (
    <Layout userName="Samar">
      <div className="flex flex-col gap-10">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-3xl border border-clay/30 bg-clay-wash p-7 sm:p-9"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <motion.span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay/15 text-clay"
                animate={reduced ? undefined : { scale: [1, 1.08, 1] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <HeartPulse className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden />
              </motion.span>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-clay">
                  Recovery mode activated
                </p>
                <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
                  Reading is slipping — let&apos;s rebuild it in three days.
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                  Health dropped to 61% after two evening misses. Instead of restarting at full size,
                  Zenith steps the habit back up so momentum survives.
                </p>
              </div>
            </div>
            <div className="shrink-0 self-center">
              <HealthRing value={61} tone="clay" size={92} label="health" />
            </div>
          </div>
        </motion.section>

        <section aria-label="Step-down routine">
          <h2 className="font-serif text-2xl text-ink">Step-down routine</h2>

          <div className="relative mt-6">
            <span className="absolute left-0 right-0 top-10 hidden h-px bg-line lg:block" aria-hidden />
            <motion.span
              className="absolute left-0 top-10 hidden h-px bg-sage lg:block"
              initial={{ width: '0%' }}
              animate={{ width: committed ? '100%' : '17%' }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              aria-hidden
            />

            <ol className="grid gap-4 lg:grid-cols-3">
              {recoverySteps.map((step, i) => (
                <motion.li
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -3 }}
                  className={`relative flex flex-col rounded-3xl border p-6 shadow-calm ${
                    step.state === 'active' ? 'border-sage/40 bg-sage-wash' : 'border-line bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium ${
                        stepTone[step.state]
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink">{step.day}</p>
                      <p className="text-xs text-muted">{step.when}</p>
                    </div>
                    {step.state === 'active' && (
                      <span className="ml-auto rounded-full bg-sage px-3 py-1 text-[11px] font-medium text-white">
                        Tonight
                      </span>
                    )}
                  </div>

                  {step.state === 'active' ? (
                    <div className="mt-6 flex items-center gap-5">
                      <BreathingPacer size={80} />
                      <div>
                        <p className="font-serif text-2xl text-ink">{step.task}</p>
                        <p className="mt-1 text-sm text-muted">{step.duration}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-6 font-serif text-2xl text-ink">{step.task}</p>
                      <p className="mt-auto pt-2 text-sm text-muted">{step.duration}</p>
                    </>
                  )}
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-sidebar p-7 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl text-ink">Ready to recover?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                Committing locks the smaller targets for three days and pauses risk warnings for
                Reading while you rebuild.
              </p>
            </div>
            {committed ? (
              <motion.p
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-sage/40 bg-sage-wash px-5 py-3 text-sm font-medium text-sage-deep"
              >
                <Check className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                Committed — Day 1 starts tonight
              </motion.p>
            ) : (
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                onClick={() => setCommitted(true)}
                className="shrink-0 rounded-full bg-sage px-7 py-3.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-sage-deep"
              >
                Commit to 3-day recovery
              </motion.button>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
