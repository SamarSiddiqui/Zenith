"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Sparkles, Send, Timer, CheckCircle2 } from 'lucide-react';

type PillarId = 'focus' | 'ai' | 'telegram';

interface PillarItem {
  id: PillarId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  description: string;
}

const PILLARS: PillarItem[] = [
  {
    id: 'focus',
    label: 'Focus Sanctuary',
    shortLabel: 'Focus Grove',
    icon: TreePine,
    badge: 'Deep Work + Grove',
    description:
      'Enter distraction-free focus timers. Every completed session plants and grows a tree in your living Zen Grove.',
  },
  {
    id: 'ai',
    label: 'AI Diagnosis',
    shortLabel: 'AI Insights',
    icon: Sparkles,
    badge: 'Circadian Patterning',
    description:
      'Discover when your energy peaks and why certain habits slip—with calm, actionable schedule adjustments.',
  },
  {
    id: 'telegram',
    label: 'Telegram Nudges',
    shortLabel: 'EOD Nudges',
    icon: Send,
    badge: 'Gentle Check-ins',
    description:
      'Connect Telegram in Settings to get a single mindful digest when your working window closes—zero spam.',
  },
];

export function ChapterEcosystem() {
  const [activePillar, setActivePillar] = useState<PillarId>('focus');
  const [pausedAutoCycle, setPausedAutoCycle] = useState(false);

  // Gently cycle through the 3 ecosystem pillars unless user clicks one
  useEffect(() => {
    if (pausedAutoCycle) return;
    const order: PillarId[] = ['focus', 'ai', 'telegram'];
    const timer = setInterval(() => {
      setActivePillar((prev) => {
        const nextIdx = (order.indexOf(prev) + 1) % order.length;
        return order[nextIdx];
      });
    }, 3600);
    return () => clearInterval(timer);
  }, [pausedAutoCycle]);

  const currentItem = PILLARS.find((p) => p.id === activePillar) || PILLARS[0];

  return (
    <div className="space-y-3.5">
      {/* 3 Pillar Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          const isSelected = pillar.id === activePillar;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => {
                setPausedAutoCycle(true);
                setActivePillar(pillar.id);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? 'border-sage bg-sage-wash text-sage-deep shadow-xs font-semibold'
                  : 'border-line bg-canvas/70 text-muted hover:border-sage/40 hover:text-ink'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate sm:hidden">{pillar.shortLabel}</span>
              <span className="truncate hidden sm:inline">{pillar.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated Feature Preview Stage */}
      <div className="rounded-2xl border border-line bg-canvas/75 p-4 sm:p-5 min-h-[188px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {activePillar === 'focus' && (
            <motion.div
              key="focus"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              {/* Animated Growing SVG Tree */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-sage/30 bg-sage-wash/60 overflow-hidden">
                <svg viewBox="0 0 80 80" className="h-20 w-20" aria-hidden="true">
                  {/* Soil */}
                  <ellipse cx="40" cy="68" rx="22" ry="4" fill="#DDD9D1" />
                  {/* Trunk */}
                  <motion.path
                    d="M 40 67 L 40 42"
                    stroke="#7A6552"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                  {/* Canopy */}
                  <motion.circle
                    cx="40"
                    cy="34"
                    r="16"
                    fill="#8BA888"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.25, type: 'spring', stiffness: 180, damping: 14 }}
                  />
                  <motion.circle
                    cx="30"
                    cy="39"
                    r="11"
                    fill="#7A9A77"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.35, type: 'spring', stiffness: 180, damping: 14 }}
                  />
                  <motion.circle
                    cx="50"
                    cy="39"
                    r="11"
                    fill="#9AB897"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 14 }}
                  />
                </svg>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-surface px-2.5 py-0.5 text-[10px] font-mono font-semibold text-sage-deep">
                  <Timer className="h-3 w-3" />
                  <span>25:00 Deep Focus · Chime on Start &amp; End</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-ink">{currentItem.badge}</p>
                <p className="text-xs text-muted leading-relaxed">{currentItem.description}</p>
              </div>
            </motion.div>
          )}

          {activePillar === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="rounded-xl border border-sage/30 bg-surface p-3 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-sage-deep">
                  <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" />
                    <span>Zenith Pattern Insight</span>
                  </span>
                  <span className="rounded-full bg-sage-wash px-2 py-0.5">92% Morning Fit</span>
                </div>
                <p className="text-xs text-ink leading-relaxed">
                  &ldquo;Your deep reading ritual succeeds 3× more often before 11:00 AM than after 7:00 PM.&rdquo;
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-ink">{currentItem.badge}</p>
                <p className="text-xs text-muted leading-relaxed">{currentItem.description}</p>
              </div>
            </motion.div>
          )}

          {activePillar === 'telegram' && (
            <motion.div
              key="telegram"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div className="rounded-xl border border-sky-500/25 bg-surface p-3 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-sky-600">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Send className="h-3 w-3" />
                    <span>Zenith Bot · 7:00 PM</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-sage-deep">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>1-Click Log</span>
                  </span>
                </div>
                <p className="text-xs text-ink leading-relaxed">
                  &ldquo;Working window closing soon. Only <strong>Evening Reading</strong> left—want to log a 5m micro-step?&rdquo;
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold text-ink">{currentItem.badge}</p>
                <p className="text-xs text-muted leading-relaxed">{currentItem.description}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

