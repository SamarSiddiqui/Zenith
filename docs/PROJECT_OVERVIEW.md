# Zenith — Circadian Habit & Sprint Planner (Project Overview)

> **"Reach your personal zenith through consistent, mindful circadian habits."**  
> Zenith (written in Arabic as **زينيث**) represents the highest point or peak of accomplishment. Zenith is designed as a serene, distraction-free habit tracking and sprint horizon platform designed to help users build focus, maintain identity momentum without guilt, and cultivate long-term self-improvement.

---

## 📌 Executive Summary

**Zenith** is a production-grade full-stack web application engineered to transform habit tracking from a stressful chore into a calm, mindful ritual. Featuring clean visual hierarchy, soothing earth tones, elegant typography (`DM Serif Display` + `Inter` + monospace data tokens), and micro-animations, Zenith provides powerful tools for dynamic sprint horizon planning (1–15 day horizons), real-time Telegram bot companion integration, priority friction detection, and intelligent micro-fallbacks.

---

## 🛠️ Technology Stack & Architecture

| Layer | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Primary Language** | **TypeScript (`.ts`, `.tsx`)** | End-to-end type safety and compile-time contract validation |
| **Frontend Framework** | **Next.js 16.1.6** (React 19.2.3) | App Router, Server/Client components, optimized route handlers |
| **Database & Auth** | **Supabase PostgreSQL** | User authentication, Row Level Security (RLS), and JSONB weekly histories |
| **Styling Engine** | **Tailwind CSS v4** | Utility-first styling with `@tailwindcss/postcss` and CSS design tokens |
| **Design System Tokens** | **CSS Variables (`globals.css`)** | Custom earth-toned palette (`sage`, `sand`, `clay`, `ink`, `surface`, `canvas`) |
| **Typography** | **Google Fonts** | `DM Serif Display` (Headings), `Inter` (Body UI), `JetBrains Mono` (Data) |
| **Animations** | **Framer Motion 12** | Layout-preserving page transitions, checkmark popLayouts, spring micro-interactions |
| **Companion Bot** | **Telegram Bot API (Node.js)** | Bidirectional in-chat habit logging, quick-step buttons, and circadian cron reminders |
| **Cron Scheduling** | **Vercel Cron Jobs** | Daily midnight rollover, circadian EOD digests, and midday micro-nudges |
| **Icons** | **Lucide React** | Minimalist vector icon set |

---

## 📁 Directory & Component Architecture

```
Zenith/
├── app/                          # Next.js App Router Pages & API Endpoints
│   ├── globals.css               # Design tokens, CSS variables, typography imports
│   ├── layout.tsx                # Root layout wrapper with ZenithBot brand favicon
│   ├── page.tsx                  # Dashboard View (Sprint Horizon, Friction Radar, Today's Habits)
│   ├── habits/
│   │   └── page.tsx              # Habit Planner Hub (Dynamic sprint matrix & history)
│   ├── settings/
│   │   └── page.tsx              # User Preferences & 1-Click Telegram Bot Pairing
│   ├── login/ & register/        # Mindful Authentication Pages
│   └── api/                      # Backend API Route Handlers
│       ├── cron/                 # Midnight rollover, EOD reminders, Midday micro-nudges
│       └── telegram/             # Webhook, Link Token Generator, Connection Status Polling
│
├── components/                   # Reusable UI & Domain Components
│   ├── Layout.tsx & Sidebar.tsx  # Main shell with ZenithBot logo and mobile drawer
│   ├── dashboard/                # SprintHorizonWidget, RiskBanner, TodayHabitList, WorkingWindow
│   ├── habits/                   # DynamicSprintMatrix, HabitHeader, GenesisModal, SkipModal, CheckinModal
│   └── auth/                     # AuthLayout, OnboardingModal
│
├── hooks/                        # Custom React Hooks
│   ├── useHabits.ts              # Optimistic habit state, silent sync, and auto-rollover
│   ├── useSprint.ts              # Dynamic 1–15 day sprint horizon engine & archive snapshots
│   └── useYesterdayCheckin.ts    # Morning reconciliation workflow for yesterday's unlogged rituals
│
├── lib/                          # Services, Utilities, & Database Clients
│   ├── services/                 # habits.ts, sprintAnalytics.ts, telegram.ts
│   ├── supabase/                 # client.ts (Singleton), server.ts, env.ts
│   └── utils/                    # sprintDate.ts, telegramFormatters.ts
│
├── public/                       # Brand assets: zenithBot.webp, manifest, icons
└── docs/                         # Technical documentation & blueprints
```

---

## ⚙️ Core Modules & Capabilities

### 1. 📊 Interactive Dashboard (`app/page.tsx`)
- **Sprint Horizon Widget (`SprintHorizonWidget.tsx`)**: Live intra-day working window progression (`Today %` based on user's focus window) and macro sprint progress (`% Elapsed`) with interactive `(i)` info tooltips.
- **Priority Friction Radar (`RiskBanner.tsx`)**: "Never Miss Twice" early intervention system flagging 2-consecutive-miss rituals with 1-click **⚡ Shrink to 5 min** and **✅ Mark Completed** actions.
- **Circadian Habit List & Working Window**: Visual tracker of today's rituals and active working hours.

### 2. 🗓️ Dynamic Sprint Matrix & Planner (`app/habits/page.tsx`)
- **1–15 Day Sprint Matrix (`DynamicSprintMatrix.tsx`)**: Flexible sprint windows with `table-fixed` column stability and instant `mode="popLayout"` checkmark animations.
- **Circadian Energy Slots**: Habits organized into *Morning*, *Afternoon*, *Evening*, and *Anytime* energy buckets.
- **Deterministic Dynamic Sorting**: Sort by *Circadian Flow*, *Longest First*, *Quick Wins*, or *Health Score* with stable tiebreaking.
- **Morning Yesterday Reconciliation (`YesterdayCheckinModal.tsx`)**: Mindful check-in prompt on morning launch to review yesterday's unlogged habits before midnight rollover locks them.
- **5-Minute Micro-Fallbacks (`SkipModal.tsx`)**: "Shrink, Don't Skip" engine allowing users to log 5-minute fallback steps that award health boosts and maintain identity momentum.

### 3. 🤖 Telegram Companion Bot (`/api/telegram/*`)
- **1-Click Deep-Link Pairing**: Single-tap account linking via deep-link tokens and live status polling.
- **In-Chat Habit Tracking**: `/status` command displays today's habits with interactive inline buttons (`[✅ Complete]`, `[⚡ Micro-Step]`).
- **Circadian Cron Reminders**: Daily EOD digests (`/api/cron/eod-reminders`) and midday micro-nudges (`/api/cron/midday-nudge`) dispatched directly to Telegram.

---

## 🚀 Active Roadmap & Next Horizon: Diagnosis Engine (`/diagnosis`)

1. **Root-Cause Correlation Engine (`/diagnosis`)**: Cross-reference habit execution with working window overruns to prove schedule friction over willpower deficits.
2. **Weekly Retrospectives & Habit Autopsies**: Comprehensive analytics on consistency rates, recovery efficiency, and overcommitment scores.
3. **Step-Up Recovery Protocol (`/recovery`)**: Structured 3-day momentum rebuilders for rituals recovering from consecutive misses.

---
*Created for Zenith Project — Crafted with calm precision by Samar 🖤*
