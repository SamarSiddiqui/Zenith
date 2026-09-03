"use client";

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

const traits = ['reads', 'meditates', 'moves'];

/** Closing chapter: an enso drawn on scroll, with the identity framing inside it. */
export function IdentityClose() {
  const reduced = useReducedMotion();

  return (
    <section id="philosophy" className="scroll-mt-20 border-y border-line bg-sidebar">
      <div className="relative mx-auto w-full max-w-4xl px-5 py-24 text-center lg:px-10 lg:py-32">
        <svg
          viewBox="0 0 400 400"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 sm:h-[520px] sm:w-[520px]"
          aria-hidden
        >
          <motion.path
            d="M262 78 A 160 160 0 1 0 300 140"
            fill="none"
            stroke="var(--color-sage)"
            strokeOpacity="0.45"
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

          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="mx-auto mt-8 max-w-2xl font-serif text-3xl leading-snug text-ink md:text-[2.6rem] md:leading-[1.25]"
          >
            “You&apos;re not just tracking tasks. You are becoming a person who{' '}
            {traits.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0.25 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.28, delay: 0.35 + i * 0.12, ease: 'easeOut' }}
                className="text-sage-deep"
              >
                {t}
                {i < traits.length - 1 ? ', ' : ' '}
              </motion.span>
            ))}
            every day.”
          </motion.blockquote>

          <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-muted">
            Streaks measure obedience. Identity measures direction. Zenith is built to protect the
            second one — especially in the weeks the first one breaks.
          </p>

          <motion.div
            className="mt-10 inline-block"
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
          <p className="mt-4 text-xs text-faint">Free while you build the first three habits.</p>
        </div>
      </div>
    </section>
  );
}
