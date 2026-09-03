"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { weekDays } from '../../data/zenith';

const planned = [6, 6, 6, 6, 6, 6, 6];
const completed = [6, 5, 6, 4, 4, 5, 6];
const lateFinish = [false, false, false, true, true, false, false];

/** Planned vs completed sessions, with late-workday days called out. */
export function WeekChart() {
  const [active, setActive] = useState<number | null>(3);
  const max = 6;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium text-ink">Planned vs completed</p>
        <p className="text-xs text-muted">
          {active === null
            ? '42 planned · 36 completed'
            : `${weekDays[active]} · ${completed[active]} of ${planned[active]}${
                lateFinish[active] ? ' · worked past 7 PM' : ''
              }`}
        </p>
      </div>

      <div className="mt-5 flex items-end gap-2 sm:gap-4" style={{ height: 132 }}>
        {planned.map((p, i) => {
          const isActive = active === i;
          return (
            <button
              key={weekDays[i]}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`${weekDays[i]}: ${completed[i]} of ${p} completed`}
              className="group flex h-full flex-1 flex-col justify-end gap-2"
            >
              <div className="relative flex h-full items-end justify-center">
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-t-lg border border-b-0 border-dashed transition-colors duration-150 ease-out ${
                    isActive ? 'border-faint' : 'border-line'
                  }`}
                  style={{ height: `${(p / max) * 100}%` }}
                  aria-hidden
                />
                
                <motion.div
                  className={`relative w-full rounded-t-lg ${
                    lateFinish[i] ? 'bg-clay/70' : 'bg-sage/80'
                  } ${isActive ? 'opacity-100' : 'opacity-80'}`}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${(completed[i] / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
              <span
                className={`text-[11px] transition-colors duration-150 ease-out ${
                  isActive ? 'text-ink' : 'text-muted'
                }`}
              >
                {weekDays[i]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
