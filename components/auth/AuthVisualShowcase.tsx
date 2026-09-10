"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Sparkles, Feather, Compass, CheckCircle2 } from 'lucide-react';

interface AuthVisualShowcaseProps {
  variant?: 'circadian' | 'genesis';
  quotePrimary?: string;
  quoteSecondary?: string;
}

export function AuthVisualShowcase({
  variant = 'circadian',
  quotePrimary = "Streaks measure obedience.",
  quoteSecondary = "Identity measures direction.",
}: AuthVisualShowcaseProps) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 100);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 lg:p-8 select-none">
      {/* Ambient background glow */}
      <div className="absolute h-72 w-72 rounded-full bg-sage/10 blur-3xl pointer-events-none -z-10" />

      {variant === 'circadian' ? (
        /* ================= LOGIN VARIANT: CIRCADIAN CLOCK DIAL ================= */
        <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80">
          {/* Outer Hairline Compass Ring */}
          <div className="absolute inset-0 rounded-full border border-line/50" />
          
          {/* Subtle Dash Coordinates */}
          <div className="absolute inset-2 rounded-full border border-dashed border-line/30" />

          {/* Dynamic Circadian Glowing Arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-sage)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="264"
              initial={{ strokeDashoffset: 264 }}
              animate={{ strokeDashoffset: 95 }}
              transition={{ duration: 1.8, ease: [0.23, 1, 0.32, 1] }}
            />
          </svg>

          {/* Orbiting Celestial Marker (Sun) */}
          <motion.div
            className="absolute w-full h-full pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
          >
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-surface shadow-xs border border-sage/40">
                <span className="h-2 w-2 rounded-full bg-sage animate-ping opacity-75" />
                <span className="absolute h-2 w-2 rounded-full bg-sage" />
              </span>
            </div>
          </motion.div>

          {/* Inner Sanctuary Disc */}
          <div className="relative flex flex-col items-center justify-center rounded-full w-48 h-48 sm:w-56 sm:h-56 bg-surface/80 border border-line/60 shadow-calm backdrop-blur-md p-6 text-center">
            <span className="text-[10px] uppercase font-mono tracking-widest text-faint">
              Circadian Window
            </span>

            <span className="mt-1 font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
              6.4<span className="text-sm font-sans font-light text-muted ml-0.5">hrs</span>
            </span>

            <span className="mt-1 text-[11px] text-sage-deep font-medium bg-sage-wash/80 px-2.5 py-0.5 rounded-full border border-sage/20">
              Active Focus
            </span>

            <div className="mt-3 flex items-center gap-3 text-[10px] text-faint font-mono border-t border-line/50 pt-2.5">
              <span className="flex items-center gap-1">
                <Sun className="h-2.5 w-2.5 text-sand" /> 09:00
              </span>
              <span>—</span>
              <span className="flex items-center gap-1">
                <Moon className="h-2.5 w-2.5 text-sage" /> 19:00
              </span>
            </div>
          </div>

          {/* Floating Minimalist Tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute -top-3 right-0 rounded-full border border-line/60 bg-surface/90 px-3 py-1 shadow-xs backdrop-blur-xs flex items-center gap-1.5 text-[11px] text-ink font-mono"
          >
            <Sparkles className="h-3 w-3 text-sage-deep" />
            <span>Zero Guilt</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-3 left-0 rounded-full border border-line/60 bg-surface/90 px-3 py-1 shadow-xs backdrop-blur-xs flex items-center gap-1.5 text-[11px] text-muted font-mono"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            <span>Micro-Recovery</span>
          </motion.div>
        </div>
      ) : (
        /* ================= REGISTER VARIANT: HABIT GENESIS & FIRST LINE ================= */
        <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80">
          {/* Concentric Growth Ripple Geometry */}
          <div className="absolute inset-0 rounded-full border border-line/40 animate-pulse" />
          <div className="absolute inset-5 rounded-full border border-line/50" />
          <div className="absolute inset-10 rounded-full border border-dashed border-sage/30" />

          {/* Smooth Golden Arc SVG: "The First Honest Line" */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="genesisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-sand)" />
                <stop offset="50%" stopColor="var(--color-sage)" />
                <stop offset="100%" stopColor="var(--color-sage-deep)" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 20,50 A 30,30 0 1,1 80,50 A 20,20 0 1,1 50,70"
              fill="none"
              stroke="url(#genesisGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, ease: [0.23, 1, 0.32, 1] }}
            />
          </svg>

          {/* Inner Genesis Seed Disc */}
          <div className="relative flex flex-col items-center justify-center rounded-full w-48 h-48 sm:w-56 sm:h-56 bg-surface/85 border border-line/70 shadow-calm backdrop-blur-md p-6 text-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sage-wash text-sage-deep border border-sage/30 mb-1">
              <Feather className="h-3.5 w-3.5 stroke-[1.75]" />
            </div>

            <span className="text-[10px] uppercase font-mono tracking-widest text-faint">
              Genesis Origin
            </span>

            <span className="mt-0.5 font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight">
              Day 01
            </span>

            <span className="mt-1 text-[11px] text-sage-deep font-medium bg-sage-wash/80 px-2.5 py-0.5 rounded-full border border-sage/20">
              Honest Foundation
            </span>

            <div className="mt-2.5 flex items-center gap-2 text-[10px] text-faint font-mono border-t border-line/50 pt-2">
              <span className="text-sage-deep font-semibold">1% Compounding</span>
            </div>
          </div>

          {/* Floating Genesis Badges */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-2 -left-2 rounded-full border border-line/60 bg-surface/90 px-3 py-1 shadow-xs backdrop-blur-xs flex items-center gap-1.5 text-[11px] text-ink font-mono"
          >
            <Compass className="h-3 w-3 text-sage-deep" />
            <span>Clean Slate</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-2 right-0 rounded-full border border-line/60 bg-surface/90 px-3 py-1 shadow-xs backdrop-blur-xs flex items-center gap-1.5 text-[11px] text-sage-deep font-mono"
          >
            <CheckCircle2 className="h-3 w-3 text-sage" />
            <span>Identity First</span>
          </motion.div>
        </div>
      )}

      {/* Poetic Zen Philosophy Quotes */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8 text-center max-w-sm space-y-1.5"
      >
        <h3 className="font-serif text-xl sm:text-2xl text-ink leading-tight">
          {quotePrimary}
        </h3>
        {quoteSecondary && (
          <p className="font-serif text-lg sm:text-xl text-sage-deep italic font-normal">
            {quoteSecondary}
          </p>
        )}
      </motion.div>
    </div>
  );
}
