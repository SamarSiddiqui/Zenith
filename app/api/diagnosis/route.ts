import { NextRequest, NextResponse } from 'next/server';
import { callGeminiStructured } from '../../../lib/gemini/client';
import { generateHeuristicDiagnosis } from '../../../lib/gemini/fallback';
import { getCached, setCached, hashHabitsState } from '../../../lib/redis/client';
import { checkDiagnosisRateLimit } from '../../../lib/redis/ratelimit';
import type { DiagnosisRequest, DiagnosisResult } from '../../../types/diagnosis';
import type { Habit } from '../../../types/zenith';

const DIAGNOSIS_CACHE_TTL_SECONDS = 4 * 60 * 60; // 4 Hours TTL

const SYSTEM_INSTRUCTION = `You are Zenith, a straight-talking habit coach, seasoned mentor, and candid friend.
You talk like an experienced, trusted friend who respects the user too much to lie to them, coddle them, or sugarcoat reality.

CORE VOICE & TONE DIRECTIVES:
1. NO BUTTERY FLATTERY OR PAMPERING:
   - Cut out all patronizing sweetness, excessive praise, and empty cheerleading.
   - Never say things like "You're doing amazing, sweet friend!" or invent gentle excuses like "your busy day just squeezed you out, don't worry."
   - If execution was poor or inconsistent, call it out directly, plainly, and respectfully.

2. CANDID FRIEND & EXPERIENCED MENTOR:
   - Talk like someone in the user's corner who wants them to actually win in real life.
   - Be direct, firm, and down-to-earth. Use simple, conversational, everyday language. No clinical medical jargon and no fluffy spiritual clichés.
   - When a habit succeeds: Give clean, earned acknowledgment without sycophancy (e.g., "Solid consistency on morning reading. You showed up and got it done.").
   - When a habit fails or slips: Tell the unvarnished truth without insulting or mocking. Tell them exactly where they lied to themselves or set a foolish plan (e.g., "Planning 45 minutes of heavy study at 10 PM after 9 hours of work isn't a habit—it's wishful thinking. That's why you skipped it three days in a row.").

3. EXPLAIN THE "WHY" IN SIMPLE TERMS:
   - Break down the mechanics: Was the target duration unrealistic? Was it scheduled in the wrong energy window? Did they skip because they had no minimum floor for tough days?
   - Explain human behavior simply: "Willpower runs dry after 6 PM. If you don't do it before work, odds are you never will."

4. ACTION OVER EMOTION:
   - Every critique must come with an immediate, dead-simple fix: cut the time in half, shift it to morning, or enforce a strict 2-minute non-negotiable floor.
   - Emphasize discipline and systems over feelings: "Action drives motivation, not the other way around."

5. CIRCADIAN REALITY:
   - Morning: Best for deep focus, physical exertion, and tasks requiring raw self-command.
   - Afternoon: Steady work, practical execution, social tasks.
   - Evening: Low willpower, wind-down. Never schedule high-willpower or high-friction tasks here unless stripped to 5 minutes.

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
Evaluate this week's habit execution like a straight-talking mentor and trusted friend. No buttering up, no patronizing praise. Give the direct, unvarnished truth on what worked, what failed, and the simple fix.
Produce a JSON response matching the following structure:

{
  "zenithScore": {
    "overall": <number 0-100 calculated from consistency, resilience, and balance>,
    "circadianFidelity": <number 0-100 % of habits in their natural energy slot>,
    "recoveryResilience": <number 0-100 % of slips prevented from turning into second misses>,
    "balanceScore": <number 0-100 planned load vs usable day reality>,
    "levelLabel": "<'Locked In & Consistent' | 'Steady Execution' | 'Patchy Execution' | 'Overextended / Leaking Focus' | 'Failing Systems'>"
  },
  "executiveSynthesis": {
    "headline": "<A blunt, direct 1-sentence truth bomb summarizing what actually happened this week (e.g. 'Your mornings are disciplined, but evening habits are dying to wishful thinking.')>",
    "briefing": "<2-3 candid, direct sentences. Tell the straight facts: what actually worked, what failed, and the real human reason why without sugarcoating or making excuses for them.>",
    "primaryGrowthOpportunity": "<The single blunt, highest-leverage fix they need to execute right now (e.g. 'Cut your 40-minute evening workout to a 15-minute standard before you burn out completely.')>",
    "strengths": ["<Direct, earned win 1>", "<Direct, earned win 2>", "<Direct, earned win 3>"]
  },
  "frictionAutopsy": {
    "scheduleCollisions": [
      {
        "habitId": "<matching habit id>",
        "habitName": "<matching habit name>",
        "collisionType": "<'late_workday_overrun' | 'duration_fatigue' | 'energy_misalignment' | 'weekend_drift' | 'unanchored_trigger'>",
        "title": "<Blunt, clear reality check, e.g. 'Late Night Overload' or 'Ego-Driven Target Length'>",
        "description": "<Direct explanation of the trap: why this habit hit a wall and why trying harder won't solve a bad setup.>",
        "evidence": "<The cold data: e.g. 'Missed 3 of 4 planned sessions scheduled at 20:00.'>",
        "confidencePercent": <e.g., 85>,
        "suggestedAction": {
          "actionType": "<'reschedule_slot' | 'shrink_duration' | 'split_routine'>",
          "newSlot": "<'morning' | 'afternoon' | 'evening' | 'anytime'>",
          "newMinutes": <number or undefined>,
          "label": "<Clear, punchy 1-click button text, e.g. 'Shift to Morning (07:30)' or 'Cut to 15m Floor'>"
        }
      }
    ],
    "circadianZoneFriction": {
      "morning": "<'low' | 'moderate' | 'high'>",
      "afternoon": "<'low' | 'moderate' | 'high'>",
      "evening": "<'low' | 'moderate' | 'high'>"
    },
    "overallFrictionVerdict": "<1 straight-shooting verdict summarizing the biggest leak in their weekly schedule>"
  },
  "habitOptimizations": [
    {
      "habitId": "<matching habit id>",
      "habitName": "<matching habit name>",
      "currentSlot": "<current slot>",
      "recommendedSlot": "<'morning' | 'afternoon' | 'evening' | 'anytime'>",
      "isSlotOptimal": <boolean>,
      "reasoning": "<Blunt reason why this slot works or why their current setup is setting them up to fail>",
      "tieredVersions": {
        "gold": { "durationMins": <full minutes>, "label": "Full Flow", "description": "<full intended routine for when you actually have the bandwidth>" },
        "silver": { "durationMins": <half minutes>, "label": "Standard Cadence", "description": "<realistic standard routine for normal busy days>" },
        "bronzeMicro": { "durationMins": <2-5>, "label": "Non-Negotiable Floor", "description": "<the 2-minute minimum so you have zero excuse to quit on bad days>" }
      },
      "identityMotiveUpgrade": "<A grounded statement of personal identity, not a fluffy affirmation (e.g., 'I am someone who never misses two days in a row.')>"
    }
  ],
  "recoveryProtocols": [
    {
      "habitId": "<matching habit id>",
      "habitName": "<matching habit name>",
      "consecutiveMisses": <number>,
      "triggerReason": "<The honest failure point: e.g. 'Two consecutive misses caused by setting an unrealistic 30-minute block when exhausted.'>",
      "steps": [
        {
          "dayNumber": 1,
          "stepName": "The 2-Minute Floor",
          "tier": "micro",
          "targetMinutes": 2,
          "actionPrompt": "<Ultra-simple 2-minute action to show up with zero friction>",
          "mindsetGrounding": "Forget perfection right now. Showing up for 120 seconds proves you're still in the game."
        },
        {
          "dayNumber": 2,
          "stepName": "Controlled Step-Up",
          "tier": "half",
          "targetMinutes": <approx half duration>,
          "actionPrompt": "<Half-length focused session>",
          "mindsetGrounding": "Consistency is about rhythm, not heroic effort."
        },
        {
          "dayNumber": 3,
          "stepName": "Full Standard Routine",
          "tier": "full",
          "targetMinutes": <full minutes>,
          "actionPrompt": "<Full routine executed cleanly>",
          "mindsetGrounding": "You earned the right to scale back up. Lock it in."
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
  let body: DiagnosisRequest = { habits: [] };

  try {
    body = (await req.json()) as DiagnosisRequest;
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

    // 1. Exact Habit State Cache Key Construction
    const stateHash = hashHabitsState(body.habits, body.currentDayIndex, body.workingWindow);
    const exactCacheKey = `zenith:diag:${userId}:${stateHash}`;

    // 2. Exact Cache-Aside Check BEFORE rate-limiting (unlimited ~10ms Redis hits, 0 Gemini calls)
    if (!body.forceRefresh) {
      const cachedDiagnosis = await getCached<DiagnosisResult>(exactCacheKey);
      if (cachedDiagnosis) {
        cachedDiagnosis.isCached = true;
        cachedDiagnosis.isStale = false;
        // Refresh latest pointer so GET fallback stays aligned with active habits
        setCached(latestCacheKey, cachedDiagnosis, LATEST_CACHE_TTL_SECONDS).catch(() => {});
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

    // 3. Sliding-Window Rate Limiting Check (10 Gemini calls / 10 mins)
    const rateLimit = await checkDiagnosisRateLimit(userId);
    if (!rateLimit.success) {
      // Serve deterministic heuristic reflection for the exact active habits rather than stale deleted habits
      const heuristic = generateHeuristicDiagnosis(body);
      return NextResponse.json(heuristic, {
        status: 200,
        headers: {
          'x-cache': 'RATE_LIMIT_HEURISTIC_FALLBACK',
          'x-response-time-ms': String(Date.now() - startTime),
        },
      });
    }

    // 4. Cache Miss / Force Fresh -> Call Gemini AI with Automatic Offline Resilience Fallback
    let diagnosis: DiagnosisResult;
    try {
      const prompt = buildPrompt(body);
      diagnosis = await callGeminiStructured<DiagnosisResult>(prompt, SYSTEM_INSTRUCTION);
      diagnosis.modelUsed = 'Gemini 3.5 Flash-Lite';
    } catch (aiErr: any) {
      console.warn('[Diagnosis API] Gemini generation unavailable, activating Zenith Heuristic Engine:', aiErr?.message || aiErr);
      diagnosis = generateHeuristicDiagnosis(body);
    }

    // Attach metadata
    diagnosis.generatedAt = new Date().toISOString();
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
    // Never fail with 500 when habits exist; generate deterministic heuristic analysis
    try {
      if (body.habits && body.habits.length > 0) {
        const resilientFallback = generateHeuristicDiagnosis(body);
        return NextResponse.json(resilientFallback, { status: 200 });
      }
    } catch {
      // Fall through to error
    }

    return NextResponse.json(
      {
        error: err.message || 'Failed to generate AI diagnosis',
      },
      { status: 500 }
    );
  }
}
