"use client";

import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { PageTransition } from '../../components/PageTransition';
import { Save, User, Bell, Moon } from 'lucide-react';
import { getProfile, updateProfile } from '../../lib/api/profile';
import { authApi } from '../../lib/api/auth';

// We get the user from authApi if possible
// const MOCK_USER = { name: 'Alex' };

export default function SettingsPage() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    // Preferences
    const [startOfWeek, setStartOfWeek] = useState('sunday');
    const [reminderTime, setReminderTime] = useState('09:00');
    const [vacationMode, setVacationMode] = useState(false);
    const [theme, setTheme] = useState('system'); // Keeping theme state as requested in payload

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const initialSettings = React.useRef<{ profile: any, preferences: any }>({ profile: {}, preferences: {} });

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getProfile();

                if (data.profile) {
                    setName(data.profile.display_name || '');
                    setUsername(data.profile.username || '');
                    setEmail(data.profile.email || '');
                    // Store initial profile data
                    initialSettings.current.profile = {
                        display_name: data.profile.display_name || '',
                        username: data.profile.username || '',
                        email: data.profile.email || ''
                    };
                }
                if (data.preferences) {
                    setStartOfWeek(data.preferences.startOfWeek || 'sunday');
                    setReminderTime(data.preferences.reminderTime || '09:00');
                    setTheme(data.preferences.theme || 'system');
                    // Store initial preferences data
                    initialSettings.current.preferences = {
                        startOfWeek: data.preferences.startOfWeek || 'sunday',
                        reminderTime: data.preferences.reminderTime || '09:00',
                        theme: data.preferences.theme || 'system'
                    };
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        const payload: any = { actions: { deleteAccount: false } };
        const profileUpdates: any = {};
        const preferencesUpdates: any = {};

        // Diff Profile
        if (name !== initialSettings.current.profile.display_name) profileUpdates.display_name = name;
        if (username !== initialSettings.current.profile.username) profileUpdates.username = username;
        if (email !== initialSettings.current.profile.email) profileUpdates.email = email;

        // Diff Preferences
        if (startOfWeek !== initialSettings.current.preferences.startOfWeek) preferencesUpdates.startOfWeek = startOfWeek;
        if (reminderTime !== initialSettings.current.preferences.reminderTime) preferencesUpdates.reminderTime = reminderTime;
        if (theme !== initialSettings.current.preferences.theme) preferencesUpdates.theme = theme;

        if (Object.keys(profileUpdates).length > 0) payload.profile = profileUpdates;
        if (Object.keys(preferencesUpdates).length > 0) payload.preferences = preferencesUpdates;

        // If nothing changed, we can exit early or still send the request (we will send empty diff just in case)
        if (Object.keys(profileUpdates).length === 0 && Object.keys(preferencesUpdates).length === 0) {
            setSuccessMessage('No changes detected.');
            setTimeout(() => setSuccessMessage(''), 3000);
            setIsLoading(false);
            return;
        }

        try {
            const updatedData = await updateProfile(payload);

            // Update initial state refs to new truth
            if (updatedData.profile) {
                initialSettings.current.profile = { ...initialSettings.current.profile, ...updatedData.profile };
            }
            if (updatedData.preferences) {
                initialSettings.current.preferences = { ...initialSettings.current.preferences, ...updatedData.preferences };
            }

            setSuccessMessage('Settings saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to save settings.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            setIsLoading(true);
            try {
                const payload = {
                    profile: { display_name: name, username: username, email: email },
                    preferences: { startOfWeek: startOfWeek, reminderTime: reminderTime, theme: theme },
                    actions: { deleteAccount: true }
                };

                await updateProfile(payload);
                alert('Account deleted successfully.');
                authApi.clearAuthCookies();
                window.location.href = '/login'; // Redirect to login
            } catch (error: any) {
                console.error("Error deleting account:", error);
                setError(error.response?.data?.error || 'Failed to delete account.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (isLoading && !name) {
        return (
            <Layout userName={name || 'Loading...'}>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-zen-bg">
                    <img src="/svgZenith.svg" alt="Loading Zenith..." className="w-24 h-24 animate-pulse opacity-80" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout userName={authApi.getUser()?.email?.split('@')[0] || name || 'User'}>
            <PageTransition>
                <div className="max-w-2xl">
                    <h1 className="font-heading text-4xl text-zen-text-primary mb-8">Settings</h1>

                    <form onSubmit={handleSave} className="space-y-8">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                                {successMessage}
                            </div>
                        )}

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
                                disabled={isLoading}
                                className={`px-8 py-3 bg-zen-primary hover:bg-zen-primary-hover text-white rounded-xl font-medium transition-colors duration-200 flex items-center shadow-sm hover:shadow-md ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Save className="w-4 h-4 mr-2" />
                                {isLoading ? 'Saving...' : 'Save Changes'}
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
                                    onClick={handleDeleteAccount}
                                    disabled={isLoading}
                                    className={`px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors duration-200 shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </section>
                    </form>
                </div>
            </PageTransition>
        </Layout>
    );
}
