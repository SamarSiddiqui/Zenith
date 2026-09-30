# 🧠 Zenith AI Diagnosis & Growth Engine — Technical Architecture & Implementation Guide

> **"Never blame willpower when the schedule is the true point of friction."**  
> This document details every minor logic, mathematical formula, behavioral economics prompt design, caching layer, and 1-click execution action powering Zenith's **AI-Powered Circadian Diagnosis & Growth Hub (`/diagnosis`)**.

---

## 1. System Architecture & Data Flow

Zenith replaces generic chatbot advice with a **Circadian Performance Strategist** powered by Google **Gemini 3.5 Flash-Lite**.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       Zenith Live Context Ingestion                                    │
│  • Active Habits (Name, Target Minutes, Category, Circadian Slot, Micro-Version, Health Score)         │
│  • Weekly History & Status Logs ([unlogged, completed, missed] across 1–15 Day Horizons)              │
│  • Working Window Parameters (Start: 10:00, End: 19:00, Timezone, Active Days)                         │
│  • Sprint Session Horizon (Duration, Current Day Index, Goal)                                          │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               Server Route: POST /api/diagnosis                                        │
│  • Endpoint: Google Generative Language v1beta REST API (Native Fetch — Zero npm dependencies)         │
│  • Model Pipeline: gemini-3.5-flash-lite ──(fallback)──► gemini-3.8-flash ──► gemini-flash-lite-latest  │
│  • Configuration: responseMimeType: "application/json", temperature: 0.25                             │
│  • System Instruction: Circadian Behavioral Scientist & Anti-Guilt Habit Strategist                   │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                Client State & Caching: useDiagnosis.ts                                 │
│  • Smart 4-Hour localStorage TTL Cache (zenith_diagnosis_cache_<userId>)                               │
│  • Session Applied-State Tracker (zenith_diagnosis_applied_actions)                                    │
│  • Cross-App Synchronizer (zenith_habits_sync CustomEvent)                                             │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              Diagnosis Hub Flagship UI (/diagnosis)                                    │
│  ┌──────────────────────────────────────────────┐  ┌────────────────────────────────────────────────┐  │
│  │ 🌟 1. Zenith Growth Radar (Index: 0–100)     │  │ ⚡ 2. Friction vs. Willpower Autopsy           │  │
│  │    • Circadian Fidelity Arc + Sub-Metrics    │  │    • Schedule Overrun Collision Matrix         │  │
│  │    • Gemini Executive Mindful Briefing       │  │    • Circadian Zone Heat Pills (M/A/E)         │  │
│  │    • Primary Growth Opportunity Callout      │  │    • 1-Click Slot & Duration Re-Anchoring      │  │
│  └──────────────────────────────────────────────┘  └────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  ┌────────────────────────────────────────────────┐  │
│  │ 🧬 3. Gemini Habit Laboratory                │  │ 🎯 4. 3-Day Step-Up Recovery Protocol          │  │
│  │    • 3-Tier Scaler (Gold / Silver / Bronze)  │  │    • Day 1 Micro-Spark ➔ Day 2 Half ➔ Day 3 Full│  │
│  │    • 1-Click Micro-Fallback Saver            │  │    • 1-Click Active Sprint Protocol Injector   │  │
│  │    • Identity Motive Reframing Statement     │  │    • Self-Trust Restoration Ramp               │  │
│  └──────────────────────────────────────────────┘  └────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Direct Gemini REST Client (`lib/gemini/client.ts`)

- **File:** [`lib/gemini/client.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/lib/gemini/client.ts)
- **Zero npm Dependency Philosophy:** Uses native `fetch` built into Next.js/Node to eliminate dependency bloat and version mismatches.

### Execution & Fallback Cascade:
1. Targets `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`.
2. If the primary model encounters a temporary rate limit or regional status, it automatically cascades through candidate models:
   ```ts
   const candidateModels = [
     'gemini-3.5-flash-lite',   // Ultra-fast, cost-effective primary
     'gemini-3.8-flash',        // High-capability fallback
     'gemini-flash-lite-latest' // Rolling alias fallback
   ];
   ```
3. Enforces structured JSON output:
   ```json
   {
     "generationConfig": {
       "responseMimeType": "application/json",
       "temperature": 0.25,
       "topP": 0.95,
       "maxOutputTokens": 8192
     }
   }
   ```
4. Parses raw candidate text into strongly typed TypeScript objects (`DiagnosisResult`).

---

## 3. Behavioral Economics Prompt Engine (`app/api/diagnosis/route.ts`)

- **File:** [`app/api/diagnosis/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/diagnosis/route.ts)

### Core Prompting Principles:
1. **Never Blame Willpower:** Habit misses are treated as environmental collisions (workday overruns, duration overload, energy misalignments).
2. **"Shrink, Don't Skip" Validation:** Celebrates 2–5 minute fallback versions as high-value identity preservers.
3. **Contextual Token Slicing:** Passes each habit's complete metadata:
   - Name, Category, Circadian Slot, Target Minutes, Micro-Version, Identity Motive, Health Score.
   - Status array for the active sprint horizon (`week.slice(0, sprintDuration)`).
   - Boolean flag indicating if the habit suffered 2 consecutive misses leading into today.

---

## 4. TypeScript Contracts (`types/diagnosis.ts`)

- **File:** [`types/diagnosis.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/types/diagnosis.ts)

```typescript
export interface ZenithScore {
  overall: number;              // 0–100 Personal Zenith Index
  circadianFidelity: number;    // % executed in biological rhythm
  recoveryResilience: number;   // % 48-hour bounce-back success
  balanceScore: number;         // Planned habit load vs usable window reality
  levelLabel: string;           // "Peak Flow" | "Ascending Momentum" | "Compressed Horizon"
}

export interface ExecutiveSynthesis {
  headline: string;
  briefing: string;
  primaryGrowthOpportunity: string;
  strengths: string[];
}

export interface ScheduleCollision {
  habitId: string;
  habitName: string;
  collisionType: 'late_workday_overrun' | 'duration_fatigue' | 'energy_misalignment' | 'weekend_drift' | 'unanchored_trigger';
  title: string;
  description: string;
  evidence: string;
  confidencePercent: number;
  suggestedAction: {
    actionType: 'reschedule_slot' | 'shrink_duration' | 'split_routine';
    newSlot?: CircadianSlot;
    newMinutes?: number;
    label: string;
  };
}

export interface HabitOptimization {
  habitId: string;
  habitName: string;
  currentSlot: string;
  recommendedSlot: CircadianSlot;
  isSlotOptimal: boolean;
  reasoning: string;
  tieredVersions: {
    gold: { durationMins: number; label: string; description: string };
    silver: { durationMins: number; label: string; description: string };
    bronzeMicro: { durationMins: number; label: string; description: string };
  };
  identityMotiveUpgrade: string;
}

export interface RecoveryProtocol {
  habitId: string;
  habitName: string;
  consecutiveMisses: number;
  triggerReason: string;
  steps: Array<{
    dayNumber: number;
    stepName: string;
    tier: 'micro' | 'half' | 'full';
    targetMinutes: number;
    actionPrompt: string;
    mindsetGrounding: string;
  }>;
}
```

---

## 5. Client State, Caching & 1-Click Action Handlers (`hooks/useDiagnosis.ts`)

- **File:** [`hooks/useDiagnosis.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/hooks/useDiagnosis.ts)

### 1. Smart 4-Hour `localStorage` Cache:
- Cache key: `zenith_diagnosis_cache_<userId>`
- TTL: 4 Hours (`4 * 60 * 60 * 1000` ms)
- Behavior: When navigating to `/diagnosis`, cached insights load in **0ms** without API network lag or token waste.
- Re-analysis: Clicking **`[ 🔄 Re-Analyze with Gemini ]`** bypasses the cache and forces fresh generation.

### 2. Session Applied-State Tracking:
- Tracks applied action keys (e.g. `slot_123_morning`, `micro_123`, `recovery_123`) in `zenith_diagnosis_applied_actions`.
- UI buttons instantly transform to `Applied ✓` green badges upon execution.

### 3. 1-Click Action Handlers:
| Handler | Target Field | Database Operation | Cross-App Sync |
| :--- | :--- | :--- | :--- |
| `applySlotRecommendation` | `habits.circadian_slot` | Updates Supabase habit slot | Dispatches `zenith_habits_sync` |
| `applyMicroVersion` | `habits.micro_version` | Saves 3m fallback into habit profile | Dispatches `zenith_habits_sync` |
| `applyTieredDuration` | `habits.duration_minutes` | Adjusts habit target duration | Dispatches `zenith_habits_sync` |
| `applyRecoveryProtocol` | `habits.micro_version` | Injects Day 1 micro-spark into habit | Dispatches `zenith_habits_sync` |

---

## 6. The 4 Flagship UI Sections Explained

### 1. Zenith Growth Radar & Executive Synthesis
- **Files:** [`components/diagnosis/ZenithGrowthRadar.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/ZenithGrowthRadar.tsx), [`components/diagnosis/ExecutiveSynthesisCard.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/ExecutiveSynthesisCard.tsx)
- **Math Behind Circular Gauge:**
  $$\text{Circumference} = 2 \times \pi \times 56 \approx 351.85$$
  $$\text{strokeDashoffset} = \text{Circumference} \times \left(1 - \frac{\text{overall}}{100}\right)$$
- Color-Coded Tiers:
  - $\ge 80\% \rightarrow$ Sage Green (`Peak Alignment`)
  - $65\% - 79\% \rightarrow$ Warm Sand (`Active Ascendance`)
  - $< 65\% \rightarrow$ Terracotta Clay (`Compression Warning`)
- **Primary Growth Opportunity:** Surfaces the single highest-leverage adjustment with a **"View Habit Lab →"** auto-scroll anchor.

---

### 2. Schedule vs. Willpower Friction Autopsy
- **File:** [`components/diagnosis/FrictionAutopsyMatrix.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/FrictionAutopsyMatrix.tsx)
- **Circadian Energy Heat Pills:** Displays real-time friction severity (`low`, `moderate`, `high`) for *Morning*, *Afternoon*, and *Evening*.
- **Collision Breakdown:** Explains exactly why a ritual failed (e.g., *"Workout scheduled at 19:30 conflicts with average 19:15 workday end"*).
- **Direct Action Button:** 1-Click button to shift the habit to its recommended slot with live `Applied ✓` confirmation.

---

### 3. Gemini Habit Laboratory & Identity Scaler
- **File:** [`components/diagnosis/HabitLabCard.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/HabitLabCard.tsx)
- **3-Tier Horizon Model:**
  1. 🥇 **Gold (Full Routine):** Intended standard routine (e.g. 45 mins).
  2. 🥈 **Silver (Standard Flow):** 50% duration (e.g. 20 mins) — 1-click apply as active target.
  3. 🥉 **Bronze (Micro-Fallback):** 2–5 min emergency anchor — 1-click save as micro fallback.
- **Identity Statement:** Mindful re-grounding anchor (e.g. *"I am a dedicated practitioner who moves daily"*).

---

### 4. 3-Day Step-Up Recovery Protocol
- **File:** [`components/diagnosis/StepUpRecoveryCard.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/StepUpRecoveryCard.tsx)
- **Adaptive Recovery Arc:**
  - **Day 1 (Micro-Spark):** 2-minute version to reignite self-trust with zero resistance.
  - **Day 2 (Half-Power Flow):** ~50% duration to rebuild daily rhythm.
  - **Day 3 (Full Zenith Horizon):** 100% duration to completely restore baseline momentum.
- **1-Click Injector:** Updates the habit's active fallback version and syncs across web and Telegram companions.

---

## 7. Key Source Files & Responsibilities

| File | Responsibility |
| :--- | :--- |
| [`app/diagnosis/page.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/diagnosis/page.tsx) | Main page controller, sprint context provider, skeleton loader, and scroll anchors. |
| [`app/api/diagnosis/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/diagnosis/route.ts) | Server route handler executing behavioral economics prompt engineering. |
| [`lib/gemini/client.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/lib/gemini/client.ts) | Native Gemini REST client with model fallback cascade and structured JSON extraction. |
| [`hooks/useDiagnosis.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/hooks/useDiagnosis.ts) | Client hook managing 4-hour caching, applied action states, and 1-click execution triggers. |
| [`types/diagnosis.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/types/diagnosis.ts) | TypeScript interfaces for scores, collisions, optimizations, and recovery protocols. |
| [`components/Sidebar.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/Sidebar.tsx) | Navigation link to `AI Diagnosis & Growth` with `Sparkles` icon. |
| [`components/diagnosis/ZenithGrowthRadar.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/ZenithGrowthRadar.tsx) | SVG circular index gauge and sub-metric breakdown. |
| [`components/diagnosis/ExecutiveSynthesisCard.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/ExecutiveSynthesisCard.tsx) | Editorial headline, compassionate synthesis, and primary growth opportunity. |
| [`components/diagnosis/FrictionAutopsyMatrix.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/FrictionAutopsyMatrix.tsx) | Schedule collision matrix with circadian zone heat pills and 1-click re-anchors. |
| [`components/diagnosis/HabitLabCard.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/HabitLabCard.tsx) | 3-tier Gold/Silver/Bronze habit scaler and identity reframing statements. |
| [`components/diagnosis/StepUpRecoveryCard.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/diagnosis/StepUpRecoveryCard.tsx) | 3-day guided step-up recovery ramp with 1-click sprint injection. |

---
*Created for Zenith Project — Crafted with calm precision by Samar 🖤*
