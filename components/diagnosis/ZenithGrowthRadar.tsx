"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Activity, Check, HeartHandshake, Eye, BarChart3 } from 'lucide-react';
import type { ZenithScore } from '../../types/diagnosis';
import { calculateRhythmPersona } from '../../lib/constants/rhythmPersonas';

interface ZenithGrowthRadarProps {
  score: ZenithScore;
}

export function ZenithGrowthRadar({ score }: ZenithGrowthRadarProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'meaning'>('metrics');
  const [questCompleted, setQuestCompleted] = useState<boolean>(false);

  const overall = Math.min(100, Math.max(0, score.overall || 75));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  const persona = calculateRhythmPersona(score);

  const getScoreTheme = (val: number) => {
    if (val >= 80) {
      return {
        text: 'text-sage-deep',
        stroke: 'stroke-sage',
        glow: 'rgba(92, 131, 116, 0.25)',
        badge: 'border-sage/40 bg-sage-wash text-sage-deep',
        levelLabel: 'In Beautiful Flow',
      };
    }
    if (val >= 65) {
      return {
        text: 'text-sand',
        stroke: 'stroke-sand',
        glow: 'rgba(217, 119, 6, 0.2)',
        badge: 'border-sand/40 bg-sand/15 text-sand',
        levelLabel: 'Steady Momentum',
      };
    }
    return {
      text: 'text-clay',
      stroke: 'stroke-clay',
      glow: 'rgba(225, 112, 85, 0.2)',
      badge: 'border-clay/40 bg-clay-wash text-clay',
      levelLabel: 'Slightly Squeezed',
    };
  };

  const theme = getScoreTheme(overall);

  const subMetrics = [
    {
      id: 'circadian',
      label: 'Energy Fit',
      value: score.circadianFidelity ?? 85,
      subtitle: 'Habits in natural slots',
      meaning: persona.realLifeTranslation.energy,
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
      meaning: persona.realLifeTranslation.resilience,
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
      meaning: persona.realLifeTranslation.balance,
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
      className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-calm transition-all duration-300 hover:border-sage/40 hover:shadow-md w-full gap-5"
    >
      {/* Ambient glowing backdrop */}
      <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-sage/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Section: Persona Hero Badge & Witty Insight */}
      <div className="relative z-10 space-y-3 border-b border-line/60 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-deep" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sage-deep flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Your Real-Life Rhythm Persona
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-mono font-semibold shadow-xs ${persona.badgeStyle}`}
          >
            <span>{persona.emoji}</span>
            <span>{persona.title}</span>
          </span>
        </div>

        {/* Witty Quote & Superpower Box */}
        <div className="rounded-2xl border border-line/70 bg-canvas/80 p-3.5 flex items-start gap-3 shadow-xs">
          <div className="text-2xl select-none shrink-0">{persona.emoji}</div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-serif text-sm sm:text-base text-ink leading-snug italic">
              &ldquo;{persona.funnyQuote}&rdquo;
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-sage-deep font-semibold">
              <Sparkles className="h-3 w-3" />
              <span>Superpower: {persona.superpower}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Section: Radial Meter & Toggleable Breakdown */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Animated Radial Rhythm Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Outer rotating dashed aura */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
              className="absolute h-40 w-40 rounded-full border border-dashed border-line/60 pointer-events-none"
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

          <span
            className={`mt-3 inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-mono font-semibold ${theme.badge}`}
          >
            {theme.levelLabel}
          </span>
        </div>

        {/* Sub-Metrics / Meaning Section with View Switcher */}
        <div className="md:col-span-7 flex flex-col gap-3 w-full">
          {/* View Switcher Toggle */}
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
              Rhythm Pillars
            </span>

            <div className="flex items-center gap-1 rounded-xl bg-canvas p-1 border border-line">
              <button
                type="button"
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  activeTab === 'metrics'
                    ? 'bg-surface text-sage-deep shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <BarChart3 className="h-3 w-3" />
                <span>Stats</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('meaning')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  activeTab === 'meaning'
                    ? 'bg-surface text-sage-deep shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <HeartHandshake className="h-3 w-3" />
                <span>Meaning</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Stats & Progress Bars */}
          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2.5"
            >
              {subMetrics.map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.id}
                    className="group rounded-2xl border border-line bg-canvas/70 p-3 shadow-xs hover:border-sage/40 hover:bg-canvas transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-xl ${metric.bgWash} ${metric.iconColor} shrink-0`}
                        >
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

                    <div className="mt-2 h-1.5 w-full rounded-full bg-surface border border-line/60 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + idx * 0.08, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Tab 2: Plain-Human Meaning */}
          {activeTab === 'meaning' && (
            <motion.div
              key="meaning"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-2.5"
            >
              {subMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.id}
                    className="rounded-2xl border border-line bg-canvas/70 p-3 shadow-xs space-y-1"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink">
                      <Icon className={`h-3.5 w-3.5 ${metric.iconColor}`} />
                      <span>{metric.label}</span>
                    </div>
                    <p className="text-xs text-muted font-light leading-relaxed pl-5">
                      {metric.meaning}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Mini-Quest: Today's Low-Pressure Quest */}
      <div className="relative z-10 rounded-2xl border border-sage/30 bg-sage-wash/40 p-3.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="text-base select-none shrink-0">🌱</span>
          <div className="min-w-0">
            <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-sage-deep">
              Today&apos;s Low-Pressure Quest
            </span>
            <p className="text-xs text-ink font-medium leading-snug mt-0.5">
              {persona.lowPressureQuest}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setQuestCompleted(!questCompleted)}
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-semibold transition-all cursor-pointer shadow-xs ${
            questCompleted
              ? 'bg-sage-deep text-white border border-sage-deep'
              : 'border border-sage/40 bg-surface text-sage-deep hover:bg-sage hover:text-white'
          }`}
        >
          <Check className={`h-3.5 w-3.5 stroke-[2.5] ${questCompleted ? 'text-white' : 'text-sage-deep'}`} />
          <span>{questCompleted ? 'Done! 🎉' : 'Done'}</span>
        </button>
      </div>
    </motion.div>
  );
}


