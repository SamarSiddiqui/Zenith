import type { DiagnosisRequest, DiagnosisResult, CircadianSlot, FrictionSeverity } from '../../types/diagnosis';

export function generateHeuristicDiagnosis(req: DiagnosisRequest): DiagnosisResult {
  const habits = req.habits || [];
  const durationDays = req.sprintDuration || 7;
  const currentDayIndex = req.currentDayIndex ?? 0;
  const userName = req.userName || 'Practitioner';

  // 1. Calculate show-up rate and completion statistics
  let totalOpportunities = 0;
  let totalCompleted = 0;
  let totalMissed = 0;

  habits.forEach((h) => {
    const days = h.week ? h.week.slice(0, durationDays) : [];
    days.forEach((status) => {
      totalOpportunities++;
      if (status === 'completed') totalCompleted++;
      if (status === 'missed') totalMissed++;
    });
  });

  const completionPct = totalOpportunities > 0 ? Math.round((totalCompleted / totalOpportunities) * 100) : 75;
  const avgHealth = habits.length > 0
    ? Math.round(habits.reduce((acc, h) => acc + (h.health || 80), 0) / habits.length)
    : 80;

  // 2. Zone analysis
  const morningHabits = habits.filter((h) => (h.circadianSlot || 'morning') === 'morning');
  const afternoonHabits = habits.filter((h) => h.circadianSlot === 'afternoon');
  const eveningHabits = habits.filter((h) => h.circadianSlot === 'evening');

  const morningMisses = morningHabits.reduce((acc, h) => acc + (h.week?.filter((s) => s === 'missed').length || 0), 0);
  const eveningMisses = eveningHabits.reduce((acc, h) => acc + (h.week?.filter((s) => s === 'missed').length || 0), 0);

  const morningFriction: FrictionSeverity = morningMisses > 3 ? 'moderate' : 'low';
  const afternoonFriction: FrictionSeverity = afternoonHabits.length > 3 ? 'moderate' : 'low';
  const eveningFriction: FrictionSeverity = eveningMisses > 2 || eveningHabits.some((h) => (h.minutes || 0) > 30) ? 'high' : 'low';

  // 3. Derive Zenith Score
  const circadianFidelity = Math.min(100, Math.max(50, Math.round(completionPct * 0.95 + 5)));
  const recoveryResilience = Math.min(100, Math.max(60, Math.round(avgHealth * 0.9 + 10)));
  const balanceScore = Math.max(50, Math.min(95, 100 - Math.abs(habits.length - 4) * 5));
  const overall = Math.round((circadianFidelity * 0.4) + (recoveryResilience * 0.4) + (balanceScore * 0.2));

  let levelLabel = 'Sustained Ascendance';
  if (overall >= 88) levelLabel = 'Peak Circadian Flow';
  else if (overall >= 75) levelLabel = 'Sustained Ascendance';
  else if (overall >= 60) levelLabel = 'Steady Rhythm Baseline';
  else levelLabel = 'Gentle Recovery Arc';

  // 4. Identify schedule collisions
  const scheduleCollisions: DiagnosisResult['frictionAutopsy']['scheduleCollisions'] = [];

  habits.forEach((h) => {
    const minutes = h.minutes || 15;
    const slot = h.circadianSlot || 'morning';
    const recentMisses = h.week ? h.week.filter((s) => s === 'missed').length : 0;

    if (slot === 'evening' && minutes >= 30) {
      scheduleCollisions.push({
        habitId: h.id,
        habitName: h.name,
        collisionType: 'late_workday_overrun',
        title: `${h.name}: Evening Willpower Squeeze`,
        description: `Carrying a ${minutes}-minute demanding routine into the evening often collides with natural post-work cognitive fatigue.`,
        evidence: `Scheduled in evening with ${minutes}m target duration.`,
        confidencePercent: 88,
        suggestedAction: {
          actionType: 'shrink_duration',
          newMinutes: Math.min(15, Math.max(5, Math.round(minutes / 2))),
          label: `Downscale to ${Math.min(15, Math.max(5, Math.round(minutes / 2)))}m evening decompression`,
        },
      });
    } else if (recentMisses >= 2) {
      scheduleCollisions.push({
        habitId: h.id,
        habitName: h.name,
        collisionType: 'duration_fatigue',
        title: `${h.name}: Friction Accumulation`,
        description: `This ritual encountered resistance on ${recentMisses} days this week. Micro-version activations can preserve consistency without strain.`,
        evidence: `${recentMisses} missed sessions logged in active sprint.`,
        confidencePercent: 82,
        suggestedAction: {
          actionType: 'shrink_duration',
          newMinutes: 5,
          label: 'Adopt 5-Minute Micro Fallback for 3 days',
        },
      });
    }
  });

  // 5. Build Habit Optimizations
  const habitOptimizations: DiagnosisResult['habitOptimizations'] = habits.map((h) => {
    const minutes = h.minutes || 20;
    const slot = (h.circadianSlot || 'morning') as CircadianSlot;
    const isOptimal = slot === 'morning' || (slot === 'evening' && minutes <= 20);

    return {
      habitId: h.id,
      habitName: h.name,
      currentSlot: slot,
      recommendedSlot: isOptimal ? slot : 'morning',
      isSlotOptimal: isOptimal,
      reasoning: isOptimal
        ? `Well-anchored in your biological ${slot} window for sustainable momentum.`
        : `Moving to morning clarity removes late-day decision fatigue.`,
      tieredVersions: {
        gold: {
          durationMins: Math.round(minutes * 1.25),
          label: 'Deep Immersion',
          description: `Full undistracted expression of ${h.name} on high-energy days.`,
        },
        silver: {
          durationMins: minutes,
          label: 'Standard Cadence',
          description: `Your baseline ${minutes}-minute ritual for typical workdays.`,
        },
        bronzeMicro: {
          durationMins: Math.min(5, Math.max(2, Math.round(minutes * 0.2))),
          label: 'Frictionless Micro-Step',
          description: h.microVersion || `2 to 5-minute zero-guilt version to preserve your streak.`,
        },
      },
      identityMotiveUpgrade: `I am someone who consistently nurtures ${h.name.toLowerCase()} with ease.`,
    };
  });

  // 6. Build 3-Day Step-Up Recovery Protocols for challenged habits
  const recoveryProtocols: DiagnosisResult['recoveryProtocols'] = habits
    .filter((h) => {
      const misses = h.week ? h.week.filter((s) => s === 'missed').length : 0;
      return misses >= 2 || (h.health || 80) < 70;
    })
    .slice(0, 2)
    .map((h) => ({
      habitId: h.id,
      habitName: h.name,
      consecutiveMisses: h.week?.filter((s) => s === 'missed').length || 2,
      triggerReason: 'Cognitive load and schedule compression during transition hours.',
      steps: [
        {
          dayNumber: 1,
          stepName: 'Zero-Friction Micro Restart',
          tier: 'micro',
          targetMinutes: 3,
          actionPrompt: `Perform just 3 minutes of ${h.name}. Stop immediately when the timer chimes.`,
          mindsetGrounding: 'Showing up for 3 minutes rebuilds self-trust faster than guilt ever could.',
        },
        {
          dayNumber: 2,
          stepName: 'Gentle Half-Session',
          tier: 'half',
          targetMinutes: Math.max(5, Math.round((h.minutes || 15) / 2)),
          actionPrompt: `Complete an easy ${Math.max(5, Math.round((h.minutes || 15) / 2))}-minute block without pushing for perfection.`,
          mindsetGrounding: 'Consistency is about rhythm, not intensity.',
        },
        {
          dayNumber: 3,
          stepName: 'Full Rhythm Re-Integration',
          tier: 'full',
          targetMinutes: h.minutes || 15,
          actionPrompt: `Return comfortably to your full ${h.minutes || 15}-minute routine with refreshed momentum.`,
          mindsetGrounding: 'Your habit is re-anchored. Celebrate this full recovery cycle.',
        },
      ],
    }));

  return {
    zenithScore: {
      overall,
      circadianFidelity,
      recoveryResilience,
      balanceScore,
      levelLabel,
    },
    executiveSynthesis: {
      headline: `${userName}'s Weekly Rhythm: ${levelLabel}`,
      briefing: `You've preserved a ${completionPct}% show-up cadence across your active horizon. Your morning rituals show high resilience, while evening routines benefit from micro-fallbacks to prevent late-day friction.`,
      primaryGrowthOpportunity: eveningMisses > 1
        ? 'Protect evening decompression by reducing duration on demanding routines.'
        : 'Deepen morning focus blocks before opening external communication channels.',
      strengths: [
        `Maintained an average ritual health score of ${avgHealth}%.`,
        `Successfully logged ${totalCompleted} mindful rituals in the active sprint horizon.`,
        'Active zero-guilt micro-step versions available for high-friction days.',
      ],
    },
    frictionAutopsy: {
      scheduleCollisions,
      circadianZoneFriction: {
        morning: morningFriction,
        afternoon: afternoonFriction,
        evening: eveningFriction,
      },
      overallFrictionVerdict: scheduleCollisions.length > 0
        ? `Identified ${scheduleCollisions.length} schedule friction points. Micro-downscaling resolves 90% of observed fatigue.`
        : 'Your schedule aligns cleanly with natural circadian energy curves.',
    },
    habitOptimizations,
    recoveryProtocols,
    generatedAt: new Date().toISOString(),
    modelUsed: 'Zenith Offline Resilience Engine',
    isCached: false,
    isStale: false,
  };
}

