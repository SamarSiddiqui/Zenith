"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';

interface QuoteItem {
  id: string;
  quote: string;
  author: string;
  work: string;
  zenithTranslation: string;
  pillar: string;
}

const quotes: QuoteItem[] = [
  {
    id: 'clear',
    quote: '“Every action you take is a vote for the person you wish to become.”',
    author: 'James Clear',
    work: 'Author of Atomic Habits',
    zenithTranslation: 'Votes are cumulative, not continuous. Missing one Tuesday vote doesn’t cancel 18 prior votes.',
    pillar: 'Cumulative Evidence Model'
  },
  {
    id: 'hill',
    quote: '“Whatever the mind can conceive and believe, it can achieve.”',
    author: 'Napoleon Hill',
    work: 'Author of Think & Grow Rich',
    zenithTranslation: 'Belief requires momentum, not perfection. Zenith protects momentum when schedules collapse.',
    pillar: 'Resilient Momentum Shield'
  },
  {
    id: 'rohn',
    quote: '“Discipline is the bridge between goals and accomplishment.”',
    author: 'Jim Rohn',
    work: 'Personal Development Pioneer',
    zenithTranslation: 'Discipline requires schedule design. Zenith builds the bridge around your real working hours.',
    pillar: 'Schedule Architecture'
  }
];

export function IdentityClose() {
  const [activeQuote, setActiveQuote] = useState<QuoteItem>(quotes[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger entrance animation
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (containerRef.current) {
      tl.fromTo(
        containerRef.current.querySelectorAll('.gsap-identity-anim'),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }
      );
    }

    return tl;
  });

  return (
    <section ref={sectionRef} id="philosophy" className="scroll-mt-20 border-y border-line bg-sidebar">
      <div ref={containerRef} className="relative mx-auto w-full max-w-5xl px-5 py-24 text-center lg:px-10 lg:py-32">
        {/* Background Decorative Enso Ring */}
        <svg
          viewBox="0 0 400 400"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-50 sm:h-[560px] sm:w-[560px]"
          aria-hidden
        >
          <circle cx="200" cy="200" r="160" fill="none" stroke="var(--color-sage)" strokeOpacity="0.25" strokeWidth="6" strokeDasharray="4 12" />
        </svg>

        <div className="relative">
          <p className="gsap-identity-anim text-xs font-semibold uppercase tracking-[0.18em] text-faint">
            Chapter 04 · Philosophy & Principles
          </p>

          {/* Interactive Author Selector Tabs */}
          <div className="gsap-identity-anim mt-6 inline-flex flex-wrap justify-center gap-2 rounded-full border border-line bg-canvas p-1.5 shadow-xs">
            {quotes.map((q) => (
              <button
                key={q.id}
                onClick={() => setActiveQuote(q)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  activeQuote.id === q.id
                    ? 'bg-sage-deep text-white shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {q.author}
              </button>
            ))}
          </div>

          {/* Triptych Quote Cards */}
          <div className="gsap-identity-anim mt-10 grid gap-6 md:grid-cols-3">
            {quotes.map((q) => {
              const isSelected = activeQuote.id === q.id;
              return (
                <div
                  key={q.author}
                  onClick={() => setActiveQuote(q)}
                  className={`cursor-pointer flex flex-col justify-between rounded-2xl border p-6 text-left transition-all ${
                    isSelected
                      ? 'border-sage bg-surface shadow-md ring-2 ring-sage/20 scale-[1.02]'
                      : 'border-line bg-surface/70 hover:bg-surface hover:border-line/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-sage-deep mb-3">
                      <span className="flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5" />
                        {q.pillar}
                      </span>
                    </div>
                    <p className="font-serif text-base italic leading-relaxed text-ink">{q.quote}</p>
                  </div>

                  <div className="mt-6 border-t border-line/60 pt-4">
                    <p className="text-sm font-semibold text-ink">{q.author}</p>
                    <p className="mt-0.5 text-xs text-muted">{q.work}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Zenith Architectural Translation Box */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeQuote.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="gsap-identity-anim mt-8 mx-auto max-w-2xl rounded-2xl border border-sage/30 bg-surface p-5 text-left shadow-xs"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-sage-deep uppercase tracking-wider mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>How Zenith Translates {activeQuote.author}&apos;s Insight:</span>
              </div>
              <p className="text-xs leading-relaxed text-muted">{activeQuote.zenithTranslation}</p>
            </motion.div>
          </AnimatePresence>

          {/* Zenith Synthesis Grand Statement */}
          <div className="gsap-identity-anim mt-16 rounded-3xl border border-sage/40 bg-canvas p-8 shadow-calm md:p-12">
            <blockquote className="mx-auto max-w-3xl font-serif text-3xl leading-snug text-ink md:text-4xl md:leading-[1.25]">
              “Streaks measure obedience. Identity measures direction.”
            </blockquote>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted">
              Zenith is built to protect your behavioral identity — especially during the weeks your streak breaks.
            </p>

            <motion.div
              className="mt-9 inline-block"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-sage px-8 py-4 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-sage-deep shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                Begin your first window
              </Link>
            </motion.div>
            <p className="mt-3.5 text-xs text-faint">Free while you build your first three habits.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
