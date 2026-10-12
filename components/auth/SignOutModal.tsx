"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, ShieldCheck, Loader2 } from 'lucide-react';

interface SignOutModalProps {
  isOpen: boolean;
  isSigningOut?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function SignOutModal({
  isOpen,
  isSigningOut = false,
  onConfirm,
  onClose,
}: SignOutModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSigningOut) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSigningOut, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="signout-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            onClick={!isSigningOut ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            key="signout-card"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signout-modal-title"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isSigningOut}
              className="absolute top-4 right-4 p-2 text-muted hover:text-ink rounded-full hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon and Heading */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clay-wash text-clay border border-clay/30">
                <LogOut className="h-5 w-5 stroke-[1.8]" />
              </div>
              <div>
                <h3 id="signout-modal-title" className="font-serif text-xl text-ink">
                  Sign out of Zenith?
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  Your habit completions, active sprints, and circadian reflections are safely synced to the cloud. You can return anytime to continue your momentum.
                </p>
              </div>
            </div>

            {/* Sync status reassurance */}
            <div className="mt-5 rounded-2xl border border-sage/30 bg-sage-wash/60 p-3.5 flex items-center gap-2.5 text-xs text-sage-deep">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>All active sprint data is saved. No progress will be lost.</span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isSigningOut}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-line bg-canvas hover:bg-surface text-xs font-medium text-ink transition-colors disabled:opacity-50 cursor-pointer"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                disabled={isSigningOut}
                onClick={onConfirm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-clay text-white hover:bg-clay/90 transition-colors text-xs font-semibold shadow-xs disabled:opacity-75 cursor-pointer"
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Confirm Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
