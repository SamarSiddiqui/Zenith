"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { HealthRing } from '../visuals/HealthRing';

export function AuthVisualShowcase() {
  const [activeTab, setActiveTab] = useState<'window' | 'recovery'>('window');
  const [circadianProgress, setCircadianProgress] = useState(64);

  // Micro animation loop for circadian progress
  useEffect(() => {
    const interval = setInterval(() => {
      setCircadianProgress((prev) => (prev >= 90 ? 45 : prev + 1));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center space-y-6 select-none">
      {/* Brand Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-sage/30 bg-sage-wash/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-sage-deep shadow-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-sage animate-ping" />
          Circadian Consistency System
        </div>

        <h1 className="mt-3 font-serif text-3xl xl:text-4xl text-ink leading-tight">
          Consistency designed for your biological rhythm.
        </h1>
        <p className="mt-2 text-xs text-muted leading-relaxed max-w-md">
          Never sacrifice momentum to rigid streak counters. Manage habits within your living energy window.
        </p>
      </div>

      {/* Interactive Visual Toggle Pills */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('window')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
            activeTab === 'window'
              ? 'bg-surface text-ink shadow-calm border border-line font-semibold'
              : 'text-muted hover:text-ink bg-transparent'
          }`}
        >
          <Clock className="h-3.5 w-3.5 text-sage-deep" />
          <span>Working Window Gauge</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('recovery')}
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
            activeTab === 'recovery'
              ? 'bg-surface text-ink shadow-calm border border-line font-semibold'
              : 'text-muted hover:text-ink bg-transparent'
          }`}
        >
          <Zap className="h-3.5 w-3.5 text-sand" />
          <span>Health vs Streak Engine</span>
        </button>
      </div>

      {/* Main Showcase Visual Card */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-line bg-surface/90 p-5 shadow-calm backdrop-blur-md space-y-4 relative overflow-hidden"
      >
        {activeTab === 'window' ? (
          <>
            {/* Visual 1: Circadian Working Window */}
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sage-wash text-sage-deep">
                  <Sun className="h-3.5 w-3.5 text-sand animate-spin-slow" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-ink">Circadian Working Window</h4>
                  <p className="text-[11px] text-faint font-mono">09:00 AM — 07:00 PM</p>
                </div>
              </div>
              <span className="rounded-full bg-sage-wash px-2.5 py-0.5 text-[11px] font-semibold text-sage-deep font-mono border border-sage/20">
                6.4h Remaining
              </span>
            </div>

            {/* Visual Dial Progress Bar */}
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-between text-[11px] text-muted font-mono">
                <span className="flex items-center gap-1">
                  <Sun className="h-3 w-3 text-sand" /> 09:00 AM
                </span>
                <span className="text-sage-deep font-semibold">Active Focus Phase</span>
                <span className="flex items-center gap-1">
                  <Moon className="h-3 w-3 text-sage" /> 07:00 PM
                </span>
              </div>

              {/* Progress track with daytime sun gradient */}
              <div className="relative h-3 w-full rounded-full bg-canvas overflow-hidden border border-line/50 p-0.5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-sand via-sage to-sage-deep"
                  style={{ width: `${circadianProgress}%` }}
                />
              </div>
            </div>

            {/* Mini Habit Cards within Window */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="rounded-2xl border border-sage/30 bg-sage-wash/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-ink truncate">Deep Focus Sprint</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                  <span>45 mins</span>
                  <span className="text-sage-deep font-bold">96% Health</span>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-canvas/80 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-ink truncate">Breath & Reset</span>
                  <span className="flex h-2 w-2 rounded-full bg-sand animate-pulse" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                  <span>15 mins</span>
                  <span className="text-ink font-semibold">In window</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Visual 2: Streak vs Health Comparison */}
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sage-wash text-sage-deep">
                  <TrendingUp className="h-3.5 w-3.5 text-sage" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-ink">Streak vs Cumulative Health</h4>
                  <p className="text-[11px] text-faint">How Zenith protects your momentum</p>
                </div>
              </div>
            </div>

            {/* Side-by-side Visual Comparison */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Conventional Streak App (Fragile) */}
              <div className="rounded-2xl border border-clay/30 bg-clay-wash/50 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-clay uppercase tracking-wider font-mono">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Fragile Streak</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-serif font-bold text-ink line-through opacity-60">24 Days</span>
                  <ArrowRight className="h-3 w-3 text-clay" />
                  <span className="text-lg font-serif font-bold text-clay">0 Days</span>
                </div>
                <p className="text-[10px] text-clay/90 leading-tight">
                  1 missed day wipes all historical consistency to zero.
                </p>
              </div>

              {/* Zenith Cumulative Model (Resilient) */}
              <div className="rounded-2xl border border-sage/40 bg-sage-wash/60 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-sage-deep uppercase tracking-wider font-mono">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Zenith Health</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-serif font-bold text-ink">92%</span>
                  <ArrowRight className="h-3 w-3 text-sage-deep" />
                  <span className="text-lg font-serif font-bold text-sage-deep">89%</span>
                </div>
                <p className="text-[10px] text-sage-deep leading-tight">
                  Auto-converts into a 5-min micro-step. Zero guilt.
                </p>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Floating Micro-Pill Ribbons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <div className="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-surface/80 px-3 py-1.5 text-[11px] font-medium text-ink shadow-xs">
          <Shield className="h-3.5 w-3.5 text-sage-deep" />
          <span>Zero-Guilt Engine</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-surface/80 px-3 py-1.5 text-[11px] font-medium text-ink shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-sand" />
          <span>Micro-Recovery Protocol</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-2xl border border-line bg-surface/80 px-3 py-1.5 text-[11px] font-medium text-ink shadow-xs">
          <Clock className="h-3.5 w-3.5 text-sage-deep" />
          <span>Circadian Closes</span>
        </div>
      </div>
    </div>
  );
}
