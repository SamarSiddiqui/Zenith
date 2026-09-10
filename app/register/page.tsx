"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
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
    if (score >= 3) return { score: 3, label: 'Strong & Serene', color: 'bg-sage' };
    return { score: 1, label: 'Weak', color: 'bg-clay' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name.');
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
      setError('Please agree to the Terms of Service to continue.');
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
      title="Begin your journey"
      subtitle="Establish your circadian working window and track mindful consistency."
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

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-faint mb-1.5 font-mono">
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Samar Siddiqui"
              required
              className="w-full rounded-2xl border border-line bg-canvas py-3 pl-10 pr-4 text-sm text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
            />
          </div>
        </div>

        {/* Email Address */}
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

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-faint mb-1.5 font-mono">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
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

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 space-y-1.5 overflow-hidden"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted">Password strength:</span>
                <span className="font-medium text-ink flex items-center gap-1">
                  {passwordStrength.score >= 3 && <CheckCircle2 className="h-3 w-3 text-sage" />}
                  {passwordStrength.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-1.5">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    passwordStrength.score >= 1 ? passwordStrength.color : 'bg-line'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    passwordStrength.score >= 2 ? passwordStrength.color : 'bg-line'
                  }`}
                />
                <div
                  className={`rounded-full transition-all duration-300 ${
                    passwordStrength.score >= 3 ? passwordStrength.color : 'bg-line'
                  }`}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Terms agreement */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded-md border-line bg-canvas text-sage focus:ring-sage/30 accent-sage cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-muted leading-relaxed cursor-pointer select-none">
            I agree to the mindful{' '}
            <span className="text-ink underline decoration-line hover:text-sage-deep">Terms of Service</span> and{' '}
            <span className="text-ink underline decoration-line hover:text-sage-deep">Privacy Policy</span>.
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
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Redirect to Login */}
      <div className="mt-7 text-center border-t border-line/60 pt-5">
        <p className="text-xs text-muted">
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
