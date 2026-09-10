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
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login?reset=true`,
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
      title="Reset your password"
      subtitle="Enter your email to receive a secure password recovery link."
    >
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div>
            <h3 className="font-serif text-xl text-ink">Check your inbox</h3>
            <p className="mt-1.5 text-xs text-muted leading-relaxed">
              We&apos;ve sent instructions to <strong className="text-ink font-medium">{email}</strong> to reset your password.
            </p>
          </div>

          <div className="pt-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-sage px-6 py-3 text-xs font-medium text-white transition-colors hover:bg-sage-deep"
            >
              <ArrowLeft className="h-4 w-4" />
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
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2 rounded-2xl border border-clay/40 bg-clay-wash p-3.5 text-xs font-medium text-clay"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-faint mb-1.5 font-mono">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-2xl border border-line bg-canvas py-3 pl-10 pr-4 text-sm text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="mt-2 w-full rounded-2xl bg-sage py-3.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-sage-deep disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending reset link...</span>
              </>
            ) : (
              <>
                <span>Send Recovery Instructions</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </motion.button>

          {/* Back to Login */}
          <div className="mt-6 text-center border-t border-line/60 pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-sage-deep transition-colors"
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
