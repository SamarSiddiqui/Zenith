import type { HabitStatus, CircadianSlot } from './zenith';

export type SprintStatus = 'active' | 'completed' | 'archived';

export interface SprintConfig {
  durationDays: number; // 1 to 15 days (default 7)
  startDate: string;    // ISO Date string
  endDate: string;      // ISO Date string
  sprintGoal?: string;  // e.g. "Anchor morning deep work block"
}

export interface SprintHabitSnapshot {
  habitId: string;
  habitName: string;
  circadianSlot: CircadianSlot;
  dailyStatuses: HabitStatus[]; // Length equals durationDays
  showUpRate: number;           // 0 to 100%
  completedDays: number;
  missedDays: number;
  microStepCount: number;
}

export interface SprintRecommendation {
  id: string;
  habitId?: string;
  type: 'time_shift' | 'duration_adjustment' | 'micro_step_focus' | 'celebration';
  title: string;
  description: string;
  suggestedAction: string;
}

export interface SprintAnalytics {
  sprintNumber: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  totalTargetEvents: number;
  totalCompletedEvents: number;
  overallShowUpRate: number; // 0 to 100%
  anchorHabits: {
    id: string;
    name: string;
    showUpRate: number;
    circadianSlot: CircadianSlot;
  }[];
  slippedHabits: {
    id: string;
    name: string;
    showUpRate: number;
    circadianSlot: CircadianSlot;
    frictionSummary: string;
  }[];
  recommendations: SprintRecommendation[];
}

export interface SprintSession {
  id: string;
  userId: string;
  sprintNumber: number;
  config: SprintConfig;
  status: SprintStatus;
  currentDayIndex: number; // 0 to (durationDays - 1)
  isCompleted: boolean;
  snapshots: SprintHabitSnapshot[];
  analytics?: SprintAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface PastSprintSummary {
  id: string;
  sprintNumber: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  overallShowUpRate: number;
  anchorHabitName?: string;
  slippedHabitName?: string;
  completedHabitsCount: number;
  totalHabitsCount: number;
  createdAt: string;
}

/** High-efficiency mapping interface for Supabase `public.sprints` database row */
export interface SprintDbRow {
  id: string;
  user_id: string;
  sprint_number: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  habit_snapshots: SprintHabitSnapshot[];
  analytics: SprintAnalytics | null;
  created_at: string;
  updated_at: string;
}
