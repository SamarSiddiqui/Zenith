"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (email && password) {
            setLoading(true);
            try {
                await authApi.login({ email, password });
                router.push('/');
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-zen-bg flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md bg-zen-surface p-8 md:p-12 rounded-3xl shadow-lg border border-zen-border">
                <div className="text-center mb-10">
                    <h1 className="font-heading text-4xl text-zen-text-primary mb-3">Welcome back</h1>
                    <p className="text-zen-text-secondary">Continue your mindful journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zen-text-secondary mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zen-border bg-zen-bg focus:outline-none focus:ring-2 focus:ring-zen-primary/50 focus:border-zen-primary transition-all text-zen-text-primary"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zen-text-secondary mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zen-border bg-zen-bg focus:outline-none focus:ring-2 focus:ring-zen-primary/50 focus:border-zen-primary transition-all text-zen-text-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-zen-primary hover:bg-zen-primary-hover disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors duration-200 flex items-center justify-center group">
                        {loading ? 'Signing In...' : 'Sign In'}
                        {!loading && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-zen-text-secondary text-sm">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-zen-primary hover:text-zen-primary-hover font-medium underline-offset-4 hover:underline transition-all">
                            Start your journey
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
