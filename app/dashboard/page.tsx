"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../../components/Layout';
import { WorkingWindow } from '../../components/dashboard/WorkingWindow';
import { RiskBanner } from '../../components/dashboard/RiskBanner';
import { EveningOrganizer } from '../../components/dashboard/EveningOrganizer';
import { TodayHabitList } from '../../components/dashboard/TodayHabitList';
import { HealthRing } from '../../components/visuals/HealthRing';
import { Sparkbars } from '../../components/visuals/Sparkbars';
import { CountUp } from '../../components/visuals/CountUp';

const thirtyDays = [
  4, 5, 6, 5, 6, 3, 4, 6, 6, 5, 2, 4, 6, 6, 5, 6, 3, 5, 6, 6, 4, 2, 5, 6, 6, 5, 6, 4, 6, 5
];

const missDays = [5, 10, 16, 21, 27];

const card = 'flex flex-col rounded-2xl border border-line bg-surface px-5 py-5 shadow-calm';

export default function DashboardPage() {
  const userName = 'Samar';

  return (
    <Layout userName={userName}>
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="text-sm text-muted">Wednesday, October 15</p>
            <h1 className="mt-1.5 font-serif text-4xl text-ink md:text-5xl">
              Good afternoon, {userName}
            </h1>
          </motion.div>
          <motion.div
            className="w-full lg:max-w-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
          >
            <WorkingWindow />
          </motion.div>
        </header>

        <RiskBanner />

        <motion.section
          aria-label="Key metrics"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {[
            <div key="total" className={card}>
              <p className="text-xs uppercase tracking-[0.14em] text-faint">Total habits</p>
              <p className="mt-3 font-serif text-3xl text-ink">
                <CountUp value={6} />
              </p>
              <div className="mt-auto flex items-center gap-1.5 pt-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 flex-1 rounded-full bg-sage/70"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{ transformOrigin: 'left' }}
                    transition={{ duration: 0.24, delay: 0.1 + i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                  />
                ))}
              </div>
            </div>,

            <div key="completion" className={card}>
              <p className="text-xs uppercase tracking-[0.14em] text-faint">Today&apos;s completion</p>
              <p className="mt-3 font-serif text-3xl text-ink">4/6</p>
              <div className="mt-auto pt-3">
                <div className="h-2 overflow-hidden rounded-full bg-canvas">
                  <motion.div
                    className="h-full rounded-full bg-sage"
                    initial={{ width: 0 }}
                    animate={{ width: '67%' }}
                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  <CountUp value={67} suffix="%" /> complete
                </p>
              </div>
            </div>,

            <div key="health" className={`${card} items-start`}>
              <p className="text-xs uppercase tracking-[0.14em] text-faint">Average habit health</p>
              <div className="mt-3 flex w-full items-center gap-4">
                <HealthRing value={84} size={72} stroke={6} />
                <span className="text-xs text-sage-deep">Good</span>
              </div>
            </div>,

            <div key="consistency" className={card}>
              <p className="text-xs uppercase tracking-[0.14em] text-faint">30-day consistency</p>
              <p className="mt-3 font-serif text-3xl text-ink">
                <CountUp value={89} suffix="%" />
              </p>
              <div className="mt-auto pt-3">
                <Sparkbars values={thirtyDays} missed={missDays} height={30} />
                <p className="mt-2 text-xs text-muted">4 recoveries</p>
              </div>
            </div>
          ].map((child, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -3 }}
              className="flex"
            >
              <div className="w-full">{child}</div>
            </motion.div>
          ))}
        </motion.section>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <TodayHabitList />
          <EveningOrganizer />
        </div>
      </div>
    </Layout>
  );
}
