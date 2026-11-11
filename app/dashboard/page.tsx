"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../../components/Layout';
import { WorkingWindow } from '../../components/dashboard/WorkingWindow';
import { RiskBanner } from '../../components/dashboard/RiskBanner';
import { EveningOrganizer } from '../../components/dashboard/EveningOrganizer';
import { TodayHabitList } from '../../components/dashboard/TodayHabitList';
import { SprintHorizonWidget } from '../../components/dashboard/SprintHorizonWidget';
import { SprintSettingsModal } from '../../components/habits/SprintSettingsModal';
import { SprintCompletedModal } from '../../components/habits/SprintCompletedModal';
import { HealthRing } from '../../components/visuals/HealthRing';
import { Sparkbars } from '../../components/visuals/Sparkbars';
import { CountUp } from '../../components/visuals/CountUp';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../hooks/useHabits';
import { useSprint } from '../../hooks/useSprint';
import { useYesterdayCheckin } from '../../hooks/useYesterdayCheckin';
import { useFirstTimeStory } from '../../hooks/useFirstTimeStory';
import { StoryOnboardingOverlay } from '../../components/onboarding/StoryOnboardingOverlay';
import { YesterdayCheckinModal } from '../../components/habits/YesterdayCheckinModal';
import { AlertCircle } from 'lucide-react';

const card = 'flex flex-col h-full rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-calm justify-between';

export default function DashboardPage() {
  const { user } = useAuth();
  const { habits, metrics, isLoading: habitsLoading, error: habitsError, refreshHabits } = useHabits();
  const {
    session,
    analytics,
    isSettingsModalOpen,
    isCompletedModalOpen,
    openSettings,
    closeSettings,
    openCompletedModal,
    closeCompletedModal,
    updateSprintDuration,
    updateSprintGoal,
    saveSprintDraft,
    startNewSprint,
  } = useSprint(habits);

  const {
    isYesterdayCheckinOpen,
    yesterdayLabel,
    unloggedYesterdayHabits,
    closeYesterdayCheckin,
    resolveYesterdayCheckin,
  } = useYesterdayCheckin(habits, refreshHabits);

  const {
    shouldShowStory,
    isReplaying,
    isSaving: isSavingStory,
    currentChapter,
    setCurrentChapter,
    completeStory,
    skipStory,
    closeReplay,
  } = useFirstTimeStory();

  const firstName = user?.fullName?.trim() ? user.fullName.trim().split(' ')[0] : '';

  // Active sprint day index (0 to durationDays - 1)
  const currentDayIndex = session.currentDayIndex ?? 0;

  // Real-time completions strictly for TODAY
  const completedToday = habits.filter(
    (h) => (h.week?.[currentDayIndex] || 'unlogged') === 'completed'
  ).length;
  const todayCompletionRate =
    metrics.total > 0 ? Math.round((completedToday / metrics.total) * 100) : 0;

  // Derive health label
  const healthLabel =
    metrics.averageHealth >= 80
      ? 'Thriving'
      : metrics.averageHealth >= 65
      ? 'Stable'
      : 'Needs Care';

  const healthColor =
    metrics.averageHealth >= 80
      ? 'text-sage-deep'
      : metrics.averageHealth >= 65
      ? 'text-muted'
      : 'text-clay';

  return (
    <Layout>
      {/* First-Time Animated Storytelling Onboarding */}
      <StoryOnboardingOverlay
        isOpen={shouldShowStory}
        currentChapter={currentChapter}
        onChapterChange={setCurrentChapter}
        onComplete={completeStory}
        onSkip={skipStory}
        isReplaying={isReplaying}
        onCloseReplay={closeReplay}
        isSaving={isSavingStory}
        userName={user?.fullName}
        initialWorkingWindow={user?.workingWindow}
      />

      {/* Sprint Modals */}
      <SprintSettingsModal
        isOpen={isSettingsModalOpen}
        currentConfig={session.config}
        sprintNumber={session.sprintNumber}
        isCurrentWeekCompleted={session.isCompleted}
        onClose={closeSettings}
        onUpdateDuration={updateSprintDuration}
        onUpdateGoal={updateSprintGoal}
        onStartFreshSprint={(duration, goal) => {
          startNewSprint(duration, goal);
          closeSettings();
        }}
        onSaveDraft={saveSprintDraft}
      />

      <SprintCompletedModal
        isOpen={isCompletedModalOpen}
        analytics={analytics}
        onClose={closeCompletedModal}
        onStartNextSprint={(duration, goal) => {
          startNewSprint(duration, goal);
          closeCompletedModal();
        }}
      />

      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="text-xs sm:text-sm text-muted font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-ink tracking-tight">
              Good day{firstName ? `, ${firstName}` : ''}
            </h1>
          </motion.div>
          <motion.div
            className="w-full lg:max-w-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
          >
            <WorkingWindow />
          </motion.div>
        </header>

        {habitsError && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-clay/30 bg-clay-wash/60 text-xs text-clay shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-clay" />
              <span>{habitsError} — Viewing locally preserved rituals.</span>
            </div>
            <button
              type="button"
              onClick={() => refreshHabits(true)}
              className="underline font-bold hover:text-ink transition-colors cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Live Sprint Horizon Widget */}
        <SprintHorizonWidget
          sprintSession={session}
          onOpenSettings={openSettings}
          onCompleteSprint={openCompletedModal}
        />

        <RiskBanner currentDayIndex={currentDayIndex} />

        {/* 4 Equal-Dimension Key Metric Cards (2x2 on Mobile, 4-col on Desktop) */}
        <motion.section
          aria-label="Key metrics"
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 items-stretch"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {[
            // Card 1: Active Rituals
            <div key="total" className={card}>
              <div>
                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.1em] sm:tracking-[0.14em] text-faint truncate">
                  Active Rituals
                </p>
                <p className="mt-1.5 sm:mt-2.5 font-serif text-2xl sm:text-3xl text-ink leading-tight">
                  <CountUp value={metrics.total} />
                </p>
              </div>
              <div className="mt-3 sm:mt-4 pt-1.5 sm:pt-2 border-t border-line/40">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {metrics.total > 0 ? (
                    Array.from({ length: Math.min(metrics.total, 8) }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="h-1 sm:h-1.5 flex-1 rounded-full bg-sage/70 min-w-[3px]"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{ transformOrigin: 'left' }}
                        transition={{ duration: 0.24, delay: 0.1 + i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                      />
                    ))
                  ) : (
                    <span className="h-1 sm:h-1.5 w-full rounded-full bg-canvas border border-line" />
                  )}
                </div>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted truncate">
                  {metrics.total > 0 ? `${metrics.total} anchored` : 'None anchored'}
                </p>
              </div>
            </div>,

            // Card 2: Today's Completion
            <div key="completion" className={card}>
              <div>
                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.1em] sm:tracking-[0.14em] text-faint truncate">
                  Today&apos;s Done
                </p>
                <p className="mt-1.5 sm:mt-2.5 font-serif text-2xl sm:text-3xl text-ink leading-tight">
                  {completedToday}/{metrics.total}
                </p>
              </div>
              <div className="mt-3 sm:mt-4 pt-1.5 sm:pt-2 border-t border-line/40">
                <div className="h-1 sm:h-1.5 overflow-hidden rounded-full bg-canvas border border-line/50">
                  <motion.div
                    className="h-full rounded-full bg-sage"
                    initial={{ width: 0 }}
                    animate={{ width: `${todayCompletionRate}%` }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted truncate">
                  <CountUp value={todayCompletionRate} suffix="%" /> logged
                </p>
              </div>
            </div>,

            // Card 3: Average Habit Health
            <div key="health" className={card}>
              <div>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.1em] sm:tracking-[0.14em] text-faint truncate">
                    Health
                  </p>
                  <span className={`text-[9px] sm:text-[11px] font-mono font-medium shrink-0 ${healthColor}`}>
                    {healthLabel}
                  </span>
                </div>
                <p className="mt-1.5 sm:mt-2.5 font-serif text-2xl sm:text-3xl text-ink leading-tight">
                  <CountUp value={metrics.averageHealth} suffix="%" />
                </p>
              </div>
              <div className="mt-3 sm:mt-4 pt-1.5 sm:pt-2 border-t border-line/40">
                <div className="h-1 sm:h-1.5 overflow-hidden rounded-full bg-canvas border border-line/50">
                  <motion.div
                    className={`h-full rounded-full ${metrics.averageHealth >= 65 ? 'bg-sage' : 'bg-clay'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.averageHealth}%` }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted truncate">
                  {healthLabel} rhythm
                </p>
              </div>
            </div>,

            // Card 4: Sprint Show-up Rate
            <div key="consistency" className={card}>
              <div>
                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.1em] sm:tracking-[0.14em] text-faint truncate">
                  Show-up
                </p>
                <p className="mt-1.5 sm:mt-2.5 font-serif text-2xl sm:text-3xl text-ink leading-tight">
                  <CountUp value={analytics ? analytics.overallShowUpRate : 100} suffix="%" />
                </p>
              </div>
              <div className="mt-3 sm:mt-4 pt-1.5 sm:pt-2 border-t border-line/40">
                <div className="h-1 sm:h-1.5 overflow-hidden rounded-full bg-canvas border border-line/50">
                  <motion.div
                    className="h-full rounded-full bg-sage-deep"
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics ? analytics.overallShowUpRate : 100}%` }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted truncate">
                  {analytics
                    ? `${analytics.totalCompletedEvents}/${analytics.totalTargetEvents} sustained`
                    : 'Sustained'}
                </p>
              </div>
            </div>
          ].map((child, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -3 }}
              className="flex h-full min-w-0"
            >
              <div className="w-full h-full min-w-0">{child}</div>
            </motion.div>
          ))}
        </motion.section>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <TodayHabitList currentDayIndex={currentDayIndex} />
          <EveningOrganizer currentDayIndex={currentDayIndex} />
        </div>

        {/* Morning Yesterday Reconciliation Modal */}
        <YesterdayCheckinModal
          isOpen={isYesterdayCheckinOpen && !shouldShowStory}
          yesterdayLabel={yesterdayLabel}
          unloggedHabits={unloggedYesterdayHabits}
          onResolve={resolveYesterdayCheckin}
          onClose={closeYesterdayCheckin}
        />
      </div>
    </Layout>
  );
}

