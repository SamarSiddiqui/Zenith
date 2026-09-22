"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Habit } from '../types/zenith';
import type {
  SprintConfig,
  SprintDraft,
  SprintSession,
  PastSprintSummary,
  SprintDbRow,
} from '../types/sprint';
import {
  generateSprintDateRange,
  calculateSprintDayInfo,
  checkIsSprintCompleted,
  getMondayOfWeek,
} from '../lib/utils/sprintDate';
import {
  calculateSprintAnalytics,
  createSprintHabitSnapshots,
  getPastSprints,
} from '../lib/services/sprintAnalytics';
import { mapDbRowToHabit } from '../lib/services/habits';
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

export function useSprint(habits: Habit[], onSprintRollover?: () => void) {
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

  // Fetch active sprint directly from Supabase with automated week rollover
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

      const currentMonday = getMondayOfWeek(new Date());

      if (data) {
        const row = data as SprintDbRow;
        const rowStartDate = new Date(row.start_date);
        const isCompleted = checkIsSprintCompleted(row.start_date, row.duration_days);
        const isPastWeek = row.duration_days === 7 && rowStartDate.getTime() < currentMonday.getTime();

        // If the active sprint has elapsed past its end date or belongs to a previous week:
        // Automatically archive it and seamlessly rollover to the current live week sprint!
        if (isCompleted || isPastWeek) {
          // 1. Snapshot habit data for retrospective archive
          let habitsToSnapshot = habits;
          if (!habitsToSnapshot || habitsToSnapshot.length === 0) {
            const { data: dbHabits } = await supabase
              .from('habits')
              .select('*')
              .eq('user_id', user.id);
            if (dbHabits) {
              habitsToSnapshot = dbHabits.map((h) => mapDbRowToHabit(h));
            }
          }

          const snapshots = createSprintHabitSnapshots(habitsToSnapshot, row.duration_days);
          const analytics = calculateSprintAnalytics(
            habitsToSnapshot,
            {
              durationDays: row.duration_days,
              startDate: row.start_date,
              endDate: row.end_date,
              sprintGoal: row.sprint_goal,
            },
            row.sprint_number
          );

          // 2. Archive past sprint to 'completed' in Supabase
          await supabase.from('sprints').update({
            status: 'completed',
            habit_snapshots: snapshots,
            analytics: analytics,
            updated_at: new Date().toISOString(),
          }).eq('id', row.id);

          // 3. Generate current week date range and insert new active sprint
          const newDuration = 7;
          const { startDate: newStart, endDate: newEnd } = generateSprintDateRange(new Date(), newDuration);
          const newSprintNumber = (row.sprint_number || 0) + 1;
          const newGoal = 'Ground daily rituals and sustain steady momentum';

          const { data: newRow } = await supabase
            .from('sprints')
            .insert({
              user_id: user.id,
              sprint_number: newSprintNumber,
              duration_days: newDuration,
              start_date: newStart,
              end_date: newEnd,
              status: 'active',
              sprint_goal: newGoal,
              habit_snapshots: [],
              analytics: null,
            })
            .select()
            .single();

          // 4. Reset habit weekly checkmark slots for the new active week
          await supabase
            .from('habits')
            .update({
              weekly_history: ['unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged'],
              current_status: 'unlogged',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

          const newDayInfo = calculateSprintDayInfo(newStart, newDuration);
          const newSession: SprintSession = {
            id: (newRow as SprintDbRow)?.id || `sprint-${newSprintNumber}`,
            userId: user.id,
            sprintNumber: newSprintNumber,
            config: {
              durationDays: newDuration,
              startDate: newStart,
              endDate: newEnd,
              sprintGoal: newGoal,
            },
            status: 'active',
            currentDayIndex: newDayInfo.dayIndex,
            isCompleted: false,
            snapshots: [],
            createdAt: newStart,
            updatedAt: newStart,
          };

          setSession(newSession);
          if (onSprintRollover) onSprintRollover();
          loadPastSprints();
          return;
        }

        // Active sprint is still within the current calendar week
        const dayInfo = calculateSprintDayInfo(row.start_date, row.duration_days);

        const loadedSession: SprintSession = {
          id: row.id,
          userId: row.user_id,
          sprintNumber: row.sprint_number,
          config: {
            durationDays: row.duration_days,
            startDate: row.start_date,
            endDate: row.end_date,
            sprintGoal: row.sprint_goal || 'Ground daily rituals and sustain steady momentum',
          },
          status: 'active',
          currentDayIndex: dayInfo.dayIndex,
          isCompleted: false,
          snapshots: row.habit_snapshots || [],
          analytics: row.analytics || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };

        setSession(loadedSession);
      } else {
        // No active sprint found in database: automatically bootstrap current week sprint
        const { count } = await supabase
          .from('sprints')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const sprintNumber = (count || 0) + 1;
        const { startDate, endDate } = generateSprintDateRange(new Date(), 7);
        const dayInfo = calculateSprintDayInfo(startDate, 7);

        const { data: createdRow } = await supabase
          .from('sprints')
          .insert({
            user_id: user.id,
            sprint_number: sprintNumber,
            duration_days: 7,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            sprint_goal: 'Ground daily rituals and sustain steady momentum',
            habit_snapshots: [],
            analytics: null,
          })
          .select()
          .single();

        const bootstrappedSession: SprintSession = {
          id: (createdRow as SprintDbRow)?.id || `sprint-${sprintNumber}`,
          userId: user.id,
          sprintNumber: sprintNumber,
          config: {
            durationDays: 7,
            startDate,
            endDate,
            sprintGoal: 'Ground daily rituals and sustain steady momentum',
          },
          status: 'active',
          currentDayIndex: dayInfo.dayIndex,
          isCompleted: false,
          snapshots: [],
          createdAt: startDate,
          updatedAt: startDate,
        };

        setSession(bootstrappedSession);
      }
    } catch (err) {
      console.error('Failed to load active sprint:', err);
    }
  }, [user?.id, habits, onSprintRollover, loadPastSprints]);

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

  // Save Draft for Upcoming Sprint Horizon (during 24h runway)
  const saveSprintDraft = useCallback(
    async (draft: SprintDraft) => {
      setSession((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          nextWeekDraft: draft,
        },
        updatedAt: new Date().toISOString(),
      }));

      // Sync to Supabase
      const supabase = createClient();
      if (supabase && isSupabaseConfigured() && user?.id && !session.id.startsWith('sprint-')) {
        try {
          await supabase
            .from('sprints')
            .update({
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.id);
        } catch (e) {
          console.error('Failed to save sprint draft in Supabase:', e);
        }
      }
    },
    [session.id, user?.id]
  );

  // Start Next Sprint Horizon
  const startNewSprint = useCallback(
    async (customDuration?: number, customGoal?: string) => {
      const nextDuration = customDuration || session.config.durationDays || 7;
      const nextNumber = session.sprintNumber + 1;
      const { startDate, endDate } = generateSprintDateRange(new Date(), nextDuration);
      const effectiveGoal =
        customGoal ||
        session.config.nextWeekDraft?.sprintGoal ||
        `Sprint ${nextNumber} Rhythm & Flow`;

      const nextSession: SprintSession = {
        id: `sprint-${nextNumber}-${Date.now()}`,
        userId: user?.id || 'local-user',
        sprintNumber: nextNumber,
        config: {
          durationDays: nextDuration,
          startDate,
          endDate,
          sprintGoal: effectiveGoal,
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
            sprint_goal: effectiveGoal,
            habit_snapshots: [],
            analytics: null,
          }).select().single();

          if (data) {
            setSession((prev) => ({ ...prev, id: (data as SprintDbRow).id }));
          }

          // Reset habit weekly checkmark slots for the new active sprint
          await supabase
            .from('habits')
            .update({
              weekly_history: ['unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged'],
              current_status: 'unlogged',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

          if (onSprintRollover) onSprintRollover();
          loadPastSprints();
        } catch (e) {
          console.error('Failed to insert new active sprint in Supabase:', e);
        }
      }
    },
    [session.config.durationDays, session.config.nextWeekDraft, session.sprintNumber, user?.id, onSprintRollover, loadPastSprints]
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
    saveSprintDraft,
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
