import type { ZenithScore } from '../../types/diagnosis';

export interface RhythmPersona {
  id: string;
  title: string;
  emoji: string;
  tagline: string;
  funnyQuote: string;
  superpower: string;
  badgeStyle: string;
  lowPressureQuest: string;
  realLifeTranslation: {
    energy: string;
    resilience: string;
    balance: string;
  };
}

export const RHYTHM_PERSONAS: Record<string, RhythmPersona> = {
  THE_ESPRESSO_PHILOSOPHER: {
    id: 'espresso_philosopher',
    title: 'The Espresso Philosopher',
    emoji: '☕',
    tagline: 'Peak morning brilliance with a 3 PM coffee truce',
    funnyQuote: 'Invincible until 2:30 PM, then enters emergency iced latte negotiation mode.',
    superpower: 'Crushes 80% of daily focus before lunch',
    badgeStyle: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    lowPressureQuest: 'Step away from your screen for 3 minutes and drink a tall glass of water.',
    realLifeTranslation: {
      energy: 'Your mornings are pure gold — you get things done early.',
      resilience: 'When afternoon fatigue hits, you know how to pause without guilt.',
      balance: 'Keep heavy tasks in the AM so afternoons stay light and breezy.',
    },
  },
  THE_ZEN_MASTER: {
    id: 'zen_master',
    title: 'The Zen Master in Disguise',
    emoji: '🦥',
    tagline: 'Calm consistency that looks almost effortless',
    funnyQuote: 'Crushing goals with so much chill that people think you are barely trying.',
    superpower: 'Zero-guilt momentum protection',
    badgeStyle: 'border-sage/40 bg-sage-wash text-sage-deep',
    lowPressureQuest: 'Do 60 seconds of gentle neck and shoulder stretches right in your chair.',
    realLifeTranslation: {
      energy: 'Your habits feel natural and unforced throughout the day.',
      resilience: 'You never let one busy day turn into an emotional spiral.',
      balance: 'Your schedule has genuine breathing room for real life.',
    },
  },
  THE_36_HOUR_DREAMER: {
    id: '36_hour_dreamer',
    title: 'The 36-Hour Dreamer',
    emoji: '🚀',
    tagline: 'Plans 14 habits before 8 AM because tomorrow has extra hours',
    funnyQuote: 'Believes tomorrow has 36 hours. We deeply respect the ambition!',
    superpower: 'Boundless enthusiasm for growth',
    badgeStyle: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    lowPressureQuest: 'Pick just ONE 2-minute micro-step today and declare victory.',
    realLifeTranslation: {
      energy: 'High energy intentions, but days occasionally get squeezed.',
      resilience: 'Learning that doing a 2-minute version is a huge win on busy days.',
      balance: 'Trimming just 10 minutes off planned routines creates instant breathing room.',
    },
  },
  THE_COMEBACK_SPECIALIST: {
    id: 'comeback_specialist',
    title: 'The Comeback Specialist',
    emoji: '⚡',
    tagline: 'Misses one day, bounces back like nothing happened',
    funnyQuote: 'A missed day is just a quick pit stop. You reboot with zero drama.',
    superpower: 'Elastic bounce-back velocity',
    badgeStyle: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    lowPressureQuest: 'Acknowledge one small win you did yesterday, no matter how tiny.',
    realLifeTranslation: {
      energy: 'Consistent rhythm across both morning and afternoon routines.',
      resilience: 'Top-tier resilience: you never let slips compound into streaks.',
      balance: 'You prioritize getting back on track over unrealistic perfection.',
    },
  },
  THE_CIRCADIAN_CHAMELEON: {
    id: 'circadian_chameleon',
    title: 'The Circadian Chameleon',
    emoji: '🌻',
    tagline: 'Riding the sun natural curve better than a solar panel',
    funnyQuote: 'In sync with your biological energy curve from dawn until dusk.',
    superpower: 'Flawless biological timing',
    badgeStyle: 'border-amber-400/40 bg-amber-400/10 text-amber-800 dark:text-amber-200',
    lowPressureQuest: 'Look out a window or step outside for 2 minutes of natural sunlight.',
    realLifeTranslation: {
      energy: 'Your rituals align beautifully with your body natural focus peaks.',
      resilience: 'Gentle on yourself during natural evening wind-down periods.',
      balance: 'Optimal harmony between work hours and mindful rituals.',
    },
  },
  THE_902_PM_OVERTHINKER: {
    id: '902_pm_overthinker',
    title: 'The 9:02 PM Overthinker',
    emoji: '🦉',
    tagline: 'Plans to conquer the world at night, but cozy blankets call',
    funnyQuote: 'Schedules big habits for 9 PM, but bed calls at 9:04 PM. We relate!',
    superpower: 'Unbeatable evening reflection vibes',
    badgeStyle: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    lowPressureQuest: 'Swap your evening heavy routine for 2 minutes of calming deep breathing.',
    realLifeTranslation: {
      energy: 'Nights are for resting — heavy-willpower tasks get squeezed after dark.',
      resilience: 'Shifting demanding habits to earlier hours unlocks instant ease.',
      balance: 'Treating evening time as restorative rest instead of work overtime.',
    },
  },
  THE_STEADY_CRUISER: {
    id: 'steady_cruiser',
    title: 'The Steady Flow Cruiser',
    emoji: '🌊',
    tagline: 'Cruising smoothly through the week with quiet confidence',
    funnyQuote: 'No frantic sprints, no burnout — just clean, steady momentum.',
    superpower: 'Unshakable baseline consistency',
    badgeStyle: 'border-teal-500/40 bg-teal-500/10 text-teal-700 dark:text-teal-300',
    lowPressureQuest: 'Take a slow, mindful sip of water or tea and enjoy a moment of quiet.',
    realLifeTranslation: {
      energy: 'Balanced energy distribution across your entire day.',
      resilience: 'Solid self-trust that keeps momentum alive week after week.',
      balance: 'Comfortable day capacity with room for spontaneous life moments.',
    },
  },
};

export function calculateRhythmPersona(score: ZenithScore): RhythmPersona {
  const overall = score?.overall ?? 75;
  const fidelity = score?.circadianFidelity ?? 75;
  const resilience = score?.recoveryResilience ?? 75;
  const balance = score?.balanceScore ?? 75;

  // 1. High resilience champion
  if (resilience >= 88 && overall >= 75) {
    return RHYTHM_PERSONAS.THE_COMEBACK_SPECIALIST;
  }

  // 2. High circadian alignment
  if (fidelity >= 88) {
    return RHYTHM_PERSONAS.THE_CIRCADIAN_CHAMELEON;
  }

  // 3. High balance & steady chill
  if (balance >= 80 && overall >= 80) {
    return RHYTHM_PERSONAS.THE_ZEN_MASTER;
  }

  // 4. Overextended / tight calendar
  if (balance < 65) {
    return RHYTHM_PERSONAS.THE_36_HOUR_DREAMER;
  }

  // 5. High morning focus, afternoon fatigue
  if (fidelity < 70 && balance >= 65) {
    return RHYTHM_PERSONAS.THE_ESPRESSO_PHILOSOPHER;
  }

  // 6. Lower evening fidelity
  if (overall < 70) {
    return RHYTHM_PERSONAS.THE_902_PM_OVERTHINKER;
  }

  // Default: Steady Cruiser
  return RHYTHM_PERSONAS.THE_STEADY_CRUISER;
}
