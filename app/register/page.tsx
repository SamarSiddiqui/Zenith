"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signUp } = useAuth();

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

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreedTerms) {
      setError('Please accept terms to continue.');
      return;
    }

    setLoading(true);
    const res = await signUp(name.trim(), email.trim(), password);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Failed to create your account.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Begin journey"
      subtitle="Establish your circadian habit rhythms."
      visualVariant="genesis"
      quotePrimary="Every habit starts as one honest line."
      quoteSecondary="Momentum that survives real life."
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

        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-faint mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Samar Siddiqui"
              required
              className="w-full rounded-2xl border border-line/70 bg-canvas/60 py-2.5 pl-9 pr-4 text-xs text-ink placeholder:text-faint/80 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/15 transition-all"
            />
          </div>
        </div>

        {/* Email Address */}
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

        {/* Password */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-faint mb-1.5">
            Password
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

          {/* Minimal Password Strength Meter */}
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

        {/* Terms Agreement */}
        <div className="flex items-center gap-2 pt-0.5">
          <input
            type="checkbox"
            id="terms"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-line text-sage focus:ring-sage/20 accent-sage cursor-pointer"
          />
          <label htmlFor="terms" className="text-[11px] text-muted cursor-pointer select-none font-light">
            I agree to the <span className="underline hover:text-ink">Terms</span> & <span className="underline hover:text-ink">Privacy</span>.
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
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </motion.button>
      </form>

      {/* Redirect to Login */}
      <div className="mt-6 text-center border-t border-line/40 pt-4">
        <p className="text-xs text-muted font-light">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-sage-deep hover:underline transition-all"
          >
            Sign in &rarr;
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
