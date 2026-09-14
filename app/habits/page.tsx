"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../../components/Layout';
import { useHabits } from '../../hooks/useHabits';
import { useSprint } from '../../hooks/useSprint';
import { HabitHeader } from '../../components/habits/HabitHeader';
import { DynamicSprintMatrix } from '../../components/habits/DynamicSprintMatrix';
import { HabitGenesisModal } from '../../components/habits/HabitGenesisModal';
import { SkipModal } from '../../components/habits/SkipModal';
import { HabitDetailDrawer } from '../../components/habits/HabitDetailDrawer';
import { SprintSettingsModal } from '../../components/habits/SprintSettingsModal';
import { SprintCompletedModal } from '../../components/habits/SprintCompletedModal';
import { PastSprintsDrawer } from '../../components/habits/PastSprintsDrawer';
import type { Habit } from '../../types/zenith';

export default function HabitsPage() {
  const {
    habits,
    isLoading,
    metrics,
    toggleStatus,
    setHabitStatus,
    logMicroStep,
    addHabit,
    editHabit,
    removeHabit,
  } = useHabits();

  const {
    session: sprintSession,
    analytics: sprintAnalytics,
    isCompletedModalOpen,
    isSettingsModalOpen,
    isPastSprintsOpen,
    pastSprints,
    isLoadingPastSprints,
    updateSprintDuration,
    updateSprintGoal,
    completeSprint,
    startNewSprint,
    openCompletedModal,
    closeCompletedModal,
    openSettings,
    closeSettings,
    openPastSprints,
    closePastSprints,
  } = useSprint(habits);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [skipHabit, setSkipHabit] = useState<{ habit: Habit; dayIndex: number } | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // Active drawer habit lookup
  const selectedDrawerHabit = useMemo(() => {
    return habits.find((h) => h.id === selectedHabitId) || null;
  }, [habits, selectedHabitId]);

  // Filter habits according to search query
  const filteredHabits = useMemo(() => {
    if (!searchQuery.trim()) return habits;
    const q = searchQuery.toLowerCase();
    return habits.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.category?.toLowerCase().includes(q) ||
        h.window?.toLowerCase().includes(q)
    );
  }, [habits, searchQuery]);

  const handleOpenCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleToggle = async (habitId: string, dayIndex: number = sprintSession.currentDayIndex) => {
    const res = await toggleStatus(habitId, dayIndex);
    if (res.nextStatus === 'missed' && res.habit) {
      setSkipHabit({ habit: res.habit, dayIndex });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 pb-12">
        {/* Habit Planner Header & Dynamic Sprint Horizon Controls */}
        <HabitHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateModal={handleOpenCreate}
          totalHabits={metrics.total}
          completedToday={metrics.completedToday}
          averageHealth={metrics.averageHealth}
          sprintSession={sprintSession}
          onOpenSprintSettings={openSettings}
          onCompleteSprint={completeSprint}
          onOpenPastSprints={openPastSprints}
        />

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 rounded-3xl bg-surface border border-line" />
            <div className="h-44 rounded-3xl bg-surface border border-line" />
          </div>
        )}

        {/* Sprint Horizon Dynamic Matrix View */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DynamicSprintMatrix
              habits={filteredHabits}
              config={sprintSession.config}
              currentDayIndex={sprintSession.currentDayIndex}
              onToggleStatus={(id, idx) => handleToggle(id, idx)}
              onOpenSkipModal={(habit, idx) => setSkipHabit({ habit, dayIndex: idx })}
              onSelectHabit={(habit) => setSelectedHabitId(habit.id)}
              onQuickMicroStep={(id, idx) => logMicroStep(id, idx)}
            />
          </motion.div>
        )}

        {/* Modal 1: Habit Genesis Creation Modal */}
        <HabitGenesisModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={addHabit}
        />

        {/* Modal 2: Mindful Skip & Micro-Recovery Modal */}
        <SkipModal
          habit={skipHabit?.habit || null}
          dayIndex={skipHabit?.dayIndex ?? sprintSession.currentDayIndex}
          onClose={() => setSkipHabit(null)}
          onLogMicroStep={(id, idx) => {
            logMicroStep(id, idx ?? sprintSession.currentDayIndex);
          }}
          onConfirmMiss={(id, idx) => {
            setHabitStatus(id, idx ?? sprintSession.currentDayIndex, 'missed');
            setSkipHabit(null);
          }}
        />

        {/* Drawer 1: Habit Detail & Micro-Fallback Inspector */}
        <HabitDetailDrawer
          habit={selectedDrawerHabit}
          isOpen={Boolean(selectedDrawerHabit)}
          onClose={() => setSelectedHabitId(null)}
          onLogMicroStep={(id) => logMicroStep(id, sprintSession.currentDayIndex)}
          onUpdateHabit={editHabit}
          onDeleteHabit={removeHabit}
        />

        {/* Modal 3: Dynamic Sprint Settings Modal (1-15 days) */}
        <SprintSettingsModal
          isOpen={isSettingsModalOpen}
          currentConfig={sprintSession.config}
          sprintNumber={sprintSession.sprintNumber}
          onClose={closeSettings}
          onUpdateDuration={updateSprintDuration}
          onUpdateGoal={updateSprintGoal}
          onStartFreshSprint={startNewSprint}
        />

        {/* Modal 4: Sprint Completed Retrospective & Horizon Analytics */}
        <SprintCompletedModal
          isOpen={isCompletedModalOpen}
          analytics={sprintAnalytics}
          onClose={closeCompletedModal}
          onStartNextSprint={startNewSprint}
        />

        {/* Drawer 2: Past Sprints Timeline Archive */}
        <PastSprintsDrawer
          isOpen={isPastSprintsOpen}
          pastSprints={pastSprints}
          isLoading={isLoadingPastSprints}
          onClose={closePastSprints}
          onSelectSprintAnalytics={(past) => {
            closePastSprints();
            openCompletedModal();
          }}
        />
      </div>
    </Layout>
  );
}
