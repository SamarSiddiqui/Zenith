"use client";

import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { useGSAPScrollTrigger } from '../../hooks/useGSAPScrollTrigger';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 'free',
    question: 'Is Zenith free to use?',
    answer: 'Yes. Zenith is completely free while you build your first 3 core habits — full access to working window scheduling, early warning diagnosis, and adaptive recovery routines with no credit card required.'
  },
  {
    id: 'diagnosis',
    question: 'How does the AI diagnosis actually work?',
    answer: 'Zenith cross-references your completion timestamps against your working hours window to identify contextual correlations — like work meeting overruns, late finishes, or energy dips — rather than blaming your willpower.'
  },
  {
    id: 'data',
    question: 'What happens to my personal schedule & habit data?',
    answer: 'Your schedule data and habit logs are strictly private, encrypted at rest and in transit. We never sell your data or use your private behavioral habits to train public LLM models.'
  },
  {
    id: 'hours',
    question: 'Do I need to set exact working hours or can I adjust them later?',
    answer: 'You can start with flexible default working hours (e.g., 9:00 AM – 7:00 PM) and easily adjust your window or add custom day rules anytime inside settings as your daily routine evolves.'
  }
];

export function TrustFAQ() {
  const [openId, setOpenId] = useState<string | null>('free');
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger entrance animation
  const sectionRef = useGSAPScrollTrigger<HTMLElement>((gsap) => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    if (containerRef.current) {
      tl.fromTo(
        containerRef.current.querySelectorAll('.gsap-faq-anim'),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }
      );
    }

    return tl;
  });

  return (
    <section ref={sectionRef} id="faq" className="border-t border-line bg-canvas">
      <div ref={containerRef} className="mx-auto w-full max-w-4xl px-5 py-20 lg:px-10 lg:py-24">
        {/* Header */}
        <div className="text-center">
          <div className="gsap-faq-anim inline-flex items-center gap-1.5 rounded-full border border-sage/30 bg-sage-wash px-3 py-1 text-xs font-semibold text-sage-deep">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trust & Transparency
          </div>
          <h2 className="gsap-faq-anim mt-3 font-serif text-3xl text-ink md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="gsap-faq-anim mt-3 text-base text-muted">
            Everything you need to know before starting your first working window.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="mt-12 space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`gsap-faq-anim overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen ? 'border-sage/60 bg-surface shadow-xs ring-1 ring-sage/20' : 'border-line bg-surface hover:border-sage/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`font-serif text-lg transition-colors ${isOpen ? 'text-sage-deep font-semibold' : 'text-ink'}`}>
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`shrink-0 ${isOpen ? 'text-sage-deep' : 'text-muted'}`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <div className="border-t border-line/60 px-6 pb-6 pt-4 text-sm leading-relaxed text-muted">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

