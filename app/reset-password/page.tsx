"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { createClient } from '../../lib/supabase/client';
import { isSupabaseConfigured } from '../../lib/supabase/env';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const supabase = createClient();
  const configured = isSupabaseConfigured();

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-line' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-clay' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-sand' };
    if (score >= 3) return { score: 3, label: 'Serene', color: 'bg-sage' };
    return { score: 1, label: 'Weak', color: 'bg-clay' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      if (supabase && configured) {
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) {
          setError(updateError.message);
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter a new password for your Zenith account."
      quotePrimary="A fresh start honors the journey."
      quoteSecondary="Momentum without friction."
    >
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 text-center py-2"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div>
            <h3 className="font-serif text-xl text-ink">Password updated</h3>
            <p className="mt-1 text-xs text-muted leading-relaxed font-light">
              Your password has been changed securely. Redirecting to your dashboard...
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-sage px-5 py-2.5 text-xs font-medium text-white hover:bg-sage-deep transition-colors"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
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

          {/* New Password */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-faint mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-2xl border border-line/70 bg-canvas/60 py-2.5 pl-9 pr-10 text-xs text-ink placeholder:text-faint/80 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                <div className="flex items-center justify-between text-[10px] text-faint font-mono">
                  <span>Strength:</span>
                  <span className="text-ink font-medium">{passwordStrength.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 h-1">
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 1 ? passwordStrength.color : 'bg-line/40'
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 2 ? passwordStrength.color : 'bg-line/40'
                    }`}
                  />
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      passwordStrength.score >= 3 ? passwordStrength.color : 'bg-line/40'
                    }`}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-faint mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
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
                <span>Saving new password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </motion.button>
        </form>
      )}
    </AuthLayout>
  );
}
