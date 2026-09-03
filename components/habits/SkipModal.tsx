"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { skipReasons } from '../../data/zenith';

interface SkipModalProps {
  habitName: string | null;
  onClose: () => void;
}

export function SkipModal({ habitName, onClose }: SkipModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const response = skipReasons.find((r) => r.id === selected)?.response;

  const close = () => {
    setSelected(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {habitName && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-ink/30" onClick={close} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Why did you skip?"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-7 shadow-calm"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full p-1.5 text-faint transition-colors duration-150 ease-out hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={1.9} />
            </button>

            <p className="text-xs uppercase tracking-[0.16em] text-faint">One tap</p>
            <h2 className="mt-2 max-w-sm font-serif text-2xl leading-snug text-ink">
              What got in the way of {habitName} today?
            </h2>

            <div className="mt-6 flex flex-wrap gap-2">
              {skipReasons.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelected(reason.id)}
                  aria-pressed={selected === reason.id}
                  className={[
                    'rounded-full border px-4 py-2 text-sm transition-colors duration-150 ease-out',
                    selected === reason.id
                      ? 'border-sage bg-sage text-white'
                      : 'border-line bg-canvas text-ink hover:border-faint'
                  ].join(' ')}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <div className="mt-6 min-h-[92px]">
              <AnimatePresence mode="wait">
                {response ? (
                  <motion.div
                    key={selected}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-2xl border border-sage/35 bg-sage-wash p-5"
                  >
                    <div className="flex gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sage-deep" strokeWidth={1.9} aria-hidden />
                      <p className="text-sm leading-relaxed text-ink">{response}</p>
                    </div>
                  </motion.div>
                ) : (
                  <p key="empty" className="text-sm text-muted">
                    Zenith uses this to find the pattern behind the miss — not to score you.
                  </p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-full px-5 py-2.5 text-sm text-muted transition-colors duration-150 ease-out hover:text-ink"
              >
                Skip question
              </button>
              <button
                type="button"
                onClick={close}
                disabled={!selected}
                className="rounded-full bg-sage px-6 py-2.5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-sage-deep disabled:cursor-not-allowed disabled:bg-faint"
              >
                Save reason
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
