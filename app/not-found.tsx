"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  TreePine, 
  Sparkles, 
  CalendarRange, 
  Home, 
  Compass,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();

  const quickLinks = [
    {
      title: 'Dashboard',
      desc: 'Daily sprint & metrics',
      href: user ? '/dashboard' : '/login',
      icon: LayoutDashboard
    },
    {
      title: 'Focus Sanctuary',
      desc: 'Intervals & calming audio',
      href: user ? '/focus' : '/login',
      icon: TreePine
    },
    {
      title: 'AI Diagnosis',
      desc: 'Circadian friction analysis',
      href: user ? '/diagnosis' : '/login',
      icon: Sparkles
    },
    {
      title: 'Habits Planner',
      desc: 'Sprint goals & cadence',
      href: user ? '/habits' : '/login',
      icon: CalendarRange
    }
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between relative overflow-hidden selection:bg-sage/20">
      {/* Background Zen Enso & Floating Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute w-[600px] h-[600px] bg-sage-wash/60 rounded-full blur-3xl -top-40 -right-40" />
        <div className="absolute w-[500px] h-[500px] bg-clay-wash/50 rounded-full blur-3xl -bottom-32 -left-32" />

        {/* Breathing Enso Circle */}
        <motion.svg
          viewBox="0 0 400 400"
          className="absolute w-[440px] h-[440px] sm:w-[620px] sm:h-[620px] opacity-30 text-sage"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          aria-hidden
        >
          <circle
            cx="200"
            cy="200"
            r="160"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="6 14"
            strokeLinecap="round"
          />
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
        </motion.svg>
      </div>

      {/* Top Brand Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-full bg-sage-wash overflow-hidden border border-sage/30 group-hover:scale-105 transition-transform shadow-xs">
            <img src="/zenithBot.webp" alt="Zenith Logo" className="h-full w-full object-cover" />
          </div>
          <span className="font-serif text-2xl text-ink tracking-tight">Zenith</span>
        </Link>

        <Link
          href={user ? "/dashboard" : "/"}
          className="text-xs font-medium text-muted hover:text-ink transition-colors flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{user ? "Back to Dashboard" : "Back to Home"}</span>
        </Link>
      </header>

      {/* Main 404 Hero Section */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 py-8 text-center flex flex-col items-center my-auto">
        {/* Animated Avatar Orb */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="relative mb-6"
        >
          <div className="h-20 w-20 rounded-3xl bg-surface border border-sage/40 shadow-calm flex items-center justify-center p-2 relative group">
            <img src="/zenithBot.webp" alt="Zenith Bot" className="h-full w-full object-contain" />
            <motion.span 
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-clay text-[9px] font-bold text-white shadow-xs"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ?
            </motion.span>
          </div>
        </motion.div>

        {/* 404 Display */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="text-xs font-mono font-bold uppercase tracking-[0.22em] text-sage-deep bg-sage-wash px-3.5 py-1 rounded-full border border-sage/30">
            Error 404 · Uncharted Orbit
          </span>

          <h1 className="mt-4 font-serif text-4xl sm:text-5xl md:text-6xl text-ink tracking-tight">
            Lost in the white space.
          </h1>

          <p className="mt-4 max-w-lg mx-auto text-sm sm:text-base leading-relaxed text-muted">
            The page you seek has drifted outside your circadian window or does not exist. Take a mindful breath, reset your compass, and return to your rhythm.
          </p>

          <div className="mt-3 text-xs italic text-faint font-serif">
            “Ma (間) — the silence between notes that gives music its beauty.”
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href={user ? "/dashboard" : "/"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-white hover:bg-ink/90 transition-all text-xs font-semibold shadow-xs hover:shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-sage" />
            <span>{user ? "Return to Dashboard" : "Return to Home"}</span>
          </Link>

          <Link
            href={user ? "/focus" : "/login"}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-surface border border-line text-ink hover:bg-canvas hover:border-sage/40 transition-all text-xs font-medium shadow-xs"
          >
            <TreePine className="w-3.5 h-3.5 text-sage-deep" />
            <span>2-Min Reset in Focus</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </motion.div>

        {/* Quick Nav Destination Cards */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 w-full pt-8 border-t border-line/70"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-faint mb-4">
            Direct Coordinates
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-line bg-surface/70 hover:bg-surface hover:border-sage/40 p-3.5 transition-all shadow-xs"
                >
                  <div className="w-7 h-7 rounded-xl bg-canvas border border-line/60 flex items-center justify-center text-sage-deep group-hover:bg-sage-wash group-hover:border-sage/30 transition-colors">
                    <Icon className="w-3.5 h-3.5 stroke-[1.8]" />
                  </div>
                  <p className="mt-2.5 text-xs font-semibold text-ink group-hover:text-sage-deep transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-faint truncate">{item.desc}</p>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* Subtle Bottom Bar */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 text-center text-[11px] text-faint">
        Zenith Consistency Engine · Resilient Momentum Architecture
      </footer>
    </div>
  );
}
