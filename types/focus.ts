export type PhilosopherId = 'marcus' | 'newport' | 'cirillo' | 'ultradian' | 'custom';

export type FocusSessionState = 'idle' | 'focusing' | 'paused' | 'break' | 'completed';

export type SoundscapeId = 'none' | 'rain' | 'forest' | 'brown_noise' | 'alpha_waves';

export type TreeSpecies = 'oak' | 'pine' | 'bonsai' | 'sakura' | 'willow';

export type GrowthStage = 'seed' | 'sprout' | 'sapling' | 'blooming' | 'mature' | 'withered';

export interface PlantedTree {
  id: string;
  species: TreeSpecies;
  minutes: number;
  archetype: PhilosopherId;
  completedAt: string;
  habitId?: string;
  habitName?: string;
  intention?: string;
  stage: 'mature' | 'withered';
}

export interface DailyGrove {
  date: string; // ISO YYYY-MM-DD
  totalMinutes: number;
  trees: PlantedTree[];
}

export interface PhilosopherConfig {
  id: PhilosopherId;
  name: string;
  title: string;
  tagline: string;
  focusMinutes: number;
  breakMinutes: number;
  defaultSpecies: TreeSpecies;
  accentColor: string;
  themeGradient: string;
  borderGlow: string;
  primaryQuote: string;
  quotes: string[];
  principles: string[];
}

export interface FocusSessionSettings {
  archetype: PhilosopherId;
  focusDuration: number; // in minutes
  breakDuration: number; // in minutes
  soundscape: SoundscapeId;
  soundVolume: number;   // 0.0 to 1.0
  species: TreeSpecies;
  linkedHabitId?: string;
  linkedHabitName?: string;
  intention: string;
  strictMode: boolean;   // if true, warns before leaving
}

export const PHILOSOPHER_CONFIGS: Record<PhilosopherId, PhilosopherConfig> = {
  cirillo: {
    id: 'cirillo',
    name: 'Pomodoro',
    title: '25-Min Sprints',
    tagline: 'Quick 25-minute sprints with 5-minute restorative breaks',
    focusMinutes: 25,
    breakMinutes: 5,
    defaultSpecies: 'sakura',
    accentColor: '#ef4444',
    themeGradient: 'from-rose-500/10 via-red-950/20 to-stone-900/40',
    borderGlow: 'border-rose-500/30 group-hover:border-rose-500/60',
    primaryQuote: 'One task, one interval. Eliminate the pressure of time by taking it one session at a time.',
    quotes: [
      'One task, one interval. Eliminate the pressure of time by taking it one session at a time.',
      'The next session will go even better.',
      'Protect your focus interval with gentle boundaries.',
      'Small, focused sessions compound into monumental achievements.',
      'Time transforms from a source of stress into your greatest ally.',
    ],
    principles: [
      'Single task per 25-minute interval',
      'Step completely away during 5-minute rests',
      'Celebrate each completed session',
    ],
  },
  newport: {
    id: 'newport',
    name: 'Deep Work',
    title: '90-Min Stretch',
    tagline: 'Long unbroken block for high-output, deep thinking tasks',
    focusMinutes: 90,
    breakMinutes: 20,
    defaultSpecies: 'pine',
    accentColor: '#3b82f6',
    themeGradient: 'from-blue-500/10 via-indigo-950/20 to-stone-900/40',
    borderGlow: 'border-blue-500/30 group-hover:border-blue-500/60',
    primaryQuote: 'To produce at your peak level, focus for extended periods with full concentration on a single task.',
    quotes: [
      'To produce at your peak level, focus for extended periods with full concentration on a single task.',
      'Clarity about what matters provides clarity about what does not.',
      'Less mental clutter means more energy for tasks that genuinely matter.',
      'Silence notifications and let your mind sink into unbroken flow.',
      'Deep focus is a superpower in a world full of noise.',
    ],
    principles: [
      'Work deeply without tab switching',
      'Shield your attention from small interruptions',
      'Prioritize your most important task first',
    ],
  },
  marcus: {
    id: 'marcus',
    name: 'Stoic Flow',
    title: '50-Min Present',
    tagline: 'Calm, single-tasking focus grounded in the present moment',
    focusMinutes: 50,
    breakMinutes: 10,
    defaultSpecies: 'oak',
    accentColor: '#d97706',
    themeGradient: 'from-amber-500/10 via-amber-950/20 to-stone-900/40',
    borderGlow: 'border-amber-500/30 group-hover:border-amber-500/60',
    primaryQuote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    quotes: [
      'You have power over your mind - not outside events. Realize this, and you will find strength.',
      'Confine yourself to the present moment.',
      'Never let future worries disturb your current clarity.',
      'Very little is needed to make a calm mind; it is all in your way of thinking.',
      'Focus on doing what is right before you with tranquil simplicity.',
      'The mind becomes shaped by the quality of its thoughts.',
    ],
    principles: [
      'Eliminate the non-essential',
      'Embrace calm, single-tasking attention',
      'Act with deliberate tranquility',
    ],
  },
  ultradian: {
    id: 'ultradian',
    name: 'Energy Wave',
    title: 'Natural Cycle',
    tagline: 'Aligned with your body’s natural 90-minute biological energy rhythm',
    focusMinutes: 90,
    breakMinutes: 15,
    defaultSpecies: 'bonsai',
    accentColor: '#10b981',
    themeGradient: 'from-emerald-500/10 via-teal-950/20 to-stone-900/40',
    borderGlow: 'border-emerald-500/30 group-hover:border-emerald-500/60',
    primaryQuote: 'Align your work with your natural 90-minute wave of high mental clarity.',
    quotes: [
      'Align your work with your natural 90-minute wave of high mental clarity.',
      'Peak focus is a natural wave: ride the high energy, honor the restful recovery.',
      'Sustainable high performance comes from balancing intense focus with deep rest.',
      'Your mind naturally recharges when you give it space to pause.',
    ],
    principles: [
      'Ride the natural 90-minute energy wave',
      'Take a genuine break to recharge between sessions',
      'Hydrate and allow your mind to consolidate',
    ],
  },
  custom: {
    id: 'custom',
    name: 'Custom Timer',
    title: 'Your Pace',
    tagline: 'Set your own custom focus and break intervals',
    focusMinutes: 45,
    breakMinutes: 10,
    defaultSpecies: 'willow',
    accentColor: '#8b5cf6',
    themeGradient: 'from-violet-500/10 via-purple-950/20 to-stone-900/40',
    borderGlow: 'border-violet-500/30 group-hover:border-violet-500/60',
    primaryQuote: 'Order your surroundings, quiet the noise, and step into effortless flow.',
    quotes: [
      'Order your surroundings, quiet the noise, and step into effortless flow.',
      'Simplicity is the key to deep focus.',
      'Where your attention goes, your energy flows.',
      'Flow happens when you match high clarity with calm presence.',
    ],
    principles: [
      'Set a clear intention before starting',
      'Breathe slowly to find your rhythm',
      'Enjoy the feeling of progress',
    ],
  },
};
