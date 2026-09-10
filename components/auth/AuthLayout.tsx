"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { AuthEnsoBackdrop } from './AuthEnsoBackdrop';
import { AuthVisualShowcase } from './AuthVisualShowcase';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

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
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-8 lg:px-10 lg:py-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          {/* Left Interactive Visual Showcase Column */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="hidden lg:flex lg:flex-col lg:justify-center pr-4"
          >
            <AuthVisualShowcase />
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

            <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-faint">
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
          <span>Circadian Behavioral Architecture</span>
        </div>
      </footer>
    </div>
  );
}
