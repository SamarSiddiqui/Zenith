"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [justReconnected, setJustReconnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkRealConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // Fast HEAD ping to verify real internet connectivity
      const response = await fetch('/favicon.ico?' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
      });
      if (response.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial status check
    if (!navigator.onLine) {
      setIsOnline(false);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !justReconnected) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-lg pointer-events-auto"
        role="status"
        aria-live="polite"
      >
        {!isOnline ? (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-amber-500/40 bg-surface/95 backdrop-blur-md shadow-calm text-xs text-ink">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <WifiOff className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ink text-[11px] sm:text-xs">
                  Offline Mode Active
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted truncate">
                  Changes saved locally. Syncing will resume upon reconnect.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={checkRealConnection}
              disabled={isChecking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line bg-canvas hover:bg-surface text-[11px] font-mono font-medium text-ink transition-colors shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
              title="Ping server to test connection"
            >
              <RefreshCw className={`w-3 h-3 text-sage-deep ${isChecking ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isChecking ? 'Checking...' : 'Check'}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-sage/40 bg-surface/95 backdrop-blur-md shadow-calm text-xs text-sage-deep">
            <CheckCircle2 className="h-4 w-4 text-sage-deep shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">
              Back online — Cloud connection restored.
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

