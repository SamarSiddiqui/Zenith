"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../../components/Layout';
import { useHabits } from '../../hooks/useHabits';
import { useSprint } from '../../hooks/useSprint';
import { HabitHeader, PlannerViewMode } from '../../components/habits/HabitHeader';
import { CircadianBandsView } from '../../components/habits/CircadianBandsView';
import { DynamicSprintMatrix } from '../../components/habits/DynamicSprintMatrix';
import { HabitGenesisModal } from '../../components/habits/HabitGenesisModal';
import { SkipModal } from '../../components/habits/SkipModal';
import { HabitDetailDrawer } from '../../components/habits/HabitDetailDrawer';
import { SprintSettingsModal } from '../../components/habits/SprintSettingsModal';
import { SprintCompletedModal } from '../../components/habits/SprintCompletedModal';
import { PastSprintsDrawer } from '../../components/habits/PastSprintsDrawer';
import type { Habit, CircadianSlot } from '../../types/zenith';

export default function HabitsPage() {
  const {
    habits,
    isLoading,
    circadianGroups,
    metrics,
    toggleStatus,
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

  const [viewMode, setViewMode] = useState<PlannerViewMode>('circadian');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [defaultSlot, setDefaultSlot] = useState<CircadianSlot | undefined>(undefined);
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
        h.circadianSlot.toLowerCase().includes(q)
    );
  }, [habits, searchQuery]);

  // Filter circadian groups according to search query
  const filteredCircadianGroups = useMemo(() => {
    if (!searchQuery.trim()) return circadianGroups;
    const q = searchQuery.toLowerCase();
    const filterList = (list: Habit[]) =>
      list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.category?.toLowerCase().includes(q)
      );

    return {
      morning: filterList(circadianGroups.morning),
      afternoon: filterList(circadianGroups.afternoon),
      evening: filterList(circadianGroups.evening),
      anytime: filterList(circadianGroups.anytime),
    };
  }, [circadianGroups, searchQuery]);

  const handleOpenCreate = (slot?: CircadianSlot) => {
    setDefaultSlot(slot);
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
        {/* Habit Planner Header & Dynamic Sprint Controls */}
        <HabitHeader
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateModal={() => handleOpenCreate()}
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

        {/* Main View Area with Smooth Transitions */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            {viewMode === 'circadian' ? (
              <motion.div
                key="circadian"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CircadianBandsView
                  circadianGroups={filteredCircadianGroups}
                  onToggleStatus={(id) => handleToggle(id, sprintSession.currentDayIndex)}
                  onOpenSkipModal={(habit) =>
                    setSkipHabit({ habit, dayIndex: sprintSession.currentDayIndex })
                  }
                  onLogMicroStep={(id) => logMicroStep(id, sprintSession.currentDayIndex)}
                  onOpenCreateModal={handleOpenCreate}
                  onSelectHabit={(habit) => setSelectedHabitId(habit.id)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="matrix"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
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
          </AnimatePresence>
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
            logMicroStep(id, idx);
          }}
          onConfirmMiss={() => {
            setSkipHabit(null);
          }}
        />

        {/* Drawer: Habit Detail & Micro-Fallback Inspector */}
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
