# Zenith Telegram Bot — Technical Architecture & Integration Guide

This document provides a comprehensive technical overview of the Telegram Bot integration for Zenith. It outlines the end-to-end data flow, database schema, security/RLS bypass model, API endpoints, cron scheduler, and frontend state management.

---

## 1. System Overview & Architecture

The Zenith Telegram Bot functions as a bidirectional companion to the Zenith web application. It enables:
1. **Zero-Friction Deep-Link Account Linking:** Auto-detects account connections in real-time when the user presses **START** in Telegram.
2. **In-Chat Habit Tracking & Logging:** Interactive inline buttons (`[✅ Complete]` and `[⚡ Micro-Step]`) allow users to log habits in 1 click directly inside Telegram without opening the browser.
3. **On-Demand Progress Check (`/status`):** Renders today's completion rates and dynamically mounts 1-click action buttons for uncompleted rituals.
4. **Circadian End-of-Day (EOD) Cron Reminders:** Automatically scans active users and dispatches gentle digests for unlogged habits when their daily working window closes.

```
┌─────────────────────────┐          ┌──────────────────────────┐          ┌─────────────────────────┐
│     Zenith Web App      │          │   Telegram Bot Client    │          │  Vercel Cron Scheduler  │
│  (Settings & Dashboard) │          │       (User Chat)        │          │   (Hourly / Scheduled)  │
└────────────┬────────────┘          └────────────┬─────────────┘          └────────────┬────────────┘
             │                                    │                                     │
             │ 1. Generate Link Token             │ 3. /start <token>                   │ 6. Trigger EOD Cron
             │ 2. Live Polling (/status)          │ 4. /status                          │    (/api/cron/eod-reminders)
             │                                    │ 5. Inline Action Buttons            │
             ▼                                    ▼                                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  Zenith Next.js API Routes                                         │
│  • /api/telegram/link-token   • /api/telegram/webhook   • /api/telegram/status   • /api/cron/...  │
└─────────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                  │
                                                  │ SECURITY DEFINER RPCs / Service Role
                                                  ▼
                                 ┌─────────────────────────────────┐
                                 │       Supabase PostgreSQL       │
                                 │  (profiles, habits, migrations) │
                                 └─────────────────────────────────┘
```

---

## 2. Database Schema & Security Model

All database extensions and stored procedures are defined in [`supabase/migrations/05_telegram_bot_schema.sql`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/supabase/migrations/05_telegram_bot_schema.sql).

### Table Alterations (`public.profiles`)
| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `telegram_chat_id` | `VARCHAR(64)` | `NULL` | Telegram chat ID for direct message delivery |
| `telegram_username` | `VARCHAR(120)` | `NULL` | Telegram handle (without `@`) |
| `telegram_link_token` | `VARCHAR(64)` | `NULL` (Unique) | Single-use ephemeral token for deep-link authentication |
| `telegram_reminders_enabled` | `BOOLEAN` | `TRUE` | User preference toggle for EOD digest notifications |
| `telegram_eod_time` | `TIME` | `'20:00'` | Configured time for circadian window closure digest |

### RLS Bypass Model (`SECURITY DEFINER` RPCs)
When Telegram webhooks or Vercel cron jobs hit Next.js server routes, no browser session (`auth.uid()`) is present. To prevent PostgreSQL Row Level Security (RLS) from blocking unauthenticated server queries, the database implements `SECURITY DEFINER` functions:

1. `public.set_telegram_link_token(p_user_id UUID, p_link_token VARCHAR)`
   - Securely associates an ephemeral link token with the user profile.
2. `public.link_telegram_chat(p_link_token VARCHAR, p_chat_id VARCHAR, p_username VARCHAR)`
   - Consumes the single-use token, assigns `telegram_chat_id`, and enables reminders.
3. `public.get_telegram_profile(p_chat_id VARCHAR)`
   - Queries basic user info and reminder settings by chat ID.
4. `public.get_telegram_status(p_chat_id VARCHAR)`
   - Unified single-query RPC that retrieves user identity and all active habits with `weekly_history` and `micro_version`.
5. `public.record_telegram_habit_action(p_habit_id UUID, p_day_index INT, p_status VARCHAR, p_health_boost INT)`
   - Updates `habits.current_status`, boosts `health_score`, and updates the JSONB `weekly_history` array at `p_day_index`.
6. `public.get_telegram_eod_users()`
   - Returns all active users configured for Telegram reminders for the cron worker.

---

## 3. Backend API Endpoints

### 1. Webhook Handler — `POST /api/telegram/webhook`
- **File:** [`app/api/telegram/webhook/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/telegram/webhook/route.ts)
- **Functions:**
  - **Inline Button Callbacks (`done_${id}`, `micro_${id}`):**
    - Identifies target habit and sprint day index (`calculateSprintDayInfo`).
    - Executes `record_telegram_habit_action` RPC.
    - Sends Telegram callback alert toast + confirmation chat message.
  - **Command `/start [token]`:**
    - If `token` is present, executes `link_telegram_chat` and replies with a personalized welcome message.
    - If user is already linked, displays a welcome back card.
    - If unlinked, displays friendly connection instructions with user's Chat ID.
  - **Command `/status`:**
    - Invokes `get_telegram_status(chatId)`.
    - Computes today's completed vs. pending rituals.
    - Mounts interactive inline buttons (`[✅ Habit]`, `[⚡ Micro]`) for every unlogged habit.
  - **Command `/help`:**
    - Returns practical usage instructions.

### 2. Link Token Generator — `POST /api/telegram/link-token`
- **File:** [`app/api/telegram/link-token/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/telegram/link-token/route.ts)
- **Body:** `{ userId: string }`
- **Response:** `{ success: true, token: string, deepLink: "https://t.me/<bot>?start=<token>" }`

### 3. Connection Status Polling — `GET /api/telegram/status`
- **File:** [`app/api/telegram/status/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/telegram/status/route.ts)
- **Query Params:** `?userId=<UUID>`
- **Response:** `{ connected: boolean, chatId: string | null, username?: string, fullName?: string }`
- **Usage:** Used by Settings frontend to detect real-time connection without page reloads.

### 4. Webhook Auto-Registration — `POST /api/telegram/setup-webhook`
- **File:** [`app/api/telegram/setup-webhook/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/telegram/setup-webhook/route.ts)
- Registers Telegram Bot API webhook to `${NEXT_PUBLIC_APP_URL}/api/telegram/webhook`.

### 5. EOD Cron Worker — `GET|POST /api/cron/eod-reminders`
- **File:** [`app/api/cron/eod-reminders/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/cron/eod-reminders/route.ts)
- **Security:** Verifies `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
- **Workflow:**
  1. Queries all profiles with active Telegram reminders via `get_telegram_eod_users`.
  2. Resolves current sprint day index (`todayIndex`).
  3. Filters habits with `status === 'unlogged'`.
  4. Formats and sends EOD digest with 1-click action buttons via `formatEodReminder`.

### 6. Circadian Midday Micro-Nudge Worker — `GET|POST /api/cron/midday-nudge`
- **File:** [`app/api/cron/midday-nudge/route.ts`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/api/cron/midday-nudge/route.ts)
- **Security:** Verifies `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
- **Logic:**
  1. Identifies connected Telegram users with reminders active.
  2. Filters unlogged rituals for today.
  3. Selects the **single shortest quick-win ritual** (e.g. 5-minute reading or morning meditation) and surfaces its 5m fallback version.
  4. Sends an encouraging 1-habit micro-nudge with inline `[✅ Mark Completed]` and `[⚡ 5m Micro-Step]` buttons.

---

## 4. Frontend State & Settings Integration

- **File:** [`app/settings/page.tsx`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/app/settings/page.tsx)

### Key Workflows:
1. **1-Click Auto Connection:**
   - Calls `/api/telegram/link-token`.
   - Opens Telegram deep link in a new tab (`window.open(deepLink, '_blank')`).
   - Starts an interval polling `/api/telegram/status?userId=${user.id}` every 2 seconds for 60 seconds.
   - Automatically detects when user hits **START** in Telegram, populates `telegramChatId`, and transitions to the Connected UI state.
2. **Connected State & Inline Editing:**
   - Displays `Active Chat ID: <id>` with a live green indicator.
   - **Edit Button:** Toggles inline input for modifying the Chat ID manually.
   - **Disconnect Button:** Clears Telegram credentials from profile in Supabase.

---

## 5. Environment Variables & Deployment

### Required Environment Variables
```env
# Telegram Bot Credentials
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_BOT_USERNAME=ZenithHabitBot

# Application Domain
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Cron & Admin Authorization
CRON_SECRET=zenith_cron_secret_example_token
SUPABASE_SERVICE_ROLE_KEY=eyJh... (Supabase Service Role Secret)
```

### Vercel Cron Configuration (`vercel.json`)
Defined in root [`vercel.json`](file:///c:/Users/samsi/Desktop/feb-projects/Zenith/vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/cron/eod-reminders",
      "schedule": "0 15 * * *"
    },
    {
      "path": "/api/cron/midnight-rollover",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### External Scheduler Configuration ([cron-job.org](https://cron-job.org))
For flexible schedules (hourly EOD checks or midday micro-nudges):
1. **Midday Micro-Nudge:**
   - **URL:** `https://your-domain.vercel.app/api/cron/midday-nudge?secret=YOUR_CRON_SECRET`
   - **Schedule:** `0 8 * * *` (1:30 PM IST / Daytime)
2. **Hourly EOD Multi-Timezone Check:**
   - **URL:** `https://your-domain.vercel.app/api/cron/eod-reminders?secret=YOUR_CRON_SECRET`
   - **Schedule:** `0 * * * *` (Hourly)

---

## 6. Verification & Testing Checklist

- [x] **Deep Link Flow:** Click "Open Telegram Bot" in Settings $\rightarrow$ Press "Start" in Telegram $\rightarrow$ Settings auto-detects and confirms.
- [x] **Manual ID Input:** Enter numeric Chat ID in Settings $\rightarrow$ Click "Save & Link" $\rightarrow$ Profile persists in database.
- [x] **Status & In-Chat Logging:** Send `/status` in Telegram $\rightarrow$ Receive habits list $\rightarrow$ Tap `[✅ Habit]` or `[⚡ Micro]` $\rightarrow$ Habit updates to `completed` in Supabase.
- [x] **EOD Cron:** Trigger `/api/cron/eod-reminders?secret=<CRON_SECRET>` $\rightarrow$ Receives structured digest with action buttons.
