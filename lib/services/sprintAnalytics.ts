import type { Habit } from '../../types/zenith';
import type {
  SprintConfig,
  SprintAnalytics,
  SprintHabitSnapshot,
  SprintRecommendation,
  SprintSession,
  PastSprintSummary,
  SprintDbRow,
} from '../../types/sprint';
import { createClient } from '../supabase/client';
import { isSupabaseConfigured } from '../supabase/env';

/**
 * Generate immutable habit snapshots for the sprint duration.
 */
export function createSprintHabitSnapshots(
  habits: Habit[],
  durationDays: number
): SprintHabitSnapshot[] {
  return habits.map((habit) => {
    // Slice or pad habit week array to match durationDays
    const statuses = Array.from({ length: durationDays }).map(
      (_, i) => habit.week[i] || 'unlogged'
    );

    const completedCount = statuses.filter((s) => s === 'completed').length;
    const missedCount = statuses.filter((s) => s === 'missed').length;
    const rate = durationDays > 0 ? Math.round((completedCount / durationDays) * 100) : 0;

    return {
      habitId: habit.id,
      habitName: habit.name,
      circadianSlot: habit.circadianSlot,
      dailyStatuses: statuses,
      showUpRate: rate,
      completedDays: completedCount,
      missedDays: missedCount,
      microStepCount: 0,
    };
  });
}

/**
 * Calculate comprehensive retrospective metrics and prescriptive next-sprint recommendations.
 */
export function calculateSprintAnalytics(
  habits: Habit[],
  config: SprintConfig,
  sprintNumber: number = 1
): SprintAnalytics {
  const snapshots = createSprintHabitSnapshots(habits, config.durationDays);
  const totalTargetEvents = habits.length * config.durationDays;
  let totalCompletedEvents = 0;

  snapshots.forEach((snap) => {
    totalCompletedEvents += snap.completedDays;
  });

  const overallShowUpRate =
    totalTargetEvents > 0 ? Math.round((totalCompletedEvents / totalTargetEvents) * 100) : 0;

  // Classify Anchors vs Slipped
  const anchorHabits = snapshots
    .filter((snap) => snap.showUpRate >= 75)
    .sort((a, b) => b.showUpRate - a.showUpRate)
    .map((s) => ({
      id: s.habitId,
      name: s.habitName,
      showUpRate: s.showUpRate,
      circadianSlot: s.circadianSlot,
    }));

  const slippedHabits = snapshots
    .filter((snap) => snap.showUpRate < 75)
    .sort((a, b) => a.showUpRate - b.showUpRate)
    .map((s) => {
      let friction = 'Schedule compression detected';
      if (s.circadianSlot === 'evening') friction = 'Late-window fatigue after 8 PM';
      if (s.circadianSlot === 'morning') friction = 'Morning startup friction';
      if (s.circadianSlot === 'afternoon') friction = 'Meeting / midday overlap';

      return {
        id: s.habitId,
        name: s.habitName,
        showUpRate: s.showUpRate,
        circadianSlot: s.circadianSlot,
        frictionSummary: friction,
      };
    });

  // Generate Actionable Next-Sprint Recommendations
  const recommendations: SprintRecommendation[] = [];

  if (overallShowUpRate >= 80) {
    recommendations.push({
      id: 'rec-high-momentum',
      type: 'celebration',
      title: 'Resilient Identity Momentum',
      description: `You maintained a ${overallShowUpRate}% show-up rate across ${config.durationDays} days. Your circadian baseline is solidly established.`,
      suggestedAction: 'Keep your current sprint duration and consider anchoring one secondary craft ritual.',
    });
  }

  slippedHabits.forEach((slipped) => {
    if (slipped.circadianSlot === 'evening') {
      recommendations.push({
        id: `rec-shift-${slipped.id}`,
        habitId: slipped.id,
        type: 'time_shift',
        title: `Pull ${slipped.name} earlier`,
        description: `This ritual slipped ${100 - slipped.showUpRate}% of the time during evening wind-down.`,
        suggestedAction: 'Shift target window 45 minutes earlier into your afternoon buffer before fatigue sets in.',
      });
    } else {
      recommendations.push({
        id: `rec-micro-${slipped.id}`,
        habitId: slipped.id,
        type: 'micro_step_focus',
        title: `Lower friction on ${slipped.name}`,
        description: `Target duration may be exceeding baseline energy during busy weekdays.`,
        suggestedAction: 'Commit to the 5-minute micro-fallback version on crunch days to keep momentum effortless.',
      });
    }
  });

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-baseline',
      type: 'celebration',
      title: 'Consistent Daily Rhythm',
      description: 'Your habits were performed steadily across the sprint window.',
      suggestedAction: 'Ready to begin your next circadian sprint with confidence.',
    });
  }

  return {
    sprintNumber,
    durationDays: config.durationDays,
    startDate: config.startDate,
    endDate: config.endDate,
    totalTargetEvents,
    totalCompletedEvents,
    overallShowUpRate,
    anchorHabits,
    slippedHabits,
    recommendations,
  };
}

/**
 * Fetch past completed sprint summaries for the user.
 */
export async function getPastSprints(userId?: string): Promise<PastSprintSummary[]> {
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  if (supabase && configured && userId) {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('sprint_number', { ascending: false });

      if (error) throw error;

      if (data) {
        return data.map((row: SprintDbRow) => {
          const analytics = row.analytics;
          const snapshots = row.habit_snapshots || [];
          return {
            id: row.id,
            sprintNumber: row.sprint_number,
            durationDays: row.duration_days,
            startDate: row.start_date,
            endDate: row.end_date,
            overallShowUpRate: analytics?.overallShowUpRate || 80,
            anchorHabitName: analytics?.anchorHabits?.[0]?.name,
            slippedHabitName: analytics?.slippedHabits?.[0]?.name,
            completedHabitsCount: analytics?.anchorHabits?.length || 0,
            totalHabitsCount: snapshots.length || 0,
            createdAt: row.created_at,
          };
        });
      }
    } catch (err) {
      console.error('Failed to fetch past sprints:', err);
    }
  }

  // Local fallback: return empty list when no past completed sprints exist
  return [];
}
