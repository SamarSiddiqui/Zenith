# Zenith — Mindful Habit Planner (Project Overview)

> **"Reach your personal zenith through consistent, daily mindful habits."**  
> Zenith (written in Arabic as **زينيث**) represents the highest point or peak of accomplishment. Zenith is designed as a serene, distraction-free habit tracking platform designed to help users build focus, maintain daily streaks, and cultivate long-term self-improvement.

---

## 📌 Executive Summary

**Zenith** is a modern, responsive web application engineered to transform habit tracking from a stressful chore into a calm, mindful ritual. Featuring clean visual hierarchy, soothing pastel earth tones, elegant typography, and micro-animations, Zenith provides intuitive tools for weekly habit planning, progress analysis, and daily habit execution.

---

## 🛠️ Technology Stack & Languages Used

| Layer | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Primary Language** | **TypeScript (`.ts`, `.tsx`)** | Type safety, clear interface contracts, compile-time safety |
| **Frontend Framework** | **Next.js 16.1.6** (React 19.2.3) | App Router, Server/Client components, optimized routing |
| **Styling Engine** | **Tailwind CSS v4** | Modern utility-first styling with `@tailwindcss/postcss` |
| **Design System Tokens** | **CSS Theme Variables (`globals.css`)** | Custom Zenith design tokens (`zen-primary`, `zen-bg`, etc.) |
| **Typography** | **Google Fonts** | `DM Serif Display` (Headings), `Inter` (Body text) |
| **Animations** | **Framer Motion 12** | Smooth page transitions, staggered grid load, spring micro-interactions |
| **Icons** | **Lucide React** | Minimalist vector icon set |

---

## 📁 Directory & Component Architecture

```
Zenith/
├── app/                      # Next.js App Router Pages & Layouts
│   ├── globals.css           # Design tokens, custom variables, font imports
│   ├── layout.tsx            # Root HTML layout wrapper
│   ├── page.tsx              # Dashboard View (Main landing dashboard)
│   ├── habits/
│   │   └── page.tsx          # Habit Planner View (Weekly habit matrix)
│   ├── settings/
│   │   └── page.tsx          # User Settings & Preferences
│   ├── login/
│   │   └── page.tsx          # Mindful Login Page
│   └── register/
│       └── page.tsx          # Mindful Registration Page
│
├── components/               # Reusable Client Components
│   ├── Layout.tsx            # Main shell with responsive sidebar integration
│   ├── Sidebar.tsx           # Fixed desktop navigation / Slide-over mobile drawer
│   ├── PageTransition.tsx    # Motion wrapper for page transitions
│   ├── StatCard.tsx          # Analytics widget card with trends & icons
│   ├── StatusCircle.tsx      # Tri-state interactive habit status button
│   └── HabitGrid.tsx         # Weekly habits matrix with inline status toggles
│
├── docs/                     # Project Documentation
│   └── PROJECT_OVERVIEW.md   # Complete technical overview & roadmap
│
├── public/                   # Static assets & favicon
├── package.json              # Project dependencies & scripts
└── tsconfig.json             # TypeScript config
```

---

## ⚙️ Core Code Components & Features

### 1. 📊 Interactive Dashboard (`app/page.tsx`)
- **Dynamic Time Greeting**: Automatically calculates time of day (`Good morning`, `Good afternoon`, `Good evening`).
- **Performance Stat Cards (`StatCard.tsx`)**: Displays Total Habits (6), Completion Rate (50%), Current Streak (12 days), and Weekly Rate (78%).
- **Today's Focus Section**: Displays today's scheduled habits with live status indicators and quick-completion states.

### 2. 🗓️ Weekly Habit Matrix & Planner (`app/habits/page.tsx`, `HabitGrid.tsx`)
- **7-Day Dynamic Calendar Grid**: Shows habit completion across the current week with date navigation (`Prev Week` / `Next Week`).
- **Tri-State Habit Statuses (`StatusCircle.tsx`)**:
  - 🟢 **Completed** (`bg-zen-primary` - `#8BA888` Sage Green)
  - 🔴 **Missed** (`bg-zen-missed` - `#C4756E` Soft Terracotta)
  - ⚪ **Unlogged** (`transparent` border - Light Slate)
- **Inline Habit Creation**: Dynamic creation of new habits with instant client state updating.

### 3. 🎨 Serene Design System (`app/globals.css`)
- **Palette**: Earth-toned pastel scheme featuring `#F7F6F3` (Warm Background), `#FFFFFF` (Surface), `#EDEAE5` (Sidebar), `#8BA888` (Primary Sage), and `#3D3D3D` (Charcoal Text).
- **Typography Hierarchy**: Classical serif headers (`DM Serif Display`) paired with clean sans-serif UI font (`Inter`).

### 4. ⚙️ User Settings (`app/settings/page.tsx`)
- Configurable display name, email, start-of-week preference (Sunday/Monday), and daily reminder timers.

---

## 🚀 Roadmap & Next Steps for Feature Building

1. **Persisted Database Integration**: Connect PostgreSQL / Supabase or Prisma to save habits, logs, and user sessions.
2. **Advanced Analytics & Heatmaps**: Add GitHub-style 365-day habit heatmaps and weekly completion charts.
3. **Habit Categories & Tagging**: Enable categorization (Mindfulness, Health, Productivity, Fitness) with custom color badges.
4. **Dark Mode & Theme Switching**: Implement a dark serene theme mode.
5. **Habit Streaks & Milestone Rewards**: Celebrate habit milestones with subtle particle animations and streak protection tools.

---
*Created for Zenith Project — Developed by Samar 🖤*
