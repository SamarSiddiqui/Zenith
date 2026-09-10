"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Clock, ArrowLeft } from 'lucide-react';
import { AuthEnsoBackdrop } from './AuthEnsoBackdrop';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const authPillars = [
  {
    icon: Clock,
    title: 'Usable Working Window',
    description: 'Scheduled around your actual available time, not an artificial 24-hour day.'
  },
  {
    icon: Sparkles,
    title: 'Adaptive Recovery Engine',
    description: 'Shrink habits into 5-min micro-versions during crunch weeks with zero guilt.'
  },
  {
    icon: ShieldCheck,
    title: 'Cumulative Evidence Model',
    description: 'Your consistency score is resilient — one missed Tuesday never zeroes out your progress.'
  }
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-canvas text-ink flex flex-col justify-between overflow-x-hidden selection:bg-sage-wash selection:text-sage-deep">
      <AuthEnsoBackdrop />

      {/* Top Navigation */}
      <header className="w-full border-b border-line/60 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 lg:px-10">
          <Link href="/" className="font-serif text-2xl tracking-tight text-ink hover:opacity-80 transition-opacity">
            Zenith
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to overview
          </Link>
        </div>
      </header>

      {/* Main Content Split Layout */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-10 lg:px-10 lg:py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Left Hero / Brand Philosophy Column */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="hidden lg:flex lg:flex-col lg:justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage-wash/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sage-deep w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-sage-deep animate-pulse" />
              Behavioral Consistency System
            </div>

            <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-ink xl:text-5xl">
              Consistency designed for real schedules.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted max-w-lg">
              Zenith notices when your energy and time are compressing before streak abandonment sets in.
            </p>

            {/* Feature Value Cards */}
            <div className="mt-8 space-y-3.5 max-w-lg">
              {authPillars.map(({ icon: Icon, title: pillarTitle, description }) => (
                <div
                  key={pillarTitle}
                  className="flex items-start gap-3.5 rounded-2xl border border-line/70 bg-surface/70 p-4 shadow-xs backdrop-blur-xs"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sage-wash text-sage-deep">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold text-ink uppercase tracking-wide font-mono">
                      {pillarTitle}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Form Column */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-md mx-auto"
          >
            <div className="rounded-3xl border border-line/80 bg-surface/95 p-7 sm:p-9 shadow-calm backdrop-blur-md">
              <div className="mb-6 text-left">
                <h2 className="font-serif text-2xl text-ink sm:text-3xl">{title}</h2>
                <p className="mt-1.5 text-xs text-muted leading-relaxed">{subtitle}</p>
              </div>

              {children}
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-faint">
              <ShieldCheck className="h-3.5 w-3.5 text-sage-deep" />
              <span>256-bit encrypted · Private behavioral data</span>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-line/60 bg-canvas/80 py-4 text-center text-xs text-faint">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 lg:px-10">
          <span>Zenith Systems © 2026</span>
          <span>Behavioral Consistency Architecture</span>
        </div>
      </footer>
    </div>
  );
}
