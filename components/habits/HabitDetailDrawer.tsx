"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Zap,
  Trash2,
  Edit3,
  Save,
  Clock,
  Tag,
  Check,
  Layers,
  Sparkles,
  RotateCcw,
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

const DURATION_PRESETS = [5, 15, 25, 45, 60, 90];

const CATEGORIES = [
  { id: 'focus', label: 'Deep Focus' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'physical', label: 'Physical' },
  { id: 'craft', label: 'Craft & Skill' },
  { id: 'rest', label: 'Rest & Reset' },
] as const;

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
  const [editedWindow, setEditedWindow] = useState('');
  const [editedMinutes, setEditedMinutes] = useState(20);
  const [editedCategory, setEditedCategory] = useState<'focus' | 'mindfulness' | 'physical' | 'craft' | 'rest'>('focus');
  const [editedMicro, setEditedMicro] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize edit fields whenever active habit changes
  useEffect(() => {
    if (habit) {
      setEditedName(habit.name || '');
      setEditedWindow(habit.window || '09:00 AM – 09:45 AM');
      setEditedMinutes(habit.minutes || 20);
      setEditedCategory(habit.category || 'focus');
      setEditedMicro(habit.microVersion || '5 min micro-step');
      setIsEditing(false);
    }
  }, [habit]);

  if (!isOpen || !habit) return null;

  const handleStartEdit = () => {
    setEditedName(habit.name);
    setEditedWindow(habit.window);
    setEditedMinutes(habit.minutes);
    setEditedCategory(habit.category || 'focus');
    setEditedMicro(habit.microVersion);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedName(habit.name);
    setEditedWindow(habit.window);
    setEditedMinutes(habit.minutes);
    setEditedCategory(habit.category || 'focus');
    setEditedMicro(habit.microVersion);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) return;
    if (onUpdateHabit) {
      setIsSaving(true);
      await onUpdateHabit(habit.id, {
        name: editedName.trim(),
        window: editedWindow.trim() || 'Daily Window',
        minutes: editedMinutes,
        category: editedCategory,
        microVersion: editedMicro.trim() || '5-minute micro fallback',
      });
      setIsSaving(false);
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
          {/* Header & Quick Action Buttons */}
          <div className="flex items-start justify-between border-b border-line/60 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-faint">
                Habit Resilience Profile
              </span>
              <h2 className="font-serif text-2xl text-ink mt-0.5">
                {isEditing ? 'Edit Habit Ritual' : habit.name}
              </h2>
            </div>
            
            <div className="flex items-center gap-1.5">
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-mono text-muted hover:border-sage hover:text-sage-deep transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-muted hover:text-ink hover:bg-canvas transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* EDIT MODE FORM */}
          {isEditing ? (
            <div className="space-y-5">
              {/* Habit Name Field */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="e.g. Morning Deep Work Block"
                  required
                  className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-4 text-xs text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-all"
                />
              </div>

              {/* Routine Time Window */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5">
                  Routine Window Label
                </label>
                <input
                  type="text"
                  value={editedWindow}
                  onChange={(e) => setEditedWindow(e.target.value)}
                  placeholder="e.g. 09:00 AM – 10:30 AM"
                  className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-4 text-xs text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-all"
                />
              </div>

              {/* Duration Stepper / Presets */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted">
                    Target Duration
                  </label>
                  <span className="text-xs font-mono font-bold text-sage-deep">
                    {editedMinutes} mins
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {DURATION_PRESETS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setEditedMinutes(m)}
                      className={`py-2 rounded-xl text-xs font-mono transition-all ${
                        editedMinutes === m
                          ? 'bg-sage text-white font-bold shadow-xs'
                          : 'border border-line bg-canvas text-muted hover:border-line-hover hover:text-ink'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5">
                  Category
                </label>
                <select
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value as any)}
                  className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-3.5 text-xs text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5-Minute Micro Fallback */}
              <div className="rounded-2xl border border-sage/30 bg-sage-wash/50 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <ShieldCheck className="h-4 w-4 text-sage-deep" />
                  <span>5-Minute Micro-Fallback (Zero-Guilt Engine)</span>
                </div>
                <input
                  type="text"
                  value={editedMicro}
                  onChange={(e) => setEditedMicro(e.target.value)}
                  placeholder="e.g. 5-min mobility stretch or read 2 pages"
                  className="w-full rounded-xl border border-sage/40 bg-surface py-2 px-3.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-sage"
                />
              </div>

              {/* Edit Mode Save / Cancel Controls */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-2xl border border-line px-4 py-2 text-xs font-medium text-muted hover:bg-canvas hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving || !editedName.trim()}
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1.5 rounded-2xl bg-sage-deep px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-sage transition-all disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW MODE DETAILS */
            <>
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

              {/* Habit Metadata Strip */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-line bg-surface p-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-faint flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted" /> Time Window
                  </span>
                  <span className="text-xs font-semibold text-ink block truncate">
                    {habit.window || 'Daily Window'}
                  </span>
                  <span className="text-[10px] font-mono text-muted">
                    {habit.minutes} mins duration
                  </span>
                </div>

                <div className="rounded-2xl border border-line bg-surface p-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-faint flex items-center gap-1">
                    <Tag className="h-3 w-3 text-muted" /> Category
                  </span>
                  <span className="text-xs font-semibold text-ink block uppercase font-mono">
                    {habit.category || 'focus'}
                  </span>
                  <span className="text-[10px] font-mono text-sage-deep">
                    Active Ritual
                  </span>
                </div>
              </div>

              {/* 7-Day History Visualization */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-faint">
                  Weekly Habit History
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
              <div className="rounded-2xl border border-sage/30 bg-sage-wash/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                    <ShieldCheck className="h-4 w-4 text-sage-deep" />
                    <span>5-Minute Micro-Fallback</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-[11px] text-sage-deep hover:text-ink font-medium transition-colors"
                  >
                    Edit
                  </button>
                </div>

                <p className="text-xs text-ink font-medium">
                  {habit.microVersion || '5-minute micro action'}
                </p>
                <p className="text-[11px] text-muted font-light leading-relaxed">
                  Friction-free version proposed on busy days to preserve your consistency.
                </p>
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
            </>
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

          {!isEditing && (
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex items-center gap-1 text-xs font-mono text-sage-deep hover:text-ink transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Details</span>
            </button>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
