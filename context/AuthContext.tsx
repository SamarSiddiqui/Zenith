"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ZenithUserProfile, AuthSessionState } from '../types/auth';
import { createClient } from '../lib/supabase/client';
import { isSupabaseConfigured } from '../lib/supabase/env';

interface AuthContextType extends AuthSessionState {
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<ZenithUserProfile>) => Promise<{ success: boolean; error?: string }>;
}

const DEFAULT_WORKING_WINDOW = {
  startTime: '09:00',
  endTime: '19:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  activeDays: [1, 2, 3, 4, 5],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ZenithUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const configured = isSupabaseConfigured();

  // Helper to fetch/format profile
  const fetchProfile = useCallback(async (userId: string, email: string, fallbackName?: string) => {
    if (!supabase) return null;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      }

      if (profile) {
        return {
          id: profile.id,
          email: profile.email || email,
          fullName: profile.full_name || fallbackName || 'Zenith User',
          avatarUrl: profile.avatar_url,
          workingWindow: profile.working_window || DEFAULT_WORKING_WINDOW,
          onboarded: profile.onboarded ?? false,
          themePreference: profile.theme_preference,
          mindfulReminders: profile.mindful_reminders,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        } as ZenithUserProfile;
      }

      return {
        id: userId,
        email: email,
        fullName: fallbackName || 'Zenith User',
        workingWindow: DEFAULT_WORKING_WINDOW,
        onboarded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ZenithUserProfile;
    } catch (err) {
      console.error('Failed to parse user profile:', err);
      return null;
    }
  }, [supabase]);

  // Load initial session on mount
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      if (!supabase || !configured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user && isMounted) {
          const profile = await fetchProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name
          );
          if (isMounted) {
            setUser(profile);
          }
        }
      } catch (err: unknown) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen to Supabase auth events
    if (supabase && configured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          const profile = await fetchProfile(
            session.user.id,
            session.user.email || '',
            session.user.user_metadata?.full_name
          );
          if (isMounted) {
            setUser(profile);
            setIsLoading(false);
          }
        } else {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [supabase, configured, fetchProfile]);

  // Sign In action
  const signIn = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    if (!supabase || !configured) {
      const msg = 'Supabase is not configured. Please add your credentials to .env.local.';
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return { success: false, error: signInError.message };
      }

      if (data.user) {
        const profile = await fetchProfile(
          data.user.id,
          data.user.email || email,
          data.user.user_metadata?.full_name
        );
        setUser(profile);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in.';
      setError(message);
      setIsLoading(false);
      return { success: false, error: message };
    }
  };

  // Sign Up action
  const signUp = async (fullName: string, email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    if (!supabase || !configured) {
      const msg = 'Supabase is not configured. Please add your credentials to .env.local.';
      setError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return { success: false, error: signUpError.message };
      }

      if (data.user) {
        const profile = await fetchProfile(data.user.id, email, fullName);
        setUser(profile);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account.';
      setError(message);
      setIsLoading(false);
      return { success: false, error: message };
    }
  };

  // Update Profile
  const updateProfile = async (updates: Partial<ZenithUserProfile>) => {
    if (!user) return { success: false, error: 'No authenticated user session.' };

    if (!supabase || !configured) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName !== undefined ? updates.fullName : user.fullName,
          avatar_url: updates.avatarUrl !== undefined ? updates.avatarUrl : user.avatarUrl,
          working_window: updates.workingWindow !== undefined ? updates.workingWindow : user.workingWindow,
          onboarded: updates.onboarded !== undefined ? updates.onboarded : user.onboarded,
          theme_preference: updates.themePreference !== undefined ? updates.themePreference : user.themePreference,
          mindful_reminders: updates.mindfulReminders !== undefined ? updates.mindfulReminders : user.mindfulReminders,
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      setUser((prev) => (prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null));
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not update profile.';
      return { success: false, error: message };
    }
  };

  // Sign Out action
  const signOut = useCallback(async () => {
    if (supabase && configured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, [supabase, configured]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        isConfigured: configured,
        error,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
