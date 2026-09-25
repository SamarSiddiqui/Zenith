"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Habit, HabitStatus } from '../types/zenith';
import { updateHabit, calculateHabitHealth } from '../lib/services/habits';
import { getMondayOfWeek, calculateSprintDayInfo } from '../lib/utils/sprintDate';

const YESTERDAY_CHECKIN_STORAGE_KEY = 'zenith_last_yesterday_checkin_date';

export function useYesterdayCheckin(
  habits: Habit[],
  refreshHabits?: () => Promise<void>
) {
  const [isOpen, setIsOpen] = useState(false);

  // Compute current sprint day index (0 for Mon, 1 for Tue, ... 6 for Sun)
  const currentMonday = useMemo(() => getMondayOfWeek(new Date()), []);
  const dayInfo = useMemo(
    () => calculateSprintDayInfo(currentMonday.toISOString(), 7),
    [currentMonday]
  );
  const currentDayIndex = dayInfo.dayIndex;
  const yesterdayIndex = currentDayIndex - 1;

  // Format yesterday's label (e.g. "Wednesday, Sep 23")
  const yesterdayLabel = useMemo(() => {
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    return yesterdayDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Filter habits that were unlogged on yesterday's day index
  const unloggedYesterdayHabits = useMemo(() => {
    if (yesterdayIndex < 0 || habits.length === 0) return [];

    return habits.filter((h) => {
      const status = h.week?.[yesterdayIndex];
      return status === 'unlogged' || status === undefined;
    });
  }, [habits, yesterdayIndex]);

  // Check on mount if we should prompt the user
  useEffect(() => {
    if (yesterdayIndex < 0 || unloggedYesterdayHabits.length === 0) {
      setIsOpen(false);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const lastPrompted = typeof window !== 'undefined' ? localStorage.getItem(YESTERDAY_CHECKIN_STORAGE_KEY) : null;

    if (lastPrompted !== todayStr) {
      // Delay opening slightly so page transition completes smoothly
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [yesterdayIndex, unloggedYesterdayHabits.length]);

  const closeCheckin = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (typeof window !== 'undefined') {
      localStorage.setItem(YESTERDAY_CHECKIN_STORAGE_KEY, todayStr);
    }
    setIsOpen(false);
  }, []);

  const resolveYesterdayCheckin = useCallback(
    async (decisions: Record<string, 'completed' | 'missed'>) => {
      if (yesterdayIndex < 0) return;

      const promises = Object.entries(decisions).map(async ([habitId, decisionStatus]) => {
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;

        const updatedWeek: HabitStatus[] = [...(habit.week || ['unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged'])];
        while (updatedWeek.length <= yesterdayIndex) {
          updatedWeek.push('unlogged');
        }
        updatedWeek[yesterdayIndex] = decisionStatus;

        const updatedHealth = calculateHabitHealth(updatedWeek, currentDayIndex);

        if (habit.id && !habit.id.startsWith('local-habit-')) {
          await updateHabit(habit.id, {
            week: updatedWeek,
            health: updatedHealth,
          });
        }
      });

      await Promise.all(promises);

      const todayStr = new Date().toISOString().split('T')[0];
      if (typeof window !== 'undefined') {
        localStorage.setItem(YESTERDAY_CHECKIN_STORAGE_KEY, todayStr);
      }

      setIsOpen(false);

      if (refreshHabits) {
        await refreshHabits();
      }
    },
    [habits, yesterdayIndex, currentDayIndex, refreshHabits]
  );

  return {
    isYesterdayCheckinOpen: isOpen,
    yesterdayLabel,
    yesterdayIndex,
    unloggedYesterdayHabits,
    openYesterdayCheckin: () => setIsOpen(true),
    closeYesterdayCheckin: closeCheckin,
    resolveYesterdayCheckin,
  };
}
