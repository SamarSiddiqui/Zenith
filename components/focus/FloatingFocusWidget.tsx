"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize2, X, TreePine, Sparkles, Coffee } from 'lucide-react';
import { useFocus } from '../../context/FocusContext';
import { PHILOSOPHER_CONFIGS } from '../../types/focus';

export function FloatingFocusWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    state,
    timeLeft,
    totalDuration,
    progress,
    settings,
    isBreak,
    pauseSession,
    resumeSession,
    cancelSession,
  } = useFocus();

  // Do not render on the dedicated /focus page or when session is idle/completed
  if (pathname === '/focus' || state === 'idle' || state === 'completed') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const archetypeConfig = PHILOSOPHER_CONFIGS[settings.archetype] || PHILOSOPHER_CONFIGS.marcus;
  const isPaused = state === 'paused';

  // SVG circular progress calculation
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-border/80 bg-card/90 px-4 py-2.5 shadow-2xl backdrop-blur-xl transition-all hover:border-border hover:bg-card"
        style={{
          boxShadow: isPaused
            ? '0 10px 30px -10px rgba(0,0,0,0.5)'
            : `0 10px 35px -10px ${archetypeConfig.accentColor}33`,
        }}
      >
        {/* Circular Progress Ring with Species Icon */}
        <div className="relative flex h-10 w-10 items-center justify-center">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-muted/20"
              strokeWidth="3"
              fill="transparent"
            />
            <motion.circle
              cx="22"
              cy="22"
              r={radius}
              stroke={isBreak ? '#10b981' : archetypeConfig.accentColor}
              strokeWidth="3"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            {isBreak ? (
              <Coffee className="h-4 w-4 text-emerald-500 animate-pulse" />
            ) : (
              <TreePine
                className="h-4 w-4 transition-transform duration-300"
                style={{
                  color: archetypeConfig.accentColor,
                  transform: isPaused ? 'scale(0.85)' : 'scale(1.05)',
                }}
              />
            )}
          </div>
        </div>

        {/* Timer Details */}
        <div
          onClick={() => router.push('/focus')}
          className="group cursor-pointer select-none pr-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-base font-semibold tracking-tight text-ink">
              {formatTime(timeLeft)}
            </span>
            {isPaused && (
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500 uppercase tracking-wider">
                Paused
              </span>
            )}
          </div>
          <p className="max-w-[130px] truncate text-[11px] text-muted transition-colors group-hover:text-ink">
            {settings.linkedHabitName || archetypeConfig.name}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 border-l border-border/60 pl-2">
          {isPaused ? (
            <button
              onClick={resumeSession}
              title="Resume focus"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 transition-colors hover:bg-emerald-500/20 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={pauseSession}
              title="Pause focus"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/10 text-muted transition-colors hover:bg-muted/20 hover:text-ink active:scale-95"
            >
              <Pause className="h-3.5 w-3.5 fill-current" />
            </button>
          )}

          <button
            onClick={() => router.push('/focus')}
            title="Open full Focus Sanctuary"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/10 text-muted transition-colors hover:bg-muted/20 hover:text-ink active:scale-95"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={cancelSession}
            title="Abandon session"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted/60 transition-colors hover:bg-rose-500/10 hover:text-rose-500 active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
