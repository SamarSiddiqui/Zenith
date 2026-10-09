"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    zenithTranslation: 'Votes are cumulative, not continuous. Missing one Tuesday vote does not cancel 18 prior votes.',
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
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const ctaHref = user ? '/dashboard' : '/register';

  // GSAP ScrollTrigger entrance animation
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (containerRef.current) {
      tl.fromTo(
        containerRef.current.querySelectorAll('.gsap-identity-anim'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }
      );
    }

    return tl;
  });

  return (
    <section ref={sectionRef} id="philosophy" className="scroll-mt-20 border-y border-line bg-sidebar">
      <div ref={containerRef} className="relative mx-auto w-full max-w-5xl px-5 py-16 text-center lg:px-10 lg:py-20">
        {/* Background Decorative Enso Ring */}
        <svg
          viewBox="0 0 400 400"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-40 sm:h-[520px] sm:w-[520px]"
          aria-hidden
        >
          <circle cx="200" cy="200" r="160" fill="none" stroke="var(--color-sage)" strokeOpacity="0.2" strokeWidth="5" strokeDasharray="4 12" />
        </svg>

        <div className="relative">
          <p className="gsap-identity-anim text-xs font-semibold uppercase tracking-[0.18em] text-faint">
            Chapter 04 · Philosophy & Principles
          </p>
          <h2 className="gsap-identity-anim mt-2 font-serif text-3xl text-ink md:text-4xl">
            Who you become when streaks no longer dictate your worth.
          </h2>

          {/* Integrated 3 Philosophy Cards */}
          <div className="gsap-identity-anim mt-8 grid gap-5 md:grid-cols-3 text-left">
            {quotes.map((q) => (
              <div
                key={q.author}
                className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all hover:border-sage/40 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-sage-deep mb-2.5">
                    <span>{q.pillar}</span>
                  </div>
                  <p className="font-serif text-sm italic leading-relaxed text-ink">{q.quote}</p>
                  
                  <div className="mt-3 border-t border-line/60 pt-2.5">
                    <p className="text-xs font-semibold text-ink">{q.author}</p>
                    <p className="text-[11px] text-faint">{q.work}</p>
                  </div>
                </div>

                {/* Direct Architectural Translation */}
                <div className="mt-4 rounded-xl border border-sage/20 bg-sage-wash/50 p-3 text-[11px] leading-relaxed text-muted">
                  <div className="flex items-center gap-1.5 font-semibold text-sage-deep mb-1 text-[10px] uppercase font-mono">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Zenith Translation:</span>
                  </div>
                  <p>{q.zenithTranslation}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Zenith Synthesis Grand Statement */}
          <div className="gsap-identity-anim mt-10 rounded-3xl border border-sage/40 bg-canvas p-8 shadow-calm md:p-10">
            <blockquote className="mx-auto max-w-2xl font-serif text-2xl leading-snug text-ink md:text-3xl">
              “Streaks measure obedience. Identity measures direction.”
            </blockquote>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
              Zenith is built to protect your behavioral identity — especially during the weeks your schedule collapses.
            </p>

            <motion.div
              className="mt-7 inline-block"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
            >
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-sage px-8 py-3.5 text-xs font-medium text-white transition-colors duration-150 ease-out hover:bg-sage-deep shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>{user ? 'Go to Dashboard' : 'Begin your first window'}</span>
              </Link>
            </motion.div>
            <p className="mt-2.5 text-[11px] text-faint">Free while you build your first three habits.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
