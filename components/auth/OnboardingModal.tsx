"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Sparkles,
  Check,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Compass,
  Zap,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const STARTER_HABITS = [
  { id: 'deep-work', name: 'Morning Deep Work', duration: 45, window: '09:00 - 10:30' },
  { id: 'mindful-break', name: 'Circadian Breath & Walk', duration: 15, window: '13:30 - 14:00' },
  { id: 'evening-review', name: 'Sunset Habit Review', duration: 10, window: '18:30 - 19:00' },
  { id: 'mindful-reading', name: 'Knowledge Immersion', duration: 25, window: '19:00 - 19:30' },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('19:00');
  const [selectedHabits, setSelectedHabits] = useState<string[]>(['deep-work', 'evening-review']);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Calculate usable window hours
  const calculateWindowHours = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
    return Math.max(0, (totalMinutes / 60)).toFixed(1);
  };

  const toggleHabit = (id: string) => {
    if (selectedHabits.includes(id)) {
      if (selectedHabits.length > 1) {
        setSelectedHabits(selectedHabits.filter((h) => h !== id));
      }
    } else {
      setSelectedHabits([...selectedHabits, id]);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    await updateProfile({
      onboarded: true,
      workingWindow: {
        startTime,
        endTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        activeDays: [1, 2, 3, 4, 5],
      },
    });
    setSaving(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-calm relative overflow-hidden"
      >
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-line/60 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage-wash text-xs font-bold text-sage-deep font-mono">
              {step}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted font-mono">
              Step {step} of 3
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                  s === step ? 'bg-sage' : s < step ? 'bg-sage/40' : 'bg-line'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Circadian Working Window */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5"
          >
            <div>
              <h3 className="font-serif text-2xl text-ink">Define Your Working Window</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Zenith only tracks habits within your usable energy window. Once the window closes, uncompleted items enter micro-recovery without guilt.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line bg-canvas p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint font-mono mb-2">
                  <Sun className="h-3.5 w-3.5 text-sand" />
                  <span>Day Starts</span>
                </div>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-transparent font-serif text-xl font-bold text-ink focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border border-line bg-canvas p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint font-mono mb-2">
                  <Moon className="h-3.5 w-3.5 text-sage" />
                  <span>Window Closes</span>
                </div>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-transparent font-serif text-xl font-bold text-ink focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-sage-wash/60 border border-sage/20 p-3.5">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-sage-deep" />
                <span className="text-xs font-medium text-ink">Calculated Daily Usable Hours</span>
              </div>
              <span className="font-mono text-xs font-bold text-sage-deep bg-surface px-2.5 py-1 rounded-xl border border-sage/30">
                {calculateWindowHours()} hrs
              </span>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-2xl bg-sage py-3 text-sm font-medium text-white transition-colors hover:bg-sage-deep flex items-center justify-center gap-2"
            >
              <span>Next: Starter Habits</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Step 2: Starter Habits Selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            <div>
              <h3 className="font-serif text-2xl text-ink">Choose Starter Focus Habits</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Select at least 2 foundational rituals to anchor into your working window.
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {STARTER_HABITS.map((habit) => {
                const selected = selectedHabits.includes(habit.id);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center justify-between rounded-2xl border p-3 cursor-pointer transition-all ${
                      selected
                        ? 'border-sage bg-sage-wash/70 text-ink'
                        : 'border-line bg-canvas text-muted hover:border-line/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-lg border text-white transition-colors ${
                          selected ? 'bg-sage border-sage' : 'border-line bg-surface'
                        }`}
                      >
                        {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-ink">{habit.name}</div>
                        <div className="text-[11px] text-faint font-mono">{habit.window} · {habit.duration} mins</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-2xl border border-line py-3 text-xs font-medium text-muted hover:text-ink transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 rounded-2xl bg-sage py-3 text-sm font-medium text-white transition-colors hover:bg-sage-deep flex items-center justify-center gap-2"
              >
                <span>Next: Recovery Principle</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Mindful Recovery Protocol */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5"
          >
            <div>
              <h3 className="font-serif text-2xl text-ink">The Zero-Guilt Principle</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Conventional habit trackers penalize missed days with broken streaks. Zenith preserves your momentum with intelligent recovery.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 rounded-2xl border border-line bg-canvas p-3">
                <ShieldCheck className="h-4 w-4 text-sage-deep shrink-0 mt-0.5" />
                <div className="text-xs text-muted leading-relaxed">
                  <strong className="text-ink font-medium">Auto-Recovery Queues:</strong> Missed habits break down into 5-minute micro-actions rather than high friction chores.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-line bg-canvas p-3">
                <Compass className="h-4 w-4 text-sage-deep shrink-0 mt-0.5" />
                <div className="text-xs text-muted leading-relaxed">
                  <strong className="text-ink font-medium">Circadian Resets:</strong> If your working window expires, Zenith gracefully preserves your health score.
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 rounded-2xl border border-line py-3 text-xs font-medium text-muted hover:text-ink transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="w-2/3 rounded-2xl bg-sage py-3 text-sm font-medium text-white transition-colors hover:bg-sage-deep disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Enter My Dashboard</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
