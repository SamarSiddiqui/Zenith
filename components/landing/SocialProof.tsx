"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Reveal } from '../visuals/Reveal';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  highlight: string;
  metrics: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Elena R.',
    role: 'Senior Product Designer',
    quote: 'I used to abandon streak apps every time a sprint deadline hit. Zenith\'s 15-minute fallback versions saved my meditation habit 4 times last month alone.',
    highlight: 'Saved habit 4x during crunch',
    metrics: '92% Habit Health'
  },
  {
    name: 'David K.',
    role: 'Software Engineer',
    quote: 'Seeing that 80% of my missed workouts happened on days I worked past 7:30 PM was a revelation. It wasn\'t laziness; it was poor schedule design.',
    highlight: 'Diagnosed late-workday trigger',
    metrics: '3x More Recoveries'
  },
  {
    name: 'Maya S.',
    role: 'Creative Director',
    quote: 'The habit health score is so much more forgiving than zeroing counters. I don\'t dread opening the app after a busy weekend anymore.',
    highlight: 'No more zero-counter anxiety',
    metrics: '88% Median Health'
  }
];

export function SocialProof() {
  return (
    <section id="proof" className="border-t border-line bg-surface py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-10">
        <Reveal className="max-w-2xl">
          <div className="flex items-center gap-1 text-sage-deep">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-sage-deep text-sage-deep" />
            ))}
            <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-muted">Early User Proof</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
            Real people. Real schedule changes.
          </h2>
          <p className="mt-3 text-base text-muted">
            Here is how early Zenith users maintain identity consistency when life gets busy.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex h-full flex-col justify-between rounded-3xl border border-line bg-canvas p-7 shadow-calm"
              >
                <div>
                  <Quote className="h-6 w-6 text-sage/60" />
                  <p className="mt-4 font-serif text-base italic leading-relaxed text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <span className="mt-4 inline-block rounded-full bg-sage-wash px-3 py-1 text-xs font-medium text-sage-deep">
                    {t.highlight}
                  </span>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                  <span className="font-mono text-xs font-medium text-sage-deep">{t.metrics}</span>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
