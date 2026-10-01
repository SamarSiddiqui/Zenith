"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Activity } from 'lucide-react';
import type { ZenithScore } from '../../types/diagnosis';

interface ZenithGrowthRadarProps {
  score: ZenithScore;
}

export function ZenithGrowthRadar({ score }: ZenithGrowthRadarProps) {
  const overall = Math.min(100, Math.max(0, score.overall || 75));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  const getScoreTheme = (val: number) => {
    if (val >= 80) {
      return {
        text: 'text-sage-deep',
        stroke: 'stroke-sage',
        glow: 'rgba(92, 131, 116, 0.25)',
        badge: 'border-sage/40 bg-sage-wash text-sage-deep',
        label: 'In Beautiful Flow',
      };
    }
    if (val >= 65) {
      return {
        text: 'text-sand',
        stroke: 'stroke-sand',
        glow: 'rgba(217, 119, 6, 0.2)',
        badge: 'border-sand/40 bg-sand/15 text-sand',
        label: 'Steady Momentum',
      };
    }
    return {
      text: 'text-clay',
      stroke: 'stroke-clay',
      glow: 'rgba(225, 112, 85, 0.2)',
      badge: 'border-clay/40 bg-clay-wash text-clay',
      label: 'Slightly Squeezed',
    };
  };

  const theme = getScoreTheme(overall);

  const subMetrics = [
    {
      id: 'circadian',
      label: 'Energy Fit',
      value: score.circadianFidelity ?? 85,
      subtitle: 'Habits in natural slots',
      icon: Zap,
      color: 'from-amber-400 to-amber-500',
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgWash: 'bg-amber-500/10',
    },
    {
      id: 'resilience',
      label: 'Kind Resilience',
      value: score.recoveryResilience ?? 90,
      subtitle: 'Bouncing back with ease',
      icon: ShieldCheck,
      color: 'from-sage to-sage-deep',
      iconColor: 'text-sage-deep',
      bgWash: 'bg-sage-wash',
    },
    {
      id: 'balance',
      label: 'Breathing Room',
      value: score.balanceScore ?? 80,
      subtitle: 'Comfortable day balance',
      icon: Activity,
      color: 'from-sky-400 to-sky-600',
      iconColor: 'text-sky-600 dark:text-sky-400',
      bgWash: 'bg-sky-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-calm transition-all duration-300 hover:border-sage/40 hover:shadow-md w-full"
    >
      {/* Ambient background glow accents */}
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-sage/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-deep" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sage-deep flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Your Weekly Rhythm Evaluation
            </span>
          </div>
          <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-ink">
            {score.levelLabel || 'Finding Your Rhythm'}
          </h3>
        </div>

        <motion.span
          whileHover={{ scale: 1.04 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-mono font-semibold shadow-xs ${theme.badge}`}
        >
          <span>{theme.label}</span>
        </motion.span>
      </div>

      {/* Center content: Circular Ring + Sub-metrics list */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5">
        {/* Animated Radial Rhythm Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer subtle rotating pulse glow */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute h-40 w-40 rounded-full border border-dashed border-line/50 pointer-events-none"
            />

            <svg className="h-36 w-36 -rotate-90 transform" viewBox="0 0 144 144">
              {/* Background Track */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-canvas"
                strokeWidth="11"
                fill="transparent"
              />
              {/* Animated Value Arc */}
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className={theme.stroke}
                strokeWidth="11"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: `drop-shadow(0 0 8px ${theme.glow})`,
                }}
              />
            </svg>

            {/* Center Score Counter */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight"
              >
                {overall}
              </motion.span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted font-bold">
                Rhythm Score
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Metrics Breakdown List */}
        <div className="md:col-span-7 flex flex-col gap-2.5 w-full">
          {subMetrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + idx * 0.08 }}
                whileHover={{ scale: 1.01, x: 2 }}
                className="group rounded-2xl border border-line bg-canvas/70 p-3 shadow-xs hover:border-sage/40 hover:bg-canvas transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${metric.bgWash} ${metric.iconColor} shrink-0 transition-transform group-hover:scale-110`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-mono font-semibold text-ink truncate">
                        {metric.label}
                      </span>
                      <span className="block text-[10px] font-mono text-faint truncate">
                        {metric.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-ink">
                      {metric.value}%
                    </span>
                  </div>
                </div>

                {/* Animated Progress Bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-surface border border-line/60 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    transition={{ duration: 0.9, delay: 0.3 + idx * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

