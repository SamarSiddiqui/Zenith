"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Clock, CheckCircle2, SlidersHorizontal, ShieldCheck } from 'lucide-react';
import type { WorkingWindow } from '../../../types/auth';

interface ChapterLaunchpadProps {
  firstName?: string;
  workingWindow: WorkingWindow;
  onWindowChange: (nextWindow: WorkingWindow) => void;
  isReplaying?: boolean;
}

const WINDOW_PRESETS = [
  { label: 'Early Bird', startTime: '07:00', endTime: '17:00' },
  { label: 'Balanced', startTime: '09:00', endTime: '19:00' },
  { label: 'Night Owl', startTime: '11:00', endTime: '21:00' },
];

function format12h(time24: string) {
  if (!time24) return '09:00 AM';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr || '9', 10);
  const m = mStr || '00';
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

export function ChapterLaunchpad({
  firstName,
  workingWindow,
  onWindowChange,
  isReplaying = false,
}: ChapterLaunchpadProps) {
  const [showWindowEditor, setShowWindowEditor] = useState(false);

  const calculateHours = () => {
    const [sH, sM] = (workingWindow.startTime || '09:00').split(':').map(Number);
    const [eH, eM] = (workingWindow.endTime || '19:00').split(':').map(Number);
    const diffMins = eH * 60 + eM - (sH * 60 + sM);
    return Math.max(1, diffMins / 60).toFixed(1);
  };

  return (
    <div className="space-y-4">
      {/* Sanctuary Ready Summary Card */}
      <div className="rounded-2xl border border-sage/35 bg-sage-wash/45 p-4 sm:p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-sage-deep">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isReplaying ? 'Story Complete' : 'Sanctuary Initialized'}</span>
            </div>
            <p className="text-sm sm:text-base font-serif font-bold text-ink">
              {firstName ? `${firstName}'s` : 'Your'} personal rhythm is ready.
            </p>
          </div>
          <span className="rounded-full border border-sage/30 bg-surface px-2.5 py-1 text-[10px] font-mono font-semibold text-sage-deep shrink-0">
            {calculateHours()}h Window
          </span>
        </div>

        {/* 3 Calm Checkpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-line/70 bg-surface/90 px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0" />
            <span className="text-[11px] text-ink font-medium truncate">
              {format12h(workingWindow.startTime)} – {format12h(workingWindow.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line/70 bg-surface/90 px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0" />
            <span className="text-[11px] text-ink font-medium truncate">Zero-Guilt Momentum</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-line/70 bg-surface/90 px-3 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep shrink-0" />
            <span className="text-[11px] text-ink font-medium truncate">5m Micro-Fallbacks</span>
          </div>
        </div>

        {/* Optional Soft Window Tuner Toggle */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowWindowEditor((prev) => !prev)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-sage-deep hover:underline cursor-pointer"
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span>
              {showWindowEditor
                ? 'Hide working hours editor'
                : 'Optional: Adjust your Working Window hours'}
            </span>
          </button>
        </div>

        {/* Expandable Soft Working Window Picker */}
        <AnimatePresence>
          {showWindowEditor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-3 border-t border-sage/20">
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {WINDOW_PRESETS.map((preset) => {
                    const isMatch =
                      workingWindow.startTime === preset.startTime &&
                      workingWindow.endTime === preset.endTime;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          onWindowChange({
                            ...workingWindow,
                            startTime: preset.startTime,
                            endTime: preset.endTime,
                          })
                        }
                        className={`rounded-xl border px-2.5 py-1 text-[10px] font-mono transition-colors cursor-pointer ${
                          isMatch
                            ? 'border-sage bg-sage text-white font-semibold'
                            : 'border-line bg-surface text-muted hover:text-ink hover:border-sage/40'
                        }`}
                      >
                        {preset.label} ({format12h(preset.startTime)}–{format12h(preset.endTime)})
                      </button>
                    );
                  })}
                </div>

                {/* Custom Time Inputs */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-line bg-surface p-2.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-faint mb-1">
                      <Sun className="h-3 w-3 text-amber-500" />
                      <span>Starts</span>
                    </label>
                    <input
                      type="time"
                      value={workingWindow.startTime}
                      onChange={(e) =>
                        onWindowChange({
                          ...workingWindow,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full bg-transparent font-serif text-base sm:text-lg font-bold text-ink focus:outline-none"
                    />
                  </div>

                  <div className="rounded-xl border border-line bg-surface p-2.5">
                    <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-faint mb-1">
                      <Moon className="h-3 w-3 text-sage-deep" />
                      <span>Closes</span>
                    </label>
                    <input
                      type="time"
                      value={workingWindow.endTime}
                      onChange={(e) =>
                        onWindowChange({
                          ...workingWindow,
                          endTime: e.target.value,
                        })
                      }
                      className="w-full bg-transparent font-serif text-base sm:text-lg font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted text-center">
        <Clock className="h-3 w-3 text-sage-deep shrink-0" />
        <span>You can add habits or refine your schedule anytime—no pressure right now.</span>
      </p>
    </div>
  );
}

