"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sunset, Clock } from 'lucide-react';

interface MomentOption {
  id: string;
  label: string;
  time: string;
  t: number; // 0..1 along the circadian arc
  isOpen: boolean;
  headline: string;
  detail: string;
}

const MOMENTS: MomentOption[] = [
  {
    id: 'morning',
    label: 'Start',
    time: '9:00 AM',
    t: 0.1,
    isOpen: true,
    headline: 'Window Opens · Morning Clarity',
    detail: 'Your daily rituals wake up gently right when your energy begins.',
  },
  {
    id: 'midday',
    label: 'Peak',
    time: '2:00 PM',
    t: 0.5,
    isOpen: true,
    headline: 'Usable Window Active · 5h Left',
    detail: 'Zenith keeps your focus bar moving so you always know your real remaining hours.',
  },
  {
    id: 'sunset',
    label: 'Wind Down',
    time: '6:30 PM',
    t: 0.84,
    isOpen: true,
    headline: 'Golden Hour · Gentle Nudge',
    detail: 'Still have 1 ritual left? Shrink it to 5 minutes before sunset closes your window.',
  },
  {
    id: 'night',
    label: 'Rest',
    time: '9:30 PM',
    t: 0.96,
    isOpen: false,
    headline: 'Window Closed · Zero Guilt Rest',
    detail: 'After 7:00 PM, Zenith pauses expectations so you can truly disconnect and recover.',
  },
];

// Quadratic Bezier coordinates along M 24 108 Q 160 12 296 108
function getArcPoint(t: number) {
  const x0 = 24, y0 = 108;
  const x1 = 160, y1 = 12;
  const x2 = 296, y2 = 108;
  const oneMinusT = 1 - t;
  const x = oneMinusT * oneMinusT * x0 + 2 * oneMinusT * t * x1 + t * t * x2;
  const y = oneMinusT * oneMinusT * y0 + 2 * oneMinusT * t * y1 + t * t * y2;
  return { x, y };
}

export function ChapterWorkingWindow() {
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Subtle intro progression from Morning -> Peak if user hasn't clicked yet
  useEffect(() => {
    setSelectedIndex(0);
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setSelectedIndex(1);
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const activeMoment = MOMENTS[selectedIndex];
  const orbPos = getArcPoint(activeMoment.t);

  return (
    <div className="space-y-4">
      {/* Circadian Sky Card */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 transition-colors duration-500 ${
          activeMoment.isOpen
            ? 'border-sage/35 bg-gradient-to-b from-amber-50/70 via-canvas/70 to-sage-wash/40'
            : 'border-line bg-gradient-to-b from-sidebar/90 via-canvas to-sidebar/60'
        }`}
      >
        {/* Top Window Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-ink">
            <Clock className="h-3.5 w-3.5 text-sage-deep" />
            <span>09:00 AM — 07:00 PM</span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold border transition-colors ${
              activeMoment.isOpen
                ? 'bg-sage-wash text-sage-deep border-sage/30'
                : 'bg-surface text-muted border-line'
            }`}
          >
            {activeMoment.isOpen ? (
              <Sun className="h-3 w-3 text-amber-500" />
            ) : (
              <Moon className="h-3 w-3 text-sage-deep" />
            )}
            <span>{activeMoment.isOpen ? 'Window Open' : 'Resting'}</span>
          </span>
        </div>

        {/* SVG Horizon Arc */}
        <div className="relative mx-auto w-full max-w-[320px]">
          <svg viewBox="0 0 320 124" className="w-full h-auto overflow-visible" aria-hidden="true">
            {/* Horizon Baseline */}
            <line
              x1="16"
              y1="108"
              x2="304"
              y2="108"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="text-line"
            />

            {/* Inactive Full Arc */}
            <path
              d="M 24 108 Q 160 12 296 108"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-line/70"
            />

            {/* Active Energy Arc Segment (09:00 -> 19:00) */}
            <motion.path
              d="M 24 108 Q 160 12 296 108"
              fill="none"
              stroke={activeMoment.isOpen ? '#8BA888' : '#B5B3AD'}
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0.1 }}
              animate={{ pathLength: activeMoment.t }}
              transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
            />

            {/* Sunset Marker at 7 PM (~0.88 along arc) */}
            <circle cx={getArcPoint(0.88).x} cy={getArcPoint(0.88).y} r="3.5" fill="#C4756E" opacity="0.7" />

            {/* Moving Sun / Moon Orb */}
            <motion.g
              initial={false}
              animate={{ x: orbPos.x, y: orbPos.y }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              <circle
                r="14"
                fill={activeMoment.isOpen ? '#F59E0B' : '#7A9A77'}
                opacity="0.18"
              />
              <circle
                r="8.5"
                fill={activeMoment.isOpen ? '#F59E0B' : '#3D3D3D'}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </motion.g>

            {/* Horizon Labels */}
            <text x="20" y="122" className="fill-muted text-[9px] font-mono">
              9 AM
            </text>
            <text x="148" y="122" className="fill-faint text-[9px] font-mono">
              2 PM
            </text>
            <text x="272" y="122" className="fill-muted text-[9px] font-mono">
              7 PM+
            </text>
          </svg>
        </div>

        {/* Dynamic Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMoment.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="mt-2 rounded-xl border border-line/70 bg-surface/90 px-3.5 py-2.5 text-center sm:text-left"
          >
            <p className="text-xs font-semibold text-ink">{activeMoment.headline}</p>
            <p className="mt-0.5 text-[11px] text-muted leading-relaxed">{activeMoment.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Time-of-Day Selector Pills */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {MOMENTS.map((m, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setHasInteracted(true);
                setSelectedIndex(idx);
              }}
              className={`flex flex-col items-center rounded-xl border px-2 py-2 text-center transition-all cursor-pointer ${
                isSelected
                  ? m.isOpen
                    ? 'border-sage bg-sage-wash text-sage-deep shadow-xs font-semibold'
                    : 'border-ink/30 bg-sidebar text-ink shadow-xs font-semibold'
                  : 'border-line bg-surface text-muted hover:border-sage/40 hover:text-ink'
              }`}
            >
              <span className="flex items-center gap-1 text-[10px] font-mono">
                {idx === 2 ? (
                  <Sunset className="h-3 w-3" />
                ) : m.isOpen ? (
                  <Sun className="h-3 w-3" />
                ) : (
                  <Moon className="h-3 w-3" />
                )}
                <span>{m.label}</span>
              </span>
              <span className="mt-0.5 text-[9px] sm:text-[10px] font-mono opacity-80">{m.time}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

