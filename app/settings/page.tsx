"use client";

import React, { useState } from 'react';
import { PageTransition } from '../../components/PageTransition';
import { Save, User, Bell, Moon } from 'lucide-react';
import { Layout } from '../../components/Layout';

// Mock user context
const MOCK_USER = { name: 'Alex' };

export default function SettingsPage() {
    const [name, setName] = useState('Alex');
    const [username, setUsername] = useState('@alex');
    const [email, setEmail] = useState('alex@example.com');
    const [startOfWeek, setStartOfWeek] = useState('sunday');
    const [reminderTime, setReminderTime] = useState('09:00');
    const [vacationMode, setVacationMode] = useState(false);

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
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
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

                        {/* Habit & Tracking Settings */}
                        <section className="bg-zen-surface p-6 rounded-2xl border border-zen-border shadow-sm">
                            <div className="flex items-center mb-6">
                                <Save className="w-5 h-5 text-zen-primary mr-3 stroke-[1.5]" />
                                <h2 className="text-xl font-heading text-zen-text-primary">Tracking</h2>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl border border-zen-border bg-zen-bg">
                                <div>
                                    <h3 className="font-medium text-zen-text-primary">Vacation Mode</h3>
                                    <p className="text-sm text-zen-text-secondary mt-1">Pause all your streaks while you're away.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value=""
                                        className="sr-only peer"
                                        checked={vacationMode}
                                        onChange={() => setVacationMode(!vacationMode)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zen-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zen-primary"></div>
                                </label>
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

                        <div className="flex justify-end pt-4 pb-8 border-b border-zen-border">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-zen-primary hover:bg-zen-primary-hover text-white rounded-xl font-medium transition-colors duration-200 flex items-center shadow-sm hover:shadow-md">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </button>
                        </div>

                        {/* Danger Zone Section */}
                        <section className="mt-8 pt-4">
                            <h2 className="text-xl font-heading text-red-600 mb-6">Danger Zone</h2>
                            <div className="p-6 rounded-2xl border border-red-200 bg-red-50 flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-red-800">Delete Account</h3>
                                    <p className="text-sm text-red-600 mt-1">Permanently remove your account and all associated data.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                            alert('Account deletion requested.');
                                        }
                                    }}
                                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-sm"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </section>
                    </form>
                </div>
            </PageTransition>
        </Layout>
    );
}
