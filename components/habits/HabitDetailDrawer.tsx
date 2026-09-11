"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sun,
  Moon,
  Clock,
  ShieldCheck,
  Zap,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit2,
  Save,
} from 'lucide-react';
import type { Habit } from '../../types/zenith';
import { HealthRing } from '../visuals/HealthRing';
import { weekDays } from '../../data/zenith';

interface HabitDetailDrawerProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onLogMicroStep: (habitId: string) => void;
  onUpdateHabit?: (habitId: string, updates: Partial<Habit>) => Promise<boolean>;
  onDeleteHabit?: (habitId: string) => Promise<boolean>;
}

export function HabitDetailDrawer({
  habit,
  isOpen,
  onClose,
  onLogMicroStep,
  onUpdateHabit,
  onDeleteHabit,
}: HabitDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedMicro, setEditedMicro] = useState('');
  const [editedMinutes, setEditedMinutes] = useState(20);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !habit) return null;

  const startEdit = () => {
    setEditedName(habit.name);
    setEditedMicro(habit.microVersion);
    setEditedMinutes(habit.minutes);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (onUpdateHabit && editedName.trim()) {
      await onUpdateHabit(habit.id, {
        name: editedName.trim(),
        microVersion: editedMicro.trim() || '5-minute micro fallback',
        minutes: editedMinutes,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (onDeleteHabit) {
      setIsDeleting(true);
      await onDeleteHabit(habit.id);
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md bg-surface border-l border-line p-6 sm:p-8 shadow-calm flex flex-col justify-between overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header & Close */}
          <div className="flex items-start justify-between border-b border-line/60 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-faint">
                Habit Resilience Profile
              </span>
              <h2 className="font-serif text-2xl text-ink mt-0.5">{habit.name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-muted hover:text-ink hover:bg-canvas transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Health Gauge & Status Summary */}
          <div className="rounded-3xl border border-line bg-canvas/70 p-5 flex items-center justify-between shadow-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                Cumulative Health
              </span>
              <div className="text-sm font-semibold text-ink">
                {habit.health >= 80 ? '🌱 Resilient Momentum' : '⚠️ Schedule Fatigue Alert'}
              </div>
              <p className="text-[11px] text-faint leading-relaxed font-light">
                Preserved across {habit.week.filter((s) => s === 'completed').length} completed rituals this week.
              </p>
            </div>

            <HealthRing value={habit.health} size={74} stroke={6} />
          </div>

          {/* 7-Day History Visualization */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-faint">
              7-Day Consistency Horizon
            </span>
            <div className="grid grid-cols-7 gap-1.5 p-3 rounded-2xl border border-line bg-surface">
              {weekDays.map((day, idx) => {
                const status = habit.week[idx] || 'unlogged';
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5 text-center">
                    <span className="text-[9px] font-mono uppercase text-faint">{day}</span>
                    <div
                      className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] ${
                        status === 'completed'
                          ? 'bg-sage text-white font-bold'
                          : status === 'missed'
                          ? 'bg-clay text-white font-bold'
                          : 'border border-dashed border-line bg-canvas text-transparent'
                      }`}
                    >
                      {status === 'completed' ? '✓' : status === 'missed' ? '✕' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zero-Guilt Micro Fallback Configuration */}
          <div className="rounded-2xl border border-sage/30 bg-sage-wash/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <ShieldCheck className="h-4 w-4 text-sage-deep" />
                <span>5-Minute Micro-Fallback</span>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="text-[11px] text-sage-deep hover:text-ink font-medium transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={editedMicro}
                  onChange={(e) => setEditedMicro(e.target.value)}
                  placeholder="5-minute emergency fallback"
                  className="w-full rounded-xl border border-sage/40 bg-surface py-2 px-3 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-muted hover:text-ink px-3 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    className="rounded-xl bg-sage text-white px-3 py-1 text-xs font-medium hover:bg-sage-deep transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-ink font-medium">
                  {habit.microVersion || '5-minute micro action'}
                </p>
                <p className="text-[11px] text-muted font-light mt-0.5">
                  Automatically proposed by Zenith during crunch days to prevent broken streaks.
                </p>
              </div>
            )}
          </div>

          {/* Quick Action: Log Today's Micro Step */}
          {habit.status !== 'completed' && (
            <button
              type="button"
              onClick={() => {
                onLogMicroStep(habit.id);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sage-wash border border-sage/40 py-3 text-xs font-semibold text-sage-deep hover:bg-sage hover:text-white transition-colors shadow-xs"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Log Today&apos;s 5-Minute Micro Version</span>
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-line/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-clay transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Ritual'}</span>
          </button>

          <span className="text-[11px] text-faint font-mono">
            ID: {habit.id.slice(0, 8)}
          </span>
        </div>
      </motion.aside>
    </div>
  );
}
