"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { FeatureGrid } from '../components/landing/FeatureGrid';
import { HealthShowcase } from '../components/landing/HealthShowcase';
import { StreakVsHealth } from '../components/landing/StreakVsHealth';
import { DayRibbon } from '../components/landing/DayRibbon';
import { IdentityClose } from '../components/landing/IdentityClose';
import { SocialProof } from '../components/landing/SocialProof';
import { TrustFAQ } from '../components/landing/TrustFAQ';
import { EnsoBackdrop } from '../components/landing/EnsoBackdrop';
import { CountUp } from '../components/visuals/CountUp';
import { useGSAPTimeline } from '../hooks/useGSAPTimeline';

const heroStats: Array<{ value: React.ReactNode; label: string }> = [
  { value: <><CountUp value={2} /> days</>, label: 'Early warning' },
  { value: <CountUp value={84} suffix="%" />, label: 'Median health' },
  { value: <><CountUp value={4} />x</>, label: 'Recovery rate' }
];

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);

  useGSAPTimeline((gsap) => {
    if (!heroRef.current) return gsap.timeline();
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.fromTo(
      heroRef.current.querySelectorAll('.gsap-hero-anim'),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }
    );

    return tl;
  }, []);

  return (
    <div className="min-h-full w-full bg-canvas text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 lg:px-10">
          <span className="font-serif text-2xl tracking-tight text-ink">Zenith</span>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {[
              ['Features', '#features'],
              ['Philosophy', '#philosophy'],
              ['Proof', '#proof'],
              ['FAQ', '#faq']
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

      {/* Option 1: Zen Single-Column Editorial Hero */}
      <section ref={heroRef} className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-20 lg:px-10 lg:pb-32 lg:pt-32">
        <EnsoBackdrop />

        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Subtle Category Pill */}
          <div className="gsap-hero-anim mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage-wash/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sage-deep shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-sage-deep animate-pulse" />
              Behavioral Consistency Engine
            </span>
          </div>

          {/* Headline */}
          <h1 className="gsap-hero-anim font-serif text-5xl leading-[1.06] text-ink md:text-7xl tracking-tight">
            Build habits that survive real life.
          </h1>

          {/* Subtitle */}
          <p className="gsap-hero-anim mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl font-normal">
            The behavioral consistency system designed for real schedules — catching schedule fatigue before your streak breaks.
          </p>

          {/* Primary CTA */}
          <div className="gsap-hero-anim mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.14, ease: 'easeOut' }}>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-sage px-8 py-4 text-base font-medium text-white shadow-sm transition-colors duration-150 ease-out hover:bg-sage-deep"
              >
                Start building free
              </Link>
            </motion.div>
            <a
              href="#philosophy"
              className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-7 py-4 text-base font-medium text-ink transition-colors duration-150 ease-out hover:bg-sidebar"
            >
              Explore the philosophy
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-150 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </a>
          </div>

          {/* Hairline Stat Strip */}
          <dl className="gsap-hero-anim mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-line/70 pt-8 text-center">
            {heroStats.map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <span className="text-line hidden sm:inline">•</span>}
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-semibold text-ink">{stat.value}</span>
                  <span className="text-xs text-muted">{stat.label}</span>
                </div>
              </React.Fragment>
            ))}
          </dl>
        </div>

        {/* Chapter Quick Navigation */}
        <nav
          aria-label="Chapters"
          className="gsap-hero-anim mt-20 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4 shadow-xs"
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
              className="group flex items-center justify-center gap-3 bg-canvas px-5 py-4.5 transition-colors duration-150 ease-out hover:bg-surface"
            >
              <span className="font-serif text-lg text-faint transition-colors duration-150 ease-out group-hover:text-sage-deep">
                {num}
              </span>
              <span className="text-sm font-medium text-muted transition-colors duration-150 ease-out group-hover:text-ink">
                {label}
              </span>
            </a>
          ))}
        </nav>
      </section>

      <StreakVsHealth />

      <DayRibbon />

      <HealthShowcase />

      <FeatureGrid />

      <IdentityClose />

      <SocialProof />

      <TrustFAQ />

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-10 text-xs text-faint sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span className="font-serif text-base text-ink">Zenith</span>
        <span>Your personal behavioral consistency system.</span>
      </footer>
    </div>
  );
}
