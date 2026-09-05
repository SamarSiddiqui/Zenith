"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, CheckCircle2 } from 'lucide-react';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  category: 'design' | 'eng' | 'creative';
  quote: string;
  highlight: string;
  metrics: string;
  habitSaved: string;
}

const testimonials: Testimonial[] = [
  {
    id: 'elena',
    name: 'Elena R.',
    role: 'Senior Product Designer',
    category: 'design',
    quote: 'I used to abandon streak apps every time a sprint deadline hit. Zenith\'s 15-minute fallback versions saved my meditation habit 4 times last month alone.',
    highlight: 'Saved habit 4x during crunch',
    metrics: '92% Habit Health',
    habitSaved: 'Meditation (15m)'
  },
  {
    id: 'david',
    name: 'David K.',
    role: 'Software Engineer',
    category: 'eng',
    quote: 'Seeing that 80% of my missed workouts happened on days I worked past 7:30 PM was a revelation. It wasn\'t laziness; it was poor schedule design.',
    highlight: 'Diagnosed late-workday trigger',
    metrics: '3x More Recoveries',
    habitSaved: 'Morning Mobility'
  },
  {
    id: 'maya',
    name: 'Maya S.',
    role: 'Creative Director',
    category: 'creative',
    quote: 'The habit health score is so much more forgiving than zeroing counters. I don\'t dread opening the app after a busy weekend anymore.',
    highlight: 'No more zero-counter anxiety',
    metrics: '88% Median Health',
    habitSaved: 'Nightly Reading'
  }
];

export function SocialProof() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger entrance animation
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (containerRef.current) {
      tl.fromTo(
        containerRef.current.querySelectorAll('.gsap-proof-anim'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }
      );
    }

    return tl;
  });

  const filteredTestimonials = activeCategory === 'all'
    ? testimonials
    : testimonials.filter((t) => t.category === activeCategory);

  return (
    <section ref={sectionRef} id="proof" className="border-t border-line bg-surface py-20 lg:py-24">
      <div ref={containerRef} className="mx-auto w-full max-w-6xl px-5 lg:px-10">
        {/* Header & Rating */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="gsap-proof-anim flex items-center gap-1 text-sage-deep">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-sage-deep text-sage-deep" />
              ))}
              <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-muted">Early User Proof</span>
            </div>
            <h2 className="gsap-proof-anim mt-3 font-serif text-3xl text-ink md:text-4xl">
              Real people. Real schedule changes.
            </h2>
            <p className="gsap-proof-anim mt-2 text-base text-muted">
              Here is how early Zenith users maintain identity consistency when life gets busy.
            </p>
          </div>

          {/* Role Category Tabs */}
          <div className="gsap-proof-anim inline-flex shrink-0 rounded-full border border-line bg-canvas p-1">
            {[
              { id: 'all', label: 'All Proofs' },
              { id: 'design', label: 'Design' },
              { id: 'eng', label: 'Engineering' },
              { id: 'creative', label: 'Creative' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredTestimonials.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="gsap-proof-anim flex h-full flex-col justify-between rounded-3xl border border-line bg-canvas p-7 shadow-calm hover:border-sage/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Quote className="h-6 w-6 text-sage/60" />
                    <span className="rounded-full bg-sage-wash border border-sage/30 px-2.5 py-0.5 text-[10px] font-semibold text-sage-deep flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t.habitSaved}
                    </span>
                  </div>

                  <p className="mt-4 font-serif text-base italic leading-relaxed text-ink">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <span className="mt-4 inline-block rounded-full bg-surface border border-line px-3 py-1 text-xs font-medium text-sage-deep">
                    {t.highlight}
                  </span>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-line pt-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-sage-deep">{t.metrics}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

