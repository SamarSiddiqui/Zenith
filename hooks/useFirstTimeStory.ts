"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ZenithUserProfile } from '../types/auth';

const getCompletedStorageKey = (userId: string) => `zenith_story_completed_${userId}`;
const getChapterStorageKey = (userId: string) => `zenith_story_chapter_${userId}`;

export interface UseFirstTimeStoryReturn {
  /** True when the user is on their first login (or explicitly replaying the story). */
  shouldShowStory: boolean;
  /** True strictly when the account has not completed first-time onboarding yet. */
  isFirstTimeUser: boolean;
  /** True when an existing user opened the story manually via Replay. */
  isReplaying: boolean;
  /** True while persisting completion state to Supabase. */
  isSaving: boolean;
  /** 0-indexed active chapter persisted across accidental refreshes mid-story. */
  currentChapter: number;
  setCurrentChapter: (chapter: number) => void;
  /** Marks first-time onboarding complete across DB, auth metadata, and local storage. */
  completeStory: (profileUpdates?: Partial<ZenithUserProfile>) => Promise<{ success: boolean; error?: string }>;
  /** Skips the remaining chapters and marks onboarding complete. */
  skipStory: () => Promise<{ success: boolean; error?: string }>;
  /** Opens the story overlay on demand for returning users without resetting profile data. */
  replayStory: () => void;
  /** Closes a manual replay without altering onboarded status. */
  closeReplay: () => void;
}

/**
 * Manages first-login detection and persistence for Zenith's animated onboarding story.
 *
 * Truth hierarchy:
 * 1. `user.onboarded` from Supabase `public.profiles` (initialized to `false` on signup).
 * 2. Fallback `story_completed` in `auth.users.user_metadata` if profile row is absent.
 * 3. User-scoped `localStorage` resilience flag if an offline/network error occurred on completion.
 */
export function useFirstTimeStory(totalChapters: number = 5): UseFirstTimeStoryReturn {
  const { user, isLoading: authLoading, updateProfile } = useAuth();
  const [localCompleted, setLocalCompleted] = useState<boolean>(false);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentChapter, setCurrentChapterState] = useState<number>(0);

  // Sync user-scoped completion guard and chapter progress on user change
  useEffect(() => {
    if (!user?.id || typeof window === 'undefined') {
      setLocalCompleted(false);
      setCurrentChapterState(0);
      return;
    }

    try {
      const savedDone = window.localStorage.getItem(getCompletedStorageKey(user.id)) === 'true';
      setLocalCompleted(savedDone);

      const savedChapterRaw = window.sessionStorage.getItem(getChapterStorageKey(user.id));
      const parsedChapter = savedChapterRaw ? parseInt(savedChapterRaw, 10) : 0;
      if (!Number.isNaN(parsedChapter) && parsedChapter >= 0 && parsedChapter < totalChapters) {
        setCurrentChapterState(parsedChapter);
      } else {
        setCurrentChapterState(0);
      }
    } catch {
      // Ignore storage access restrictions (e.g., strict private browsing)
    }
  }, [user?.id, totalChapters]);

  const setCurrentChapter = useCallback(
    (chapter: number) => {
      const bounded = Math.max(0, Math.min(totalChapters - 1, chapter));
      setCurrentChapterState(bounded);
      if (user?.id && typeof window !== 'undefined') {
        try {
          window.sessionStorage.setItem(getChapterStorageKey(user.id), String(bounded));
        } catch {
          // Ignore storage errors
        }
      }
    },
    [user?.id, totalChapters]
  );

  const isFirstTimeUser = Boolean(!authLoading && user && !user.onboarded && !localCompleted);
  const shouldShowStory = Boolean(!authLoading && user && (isFirstTimeUser || isReplaying));

  const completeStory = useCallback(
    async (profileUpdates?: Partial<ZenithUserProfile>) => {
      if (!user?.id) {
        return { success: false, error: 'No authenticated user.' };
      }

      // If a returning user is just replaying, save any optional tweaks without disturbing onboarded=true
      if (isReplaying && user.onboarded) {
        if (profileUpdates && Object.keys(profileUpdates).length > 0) {
          setIsSaving(true);
          const res = await updateProfile(profileUpdates);
          setIsSaving(false);
          setIsReplaying(false);
          setCurrentChapterState(0);
          return res;
        }
        setIsReplaying(false);
        setCurrentChapterState(0);
        return { success: true };
      }

      setIsSaving(true);

      // Optimistic local guard so rapid refresh never replays the story
      setLocalCompleted(true);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(getCompletedStorageKey(user.id), 'true');
          window.sessionStorage.removeItem(getChapterStorageKey(user.id));
        } catch {
          // Ignore storage errors
        }
      }

      const res = await updateProfile({
        ...profileUpdates,
        onboarded: true,
      });

      setIsSaving(false);
      setIsReplaying(false);
      setCurrentChapterState(0);

      return res;
    },
    [user?.id, user?.onboarded, isReplaying, updateProfile]
  );

  const skipStory = useCallback(() => {
    return completeStory();
  }, [completeStory]);

  const replayStory = useCallback(() => {
    setCurrentChapterState(0);
    setIsReplaying(true);
  }, []);

  const closeReplay = useCallback(() => {
    setIsReplaying(false);
    setCurrentChapterState(0);
  }, []);

  return {
    shouldShowStory,
    isFirstTimeUser,
    isReplaying,
    isSaving,
    currentChapter,
    setCurrentChapter,
    completeStory,
    skipStory,
    replayStory,
    closeReplay,
  };
}

