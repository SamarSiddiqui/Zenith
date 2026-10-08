"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Plane, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Dumbbell, 
  BookOpen, 
  BrainCircuit,
  ArrowRight,
  Flame
} from 'lucide-react';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';
import { useAuth } from '../../context/AuthContext';

type DayMode = 'normal' | 'late' | 'exhausted';

interface HabitAdaptation {
  id: string;
  name: string;
  icon: typeof Dumbbell;
  standard: {
    duration: string;
    description: string;
  };
  adapted: {
    duration: string;
    description: string;
    badge: string;
  };
}

const habitsList: HabitAdaptation[] = [
  {
    id: 'workout',
    name: 'Movement & Fitness',
    icon: Dumbbell,
    standard: {
      duration: '45 mins',
      description: 'Full workout session & mobility drills'
    },
    adapted: {
      duration: '10 mins',
      description: 'Gentle posture reset & mobility stretches',
      badge: 'Micro-version'
    }
  },
  {
    id: 'reading',
    name: 'Knowledge & Reading',
    icon: BookOpen,
    standard: {
      duration: '30 mins',
      description: 'Deep focus chapter reading & notes'
    },
    adapted: {
      duration: '5 mins',
      description: 'Read 2 pages to keep momentum alive',
      badge: 'Micro-version'
    }
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness & Wind-down',
    icon: BrainCircuit,
    standard: {
      duration: '15 mins',
      description: 'Guided evening meditation & journaling'
    },
    adapted: {
      duration: '3 mins',
      description: '3 deep grounding breaths before sleep',
      badge: 'Micro-version'
    }
  }
];

const dayScenarios: Record<DayMode, {
  label: string;
  icon: typeof Sun;
  tagline: string;
  workHours: string;
  workStatus: string;
  availableTime: string;
  resultBadge: string;
  badgeColor: string;
  consistencyScore: string;
  summary: string;
}> = {
  normal: {
    label: 'Normal Day',
    icon: Sun,
    tagline: 'Standard schedule with plenty of free evening energy',
    workHours: '9:00 AM – 6:00 PM',
    workStatus: 'On Time',
    availableTime: '3h 30m free evening',
    resultBadge: 'Full Habit Plan Active',
    badgeColor: 'bg-sage-wash text-sage-deep border-sage/30',
    consistencyScore: '100% Score',
    summary: 'Everything runs at full standard duration. Smooth execution with zero friction.'
  },
  late: {
    label: 'Late Workday',
    icon: Moon,
    tagline: 'Work ran overtime until 8:30 PM — minimal time & energy left',
    workHours: '9:00 AM – 8:30 PM',
    workStatus: '2.5h Overtime',
    availableTime: '45 mins remaining',
    resultBadge: 'Auto-scaled to Micro-habits',
    badgeColor: 'bg-sand-wash text-ink border-sand/40',
    consistencyScore: '100% Protected',
    summary: 'Instead of skipping and losing your streak, Zenith scales habits down to 5-minute micro versions so you maintain consistency without burnout.'
  },
  exhausted: {
    label: 'Travel / Low Energy',
    icon: Plane,
    tagline: 'Flights, sick day, or total exhaustion with 0 energy',
    workHours: 'All-day Travel / Rest',
    workStatus: 'High Fatigue',
    availableTime: '15 mins usable',
    resultBadge: 'Safe Pause (Zero Penalty)',
    badgeColor: 'bg-clay-wash text-clay border-clay/30',
    consistencyScore: 'Score Preserved',
    summary: 'Zenith activates Safe Pause. Your consistency health index is preserved with zero guilt, letting you recharge and resume tomorrow fresh.'
  }
};

export function DayRibbon() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<DayMode>('late');
  const containerRef = useRef<HTMLDivElement>(null);
  const currentScenario = dayScenarios[activeMode];
  const ctaHref = user ? '/dashboard' : '/register';

  // GSAP ScrollTrigger entrance stagger for Chapter 02
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (containerRef.current) {
      tl.fromTo(
        containerRef.current.querySelectorAll('.gsap-ribbon-anim'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }
      );
    }

    return tl;
  });

  return (
    <section ref={sectionRef} id="chapter-02" className="scroll-mt-20 border-y border-line bg-surface">
      <div ref={containerRef} className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
        {/* Header and Scenario Selector */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="gsap-ribbon-anim text-xs font-semibold uppercase tracking-[0.18em] text-faint">
              Chapter 02 · The Working Window
            </p>
            <h2 className="gsap-ribbon-anim mt-3 font-serif text-3xl text-ink md:text-4xl">
              Habits that adapt to your day, not the other way around.
            </h2>
            <p className="gsap-ribbon-anim mt-4 text-base leading-relaxed text-muted">
              Most habit apps assume you have an empty 24-hour day. When work runs late or exhaustion hits, Zenith automatically scales your habits down so your consistency never breaks.
            </p>
          </div>

          {/* Interactive Scenario Buttons */}
          <div
            className="gsap-ribbon-anim inline-flex p-1.5 rounded-2xl border border-line bg-canvas shadow-xs shrink-0"
            role="group"
            aria-label="Choose a day scenario"
          >
            {(Object.keys(dayScenarios) as DayMode[]).map((mode) => {
              const item = dayScenarios[mode];
              const Icon = item.icon;
              const isActive = activeMode === mode;

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setActiveMode(mode)}
                  aria-pressed={isActive}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                    isActive ? 'text-white' : 'text-muted hover:text-ink'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="scenario-pill-bg"
                      className="absolute inset-0 rounded-xl bg-ink shadow-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-faint'}`} />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Showcase Card */}
        <div className="gsap-ribbon-anim mt-12 rounded-3xl border border-line bg-canvas p-6 sm:p-8 md:p-10 shadow-calm">
          {/* Top Status Bar for Selected Day */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-line/60">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentScenario.badgeColor}`}>
                {currentScenario.resultBadge}
              </span>
              <p className="text-xs text-muted hidden sm:inline-block">
                {currentScenario.tagline}
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-1.5 text-muted">
                <Clock className="w-3.5 h-3.5 text-faint" />
                <span>Usable Gap: <strong className="text-ink">{currentScenario.availableTime}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-sage-deep font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{currentScenario.consistencyScore}</span>
              </div>
            </div>
          </div>

          {/* Habit Adaptation Grid */}
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <AnimatePresence mode="wait">
              {habitsList.map((habit, index) => {
                const Icon = habit.icon;
                const isAdapted = activeMode !== 'normal';
                const isExhausted = activeMode === 'exhausted';

                return (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className={`relative rounded-2xl border p-5 transition-all ${
                      isAdapted 
                        ? 'border-sage/30 bg-sage-wash/40 shadow-xs' 
                        : 'border-line/70 bg-surface'
                    }`}
                  >
                    {/* Habit Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-surface border border-line flex items-center justify-center text-ink shadow-xs">
                          <Icon className="w-4 h-4 stroke-[1.75]" />
                        </div>
                        <h4 className="text-sm font-semibold text-ink">{habit.name}</h4>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-semibold ${
                        isAdapted 
                          ? 'bg-sage text-white' 
                          : 'bg-canvas text-muted border border-line'
                      }`}>
                        {activeMode === 'normal' 
                          ? habit.standard.duration 
                          : isExhausted 
                          ? 'Safe Pause' 
                          : habit.adapted.duration}
                      </span>
                    </div>

                    {/* Adaptation Flow */}
                    <div className="mt-4 pt-3 border-t border-line/50 text-xs">
                      {activeMode === 'normal' ? (
                        <div>
                          <p className="text-muted leading-relaxed">{habit.standard.description}</p>
                          <div className="mt-3 flex items-center gap-1 text-sage-deep font-medium text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Standard focus window ready</span>
                          </div>
                        </div>
                      ) : isExhausted ? (
                        <div>
                          <p className="text-muted leading-relaxed line-through opacity-60">{habit.standard.description}</p>
                          <div className="mt-2.5 flex items-center gap-1.5 text-clay font-medium text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Protected · Zero guilt pause</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-faint mb-1">
                            <span className="line-through">{habit.standard.duration}</span>
                            <div className="flex items-center gap-1 text-sage-deep font-medium">
                              <Sparkles className="w-3 h-3" />
                              <span>Zenith Micro-scale</span>
                            </div>
                          </div>
                          <p className="text-ink font-medium leading-relaxed bg-surface/80 p-2.5 rounded-xl border border-sage/20">
                            {habit.adapted.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Bottom Philosophy Callout */}
          <div className="mt-8 rounded-2xl bg-surface border border-line/60 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-canvas border border-line flex items-center justify-center text-sage-deep shrink-0 mt-0.5">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">
                  {currentScenario.summary}
                </p>
                <p className="text-[11px] text-muted mt-0.5">
                  Missing a habit after an overtime day isn&apos;t lack of willpower — it&apos;s a design problem Zenith solves.
                </p>
              </div>
            </div>

            <Link
              href={ctaHref}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink text-white hover:bg-ink/90 transition-all text-xs font-semibold shadow-xs group"
            >
              <span>{user ? 'Open Dashboard' : 'Try with your habits'}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
