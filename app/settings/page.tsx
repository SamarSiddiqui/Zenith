"use client";

import React, { useState } from 'react';
import { PageTransition } from '../../components/PageTransition';
import { Save, User, Bell, Moon } from 'lucide-react';
import { Layout } from '../../components/Layout';

// Mock user context
const MOCK_USER = { name: 'Alex' };

export default function SettingsPage() {
    const [name, setName] = useState('Alex');
    const [email, setEmail] = useState('alex@example.com');
    const [startOfWeek, setStartOfWeek] = useState('sunday');
    const [reminderTime, setReminderTime] = useState('09:00');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Settings saved!');
    };

    return (
        <Layout userName={MOCK_USER.name}>
            <PageTransition>
                <div className="max-w-2xl">
                    <h1 className="font-heading text-4xl text-zen-text-primary mb-8">Settings</h1>

                    <form onSubmit={handleSave} className="space-y-8">
                        {/* Profile Section */}
                        <section className="bg-zen-surface p-6 rounded-2xl border border-zen-border shadow-sm">
                            <div className="flex items-center mb-6">
                                <User className="w-5 h-5 text-zen-primary mr-3 stroke-[1.5]" />
                                <h2 className="text-xl font-heading text-zen-text-primary">Profile</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zen-text-secondary mb-2">
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-zen-border bg-zen-bg focus:outline-none focus:ring-2 focus:ring-zen-primary/50 focus:border-zen-primary transition-all text-zen-text-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zen-text-secondary mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-zen-border bg-zen-bg focus:outline-none focus:ring-2 focus:ring-zen-primary/50 focus:border-zen-primary transition-all text-zen-text-primary"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Preferences Section */}
                        <section className="bg-zen-surface p-6 rounded-2xl border border-zen-border shadow-sm">
                            <div className="flex items-center mb-6">
                                <Bell className="w-5 h-5 text-zen-primary mr-3 stroke-[1.5]" />
                                <h2 className="text-xl font-heading text-zen-text-primary">Preferences</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zen-text-secondary mb-2">
                                        Start of Week
                                    </label>
                                    <select
                                        value={startOfWeek}
                                        onChange={(e) => setStartOfWeek(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-zen-border bg-zen-bg focus:outline-none focus:ring-2 focus:ring-zen-primary/50 focus:border-zen-primary transition-all text-zen-text-primary appearance-none">
                                        <option value="sunday">Sunday</option>
                                        <option value="monday">Monday</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zen-text-secondary mb-2">
                                        Daily Reminder
                                    </label>
                                    <input
                                        type="time"
                                        value={reminderTime}
                                        onChange={(e) => setReminderTime(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-zen-border bg-zen-bg focus:outline-none focus:ring-2 focus:ring-zen-primary/50 focus:border-zen-primary transition-all text-zen-text-primary"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Appearance Section */}
                        <section className="bg-zen-surface p-6 rounded-2xl border border-zen-border shadow-sm opacity-75">
                            <div className="flex items-center mb-6">
                                <Moon className="w-5 h-5 text-zen-primary mr-3 stroke-[1.5]" />
                                <h2 className="text-xl font-heading text-zen-text-primary">Appearance</h2>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zen-text-secondary">Dark Mode</span>
                                <div className="px-3 py-1 bg-zen-bg rounded-full text-xs text-zen-text-muted border border-zen-border">
                                    Coming Soon
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-zen-primary hover:bg-zen-primary-hover text-white rounded-xl font-medium transition-colors duration-200 flex items-center shadow-sm hover:shadow-md">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </PageTransition>
        </Layout>
    );
}
