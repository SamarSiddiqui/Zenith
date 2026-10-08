"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkbars } from '../visuals/Sparkbars';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Brain,
  Zap,
  Clock,
  Compass
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

type AIDiagnosisScenario = 'overtime' | 'exhaustion' | 'anchor';

interface AIScenarioData {
  id: AIDiagnosisScenario;
  tabLabel: string;
  badge: string;
  problem: {
    title: string;
    description: string;
    trackerReaction: string;
  };
  aiDiagnosis: {
    headline: string;
    rootCause: string;
    actionPlan: string;
    habitScaled: {
      name: string;
      original: string;
      adapted: string;
    };
    aiQuote: string;
  };
}

const aiScenarios: Record<AIDiagnosisScenario, AIScenarioData> = {
  overtime: {
    id: 'overtime',
    tabLabel: 'Missed After Work Overrun',
    badge: 'Friction Analysis',
    problem: {
      title: 'Work ran 2.5 hours late, habit missed at 10 PM',
      description: 'You planned to read for 30 minutes, but after back-to-back meetings and an 11-hour workday, you collapsed into bed.',
      trackerReaction: 'Traditional apps wipe out your 24-day streak to 0 and trigger guilt.'
    },
    aiDiagnosis: {
      headline: 'Work Overrun Identified (Not Willpower Failure)',
      rootCause: 'Zenith AI detected that 5 of your last 5 misses occurred strictly when work finished after 20:30.',
      actionPlan: 'Automatically steps down Reading to a 5-minute micro-read (2 pages) for the next 3 days to preserve momentum without cognitive fatigue.',
      habitScaled: {
        name: 'Night Reading',
        original: '30 min deep reading',
        adapted: '5 min micro-read (2 pages)'
      },
      aiQuote: '“Momentum is preserved by showing up in micro-doses when life gets loud.”'
    }
  },
  exhaustion: {
    id: 'exhaustion',
    tabLabel: 'Workout Timing Mismatch',
    badge: 'Circadian Alignment',
    problem: {
      title: 'High resistance attempting 45m workout after 8 PM',
      description: 'Attempting intense workouts during evening fatigue windows causes high drop-off and mental burnout.',
      trackerReaction: 'Traditional trackers ignore biological energy cycles and demand raw discipline.'
    },
    aiDiagnosis: {
      headline: 'Circadian Peak Shift Recommended',
      rootCause: 'Zenith AI correlated your highest execution consistency (98%) with morning slots between 06:30 – 07:30 AM.',
      actionPlan: 'AI recommends shifting the workout slot to 06:30 AM before emails begin, boosting habit adherence by an estimated 3.4x.',
      habitScaled: {
        name: 'Daily Fitness',
        original: '8:00 PM Evening Gym',
        adapted: '06:30 AM Morning Mobility'
      },
      aiQuote: '“Align your habits with your biology, and discipline becomes effortless.”'
    }
  },
  anchor: {
    id: 'anchor',
    tabLabel: 'Habit Anchor & Stacking',
    badge: 'Behavioral Architecture',
    problem: {
      title: 'Floating meditation with no fixed anchor',
      description: 'Without a concrete daily trigger, mindfulness gets postponed throughout the afternoon and forgotten.',
      trackerReaction: 'Sends spammy push notifications that you quickly dismiss.'
    },
    aiDiagnosis: {
      headline: 'Precision Workday Close Anchor',
      rootCause: 'Floating habits have 42% higher skip rates. Anchoring habits to existing circadian rituals solves this.',
      actionPlan: 'AI anchors 10m Meditation immediately to your 19:00 laptop shutdown trigger, creating an automatic transition into evening rest.',
      habitScaled: {
        name: 'Twilight Meditation',
        original: 'Random afternoon slot',
        adapted: 'Immediately at 19:00 Workday Close'
      },
      aiQuote: '“The easiest habit to keep is the one hitched to an action you already do every day.”'
    }
  }
};

const thirtyDays = [
  4, 5, 6, 5, 6, 3, 4, 6, 6, 5, 2, 4, 6, 6, 5, 6, 3, 5, 6, 6, 4, 2, 5, 6, 6, 5, 6, 4, 6, 5
];
const missDays = [5, 10, 16, 21, 27];

export function HealthShowcase() {
  const [activeScenarioKey, setActiveScenarioKey] = useState<AIDiagnosisScenario>('overtime');
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const scenario = aiScenarios[activeScenarioKey];
  const ctaHref = user ? '/diagnosis' : '/register';

  // GSAP ScrollTrigger entrance animation
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    if (containerRef.current) {
      tl.fromTo(
        containerRef.current.querySelectorAll('.gsap-health-anim'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }
      );
    }
    return tl;
  });

  return (
    <section ref={sectionRef} id="chapter-03" className="scroll-mt-20 border-y border-line bg-canvas">
      <div ref={containerRef} className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-10 lg:py-28">
        {/* Header - preserved exactly as requested */}
        <div className="max-w-2xl">
          <p className="gsap-health-anim text-xs font-semibold uppercase tracking-[0.18em] text-faint">
            Chapter 03 · What Zenith Sees
          </p>
          <h2 className="gsap-health-anim mt-3 font-serif text-3xl text-ink md:text-4xl">
            Every habit carries a pulse, and every dip has a root cause.
          </h2>
          <p className="gsap-health-anim mt-4 text-base leading-relaxed text-muted">
            Health isn&apos;t a binary streak score that drops to 0 after one miss. It is a resilient formula accounting for consistency, optimal time alignment, and real-world work friction.
          </p>
        </div>

        {/* AI Diagnosis Scenario Selector Bar */}
        <div className="gsap-health-anim mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sage-deep" />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
                Zenith AI Circadian Diagnosis in Action:
              </p>
            </div>
            <span className="text-xs text-muted">Select a real-life scenario to see how AI solves it</span>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-2 shadow-xs">
            {(Object.keys(aiScenarios) as AIDiagnosisScenario[]).map((key) => {
              const item = aiScenarios[key];
              const isActive = activeScenarioKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveScenarioKey(key)}
                  aria-pressed={isActive}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-ink text-white shadow-xs'
                      : 'bg-canvas text-muted hover:text-ink border border-line/60'
                  }`}
                >
                  <Brain className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-faint'}`} />
                  <span>{item.tabLabel}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-surface text-faint'
                  }`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Problem vs Zenith AI Solution Showcase */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          {/* Left: AI Diagnosis Engine Card */}
          <div className="gsap-health-anim">
            <AnimatePresence mode="wait">
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-calm"
              >
                {/* 1. The Real-Life Problem */}
                <div className="rounded-2xl border border-clay/30 bg-clay-wash/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-clay mb-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>The Problem: {scenario.problem.title}</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {scenario.problem.description}
                  </p>
                  <p className="mt-2 text-[11px] font-mono text-clay/80 border-t border-clay/20 pt-2">
                    ❌ {scenario.problem.trackerReaction}
                  </p>
                </div>

                {/* 2. Zenith AI Diagnosis & Root Cause */}
                <div className="mt-5 rounded-2xl border border-sage/30 bg-sage-wash/50 p-5">
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-sage/20">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-surface border border-sage/30 flex items-center justify-center text-sage-deep shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-ink">
                        Zenith AI Diagnosis:
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-sage/30 text-sage-deep font-semibold">
                      AI Strategist
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-serif font-bold text-ink">
                    {scenario.aiDiagnosis.headline}
                  </h3>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    {scenario.aiDiagnosis.rootCause}
                  </p>

                  {/* AI Smart Habit Adaptation */}
                  <div className="mt-4 rounded-xl bg-surface p-3.5 border border-line/60">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-ink mb-1.5">
                      <span className="flex items-center gap-1.5 text-sage-deep">
                        <Zap className="w-3.5 h-3.5" />
                        <span>AI Habit Action Plan:</span>
                      </span>
                      <span className="text-[10px] font-mono text-faint">{scenario.aiDiagnosis.habitScaled.name}</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      {scenario.aiDiagnosis.actionPlan}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-xs font-mono pt-2 border-t border-line/40">
                      <span className="text-faint line-through">{scenario.aiDiagnosis.habitScaled.original}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sage-deep" />
                      <span className="text-sage-deep font-semibold">{scenario.aiDiagnosis.habitScaled.adapted}</span>
                    </div>
                  </div>

                  {/* AI Quote */}
                  <p className="mt-3 text-[11px] italic text-muted">
                    {scenario.aiDiagnosis.aiQuote}
                  </p>
                </div>

                {/* Interactive CTA to Experience AI Diagnosis */}
                <div className="mt-6 flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <ShieldCheck className="w-4 h-4 text-sage-deep" />
                    <span>0 Guilt · Adaptive Momentum</span>
                  </div>

                  <Link
                    href={ctaHref}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink text-white hover:bg-ink/90 transition-all text-xs font-semibold shadow-xs group"
                  >
                    <span>{user ? 'Open AI Diagnosis' : 'Experience AI Diagnosis'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: 30-Day Execution & Overrun Correlation */}
          <div className="gsap-health-anim rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-calm">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">30-Day Execution Correlation</p>
                <p className="text-xs text-muted mt-0.5">Habits executed per day vs work overruns</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-sage-wash text-sage-deep border border-sage/30">
                Live Telemetry
              </span>
            </div>

            <div className="mt-6">
              <Sparkbars values={thirtyDays} missed={missDays} height={110} />
            </div>

            <div className="mt-6 space-y-3 border-t border-line/70 pt-5 text-xs text-muted">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-sage" aria-hidden /> Standard Day (4-6 habits completed)
                </span>
                <span className="font-semibold text-ink font-mono">25 Days (83%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-clay" aria-hidden /> Work Overrun Dip (2-3 habits completed)
                </span>
                <span className="font-semibold text-clay font-mono">5 Days (17%)</span>
              </div>

              <div className="mt-4 rounded-2xl border border-sage/30 bg-sage-wash/60 p-3.5 text-xs text-sage-deep font-medium leading-relaxed">
                💡 <strong>Zenith AI Insight:</strong> 100% of consistency dips in this 30-day window correlated directly with overtime work past 19:00, not lack of personal discipline.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
