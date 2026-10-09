"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-line/80 bg-surface/80 pt-14 pb-10">
      <div className="mx-auto w-full max-w-6xl px-5 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Brand & Mission */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-wash overflow-hidden border border-sage/30 shadow-xs">
                <img src="/zenithBot.webp" alt="Zenith Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-serif text-2xl text-ink tracking-tight">Zenith</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              The circadian consistency engine built for knowledge workers. Replacing toxic streaks with resilient behavioral momentum.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-sage animate-pulse" />
              <span className="text-[11px] font-mono text-faint">All systems operational · v2.4</span>
            </div>
          </div>

          {/* Product Pillars */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Product</p>
            <ul className="mt-4 space-y-2.5 text-xs text-muted">
              <li>
                <Link href={user ? "/dashboard" : "/login"} className="hover:text-ink transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href={user ? "/habits" : "/login"} className="hover:text-ink transition-colors">
                  Circadian Habits Planner
                </Link>
              </li>
              <li>
                <Link href={user ? "/focus" : "/login"} className="hover:text-ink transition-colors">
                  Focus Sanctuary
                </Link>
              </li>
              <li>
                <Link href={user ? "/diagnosis" : "/login"} className="hover:text-ink transition-colors">
                  AI Diagnosis & Growth
                </Link>
              </li>
              <li>
                <Link href={user ? "/recovery" : "/login"} className="hover:text-ink transition-colors">
                  Recovery Mode
                </Link>
              </li>
            </ul>
          </div>

          {/* Philosophy & Architecture */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Philosophy</p>
            <ul className="mt-4 space-y-2.5 text-xs text-muted">
              <li>
                <a href="#chapter-01" className="hover:text-ink transition-colors">
                  Why Streaks Break
                </a>
              </li>
              <li>
                <a href="#chapter-02" className="hover:text-ink transition-colors">
                  The Working Window
                </a>
              </li>
              <li>
                <a href="#chapter-03" className="hover:text-ink transition-colors">
                  What Zenith Sees
                </a>
              </li>
              <li>
                <a href="#philosophy" className="hover:text-ink transition-colors">
                  Identity-First Principles
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Connect */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Ecosystem</p>
            <ul className="mt-4 space-y-2.5 text-xs text-muted">
              <li>
                <a
                  href="https://t.me/ZenithHabitBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink transition-colors flex items-center gap-1.5"
                >
                  <span>Telegram Habit Bot</span>
                </a>
              </li>
              <li>
                <Link href={user ? "/settings" : "/login"} className="hover:text-ink transition-colors">
                  Preferences & Working Window
                </Link>
              </li>
              <li>
                <Link href={user ? "/dashboard" : "/register"} className="hover:text-ink transition-colors">
                  {user ? "Open App" : "Create Free Account"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line/60 pt-6 text-[11px] text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Zenith. Crafted for sustainable human momentum.</p>
          <div className="flex items-center gap-6">
            <span>Circadian Schedule Design</span>
            <span>Zero Toxic Guilt</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
