"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Clock,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Plus,
  Zap,
  MoreVertical,
} from 'lucide-react';
import type { Habit, CircadianSlot } from '../../types/zenith';

interface CircadianBandsViewProps {
  circadianGroups: Record<CircadianSlot, Habit[]>;
  onToggleStatus: (habitId: string) => void;
  onOpenSkipModal: (habit: Habit) => void;
  onLogMicroStep: (habitId: string) => void;
  onOpenCreateModal: (defaultSlot?: CircadianSlot) => void;
  onSelectHabit?: (habit: Habit) => void;
}

interface BandConfig {
  slot: CircadianSlot;
  title: string;
  subtitle: string;
  windowLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgWash: string;
}

const BANDS: BandConfig[] = [
  {
    slot: 'morning',
    title: 'Morning Ignition',
    subtitle: 'High cognitive energy & biological momentum',
    windowLabel: '07:00 AM – 11:00 AM',
    icon: Sun,
    accentColor: 'text-sand',
    bgWash: 'bg-sand/10',
  },
  {
    slot: 'afternoon',
    title: 'Midday Focus & Sunlight',
    subtitle: 'Sustained momentum & active restoration',
    windowLabel: '11:00 AM – 04:00 PM',
    icon: Clock,
    accentColor: 'text-sage-deep',
    bgWash: 'bg-sage-wash',
  },
  {
    slot: 'evening',
    title: 'Sunset Review & Wind-Down',
    subtitle: 'Reflection, knowledge immersion & peaceful rest',
    windowLabel: '05:00 PM – 09:30 PM',
    icon: Moon,
    accentColor: 'text-sage',
    bgWash: 'bg-sage-wash/70',
  },
];

export function CircadianBandsView({
  circadianGroups,
  onToggleStatus,
  onOpenSkipModal,
  onLogMicroStep,
  onOpenCreateModal,
  onSelectHabit,
}: CircadianBandsViewProps) {
  return (
    <div className="space-y-8">
      {BANDS.map((band) => {
        const habits = circadianGroups[band.slot] || [];
        const completedCount = habits.filter((h) => h.status === 'completed').length;
        const totalCount = habits.length;
        const Icon = band.icon;

        return (
          <section
            key={band.slot}
            className="rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-calm"
          >
            {/* Band Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-5 mb-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${band.bgWash} border border-line/60`}>
                  <Icon className={`h-5 w-5 ${band.accentColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl text-ink">{band.title}</h2>
                    <span className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[10px] font-mono text-faint">
                      {band.windowLabel}
                    </span>
                  </div>
                  <p className="text-xs text-muted font-light mt-0.5">{band.subtitle}</p>
                </div>
              </div>

              {/* Band Metrics & Quick Add */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs font-mono font-medium text-muted bg-canvas px-3 py-1.5 rounded-xl border border-line/60">
                  <span className="text-ink font-bold">{completedCount}</span> / {totalCount} Completed
                </span>
                <button
                  type="button"
                  onClick={() => onOpenCreateModal(band.slot)}
                  className="flex items-center gap-1 text-xs font-medium text-sage-deep hover:text-ink transition-colors bg-sage-wash/60 px-3 py-1.5 rounded-xl border border-sage/20 hover:border-sage"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Ritual</span>
                </button>
              </div>
            </div>

            {/* Habit Cards in this Band */}
            {habits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center rounded-2xl border border-dashed border-line bg-canvas/40 p-6">
                <p className="text-xs text-muted font-light">No habits anchored in {band.title} yet.</p>
                <button
                  type="button"
                  onClick={() => onOpenCreateModal(band.slot)}
                  className="mt-2 text-xs font-medium text-sage-deep hover:underline"
                >
                  + Anchor your first {band.slot} ritual
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {habits.map((habit) => {
                  const isCompleted = habit.status === 'completed';
                  const isMissed = habit.status === 'missed';

                  return (
                    <motion.div
                      key={habit.id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group relative rounded-2xl border p-4.5 transition-all ${
                        isCompleted
                          ? 'border-sage/40 bg-sage-wash/40 shadow-xs'
                          : isMissed
                          ? 'border-clay/30 bg-clay-wash/30 shadow-xs'
                          : 'border-line bg-canvas hover:border-line/80 hover:bg-surface'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Habit Information */}
                        <div
                          className="flex-1 cursor-pointer min-w-0"
                          onClick={() => onSelectHabit && onSelectHabit(habit)}
                        >
                          <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-semibold truncate ${isCompleted ? 'text-ink line-through decoration-sage-deep/50' : 'text-ink'}`}>
                              {habit.name}
                            </h3>
                            {habit.category && (
                              <span className="rounded-md border border-line/60 bg-surface px-1.5 py-0.5 text-[9px] uppercase font-mono tracking-wider text-faint">
                                {habit.category}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted font-mono">
                            <span>{habit.window}</span>
                            <span>·</span>
                            <span>{habit.minutes} mins</span>
                          </div>

                          {/* 5-Min Micro-Fallback Chip */}
                          <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[10px] text-muted border border-line/60 max-w-[200px] truncate">
                              <ShieldCheck className="h-3 w-3 text-sage-deep shrink-0" />
                              <span className="truncate">Micro: {habit.microVersion}</span>
                            </div>

                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onLogMicroStep(habit.id);
                                }}
                                className="text-[10px] text-sage-deep hover:text-ink font-medium underline underline-offset-2 transition-colors shrink-0"
                              >
                                Log 5-min
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Health Score & Status Toggle Button */}
                        <div className="flex flex-col items-end gap-2.5 shrink-0">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                              habit.health >= 80
                                ? 'border-sage/40 bg-surface text-sage-deep'
                                : habit.health >= 65
                                ? 'border-sand/40 bg-surface text-sand'
                                : 'border-clay/40 bg-surface text-clay'
                            }`}
                          >
                            {habit.health}% Health
                          </span>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (habit.status === 'completed') {
                                // Transitioning to missed -> Open skip reflection modal
                                onOpenSkipModal(habit);
                              } else {
                                onToggleStatus(habit.id);
                              }
                            }}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                              isCompleted
                                ? 'border-sage bg-sage text-white shadow-xs'
                                : isMissed
                                ? 'border-clay bg-clay text-white shadow-xs'
                                : 'border-dashed border-faint bg-surface text-transparent hover:border-sage'
                            }`}
                            aria-label={`Toggle status for ${habit.name}`}
                          >
                            <AnimatePresence mode="wait">
                              {isCompleted && (
                                <motion.span
                                  key="check"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <Check className="h-4 w-4 stroke-[2.5]" />
                                </motion.span>
                              )}
                              {isMissed && (
                                <motion.span
                                  key="x"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <X className="h-4 w-4 stroke-[2.5]" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
