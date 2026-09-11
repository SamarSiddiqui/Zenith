import { createClient } from '../supabase/client';
import { isSupabaseConfigured } from '../supabase/env';
import type { Habit, HabitDbRow, CreateHabitInput, UpdateHabitInput, HabitStatus } from '../../types/zenith';
import { habits as seedHabits } from '../../data/zenith';

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

/** Helper: Calculate dynamic habit health score based on weekly history */
export function calculateHabitHealth(week: HabitStatus[]): number {
  if (!week || week.length === 0) return 80;
  
  let completedCount = 0;
  let loggedCount = 0;
  
  week.forEach((status) => {
    if (status === 'completed') {
      completedCount++;
      loggedCount++;
    } else if (status === 'missed') {
      loggedCount++;
    }
  });

  if (loggedCount === 0) return 80;
  
  // Base percentage with gentle floor to prevent morale crashes (Zenith philosophy)
  const ratio = completedCount / loggedCount;
  return Math.round(Math.max(45, Math.min(100, 50 + ratio * 50)));
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

      if (data && data.length > 0) {
        return data.map((row) => mapDbRowToHabit(row as HabitDbRow));
      }

      // If user has no habits yet, initialize with seeds
      const initialHabits = await initializeSeedHabits(userId);
      return initialHabits;
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

  return seedHabits;
}

/** Initialize starter habits in Supabase for a new user */
export async function initializeSeedHabits(userId: string): Promise<Habit[]> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (!supabase || !configured) return seedHabits;

  try {
    const rowsToInsert = seedHabits.map((h) => ({
      user_id: userId,
      name: h.name,
      window_label: h.window,
      duration_minutes: h.minutes,
      health_score: h.health,
      micro_version: h.microVersion,
      circadian_slot: h.circadianSlot,
      category: h.category || 'focus',
      current_status: h.status,
      weekly_history: h.week,
    }));

    const { data, error } = await supabase
      .from('habits')
      .insert(rowsToInsert)
      .select();

    if (error) throw error;
    if (data) return data.map((row) => mapDbRowToHabit(row as HabitDbRow));
  } catch (err) {
    console.error('Failed to seed habits:', err);
  }

  return seedHabits;
}

/** Create a new habit */
export async function createHabit(userId: string, input: CreateHabitInput): Promise<Habit | null> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const defaultWeek: HabitStatus[] = ['unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged'];

  if (supabase && configured) {
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

  return localHabit;
}

/** Update an existing habit */
export async function updateHabit(habitId: string, updates: UpdateHabitInput): Promise<boolean> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

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

      const { error } = await supabase
        .from('habits')
        .update(dbPayload)
        .eq('id', habitId);

      if (error) throw error;
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
