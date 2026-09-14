"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Sun,
  Moon,
  Clock,
  Feather,
  Shield,
  Plus,
} from 'lucide-react';
import type { CreateHabitInput, CircadianSlot } from '../../types/zenith';

interface HabitGenesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: CreateHabitInput) => Promise<boolean>;
}

const DURATION_OPTIONS = [5, 15, 25, 45, 60, 90];

const CATEGORIES = [
  { id: 'focus', label: 'Deep Focus' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'physical', label: 'Physical' },
  { id: 'craft', label: 'Craft & Skill' },
  { id: 'rest', label: 'Rest & Reset' },
] as const;

export function HabitGenesisModal({ isOpen, onClose, onSave }: HabitGenesisModalProps) {
  const [name, setName] = useState('');
  const [slot, setSlot] = useState<CircadianSlot>('morning');
  const [windowTime, setWindowTime] = useState('09:00 AM – 09:45 AM');
  const [minutes, setMinutes] = useState(45);
  const [microVersion, setMicroVersion] = useState('');
  const [category, setCategory] = useState<'focus' | 'mindfulness' | 'physical' | 'craft' | 'rest'>('focus');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const success = await onSave({
      name: name.trim(),
      circadianSlot: slot,
      window: windowTime.trim() || 'Daily Window',
      minutes,
      microVersion: microVersion.trim() || '5-minute micro fallback',
      category,
    });

    setIsSubmitting(false);
    if (success) {
      setName('');
      setMicroVersion('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-xl rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-calm relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line/60 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep border border-sage/30">
              <Feather className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-ink">Anchor Habit Ritual</h2>
              <p className="text-xs text-muted font-light">
                Define your habit routine with built-in zero-guilt recovery.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:text-ink hover:bg-canvas transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Habit Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-faint mb-1.5">
              Habit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Deep Focus Block"
              required
              className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-4 text-xs text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/15 transition-all"
            />
          </div>

          {/* Habit Time Window */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-faint mb-1.5">
              Routine Time Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'morning', label: 'Morning', time: '07:00 – 11:00', icon: Sun },
                { id: 'afternoon', label: 'Midday', time: '11:00 – 16:00', icon: Clock },
                { id: 'evening', label: 'Evening', time: '17:00 – 21:00', icon: Moon },
              ].map(({ id, label, time, icon: Icon }) => {
                const selected = slot === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSlot(id as CircadianSlot);
                      setWindowTime(time);
                    }}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                      selected
                        ? 'border-sage bg-sage-wash text-ink shadow-xs'
                        : 'border-line bg-canvas text-muted hover:border-line/80'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${selected ? 'text-sage-deep' : 'text-faint'}`} />
                    <span className="text-xs font-medium">{label}</span>
                    <span className="text-[10px] text-faint font-mono mt-0.5">{time}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-faint mb-1.5">
                Target Duration (Minutes)
              </label>
              <div className="flex gap-1.5">
                {DURATION_OPTIONS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setMinutes(min)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                      minutes === min
                        ? 'bg-sage text-white shadow-xs font-bold'
                        : 'border border-line bg-canvas text-muted hover:border-sage/30'
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-faint mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-line bg-canvas py-2 px-3 text-xs text-ink focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/15"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 5-Minute Micro-Fallback */}
          <div className="rounded-2xl border border-sage/30 bg-sage-wash/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink">
              <Shield className="h-3.5 w-3.5 text-sage-deep" />
              <span>5-Minute Micro-Fallback (Zero-Guilt Protocol)</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              When busy days strike, what is the quick 5-minute version you can complete to preserve your streak?
            </p>
            <input
              type="text"
              value={microVersion}
              onChange={(e) => setMicroVersion(e.target.value)}
              placeholder="e.g., Read 2 pages / 5-min mobility stretch"
              required
              className="w-full rounded-xl border border-sage/30 bg-surface py-2 px-3.5 text-xs text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage/20 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-line px-5 py-2.5 text-xs font-medium text-muted hover:text-ink hover:bg-canvas transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="rounded-2xl bg-sage px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-sage-deep transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving Habit...' : 'Anchor Habit'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
