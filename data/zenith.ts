import type { Habit, RecoveryStep, SkipReason } from '../types/zenith';

export const habits: Habit[] = [
  {
    id: 'reading',
    name: 'Reading',
    window: '8:30 PM – 9:00 PM',
    minutes: 15,
    health: 61,
    status: 'unlogged',
    week: ['completed', 'completed', 'missed', 'completed', 'missed', 'unlogged', 'unlogged'],
    microVersion: 'Read 2 pages'
  },
  {
    id: 'meditation',
    name: 'Meditation',
    window: '7:15 PM – 7:25 PM',
    minutes: 10,
    health: 88,
    status: 'unlogged',
    week: ['completed', 'completed', 'completed', 'completed', 'completed', 'unlogged', 'unlogged'],
    microVersion: '2 min breathing'
  },
  {
    id: 'journaling',
    name: 'Journaling',
    window: '9:30 PM – 9:35 PM',
    minutes: 5,
    health: 79,
    status: 'unlogged',
    week: ['completed', 'missed', 'completed', 'completed', 'completed', 'unlogged', 'unlogged'],
    microVersion: 'One sentence'
  },
  {
    id: 'workout',
    name: 'Workout',
    window: '6:30 AM – 7:15 AM',
    minutes: 45,
    health: 92,
    status: 'completed',
    week: ['completed', 'completed', 'completed', 'missed', 'completed', 'unlogged', 'unlogged'],
    microVersion: '15 min mobility'
  },
  {
    id: 'deep-work',
    name: 'Deep Work Block',
    window: '9:30 AM – 11:00 AM',
    minutes: 90,
    health: 95,
    status: 'completed',
    week: ['completed', 'completed', 'completed', 'completed', 'completed', 'unlogged', 'unlogged'],
    microVersion: '25 min sprint'
  },
  {
    id: 'walk',
    name: 'Afternoon Walk',
    window: '1:00 PM – 1:20 PM',
    minutes: 20,
    health: 84,
    status: 'completed',
    week: ['missed', 'completed', 'completed', 'completed', 'completed', 'unlogged', 'unlogged'],
    microVersion: 'Walk around the block'
  }
];

export const skipReasons: SkipReason[] = [
  {
    id: 'tired',
    label: 'Too tired',
    response:
      "Noted. Tiredness shows up on 4 of your last 6 skips after 9 PM — we'll pull Reading forward to 8:00 PM."
  },
  {
    id: 'no-time',
    label: 'No time',
    response:
      "That's your 3rd no-time skip this month. Zenith will offer the 5-minute version automatically at 8:30 PM."
  },
  {
    id: 'work-overlap',
    label: 'Work overlap',
    response:
      "Got it. That's your 3rd work-overlap skip this month. We'll adjust your evening reminder to follow your last meeting."
  },
  {
    id: 'brain-fog',
    label: 'Brain fog',
    response:
      "Understood. Zenith will swap the target to audio reading on days flagged low-focus."
  },
  {
    id: 'too-hard',
    label: 'Habit too hard',
    response:
      "15 minutes may be above your current baseline. Recovery Mode can step you back up from 5 minutes."
  }
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
