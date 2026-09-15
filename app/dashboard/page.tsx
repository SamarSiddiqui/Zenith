"use client";

import React, { useState, useEffect } from 'react';
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
import { OnboardingModal } from '../../components/auth/OnboardingModal';

const card = 'flex flex-col rounded-2xl border border-line bg-surface px-5 py-5 shadow-calm';

export default function DashboardPage() {
  const { user } = useAuth();
  const { habits, metrics, isLoading: habitsLoading } = useHabits();
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
    startNewSprint,
  } = useSprint(habits);

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !user.onboarded) {
      setShowOnboarding(true);
    }
  }, [user]);

  const displayName = user?.fullName?.split(' ')[0] || 'Samar';

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
    <Layout userName={user?.fullName || displayName}>
      {/* Onboarding Modal for New Users */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

      {/* Sprint Modals */}
      <SprintSettingsModal
        isOpen={isSettingsModalOpen}
        currentConfig={session.config}
        sprintNumber={session.sprintNumber}
        onClose={closeSettings}
        onUpdateDuration={updateSprintDuration}
        onUpdateGoal={updateSprintGoal}
        onStartFreshSprint={(duration, goal) => {
          startNewSprint(duration, goal);
          closeSettings();
        }}
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
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="text-sm text-muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-1.5 font-serif text-4xl text-ink md:text-5xl">
              Good day, {displayName}
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

        {/* Live Sprint Horizon Widget */}
        <SprintHorizonWidget
          sprintSession={session}
          onOpenSettings={openSettings}
          onCompleteSprint={openCompletedModal}
        />

        <RiskBanner />

        <motion.section
          aria-label="Key metrics"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {[
            <div key="total" className={card}>
              <p className="text-xs uppercase tracking-[0.14em] text-faint">Active Rituals</p>
              <p className="mt-3 font-serif text-3xl text-ink">
                <CountUp value={metrics.total} />
              </p>
              <div className="mt-auto flex items-center gap-1.5 pt-3">
                {metrics.total > 0 ? (
                  Array.from({ length: Math.min(metrics.total, 10) }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 flex-1 rounded-full bg-sage/70"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ transformOrigin: 'left' }}
                      transition={{ duration: 0.24, delay: 0.1 + i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                    />
                  ))
                ) : (
                  <span className="text-[11px] font-mono text-muted">No habits anchored</span>
                )}
              </div>
            </div>,

            <div key="completion" className={card}>
              <p className="text-xs uppercase tracking-[0.14em] text-faint">Today&apos;s completion</p>
              <p className="mt-3 font-serif text-3xl text-ink">
                {metrics.completedToday}/{metrics.total}
              </p>
              <div className="mt-auto pt-3">
                <div className="h-2 overflow-hidden rounded-full bg-canvas">
                  <motion.div
                    className="h-full rounded-full bg-sage"
                    initial={{ width: 0 }}
                    animate={{ width: `${metrics.completionRate}%` }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  <CountUp value={metrics.completionRate} suffix="%" /> complete
                </p>
              </div>
            </div>,

            <div key="health" className={`${card} items-start`}>
              <p className="text-xs uppercase tracking-[0.14em] text-faint">Average habit health</p>
              <div className="mt-3 flex w-full items-center gap-4">
                <HealthRing value={metrics.averageHealth} size={72} stroke={6} />
                <span className={`text-xs font-medium ${healthColor}`}>{healthLabel}</span>
              </div>
            </div>,

            <div key="consistency" className={card}>
              <p className="text-xs uppercase tracking-[0.14em] text-faint">Sprint Show-up Rate</p>
              <p className="mt-3 font-serif text-3xl text-ink">
                <CountUp value={analytics ? analytics.overallShowUpRate : 100} suffix="%" />
              </p>
              <div className="mt-auto pt-3">
                <div className="h-2 overflow-hidden rounded-full bg-canvas">
                  <motion.div
                    className="h-full rounded-full bg-sage-deep"
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics ? analytics.overallShowUpRate : 100}%` }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {analytics
                    ? `${analytics.totalCompletedEvents}/${analytics.totalTargetEvents} rituals completed`
                    : 'Sustaining rhythm'}
                </p>
              </div>
            </div>
          ].map((child, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -3 }}
              className="flex"
            >
              <div className="w-full">{child}</div>
            </motion.div>
          ))}
        </motion.section>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <TodayHabitList />
          <EveningOrganizer />
        </div>
      </div>
    </Layout>
  );
}

