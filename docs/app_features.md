# 🏛️ Zenith — In-App Feature Specification & Implementation Plan

> **"Build habits that survive real life. Planned around your usable hours, not artificial 24-hour days."**  
> This document details the exact feature requirements, user flows, UI specifications, and phased implementation roadmap for the internal **Zenith** application, directly fulfilling the core promises established in the pre-login landing page and architectural blueprints.

---

## 🎯 1. Core Architectural Pillars

Zenith breaks away from traditional reactive habit trackers (*Create → Track → Break → Reset to 0 → Abandon*) by building a proactive, schedule-aware engine:

| Traditional Trackers | Zenith Consistency Engine |
| :--- | :--- |
| **Artificial 24-Hour Day**: Assumes an empty canvas; induces guilt at 11:59 PM. | **Usable Working Window**: Maps habits into realistic gaps between work, commute, and rest. |
| **Fragile Binary Streaks**: 1 missed day erases 18 days of evidence back to zero. | **Habit Health Index (0–100%)**: Multi-variable weighted curve with decay and gradual recovery. |
| **Post-Mortem Notifications**: Alerts you after you've already failed. | **Proactive 2-Day Early Warning**: Intervenes on slip #2 while recovery still takes one easy step. |
| **All-or-Nothing Execution**: Forces full 45-min routine or marks a failure. | **"Shrink, Don't Skip" Fallbacks**: Auto-scales to 2-min or 5-min micro-sessions during crunches. |
| **Blind Willpower Blame**: Tells you you weren't disciplined enough. | **Schedule Root-Cause Diagnosis**: Cross-references timestamps to prove contextual schedule conflicts. |

---

## 📱 2. In-App Feature Breakdown by Section

```
Zenith Application Architecture
├── 1. Dashboard (/dashboard) ───────────▶ Today's Usable Window, Health Pulse, Risk Banners
├── 2. Habits Hub (/habits) ─────────────▶ Weekly Grid, Quick-Log, "Shrink" Fallbacks, Skip Diagnosis
├── 3. Diagnosis Engine (/diagnosis) ────▶ Weekly Retrospective, Correlation Engine, Habit Autopsies
├── 4. Recovery Mode (/recovery) ────────▶ 3-Day Step-Up Protocol, Health Restoration, Pacer
├── 5. Evening Focus Organizer ──────────▶ 30-Min Timed Launcher, Frictionless Night Routine
└── 6. Settings & Schedule (/settings) ──▶ Working Hours, Core Commitments, Calendar Awareness
```

---

### Section 1: Dashboard (`/dashboard`) — The Usable Window & Daily Pulse
*The user's daily command center. Replaces overwhelming task lists with situational schedule awareness.*

#### Core Features:
1. **Dynamic Working Window Banner**:
   - Live visual calculation of today's usable remaining time (e.g. `Usable Evening: 2h 15m remaining`).
   - Visual timeline displaying active work hours (`09:00 - 18:30`), meeting overruns, and open habit slots.
   - Status indicator chip: `Optimal Window`, `Compressed Window`, or `Late Workday Overrun`.

2. **Proactive 2-Day Risk Banner**:
   - Dynamic alert that surfaces only when a habit misses 2 consecutive days.
   - Contextual callout: *"Workout at risk — 2 consecutive misses after late 20:30 finishes."*
   - Direct 1-click action triggers: `[ Shrink to 15-Min ]` or `[ Enter Recovery Mode ]`.

3. **Holistic Health & Consistency Metrics**:
   - **Median Habit Health Ring** (`0–100%`) with color-coded health states (*Sage = 80-100%, Amber = 65-79%, Clay = <65%*).
   - **Today's Completion Progress Bar** (`4 of 6 Completed`).
   - **30-Day Sparkbars**: Daily habit execution bars with color-coded overrun markers (`5 of 5 dips followed a 7 PM finish`).
   - **Recovery Count vs. Restart Count** metric chip.

4. **Today's Habit Checklist with Schedule Anchors**:
   - Habits organized by time-of-day slots: *Morning Peak*, *Midday Reset*, *Evening Wind-Down*.
   - Each habit card displays: Target duration, preferred window time, current health score badge, and 1-tap complete.

---

### Section 2: Habits Hub & Weekly Matrix (`/habits`) — Active Tracking & Micro-Fallbacks
*The execution workspace. Enables seamless logging, schedule-gap previews, and intelligent fallbacks.*

#### Core Features:
1. **7-Day Interactive Habit Matrix**:
   - Clean 7-day row matrix showing completion states: `Completed (✓)`, `Missed (✗)`, `Shrunk/Micro (⚡)`, `Deferred (→)`.
   - 1-click cycling with smooth optimistic state updates.
   - Week navigation (`Previous Week`, `This Week`, `Next Week`).

2. **1-Tap "Why Did You Skip?" Diagnostic Modal**:
   - When a habit is marked missed, a frictionless 1-tap overlay prompts:
     > *"What got in the way today?"*  
     > `[ Work Overrun ]` `[ Too Exhausted ]` `[ Schedule Squeeze ]` `[ Forgot ]` `[ Travel/Event ]` `[ Habit Too Long ]`
   - Logs contextual metadata used by the correlation diagnosis engine.

3. **"Shrink, Don't Skip" Micro-Action Trigger**:
   - Toggle button on every habit card to scale into fallback mode:
     - *Reading (30m)* → *Micro-Read (5m)*
     - *Workout (45m)* → *Mobility Stretch (10m)*
     - *Meditation (15m)* → *2-Min Breath Reset*
   - Logs as `Shrunk` — awards 85% health preservation with zero streak reset guilt.

4. **Create / Edit Habit Drawer with Schedule Mapping**:
   - Name, icon, and identity-based motive (*e.g., "I am becoming a consistent reader"*).
   - Full duration vs. Fallback micro-duration settings.
   - Preferred time window anchor (*Morning, Afternoon, Evening gap*).
   - Minimum weekly frequency (*e.g. 4x/week vs 7x/week*).

---

### Section 3: Diagnosis & Intelligence Engine (`/diagnosis`) — Root Cause & Retrospectives
*The analytics core. Proves that consistency dips stem from schedule collisions, not weak willpower.*

#### Core Features:
1. **Weekly Retrospective Diagnosis**:
   - Four high-level diagnostic dimensions:
     - **Consistency Score**: Overall execution fidelity over the last 7 and 30 days.
     - **Recovery Rate**: Ratio of slips recovered within 48 hours vs abandoned.
     - **Overcommitment Level**: Difference between planned habit minutes vs usable evening minutes.
     - **Timing Mismatch Index**: Percentage of habits forced outside optimal energy windows.

2. **Schedule-Tied Correlation Engine**:
   - Interactive root-cause cards pinpointing exact triggers:
     - *"73% of missed workouts occurred on days working past 19:00."*
     - *"81% of skipped reading sessions correlated with workdays > 9.5 hours."*
   - Visual correlation chart: Workday End Time vs Habit Completion Rate.

3. **Habit Autopsy Flow (For Abandoned or Chronic-Slip Habits)**:
   - When a habit's health drops below 50% for 2 weeks, an optional **Autopsy Card** activates:
     - Analyzes active lifespan, total completion %, and primary failure reasons.
     - Actionable AI recommendation: `[ Downscale Frequency: 5x/wk → 3x/wk ]` or `[ Shift Window: Evening → Morning ]`.

---

### Section 4: Adaptive Recovery Mode (`/recovery`) — 3-Day Step-Up Protocol
*The rehabilitation sanctuary. Prevents the post-miss abandonment spiral.*

#### Core Features:
1. **3-Day Step-Up Protocol**:
   - Replaces all-or-nothing restarts with a structured, low-friction ramp:
     - **Day 1 (Micro Step)**: 5-minute micro-habit execution.
     - **Day 2 (Half Step)**: 10-minute moderate execution.
     - **Day 3 (Full Habit)**: Full baseline routine restored.
   - Visual step progress track with interactive check-in buttons.

2. **Interactive Breathing & Focus Pacer**:
   - Built-in minimalist breathing pacer (4s Inhale, 4s Hold, 4s Exhale) to ground the user before restarting.
   - Live timer with soothing audio/haptic pulse option.

3. **Health Restoration Simulator**:
   - Visual gauge showing habit health climbing from `54% (At Risk)` → `88% (Healthy)` upon completing the 3-day recovery protocol.

---

### Section 5: Evening Focus Organizer & 30-Min Focus Launcher
*The end-of-day zero-friction finisher. Activates automatically in the evening.*

#### Core Features:
1. **Time-Sensitive Evening Prompt (Triggered after 19:30)**:
   - Scans remaining habits and compares against remaining usable evening minutes.
   - Summarizes evening load: *"You have 3 habits remaining (30 mins total) — 2h 15m left in your evening window."*

2. **1-Click "Finish Evening in 30 Mins" Timed Focus Launcher**:
   - Sequential full-screen or focused card flow executing remaining habits in a timed queue:
     - *15 min Reading* ──▶ *10 min Meditation* ──▶ *5 min Journaling*
   - Built-in countdown timer, serene background audio ambient mode, and 1-tap completion.

3. **Intelligent Dynamic Re-planner**:
   - If user starts evening late (e.g. 22:15), 1-tap `[ Quick Compress ]` shrinks all remaining habits to 2-min micro-versions with zero guilt.

---

### Section 6: Settings & Working Window Architecture (`/settings`)
*The schedule configuration hub.*

#### Core Features:
1. **Working Hours & Usable Window Configuration**:
   - Start of day, Workday start time, Workday end time, Bedtime.
   - Weekday vs. Weekend custom schedule profiles.
   - Commute / buffer duration settings.

2. **Calendar Awareness & Sync (Mock / ICS Integration)**:
   - Connect or mock external calendar integration (Google Calendar, Outlook).
   - Auto-detect calendar events that overrun core working hours to trigger adaptive window warnings.

3. **Identity & Core Motives Customizer**:
   - Edit personal identity anchor statements (*"Who am I building these habits for?"*).
   - Export / Backup habit logs and schedule data (JSON/CSV, offline-first).

---

## 🏗️ 3. Phased Implementation Roadmap

### Phase 1: Dashboard Usable Window & Live Health Data Layer
- [ ] Connect shared habit state store (`zenithStore` / React Context / Zustand) across all pages.
- [ ] Implement live Working Window timeline calculations on `/dashboard` with dynamic time remaining.
- [ ] Wire interactive 2-Day Risk Banner with 1-click fallback and recovery triggers.

### Phase 2: Habits Hub Weekly Matrix & "Shrink, Don't Skip" Modal
- [ ] Build interactive 7-Day matrix in `/habits` with status cycling (`Done`, `Missed`, `Shrunk`, `Deferred`).
- [ ] Implement 1-Tap "Why Did You Skip?" diagnostic modal with contextual reason logging.
- [ ] Add Habit Creator / Editor drawer with schedule gap slotting and fallback duration settings.

### Phase 3: Diagnosis Engine, Correlation Charts & Autopsy Flow
- [ ] Upgrade `/diagnosis` with live Weekly Retrospective scorecards (Consistency, Recovery, Overcommitment, Timing).
- [ ] Build interactive Workday End Time vs Slip Correlation Chart.
- [ ] Implement Habit Autopsy dialog for chronic-slip habits with 1-click frequency/window adjustments.

### Phase 4: Full Recovery Mode 3-Day Protocol & Breathing Pacer
- [ ] Implement interactive 3-Day Step-Up task completion tracker in `/recovery`.
- [ ] Wire health score restoration math reflecting recovery completion back to the main dashboard.
- [ ] Polish Breathing Pacer with audio cue toggles and serene micro-animations.

### Phase 5: Evening Organizer Focus Launcher & Settings Polish
- [ ] Build Evening 30-min Focus Queue Launcher modal with sequential timers.
- [ ] Upgrade `/settings` with custom Working Window configurations, weekend profiles, and calendar sync mock.
- [ ] Comprehensive end-to-end verification, type checks (`npx tsc --noEmit`), and build test.

---

*Document prepared for Zenith Behavioral Consistency System · Feat/App-Features*
