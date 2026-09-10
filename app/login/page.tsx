"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../../components/auth/AuthLayout';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setLoading(true);
    // Simulate brief transition for UI polish
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const handleDemoLogin = () => {
    setEmail('samar@zenith.app');
    setPassword('zenith2026');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 500);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to review your usable working window & habit health engine."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert Pill */}
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

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-faint font-mono">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted hover:text-sage-deep transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full rounded-2xl border border-line bg-canvas py-3 pl-10 pr-11 text-sm text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me Toggle */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-md border-line bg-canvas text-sage focus:ring-sage/30 accent-sage cursor-pointer"
            />
            <span>Remember this device</span>
          </label>
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
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Zenith</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>

        {/* Demo Quick Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full rounded-2xl border border-sage/30 bg-sage-wash/60 py-2.5 text-xs font-semibold text-sage-deep transition-colors hover:bg-sage-wash hover:border-sage flex items-center justify-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>One-Click Demo Preview</span>
        </button>
      </form>

      {/* Redirect to Register */}
      <div className="mt-7 text-center border-t border-line/60 pt-5">
        <p className="text-xs text-muted">
          Don&apos;t have an account yet?{' '}
          <Link
            href="/register"
            className="font-medium text-sage-deep hover:underline transition-all"
          >
            Start building free &rarr;
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

