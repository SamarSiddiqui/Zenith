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
    id: `sprint-${sprintNumber}`,
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
    return createDefaultSprintSession(user?.id || 'local-user', 7, 1);
  });

  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isPastSprintsOpen, setIsPastSprintsOpen] = useState<boolean>(false);
  const [pastSprints, setPastSprints] = useState<PastSprintSummary[]>([]);
  const [isLoadingPastSprints, setIsLoadingPastSprints] = useState<boolean>(false);
  const [activePastSprintDetail, setActivePastSprintDetail] = useState<SprintDbRow | null>(null);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  // Fetch active sprint directly from Supabase
  const loadActiveSprint = useCallback(async () => {
    const supabase = createClient();
    if (!supabase || !isSupabaseConfigured() || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('sprint_number', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching active sprint from Supabase:', error);
        return;
      }

      if (data) {
        const row = data as SprintDbRow;
        const dayInfo = calculateSprintDayInfo(row.start_date, row.duration_days);
        const isCompleted = checkIsSprintCompleted(row.start_date, row.duration_days);

        const loadedSession: SprintSession = {
          id: row.id,
          userId: row.user_id,
          sprintNumber: row.sprint_number,
          config: {
            durationDays: row.duration_days,
            startDate: row.start_date,
            endDate: row.end_date,
            sprintGoal: row.analytics?.recommendations?.[0]?.title || 'Ground daily rituals and sustain steady momentum',
          },
          status: isCompleted ? 'completed' : 'active',
          currentDayIndex: dayInfo.dayIndex,
          isCompleted,
          snapshots: row.habit_snapshots || [],
          analytics: row.analytics || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };

        setSession(loadedSession);
      }
    } catch (err) {
      console.error('Failed to load active sprint:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    loadActiveSprint();
  }, [loadActiveSprint]);

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

  // Load Past Sprints directly from Supabase
  const loadPastSprints = useCallback(async () => {
    setIsLoadingPastSprints(true);
    try {
      const data = await getPastSprints(user?.id);
      setPastSprints(data || []);
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

  // Update Sprint Duration (1 to 15 days) & persist to Supabase
  const updateSprintDuration = useCallback(async (newDuration: number) => {
    const clamped = Math.max(1, Math.min(15, newDuration));
    const { startDate, endDate } = generateSprintDateRange(new Date(session.config.startDate), clamped);
    const dayInfo = calculateSprintDayInfo(startDate, clamped);

    const updatedSession: SprintSession = {
      ...session,
      config: {
        ...session.config,
        durationDays: clamped,
        startDate,
        endDate,
      },
      currentDayIndex: dayInfo.dayIndex,
      isCompleted: dayInfo.isCompleted,
      updatedAt: new Date().toISOString(),
    };

    setSession(updatedSession);

    // Sync directly to Supabase
    const supabase = createClient();
    if (supabase && isSupabaseConfigured() && user?.id && !session.id.startsWith('sprint-')) {
      try {
        await supabase.from('sprints').update({
          duration_days: clamped,
          start_date: startDate,
          end_date: endDate,
          updated_at: new Date().toISOString(),
        }).eq('id', session.id);
      } catch (e) {
        console.error('Failed to update sprint duration in Supabase:', e);
      }
    }
  }, [session, user?.id]);

  // Update Sprint Goal
  const updateSprintGoal = useCallback(async (goal: string) => {
    setSession((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        sprintGoal: goal,
      },
      updatedAt: new Date().toISOString(),
    }));

    const supabase = createClient();
    if (supabase && isSupabaseConfigured() && user?.id && !session.id.startsWith('sprint-')) {
      try {
        await supabase.from('sprints').update({
          sprint_goal: goal,
          updated_at: new Date().toISOString(),
        }).eq('id', session.id);
      } catch (e) {
        console.error('Failed to update sprint goal in Supabase:', e);
      }
    }
  }, [session.id, user?.id]);

  // Complete Current Sprint & Store in Supabase
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

    // Save to Supabase
    const supabase = createClient();
    if (supabase && isSupabaseConfigured() && user?.id) {
      try {
        await supabase.from('sprints').upsert({
          id: session.id.startsWith('sprint-') ? undefined : session.id,
          user_id: user.id,
          sprint_number: session.sprintNumber,
          duration_days: session.config.durationDays,
          start_date: session.config.startDate,
          end_date: session.config.endDate,
          status: 'completed',
          sprint_goal: session.config.sprintGoal,
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
    loadPastSprints();
  }, [habits, session, user?.id, loadPastSprints]);

  // Start Next Sprint Horizon
  const startNewSprint = useCallback(
    async (customDuration?: number, customGoal?: string) => {
      const nextDuration = customDuration || session.config.durationDays || 7;
      const nextNumber = session.sprintNumber + 1;
      const { startDate, endDate } = generateSprintDateRange(new Date(), nextDuration);

      const nextSession: SprintSession = {
        id: `sprint-${nextNumber}-${Date.now()}`,
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

      // Create new active sprint in Supabase
      const supabase = createClient();
      if (supabase && isSupabaseConfigured() && user?.id) {
        try {
          const { data } = await supabase.from('sprints').insert({
            user_id: user.id,
            sprint_number: nextNumber,
            duration_days: nextDuration,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            sprint_goal: customGoal || `Sprint ${nextNumber} Rhythm & Flow`,
            habit_snapshots: [],
            analytics: null,
          }).select().single();

          if (data) {
            setSession((prev) => ({ ...prev, id: (data as SprintDbRow).id }));
          }
        } catch (e) {
          console.error('Failed to insert new active sprint in Supabase:', e);
        }
      }
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
