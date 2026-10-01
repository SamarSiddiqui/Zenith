"use client";

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  RotateCcw,
  Clock,
  Zap,
  ShieldCheck,
  Award,
  CalendarRange,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../hooks/useHabits';
import { useSprint } from '../../hooks/useSprint';
import { useDiagnosis } from '../../hooks/useDiagnosis';
import {
  ZenithGrowthRadar,
  ExecutiveSynthesisCard,
  FrictionAutopsyMatrix,
  HabitLabCard,
  StepUpRecoveryCard,
} from '../../components/diagnosis';
import { formatFullTodayDate } from '../../lib/utils/sprintDate';

export default function DiagnosisPage() {
  const { user } = useAuth();
  const { habits, isLoading: habitsLoading, refreshHabits } = useHabits();
  const { session: sprintSession } = useSprint(habits, refreshHabits);

  const {
    diagnosis,
    isLoading: diagnosisLoading,
    isAnalyzing,
    error,
    lastAnalyzedAt,
    appliedActions,
    reAnalyze,
    applySlotRecommendation,
    applyMicroVersion,
    applyTieredDuration,
    applyRecoveryProtocol,
  } = useDiagnosis(habits, user?.workingWindow, sprintSession, habitsLoading);

  const habitLabRef = useRef<HTMLDivElement>(null);
  const todayLabel = formatFullTodayDate();
  const isLoading = habitsLoading || (diagnosisLoading && !diagnosis);

  const handleScrollToLab = () => {
    habitLabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formattedAnalysisTime = lastAnalyzedAt
    ? lastAnalyzedAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-16">
        {/* Top Header Row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage-wash/70 px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-sage-deep shadow-xs">
                <Sparkles className="h-3 w-3 text-sage-deep" />
                <span>AI Circadian Intelligence</span>
              </div>

              {formattedAnalysisTime && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-mono text-muted shadow-xs">
                  <Clock className="h-3 w-3 text-faint" />
                  <span>Audit: {formattedAnalysisTime} (Gemini 3.5 Flash-Lite)</span>
                </div>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight">
              Diagnosis & Growth Hub
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted font-light max-w-2xl">
              Circadian behavioral analysis powered by Gemini. We diagnose schedule friction, protect your identity momentum, and eliminate willpower guilt.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
            <button
              type="button"
              disabled={isAnalyzing || habits.length === 0}
              onClick={() => reAnalyze()}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-mono font-semibold transition-all shadow-calm cursor-pointer ${
                isAnalyzing
                  ? 'border-sage/40 bg-sage-wash text-sage-deep animate-pulse'
                  : 'border-line bg-surface text-ink hover:border-sage hover:text-sage-deep'
              }`}
              title="Click to run a fresh Gemini diagnosis with latest habit logs"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 text-sage-deep ${isAnalyzing ? 'animate-spin' : ''}`}
              />
              <span>{isAnalyzing ? 'Analyzing Horizon...' : 'Re-Analyze with Gemini'}</span>
            </button>

            <Link
              href="/habits"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-sage px-4 py-2.5 text-xs font-mono font-medium text-white shadow-xs hover:bg-sage-deep transition-all"
            >
              <span>Habit Matrix</span>
              <CalendarRange className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-clay/30 bg-clay-wash/60 p-4 text-xs font-mono text-clay shadow-xs flex items-center justify-between gap-4"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => reAnalyze()}
              className="underline font-bold hover:text-ink transition-colors cursor-pointer shrink-0"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty State: No Habits Created */}
        {!isLoading && habits.length === 0 && (
          <div className="rounded-3xl border border-line bg-surface p-12 text-center shadow-calm space-y-3">
            <ShieldCheck className="h-10 w-10 text-sage-deep mx-auto stroke-[1.5]" />
            <h3 className="font-serif text-xl font-bold text-ink">
              No active rituals found to diagnose
            </h3>
            <p className="text-xs sm:text-sm text-muted font-light max-w-md mx-auto">
              Anchor your first mindful rituals in the Habit Planner. Zenith will automatically evaluate their circadian resonance and schedule friction.
            </p>
            <div className="pt-2">
              <Link
                href="/habits"
                className="inline-flex items-center gap-1.5 rounded-xl bg-sage px-4 py-2 text-xs font-mono font-medium text-white shadow-xs hover:bg-sage-deep transition-all"
              >
                <span>Open Habit Planner</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-56 rounded-3xl bg-surface border border-line" />
            <div className="h-44 rounded-3xl bg-surface border border-line" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 rounded-3xl bg-surface border border-line" />
              <div className="h-64 rounded-3xl bg-surface border border-line" />
            </div>
          </div>
        )}

        {/* Main Flagship Diagnostic Grid */}
        {!isLoading && diagnosis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Top Row: Growth Radar + Executive Synthesis */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 flex">
                <ZenithGrowthRadar score={diagnosis.zenithScore} />
              </div>
              <div className="lg:col-span-7 flex">
                <ExecutiveSynthesisCard
                  synthesis={diagnosis.executiveSynthesis}
                  onExploreOptimizations={handleScrollToLab}
                />
              </div>
            </div>

            {/* Section 2: Friction vs. Willpower Autopsy */}
            <FrictionAutopsyMatrix
              collisions={diagnosis.frictionAutopsy.scheduleCollisions}
              zoneFriction={diagnosis.frictionAutopsy.circadianZoneFriction}
              overallVerdict={diagnosis.frictionAutopsy.overallFrictionVerdict}
              appliedActions={appliedActions}
              onApplySlot={applySlotRecommendation}
              onApplyDuration={applyTieredDuration}
            />

            {/* Section 3: Gemini Habit Laboratory & Tiered Scaler */}
            <div ref={habitLabRef}>
              <HabitLabCard
                optimizations={diagnosis.habitOptimizations}
                appliedActions={appliedActions}
                onApplySlot={applySlotRecommendation}
                onApplyMicro={applyMicroVersion}
                onApplyDuration={applyTieredDuration}
              />
            </div>

            {/* Section 4: 3-Day Step-Up Recovery Protocol (if available) */}
            {diagnosis.recoveryProtocols && diagnosis.recoveryProtocols.length > 0 && (
              <StepUpRecoveryCard
                protocols={diagnosis.recoveryProtocols}
                appliedActions={appliedActions}
                onApplyProtocol={applyRecoveryProtocol}
              />
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
