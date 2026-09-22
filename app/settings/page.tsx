"use client";

import React, { useState, useEffect } from 'react';
import { PageTransition } from '../../components/PageTransition';
import {
  Save,
  User,
  Clock,
  Bell,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ExternalLink,
  X,
} from 'lucide-react';
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

  // Telegram Integration State
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [telegramRemindersEnabled, setTelegramRemindersEnabled] = useState(true);
  const [telegramEodTime, setTelegramEodTime] = useState('20:00');
  const [isConnectingTelegram, setIsConnectingTelegram] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      setTelegramChatId(user.telegramChatId || '');
      setTelegramUsername(user.telegramUsername || '');
      setTelegramRemindersEnabled(user.telegramRemindersEnabled ?? true);
      setTelegramEodTime(user.telegramEodTime || '20:00');
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

  // 1-Click Connect Telegram Assistant
  const handleConnectTelegram = async () => {
    if (!user?.id) {
      setErrorMessage('Please sign in to connect Telegram.');
      return;
    }

    setIsConnectingTelegram(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/telegram/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.deepLink) {
        throw new Error(data.error || 'Failed to generate connection link.');
      }

      // Open Telegram app / web client with single-use start token
      window.open(data.deepLink, '_blank');
      setSuccessMessage('Telegram opened! Press "Start" in the Telegram chat to complete connection.');
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error launching Telegram.';
      setErrorMessage(msg);
    } finally {
      setIsConnectingTelegram(false);
    }
  };

  // Dispatch Test Notification
  const handleSendTestNotification = async () => {
    if (!telegramChatId) {
      setTestFeedback({ type: 'error', message: 'No Telegram Chat ID found.' });
      return;
    }

    setIsSendingTest(true);
    setTestFeedback(null);

    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: telegramChatId,
          userName: name || user?.fullName || 'Zenith User',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch test notification.');
      }

      setTestFeedback({ type: 'success', message: 'Test message sent! Check your Telegram.' });
      setTimeout(() => setTestFeedback(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to deliver message.';
      setTestFeedback({ type: 'error', message: msg });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Disconnect Telegram
  const handleDisconnectTelegram = async () => {
    setTelegramChatId('');
    setTelegramUsername('');
    await updateProfile({
      telegramChatId: '',
      telegramUsername: '',
    });
    setSuccessMessage('Telegram account disconnected.');
    setTimeout(() => setSuccessMessage(null), 4000);
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
      telegramChatId: telegramChatId.trim(),
      telegramUsername: telegramUsername.trim(),
      telegramRemindersEnabled,
      telegramEodTime,
    });

    setSaving(false);
    if (res.success) {
      setSuccessMessage('Profile, circadian working window & Telegram preferences updated.');
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

            {/* Telegram Bot & EOD Habit Reminders Section */}
            <section className="bg-surface p-6 rounded-3xl border border-line shadow-calm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-5 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Send className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-ink">Telegram Bot EOD Assistant</h2>
                    <p className="text-xs text-muted">Receive End-of-Day leftover habit digests with 1-click micro-actions.</p>
                  </div>
                </div>

                {/* Connection Status Badge */}
                <div>
                  {telegramChatId ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/40 bg-sage-wash px-3 py-1 text-[11px] font-mono font-semibold text-sage-deep">
                      <span className="h-1.5 w-1.5 rounded-full bg-sage-deep animate-pulse" />
                      <span>Connected {telegramUsername ? `@${telegramUsername}` : `ID: ${telegramChatId}`}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-[11px] font-mono text-muted">
                      <span>Not Connected</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Connection Controls */}
              <div className="space-y-4">
                {!telegramChatId ? (
                  <div className="rounded-2xl border border-line/80 bg-canvas/70 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-semibold text-ink">1-Click Auto-Connection</h3>
                        <p className="text-[11px] text-muted font-light mt-0.5">
                          Tap below to open Telegram and start the assistant. Your chat ID links automatically.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleConnectTelegram}
                        disabled={isConnectingTelegram}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors shrink-0"
                      >
                        {isConnectingTelegram ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                        <span>{isConnectingTelegram ? 'Generating Link...' : 'Open Telegram Bot'}</span>
                      </button>
                    </div>

                    <div className="border-t border-line/60 pt-3">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-faint mb-1 font-mono">
                        Or enter Telegram Chat ID manually
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value.trim())}
                          placeholder="e.g. 987654321"
                          className="flex-1 rounded-xl border border-line bg-surface py-1.5 px-3 text-xs text-ink placeholder:text-faint font-mono focus:border-sage focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage/30 bg-sage-wash/30 p-3.5">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-sage-deep shrink-0" />
                        <span className="text-ink font-medium">
                          Active Chat ID: <strong className="font-mono">{telegramChatId}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSendTestNotification}
                          disabled={isSendingTest}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-sage/40 bg-surface px-3 py-1.5 text-xs font-mono font-medium text-sage-deep hover:bg-sage-wash transition-colors"
                        >
                          {isSendingTest ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          <span>{isSendingTest ? 'Sending...' : 'Send Test Alert'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDisconnectTelegram}
                          className="inline-flex items-center gap-1 rounded-xl border border-clay/30 bg-surface px-2.5 py-1.5 text-xs font-mono text-clay hover:bg-clay-wash transition-colors"
                          title="Disconnect Telegram Bot"
                        >
                          <X className="h-3 w-3" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    </div>

                    {/* Test Delivery Feedback Banner */}
                    <AnimatePresence>
                      {testFeedback && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
                            testFeedback.type === 'success'
                              ? 'bg-sage-wash text-sage-deep border border-sage/40'
                              : 'bg-clay-wash text-clay border border-clay/40'
                          }`}
                        >
                          {testFeedback.type === 'success' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span>{testFeedback.message}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* EOD Reminder Preferences */}
                <div className="border-t border-line/60 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-ink">EOD Leftover Habits Digest</p>
                      <p className="text-xs text-muted">Dispatches a mindful summary when your daily working window ends.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={telegramRemindersEnabled}
                        onChange={(e) => setTelegramRemindersEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-faint mb-1.5 font-mono">
                      Daily EOD Reminder Time
                    </label>
                    <input
                      type="time"
                      value={telegramEodTime}
                      onChange={(e) => setTelegramEodTime(e.target.value)}
                      className="w-full sm:w-48 rounded-2xl border border-line bg-canvas py-2 px-3 text-sm text-ink focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/20 transition-all font-mono"
                    />
                  </div>
                </div>
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
