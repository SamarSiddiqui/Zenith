"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { habits as seedHabits } from '../../data/zenith';
import type { HabitStatus } from '../../types/zenith';

const nextStatus: Record<HabitStatus, HabitStatus> = {
  unlogged: 'completed',
  completed: 'missed',
  missed: 'unlogged'
};

function healthTone(health: number) {
  if (health >= 80) return 'border-sage/40 bg-sage-wash text-sage-deep';
  if (health >= 65) return 'border-line bg-canvas text-muted';
  return 'border-clay/35 bg-clay-wash text-clay';
}

export function TodayHabitList() {
  const [statuses, setStatuses] = useState<Record<string, HabitStatus>>(
    Object.fromEntries(seedHabits.map((h) => [h.id, h.status]))
  );

  const done = Object.values(statuses).filter((s) => s === 'completed').length;

  return (
    <section aria-label="Today's focus">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-2xl text-ink">Today&apos;s focus</h2>
        <p className="text-sm text-muted">
          <motion.span
            key={done}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="inline-block font-medium text-ink"
          >
            {done}
          </motion.span>{' '}
          of {seedHabits.length} logged
        </p>
      </div>

      <ul className="mt-5 grid gap-3">
        {seedHabits.map((habit, i) => {
          const status = statuses[habit.id];
          return (
            <motion.li
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ x: 2 }}
              className={`flex items-center gap-4 rounded-2xl border bg-surface px-5 py-4 shadow-calm transition-colors duration-150 ease-out ${
                status === 'completed'
                  ? 'border-sage/35'
                  : status === 'missed'
                  ? 'border-clay/35'
                  : 'border-line'
              }`}
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                onClick={() =>
                  setStatuses((s) => ({ ...s, [habit.id]: nextStatus[s[habit.id]] }))
                }
                aria-label={`${habit.name} is ${status}. Change status.`}
                className={[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ease-out',
                  status === 'completed'
                    ? 'border-sage bg-sage text-white'
                    : status === 'missed'
                    ? 'border-clay bg-clay text-white'
                    : 'border-dashed border-faint bg-transparent text-transparent hover:border-sage'
                ].join(' ')}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={status}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {status === 'missed' ? (
                      <X className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                    ) : (
                      <Check className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium transition-colors duration-150 ease-out ${
                    status === 'completed' ? 'text-muted line-through decoration-sage/60' : 'text-ink'
                  }`}
                >
                  {habit.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {habit.window} · {habit.minutes} min
                </p>
                <div className="mt-2 h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-canvas">
                  <motion.div
                    className={`h-full rounded-full ${habit.health >= 65 ? 'bg-sage' : 'bg-clay'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${habit.health}%` }}
                    transition={{ duration: 0.6, delay: 0.1 + i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${healthTone(
                  habit.health
                )}`}
              >
                {habit.health}% health
              </span>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
