"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, ExternalLink, Moon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return '09:00 AM';
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr || '9', 10);
  const minute = minStr || '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
}

export function WorkingWindow() {
  const { user } = useAuth();
  const [now, setNow] = useState<Date>(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const windowConfig = useMemo(() => {
    const startTimeStr = user?.workingWindow?.startTime || '09:00';
    const endTimeStr = user?.workingWindow?.endTime || '19:00';

    const [startH, startM] = startTimeStr.split(':').map((v) => parseInt(v, 10));
    const [endH, endM] = endTimeStr.split(':').map((v) => parseInt(v, 10));

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = (startH || 9) * 60 + (startM || 0);
    const endMinutes = (endH || 19) * 60 + (endM || 0);
    const totalWindowMinutes = Math.max(1, endMinutes - startMinutes);

    let elapsedPercent = 0;
    let statusText = '';
    let isWindowOpen = false;
    let isWindowPast = false;

    if (currentMinutes < startMinutes) {
      elapsedPercent = 0;
      const diffMins = startMinutes - currentMinutes;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      statusText = `Opens in ${hours > 0 ? `${hours}h ` : ''}${mins}m`;
    } else if (currentMinutes >= endMinutes) {
      elapsedPercent = 100;
      isWindowPast = true;
      statusText = '0m remaining · Complete rituals if you wish';
    } else {
      isWindowOpen = true;
      const elapsedMins = currentMinutes - startMinutes;
      elapsedPercent = Math.min(100, Math.round((elapsedMins / totalWindowMinutes) * 100));

      const remainingMins = endMinutes - currentMinutes;
      if (remainingMins < 60) {
        statusText = `${remainingMins} ${remainingMins === 1 ? 'min' : 'mins'} remaining`;
      } else {
        const remainingHours = (remainingMins / 60).toFixed(1);
        statusText = `${remainingHours} hours remaining`;
      }
    }

    const currentFormatted = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return {
      startTimeFormatted: formatTimeTo12Hour(startTimeStr),
      endTimeFormatted: formatTimeTo12Hour(endTimeStr),
      currentFormatted,
      elapsedPercent,
      statusText,
      isWindowOpen,
      isWindowPast,
    };
  }, [user?.workingWindow, now]);

  return (
    <div className="rounded-2xl border border-line bg-surface px-6 py-5 shadow-calm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {windowConfig.isWindowPast ? (
            <Moon className="h-3.5 w-3.5 text-sage" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-sage-deep" />
          )}
          <p className="text-xs uppercase tracking-[0.16em] text-faint font-mono">
            Working Window
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono font-medium ${
              windowConfig.isWindowOpen
                ? 'text-ink font-semibold'
                : windowConfig.isWindowPast
                ? 'text-sage-deep font-semibold'
                : 'text-muted'
            }`}
          >
            {windowConfig.statusText}
          </span>
          <Link
            href="/settings"
            title="Configure working window in Settings"
            className="text-faint hover:text-sage-deep transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Dynamic Real-Time Progress Bar */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-canvas">
        <motion.div
          className={`h-full rounded-full ${
            windowConfig.isWindowPast
              ? 'bg-sage/80'
              : windowConfig.isWindowOpen
              ? 'bg-sage'
              : 'bg-line-hover'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${windowConfig.elapsedPercent}%` }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>

      {/* Start / Now / End Labels */}
      <div className="mt-2 flex justify-between text-xs text-muted font-mono">
        <span>{windowConfig.startTimeFormatted}</span>
        <span className="font-semibold text-ink">Now · {windowConfig.currentFormatted}</span>
        <span>{windowConfig.endTimeFormatted}</span>
      </div>
    </div>
  );
}
