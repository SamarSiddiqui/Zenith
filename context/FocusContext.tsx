"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  PhilosopherId,
  FocusSessionState,
  SoundscapeId,
  TreeSpecies,
  GrowthStage,
  PlantedTree,
  FocusSessionSettings,
} from '../types/focus';
import { PHILOSOPHER_CONFIGS } from '../types/focus';
import { soundscapeEngine } from '../lib/audio/soundscapes';
import { useAuth } from './AuthContext';
import { createClient } from '../lib/supabase/client';
import { isSupabaseConfigured } from '../lib/supabase/env';
import { invalidateHabitsCache, calculateHabitHealth } from '../lib/services/habits';
import { getMondayOfWeek, calculateSprintDayInfo } from '../lib/utils/sprintDate';

const LOCAL_STORAGE_TREES_KEY = 'zenith_planted_trees';
const LOCAL_STORAGE_SETTINGS_KEY = 'zenith_focus_settings';
const LOCAL_STORAGE_ACTIVE_SESSION_KEY = 'zenith_active_focus_session';

interface FocusContextType {
  state: FocusSessionState;
  settings: FocusSessionSettings;
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  progress: number; // 0.0 to 1.0
  growthStage: GrowthStage;
  activeCycle: number;
  totalCycles: number;
  isBreak: boolean;
  plantedTrees: PlantedTree[];
  todayFocusedMinutes: number;
  currentQuote: string;
  // Actions
  startSession: (customSettings?: Partial<FocusSessionSettings>) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  cancelSession: () => void;
  skipToBreak: () => void;
  startNextCycle: () => void;
  resetSession: () => void;
  selectArchetype: (id: PhilosopherId) => void;
  setSoundscape: (id: SoundscapeId) => void;
  setSoundVolume: (volume: number) => void;
  setSpecies: (species: TreeSpecies) => void;
  setDuration: (focusMinutes: number, breakMinutes?: number) => void;
  linkHabit: (habitId: string, habitName: string) => void;
  unlinkHabit: () => void;
  setIntention: (intention: string) => void;
  refreshQuote: () => void;
}

const DEFAULT_SETTINGS: FocusSessionSettings = {
  archetype: 'marcus',
  focusDuration: 50,
  breakDuration: 10,
  soundscape: 'none',
  soundVolume: 0.5,
  species: 'oak',
  intention: '',
  strictMode: false,
};

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [settings, setSettings] = useState<FocusSessionSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
        if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  const [state, setState] = useState<FocusSessionState>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(settings.focusDuration * 60);
  const [totalDuration, setTotalDuration] = useState<number>(settings.focusDuration * 60);
  const [activeCycle, setActiveCycle] = useState<number>(1);
  const [totalCycles] = useState<number>(4);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);

  const [plantedTrees, setPlantedTrees] = useState<PlantedTree[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_TREES_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);

  // Save settings on update
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  // Save planted trees
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_TREES_KEY, JSON.stringify(plantedTrees));
    }
  }, [plantedTrees]);

  // Derived progress and stage
  const progress = totalDuration > 0 ? Math.max(0, Math.min(1, 1 - timeLeft / totalDuration)) : 0;

  let growthStage: GrowthStage = 'seed';
  if (state === 'completed') {
    growthStage = 'mature';
  } else if (progress >= 0.75) {
    growthStage = 'blooming';
  } else if (progress >= 0.5) {
    growthStage = 'sapling';
  } else if (progress >= 0.25) {
    growthStage = 'sprout';
  } else {
    growthStage = 'seed';
  }

  // Today's total focused minutes
  const todayFocusedMinutes = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return plantedTrees
      .filter((t) => t.completedAt.startsWith(today) && t.stage === 'mature')
      .reduce((acc, t) => acc + t.minutes, 0);
  }, [plantedTrees]);

  // Current archetype quotes
  const currentArchetypeConfig = PHILOSOPHER_CONFIGS[settings.archetype] || PHILOSOPHER_CONFIGS.marcus;
  const quotesList = currentArchetypeConfig.quotes;
  const currentQuote = quotesList[currentQuoteIndex % quotesList.length] || currentArchetypeConfig.primaryQuote;

  const refreshQuote = useCallback(() => {
    setCurrentQuoteIndex((prev) => (prev + 1) % quotesList.length);
  }, [quotesList.length]);

  // Habit Auto-Completion upon finishing focus session
  const completeLinkedHabit = useCallback(async (habitId: string) => {
    if (!user?.id || user.id === 'local-user') return;
    const supabase = createClient();
    if (!supabase || !isSupabaseConfigured()) return;

    try {
      const currentMonday = getMondayOfWeek(new Date());
      const dayInfo = calculateSprintDayInfo(currentMonday.toISOString(), 7);
      const todayIndex = dayInfo.dayIndex;

      const { data: habitRow } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .maybeSingle();

      if (habitRow) {
        const week = Array.isArray(habitRow.weekly_history)
          ? [...habitRow.weekly_history]
          : ['unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged', 'unlogged'];

        while (week.length <= todayIndex) week.push('unlogged');
        week[todayIndex] = 'completed';

        const newHealth = calculateHabitHealth(week as any[], todayIndex);

        await supabase
          .from('habits')
          .update({
            weekly_history: week,
            current_status: 'completed',
            health_score: newHealth,
            updated_at: new Date().toISOString(),
          })
          .eq('id', habitId);

        invalidateHabitsCache(user.id);
      }
    } catch (e) {
      console.error('[Focus] Failed to auto-complete linked habit:', e);
    }
  }, [user?.id]);

  // Handle session complete
  const handleSessionComplete = useCallback(() => {
    setState('completed');
    targetEndTimeRef.current = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_SESSION_KEY);
    }

    soundscapeEngine.stopSoundscape();
    soundscapeEngine.playBowlChime('complete');

    // Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Zenith Focus Complete', {
        body: isBreak
          ? 'Break over! Ready to return to flow?'
          : `🎉 ${settings.focusDuration} minutes of deep focus achieved. Tree planted in your grove!`,
        icon: '/zenithBot.webp',
      });
    }

    if (!isBreak) {
      // Plant mature tree
      const newTree: PlantedTree = {
        id: `tree-${Date.now()}`,
        species: settings.species,
        minutes: settings.focusDuration,
        archetype: settings.archetype,
        completedAt: new Date().toISOString(),
        habitId: settings.linkedHabitId,
        habitName: settings.linkedHabitName,
        intention: settings.intention,
        stage: 'mature',
      };

      setPlantedTrees((prev) => [newTree, ...prev]);

      // Complete linked habit
      if (settings.linkedHabitId) {
        completeLinkedHabit(settings.linkedHabitId);
      }
    }
  }, [isBreak, settings, completeLinkedHabit]);

  // Timestamp-Based Resilient Timer Interval (Throttling Proof)
  useEffect(() => {
    if (state === 'focusing' || state === 'break') {
      const syncTimer = () => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.ceil((targetEndTimeRef.current - now) / 1000));
        setTimeLeft(diffSeconds);

        // Persist active session snapshot to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            LOCAL_STORAGE_ACTIVE_SESSION_KEY,
            JSON.stringify({
              state,
              targetEndTime: targetEndTimeRef.current,
              totalDuration,
              isBreak,
              activeCycle,
              settings,
            })
          );
        }

        if (diffSeconds <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSessionComplete();
        }
      };

      // Initial immediate sync
      syncTimer();
      timerRef.current = setInterval(syncTimer, 1000);

      // Visibility change / tab focus listener to catch up immediately if throttled
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          syncTimer();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', syncTimer);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', syncTimer);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== 'undefined' && state !== 'paused') {
        localStorage.removeItem(LOCAL_STORAGE_ACTIVE_SESSION_KEY);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, totalDuration, isBreak, activeCycle, settings, handleSessionComplete]);

  // Restore active session on page mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSession = localStorage.getItem(LOCAL_STORAGE_ACTIVE_SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.state === 'focusing' || parsed.state === 'break') {
            const now = Date.now();
            if (parsed.targetEndTime > now) {
              // Session is still active!
              targetEndTimeRef.current = parsed.targetEndTime;
              setTotalDuration(parsed.totalDuration);
              setTimeLeft(Math.ceil((parsed.targetEndTime - now) / 1000));
              setIsBreak(parsed.isBreak);
              setActiveCycle(parsed.activeCycle || 1);
              if (parsed.settings) setSettings(parsed.settings);
              setState(parsed.state);
            } else {
              // Session finished while tab was closed -> award completion
              if (parsed.settings) setSettings(parsed.settings);
              setIsBreak(parsed.isBreak);
              handleSessionComplete();
            }
          }
        }
      } catch (e) {
        console.error('[Focus] Failed to recover active session:', e);
      }
    }
  }, [handleSessionComplete]);

  // Audio Soundscape lifecycle
  useEffect(() => {
    if (state === 'focusing' && settings.soundscape !== 'none') {
      soundscapeEngine.playSoundscape(settings.soundscape, settings.soundVolume);
    } else {
      soundscapeEngine.stopSoundscape();
    }
  }, [state, settings.soundscape, settings.soundVolume]);

  // Start Session
  const startSession = useCallback(
    (customSettings?: Partial<FocusSessionSettings>) => {
      const merged = { ...settings, ...customSettings };
      setSettings(merged);
      const seconds = merged.focusDuration * 60;
      setTotalDuration(seconds);
      setTimeLeft(seconds);
      targetEndTimeRef.current = Date.now() + seconds * 1000;
      setIsBreak(false);
      setState('focusing');

      // Request browser notification permission if not asked
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      soundscapeEngine.playBowlChime('start');
    },
    [settings]
  );

  // Pause
  const pauseSession = useCallback(() => {
    if (state === 'focusing' || state === 'break') {
      setState('paused');
      targetEndTimeRef.current = null;
      soundscapeEngine.stopSoundscape();
    }
  }, [state]);

  // Resume
  const resumeSession = useCallback(() => {
    if (state === 'paused') {
      targetEndTimeRef.current = Date.now() + timeLeft * 1000;
      setState(isBreak ? 'break' : 'focusing');
    }
  }, [state, isBreak, timeLeft]);

  // Cancel Session (withering mechanic if early exit)
  const cancelSession = useCallback(() => {
    const elapsedSeconds = totalDuration - timeLeft;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    // If abandoned early (> 2 mins invested but < 80% finished), record a withered tree
    if (!isBreak && elapsedMinutes >= 2 && progress < 0.8) {
      const witheredTree: PlantedTree = {
        id: `tree-withered-${Date.now()}`,
        species: settings.species,
        minutes: elapsedMinutes,
        archetype: settings.archetype,
        completedAt: new Date().toISOString(),
        habitId: settings.linkedHabitId,
        habitName: settings.linkedHabitName,
        intention: settings.intention,
        stage: 'withered',
      };
      setPlantedTrees((prev) => [witheredTree, ...prev]);
    }

    soundscapeEngine.stopSoundscape();
    targetEndTimeRef.current = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_SESSION_KEY);
    }

    setState('idle');
    setTimeLeft(settings.focusDuration * 60);
    setTotalDuration(settings.focusDuration * 60);
    setIsBreak(false);
  }, [totalDuration, timeLeft, isBreak, progress, settings]);

  // Skip to Rest / Break
  const skipToBreak = useCallback(() => {
    soundscapeEngine.stopSoundscape();
    const breakSeconds = settings.breakDuration * 60;
    setIsBreak(true);
    setTotalDuration(breakSeconds);
    setTimeLeft(breakSeconds);
    targetEndTimeRef.current = Date.now() + breakSeconds * 1000;
    setState('break');
  }, [settings.breakDuration]);

  // Start Next Cycle
  const startNextCycle = useCallback(() => {
    setActiveCycle((prev) => (prev % totalCycles) + 1);
    startSession();
  }, [totalCycles, startSession]);

  // Reset Session
  const resetSession = useCallback(() => {
    soundscapeEngine.stopSoundscape();
    targetEndTimeRef.current = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_SESSION_KEY);
    }
    setState('idle');
    setIsBreak(false);
    setTimeLeft(settings.focusDuration * 60);
    setTotalDuration(settings.focusDuration * 60);
  }, [settings.focusDuration]);

  // Archetype selection
  const selectArchetype = useCallback((id: PhilosopherId) => {
    const config = PHILOSOPHER_CONFIGS[id] || PHILOSOPHER_CONFIGS.marcus;
    setSettings((prev) => ({
      ...prev,
      archetype: id,
      focusDuration: config.focusMinutes,
      breakDuration: config.breakMinutes,
      species: config.defaultSpecies,
    }));
    setTimeLeft(config.focusMinutes * 60);
    setTotalDuration(config.focusMinutes * 60);
    targetEndTimeRef.current = null;
  }, []);

  const setSoundscape = useCallback((id: SoundscapeId) => {
    setSettings((prev) => ({ ...prev, soundscape: id }));
  }, []);

  const setSoundVolume = useCallback((volume: number) => {
    setSettings((prev) => ({ ...prev, soundVolume: volume }));
    soundscapeEngine.setVolume(volume);
  }, []);

  const setSpecies = useCallback((species: TreeSpecies) => {
    setSettings((prev) => ({ ...prev, species }));
  }, []);

  const setDuration = useCallback((focusMinutes: number, breakMinutes?: number) => {
    setSettings((prev) => ({
      ...prev,
      focusDuration: focusMinutes,
      breakDuration: breakMinutes !== undefined ? breakMinutes : prev.breakDuration,
    }));
    setTimeLeft(focusMinutes * 60);
    setTotalDuration(focusMinutes * 60);
    targetEndTimeRef.current = null;
  }, []);

  const linkHabit = useCallback((habitId: string, habitName: string) => {
    setSettings((prev) => ({
      ...prev,
      linkedHabitId: habitId,
      linkedHabitName: habitName,
    }));
  }, []);

  const unlinkHabit = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      linkedHabitId: undefined,
      linkedHabitName: undefined,
    }));
  }, []);

  const setIntention = useCallback((intention: string) => {
    setSettings((prev) => ({ ...prev, intention }));
  }, []);

  return (
    <FocusContext.Provider
      value={{
        state,
        settings,
        timeLeft,
        totalDuration,
        progress,
        growthStage,
        activeCycle,
        totalCycles,
        isBreak,
        plantedTrees,
        todayFocusedMinutes,
        currentQuote,
        startSession,
        pauseSession,
        resumeSession,
        cancelSession,
        skipToBreak,
        startNextCycle,
        resetSession,
        selectArchetype,
        setSoundscape,
        setSoundVolume,
        setSpecies,
        setDuration,
        linkHabit,
        unlinkHabit,
        setIntention,
        refreshQuote,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return ctx;
}
