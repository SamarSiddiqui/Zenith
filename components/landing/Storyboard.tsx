"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  X,
  Minimize2,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';

const SCENE_MS = 3600;

const scenes = [
  {
    day: 'Day 1',
    caption: 'Four habits, all inside the working window.',
    marks: ['done', 'done', 'done', 'done'] as const
  },
  {
    day: 'Day 4',
    caption: 'Workday ran to 8:40 PM. Second miss in a row.',
    marks: ['done', 'done', 'done', 'miss'] as const
  },
  {
    day: 'Day 5',
    caption: 'Shrunk, not skipped. Health recovering.',
    marks: ['done', 'done', 'done', 'shrunk'] as const
  }
];

const labels = ['Deep work', 'Walk', 'Meditation', 'Workout'];

export function Storyboard() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduced = useReducedMotion();
  const hovering = useRef(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      if (!hovering.current) setIndex((i) => (i + 1) % scenes.length);
    }, SCENE_MS);
    return () => window.clearInterval(id);
  }, [playing]);

  const scene = scenes[index];

  return (
    <div
      className="rounded-3xl border border-line bg-surface p-6 shadow-calm sm:p-8"
      onMouseEnter={() => {
        hovering.current = true;
      }}
      onMouseLeave={() => {
        hovering.current = false;
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-faint">Live product demo</p>
          <div className="mt-1 h-9 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h3
                key={scene.day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="font-serif text-2xl text-ink"
              >
                {scene.day}
              </motion.h3>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" role="tablist" aria-label="Storyboard scenes">
            {scenes.map((s, i) => (
              <button
                key={s.day}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={s.day}
                onClick={() => setIndex(i)}
                className="group relative h-1.5 overflow-hidden rounded-full bg-line transition-[width] duration-200 ease-out"
                style={{ width: i === index ? 32 : 10 }}
              >
                {i === index && (
                  <motion.span
                    key={`${index}-${playing}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-sage"
                    initial={{ width: reduced || !playing ? '100%' : '0%' }}
                    animate={{ width: '100%' }}
                    transition={{
                      duration: reduced || !playing ? 0 : SCENE_MS / 1000,
                      ease: 'linear'
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause demo' : 'Play demo'}
            className="rounded-full border border-line p-1.5 text-muted transition-colors duration-150 ease-out hover:text-ink"
          >
            {playing ? (
              <Pause className="h-3 w-3" strokeWidth={2} />
            ) : (
              <Play className="h-3 w-3" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3">
        {scene.marks.map((mark, i) => (
          <div key={labels[i]} className="text-center">
            <motion.div
              key={`${index}-${i}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border ${
                mark === 'miss'
                  ? 'border-clay/40 bg-clay-wash text-clay'
                  : mark === 'shrunk'
                  ? 'border-sage bg-sage text-white'
                  : 'border-sage/40 bg-sage-wash text-sage-deep'
              }`}
            >
              {mark === 'miss' ? (
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              ) : mark === 'shrunk' ? (
                <Minimize2 className="h-4 w-4" strokeWidth={2} aria-hidden />
              ) : (
                <Check className="h-5 w-5" strokeWidth={2} aria-hidden />
              )}
            </motion.div>
            <p className="mt-2 text-[11px] text-muted">{labels[i]}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted">{scene.caption}</p>

      <div className="mt-5 min-h-[132px]">
        <AnimatePresence mode="wait">
          {index === 1 && (
            <motion.div
              key="warning"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-2xl border border-clay/30 bg-clay-wash p-5"
            >
              <div className="flex gap-3">
                <motion.span
                  animate={reduced ? undefined : { opacity: [1, 0.45, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="mt-0.5 shrink-0 text-clay"
                >
                  <AlertTriangle className="h-4 w-4" strokeWidth={2} aria-hidden />
                </motion.span>
                <div>
                  <p className="text-sm leading-relaxed text-ink">
                    Workout habit at risk — 2 consecutive misses. Want to shrink today&apos;s
                    workout to 15 minutes?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white">
                      Shrink to 15 min
                    </span>
                    <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted">
                      Not today
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          {index === 2 && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-2xl border border-line bg-sage-wash p-5"
            >
              <p className="text-sm text-ink">Habit saved with the 15-minute version.</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white">
                  <motion.div
                    className="h-full rounded-full bg-sage"
                    initial={{ width: '54%' }}
                    animate={{ width: '88%' }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <span className="font-serif text-xl text-sage-deep">88%</span>
              </div>
              <p className="mt-2 text-xs text-muted">Habit health restored from 54% to 88%.</p>
            </motion.div>
          )}
          {index === 0 && (
            <motion.div
              key="baseline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="rounded-2xl border border-line bg-canvas p-5"
            >
              <p className="text-sm text-ink">All four habits fit inside 9:00 AM – 7:00 PM.</p>
              <p className="mt-2 text-xs text-muted">
                Zenith is watching timing, not just checkmarks.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
