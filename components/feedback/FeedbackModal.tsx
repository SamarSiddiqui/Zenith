"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Sparkles,
  Bug,
  MessageSquare,
  X,
  Send,
  Loader2,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type FeedbackType = 'feature_idea' | 'improvement' | 'bug_report' | 'general';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: FeedbackType;
}

const FEEDBACK_TYPES = [
  {
    id: 'feature_idea' as const,
    label: 'Feature Idea',
    icon: Lightbulb,
    color: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
    activeBg: 'bg-amber-600 text-white',
    description: 'Suggest a brand new capability or tool for Zenith',
  },
  {
    id: 'improvement' as const,
    label: 'Improvement',
    icon: Sparkles,
    color: 'text-sage-deep bg-sage-wash border-sage/30',
    activeBg: 'bg-sage-deep text-white',
    description: 'Make an existing feature calmer, smoother, or faster',
  },
  {
    id: 'bug_report' as const,
    label: 'Issue / Bug',
    icon: Bug,
    color: 'text-clay bg-clay-wash border-clay/30',
    activeBg: 'bg-clay text-white',
    description: 'Report something that did not behave as expected',
  },
  {
    id: 'general' as const,
    label: 'General',
    icon: MessageSquare,
    color: 'text-ink bg-canvas border-line',
    activeBg: 'bg-ink text-white',
    description: 'Share your general experience or say hello',
  },
];

const CATEGORIES = [
  'Habit Planner & Sprint Horizon',
  'Focus Sanctuary & Ambient Audio',
  'AI Diagnosis & Growth Reflections',
  'Working Window & Circadian Rhythm',
  'Telegram Bot & Reminders',
  'User Interface & Design',
  'Performance & Sync',
  'Other / General',
];

export function FeedbackModal({
  isOpen,
  onClose,
  defaultType = 'feature_idea',
}: FeedbackModalProps) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  const [type, setType] = useState<FeedbackType>(defaultType);
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setTimeout(resetForm, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (title.trim().length < 3) {
      setErrorMessage('Please give your suggestion a brief title (at least 3 characters).');
      return;
    }

    if (message.trim().length < 8) {
      setErrorMessage('Please provide a little more detail so we can bring your idea to life.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          category,
          title: title.trim(),
          message: message.trim(),
          email: email.trim() || undefined,
          userId: user?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      setErrorMessage(err.message || 'Unable to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="feedback-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/30 backdrop-blur-xs"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            key="feedback-card"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute top-4 right-4 p-2 text-muted hover:text-ink rounded-full hover:bg-canvas transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Close feedback modal"
            >
              <X className="w-4 h-4" />
            </button>

            {isSuccess ? (
              /* Success Screen */
              <div className="py-8 text-center space-y-4">
                <div className="h-16 w-16 mx-auto rounded-3xl bg-sage-wash border border-sage/30 flex items-center justify-center text-sage-deep shadow-xs">
                  <CheckCircle2 className="h-8 w-8 stroke-[1.75]" />
                </div>

                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="font-serif text-2xl text-ink">
                    Thank you for shaping Zenith
                  </h3>
                  <p className="text-xs text-muted leading-relaxed font-light">
                    Your idea has been directly received. We review every submission when planning upcoming sprint releases.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-sage-deep text-white hover:bg-sage text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Back to Flow</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Form Screen */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3.5 pr-8">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/25 shadow-xs">
                    <Lightbulb className="h-5 w-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <h2 id="feedback-modal-title" className="font-serif text-xl sm:text-2xl text-ink">
                      Share Feedback &amp; Ideas
                    </h2>
                    <p className="mt-0.5 text-xs text-muted font-light">
                      What would make Zenith even calmer, more joyful, or more supportive for your daily rhythm?
                    </p>
                  </div>
                </div>

                {/* Type Selector Pills */}
                <div className="pt-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5">
                    Feedback Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {FEEDBACK_TYPES.map((t) => {
                      const Icon = t.icon;
                      const isSelected = type === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setType(t.id)}
                          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? `${t.activeBg} border-transparent shadow-xs font-semibold`
                              : 'border-line bg-canvas/70 text-muted hover:text-ink hover:bg-canvas'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Area / Category */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5">
                    Product Area
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-3.5 text-xs text-ink focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5">
                    Headline / Summary
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      type === 'feature_idea'
                        ? 'e.g. Ambient chime at the end of each habit window'
                        : type === 'bug_report'
                        ? 'e.g. History button doesn’t show correct date on mobile'
                        : 'e.g. Allow dragging rituals between morning and afternoon'
                    }
                    className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-3.5 text-xs text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-all"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5">
                    Details &amp; Motivation
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what problem this solves, how it would help your rhythm, or how you envision it working..."
                    className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-3.5 text-xs text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-all resize-none"
                  />
                </div>

                {/* Email for updates */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-muted mb-1.5">
                    Your Email (Optional, to notify you when planned)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-line bg-canvas py-2 px-3.5 text-xs text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage transition-all"
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <p className="text-xs text-clay font-medium bg-clay-wash/60 p-2.5 rounded-xl border border-clay/30">
                    {errorMessage}
                  </p>
                )}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line/60">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-xl border border-line bg-canvas hover:bg-surface text-xs font-medium text-muted hover:text-ink transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sage-deep text-white hover:bg-sage transition-colors text-xs font-semibold shadow-xs disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

