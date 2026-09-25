# Zenith Habit & Sprint Planner — Technical Architecture & Feature Guide

This document provides a comprehensive technical overview of the **Zenith Habit Planner** (`/habits`). It covers the dynamic sprint matrix, circadian energy slot categorization, sorting algorithms, midnight auto-rollover engine, micro-fallbacks, and historical week archives.

---

## 1. Core Architecture & Philosophy

The Zenith Habit Planner replaces traditional rigid streak trackers with **adaptive circadian sprint horizons**. Rather than punishing missed days, Zenith uses weighted recency momentum, 5-minute micro-fallbacks, and natural circadian work-window alignment.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Zenith Habit Planner                                   │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │ Circadian Slot Energy │  │ Dynamic Sort Organizer  │  │  Sprint Horizon Controls  │ │
│  │ (Morning/Afternoon...)│  │ (Longest/Quick Wins...) │  │  (1-15 Day Sprints / Wk)  │ │
│  └───────────────────────┘  └─────────────────────────┘  └───────────────────────────┘ │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             Dynamic Sprint Matrix Table                                │
│  • Mindful Rituals (Interactive Sort Header)                                           │
│  • Daily Matrix Cells: [⏳ Unlogged] ──► [✅ Completed] ──► [❌ Missed]               │
│  • Micro-Fallback Recovery (⚡ 5m micro-step saves identity momentum)                   │
│  • Midnight Auto-Rollover: Past unlogged days automatically turn to ❌ Missed          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Major Features & Technical Specifications

### A. Dynamic Sprint Matrix Table (`DynamicSprintMatrix.tsx`)
- **File:** [`components/habits/DynamicSprintMatrix.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/habits/DynamicSprintMatrix.tsx)
- **Dynamic Horizons:** Supports 1 to 15-day sprint windows (defaulting to a 7-day Monday–Sunday sprint).
- **Daily State Toggle Flow:** Clicking any day cell cycles status:
  $$\text{Unlogged (⏳)} \longrightarrow \text{Completed (✅)} \longrightarrow \text{Missed (❌)} \longrightarrow \text{Unlogged (⏳)}$$
- **Visual Today Indicator:** Real-time pulse indicator highlighting today’s active column (`day.isToday`).
- **Sprint Health Metric:** Shows percentage show-up rate per ritual and an aggregate sprint show-up score.

---

### B. Circadian Slot Categorization & Filtering
Habits are anchored to biological circadian energy windows:
| Circadian Slot | Energy State | Color Tone | Best For |
| :--- | :--- | :--- | :--- |
| **Morning** | High cognitive energy | Amber | Deep focus, meditation, cold exposure, planning |
| **Afternoon** | Steady execution | Sky | Writing, meetings, physical training, crafting |
| **Evening** | Wind-down & reflection | Indigo | Reading, journaling, gentle mobility, sleep prep |
| **Anytime** | Flexible background | Zinc | Hydration, step counts, posture checks |

**Slot Filter Tabs:**
- Located in the organizer bar above the matrix table.
- Filter buttons: `All Slots`, `Morning`, `Afternoon`, `Evening`.
- Active filter highlights with a sage green pill and immediately filters the matrix in real-time.

---

### C. Dynamic Sorting Engine
Users can sort rituals with one click via the organizer bar or by clicking the **"Mindful Ritual"** column header:
1. **`Circadian Flow` (Default):** Orders habits by biological time (*Morning $\rightarrow$ Afternoon $\rightarrow$ Evening $\rightarrow$ Anytime*).
2. **`Longest First (▼)`:** Sorts habits by duration descending (e.g., 60m $\rightarrow$ 45m $\rightarrow$ 20m) for deep work prioritization.
3. **`Quick Wins (▲)`:** Sorts habits by duration ascending (e.g., 5m $\rightarrow$ 15m $\rightarrow$ 30m) for rapid momentum building.
4. **`Health Score (▼)`:** Sorts habits by highest consistency and health percentage.

---

### D. Morning Yesterday Reconciliation & Rollover Engine

Zenith uses a user-empowering, mindful approach to overnight habits rather than prematurely penalizing users:

#### 1. Morning Reconciliation Modal (`YesterdayCheckinModal.tsx` & `useYesterdayCheckin.ts`)
- **Files:** [`components/habits/YesterdayCheckinModal.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/habits/YesterdayCheckinModal.tsx), [`hooks/useYesterdayCheckin.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/hooks/useYesterdayCheckin.ts)
- **Workflow:**
  - On morning launch, if yesterday's sprint index has unlogged habits, Zenith opens a gentle reconciliation prompt (*"How did yesterday go?"*).
  - **Quick Batch Actions:** `[✅ Mark All Done]` or `[❌ Mark All Missed]` in 1 click.
  - **Individual 1-by-1 Checks:** Direct toggle buttons (`[✅ Done]` vs `[❌ Missed]`) for each unlogged habit without micro-step interruptions.
  - **Frequency:** Triggered once per calendar day (tracked via `zenith_last_yesterday_checkin_date` in localStorage).
  - **Resolution:** Batch-updates Supabase in real-time and recalculates momentum scores.

#### 2. Server-Side Midnight Cron Worker (`/api/cron/midnight-rollover`)
- **File:** [`app/api/cron/midnight-rollover/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/cron/midnight-rollover/route.ts)
- **Schedule:** `0 0 * * *` (midnight UTC) in [`vercel.json`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/vercel.json).
- **Function:** Scans database records and bulk-updates unlogged past days to `'missed'`.

---

### E. Micro-Fallbacks & 1-Click Recovery (`SkipModal.tsx`)
- **File:** [`components/habits/SkipModal.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/habits/SkipModal.tsx)
- When a habit is marked as missed or when time is scarce, Zenith prompts with the **5-Minute Micro-Fallback** (e.g. *"Read 1 page instead of 30 mins"* or *"Do 5 pushups instead of gym"*).
- Tapping **"⚡ Log Micro-Step"** saves the day as completed and awards a health boost, preserving 100% of identity momentum.

---

### F. Historical Calendar Sprints & Retrospectives (`PastSprintsDrawer.tsx`)
- **File:** [`components/habits/PastSprintsDrawer.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/habits/PastSprintsDrawer.tsx)
- **Week Navigation:** Header arrows ($\leftarrow$ `Week N` $\rightarrow$) allow navigating back to any past calendar week.
- **Snapshot Storage:** Archived sprint data is loaded from Supabase (`past_sprints` table) with immutable weekly snapshots.
- **Sprint Completed Retrospective Modal:** Shows comprehensive breakdown (Total completions, average health, best category, and micro-recovery rate).

---

### G. Telegram In-Chat Habit Sync
- **Webhook:** [`app/api/telegram/webhook/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/telegram/webhook/route.ts)
- Sending `/status` in Telegram displays today's habits with direct inline action buttons (`[✅ Complete]`, `[⚡ Micro-Step]`).
- Tapping buttons updates the database in real-time and reflects on the web Habit Planner immediately.

---

### H. Dashboard Priority Friction Radar (`RiskBanner.tsx`)
- **File:** [`components/dashboard/RiskBanner.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/dashboard/RiskBanner.tsx)
- **Philosophy ("Never Miss Twice"):** 1 miss is an accident; 2 misses in a row starts a negative habit loop. The Friction Radar only flags habits that were missed for 2 consecutive days leading into today (yesterday and the day before yesterday).
- **Trigger Condition:**
  $$\text{habit.week}[d - 1] == \text{'missed'} \quad \text{AND} \quad \text{habit.week}[d - 2] == \text{'missed'}$$
- **Focused 2-Action Interface:**
  1. ⚡ **`Shrink to 5 min`** — Instantly locks today as a 5-minute micro-fallback (`logMicroStep`), maintaining identity momentum with minimal willpower.
  2. ✅ **`Mark as Completed`** — Direct 1-click completion for today (`toggleStatus`).
- **Auto-Dismiss:** Stays hidden when all habits are on track or after being resolved for today.

---

## 3. Key Source Files & Responsibilities

| File | Purpose |
| :--- | :--- |
| [`app/habits/page.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/habits/page.tsx) | Main Habit Planner controller, search/slot filtering, sorting pipeline, and modal orchestrator. |
| [`components/dashboard/RiskBanner.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/dashboard/RiskBanner.tsx) | Priority Friction Radar for 2-consecutive-miss detection with 5-min shrink & mark complete actions. |
| [`components/habits/DynamicSprintMatrix.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/habits/DynamicSprintMatrix.tsx) | Sprint horizon matrix table, interactive sort header, slot tabs, and day cell toggles. |
| [`components/habits/HabitHeader.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/components/habits/HabitHeader.tsx) | Habit header, aggregate stats (Today's Rituals, Avg Health), sprint navigation, and search input. |
| [`hooks/useHabits.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/hooks/useHabits.ts) | Habit state management, optimistic status cycling, and auto-rollover on fetch. |
| [`lib/services/habits.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/lib/services/habits.ts) | CRUD Supabase operations, `calculateHabitHealth` momentum algorithm, and `rolloverPastUnloggedDays`. |
| [`lib/utils/sprintDate.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/lib/utils/sprintDate.ts) | Sprint date calculations, week numbers, day indices, and localized date formatting. |
| [`app/api/cron/midnight-rollover/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/cron/midnight-rollover/route.ts) | Midnight background worker for converting past unlogged habits to missed. |
| [`vercel.json`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/vercel.json) | Cron scheduler configuration for EOD reminders and midnight rollover. |
