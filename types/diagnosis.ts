import type { Habit, CircadianSlot } from './zenith';
export type { CircadianSlot };

export type CollisionType =
  | 'late_workday_overrun'
  | 'duration_fatigue'
  | 'energy_misalignment'
  | 'weekend_drift'
  | 'unanchored_trigger';

export type FrictionSeverity = 'low' | 'moderate' | 'high';

export interface ZenithScore {
  overall: number; // 0–100
  circadianFidelity: number; // % executed in biological rhythm
  recoveryResilience: number; // % 48-hour recovery success
  balanceScore: number; // Planned habit load vs usable window
  levelLabel: string; // e.g. "Peak Flow", "Sustained Ascendance", "Compressed Horizon"
}

export interface ExecutiveSynthesis {
  headline: string;
  briefing: string;
  primaryGrowthOpportunity: string;
  strengths: string[];
}

export interface ScheduleCollision {
  habitId: string;
  habitName: string;
  collisionType: CollisionType;
  title: string;
  description: string;
  evidence: string;
  confidencePercent: number;
  suggestedAction: {
    actionType: 'reschedule_slot' | 'shrink_duration' | 'split_routine';
    newSlot?: CircadianSlot;
    newMinutes?: number;
    label: string;
  };
}

export interface TieredHabitVersion {
  durationMins: number;
  label: string;
  description: string;
}

export interface HabitOptimization {
  habitId: string;
  habitName: string;
  currentSlot: string;
  recommendedSlot: CircadianSlot;
  isSlotOptimal: boolean;
  reasoning: string;
  tieredVersions: {
    gold: TieredHabitVersion; // Full routine
    silver: TieredHabitVersion; // Standard routine
    bronzeMicro: TieredHabitVersion; // Emergency 2-5m fallback
  };
  identityMotiveUpgrade: string;
}

export interface RecoveryDayStep {
  dayNumber: number;
  stepName: string;
  tier: 'micro' | 'half' | 'full';
  targetMinutes: number;
  actionPrompt: string;
  mindsetGrounding: string;
}

export interface RecoveryProtocol {
  habitId: string;
  habitName: string;
  consecutiveMisses: number;
  triggerReason: string;
  steps: RecoveryDayStep[];
}

export interface DiagnosisResult {
  zenithScore: ZenithScore;
  executiveSynthesis: ExecutiveSynthesis;
  frictionAutopsy: {
    scheduleCollisions: ScheduleCollision[];
    circadianZoneFriction: {
      morning: FrictionSeverity;
      afternoon: FrictionSeverity;
      evening: FrictionSeverity;
    };
    overallFrictionVerdict: string;
  };
  habitOptimizations: HabitOptimization[];
  recoveryProtocols: RecoveryProtocol[];
  generatedAt: string;
  modelUsed: string;
}

export interface DiagnosisRequest {
  habits: Habit[];
  workingWindow?: {
    startTime?: string;
    endTime?: string;
    timezone?: string;
    activeDays?: number[];
  };
  userName?: string;
  sprintGoal?: string;
  sprintDuration?: number;
  currentDayIndex?: number;
}
