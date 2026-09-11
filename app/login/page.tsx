"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    const res = await signIn(email, password);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Failed to sign in. Please verify your credentials.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your circadian habit workspace."
      quotePrimary="Streaks measure obedience."
      quoteSecondary="Identity measures direction."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert Pill */}
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
            Email
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

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-faint">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-muted hover:text-sage-deep transition-colors"
            >
              Forgot?
            </Link>
          </div>
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
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-line text-sage focus:ring-sage/20 accent-sage cursor-pointer"
            />
            <span className="text-[11px]">Remember device</span>
          </label>
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
              <span>Entering...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </motion.button>
      </form>

      {/* Redirect to Register */}
      <div className="mt-6 text-center border-t border-line/40 pt-4">
        <p className="text-xs text-muted font-light">
          New to Zenith?{' '}
          <Link
            href="/register"
            className="font-medium text-sage-deep hover:underline transition-all"
          >
            Create account &rarr;
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
