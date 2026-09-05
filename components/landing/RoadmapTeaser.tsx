"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Bot, Users, Zap, Clock } from 'lucide-react';
import { Reveal } from '../visuals/Reveal';

const upcomingItems = [
  {
    icon: Calendar,
    title: 'Bi-directional Calendar Sync',
    description: 'Auto-adjust habit windows when meetings are moved or extended.'
  },
  {
    icon: Bot,
    title: 'Weekly AI Behavioral Autopsy',
    description: 'Deep weekly reports analyzing hidden schedule fatigue patterns.'
  },
  {
    icon: Users,
    title: 'Identity Accountability Circles',
    description: 'Private, non-judgmental group momentum sharing.'
  },
  {
    icon: Zap,
    title: 'Energy-Curve Learning',
    description: 'Predictive habit scheduling based on biometric circadian rhythm.'
  }
];

export function RoadmapTeaser() {
  return (
    <div className="mt-14 border-t border-line/70 pt-10">
      <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sage-deep">
            <Clock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">Active Development Roadmap</span>
          </div>
          <h3 className="mt-1 font-serif text-xl text-ink">What we&apos;re building next</h3>
        </div>
        <span className="w-fit rounded-full border border-sage/30 bg-sage-wash px-3.5 py-1 text-xs font-medium text-sage-deep">
          Product Evolution · Q4 2026
        </span>
      </Reveal>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {upcomingItems.map(({ icon: Icon, title, description }, i) => (
          <Reveal as="li" key={title} delay={i * 0.05}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-surface/80 p-4 transition-colors hover:border-sage/40 hover:bg-surface"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-sage-deep" strokeWidth={2} />
                  <span className="rounded-md border border-line bg-canvas px-2 py-0.5 text-[10px] font-medium text-faint group-hover:text-muted">
                    Soon
                  </span>
                </div>
                <h4 className="mt-3 font-serif text-sm font-medium text-ink">{title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
