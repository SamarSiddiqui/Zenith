"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Habit } from '../types/zenith';
import type {
  SprintConfig,
  SprintSession,
  PastSprintSummary,
  SprintDbRow,
} from '../types/sprint';
import {
  generateSprintDateRange,
  calculateSprintDayInfo,
  checkIsSprintCompleted,
} from '../lib/utils/sprintDate';
import {
  calculateSprintAnalytics,
  createSprintHabitSnapshots,
  getPastSprints,
} from '../lib/services/sprintAnalytics';
import { useAuth } from '../context/AuthContext';
import { createClient } from '../lib/supabase/client';
import { isSupabaseConfigured } from '../lib/supabase/env';

const LOCAL_STORAGE_ACTIVE_SPRINT = 'zenith_active_sprint_session';
const LOCAL_STORAGE_PAST_SPRINTS = 'zenith_past_sprints_archive';

function createDefaultSprintSession(userId: string = 'local-user', durationDays: number = 7, sprintNumber: number = 1): SprintSession {
  const { startDate, endDate } = generateSprintDateRange(new Date(), durationDays);
  const config: SprintConfig = {
    durationDays,
    startDate,
    endDate,
    sprintGoal: 'Ground daily circadian rituals and sustain steady momentum',
  };

  const dayInfo = calculateSprintDayInfo(startDate, durationDays);

  return {
    id: `local-sprint-${sprintNumber}`,
    userId,
    sprintNumber,
    config,
    status: 'active',
    currentDayIndex: dayInfo.dayIndex,
    isCompleted: dayInfo.isCompleted,
    snapshots: [],
    createdAt: startDate,
    updatedAt: startDate,
  };
}

export function useSprint(habits: Habit[]) {
  const { user } = useAuth();
  const [session, setSession] = useState<SprintSession>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_SPRINT);
      if (saved) {
        try {
          const parsed: SprintSession = JSON.parse(saved);
          const dayInfo = calculateSprintDayInfo(parsed.config.startDate, parsed.config.durationDays);
          return {
            ...parsed,
            currentDayIndex: dayInfo.dayIndex,
            isCompleted: dayInfo.isCompleted || parsed.status === 'completed',
            status: dayInfo.isCompleted ? 'completed' : parsed.status,
          };
        } catch (e) {
          console.error('Error parsing stored sprint session:', e);
        }
      }
    }
    return createDefaultSprintSession(user?.id || 'local-user', 7, 1);
  });

  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isPastSprintsOpen, setIsPastSprintsOpen] = useState<boolean>(false);
  const [pastSprints, setPastSprints] = useState<PastSprintSummary[]>([]);
  const [isLoadingPastSprints, setIsLoadingPastSprints] = useState<boolean>(false);
  const [activePastSprintDetail, setActivePastSprintDetail] = useState<SprintDbRow | null>(null);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  // Sync active sprint to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_SPRINT, JSON.stringify(session));
    }
  }, [session]);

  // Real-time day tracking update
  useEffect(() => {
    const dayInfo = calculateSprintDayInfo(session.config.startDate, session.config.durationDays);
    const isCompleted = checkIsSprintCompleted(session.config.startDate, session.config.durationDays);

    setSession((prev) => ({
      ...prev,
      currentDayIndex: dayInfo.dayIndex,
      isCompleted: isCompleted || prev.status === 'completed',
      status: isCompleted ? 'completed' : prev.status,
    }));
  }, [session.config.startDate, session.config.durationDays]);

  // Load Past Sprints
  const loadPastSprints = useCallback(async () => {
    setIsLoadingPastSprints(true);
    try {
      const data = await getPastSprints(user?.id);
      if (data && data.length > 0) {
        setPastSprints(data);
      } else if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(LOCAL_STORAGE_PAST_SPRINTS);
        if (saved) {
          setPastSprints(JSON.parse(saved));
        }
      }
    } catch (err) {
      console.error('Failed to load past sprints:', err);
    } finally {
      setIsLoadingPastSprints(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPastSprints();
  }, [loadPastSprints]);

  // Current calculated analytics (available on completion)
  const currentAnalytics = useMemo(() => {
    return calculateSprintAnalytics(habits, session.config, session.sprintNumber);
  }, [habits, session.config, session.sprintNumber]);

  // Update Sprint Duration (1 to 15 days)
  const updateSprintDuration = useCallback((newDuration: number) => {
    const clamped = Math.max(1, Math.min(15, newDuration));
    setSession((prev) => {
      const { startDate, endDate } = generateSprintDateRange(new Date(prev.config.startDate), clamped);
      const dayInfo = calculateSprintDayInfo(startDate, clamped);
      return {
        ...prev,
        config: {
          ...prev.config,
          durationDays: clamped,
          startDate,
          endDate,
        },
        currentDayIndex: dayInfo.dayIndex,
        isCompleted: dayInfo.isCompleted,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // Update Sprint Goal
  const updateSprintGoal = useCallback((goal: string) => {
    setSession((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        sprintGoal: goal,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Complete Current Sprint & Store in Archive / Supabase
  const completeSprint = useCallback(async () => {
    setIsCompleting(true);
    const analytics = calculateSprintAnalytics(habits, session.config, session.sprintNumber);
    const snapshots = createSprintHabitSnapshots(habits, session.config.durationDays);

    const completedSession: SprintSession = {
      ...session,
      status: 'completed',
      isCompleted: true,
      snapshots,
      analytics,
      updatedAt: new Date().toISOString(),
    };

    setSession(completedSession);

    // Save past sprint summary locally
    const pastSummary: PastSprintSummary = {
      id: session.id,
      sprintNumber: session.sprintNumber,
      durationDays: session.config.durationDays,
      startDate: session.config.startDate,
      endDate: session.config.endDate,
      overallShowUpRate: analytics.overallShowUpRate,
      anchorHabitName: analytics.anchorHabits[0]?.name,
      slippedHabitName: analytics.slippedHabits[0]?.name,
      completedHabitsCount: analytics.anchorHabits.length,
      totalHabitsCount: habits.length,
      createdAt: new Date().toISOString(),
    };

    setPastSprints((prev) => {
      const updated = [pastSummary, ...prev.filter((p) => p.id !== session.id)];
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_PAST_SPRINTS, JSON.stringify(updated));
      }
      return updated;
    });

    // Save to Supabase if available
    const supabase = createClient();
    if (supabase && isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from('sprints').upsert({
          id: session.id.startsWith('local-') ? undefined : session.id,
          user_id: user.id,
          sprint_number: session.sprintNumber,
          duration_days: session.config.durationDays,
          start_date: session.config.startDate,
          end_date: session.config.endDate,
          status: 'completed',
          habit_snapshots: snapshots,
          analytics: analytics,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to save completed sprint to Supabase:', err);
      }
    }

    setIsCompleting(false);
    setIsCompletedModalOpen(true);
  }, [habits, session, user?.id]);

  // Start Next Sprint Horizon
  const startNewSprint = useCallback(
    (customDuration?: number, customGoal?: string) => {
      const nextDuration = customDuration || session.config.durationDays || 7;
      const nextNumber = session.sprintNumber + 1;
      const { startDate, endDate } = generateSprintDateRange(new Date(), nextDuration);

      const nextSession: SprintSession = {
        id: `local-sprint-${nextNumber}-${Date.now()}`,
        userId: user?.id || 'local-user',
        sprintNumber: nextNumber,
        config: {
          durationDays: nextDuration,
          startDate,
          endDate,
          sprintGoal: customGoal || `Sprint ${nextNumber} Rhythm & Flow`,
        },
        status: 'active',
        currentDayIndex: 0,
        isCompleted: false,
        snapshots: [],
        createdAt: startDate,
        updatedAt: startDate,
      };

      setSession(nextSession);
      setIsCompletedModalOpen(false);
      setIsSettingsModalOpen(false);
    },
    [session.config.durationDays, session.sprintNumber, user?.id]
  );

  // Day progress metrics
  const dayProgress = useMemo(() => {
    return calculateSprintDayInfo(session.config.startDate, session.config.durationDays);
  }, [session.config.startDate, session.config.durationDays]);

  return {
    session,
    dayProgress,
    analytics: currentAnalytics,
    isCompletedModalOpen,
    isSettingsModalOpen,
    isPastSprintsOpen,
    pastSprints,
    isLoadingPastSprints,
    activePastSprintDetail,
    isCompleting,
    // Actions
    updateSprintDuration,
    updateSprintGoal,
    completeSprint,
    startNewSprint,
    openCompletedModal: () => setIsCompletedModalOpen(true),
    closeCompletedModal: () => setIsCompletedModalOpen(false),
    openSettings: () => setIsSettingsModalOpen(true),
    closeSettings: () => setIsSettingsModalOpen(false),
    openPastSprints: () => {
      loadPastSprints();
      setIsPastSprintsOpen(true);
    },
    closePastSprints: () => setIsPastSprintsOpen(false),
    setActivePastSprintDetail,
    refreshPastSprints: loadPastSprints,
  };
}
