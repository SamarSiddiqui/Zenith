"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RotateCcw, Home, LayoutDashboard, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log unexpected runtime errors for observability
    console.error('[Zenith ErrorBoundary] Caught unhandled exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between relative overflow-hidden selection:bg-sage/20">
      {/* Background Zen Enso & Floating Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute w-[500px] h-[500px] bg-clay-wash/60 rounded-full blur-3xl -top-24 -right-24" />
        <div className="absolute w-[450px] h-[450px] bg-sage-wash/50 rounded-full blur-3xl -bottom-24 -left-24" />

        {/* Subtle decorative ring */}
        <div className="w-[420px] h-[420px] rounded-full border border-line/60 opacity-40 animate-pulse pointer-events-none" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-full bg-sage-wash overflow-hidden border border-sage/30 group-hover:scale-105 transition-transform shadow-xs flex items-center justify-center">
            <img src="/zenithBot.webp" alt="Zenith Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-serif text-2xl text-ink tracking-tight">Zenith</span>
        </Link>

        <Link
          href="/dashboard"
          className="text-xs font-medium text-muted hover:text-ink transition-colors flex items-center gap-1.5"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </header>

      {/* Main Error Content */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-line bg-surface p-8 sm:p-10 shadow-calm backdrop-blur-md"
        >
          {/* Calm Indicator Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-clay-wash text-clay border border-clay/30 shadow-xs mb-5">
            <AlertCircle className="h-7 w-7 stroke-[1.75]" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-clay/30 bg-clay-wash px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-clay mb-3">
            Temporary Rhythm Pause
          </span>

          <h1 className="font-serif text-2xl sm:text-3xl text-ink tracking-tight">
            A momentary pause in the flow
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-muted font-light leading-relaxed max-w-md mx-auto">
            An unexpected error interrupted this view. Your saved rituals, circadian logs, and sprint data remain safe in local memory.
          </p>

          {/* Action CTAs */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-2xl bg-sage-deep px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-sage transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore &amp; Try Again</span>
            </button>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-line bg-canvas hover:bg-surface px-5 py-2.5 text-xs font-semibold text-ink transition-colors shadow-xs"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Return Home</span>
            </Link>
          </div>

          {/* Technical Diagnostics Collapsible (Discreet for debugging) */}
          <div className="mt-8 pt-5 border-t border-line/60 text-left">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-[11px] font-mono text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <span>Technical Diagnostics {error?.digest ? `(ID: ${error.digest.slice(0, 8)})` : ''}</span>
              {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3.5 rounded-xl bg-canvas border border-line font-mono text-[11px] text-muted overflow-x-auto max-h-40"
              >
                <p className="text-clay font-medium">{error?.name || 'Error'}: {error?.message || 'Unknown runtime error'}</p>
                {error?.digest && <p className="mt-1 text-[10px] text-faint">Digest: {error.digest}</p>}
                {error?.stack && (
                  <pre className="mt-2 text-[10px] text-faint whitespace-pre-wrap leading-tight">
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 text-center text-[11px] text-faint font-mono">
        Zenith Resilience Engine · Consistency with Zero Guilt
      </footer>
    </div>
  );
}

