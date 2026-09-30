"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Activity, Info } from 'lucide-react';
import type { ZenithScore } from '../../types/diagnosis';

interface ZenithGrowthRadarProps {
  score: ZenithScore;
}

export function ZenithGrowthRadar({ score }: ZenithGrowthRadarProps) {
  const overall = Math.min(100, Math.max(0, score.overall || 75));
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 80) return 'text-sage-deep stroke-sage';
    if (val >= 65) return 'text-sand stroke-sand';
    return 'text-clay stroke-clay';
  };

  const getScoreBadgeStyle = (val: number) => {
    if (val >= 80) return 'border-sage/40 bg-sage-wash text-sage-deep';
    if (val >= 65) return 'border-sand/40 bg-sand/10 text-sand';
    return 'border-clay/40 bg-clay-wash text-clay';
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-calm">
      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 140 140">
          {/* Background Track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            className="stroke-canvas"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            className={getScoreColor(overall)}
            strokeWidth="10"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Score Label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-serif text-3xl sm:text-4xl font-bold text-ink"
          >
            {overall}
          </motion.span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-semibold">
            Zenith Index
          </span>
        </div>
      </div>

      {/* Score Breakdown & Level Details */}
      <div className="flex-1 w-full space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sage-deep flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                AI Growth Evaluation
              </span>
            </div>
            <h3 className="mt-0.5 font-serif text-xl sm:text-2xl font-bold text-ink">
              {score.levelLabel || 'Sustained Momentum'}
            </h3>
          </div>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-mono font-semibold ${getScoreBadgeStyle(
              overall
            )}`}
          >
            {overall >= 80 ? 'Peak Alignment' : overall >= 65 ? 'Active Ascendance' : 'Compression Warning'}
          </span>
        </div>

        {/* Sub-Metric Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Metric 1: Circadian Fidelity */}
          <div className="rounded-2xl border border-line bg-canvas/70 p-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                Circadian
              </span>
              <span className="font-bold text-ink">{score.circadianFidelity}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-surface border border-line/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${score.circadianFidelity}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            <span className="block mt-1.5 text-[10px] font-mono text-faint">Biological alignment</span>
          </div>

          {/* Metric 2: Recovery Resilience */}
          <div className="rounded-2xl border border-line bg-canvas/70 p-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-sage-deep" />
                Resilience
              </span>
              <span className="font-bold text-ink">{score.recoveryResilience}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-surface border border-line/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-sage"
                initial={{ width: 0 }}
                animate={{ width: `${score.recoveryResilience}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>
            <span className="block mt-1.5 text-[10px] font-mono text-faint">48h bounce-back rate</span>
          </div>

          {/* Metric 3: Horizon Balance */}
          <div className="rounded-2xl border border-line bg-canvas/70 p-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted flex items-center gap-1">
                <Activity className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                Balance
              </span>
              <span className="font-bold text-ink">{score.balanceScore}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-surface border border-line/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-sky-500"
                initial={{ width: 0 }}
                animate={{ width: `${score.balanceScore}%` }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
            </div>
            <span className="block mt-1.5 text-[10px] font-mono text-faint">Schedule capacity fit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
