"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Watch, Users, Smartphone, Clock, Sparkles } from 'lucide-react';
import { Reveal } from '../visuals/Reveal';

const upcomingItems = [
  {
    icon: Calendar,
    title: 'Google & Apple Calendar Sync',
    description: 'Auto-detect meeting overruns in real time and dynamically adjust your evening habit windows.',
    timeline: 'In Development',
    highlight: true
  },
  {
    icon: Watch,
    title: 'Biometric Recovery (Oura / Apple Health)',
    description: 'Predict cognitive fatigue and auto-suggest micro-doses based on HRV and sleep data.',
    timeline: 'Q1 2027',
    highlight: false
  },
  {
    icon: Users,
    title: 'Private Identity Circles',
    description: 'Asynchronous group momentum sharing to support consistency without toxic leaderboards.',
    timeline: 'Q2 2027',
    highlight: false
  },
  {
    icon: Smartphone,
    title: 'iOS & Android Mobile Apps',
    description: 'Full-featured native mobile applications for iPhone and Android with offline-first habit tracking.',
    timeline: 'Q3 2027',
    highlight: false
  }
];

export function RoadmapTeaser() {
  return (
    <div className="mt-14 border-t border-line/70 pt-10">
      <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sage-deep">
            <Clock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-widest font-semibold">Future Capabilities</span>
          </div>
          <h3 className="mt-1 font-serif text-xl text-ink">What we&apos;re building next</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage-wash px-3.5 py-1 text-xs font-medium text-sage-deep">
            <Sparkles className="w-3 h-3" />
            Product Evolution Roadmap
          </span>
        </div>
      </Reveal>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {upcomingItems.map(({ icon: Icon, title, description, timeline, highlight }, i) => (
          <Reveal as="li" key={title} delay={i * 0.05}>
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className={`group flex h-full flex-col justify-between rounded-2xl border p-4 transition-all ${highlight
                  ? 'border-sage/40 bg-surface shadow-xs hover:border-sage'
                  : 'border-line bg-surface/80 hover:border-line/80 hover:bg-surface'
                }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${highlight ? 'border-sage/30 bg-sage-wash text-sage-deep' : 'border-line bg-canvas text-muted'
                    }`}>
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-medium ${highlight
                      ? 'bg-sage text-white'
                      : 'border border-line bg-canvas text-faint group-hover:text-muted'
                    }`}>
                    {timeline}
                  </span>
                </div>
                <h4 className="mt-3 font-serif text-sm font-semibold text-ink">{title}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
