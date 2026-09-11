"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { createClient } from '../../lib/supabase/client';
import { isSupabaseConfigured } from '../../lib/supabase/env';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    try {
      if (supabase && configured) {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${origin}/auth/callback?next=/reset-password`,
        });

        if (resetError) {
          setError(resetError.message);
          setLoading(false);
          return;
        }
      }

      setSubmitted(true);
      setLoading(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to send password reset request.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email to receive recovery instructions."
      quotePrimary="A mindful pause before the next step."
      quoteSecondary="Access your sanctuary."
    >
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center py-2"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div>
            <h3 className="font-serif text-xl text-ink">Check your inbox</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed font-light">
              We&apos;ve sent a secure recovery link to <strong className="text-ink font-medium">{email}</strong>.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-sage px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-sage-deep"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 rounded-2xl border border-clay/30 bg-clay-wash/80 p-3 text-xs text-clay"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-faint mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                required
                className="w-full rounded-2xl border border-line/70 bg-canvas/60 py-2.5 pl-9 pr-4 text-xs text-ink placeholder:text-faint/80 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/15 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="mt-2 w-full rounded-2xl bg-sage py-3 text-xs font-medium text-white shadow-xs transition-colors hover:bg-sage-deep disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Sending link...</span>
              </>
            ) : (
              <>
                <span>Send Recovery Link</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </motion.button>

          {/* Back to Login */}
          <div className="mt-6 text-center border-t border-line/40 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-sage-deep transition-colors font-light"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
