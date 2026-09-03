export type HabitStatus = 'completed' | 'missed' | 'unlogged';

export interface Habit {
  id: string;
  name: string;
  window: string;
  minutes: number;
  health: number;
  status: HabitStatus;
  week: HabitStatus[];
  microVersion: string;
}

export interface SkipReason {
  id: string;
  label: string;
  response: string;
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
