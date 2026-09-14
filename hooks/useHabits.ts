"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Habit, HabitStatus, CreateHabitInput, UpdateHabitInput, CircadianSlot } from '../types/zenith';
import { getHabits, createHabit, updateHabit, deleteHabit, calculateHabitHealth } from '../lib/services/habits';
import { useAuth } from '../context/AuthContext';

const STATUS_CYCLE: Record<HabitStatus, HabitStatus> = {
  unlogged: 'completed',
  completed: 'missed',
  missed: 'unlogged',
};

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load habits on mount or user change
  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getHabits(user?.id);
      setHabits(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load habits:', err);
      setError('Could not load habits');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // Group habits by circadian energy slot
  const circadianGroups = useMemo(() => {
    const groups: Record<CircadianSlot, Habit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      anytime: [],
    };

    habits.forEach((habit) => {
      const slot = habit.circadianSlot || 'morning';
      if (groups[slot]) {
        groups[slot].push(habit);
      } else {
        groups.morning.push(habit);
      }
    });

    return groups;
  }, [habits]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = habits.length;
    const completedToday = habits.filter((h) => h.status === 'completed').length;
    const totalHealth = habits.reduce((acc, h) => acc + (h.health || 80), 0);
    const averageHealth = total > 0 ? Math.round(totalHealth / total) : 80;

    return {
      total,
      completedToday,
      completionRate: total > 0 ? Math.round((completedToday / total) * 100) : 0,
      averageHealth,
    };
  }, [habits]);

  // Explicit Status Setter (for Missed, Completed, Unlogged)
  const setHabitStatus = useCallback(
    async (habitId: string, dayIndex: number, status: HabitStatus): Promise<boolean> => {
      const current = habits.find((h) => h.id === habitId);
      if (!current) return false;

      const updatedWeek = [...(current.week || [])];
      while (updatedWeek.length <= dayIndex) {
        updatedWeek.push('unlogged');
      }
      updatedWeek[dayIndex] = status;

      const updatedHealth = calculateHabitHealth(updatedWeek);

      const updatedHabit: Habit = {
        ...current,
        status: status,
        week: updatedWeek,
        health: updatedHealth,
      };

      // Optimistic UI state update
      setHabits((prev) => prev.map((h) => (h.id === habitId ? updatedHabit : h)));

      // Guaranteed asynchronous persistence
      await updateHabit(habitId, {
        status: updatedHabit.status,
        week: updatedHabit.week,
        health: updatedHabit.health,
      });

      return true;
    },
    [habits]
  );

  // Optimistic Status Toggle
  const toggleStatus = useCallback(
    async (habitId: string, dayIndex: number = 0): Promise<{ nextStatus: HabitStatus; habit: Habit | null }> => {
      const current = habits.find((h) => h.id === habitId);
      if (!current) return { nextStatus: 'completed', habit: null };

      const currentStatus = current.week[dayIndex] || current.status || 'unlogged';
      const nextStatus = STATUS_CYCLE[currentStatus];

      const updatedWeek = [...(current.week || [])];
      while (updatedWeek.length <= dayIndex) {
        updatedWeek.push('unlogged');
      }
      updatedWeek[dayIndex] = nextStatus;

      const updatedHealth = calculateHabitHealth(updatedWeek);

      const updatedHabit: Habit = {
        ...current,
        status: nextStatus,
        week: updatedWeek,
        health: updatedHealth,
      };

      // Optimistic UI update
      setHabits((prev) => prev.map((h) => (h.id === habitId ? updatedHabit : h)));

      // Guaranteed asynchronous persistence
      await updateHabit(habitId, {
        status: updatedHabit.status,
        week: updatedHabit.week,
        health: updatedHabit.health,
      });

      return { nextStatus, habit: updatedHabit };
    },
    [habits]
  );

  // Optimistic Micro-Step Logger (for zero-guilt recovery)
  const logMicroStep = useCallback(
    async (habitId: string, dayIndex: number = 0): Promise<boolean> => {
      const current = habits.find((h) => h.id === habitId);
      if (!current) return false;

      const updatedWeek = [...(current.week || [])];
      while (updatedWeek.length <= dayIndex) {
        updatedWeek.push('unlogged');
      }
      updatedWeek[dayIndex] = 'completed'; // Logged as completed micro-step

      const updatedHealth = Math.min(100, (current.health || 80) + 2); // Boost morale

      const updatedHabit: Habit = {
        ...current,
        status: 'completed',
        week: updatedWeek,
        health: updatedHealth,
      };

      // Optimistic UI update
      setHabits((prev) => prev.map((h) => (h.id === habitId ? updatedHabit : h)));

      // Guaranteed asynchronous persistence
      await updateHabit(habitId, {
        status: updatedHabit.status,
        week: updatedHabit.week,
        health: updatedHabit.health,
      });

      return true;
    },
    [habits]
  );

  // Add Habit
  const addHabit = useCallback(
    async (input: CreateHabitInput): Promise<boolean> => {
      if (!user?.id) {
        // Local mode fallback
        const newHabit = await createHabit('local-user', input);
        if (newHabit) {
          setHabits((prev) => [...prev, newHabit]);
          return true;
        }
        return false;
      }

      const created = await createHabit(user.id, input);
      if (created) {
        setHabits((prev) => [...prev, created]);
        return true;
      }
      return false;
    },
    [user?.id]
  );

  // Edit Habit
  const editHabit = useCallback(
    async (habitId: string, updates: UpdateHabitInput): Promise<boolean> => {
      setHabits((prev) =>
        prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h))
      );
      return await updateHabit(habitId, updates);
    },
    []
  );

  // Remove Habit
  const removeHabit = useCallback(
    async (habitId: string): Promise<boolean> => {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      return await deleteHabit(habitId);
    },
    []
  );

  return {
    habits,
    isLoading,
    error,
    circadianGroups,
    metrics,
    toggleStatus,
    setHabitStatus,
    logMicroStep,
    addHabit,
    editHabit,
    removeHabit,
    refreshHabits: loadHabits,
  };
}
