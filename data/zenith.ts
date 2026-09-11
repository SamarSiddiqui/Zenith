import type { Habit, RecoveryStep, SkipReason } from '../types/zenith';

export const habits: Habit[] = [
  {
    id: 'workout',
    name: 'Morning Workout & Mobility',
    window: '06:30 AM – 07:15 AM',
    minutes: 45,
    health: 92,
    status: 'completed',
    week: ['completed', 'completed', 'completed', 'missed', 'completed', 'unlogged', 'unlogged'],
    microVersion: '15 min mobility stretches',
    circadianSlot: 'morning',
    category: 'physical',
  },
  {
    id: 'deep-work',
    name: 'Deep Work Sprint',
    window: '09:30 AM – 11:00 AM',
    minutes: 90,
    health: 95,
    status: 'completed',
    week: ['completed', 'completed', 'completed', 'completed', 'completed', 'unlogged', 'unlogged'],
    microVersion: '25 min focus block',
    circadianSlot: 'morning',
    category: 'focus',
  },
  {
    id: 'walk',
    name: 'Afternoon Sunlight Walk',
    window: '01:00 PM – 01:20 PM',
    minutes: 20,
    health: 84,
    status: 'completed',
    week: ['missed', 'completed', 'completed', 'completed', 'completed', 'unlogged', 'unlogged'],
    microVersion: '5 min outdoor breath',
    circadianSlot: 'afternoon',
    category: 'mindfulness',
  },
  {
    id: 'meditation',
    name: 'Twilight Meditation',
    window: '05:30 PM – 05:45 PM',
    minutes: 15,
    health: 88,
    status: 'unlogged',
    week: ['completed', 'completed', 'completed', 'completed', 'completed', 'unlogged', 'unlogged'],
    microVersion: '3 min calming breaths',
    circadianSlot: 'afternoon',
    category: 'mindfulness',
  },
  {
    id: 'reading',
    name: 'Knowledge Immersion',
    window: '08:30 PM – 09:00 PM',
    minutes: 30,
    health: 74,
    status: 'unlogged',
    week: ['completed', 'completed', 'missed', 'completed', 'missed', 'unlogged', 'unlogged'],
    microVersion: 'Read 2 pages',
    circadianSlot: 'evening',
    category: 'craft',
  },
  {
    id: 'journaling',
    name: 'Evening Reflection & Review',
    window: '09:30 PM – 09:40 PM',
    minutes: 10,
    health: 79,
    status: 'unlogged',
    week: ['completed', 'missed', 'completed', 'completed', 'completed', 'unlogged', 'unlogged'],
    microVersion: '1 honest sentence',
    circadianSlot: 'evening',
    category: 'rest',
  },
];

export const skipReasons: SkipReason[] = [
  {
    id: 'tired',
    label: 'Schedule fatigue / Low energy',
    response: "Tiredness detected after evening close. We recommend converting this to your 5-min micro-version with zero health penalty.",
    actionType: 'micro_step',
  },
  {
    id: 'no-time',
    label: 'Unexpected schedule crunch',
    response: "Working window was compressed today. Automatically queuing micro-version into tomorrow's buffer window.",
    actionType: 'reschedule',
  },
  {
    id: 'work-overlap',
    label: 'Meeting / Focus overlap',
    response: "Priority conflict detected. Zenith will preserve your cumulative health score and adjust tomorrow's schedule reminder.",
    actionType: 'preserve_window',
  },
  {
    id: 'brain-fog',
    label: 'Cognitive overload / Brain fog',
    response: "Swapping today's target to passive audio intake or 3-minute breathwork.",
    actionType: 'micro_step',
  },
];

export const recoverySteps: RecoveryStep[] = [
  {
    id: 'day-1',
    day: 'Day 1',
    when: 'Today',
    duration: '5-minute micro version',
    task: 'Read 2 pages',
    state: 'active'
  },
  {
    id: 'day-2',
    day: 'Day 2',
    when: 'Tomorrow',
    duration: '10-minute version',
    task: 'Read 5 pages',
    state: 'next'
  },
  {
    id: 'day-3',
    day: 'Day 3',
    when: 'Friday',
    duration: 'Full routine',
    task: 'Read 15 minutes',
    state: 'later'
  }
];

export const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const weekDates = [12, 13, 14, 15, 16, 17, 18];
