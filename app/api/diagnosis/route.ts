import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '../../../lib/gemini/client';
import type { DiagnosisRequest, DiagnosisResult } from '../../../types/diagnosis';
import type { Habit } from '../../../types/zenith';

const SYSTEM_INSTRUCTION = `You are the Zenith Circadian Performance Strategist and Behavioral Scientist.
Your mission is to analyze the user's habit execution data, working window, and circadian slots to provide an empowering, guilt-free diagnostic evaluation.

CORE PRINCIPLES:
1. NEVER blame willpower or discipline. Habit skips are almost always schedule collisions, duration fatigue, or biological energy misalignments.
2. Value "Shrink, Don't Skip" micro-fallbacks (2–5 minute versions) as high-value momentum preservers.
3. Circadian Slots:
   - Morning: High cognitive focus, clarity, grounding.
   - Afternoon: Steady execution, meetings, physical movement.
   - Evening: Decompression, reflection, recovery. Avoid high-willpower routines late at night.
4. Output strictly valid JSON conforming exactly to the requested schema.`;

function buildPrompt(req: DiagnosisRequest): string {
  const {
    habits = [],
    workingWindow = { startTime: '09:00', endTime: '19:00', timezone: 'UTC' },
    userName = 'User',
    sprintGoal = 'Sustain circadian momentum',
    sprintDuration = 7,
    currentDayIndex = 0,
  } = req;

  const habitsSummary = habits.map((h, idx) => {
    const completedCount = h.week?.filter((s) => s === 'completed').length || 0;
    const missedCount = h.week?.filter((s) => s === 'missed').length || 0;
    const unloggedCount = h.week?.filter((s) => s === 'unlogged').length || 0;

    // Check for consecutive misses
    const recentMisses =
      currentDayIndex >= 2 &&
      h.week?.[currentDayIndex - 1] === 'missed' &&
      h.week?.[currentDayIndex - 2] === 'missed';

    return {
      index: idx + 1,
      id: h.id,
      name: h.name,
      category: h.category || 'General',
      circadianSlot: h.circadianSlot || 'morning',
      targetMinutes: h.minutes || 15,
      microVersion: h.microVersion || '2-min quick check',
      identityMotive: h.identityMotive || 'Build mindful consistency',
      healthScore: h.health || 80,
      weeklyHistory: h.week?.slice(0, sprintDuration) || [],
      stats: { completed: completedCount, missed: missedCount, unlogged: unloggedCount },
      hasTwoConsecutiveMisses: recentMisses,
    };
  });

  return `USER PROFILE & SPRINT CONTEXT:
- User Name: ${userName}
- Working Window: ${workingWindow.startTime || '09:00'} to ${workingWindow.endTime || '19:00'} (${workingWindow.timezone || 'UTC'})
- Sprint Horizon: ${sprintDuration} Days (Currently on Day ${currentDayIndex + 1})
- Sprint Goal: "${sprintGoal}"

ACTIVE HABITS DATA:
${JSON.stringify(habitsSummary, null, 2)}

INSTRUCTIONS:
Perform an in-depth circadian diagnosis. Analyze where schedule collisions and fatigue occur.
Produce a JSON response matching the following TypeScript interface structure:

{
  "zenithScore": {
    "overall": <number 0-100 calculated from consistency, resilience, and balance>,
    "circadianFidelity": <number 0-100 % of habits in optimal slot>,
    "recoveryResilience": <number 0-100 % of slips prevented from 2nd miss>,
    "balanceScore": <number 0-100 planned load vs usable window reality>,
    "levelLabel": "<e.g., 'Ascending Momentum' | 'Peak Flow' | 'Compressed Horizon' | 'Sustained Equilibrium'>"
  },
  "executiveSynthesis": {
    "headline": "<Inspiring, analytical 1-sentence breakthrough headline>",
    "briefing": "<2-3 mindful, compassionate sentences explaining why slips happened due to schedule/time, not weakness>",
    "primaryGrowthOpportunity": "<The single highest leverage 1-step change the user can make this week>",
    "strengths": ["<Strength 1>", "<Strength 2>", "<Strength 3>"]
  },
  "frictionAutopsy": {
    "scheduleCollisions": [
      {
        "habitId": "<matching habit id>",
        "habitName": "<matching habit name>",
        "collisionType": "<'late_workday_overrun' | 'duration_fatigue' | 'energy_misalignment' | 'weekend_drift' | 'unanchored_trigger'>",
        "title": "<Concise collision title>",
        "description": "<Why this habit hits friction relative to the user's working hours or daily energy>",
        "evidence": "<Direct evidence from weekly history or minutes>",
        "confidencePercent": <e.g., 85>,
        "suggestedAction": {
          "actionType": "<'reschedule_slot' | 'shrink_duration' | 'split_routine'>",
          "newSlot": "<'morning' | 'afternoon' | 'evening' | 'anytime'>",
          "newMinutes": <number or undefined>,
          "label": "<Short 1-click button action label, e.g. 'Shift to Morning (08:30)'>"
        }
      }
    ],
    "circadianZoneFriction": {
      "morning": "<'low' | 'moderate' | 'high'>",
      "afternoon": "<'low' | 'moderate' | 'high'>",
      "evening": "<'low' | 'moderate' | 'high'>"
    },
    "overallFrictionVerdict": "<1 concise sentence summarizing friction status>"
  },
  "habitOptimizations": [
    {
      "habitId": "<matching habit id>",
      "habitName": "<matching habit name>",
      "currentSlot": "<current slot>",
      "recommendedSlot": "<'morning' | 'afternoon' | 'evening' | 'anytime'>",
      "isSlotOptimal": <boolean>,
      "reasoning": "<Why this slot maximizes retention>",
      "tieredVersions": {
        "gold": { "durationMins": <full minutes>, "label": "Gold Horizon", "description": "<full routine description>" },
        "silver": { "durationMins": <half minutes>, "label": "Silver Flow", "description": "<standard compressed version>" },
        "bronzeMicro": { "durationMins": <2-5>, "label": "Bronze Micro-Fallback", "description": "<ultra-fast identity preserver>" }
      },
      "identityMotiveUpgrade": "<A strengthened identity statement, e.g. 'I am an athlete who values daily mobility'>"
    }
  ],
  "recoveryProtocols": [
    // Include 3-day recovery ramp for ANY habit with 2 consecutive misses or high friction (or for the top 1-2 most at-risk habits)
    {
      "habitId": "<matching habit id>",
      "habitName": "<matching habit name>",
      "consecutiveMisses": <number>,
      "triggerReason": "<Why momentum dipped>",
      "steps": [
        {
          "dayNumber": 1,
          "stepName": "Micro-Spark Reignition",
          "tier": "micro",
          "targetMinutes": 2,
          "actionPrompt": "<Easy 2-minute version to eliminate friction>",
          "mindsetGrounding": "Showing up for 120 seconds re-establishes self-trust."
        },
        {
          "dayNumber": 2,
          "stepName": "Half-Power Flow",
          "tier": "half",
          "targetMinutes": <approx half duration>,
          "actionPrompt": "<Medium version>",
          "mindsetGrounding": "Sustaining momentum with zero exhaustion."
        },
        {
          "dayNumber": 3,
          "stepName": "Full Zenith Horizon",
          "tier": "full",
          "targetMinutes": <full minutes>,
          "actionPrompt": "<Full standard routine>",
          "mindsetGrounding": "Complete baseline restored with full momentum."
        }
      ]
    }
  ]
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DiagnosisRequest;

    if (!body.habits || body.habits.length === 0) {
      return NextResponse.json(
        { error: 'No habits provided for diagnosis.' },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(body);
    const diagnosis = await callGeminiStructured<DiagnosisResult>(prompt, SYSTEM_INSTRUCTION);

    // Attach metadata
    diagnosis.generatedAt = new Date().toISOString();
    diagnosis.modelUsed = 'Gemini 2.5 Flash-Lite';

    return NextResponse.json(diagnosis, { status: 200 });
  } catch (err: any) {
    console.error('Diagnosis API Error:', err);
    return NextResponse.json(
      {
        error: err.message || 'Failed to generate AI diagnosis',
      },
      { status: 500 }
    );
  }
}
