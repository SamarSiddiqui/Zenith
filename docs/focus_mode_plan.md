# Zenith Philosopher Focus Sanctuary & Forest Garden Plan

## 1. Vision & Architecture Overview
An immersive, distraction-free **Deep Work & Focus Sanctuary** located at `/focus`, inspired by historical thinkers, cognitive science, and organic growth mechanics (Forest/Bonsai progression).

```
   ┌─────────────────────────────────────────────────────────────┐
   │                  ZENITH FOCUS SANCTUARY                     │
   │                                                             │
   │  [ Philosopher Archetype Modes ]                           │
   │  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
   │  │ Marcus Aurelius│ │ Cal Newport   │ │ Francesco Cirillo │  │
   │  │ Stoic Presence │ │ Deep Work 90m │ │ Classic Pomodoro  │  │
   │  └───────────────┘ └───────────────┘ └───────────────────┘  │
   │                                                             │
   │               ╭─────────────────────────╮                   │
   │               │   Living Forest Canvas  │                   │
   │               │       🌱 ➔ 🌿 ➔ 🌳       │                   │
   │               │         24:59           │                   │
   │               │   "Confine yourself to  │                   │
   │               │     the present."       │                   │
   │               ╰─────────────────────────╯                   │
   │                                                             │
   │   [ Link Zenith Habit ]   [ Ambient Sound: Rain/Forest ]    │
   │   [ Fullscreen Zen Mode ] [ Floating Mini-Widget Sync ]    │
   └─────────────────────────────────────────────────────────────┘
```

---

## 2. Philosopher Archetypes & Focus Protocols

| Archetype | Focus Protocol | Interval Config | Philosophical Essence & Dynamic Quotes |
| :--- | :--- | :--- | :--- |
| **Marcus Aurelius** *(The Stoic Emperor)* | Stoic Monotasking | 50m Focus / 10m Reflection | *"You have power over your mind - not outside events. Realize this, and you will find strength."* |
| **Cal Newport** *(Deep Work Monk)* | High-Impact Depth | 90m Focus / 20m Walk | *"To produce at your peak level you need to work for extended periods with full concentration on a single task."* |
| **Francesco Cirillo** *(Pomodoro Master)* | Agile Rhythm | 25m Focus / 5m Rest (4 Cycles) | *"One task, one interval. Eliminate the tyranny of time by befriending the clock."* |
| **Ultradian Rhythm** *(Peak Biology)* | Circadian Energy Wave | 90m Peak / 15m Reset | Aligned with natural human biological energy rhythms for sustainable high cognitive throughput. |
| **Custom Zen** *(Personal Flow)* | Flexible Sandbox | 1 to 180 mins | User-defined custom duration and intentions. |

---

## 3. Key Feature Modules

### A. Dynamic Forest & Bonsai Growth Engine
- **Visual Growth Stages**: Seedling (0-25%) $\rightarrow$ Sprout (25-50%) $\rightarrow$ Sapling (50-75%) $\rightarrow$ Full Blooming Oak / Bonsai (100%).
- **Interactive Grove**: Every completed session plants a tree in your **Daily Zen Grove** with total focused minutes logged.
- **Quit Protection**: If a user exits before 80% completion, the tree withers to encourage discipline.

### B. Ambient Audio Engine (Zero-External Dependency)
- Built-in Web Audio API synthesizers for:
  - 🌧️ **Gentle Rain & Lo-Fi Drizzle**
  - 🌲 **Forest Wind & Rustling Leaves**
  - 🌊 **Deep Ocean Brown Noise**
  - 🧠 **432Hz Alpha Waves (Cognitive Flow)**

### C. Zenith Habit Integration
- **Habit Linking**: Select any active habit from your Habit Planner (e.g. *Deep Work Block*, *Read Stoic Philosophy*, *Skill Practice*).
- **Auto-Completion**: Upon timer completion, Zenith automatically marks that habit as `completed` for today and boosts its health score via the background cache-invalidation pipeline!

### D. Immersive Fullscreen & Global Floating Widget
- **Fullscreen Zen Mode (`F` or Button)**: Hides sidebars, headers, and OS distractions with soft breathing particle backdrop.
- **Persistent Floating Mini-Widget**: If navigating to the Dashboard or Habit Matrix while a session is running, a sleek glassmorphic floating timer stays visible in the corner.

---

## 4. Implementation Steps

1. **Step 1: Focus Types & Sound Synthesis Core**
   - Create `types/focus.ts` with archetype configs, sound engines, and grove data structures.
   - Create `lib/audio/soundscapes.ts` using native Web Audio API oscillators and noise buffers.

2. **Step 2: Focus State Management & Global Floating Widget**
   - Create `context/FocusContext.tsx` with persistence, background countdown, audio controls, and habit link handlers.
   - Create `components/focus/FloatingFocusWidget.tsx` mounted in root `app/layout.tsx`.

3. **Step 3: Forest Visualizer & Philosopher Canvas**
   - Create `components/focus/ForestTreeCanvas.tsx` (SVG/Canvas animated growing tree).
   - Create `components/focus/PhilosopherCard.tsx` and quote rotator with smooth animations.
   - Create `components/focus/ZenGrove.tsx` showing today's forest garden and historical stats.

4. **Step 4: Dedicated `/focus` Page & Navigation Integration**
   - Build `app/focus/page.tsx` with full design aesthetics (curated dark mode, glassmorphism, responsive layout).
   - Add **Focus** navigation item to sidebar and quick-action buttons across the Dashboard and Habit Matrix.

5. **Step 5: Verification & Type Safety**
   - Run typecheck, test audio playback, test timer completion habit-sync, and test fullscreen transitions.
