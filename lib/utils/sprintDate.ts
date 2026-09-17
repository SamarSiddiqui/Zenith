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
 * Helper: Find Monday 00:00:00 of the week containing the given date
 */
export function getMondayOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ...
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Helper: Get ISO Week number of the year (1 - 53)
 */
export function getWeekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Generate ISO start and end date strings.
 * Defaults 7-day sprints to the Monday–Sunday calendar week.
 */
export function generateSprintDateRange(
  baseDate: Date = new Date(),
  durationDays: number = 7
): { startDate: string; endDate: string } {
  const boundedDuration = Math.max(1, Math.min(15, durationDays));
  let start: Date;

  if (boundedDuration === 7) {
    // Option A: Standard Monday–Sunday weekly calendar horizon
    start = getMondayOfWeek(baseDate);
  } else {
    start = new Date(baseDate);
    start.setHours(0, 0, 0, 0);
  }

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
 * Get readable sprint date range string e.g. "Week 38 · Sep 14 – Sep 20 (7 Days)"
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
  const weekNum = getWeekNumber(startDate);

  if (boundedDuration === 7) {
    return `Week ${weekNum} · ${startFormatted} – ${endFormatted}`;
  }

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
  // Sprint is strictly completed only after the final day has elapsed past midnight
  const isCompleted = diffDays >= boundedDuration;

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
