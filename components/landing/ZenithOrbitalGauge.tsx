"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HealthRing } from '../visuals/HealthRing';
import { ShieldCheck, AlertCircle } from 'lucide-react';

type EngineMode = 'normal' | 'overrun';

interface HabitNode {
  label: string;
  time: string;
  normalStatus: string;
  overrunStatus: string;
  isAdapted?: boolean;
}

const habitNodes: HabitNode[] = [
  { label: 'Morning Flow 🌿', time: '07:30 AM', normalStatus: 'Completed (30m)', overrunStatus: 'Completed (30m)' },
  { label: 'Deep Focus ⚡', time: '01:00 PM', normalStatus: 'Completed (45m)', overrunStatus: 'Completed (45m)' },
  { label: 'Evening Rest 📖', time: '08:45 PM', normalStatus: 'Completed (30m)', overrunStatus: 'Auto-scaled (5m micro)', isAdapted: true }
];

export function ZenithOrbitalGauge() {
  const [mode, setMode] = useState<EngineMode>('normal');

  const healthScore = mode === 'normal' ? 84 : 72;
  const tone = mode === 'normal' ? 'sage' : 'clay';

  return (
    <div className="relative mx-auto w-full max-w-md rounded-3xl border border-line/80 bg-surface/90 p-6 sm:p-8 shadow-calm backdrop-blur-md transition-all">
      {/* Top Bar with Mode Toggle */}
      <div className="flex items-center justify-between border-b border-line/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${mode === 'normal' ? 'bg-sage' : 'bg-clay'} opacity-75`}></span>
            <span className={`relative inline-flex h-2 w-2 rounded-full ${mode === 'normal' ? 'bg-sage' : 'bg-clay'}`}></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted font-mono">
            Zenith Engine
          </span>
        </div>

        {/* Minimal Mode Toggle */}
        <div className="inline-flex rounded-full border border-line bg-canvas p-0.5 shadow-xs">
          <button
            onClick={() => setMode('normal')}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              mode === 'normal'
                ? 'bg-sage-deep text-white shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            Normal Window
          </button>
          <button
            onClick={() => setMode('overrun')}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              mode === 'overrun'
                ? 'bg-clay text-white shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            Work Overrun
          </button>
        </div>
      </div>

      {/* Central Health Gauge */}
      <div className="my-8 flex flex-col items-center justify-center text-center">
        <div className="relative flex items-center justify-center">
          <HealthRing value={healthScore} tone={tone} size={112} stroke={8} />

          {/* Ambient Glow */}
          <div
            className={`pointer-events-none absolute h-32 w-32 rounded-full blur-2xl transition-opacity duration-500 ${
              mode === 'normal' ? 'bg-sage/20' : 'bg-clay/20'
            }`}
          />
        </div>

        <p className="mt-3 text-xs font-medium text-muted">
          {mode === 'normal' ? 'Median Consistency Score' : 'Adaptive Consistency Index'}
        </p>
      </div>

      {/* Habit Nodes Cards */}
      <div className="space-y-2.5">
        {habitNodes.map((node) => {
          const isOverrunAdapted = mode === 'overrun' && node.isAdapted;
          return (
            <div
              key={node.label}
              className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all text-xs ${
                isOverrunAdapted
                  ? 'border-clay/40 bg-clay-wash/70 text-clay font-medium'
                  : 'border-line/70 bg-canvas/80 text-ink'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{node.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-faint font-mono">{node.time}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                    isOverrunAdapted
                      ? 'bg-clay text-white'
                      : 'bg-sage-wash text-sage-deep'
                  }`}
                >
                  {mode === 'normal' ? node.normalStatus : node.overrunStatus}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Live System Callout */}
      <div className="mt-6 border-t border-line/60 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl p-3 text-xs font-medium flex items-center justify-between ${
              mode === 'normal'
                ? 'bg-sage-wash/80 border border-sage/30 text-sage-deep'
                : 'bg-clay-wash/80 border border-clay/30 text-clay'
            }`}
          >
            <div className="flex items-center gap-2">
              {mode === 'normal' ? (
                <ShieldCheck className="h-4 w-4 text-sage-deep shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-clay shrink-0" />
              )}
              <span>
                {mode === 'normal'
                  ? 'Optimal schedule alignment — 4 habits on track.'
                  : 'Zenith auto-scaled reading slot to 5 min — zero reset penalty.'}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
