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
  marcus: {
    id: 'marcus',
    name: 'Marcus Aurelius',
    title: 'The Stoic Emperor',
    tagline: 'Radical presence, emotional equilibrium & monotasking',
    focusMinutes: 50,
    breakMinutes: 10,
    defaultSpecies: 'oak',
    accentColor: '#d97706',
    themeGradient: 'from-amber-500/10 via-amber-950/20 to-stone-900/40',
    borderGlow: 'border-amber-500/30 group-hover:border-amber-500/60',
    primaryQuote: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    quotes: [
      'You have power over your mind - not outside events. Realize this, and you will find strength.',
      'Confine yourself to the present.',
      'Never let the future disturb you. You will meet it, if you have to, with the same weapons of reason.',
      'Very little is needed to make a happy life; it is all within yourself, in your way of thinking.',
      'Waste no more time arguing about what a good man should be. Be one.',
      'The soul becomes dyed with the color of its thoughts.',
    ],
    principles: [
      'Eliminate the non-essential',
      'Embrace undivided attention',
      'Act with deliberate tranquility',
    ],
  },
  newport: {
    id: 'newport',
    name: 'Cal Newport',
    title: 'Deep Work Master',
    tagline: 'Unbroken cognitive stretches & total distraction shielding',
    focusMinutes: 90,
    breakMinutes: 20,
    defaultSpecies: 'pine',
    accentColor: '#3b82f6',
    themeGradient: 'from-blue-500/10 via-indigo-950/20 to-stone-900/40',
    borderGlow: 'border-blue-500/30 group-hover:border-blue-500/60',
    primaryQuote: 'To produce at your peak level you need to work for extended periods with full concentration on a single task.',
    quotes: [
      'To produce at your peak level you need to work for extended periods with full concentration on a single task.',
      'Clarity about what matters provides clarity about what does not.',
      'If you don’t produce, you won’t thrive—no matter how skilled or talented you are.',
      'Efforts to deepen your focus will struggle if you don’t simultaneously wean your mind from a dependence on distraction.',
      'Less mental clutter means more mental energy for tasks that genuinely require cognitive strain.',
    ],
    principles: [
      'Work deeply without tab switching',
      'Embrace boredom between tasks',
      'Drain the shallow work pool',
    ],
  },
  cirillo: {
    id: 'cirillo',
    name: 'Francesco Cirillo',
    title: 'Pomodoro Originator',
    tagline: 'Agile 25-minute sprints & structured cognitive rejuvenation',
    focusMinutes: 25,
    breakMinutes: 5,
    defaultSpecies: 'sakura',
    accentColor: '#ef4444',
    themeGradient: 'from-rose-500/10 via-red-950/20 to-stone-900/40',
    borderGlow: 'border-rose-500/30 group-hover:border-rose-500/60',
    primaryQuote: 'One task, one interval. Eliminate the tyranny of time by befriending the clock.',
    quotes: [
      'One task, one interval. Eliminate the tyranny of time by befriending the clock.',
      'The next pomodoro will go better.',
      'A pomodoro cannot be divided; there is no such thing as half a pomodoro.',
      'Protect the pomodoro with ferocious kindness.',
      'Time transforms from an enemy into a valuable ally.',
    ],
    principles: [
      'Single task per 25-minute interval',
      'Step completely away during 5m rests',
      'Track completed cycles systematically',
    ],
  },
  ultradian: {
    id: 'ultradian',
    name: 'Ultradian Wave',
    title: 'Kleitman Biology Cycle',
    tagline: '90-minute natural neurochemical peak & restorative replenishment',
    focusMinutes: 90,
    breakMinutes: 15,
    defaultSpecies: 'bonsai',
    accentColor: '#10b981',
    themeGradient: 'from-emerald-500/10 via-teal-950/20 to-stone-900/40',
    borderGlow: 'border-emerald-500/30 group-hover:border-emerald-500/60',
    primaryQuote: 'Align cognitive output with the body’s natural 90-minute circadian and ultradian rhythmicity.',
    quotes: [
      'Align cognitive output with the body’s natural 90-minute circadian and ultradian rhythmicity.',
      'Peak focus is a biological wave: ride the crest, honor the recovery trough.',
      'Sustainable high performance requires harmonic oscillation between energy expenditure and renewal.',
      'Brainwaves shift every 90 minutes from high-frequency beta to restorative alpha and theta.',
    ],
    principles: [
      'Ride the natural 90-minute energy wave',
      'No caffeine during recovery cycles',
      'Hydrate and allow neural consolidation',
    ],
  },
  custom: {
    id: 'custom',
    name: 'Zen Sanctuary',
    title: 'Personalized Flow',
    tagline: 'Configurable sandbox tailored to your bespoke rhythm',
    focusMinutes: 45,
    breakMinutes: 10,
    defaultSpecies: 'willow',
    accentColor: '#8b5cf6',
    themeGradient: 'from-violet-500/10 via-purple-950/20 to-stone-900/40',
    borderGlow: 'border-violet-500/30 group-hover:border-violet-500/60',
    primaryQuote: 'Order your surroundings, silence the noise, and step into the timeless current of deep creation.',
    quotes: [
      'Order your surroundings, silence the noise, and step into the timeless current of deep creation.',
      'Simplicity is the prerequisite for depth.',
      'Where attention goes, neural energy flows.',
      'Flow is the intersection of high challenge and total presence.',
    ],
    principles: [
      'Set a crisp intention before starting',
      'Breathe slowly to lower baseline cortisol',
      'Celebrate each completed focus interval',
    ],
  },
};
