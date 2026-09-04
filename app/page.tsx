"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Storyboard } from '../components/landing/Storyboard';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { HealthShowcase } from '../components/landing/HealthShowcase';
import { StreakVsHealth } from '../components/landing/StreakVsHealth';
import { DayRibbon } from '../components/landing/DayRibbon';
import { IdentityClose } from '../components/landing/IdentityClose';
import { EnsoBackdrop } from '../components/landing/EnsoBackdrop';
import { CountUp } from '../components/visuals/CountUp';

const heroStats: Array<{ value: React.ReactNode; label: string }> = [
  { value: <><CountUp value={2} /> days</>, label: 'Average early warning' },
  { value: <CountUp value={84} suffix="%" />, label: 'Median habit health' },
  { value: <><CountUp value={4} />x</>, label: 'More recoveries than restarts' }
];

export default function LandingPage() {
  return (
    <div className="min-h-full w-full bg-canvas text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 lg:px-10">
          <span className="font-serif text-2xl tracking-tight text-ink">Zenith</span>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {[
              ['Features', '#features'],
              ['Philosophy', '#philosophy']
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="group relative text-sm text-muted transition-colors duration-150 ease-out hover:text-ink"
              >
                {label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-sage transition-[width] duration-200 ease-out group-hover:w-full" />
              </a>
            ))}
            <Link href="/login" className="text-sm text-muted transition-colors duration-150 ease-out hover:text-ink">
              Sign in
            </Link>
          </nav>
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.14, ease: 'easeOut' }}>
            <Link
              href="/dashboard"
              className="inline-block rounded-full bg-sage px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-sage-deep"
            >
              Begin journey
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-14 lg:px-10 lg:pb-24 lg:pt-24">
        <EnsoBackdrop />
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <h1 className="font-serif text-5xl leading-[1.05] text-ink md:text-6xl">
              Build habits that survive real life.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Zenith notices when your consistency is falling off — before you do. Built around
              your usable working hours.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.14, ease: 'easeOut' }}>
                <Link
                  href="/dashboard"
                  className="inline-block rounded-full bg-sage px-7 py-3.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-sage-deep"
                >
                  Start building free
                </Link>
              </motion.div>
              <a
                href="#philosophy"
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-6 py-3.5 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-sidebar"
              >
                Explore the philosophy
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </a>
            </div>

            {/* Early Differentiator Teaser (Feature 6) */}
            <div className="mt-7">
              <a
                href="#chapter-01"
                className="group inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage-wash/70 px-4 py-2 text-xs font-medium text-sage-deep transition-all duration-150 ease-out hover:border-sage hover:bg-sage-wash"
              >
                <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Why Zenith
                </span>
                <span>Same 22 days, different system: why streaks break when life happens &rarr;</span>
              </a>
            </div>

            <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-7">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-serif text-2xl text-ink">{stat.value}</span>
                    <span className="mt-0.5 block text-xs text-muted">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
          >
            <Storyboard />
          </motion.div>
        </div>

        <motion.nav
          aria-label="Chapters"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4"
        >
          {[
            ['01', 'Why streaks break', '#chapter-01'],
            ['02', 'Your working window', '#chapter-02'],
            ['03', 'What Zenith sees', '#chapter-03'],
            ['04', 'Who you become', '#philosophy']
          ].map(([num, label, href]) => (
            <a
              key={num}
              href={href}
              className="group flex items-center gap-3 bg-canvas px-5 py-4 transition-colors duration-150 ease-out hover:bg-surface"
            >
              <span className="font-serif text-lg text-faint transition-colors duration-150 ease-out group-hover:text-sage-deep">
                {num}
              </span>
              <span className="text-sm text-muted transition-colors duration-150 ease-out group-hover:text-ink">
                {label}
              </span>
            </a>
          ))}
        </motion.nav>
      </section>

      <StreakVsHealth />

      <DayRibbon />

      <HealthShowcase />

      <FeatureGrid />

      <IdentityClose />

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-10 text-xs text-faint sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span className="font-serif text-base text-ink">Zenith</span>
        <span>Your personal behavioral consistency system.</span>
      </footer>
    </div>
  );
}
