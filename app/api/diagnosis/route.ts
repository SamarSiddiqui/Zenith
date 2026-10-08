import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '../../../lib/gemini/client';
import { getCached, setCached, hashHabitsState } from '../../../lib/redis/client';
import { checkDiagnosisRateLimit } from '../../../lib/redis/ratelimit';
import type { DiagnosisRequest, DiagnosisResult } from '../../../types/diagnosis';
import type { Habit } from '../../../types/zenith';

const DIAGNOSIS_CACHE_TTL_SECONDS = 4 * 60 * 60; // 4 Hours TTL

const SYSTEM_INSTRUCTION = `You are Zenith, a wise, calm, and deeply encouraging habit mentor and supportive companion.
Think of yourself as a kind, thoughtful friend sitting down with the user over coffee to reflect on their week.

TONE & VOICE GUIDELINES:
1. WARM, CALM, AND SUPPORTIVE: Speak warmly, conversationally, and with genuine empathy. Use "we" and "you" in an encouraging, friendly way.
2. ZERO GUILT OR SHAME: Never blame willpower, discipline, or laziness. Treat any skipped habit as a natural schedule squeeze or energy mismatch.
3. HUMAN & DOWN-TO-EARTH: Avoid clinical jargon (no "autopsy", "collision compliance", "failure pathology"). Use gentle, human expressions like "where your day got squeezed", "giving yourself breathing room", "your best next step", "gentle momentum reset".
4. CELEBRATE MICRO-STEPS: Emphasize that doing a 2-minute version on busy days is a huge win for self-trust.
5. Circadian Harmony:
   - Morning: Natural focus and morning clarity.
   - Afternoon: Steady execution and physical energy.
   - Evening: Decompression, reflection, and restorative rest. Avoid heavy-willpower demands late at night.
6. Output strictly valid JSON conforming to the requested schema.`;

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
Reflect on the user's week like a thoughtful, supportive mentor. Analyze where time flowed naturally and where days got squeezed.
Produce a JSON response matching the following structure:

{
  "zenithScore": {
    "overall": <number 0-100 calculated from consistency, resilience, and balance>,
    "circadianFidelity": <number 0-100 % of habits in their natural energy slot>,
    "recoveryResilience": <number 0-100 % of slips prevented from turning into second misses>,
    "balanceScore": <number 0-100 planned load vs usable day reality>,
    "levelLabel": "<e.g., 'In Gentle Flow' | 'Growing Steadily' | 'Finding Your Rhythm' | 'Slightly Overextended'>"
  },
  "executiveSynthesis": {
    "headline": "<Encouraging, inspiring, warm 1-sentence insight celebrating progress and identifying the root schedule gap>",
    "briefing": "<2-3 warm, compassionate, friend-like sentences explaining that slips were caused by busy work hours or timing mismatches, not discipline>",
    "primaryGrowthOpportunity": "<The single kindest, highest-leverage 1-step change the user can make this week>",
    "strengths": ["<Strength 1>", "<Strength 2>", "<Strength 3>"]
  },
  "frictionAutopsy": {
    "scheduleCollisions": [
      {
        "habitId": "<matching habit id>",
        "habitName": "<matching habit name>",
        "collisionType": "<'late_workday_overrun' | 'duration_fatigue' | 'energy_misalignment' | 'weekend_drift' | 'unanchored_trigger'>",
        "title": "<Warm, human title like 'Evening Squeeze After Work' or 'Ambitious Target Length'>",
        "description": "<Kind explanation of how work hours or energy drop squeezed this ritual>",
        "evidence": "<What we noticed in the logs>",
        "confidencePercent": <e.g., 85>,
        "suggestedAction": {
          "actionType": "<'reschedule_slot' | 'shrink_duration' | 'split_routine'>",
          "newSlot": "<'morning' | 'afternoon' | 'evening' | 'anytime'>",
          "newMinutes": <number or undefined>,
          "label": "<Friendly 1-click button text, e.g. 'Shift to Morning (08:30)' or 'Try 15m Flow'>"
        }
      }
    ],
    "circadianZoneFriction": {
      "morning": "<'low' | 'moderate' | 'high'>",
      "afternoon": "<'low' | 'moderate' | 'high'>",
      "evening": "<'low' | 'moderate' | 'high'>"
    },
    "overallFrictionVerdict": "<1 kind, reassuring sentence summarizing how the schedule felt this week>"
  },
  "habitOptimizations": [
    {
      "habitId": "<matching habit id>",
      "habitName": "<matching habit name>",
      "currentSlot": "<current slot>",
      "recommendedSlot": "<'morning' | 'afternoon' | 'evening' | 'anytime'>",
      "isSlotOptimal": <boolean>,
      "reasoning": "<Why this slot gives the user more ease and natural flow>",
      "tieredVersions": {
        "gold": { "durationMins": <full minutes>, "label": "Full Flow", "description": "<full intended routine when time is abundant>" },
        "silver": { "durationMins": <half minutes>, "label": "Gentle Flow", "description": "<peaceful standard flow for regular busy days>" },
        "bronzeMicro": { "durationMins": <2-5>, "label": "2-Min Spark", "description": "<ultra-light identity anchor when your day is packed>" }
      },
      "identityMotiveUpgrade": "<A warm, empowering identity statement, e.g. 'I am someone who cares for my body with daily gentle movement'>"
    }
  ],
  "recoveryProtocols": [
    {
      "habitId": "<matching habit id>",
      "habitName": "<matching habit name>",
      "consecutiveMisses": <number>,
      "triggerReason": "<Compassionate note on why momentum paused>",
      "steps": [
        {
          "dayNumber": 1,
          "stepName": "Just 2 Minutes",
          "tier": "micro",
          "targetMinutes": 2,
          "actionPrompt": "<Ultra-easy 2-minute action to show up with zero stress>",
          "mindsetGrounding": "Showing up for just 120 seconds gently re-ignites your self-trust."
        },
        {
          "dayNumber": 2,
          "stepName": "Gentle Stretch",
          "tier": "half",
          "targetMinutes": <approx half duration>,
          "actionPrompt": "<Easy relaxed version>",
          "mindsetGrounding": "Finding your groove with ease and zero pressure."
        },
        {
          "dayNumber": 3,
          "stepName": "Back in Full Flow",
          "tier": "full",
          "targetMinutes": <full minutes>,
          "actionPrompt": "<Full enjoyable routine>",
          "mindsetGrounding": "You're fully back in your natural rhythm."
        }
      ]
    }
  ]
}`;
}

const LATEST_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 Days for last known user reflection

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get('userId') || req.headers.get('x-forwarded-for') || 'anonymous_user';
  const latestCacheKey = `zenith:diag:latest:${userId}`;

  try {
    const cached = await getCached<DiagnosisResult>(latestCacheKey);
    if (cached) {
      cached.isCached = true;
      cached.isStale = true;
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'x-cache': 'STALE',
          'x-cache-key': latestCacheKey,
          'x-response-time-ms': String(Date.now() - startTime),
        },
      });
    }
    return NextResponse.json({ error: 'No cached reflection found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Cache read failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = (await req.json()) as DiagnosisRequest;
    const userId = body.userId || req.headers.get('x-forwarded-for') || 'anonymous_user';
    const latestCacheKey = `zenith:diag:latest:${userId}`;

    // Fast Path: Stale-Check only (Returns previous reflection from Redis in ~10ms)
    if (body.mode === 'stale_check') {
      const cachedLatest = await getCached<DiagnosisResult>(latestCacheKey);
      if (cachedLatest) {
        cachedLatest.isCached = true;
        cachedLatest.isStale = true;
        return NextResponse.json(cachedLatest, {
          status: 200,
          headers: {
            'x-cache': 'STALE',
            'x-cache-key': latestCacheKey,
            'x-response-time-ms': String(Date.now() - startTime),
          },
        });
      }
      return NextResponse.json({ error: 'No cached reflection available.' }, { status: 404 });
    }

    if (!body.habits || body.habits.length === 0) {
      return NextResponse.json(
        { error: 'No habits provided for diagnosis.' },
        { status: 400 }
      );
    }

    // 1. Sliding-Window Rate Limiting Check (10 reqs / 10 mins)
    const rateLimit = await checkDiagnosisRateLimit(userId);
    if (!rateLimit.success) {
      // If rate limited but user allows stale fallback, serve stale rather than erroring out!
      const fallbackLatest = await getCached<DiagnosisResult>(latestCacheKey);
      if (fallbackLatest) {
        fallbackLatest.isCached = true;
        fallbackLatest.isStale = true;
        return NextResponse.json(fallbackLatest, {
          status: 200,
          headers: {
            'x-cache': 'RATE_LIMITED_STALE_FALLBACK',
            'x-cache-key': latestCacheKey,
            'x-response-time-ms': String(Date.now() - startTime),
          },
        });
      }

      return NextResponse.json(
        {
          error: 'Rate limit reached. Please pause a moment before requesting fresh reflections.',
          retryAfterSeconds: Math.ceil((rateLimit.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'x-ratelimit-limit': String(rateLimit.limit),
            'x-ratelimit-remaining': String(rateLimit.remaining),
            'x-ratelimit-reset': String(rateLimit.reset),
          },
        }
      );
    }

    // 2. Exact Habit State Cache Key Construction
    const stateHash = hashHabitsState(body.habits, body.currentDayIndex, body.workingWindow);
    const exactCacheKey = `zenith:diag:${userId}:${stateHash}`;

    // 3. Exact Cache-Aside Check (if not force-refreshed)
    if (!body.forceRefresh) {
      const cachedDiagnosis = await getCached<DiagnosisResult>(exactCacheKey);
      if (cachedDiagnosis) {
        cachedDiagnosis.isCached = true;
        cachedDiagnosis.isStale = false;
        const duration = Date.now() - startTime;
        return NextResponse.json(cachedDiagnosis, {
          status: 200,
          headers: {
            'x-cache': 'HIT',
            'x-cache-key': exactCacheKey,
            'x-response-time-ms': String(duration),
          },
        });
      }
    }

    // 4. Cache Miss / Force Fresh -> Call Gemini 3.5 Flash-Lite
    const prompt = buildPrompt(body);
    const diagnosis = await callGeminiStructured<DiagnosisResult>(prompt, SYSTEM_INSTRUCTION);

    // Attach metadata
    diagnosis.generatedAt = new Date().toISOString();
    diagnosis.modelUsed = 'Gemini 3.5 Flash-Lite';
    diagnosis.isCached = false;
    diagnosis.isStale = false;

    // 5. Dual-Layer Redis Storage:
    // A) Exact state match (4-hour TTL)
    await setCached(exactCacheKey, diagnosis, DIAGNOSIS_CACHE_TTL_SECONDS);
    // B) User's latest reflection snapshot for SWR instant rendering (7-day TTL)
    await setCached(latestCacheKey, diagnosis, LATEST_CACHE_TTL_SECONDS);

    const duration = Date.now() - startTime;
    return NextResponse.json(diagnosis, {
      status: 200,
      headers: {
        'x-cache': 'MISS',
        'x-cache-key': exactCacheKey,
        'x-response-time-ms': String(duration),
      },
    });
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

