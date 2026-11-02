"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';

interface DeleteAllHabitsModalProps {
  isOpen: boolean;
  habitCount: number;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteAllHabitsModal({
  isOpen,
  habitCount,
  isDeleting = false,
  onConfirm,
  onClose,
}: DeleteAllHabitsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="delete-all-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/30 backdrop-blur-xs"
            onClick={!isDeleting ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            key="delete-all-card"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-all-modal-title"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 text-muted hover:text-ink rounded-full hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon and Heading */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clay-wash text-clay border border-clay/30 shadow-xs">
                <Trash2 className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div className="pr-6">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-clay font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  Irreversible Action
                </span>
                <h3 id="delete-all-modal-title" className="font-serif text-xl text-ink mt-0.5">
                  Delete all rituals?
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  Are you sure you want to remove all <strong className="text-ink font-semibold">{habitCount} active {habitCount === 1 ? 'habit' : 'habits'}</strong>? This will wipe your active habit planner clean for a fresh start.
                </p>
              </div>
            </div>

            {/* Preservation reassurance */}
            <div className="mt-5 rounded-2xl border border-sage/30 bg-sage-wash/60 p-3.5 flex items-center gap-2.5 text-xs text-sage-deep">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Your completed sprint retrospectives and past week snapshots will be preserved.</span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-2 border-t border-line/60">
              <button
                type="button"
                disabled={isDeleting}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-line bg-canvas hover:bg-surface text-xs font-medium text-ink transition-colors disabled:opacity-50 cursor-pointer"
              >
                Keep Habits
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={onConfirm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-clay text-white hover:bg-clay/90 transition-colors text-xs font-semibold shadow-xs disabled:opacity-75 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting all...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All {habitCount} Rituals</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
