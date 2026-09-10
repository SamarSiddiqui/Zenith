"use client";

import React, { useState, useEffect } from 'react';
import { PageTransition } from '../../components/PageTransition';
import { Save, User, Clock, Bell, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS_OF_WEEK = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
  { id: 0, label: 'Sun' },
];

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('19:00');
  const [timezone, setTimezone] = useState('UTC');
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [mindfulReminders, setMindfulReminders] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form with authenticated user state
  useEffect(() => {
    if (user) {
      setName(user.fullName || '');
      if (user.workingWindow) {
        setStartTime(user.workingWindow.startTime || '09:00');
        setEndTime(user.workingWindow.endTime || '19:00');
        setTimezone(user.workingWindow.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
        setActiveDays(user.workingWindow.activeDays || [1, 2, 3, 4, 5]);
      }
      setMindfulReminders(user.mindfulReminders ?? true);
    }
  }, [user]);

  const toggleDay = (dayId: number) => {
    if (activeDays.includes(dayId)) {
      if (activeDays.length > 1) {
        setActiveDays(activeDays.filter((d) => d !== dayId));
      }
    } else {
      setActiveDays([...activeDays, dayId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const res = await updateProfile({
      fullName: name.trim(),
      workingWindow: {
        startTime,
        endTime,
        timezone,
        activeDays,
      },
      mindfulReminders,
    });

    setSaving(false);
    if (res.success) {
      setSuccessMessage('Profile & circadian working window updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to update settings.');
    }
  };

  return (
    <Layout userName={user?.fullName}>
      <PageTransition>
        <div className="max-w-2xl">
          <div className="mb-8">
            <h1 className="font-serif text-4xl text-ink">Settings & Circadian Window</h1>
            <p className="mt-1 text-sm text-muted">
              Configure your daily working window and personal preferences.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Feedback Notifications */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 rounded-2xl border border-sage/40 bg-sage-wash p-4 text-xs font-medium text-sage-deep"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 rounded-2xl border border-clay/40 bg-clay-wash p-4 text-xs font-medium text-clay"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Section */}
            <section className="bg-surface p-6 rounded-3xl border border-line shadow-calm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage-wash text-sage-deep">
                  <User className="w-4 h-4 stroke-[1.75]" />
                </div>
                <h2 className="text-base font-semibold text-ink">Profile Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-faint mb-1.5 font-mono">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your Full Name"
                    className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-4 text-sm text-ink placeholder:text-faint focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-faint mb-1.5 font-mono">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full rounded-2xl border border-line bg-sidebar/60 py-2.5 px-4 text-sm text-muted cursor-not-allowed opacity-80"
                  />
                  <p className="mt-1 text-[11px] text-faint">Linked via Supabase Authentication.</p>
                </div>
              </div>
            </section>

            {/* Circadian Working Window Section */}
            <section className="bg-surface p-6 rounded-3xl border border-line shadow-calm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage-wash text-sage-deep">
                  <Clock className="w-4 h-4 stroke-[1.75]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-ink">Circadian Working Window</h2>
                  <p className="text-xs text-muted">Defines when your habits are active before micro-recovery activates.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-faint mb-1.5 font-mono">
                      Window Opens (Start Time)
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-4 text-sm text-ink focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-faint mb-1.5 font-mono">
                      Window Closes (End Time)
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-2xl border border-line bg-canvas py-2.5 px-4 text-sm text-ink focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-faint mb-1.5 font-mono">
                    Active Days
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {DAYS_OF_WEEK.map((day) => {
                      const active = activeDays.includes(day.id);
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`flex h-9 w-11 items-center justify-center rounded-xl text-xs font-medium transition-all ${
                            active
                              ? 'bg-sage text-white shadow-xs font-semibold'
                              : 'border border-line bg-canvas text-muted hover:border-sage/40'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Mindful Preferences Section */}
            <section className="bg-surface p-6 rounded-3xl border border-line shadow-calm">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage-wash text-sage-deep">
                  <Bell className="w-4 h-4 stroke-[1.75]" />
                </div>
                <h2 className="text-base font-semibold text-ink">Mindful Notifications</h2>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-ink">Schedule fatigue & window alerts</p>
                  <p className="text-xs text-muted">Receive gentle reminders 45 mins before your usable window closes.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mindfulReminders}
                    onChange={(e) => setMindfulReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage"></div>
                </label>
              </div>
            </section>

            {/* Save Action */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-7 py-3 bg-sage hover:bg-sage-deep text-white rounded-2xl text-xs font-semibold uppercase tracking-wider transition-colors duration-200 flex items-center shadow-calm disabled:opacity-70 gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 stroke-[1.75]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </PageTransition>
    </Layout>
  );
}
