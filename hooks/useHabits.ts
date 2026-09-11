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

  // Optimistic Status Toggle
  const toggleStatus = useCallback(
    async (habitId: string, dayIndex: number = 3): Promise<{ nextStatus: HabitStatus; habit: Habit | null }> => {
      let targetHabit: Habit | null = null;
      let nextStatus: HabitStatus = 'completed';

      setHabits((prevHabits) =>
        prevHabits.map((h) => {
          if (h.id !== habitId) return h;

          const currentStatus = h.week[dayIndex] || h.status || 'unlogged';
          nextStatus = STATUS_CYCLE[currentStatus];

          const updatedWeek = [...h.week];
          updatedWeek[dayIndex] = nextStatus;

          const updatedHealth = calculateHabitHealth(updatedWeek);

          targetHabit = {
            ...h,
            status: dayIndex === 3 ? nextStatus : h.status,
            week: updatedWeek,
            health: updatedHealth,
          };

          return targetHabit;
        })
      );

      if (targetHabit) {
        // Asynchronously sync with Supabase
        const updatedHabit = targetHabit as Habit;
        updateHabit(habitId, {
          status: updatedHabit.status,
          week: updatedHabit.week,
          health: updatedHabit.health,
        });
      }

      return { nextStatus, habit: targetHabit };
    },
    []
  );

  // Optimistic Micro-Step Logger (for zero-guilt recovery)
  const logMicroStep = useCallback(
    async (habitId: string, dayIndex: number = 3): Promise<boolean> => {
      let targetHabit: Habit | null = null;

      setHabits((prevHabits) =>
        prevHabits.map((h) => {
          if (h.id !== habitId) return h;

          const updatedWeek = [...h.week];
          updatedWeek[dayIndex] = 'completed'; // Logged as completed micro-step

          targetHabit = {
            ...h,
            status: dayIndex === 3 ? 'completed' : h.status,
            week: updatedWeek,
            health: Math.min(100, (h.health || 80) + 2), // Boost morale
          };

          return targetHabit;
        })
      );

      if (targetHabit) {
        const updated = targetHabit as Habit;
        await updateHabit(habitId, {
          status: updated.status,
          week: updated.week,
          health: updated.health,
        });
        return true;
      }

      return false;
    },
    []
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
    logMicroStep,
    addHabit,
    editHabit,
    removeHabit,
    refreshHabits: loadHabits,
  };
}
