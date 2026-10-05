"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  TreePine,
  Link as LinkIcon,
  CheckCircle2,
  Sliders,
  Flame,
  Coffee,
  Clock,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useFocus } from '../../context/FocusContext';
import { useHabits } from '../../hooks/useHabits';
import { ForestTreeCanvas } from '../../components/focus/ForestTreeCanvas';
import { PhilosopherCard } from '../../components/focus/PhilosopherCard';
import { ZenGrove } from '../../components/focus/ZenGrove';
import type { SoundscapeId, TreeSpecies } from '../../types/focus';
import { PHILOSOPHER_CONFIGS } from '../../types/focus';

export default function FocusPage() {
  const {
    state,
    settings,
    timeLeft,
    totalDuration,
    progress,
    growthStage,
    activeCycle,
    totalCycles,
    isBreak,
    plantedTrees,
    todayFocusedMinutes,
    currentQuote,
    startSession,
    pauseSession,
    resumeSession,
    cancelSession,
    skipToBreak,
    startNextCycle,
    resetSession,
    selectArchetype,
    setSoundscape,
    setSoundVolume,
    setSpecies,
    setDuration,
    linkHabit,
    unlinkHabit,
    setIntention,
    refreshQuote,
  } = useFocus();

  const { habits } = useHabits();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isHabitDropdownOpen, setIsHabitDropdownOpen] = useState<boolean>(false);
  const [isSoundDropdownOpen, setIsSoundDropdownOpen] = useState<boolean>(false);
  const [customFocusMinutes, setCustomFocusMinutes] = useState<number>(settings.focusDuration);

  const activeArchetype = PHILOSOPHER_CONFIGS[settings.archetype] || PHILOSOPHER_CONFIGS.marcus;
  const isRunning = state === 'focusing' || state === 'break';
  const isPaused = state === 'paused';
  const isSessionActive = isRunning || isPaused;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const formattedTime = formatTime(timeLeft);

  // Keyboard shortcuts (Space = Play/Pause, F = Fullscreen, Esc = Exit Fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (state === 'idle') {
          startSession();
        } else if (state === 'focusing' || state === 'break') {
          pauseSession();
        } else if (state === 'paused') {
          resumeSession();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsFullscreen((prev) => !prev);
        }
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, startSession, pauseSession, resumeSession, isFullscreen]);

  // Soundscape Options
  const soundscapeOptions: { id: SoundscapeId; label: string; icon: string }[] = [
    { id: 'none', label: 'Silence', icon: '🔇' },
    { id: 'rain', label: 'Gentle Rain', icon: '🌧️' },
    { id: 'forest', label: 'Forest Breeze', icon: '🌲' },
    { id: 'brown_noise', label: 'Deep Brown Noise', icon: '🌊' },
    { id: 'alpha_waves', label: '432Hz Alpha Waves', icon: '🧠' },
  ];

  // Tree Species Options
  const speciesOptions: { id: TreeSpecies; label: string; color: string }[] = [
    { id: 'oak', label: 'Stoic Oak', color: '#4ade80' },
    { id: 'pine', label: 'Deep Pine', color: '#10b981' },
    { id: 'sakura', label: 'Sakura Blossom', color: '#f472b6' },
    { id: 'bonsai', label: 'Zen Bonsai', color: '#22c55e' },
    { id: 'willow', label: 'Weeping Willow', color: '#14b8a6' },
  ];

  // Radial Timer Progress Ring
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-4rem)] space-y-8 pb-16">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${activeArchetype.accentColor}20`,
                  color: activeArchetype.accentColor,
                }}
              >
                <TreePine className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-ink">
                  Focus Sanctuary & Garden
                </h1>
                <p className="text-xs text-muted">
                  Cultivate deep attention through classical philosopher protocols & living forest growth
                </p>
              </div>
            </div>
          </div>

          {/* Quick Audio Controls & Fullscreen */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Soundscape Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSoundDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-3.5 py-2 text-xs font-medium text-ink backdrop-blur-md shadow-xs transition-all hover:border-border hover:bg-card"
              >
                {settings.soundscape === 'none' ? (
                  <VolumeX className="h-4 w-4 text-muted" />
                ) : (
                  <Volume2 className="h-4 w-4 text-emerald-500 animate-pulse" />
                )}
                <span>
                  {soundscapeOptions.find((s) => s.id === settings.soundscape)?.label || 'Sound'}
                </span>
                <ChevronDown className="h-3 w-3 text-muted" />
              </button>

              <AnimatePresence>
                {isSoundDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-2 z-30 w-56 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted uppercase tracking-wider">
                      Ambient Soundscapes
                    </div>
                    {soundscapeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSoundscape(opt.id);
                          setIsSoundDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                          settings.soundscape === opt.id
                            ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                            : 'text-muted hover:bg-canvas hover:text-ink'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </span>
                        {settings.soundscape === opt.id && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    ))}

                    {/* Volume Slider */}
                    {settings.soundscape !== 'none' && (
                      <div className="mt-2 border-t border-border/60 pt-2 px-2">
                        <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                          <span>Volume</span>
                          <span>{Math.round(settings.soundVolume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={settings.soundVolume}
                          onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fullscreen Zen Mode Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card/80 px-3.5 py-2 text-xs font-medium text-ink backdrop-blur-md shadow-xs transition-all hover:border-border hover:bg-card active:scale-95"
            >
              <Maximize2 className="h-4 w-4 text-muted" />
              <span>Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Hero Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Forest Tree Canvas & Main Radial Countdown Ring (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-3xl border border-border/80 bg-card/50 p-6 sm:p-10 backdrop-blur-xl shadow-xl relative overflow-hidden">
            {/* Ambient Background Aura */}
            <div
              className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: activeArchetype.accentColor }}
            />

            {/* Mode & Cycle Indicator Pill */}
            <div className="mb-6 flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-xs"
                style={{
                  backgroundColor: isBreak ? '#10b98118' : `${activeArchetype.accentColor}18`,
                  color: isBreak ? '#10b981' : activeArchetype.accentColor,
                  border: `1px solid ${isBreak ? '#10b98130' : `${activeArchetype.accentColor}30`}`,
                }}
              >
                {isBreak ? 'Restorative Rest' : `${activeArchetype.name} Protocol`}
              </span>

              {activeArchetype.id === 'cirillo' && (
                <span className="rounded-full bg-border/50 px-2.5 py-1 text-[11px] font-mono text-muted">
                  Cycle {activeCycle} of {totalCycles}
                </span>
              )}
            </div>

            {/* Radial SVG Progress Ring with Centered Tree Canvas */}
            <div className="relative flex h-80 w-80 sm:h-96 sm:w-96 items-center justify-center">
              <svg className="h-full w-full -rotate-90 drop-shadow-lg" viewBox="0 0 320 320">
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  className="stroke-muted/15"
                  strokeWidth="6"
                  fill="transparent"
                />
                <motion.circle
                  cx="160"
                  cy="160"
                  r={radius}
                  stroke={isBreak ? '#10b981' : activeArchetype.accentColor}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Centered Forest Tree */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <ForestTreeCanvas
                  species={settings.species}
                  stage={growthStage}
                  progress={progress}
                  isBreak={isBreak}
                  accentColor={activeArchetype.accentColor}
                  className="h-full w-full"
                />
              </div>
            </div>

            {/* Large Digital Countdown */}
            <div className="mt-6 text-center select-none">
              <div className="flex items-center justify-center font-mono text-5xl sm:text-6xl font-bold tracking-tight text-ink drop-shadow-md">
                <span>{formattedTime.minutes}</span>
                <span className="text-muted/40 animate-pulse">:</span>
                <span>{formattedTime.seconds}</span>
              </div>
              <p className="mt-1 text-xs text-muted font-medium">
                {isBreak
                  ? 'Breathe deeply and restore cognitive baseline'
                  : settings.linkedHabitName
                  ? `Focusing on "${settings.linkedHabitName}"`
                  : settings.intention || 'Undivided attention is sovereign'}
              </p>
            </div>

            {/* Main Action Controls Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              {!isSessionActive ? (
                <button
                  type="button"
                  onClick={() => startSession()}
                  className="flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: activeArchetype.accentColor,
                    boxShadow: `0 12px 30px -8px ${activeArchetype.accentColor}80`,
                  }}
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Begin Focus</span>
                </button>
              ) : isPaused ? (
                <>
                  <button
                    type="button"
                    onClick={resumeSession}
                    className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-xs font-semibold text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95 cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Resume</span>
                  </button>

                  <button
                    type="button"
                    onClick={cancelSession}
                    className="flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-3 text-xs font-semibold text-muted hover:border-rose-500/50 hover:text-rose-500 transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Abandon</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={pauseSession}
                    className="flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-6 py-3 text-xs font-semibold text-ink shadow-md transition-all hover:bg-card active:scale-95 cursor-pointer"
                  >
                    <Pause className="h-4 w-4 fill-current" />
                    <span>Pause</span>
                  </button>

                  <button
                    type="button"
                    onClick={skipToBreak}
                    className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-4 py-3 text-xs font-semibold text-muted hover:text-ink transition-all active:scale-95 cursor-pointer"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                    <span>Skip to Rest</span>
                  </button>

                  <button
                    type="button"
                    onClick={cancelSession}
                    className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-4 py-3 text-xs font-semibold text-muted hover:border-rose-500/50 hover:text-rose-500 transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Abandon</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Philosopher Archetypes, Habit Linking & Species Config (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Philosopher Card */}
            <PhilosopherCard
              selectedId={settings.archetype}
              onSelect={selectArchetype}
              currentQuote={currentQuote}
              onRefreshQuote={refreshQuote}
              isSessionActive={isSessionActive}
            />

            {/* Habit Linking Block */}
            <div className="rounded-3xl border border-border/80 bg-card/60 p-5 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>Link Zenith Habit</span>
                </div>
                {settings.linkedHabitId && (
                  <button
                    type="button"
                    onClick={unlinkHabit}
                    className="text-[11px] text-muted hover:text-rose-500 underline"
                  >
                    Unlink
                  </button>
                )}
              </div>

              {/* Habit Select Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  disabled={isSessionActive}
                  onClick={() => setIsHabitDropdownOpen((prev) => !prev)}
                  className={`flex w-full items-center justify-between rounded-2xl border border-border/80 bg-card/90 px-4 py-3 text-xs font-medium text-ink transition-all hover:border-border ${
                    isSessionActive ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span className="truncate">
                    {settings.linkedHabitName ? (
                      <span className="flex items-center gap-2 text-emerald-500 font-semibold">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {settings.linkedHabitName}
                      </span>
                    ) : (
                      <span className="text-muted">Select active habit to auto-complete...</span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted shrink-0" />
                </button>

                <AnimatePresence>
                  {isHabitDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 top-full mt-2 z-30 max-h-56 w-full overflow-y-auto rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl"
                    >
                      {habits.length === 0 ? (
                        <p className="p-3 text-center text-xs text-muted">No habits available</p>
                      ) : (
                        habits.map((h) => (
                          <button
                            key={h.id}
                            onClick={() => {
                              linkHabit(h.id, h.name);
                              setIsHabitDropdownOpen(false);
                            }}
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-left text-ink transition-colors hover:bg-canvas hover:text-emerald-500"
                          >
                            <span className="truncate">{h.name}</span>
                            <span className="text-[10px] text-muted font-mono">{h.minutes}m</span>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Session Intention Note */}
              <div className="mt-4">
                <label className="text-[11px] font-medium text-muted block mb-1">
                  Session Intention
                </label>
                <input
                  type="text"
                  value={settings.intention}
                  disabled={isSessionActive}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="e.g. Write Chapter 3 without tab switching..."
                  className="w-full rounded-2xl border border-border/80 bg-canvas/60 px-3.5 py-2.5 text-xs text-ink placeholder:text-muted/50 focus:border-border focus:outline-none"
                />
              </div>

              {/* Tree Species Selector */}
              <div className="mt-4 border-t border-border/60 pt-3">
                <label className="text-[11px] font-medium text-muted block mb-2">
                  Tree Species to Cultivate
                </label>
                <div className="flex flex-wrap gap-2">
                  {speciesOptions.map((sp) => {
                    const isSelected = settings.species === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        disabled={isSessionActive}
                        onClick={() => setSpecies(sp.id)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-all ${
                          isSelected
                            ? 'border-border bg-card text-ink font-semibold shadow-xs'
                            : 'border-border/50 bg-card/40 text-muted hover:border-border'
                        } ${isSessionActive ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: sp.color }}
                        />
                        <span>{sp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Zen Grove Garden & Historical Focus Stats */}
        <ZenGrove trees={plantedTrees} todayFocusedMinutes={todayFocusedMinutes} />

        {/* FULLSCREEN IMMERSION ZEN MODE OVERLAY */}
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-zinc-950 p-8 text-white select-none backdrop-blur-3xl"
            >
              {/* Exit Fullscreen Button */}
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <TreePine className="h-4 w-4 text-emerald-400" />
                  <span>Zenith Focus Sanctuary · Press <strong>ESC</strong> to exit</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
              </div>

              {/* Fullscreen Centered Tree Canvas & Countdown */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative flex h-80 w-80 sm:h-[420px] sm:w-[420px] items-center justify-center">
                  <ForestTreeCanvas
                    species={settings.species}
                    stage={growthStage}
                    progress={progress}
                    isBreak={isBreak}
                    accentColor={activeArchetype.accentColor}
                    className="h-full w-full"
                  />
                </div>

                <div className="mt-4 text-center">
                  <div className="font-mono text-7xl sm:text-8xl font-bold tracking-tight text-white drop-shadow-2xl">
                    <span>{formattedTime.minutes}</span>
                    <span className="text-zinc-600 animate-pulse">:</span>
                    <span>{formattedTime.seconds}</span>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400 font-serif italic max-w-md mx-auto">
                    &ldquo;{currentQuote}&rdquo;
                  </p>
                </div>
              </div>

              {/* Fullscreen Controls Bar */}
              <div className="flex items-center gap-4">
                {!isSessionActive ? (
                  <button
                    type="button"
                    onClick={() => startSession()}
                    className="flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-2xl transition-all hover:scale-105"
                    style={{ backgroundColor: activeArchetype.accentColor }}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Begin Session</span>
                  </button>
                ) : isPaused ? (
                  <button
                    type="button"
                    onClick={resumeSession}
                    className="flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-white shadow-2xl transition-all hover:bg-emerald-600"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pauseSession}
                    className="flex items-center gap-2 rounded-full bg-zinc-800 px-8 py-3.5 text-sm font-semibold text-white shadow-2xl transition-all hover:bg-zinc-700"
                  >
                    <Pause className="h-4 w-4 fill-current" />
                    <span>Pause</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
