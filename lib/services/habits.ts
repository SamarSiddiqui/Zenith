import { createClient } from '../supabase/client';
import { isSupabaseConfigured } from '../supabase/env';
import type { Habit, HabitDbRow, CreateHabitInput, UpdateHabitInput, HabitStatus } from '../../types/zenith';

const LOCAL_STORAGE_HABITS_KEY = 'zenith_local_habits';

/** Helper: Map raw database row to frontend Habit model */
export function mapDbRowToHabit(row: HabitDbRow): Habit {
  return {
    id: row.id,
    name: row.name,
    window: row.window_label,
    minutes: row.duration_minutes,
    health: row.health_score,
    status: row.current_status,
    week: Array.isArray(row.weekly_history) ? row.weekly_history : ['unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged'],
    microVersion: row.micro_version || '5 min micro-step',
    circadianSlot: row.circadian_slot || 'morning',
    category: (row.category as Habit['category']) || 'focus',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Option A: Weighted Recency Momentum Algorithm
 * - Gives higher weight to recent days (today and yesterday have 2x-3x impact)
 * - Adds a Consecutive Streak Velocity Bonus (+3% per consecutive day up to +15%)
 * - Enforces a resilient floor (35% minimum) so a single miss never destroys morale
 * - Defaults to healthy baseline of 80% when no days have been logged
 */
export function calculateHabitHealth(week: HabitStatus[], currentDayIndex?: number): number {
  if (!week || week.length === 0) return 80;

  const validDays = week.filter((s) => s === 'completed' || s === 'missed');
  if (validDays.length === 0) return 80;

  const maxIndex =
    currentDayIndex !== undefined ? Math.min(week.length - 1, currentDayIndex) : week.length - 1;

  let weightedSum = 0;
  let totalWeight = 0;
  let currentStreak = 0;
  let streakCounted = false;

  // Iterate backwards from most recent day to apply recency decay and compute active streak
  for (let i = maxIndex; i >= 0; i--) {
    const status = week[i];
    if (status === 'unlogged' && i === maxIndex && maxIndex > 0) {
      continue;
    }
    if (status !== 'completed' && status !== 'missed') {
      continue;
    }

    const recencyDistance = maxIndex - i;
    const weight = Math.max(1, 4 - recencyDistance * 0.5);

    const scoreValue = status === 'completed' ? 1.0 : 0.0;
    weightedSum += scoreValue * weight;
    totalWeight += weight;

    if (!streakCounted) {
      if (status === 'completed') {
        currentStreak++;
      } else {
        streakCounted = true;
      }
    }
  }

  if (totalWeight === 0) return 80;

  const weightedRatio = weightedSum / totalWeight;
  const streakBonus = Math.min(15, currentStreak * 3);

  const rawMomentum = 40 + weightedRatio * 50 + streakBonus;
  return Math.round(Math.max(35, Math.min(100, rawMomentum)));
}

/**
 * Automatically rolls over past unlogged days (< currentDayIndex) to 'missed' status.
 * This runs when midnight passes, ensuring habits left unlogged on past days become 'missed' (❌).
 */
export function rolloverPastUnloggedDays(
  habit: Habit,
  currentDayIndex: number
): { habit: Habit; changed: boolean } {
  if (currentDayIndex <= 0 || !Array.isArray(habit.week)) {
    return { habit, changed: false };
  }

  let changed = false;
  const newWeek: HabitStatus[] = [...habit.week];

  for (let i = 0; i < currentDayIndex && i < newWeek.length; i++) {
    if (newWeek[i] === 'unlogged') {
      newWeek[i] = 'missed';
      changed = true;
    }
  }

  if (!changed) {
    return { habit, changed: false };
  }

  const newHealth = calculateHabitHealth(newWeek, currentDayIndex);
  const currentTodayStatus = (newWeek[currentDayIndex] || 'unlogged') as HabitStatus;

  const updatedHabit: Habit = {
    ...habit,
    week: newWeek,
    health: newHealth,
    status: currentTodayStatus,
  };

  return { habit: updatedHabit, changed: true };
}

/**
 * Fetch all habits for the authenticated user.
 * Executes indexed query: `WHERE user_id = $1 ORDER BY created_at ASC`
 */
export async function getHabits(userId?: string): Promise<Habit[]> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (supabase && configured && userId) {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        return data.map((row) => mapDbRowToHabit(row as HabitDbRow));
      }
    } catch (err) {
      console.error('Failed to fetch habits from Supabase:', err);
    }
  }

  // Local storage fallback for unconfigured / offline state
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_HABITS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_HABITS_KEY);
      }
    }
  }

  // Return empty list if no habits have been created yet
  return [];
}

/** Create a new habit */
export async function createHabit(userId: string, input: CreateHabitInput): Promise<Habit | null> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const defaultWeek: HabitStatus[] = ['unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged'];

  if (supabase && configured && userId && userId !== 'local-user') {
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: input.name,
          window_label: input.window,
          duration_minutes: input.minutes,
          health_score: 85,
          micro_version: input.microVersion,
          circadian_slot: input.circadianSlot,
          category: input.category || 'focus',
          current_status: 'unlogged',
          weekly_history: defaultWeek,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) return mapDbRowToHabit(data as HabitDbRow);
    } catch (err) {
      console.error('Failed to create habit in Supabase:', err);
    }
  }

  // Local fallback creation
  const localHabit: Habit = {
    id: `local-habit-${Date.now()}`,
    name: input.name,
    window: input.window,
    minutes: input.minutes,
    health: 85,
    status: 'unlogged',
    week: defaultWeek,
    microVersion: input.microVersion,
    circadianSlot: input.circadianSlot,
    category: input.category || 'focus',
    createdAt: new Date().toISOString(),
  };

  // Persist to local storage
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem(LOCAL_STORAGE_HABITS_KEY);
    const list: Habit[] = existing ? JSON.parse(existing) : [];
    list.push(localHabit);
    localStorage.setItem(LOCAL_STORAGE_HABITS_KEY, JSON.stringify(list));
  }

  return localHabit;
}

/** Update an existing habit */
export async function updateHabit(habitId: string, updates: UpdateHabitInput): Promise<boolean> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  // Update in local storage
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem(LOCAL_STORAGE_HABITS_KEY);
    if (existing) {
      try {
        const list: Habit[] = JSON.parse(existing);
        const updated = list.map((h) => (h.id === habitId ? { ...h, ...updates } : h));
        localStorage.setItem(LOCAL_STORAGE_HABITS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error updating habit in localStorage:', e);
      }
    }
  }

  if (supabase && configured) {
    try {
      const dbPayload: Partial<HabitDbRow> = {};
      if (updates.name !== undefined) dbPayload.name = updates.name;
      if (updates.window !== undefined) dbPayload.window_label = updates.window;
      if (updates.minutes !== undefined) dbPayload.duration_minutes = updates.minutes;
      if (updates.health !== undefined) dbPayload.health_score = updates.health;
      if (updates.status !== undefined) dbPayload.current_status = updates.status;
      if (updates.week !== undefined) dbPayload.weekly_history = updates.week;
      if (updates.microVersion !== undefined) dbPayload.micro_version = updates.microVersion;
      if (updates.circadianSlot !== undefined) dbPayload.circadian_slot = updates.circadianSlot;
      if (updates.category !== undefined) dbPayload.category = updates.category;
      dbPayload.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('habits')
        .update(dbPayload)
        .eq('id', habitId);

      if (error) {
        console.error('Supabase habit update error:', error);
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Failed to update habit in Supabase:', err);
      return false;
    }
  }

  return true;
}

/** Delete a habit */
export async function deleteHabit(habitId: string): Promise<boolean> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  // Delete from local storage
  if (typeof window !== 'undefined') {
    const existing = localStorage.getItem(LOCAL_STORAGE_HABITS_KEY);
    if (existing) {
      try {
        const list: Habit[] = JSON.parse(existing);
        const filtered = list.filter((h) => h.id !== habitId);
        localStorage.setItem(LOCAL_STORAGE_HABITS_KEY, JSON.stringify(filtered));
      } catch (e) {
        console.error('Error removing habit from localStorage:', e);
      }
    }
  }

  if (supabase && configured) {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to delete habit in Supabase:', err);
      return false;
    }
  }

  return true;
}
