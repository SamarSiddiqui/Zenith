"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  History,
  Calendar,
  Award,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import type { PastSprintSummary, SprintAnalytics } from '../../types/sprint';
import { getSprintDateRangeLabel } from '../../lib/utils/sprintDate';

interface PastSprintsDrawerProps {
  isOpen: boolean;
  pastSprints: PastSprintSummary[];
  isLoading: boolean;
  onClose: () => void;
  onSelectSprintAnalytics?: (summary: PastSprintSummary) => void;
}

export function PastSprintsDrawer({
  isOpen,
  pastSprints,
  isLoading,
  onClose,
  onSelectSprintAnalytics,
}: PastSprintsDrawerProps) {
  const [selectedSprint, setSelectedSprint] = useState<PastSprintSummary | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          {/* Slide-over Drawer Window */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-screen max-w-md bg-surface border-l border-line p-6 sm:p-8 flex flex-col justify-between shadow-floating overflow-y-auto"
          >
            {/* Top Header */}
            <div>
              <div className="flex items-start justify-between border-b border-line pb-5">
                <div>
                  <div className="flex items-center gap-2 text-sage-deep">
                    <History className="h-4 w-4" />
                    <span className="font-mono text-xs uppercase tracking-widest font-semibold">
                      Sprint Timeline Archive
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-serif text-ink">
                    Past Sprints
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Review historical show-up momentum and retrospective diagnostics.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sprint List */}
              <div className="mt-6 space-y-3">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-sage border-t-transparent" />
                    <span className="mt-3 text-xs font-mono">Loading archive...</span>
                  </div>
                ) : pastSprints.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line p-8 text-center">
                    <History className="mx-auto h-8 w-8 text-faint" />
                    <h3 className="mt-2 text-sm font-serif text-ink">
                      No Past Sprints Yet
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      Complete your active sprint horizon to unlock retrospective records.
                    </p>
                  </div>
                ) : (
                  pastSprints.map((sprint) => {
                    const dateLabel = getSprintDateRangeLabel(
                      sprint.startDate,
                      sprint.durationDays
                    );

                    return (
                      <div
                        key={sprint.id}
                        onClick={() => {
                          setSelectedSprint(sprint);
                          if (onSelectSprintAnalytics) {
                            onSelectSprintAnalytics(sprint);
                          }
                        }}
                        className="group relative cursor-pointer rounded-2xl border border-line bg-canvas/70 p-4 transition-all duration-150 hover:border-sage/50 hover:bg-canvas hover:shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-ink group-hover:text-sage-deep transition-colors">
                                Sprint {sprint.sprintNumber}
                              </span>
                              <span className="rounded-full bg-surface border border-line px-2 py-0.2 text-[10px] font-mono text-muted">
                                {sprint.durationDays} Days
                              </span>
                            </div>
                            <span className="mt-0.5 block text-xs text-muted font-mono">
                              {dateLabel}
                            </span>
                          </div>

                          {/* Show-up Badge */}
                          <div className="text-right">
                            <span
                              className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-mono font-bold ${
                                sprint.overallShowUpRate >= 75
                                  ? 'border-sage/40 bg-sage-wash text-sage-deep'
                                  : 'border-clay/40 bg-clay-wash text-clay'
                              }`}
                            >
                              {sprint.overallShowUpRate}%
                            </span>
                          </div>
                        </div>

                        {/* Anchors & Slipped Highlights */}
                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line/50 pt-2 text-[11px] font-mono">
                          {sprint.anchorHabitName && (
                            <div className="flex items-center gap-1.5 text-sage-deep truncate">
                              <TrendingUp className="h-3 w-3 shrink-0" />
                              <span className="truncate">{sprint.anchorHabitName}</span>
                            </div>
                          )}
                          {sprint.slippedHabitName && (
                            <div className="flex items-center gap-1.5 text-clay truncate">
                              <AlertCircle className="h-3 w-3 shrink-0" />
                              <span className="truncate">{sprint.slippedHabitName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom Info Banner */}
            <div className="mt-8 rounded-2xl border border-line/60 bg-canvas p-4 text-xs text-muted">
              <div className="flex items-center gap-2 text-ink font-semibold">
                <ShieldCheck className="h-4 w-4 text-sage-deep" />
                <span>Zero-Guilt Adaptive Analytics</span>
              </div>
              <p className="mt-1 text-[11px] text-faint leading-relaxed">
                Past performance is diagnostic feedback to optimize future energy, not an evaluation.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
