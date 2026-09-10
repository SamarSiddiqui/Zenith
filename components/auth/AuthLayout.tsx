"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { AuthEnsoBackdrop } from './AuthEnsoBackdrop';
import { AuthVisualShowcase } from './AuthVisualShowcase';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  visualVariant?: 'circadian' | 'genesis';
  quotePrimary?: string;
  quoteSecondary?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  visualVariant = 'circadian',
  quotePrimary,
  quoteSecondary,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full bg-canvas text-ink flex flex-col justify-between overflow-x-hidden selection:bg-sage-wash selection:text-sage-deep font-sans">
      <AuthEnsoBackdrop />

      {/* Minimal Top Header */}
      <header className="w-full border-b border-line/40 bg-canvas/60 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-2xl tracking-tight text-ink hover:opacity-80 transition-opacity">
            Zenith
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors font-light"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Overview</span>
          </Link>
        </div>
      </header>

      {/* Main Sanctuary Grid */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 py-10 lg:py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Minimal Visual Artpiece with Philosophy Quote */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="hidden lg:flex lg:items-center lg:justify-center"
          >
            <AuthVisualShowcase
              variant={visualVariant}
              quotePrimary={quotePrimary}
              quoteSecondary={quoteSecondary}
            />
          </motion.div>

          {/* Right Minimal Glass Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-sm mx-auto"
          >
            <div className="rounded-3xl border border-line/70 bg-surface/85 p-8 sm:p-9 shadow-calm backdrop-blur-xl">
              <div className="mb-7 text-left">
                <h2 className="font-serif text-3xl text-ink tracking-tight">{title}</h2>
                <p className="mt-1.5 text-xs text-muted leading-relaxed font-light">{subtitle}</p>
              </div>

              {children}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Whisper-quiet Minimal Footer */}
      <footer className="w-full border-t border-line/30 bg-canvas/40 py-4 text-center text-[11px] text-faint font-light">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <span>Zenith Systems</span>
          <span className="font-mono">Circadian Architecture</span>
        </div>
      </footer>
    </div>
  );
}
