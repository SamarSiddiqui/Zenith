"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';

const W = 340;
const H = 150;
const TOP = 16;
const BOTTOM = 134;

/** 22 days of traditional streak counter: drops to zero on day 19 */
const streakData = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 0, 0, 0, 0
];

/** 22 days of Zenith health index: dips, triggers warning, and recovers */
const healthData = [
  90, 92, 93, 94, 95, 94, 93, 95, 96, 94, 92, 88, 84, 79, 74, 68, 63, 61, 68, 76, 83, 88
];

function toPath(values: number[], max: number) {
  const stepX = W / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = BOTTOM - (v / max) * (BOTTOM - TOP);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function getPoint(values: number[], index: number, max: number) {
  const stepX = W / (values.length - 1);
  const safeIdx = Math.min(Math.max(0, index), values.length - 1);
  return {
    x: safeIdx * stepX,
    y: BOTTOM - (values[safeIdx] / max) * (BOTTOM - TOP)
  };
}

export function StreakVsHealth() {
  const [activeDay, setActiveDay] = useState<number>(21); // 0-indexed (Day 22)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const streakPathRef = useRef<SVGPathElement>(null);
  const healthPathRef = useRef<SVGPathElement>(null);

  // Auto play scrubber logic
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveDay((prev) => (prev >= 21 ? 0 : prev + 1));
    }, 600);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // GSAP ScrollTrigger path draw animation on view
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (streakPathRef.current) {
      const len = streakPathRef.current.getTotalLength();
      gsap.set(streakPathRef.current, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(streakPathRef.current, { strokeDashoffset: 0, duration: 1.2 }, 0);
    }

    if (healthPathRef.current) {
      const len = healthPathRef.current.getTotalLength();
      gsap.set(healthPathRef.current, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(healthPathRef.current, { strokeDashoffset: 0, duration: 1.2 }, 0.15);
    }

    return tl;
  });

  const activeStreakVal = streakData[activeDay];
  const activeHealthVal = healthData[activeDay];

  const streakPoint = getPoint(streakData, activeDay, 18);
  const healthPoint = getPoint(healthData, activeDay, 100);

  return (
    <section ref={sectionRef} id="chapter-01" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20 lg:px-10 lg:py-28">
      {/* Header */}
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">Chapter 01 · The Problem</p>
          <span className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-medium text-muted">
            The Core Differentiator
          </span>
        </div>
        <h2 className="mt-3 font-serif text-3xl text-ink md:text-4xl">
          A streak has one bad week in it. Then it&apos;s over.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Same person. Same 22 days. Drag or play the interactive timeline below to see how a traditional streak resets while Zenith catches the drop and guides recovery.
        </p>
      </div>

      {/* Day Scrubber Toolbar */}
      <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-sage text-white transition-transform hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          <button
            onClick={() => { setActiveDay(0); setIsPlaying(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas text-muted hover:text-ink transition-colors"
            title="Reset to Day 1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <span className="font-serif text-base text-ink">
            Day <span className="font-bold text-sage-deep">{activeDay + 1}</span> / 22
          </span>
        </div>

        {/* Interactive Slider */}
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <span className="text-xs text-faint font-medium">Day 1</span>
          <input
            type="range"
            min={0}
            max={21}
            value={activeDay}
            onChange={(e) => {
              setActiveDay(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-line accent-sage"
          />
          <span className="text-xs text-faint font-medium">Day 22</span>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Card 1: Traditional Streak */}
        <div className="flex flex-col rounded-3xl border border-line bg-surface p-7 shadow-calm transition-all">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl text-ink">Traditional Streak</h3>
              <p className="text-xs text-muted">All-or-nothing binary counter</p>
            </div>
            <div className="text-right">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                activeStreakVal === 0
                  ? 'border border-clay/50 bg-clay-wash text-clay animate-pulse'
                  : 'border border-line bg-canvas text-ink'
              }`}>
                {activeStreakVal === 0 ? '💥 STREAK BROKEN (Day 0)' : `🔥 ${activeStreakVal} Day Streak`}
              </span>
            </div>
          </div>

          {/* SVG Chart 1 */}
          <div className="relative mt-6">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-[160px] w-full" role="img" aria-hidden>
              {[0.25, 0.5, 0.75].map((g) => (
                <line
                  key={g}
                  x1="0"
                  x2={W}
                  y1={BOTTOM - g * (BOTTOM - TOP)}
                  y2={BOTTOM - g * (BOTTOM - TOP)}
                  stroke="var(--color-line)"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
              ))}
              <line x1="0" x2={W} y1={BOTTOM} y2={BOTTOM} stroke="var(--color-line)" strokeWidth="1" />

              <path
                ref={streakPathRef}
                d={toPath(streakData, 18)}
                fill="none"
                stroke="var(--color-clay)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active Scrubber Hairline */}
              <line
                x1={streakPoint.x}
                x2={streakPoint.x}
                y1={TOP}
                y2={BOTTOM}
                stroke="var(--color-clay)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Active Scrubber Node */}
              <circle
                cx={streakPoint.x}
                cy={streakPoint.y}
                r="6"
                fill="var(--color-clay)"
                stroke="var(--color-surface)"
                strokeWidth="2"
                className="transition-all duration-150"
              />
            </svg>
          </div>

          <div className="mt-auto pt-6 border-t border-line">
            <p className="text-sm leading-relaxed text-muted">
              {activeDay >= 18 ? (
                <span className="text-clay font-medium">
                  Day {activeDay + 1}: One missed Tuesday wiped out 18 days of consistency. The counter drops to zero, triggering frustration and app abandonment.
                </span>
              ) : (
                <span>
                  Days 1 to {activeDay + 1}: The streak counter climbs steadily, but creates intense anxiety around maintaining an unbroken line.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Card 2: Zenith Health Engine */}
        <div className="flex flex-col rounded-3xl border border-sage/40 bg-sage-wash p-7 shadow-calm transition-all">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl text-ink">Zenith Health Engine</h3>
              <p className="text-xs text-sage-deep">Weighted decay & early warning system</p>
            </div>
            <div className="text-right">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                activeDay >= 13 && activeDay <= 17
                  ? 'border border-clay/40 bg-surface text-clay'
                  : 'border border-sage/50 bg-surface text-sage-deep'
              }`}>
                {activeDay >= 13 && activeDay <= 17
                  ? `⚠️ Early Warning (${activeHealthVal}%)`
                  : activeDay >= 18
                  ? `🌿 Recovering (${activeHealthVal}%)`
                  : `✨ Optimal (${activeHealthVal}%)`}
              </span>
            </div>
          </div>

          {/* SVG Chart 2 */}
          <div className="relative mt-6">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-[160px] w-full" role="img" aria-hidden>
              {[0.25, 0.5, 0.75].map((g) => (
                <line
                  key={g}
                  x1="0"
                  x2={W}
                  y1={BOTTOM - g * (BOTTOM - TOP)}
                  y2={BOTTOM - g * (BOTTOM - TOP)}
                  stroke="var(--color-line)"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
              ))}
              <line x1="0" x2={W} y1={BOTTOM} y2={BOTTOM} stroke="var(--color-line)" strokeWidth="1" />

              <path
                ref={healthPathRef}
                d={toPath(healthData, 100)}
                fill="none"
                stroke="var(--color-sage-deep)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active Scrubber Hairline */}
              <line
                x1={healthPoint.x}
                x2={healthPoint.x}
                y1={TOP}
                y2={BOTTOM}
                stroke="var(--color-sage-deep)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Active Scrubber Node */}
              <circle
                cx={healthPoint.x}
                cy={healthPoint.y}
                r="6"
                fill="var(--color-sage-deep)"
                stroke="var(--color-surface)"
                strokeWidth="2"
                className="transition-all duration-150"
              />
            </svg>
          </div>

          <div className="mt-auto pt-6 border-t border-sage/20">
            <p className="text-sm leading-relaxed text-muted">
              {activeDay >= 13 && activeDay <= 17 ? (
                <span className="text-clay font-medium">
                  Day {activeDay + 1}: Health dips to {activeHealthVal}%. Zenith detects schedule compression and issues an early warning — guiding a micro-session instead of a total failure.
                </span>
              ) : activeDay >= 18 ? (
                <span className="text-sage-deep font-medium">
                  Day {activeDay + 1}: Health climbs back to {activeHealthVal}%. Your momentum is preserved because you never started from zero.
                </span>
              ) : (
                <span>
                  Days 1 to {activeDay + 1}: Consistency is tracked as a resilient curve ({activeHealthVal}%), reflecting true habit strength rather than binary perfection.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

