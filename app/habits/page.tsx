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
import type { SprintConfig } from '../../types/sprint';
import { getShiftedWeekInfo } from '../../lib/utils/sprintDate';

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
    saveSprintDraft,
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

  // Week Navigation State: 0 = current active week, -1 = previous week, -2 = 2 weeks ago, etc.
  const [weekOffset, setWeekOffset] = useState<number>(0);

  const viewingWeekInfo = useMemo(() => {
    return getShiftedWeekInfo(weekOffset);
  }, [weekOffset]);

  const viewingConfig: SprintConfig = useMemo(() => {
    if (weekOffset === 0) return sprintSession.config;
    return {
      durationDays: 7,
      startDate: viewingWeekInfo.startDate,
      endDate: viewingWeekInfo.endDate,
      sprintGoal: `Archived Sprint (Week ${viewingWeekInfo.weekNumber})`,
    };
  }, [weekOffset, viewingWeekInfo, sprintSession.config]);

  const handlePrevWeek = () => {
    setWeekOffset((prev) => prev - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset((prev) => Math.min(0, prev + 1));
  };

  const handleResetToCurrentWeek = () => {
    setWeekOffset(0);
  };

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
    if (weekOffset !== 0) return; // Prevent mutating past archived weeks
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
          weekOffset={weekOffset}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onResetToCurrentWeek={handleResetToCurrentWeek}
          viewingWeekInfo={viewingWeekInfo}
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
              config={viewingConfig}
              currentDayIndex={weekOffset === 0 ? sprintSession.currentDayIndex : -1}
              isHistoricalView={weekOffset < 0}
              onResetToCurrentWeek={handleResetToCurrentWeek}
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

        {/* Modal 3: Weekly Sprint Horizon Settings & 24h Draft Modal */}
        <SprintSettingsModal
          isOpen={isSettingsModalOpen}
          currentConfig={sprintSession.config}
          sprintNumber={sprintSession.sprintNumber}
          isCurrentWeekCompleted={sprintSession.isCompleted}
          onClose={closeSettings}
          onUpdateDuration={updateSprintDuration}
          onUpdateGoal={updateSprintGoal}
          onStartFreshSprint={startNewSprint}
          onSaveDraft={saveSprintDraft}
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
