"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Habit, CircadianSlot } from '../types/zenith';
import type { DiagnosisResult, DiagnosisRequest, RecoveryProtocol } from '../types/diagnosis';
import type { SprintSession } from '../types/sprint';
import type { WorkingWindow } from '../types/auth';
import { updateHabit } from '../lib/services/habits';
import { useAuth } from '../context/AuthContext';
import { hashHabitsState } from '../lib/utils/habitHash';

const CACHE_KEY_PREFIX = 'zenith_diagnosis_cache_';
const APPLIED_ACTIONS_KEY = 'zenith_diagnosis_applied_actions';
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 Hours cache validity

interface CachePayload {
  data: DiagnosisResult;
  timestamp: number;
  stateHash?: string;
}

/**
 * Instantly removes references to habits that have been deleted from the user's planner
 * so stale deleted habits never flash on screen during background revalidation.
 */
function pruneDeletedHabits(diag: DiagnosisResult, activeHabits: Habit[]): DiagnosisResult {
  const activeIds = new Set(activeHabits.map((h) => h.id));
  const activeNames = new Set(activeHabits.map((h) => h.name.trim().toLowerCase()));

  const isActive = (habitId?: string, habitName?: string) => {
    if (habitId && activeIds.has(habitId)) return true;
    if (habitName && activeNames.has(habitName.trim().toLowerCase())) return true;
    return false;
  };

  return {
    ...diag,
    habitOptimizations: (diag.habitOptimizations || []).filter((opt) =>
      isActive(opt.habitId, opt.habitName)
    ),
    frictionAutopsy: {
      ...diag.frictionAutopsy,
      scheduleCollisions: (diag.frictionAutopsy?.scheduleCollisions || []).filter((col) =>
        isActive(col.habitId, col.habitName)
      ),
    },
    recoveryProtocols: (diag.recoveryProtocols || []).filter((prot) =>
      isActive(prot.habitId, prot.habitName)
    ),
  };
}

export function useDiagnosis(
  habits: Habit[],
  workingWindow?: WorkingWindow,
  sprintSession?: SprintSession,
  isHabitsLoading: boolean = false
) {
  const { user } = useAuth();
  const userId = user?.id || 'local-user';
  const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;

  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [isFreshlyUpdated, setIsFreshlyUpdated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<Date | null>(null);
  const [appliedActions, setAppliedActions] = useState<Record<string, boolean>>({});

  const lastRequestedHashRef = useRef<string | null>(null);

  const effectiveWorkingWindow = useMemo(
    () => ({
      startTime: workingWindow?.startTime || user?.workingWindow?.startTime || '09:00',
      endTime: workingWindow?.endTime || user?.workingWindow?.endTime || '19:00',
      timezone: workingWindow?.timezone || user?.workingWindow?.timezone || 'UTC',
      activeDays: workingWindow?.activeDays || user?.workingWindow?.activeDays || [1, 2, 3, 4, 5],
    }),
    [workingWindow, user?.workingWindow]
  );

  const currentDayIndex = sprintSession?.currentDayIndex ?? 0;

  // Exact deterministic hash matching the server Redis key
  const currentStateHash = useMemo(() => {
    if (!habits || habits.length === 0) return 'empty';
    return hashHabitsState(habits, currentDayIndex, effectiveWorkingWindow);
  }, [habits, currentDayIndex, effectiveWorkingWindow]);

  // 1. Initial synchronous applied-actions + exact-or-pruned cache hydration from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(APPLIED_ACTIONS_KEY);
      if (stored) {
        setAppliedActions(JSON.parse(stored));
      }

      if (!isHabitsLoading && habits.length === 0) {
        setDiagnosis(null);
        setLastAnalyzedAt(null);
        localStorage.removeItem(cacheKey);
        setIsLoading(false);
        return;
      }

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as CachePayload;
        if (parsed.data) {
          const isExpired = Date.now() - parsed.timestamp >= CACHE_TTL_MS;
          if (!isHabitsLoading && habits.length > 0) {
            if (parsed.stateHash === currentStateHash && !isExpired) {
              setDiagnosis(parsed.data);
              setLastAnalyzedAt(new Date(parsed.timestamp));
              setIsLoading(false);
            } else {
              // Immediately strip any deleted habits from screen while revalidating
              const pruned = pruneDeletedHabits(parsed.data, habits);
              if (pruned.habitOptimizations.length > 0) {
                setDiagnosis(pruned);
                setLastAnalyzedAt(new Date(parsed.timestamp));
                setIsLoading(false);
              }
            }
          } else if (isHabitsLoading) {
            setDiagnosis(parsed.data);
            setLastAnalyzedAt(new Date(parsed.timestamp));
            setIsLoading(false);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load diagnosis cache from localStorage:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const markActionApplied = useCallback((actionKey: string) => {
    setAppliedActions((prev) => {
      const next = { ...prev, [actionKey]: true };
      if (typeof window !== 'undefined') {
        localStorage.setItem(APPLIED_ACTIONS_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  // Run Gemini Diagnosis (Checks exact Redis hash first, falls back to Gemini only on cache miss)
  const runDiagnosis = useCallback(
    async (forceFresh: boolean = false): Promise<DiagnosisResult | null> => {
      if (!habits || habits.length === 0) {
        setDiagnosis(null);
        setLastAnalyzedAt(null);
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(cacheKey);
          } catch {}
        }
        if (!isHabitsLoading) {
          setIsLoading(false);
        }
        return null;
      }

      const hasUsableDiagnosis = Boolean(diagnosis && diagnosis.habitOptimizations?.length > 0);
      if (hasUsableDiagnosis && !forceFresh) {
        setIsRevalidating(true);
      } else {
        setIsAnalyzing(true);
        if (!hasUsableDiagnosis) setIsLoading(true);
      }
      setError(null);

      try {
        const requestPayload: DiagnosisRequest = {
          habits,
          userId,
          forceRefresh: forceFresh,
          allowStale: false,
          workingWindow: effectiveWorkingWindow,
          userName: user?.fullName || 'Practitioner',
          sprintGoal: sprintSession?.config.sprintGoal || 'Sustain daily rhythm & momentum',
          sprintDuration: sprintSession?.config.durationDays || 7,
          currentDayIndex,
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
        const cleanData = pruneDeletedHabits(data, habits);
        setDiagnosis(cleanData);
        const now = new Date();
        setLastAnalyzedAt(now);
        setIsFreshlyUpdated(true);

        setTimeout(() => {
          setIsFreshlyUpdated(false);
        }, 4000);

        if (typeof window !== 'undefined') {
          const cachePayload: CachePayload = {
            data: cleanData,
            timestamp: now.getTime(),
            stateHash: currentStateHash,
          };
          localStorage.setItem(cacheKey, JSON.stringify(cachePayload));
        }

        return cleanData;
      } catch (err: any) {
        console.error('[useDiagnosis] Execution error:', err);
        setError(err.message || 'Failed to generate AI diagnosis. Please try again.');
        return null;
      } finally {
        setIsLoading(false);
        setIsAnalyzing(false);
        setIsRevalidating(false);
      }
    },
    [
      habits,
      userId,
      effectiveWorkingWindow,
      user?.fullName,
      sprintSession?.config.sprintGoal,
      sprintSession?.config.durationDays,
      currentDayIndex,
      cacheKey,
      isHabitsLoading,
      diagnosis,
      currentStateHash,
    ]
  );

  // Sync diagnosis when habits finish loading OR whenever habit state hash changes (add/delete/edit/log)
  useEffect(() => {
    if (isHabitsLoading) return;

    if (habits.length === 0) {
      lastRequestedHashRef.current = 'empty';
      setDiagnosis(null);
      setLastAnalyzedAt(null);
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(cacheKey);
        } catch {}
      }
      return;
    }

    // 1. Check 0ms localStorage exact hash hit before making ANY network/API call
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as CachePayload;
          const isFresh = Date.now() - parsed.timestamp < CACHE_TTL_MS;
          if (parsed.data && parsed.stateHash === currentStateHash && isFresh) {
            setDiagnosis(parsed.data);
            setLastAnalyzedAt(new Date(parsed.timestamp));
            setIsLoading(false);
            lastRequestedHashRef.current = currentStateHash;
            return; // 0ms hit — zero network or Gemini calls needed!
          }
        }
      } catch {
        // Ignore corrupt localStorage entry
      }
    }

    // 2. Scrub any deleted habits immediately from visible UI before background fetch
    setDiagnosis((prev) => {
      if (!prev) return null;
      const pruned = pruneDeletedHabits(prev, habits);
      return pruned.habitOptimizations.length > 0 ? pruned : null;
    });

    // 3. Deduplicate requests for the exact same stateHash
    if (lastRequestedHashRef.current !== currentStateHash && !isAnalyzing && !isRevalidating) {
      lastRequestedHashRef.current = currentStateHash;
      runDiagnosis(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHabitsLoading, currentStateHash]);

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
    isRevalidating,
    isFreshlyUpdated,
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
