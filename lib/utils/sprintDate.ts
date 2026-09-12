export interface SprintDayInfo {
  index: number;
  date: Date;
  dateNumber: number;
  dayName: string;
  fullDateLabel: string;
  isoDate: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface SprintDayProgressInfo {
  dayIndex: number;      // 0-indexed
  dayNumber: number;     // 1-indexed (e.g. Day 3 of 7)
  daysRemaining: number;
  progressPercentage: number;
  isCompleted: boolean;
}

/** Format helper: "Sep 12, 2026" */
export function formatReadableDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Format helper: "Saturday, September 12" */
export function formatFullTodayDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate ISO start and end date strings for a given duration (1 to 15 days).
 */
export function generateSprintDateRange(
  baseDate: Date = new Date(),
  durationDays: number = 7
): { startDate: string; endDate: string } {
  const boundedDuration = Math.max(1, Math.min(15, durationDays));
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + (boundedDuration - 1));
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

/**
 * Generate an array of dynamic day metadata for any custom sprint length (1 to 15 days).
 */
export function generateSprintDays(
  startDateStr: string,
  durationDays: number = 7
): SprintDayInfo[] {
  const boundedDuration = Math.max(1, Math.min(15, durationDays));
  const startDate = new Date(startDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: SprintDayInfo[] = [];

  for (let i = 0; i < boundedDuration; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);
    dayDate.setHours(0, 0, 0, 0);

    const isToday = dayDate.getTime() === today.getTime();
    const isPast = dayDate.getTime() < today.getTime();
    const isFuture = dayDate.getTime() > today.getTime();

    days.push({
      index: i,
      date: dayDate,
      dateNumber: dayDate.getDate(),
      dayName: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDateLabel: dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isoDate: dayDate.toISOString().split('T')[0],
      isToday,
      isPast,
      isFuture,
    });
  }

  return days;
}

/**
 * Get readable sprint date range string e.g. "Sep 12 – Sep 21 (10 Days)"
 */
export function getSprintDateRangeLabel(
  startDateStr: string,
  durationDays: number = 7
): string {
  const boundedDuration = Math.max(1, Math.min(15, durationDays));
  const startDate = new Date(startDateStr);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (boundedDuration - 1));

  const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${startFormatted} – ${endFormatted} (${boundedDuration} Days)`;
}

/**
 * Calculate detailed sprint progress info based on local time.
 */
export function calculateSprintDayInfo(
  startDateStr: string,
  durationDays: number = 7
): SprintDayProgressInfo {
  const boundedDuration = Math.max(1, Math.min(15, durationDays));
  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const dayIndex = Math.max(0, Math.min(boundedDuration - 1, diffDays));
  const dayNumber = dayIndex + 1;
  const daysRemaining = Math.max(0, boundedDuration - dayNumber);
  const progressPercentage = Math.round((dayNumber / boundedDuration) * 100);
  const isCompleted = diffDays >= boundedDuration - 1;

  return {
    dayIndex,
    dayNumber,
    daysRemaining,
    progressPercentage,
    isCompleted,
  };
}

/**
 * Determine the current day index (0 to durationDays - 1) based on real-world local time.
 */
export function getCurrentSprintDayIndex(
  startDateStr: string,
  durationDays: number = 7
): number {
  return calculateSprintDayInfo(startDateStr, durationDays).dayIndex;
}

/**
 * Check if the sprint has completed its full timeline.
 */
export function checkIsSprintCompleted(
  startDateStr: string,
  durationDays: number = 7
): boolean {
  return calculateSprintDayInfo(startDateStr, durationDays).isCompleted;
}
