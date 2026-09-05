"use client";

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

const quotes = [
  {
    quote: '“Every action you take is a vote for the person you wish to become.”',
    author: 'James Clear',
    work: 'Author of Atomic Habits'
  },
  {
    quote: '“Whatever the mind can conceive and believe, it can achieve.”',
    author: 'Napoleon Hill',
    work: 'Author of Think & Grow Rich'
  },
  {
    quote: '“Discipline is the bridge between goals and accomplishment.”',
    author: 'Jim Rohn',
    work: 'Personal Development Pioneer'
  }
];

/** Closing chapter: two-beat wisdom + identity synthesis. */
export function IdentityClose() {
  const reduced = useReducedMotion();

  return (
    <section id="philosophy" className="scroll-mt-20 border-y border-line bg-sidebar">
      <div className="relative mx-auto w-full max-w-5xl px-5 py-24 text-center lg:px-10 lg:py-32">
        <svg
          viewBox="0 0 400 400"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-60 sm:h-[560px] sm:w-[560px]"
          aria-hidden
        >
          <motion.path
            d="M262 78 A 160 160 0 1 0 300 140"
            fill="none"
            stroke="var(--color-sage)"
            strokeOpacity="0.4"
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0.2 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
          />
        </svg>

        <div className="relative">
          <p className="text-xs uppercase tracking-[0.18em] text-faint">
            Chapter 04 · The point of all this
          </p>

          {/* Beat One: Horizontal Quote Triptych */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {quotes.map((q, i) => (
              <motion.div
                key={q.author}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col justify-between rounded-2xl border border-line bg-surface/90 p-6 text-left shadow-sm"
              >
                <p className="font-serif text-base italic leading-relaxed text-ink">{q.quote}</p>
                <div className="mt-6 border-t border-line/60 pt-4">
                  <p className="text-sm font-semibold text-ink">{q.author}</p>
                  <p className="mt-0.5 text-xs text-muted">{q.work}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Beat Two: Zenith Synthesis Landing Point */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.34, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="mt-16 rounded-3xl border border-sage/40 bg-canvas p-8 shadow-calm md:p-12"
          >
            <blockquote className="mx-auto max-w-3xl font-serif text-3xl leading-snug text-ink md:text-4xl md:leading-[1.25]">
              “Streaks measure obedience. Identity measures direction.”
            </blockquote>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted">
              Zenith is built to protect the second one — especially in the weeks the first one breaks.
            </p>

            <motion.div
              className="mt-9 inline-block"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
            >
              <Link
                href="/dashboard"
                className="inline-block rounded-full bg-sage px-8 py-4 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-sage-deep"
              >
                Begin your first window
              </Link>
            </motion.div>
            <p className="mt-3.5 text-xs text-faint">Free while you build the first three habits.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
