"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Habit, CircadianSlot } from '../types/zenith';
import type { DiagnosisResult, DiagnosisRequest, RecoveryProtocol } from '../types/diagnosis';
import type { SprintSession } from '../types/sprint';
import type { WorkingWindow } from '../types/auth';
import { updateHabit } from '../lib/services/habits';
import { useAuth } from '../context/AuthContext';

const CACHE_KEY_PREFIX = 'zenith_diagnosis_cache_';
const APPLIED_ACTIONS_KEY = 'zenith_diagnosis_applied_actions';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 Hours cache validity

interface CachePayload {
  data: DiagnosisResult;
  timestamp: number;
}

export function useDiagnosis(
  habits: Habit[],
  workingWindow?: WorkingWindow,
  sprintSession?: SprintSession
) {
  const { user } = useAuth();
  const userId = user?.id || 'local-user';
  const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;

  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<Date | null>(null);
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({});

  // Load applied action tags from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(APPLIED_ACTIONS_KEY);
        if (stored) {
          setAppliedActions(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load applied actions from cache:', err);
      }
    }
  }, []);

  const markActionApplied = useCallback((actionKey: string) => {
    setAppliedActions((prev) => {
      const next = { ...prev, [actionKey]: true };
      if (typeof window !== 'undefined') {
        localStorage.setItem(APPLIED_ACTIONS_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // Run Gemini Diagnosis
  const runDiagnosis = useCallback(
    async (forceFresh: boolean = false): Promise<DiagnosisResult | null> => {
      if (!habits || habits.length === 0) {
        setIsLoading(false);
        return null;
      }

      // Check localStorage cache if not forced fresh
      if (!forceFresh && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached) as CachePayload;
            const isFresh = Date.now() - parsed.timestamp < CACHE_TTL_MS;
            if (isFresh && parsed.data) {
              setDiagnosis(parsed.data);
              setLastAnalyzedAt(new Date(parsed.timestamp));
              setIsLoading(false);
              return parsed.data;
            }
          }
        } catch (cacheErr) {
          console.warn('[useDiagnosis] Cache read error, continuing with fresh fetch:', cacheErr);
        }
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const requestPayload: DiagnosisRequest = {
          habits,
          workingWindow: {
            startTime: workingWindow?.startTime || user?.workingWindow?.startTime || '09:00',
            endTime: workingWindow?.endTime || user?.workingWindow?.endTime || '19:00',
            timezone: workingWindow?.timezone || user?.workingWindow?.timezone || 'UTC',
            activeDays: workingWindow?.activeDays || user?.workingWindow?.activeDays || [1, 2, 3, 4, 5],
          },
          userName: user?.fullName || 'Practitioner',
          sprintGoal: sprintSession?.config.sprintGoal || 'Sustain daily rhythm & momentum',
          sprintDuration: sprintSession?.config.durationDays || 7,
          currentDayIndex: sprintSession?.currentDayIndex ?? 0,
        };

        const res = await fetch('/api/diagnosis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Diagnosis server returned ${res.status}`);
        }

        const data = (await res.json()) as DiagnosisResult;
        setDiagnosis(data);
        const now = new Date();
        setLastAnalyzedAt(now);

        // Store to cache
        if (typeof window !== 'undefined') {
          const cachePayload: CachePayload = {
            data,
            timestamp: now.getTime(),
          };
          localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
        }

        return data;
      } catch (err: any) {
        console.error('[useDiagnosis] Execution error:', err);
        setError(err.message || 'Failed to generate AI diagnosis. Please try again.');
        return null;
      } finally {
        setIsLoading(false);
        setIsAnalyzing(false);
      }
    },
    [habits, workingWindow, user, sprintSession, cacheKey]
  );

  // Initial load on mount or when habits become available
  useEffect(() => {
    if (habits.length > 0 && !diagnosis && isLoading) {
      runDiagnosis(false);
    } else if (habits.length === 0) {
      setIsLoading(false);
    }
  }, [habits, diagnosis, isLoading, runDiagnosis]);

  // 1-Click Action 1: Re-anchor Circadian Slot
  const applySlotRecommendation = useCallback(
    async (habitId: string, newSlot: CircadianSlot): Promise<boolean> => {
      const ok = await updateHabit(habitId, { circadianSlot: newSlot });
      if (ok) {
        markActionApplied(`slot_${habitId}_${newSlot}`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('zenith_habits_sync'));
        }
      }
      return ok;
    },
    [markActionApplied]
  );

  // 1-Click Action 2: Apply AI Micro-Fallback
  const applyMicroVersion = useCallback(
    async (habitId: string, newMicroStep: string): Promise<boolean> => {
      const ok = await updateHabit(habitId, { microVersion: newMicroStep });
      if (ok) {
        markActionApplied(`micro_${habitId}`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('zenith_habits_sync'));
        }
      }
      return ok;
    },
    [markActionApplied]
  );

  // 1-Click Action 3: Adjust Duration Tier (e.g. Silver Flow)
  const applyTieredDuration = useCallback(
    async (habitId: string, newMinutes: number): Promise<boolean> => {
      const ok = await updateHabit(habitId, { minutes: newMinutes });
      if (ok) {
        markActionApplied(`duration_${habitId}_${newMinutes}`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('zenith_habits_sync'));
        }
      }
      return ok;
    },
    [markActionApplied]
  );

  // 1-Click Action 4: Inject 3-Day Step-Up Recovery Protocol
  const applyRecoveryProtocol = useCallback(
    async (habitId: string, protocol: RecoveryProtocol): Promise<boolean> => {
      const day1Micro = protocol.steps.find((s) => s.dayNumber === 1);
      const microPrompt = day1Micro?.actionPrompt || '2-min restart spark';

      const ok = await updateHabit(habitId, {
        microVersion: `⚡ ${microPrompt}`,
      });

      if (ok) {
        markActionApplied(`recovery_${habitId}`);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('zenith_habits_sync'));
        }
      }
      return ok;
    },
    [markActionApplied]
  );

  return {
    diagnosis,
    isLoading,
    isAnalyzing,
    error,
    lastAnalyzedAt,
    appliedActions,
    reAnalyze: () => runDiagnosis(true),
    applySlotRecommendation,
    applyMicroVersion,
    applyTieredDuration,
    applyRecoveryProtocol,
  };
}
