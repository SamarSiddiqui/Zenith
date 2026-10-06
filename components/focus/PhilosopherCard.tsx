"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Quote,
  RefreshCw,
  Clock,
  Sparkles,
  Shield,
  Brain,
  Timer,
  Activity,
  Sliders,
} from 'lucide-react';
import type { PhilosopherId, PhilosopherConfig } from '../../types/focus';
import { PHILOSOPHER_CONFIGS } from '../../types/focus';

interface PhilosopherCardProps {
  selectedId: PhilosopherId;
  onSelect: (id: PhilosopherId) => void;
  currentQuote: string;
  onRefreshQuote: () => void;
  isSessionActive?: boolean;
  isBreak?: boolean;
  focusDuration?: number;
  breakDuration?: number;
  onDurationChange?: (focusMinutes: number, breakMinutes?: number) => void;
}

export function PhilosopherCard({
  selectedId,
  onSelect,
  currentQuote,
  onRefreshQuote,
  isSessionActive = false,
  isBreak = false,
  focusDuration = 45,
  breakDuration = 10,
  onDurationChange,
}: PhilosopherCardProps) {
  const activeConfig = PHILOSOPHER_CONFIGS[selectedId] || PHILOSOPHER_CONFIGS.marcus;

  const getArchetypeIcon = (id: PhilosopherId) => {
    switch (id) {
      case 'marcus':
        return <Shield className="h-4 w-4" />;
      case 'newport':
        return <Brain className="h-4 w-4" />;
      case 'cirillo':
        return <Timer className="h-4 w-4" />;
      case 'ultradian':
        return <Activity className="h-4 w-4" />;
      case 'custom':
      default:
        return <Sliders className="h-4 w-4" />;
    }
  };

  const focusPresetChips = [15, 25, 30, 45, 60, 90, 120];
  const breakPresetChips = [3, 5, 10, 15];

  return (
    <div className="space-y-6">
      {/* Archetype Selector Tabs */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Focus Rhythm
          </label>
          <span className="text-[11px] text-muted/80">
            {isSessionActive ? 'Rhythm locked while session is running' : 'Select a focus style'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {(Object.keys(PHILOSOPHER_CONFIGS) as PhilosopherId[]).map((id) => {
            const config = PHILOSOPHER_CONFIGS[id];
            const isSelected = selectedId === id;
            const displayMinutes = id === 'custom' ? focusDuration : config.focusMinutes;

            return (
              <button
                key={id}
                type="button"
                disabled={isSessionActive}
                onClick={() => onSelect(id)}
                className={`group relative flex flex-col items-start justify-between rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-border bg-card shadow-lg ring-1 ring-border'
                    : 'border-border/60 bg-card/40 hover:border-border hover:bg-card/70'
                } ${isSessionActive ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  boxShadow: isSelected ? `0 8px 25px -8px ${config.accentColor}25` : undefined,
                }}
              >
                {/* Active Indicator Pip */}
                {isSelected && (
                  <motion.div
                    layoutId="activeArchetypePip"
                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-card"
                    style={{ backgroundColor: config.accentColor }}
                  />
                )}

                <div className="flex items-center gap-2 mb-2 w-full">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${config.accentColor}18`,
                      color: config.accentColor,
                    }}
                  >
                    {getArchetypeIcon(id)}
                  </div>
                  <span className="text-[11px] font-mono text-muted/90">
                    {displayMinutes}m
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-ink leading-tight">
                    {config.name}
                  </h4>
                  <p className="mt-0.5 text-[10px] text-muted line-clamp-1">
                    {config.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Archetype Active Card & Dynamic Quote Box */}
      <motion.div
        key={selectedId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl"
        style={{
          boxShadow: `0 20px 40px -15px ${activeConfig.accentColor}15`,
        }}
      >
        {/* Soft Background Accent Splash */}
        <div
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: activeConfig.accentColor }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-inner text-ink"
              style={{
                backgroundColor: `${activeConfig.accentColor}20`,
                color: activeConfig.accentColor,
                border: `1px solid ${activeConfig.accentColor}40`,
              }}
            >
              {getArchetypeIcon(selectedId)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink tracking-tight">
                  {activeConfig.name}
                </h3>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: isBreak ? '#10b98120' : `${activeConfig.accentColor}18`,
                    color: isBreak ? '#10b981' : activeConfig.accentColor,
                  }}
                >
                  {isBreak ? `Resting (${breakDuration || activeConfig.breakMinutes}m)` : selectedId === 'custom' ? `${focusDuration}m / ${breakDuration}m` : activeConfig.title}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {isBreak ? 'Step away, rest your eyes, and allow your brain to synthesize learning.' : activeConfig.tagline}
              </p>
            </div>
          </div>

          {/* Timing Protocol Specs */}
          <div className={`flex items-center gap-2 text-xs font-medium rounded-xl px-3 py-1.5 border self-start md:self-auto transition-colors ${
            isBreak ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-semibold' : 'bg-canvas/60 border-border/50 text-muted'
          }`}>
            <Clock className="h-3.5 w-3.5 text-muted" />
            <span className={!isBreak ? 'text-ink font-bold' : 'opacity-70'}>
              {selectedId === 'custom' ? focusDuration : activeConfig.focusMinutes}m Focus
            </span>
            <span className="text-muted/40">·</span>
            <span className={isBreak ? 'text-emerald-500 font-bold' : 'opacity-70'}>
              {selectedId === 'custom' ? breakDuration : activeConfig.breakMinutes}m Rest
            </span>
          </div>
        </div>

        {/* CUSTOM TIMER DURATION ADJUSTER (Rendered directly in card) */}
        {selectedId === 'custom' && onDurationChange && !isSessionActive && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl bg-canvas/80 border border-violet-500/30 p-4 space-y-4"
          >
            {/* Focus Interval Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-ink mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-violet-500" />
                  <span>Set Focus Time</span>
                </span>
                <span className="font-mono font-bold text-sm text-violet-500">{focusDuration} mins</span>
              </div>

              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={focusDuration}
                onChange={(e) => onDurationChange(parseInt(e.target.value, 10), breakDuration)}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-violet-500"
              />

              {/* Quick Focus Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {focusPresetChips.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onDurationChange(mins, breakDuration)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all ${
                      focusDuration === mins
                        ? 'bg-violet-500 text-white font-bold shadow-xs'
                        : 'bg-card text-muted border border-border/60 hover:text-ink hover:border-violet-500/40'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Break Interval Slider */}
            <div className="border-t border-border/50 pt-3">
              <div className="flex items-center justify-between text-xs font-medium text-ink mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Set Rest Break</span>
                </span>
                <span className="font-mono font-bold text-sm text-emerald-500">{breakDuration} mins</span>
              </div>

              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={breakDuration}
                onChange={(e) => onDurationChange(focusDuration, parseInt(e.target.value, 10))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              {/* Quick Rest Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {breakPresetChips.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onDurationChange(focusDuration, mins)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono transition-all ${
                      breakDuration === mins
                        ? 'bg-emerald-500 text-white font-bold shadow-xs'
                        : 'bg-card text-muted border border-border/60 hover:text-ink hover:border-emerald-500/40'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Quote Block */}
        <div className="relative mt-5 rounded-2xl bg-canvas/70 border border-border/60 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <Quote
              className="h-5 w-5 shrink-0 opacity-40 mt-0.5"
              style={{ color: activeConfig.accentColor }}
            />
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuote}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="text-xs sm:text-sm italic leading-relaxed text-ink/90 font-serif"
                >
                  &ldquo;{currentQuote}&rdquo;
                </motion.p>
              </AnimatePresence>
              <p className="mt-2 text-[11px] font-medium text-muted">
                — {activeConfig.name}
              </p>
            </div>

            {/* Shuffle Quote Button */}
            <button
              type="button"
              onClick={onRefreshQuote}
              title="Shuffle wisdom reflection"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-card/80 text-muted transition-all hover:border-border hover:bg-card hover:text-ink active:scale-95"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Core Principles */}
        <div className="mt-4 flex flex-wrap gap-2">
          {activeConfig.principles.map((principle, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 rounded-lg bg-card/80 px-2.5 py-1 text-[11px] text-muted border border-border/40"
            >
              <Sparkles className="h-3 w-3 opacity-60" style={{ color: activeConfig.accentColor }} />
              <span>{principle}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
