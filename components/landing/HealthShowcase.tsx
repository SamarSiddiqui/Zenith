"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HealthRing } from '../visuals/HealthRing';
import { Sparkbars } from '../visuals/Sparkbars';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Zap, 
  ShieldCheck,
  Percent,
  Sparkles
} from 'lucide-react';

interface HabitItem {
  id: string;
  label: string;
  value: number;
  tone: 'sage' | 'clay';
  note: string;
  consistency: number;
  timeMatch: number;
  decay: number;
  circadianSlot: string;
  rootCause: string;
  factorInsights: Record<FormulaFactor, {
    title: string;
    description: string;
    formulaMath: string;
    statusBadge: string;
    statusTone: string;
  }>;
}

type FormulaFactor = 'all' | 'consistency' | 'timeMatch' | 'decay';

const factorDefinitions: Record<FormulaFactor, {
  label: string;
  weight: string;
  icon: typeof Activity;
  summary: string;
}> = {
  all: {
    label: 'Composite Health',
    weight: '100% Total',
    icon: Activity,
    summary: 'The holistic resilience score combining execution rate, circadian timing, and work friction.'
  },
  consistency: {
    label: 'Consistency Base',
    weight: '40% Weight',
    icon: Percent,
    summary: 'Measures cumulative repetitions over rolling 14-day sprints. 1 miss never destroys your momentum.'
  },
  timeMatch: {
    label: 'Time Alignment',
    weight: '30% Weight',
    icon: Clock,
    summary: 'Evaluates execution within your optimal circadian window vs unpredictable irregular times.'
  },
  decay: {
    label: 'Overrun Decay',
    weight: '-30% Penalty',
    icon: AlertTriangle,
    summary: 'Calculates schedule compression caused by overtime work or late meetings squeezing your routine.'
  }
};

const habitsList: HabitItem[] = [
  {
    id: 'reading',
    label: 'Evening Reading',
    value: 61,
    tone: 'clay',
    note: 'At risk · 2 evening misses',
    consistency: 68,
    timeMatch: 75,
    decay: -24,
    circadianSlot: 'Evening · 21:00',
    rootCause: '5 of 5 dips occurred when work overrun pushed the 21:00 slot past 22:30, triggering fatigue.',
    factorInsights: {
      all: {
        title: 'Composite Score: 61% (Needs Care)',
        description: 'Health dipped due to evening schedule compression. Zenith recommends auto-stepping to 5m micro-reading until overtime clears.',
        formulaMath: '(68 × 0.40) + (75 × 0.30) - (24 × 0.30) = 61%',
        statusBadge: 'Auto-Recovery Suggested',
        statusTone: 'bg-clay-wash text-clay border-clay/30'
      },
      consistency: {
        title: 'Consistency Base: 68% (10/14 Days Logged)',
        description: 'You completed 10 out of the last 14 days. In traditional streak trackers this is 0, but Zenith preserves 68% of your base momentum.',
        formulaMath: '10 completed / 14 days sprint window = 68% Base Score',
        statusBadge: 'Momentum Preserved',
        statusTone: 'bg-sand-wash text-ink border-sand/40'
      },
      timeMatch: {
        title: 'Time Window Alignment: 75%',
        description: 'Target slot is 21:00. On 3 occasions, reading was pushed to 23:15 when cognitive fatigue is high.',
        formulaMath: '3 of 12 sessions logged >60 mins off-target window',
        statusBadge: 'Schedule Drift Detected',
        statusTone: 'bg-sand-wash text-ink border-sand/40'
      },
      decay: {
        title: 'Work Overrun Decay: -24% Impact',
        description: '2.5 hours of work overrun directly encroached on the night wind-down window, deducting 24% health.',
        formulaMath: '2 overtime events × -12% schedule compression factor = -24%',
        statusBadge: 'External Friction (Not Willpower)',
        statusTone: 'bg-clay-wash text-clay border-clay/30'
      }
    }
  },
  {
    id: 'meditation',
    label: 'Twilight Meditation',
    value: 88,
    tone: 'sage',
    note: 'Steady at 19:15',
    consistency: 92,
    timeMatch: 95,
    decay: -7,
    circadianSlot: 'Twilight · 19:15',
    rootCause: 'Placed immediately after workday close with clear boundary — 94% execution rate.',
    factorInsights: {
      all: {
        title: 'Composite Score: 88% (Thriving)',
        description: 'Strong habit anchor right at the workday finish line creates seamless habit stacking with low cognitive friction.',
        formulaMath: '(92 × 0.40) + (95 × 0.30) - (7 × 0.30) = 88%',
        statusBadge: 'Optimal Anchor',
        statusTone: 'bg-sage-wash text-sage-deep border-sage/30'
      },
      consistency: {
        title: 'Consistency Base: 92% (13/14 Days Logged)',
        description: 'Near-perfect execution cadence with only 1 rest day taken intentionally.',
        formulaMath: '13 completed / 14 days sprint window = 92% Base Score',
        statusBadge: 'High Stability',
        statusTone: 'bg-sage-wash text-sage-deep border-sage/30'
      },
      timeMatch: {
        title: 'Time Window Alignment: 95%',
        description: 'Consistently initiated within 15 minutes of the 19:15 transition window.',
        formulaMath: '13 of 13 sessions executed within ±15 min circadian slot',
        statusBadge: 'Precise Cadence',
        statusTone: 'bg-sage-wash text-sage-deep border-sage/30'
      },
      decay: {
        title: 'Work Overrun Decay: -7% Minimal Impact',
        description: 'Only 1 minor work overrun occurred, causing negligible disruption to the meditation routine.',
        formulaMath: '1 minor delay × -7% decay penalty = -7%',
        statusBadge: 'Low Schedule Risk',
        statusTone: 'bg-sage-wash text-sage-deep border-sage/30'
      }
    }
  },
  {
    id: 'workout',
    label: 'Morning Movement',
    value: 95,
    tone: 'sage',
    note: 'Peak morning window',
    consistency: 98,
    timeMatch: 98,
    decay: -2,
    circadianSlot: 'Morning · 06:30',
    rootCause: 'Scheduled during 06:30 peak energy window — zero meeting conflicts or workplace interruptions.',
    factorInsights: {
      all: {
        title: 'Composite Score: 95% (Peak Performance)',
        description: 'Protected morning time slot has 0 work conflicts. Gold standard consistency architecture.',
        formulaMath: '(98 × 0.40) + (98 × 0.30) - (2 × 0.30) = 95%',
        statusBadge: 'Prime Habit Foundation',
        statusTone: 'bg-sage-wash text-sage-deep border-sage/30'
      },
      consistency: {
        title: 'Consistency Base: 98% (14/14 Days Logged)',
        description: 'Full 14-day completion streak. Solid physical anchor setting positive momentum for the entire day.',
        formulaMath: '14 completed / 14 days sprint window = 98% Base Score',
        statusBadge: 'Perfect Execution',
        statusTone: 'bg-sage-wash text-sage-deep border-sage/30'
      },
      timeMatch: {
        title: 'Time Window Alignment: 98%',
        description: 'Executed right after waking at 06:30 every single weekday without variance.',
        formulaMath: '14 of 14 sessions initiated at target 06:30 slot',
        statusBadge: 'Flawless Timing',
        statusTone: 'bg-sage-wash text-sage-deep border-sage/30'
      },
      decay: {
        title: 'Work Overrun Decay: -2% (Protected)',
        description: 'Morning window is completely shielded from afternoon meeting overruns and late emails.',
        formulaMath: 'Zero external overtime interference = -2% nominal variance',
        statusBadge: 'Zero External Conflicts',
        statusTone: 'bg-sage-wash text-sage-deep border-sage/30'
      }
    }
  }
];

const thirtyDays = [
  4, 5, 6, 5, 6, 3, 4, 6, 6, 5, 2, 4, 6, 6, 5, 6, 3, 5, 6, 6, 4, 2, 5, 6, 6, 5, 6, 4, 6, 5
];
const missDays = [5, 10, 16, 21, 27];

export function HealthShowcase() {
  const [selectedHabit, setSelectedHabit] = useState<HabitItem>(habitsList[0]);
  const [activeFactor, setActiveFactor] = useState<FormulaFactor>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  const activeInsight = selectedHabit.factorInsights[activeFactor];
  const activeDef = factorDefinitions[activeFactor];
  const ActiveIcon = activeDef.icon;

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
        {/* Header */}
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

        {/* Habit Selector Cards */}
        <div className="gsap-health-anim mt-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
              1. Select a habit to inspect:
            </p>
            <span className="text-xs text-muted font-medium">Click to compare habit stability</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {habitsList.map((item) => {
              const isSelected = selectedHabit.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedHabit(item)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-sage-deep bg-surface shadow-md ring-2 ring-sage/20'
                      : 'border-line bg-surface/60 hover:bg-surface hover:border-line/80'
                  }`}
                >
                  <div className="shrink-0">
                    <HealthRing value={item.value} tone={item.tone} size={64} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink truncate">{item.label}</p>
                      <span className="text-[10px] font-mono font-medium text-faint">{item.circadianSlot}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted truncate">{item.note}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-faint">
                      <span>Score: <strong className="text-ink">{item.value}%</strong></span>
                      <span>·</span>
                      <span>{item.tone === 'clay' ? 'Needs Care' : 'Thriving'}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formula Component Explorer Bar */}
        <div className="gsap-health-anim mt-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
              2. Explore the mathematical formula components:
            </p>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-surface p-2 shadow-xs">
            {(Object.keys(factorDefinitions) as FormulaFactor[]).map((f) => {
              const def = factorDefinitions[f];
              const Icon = def.icon;
              const isActive = activeFactor === f;

              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFactor(f)}
                  aria-pressed={isActive}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-ink text-white shadow-xs'
                      : 'bg-canvas text-muted hover:text-ink border border-line/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-faint'}`} />
                  <span>{def.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-surface text-faint'
                  }`}>
                    {def.weight}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive Deep-Dive View */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          {/* Left: Active Factor Deep-Dive Card */}
          <div className="gsap-health-anim">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedHabit.id + '-' + activeFactor}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-calm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-line/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-canvas border border-line flex items-center justify-center text-sage-deep shadow-xs">
                      <ActiveIcon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-faint">
                        {selectedHabit.label} · {activeDef.label}
                      </span>
                      <h3 className="text-base font-semibold text-ink mt-0.5">
                        {activeInsight.title}
                      </h3>
                    </div>
                  </div>

                  <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${activeInsight.statusTone}`}>
                    {activeInsight.statusBadge}
                  </span>
                </div>

                {/* Explanation */}
                <div className="mt-5">
                  <p className="text-sm leading-relaxed text-muted">
                    {activeInsight.description}
                  </p>
                </div>

                {/* Formula Math Callout */}
                <div className="mt-5 rounded-2xl border border-line/80 bg-canvas p-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1.5">
                    <div className="flex items-center gap-1.5 text-sage-deep">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Live Formula Computation</span>
                    </div>
                    <span className="text-[11px] font-mono text-faint">{activeDef.weight}</span>
                  </div>
                  <p className="font-mono text-xs font-semibold text-ink bg-surface p-2.5 rounded-xl border border-line/60">
                    {activeInsight.formulaMath}
                  </p>
                </div>

                {/* Root Cause Diagnosis */}
                <div className="mt-5 rounded-2xl border border-line bg-canvas p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink mb-1">
                    {selectedHabit.tone === 'clay' ? (
                      <AlertTriangle className="h-4 w-4 text-clay shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-sage-deep shrink-0" />
                    )}
                    <span>Circadian Diagnosis:</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted pl-6">
                    {selectedHabit.rootCause}
                  </p>
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
                💡 <strong>Zenith Insight:</strong> 100% of consistency dips in this 30-day window correlated directly with overtime work past 19:00, not lack of personal motivation.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
