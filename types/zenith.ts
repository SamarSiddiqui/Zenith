export type HabitStatus = 'completed' | 'missed' | 'unlogged';

export type CircadianSlot = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Habit {
  id: string;
  name: string;
  window: string; // e.g. "08:00 - 09:30"
  minutes: number;
  health: number; // 0 - 100
  status: HabitStatus;
  week: HabitStatus[]; // 7 days history
  microVersion: string; // 5-minute fallback version for crunch days
  circadianSlot: CircadianSlot;
  category?: 'focus' | 'mindfulness' | 'physical' | 'craft' | 'rest';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHabitInput {
  name: string;
  window: string;
  minutes: number;
  circadianSlot: CircadianSlot;
  microVersion: string;
  category?: 'focus' | 'mindfulness' | 'physical' | 'craft' | 'rest';
}

export interface UpdateHabitInput {
  name?: string;
  window?: string;
  minutes?: number;
  health?: number;
  status?: HabitStatus;
  week?: HabitStatus[];
  microVersion?: string;
  circadianSlot?: CircadianSlot;
  category?: 'focus' | 'mindfulness' | 'physical' | 'craft' | 'rest';
}

/** High-efficiency mapping interface for Supabase database row */
export interface HabitDbRow {
  id: string;
  user_id: string;
  name: string;
  window_label: string;
  duration_minutes: number;
  health_score: number;
  micro_version: string | null;
  circadian_slot: CircadianSlot;
  current_status: HabitStatus;
  weekly_history: HabitStatus[];
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkipReason {
  id: string;
  label: string;
  response: string;
  actionType: 'micro_step' | 'reschedule' | 'preserve_window';
}

export interface RecoveryStep {
  id: string;
  day: string;
  when: string;
  duration: string;
  task: string;
  state: 'active' | 'next' | 'later';
}

export interface WorkingWindowConfig {
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "07:00 PM"
  hoursRemaining: number;
}
