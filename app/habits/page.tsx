"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { habits as seedHabits, weekDates, weekDays } from '../../data/zenith';
import type { HabitStatus } from '../../types/zenith';
import { SkipModal } from '../../components/habits/SkipModal';

const cycle: Record<HabitStatus, HabitStatus> = {
  unlogged: 'completed',
  completed: 'missed',
  missed: 'unlogged'
};

type Grid = Record<string, HabitStatus[]>;

export default function HabitsPage() {
  const [grid, setGrid] = useState<Grid>(
    Object.fromEntries(seedHabits.map((h) => [h.id, [...h.week]]))
  );
  const [modalHabit, setModalHabit] = useState<string | null>(null);

  const toggle = (habitId: string, habitName: string, dayIndex: number) => {
    setGrid((prev) => {
      const row = [...prev[habitId]];
      const next = cycle[row[dayIndex]];
      row[dayIndex] = next;
      if (next === 'missed') setModalHabit(habitName);
      return { ...prev, [habitId]: row };
    });
  };

  return (
    <Layout userName="Samar">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted">Weekly planner</p>
            <h1 className="mt-1.5 font-serif text-4xl text-ink">Oct 12 – Oct 18</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous week"
              className="rounded-full border border-line bg-surface p-2.5 text-ink transition-colors duration-150 ease-out hover:bg-sidebar"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-sidebar"
            >
              This week
            </button>
            <button
              type="button"
              aria-label="Next week"
              className="rounded-full border border-line bg-surface p-2.5 text-ink transition-colors duration-150 ease-out hover:bg-sidebar"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.9} />
            </button>
          </div>
        </header>

        <div className="overflow-x-auto rounded-3xl border border-line bg-surface shadow-calm">
          <table className="w-full min-w-[680px] border-collapse">
            <caption className="sr-only">Weekly habit completion matrix</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-[0.14em] text-faint">
                  Habit
                </th>
                {weekDays.map((day, i) => (
                  <th key={day} scope="col" className="px-2 py-4 text-center">
                    <span className="block text-xs uppercase tracking-[0.1em] text-faint">{day}</span>
                    <span className={`mt-1 block text-sm ${i === 3 ? 'font-medium text-ink' : 'text-muted'}`}>
                      {weekDates[i]}
                    </span>
                  </th>
                ))}
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-[0.14em] text-faint">
                  Health
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {seedHabits.map((habit) => (
                <tr key={habit.id} className="transition-colors duration-150 ease-out hover:bg-canvas">
                  <th scope="row" className="px-6 py-4 text-left">
                    <span className="block text-sm font-medium text-ink">{habit.name}</span>
                    <span className="mt-0.5 block text-xs font-normal text-muted">{habit.window}</span>
                  </th>
                  {grid[habit.id].map((status, i) => (
                    <td key={`${habit.id}-${i}`} className="px-2 py-4 text-center">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.88 }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        onClick={() => toggle(habit.id, habit.name, i)}
                        aria-label={`${habit.name} on ${weekDays[i]} ${weekDates[i]} — ${status}`}
                        className={[
                          'mx-auto flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-150 ease-out',
                          status === 'completed'
                            ? 'border-sage bg-sage text-white'
                            : status === 'missed'
                            ? 'border-clay bg-clay text-white'
                            : 'border-dashed border-faint text-transparent hover:border-sage'
                        ].join(' ')}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={status}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ duration: 0.13, ease: [0.23, 1, 0.32, 1] }}
                          >
                            {status === 'missed' ? (
                              <X className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
                            ) : (
                              <Check className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
                            )}
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        habit.health >= 80
                          ? 'border-sage/40 bg-sage-wash text-sage-deep'
                          : habit.health >= 65
                          ? 'border-line bg-canvas text-muted'
                          : 'border-clay/35 bg-clay-wash text-clay'
                      }`}
                    >
                      {habit.health}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-6 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sage" aria-hidden /> Completed
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-clay" aria-hidden /> Missed
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-dashed border-faint" aria-hidden /> Unlogged
          </span>
        </div>

        <SkipModal habitName={modalHabit} onClose={() => setModalHabit(null)} />
      </div>
    </Layout>
  );
}
