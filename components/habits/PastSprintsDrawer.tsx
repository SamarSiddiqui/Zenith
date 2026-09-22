"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  History,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Check,
} from 'lucide-react';
import type { PastSprintSummary } from '../../types/sprint';
import { getSprintDateRangeLabel, getWeekNumber } from '../../lib/utils/sprintDate';

interface PastSprintsDrawerProps {
  isOpen: boolean;
  pastSprints: PastSprintSummary[];
  isLoading: boolean;
  onClose: () => void;
  onDeleteSprint?: (sprintId: string) => Promise<boolean> | void;
  onSelectSprintAnalytics?: (summary: PastSprintSummary) => void;
}

export function PastSprintsDrawer({
  isOpen,
  pastSprints,
  isLoading,
  onClose,
  onDeleteSprint,
  onSelectSprintAnalytics,
}: PastSprintsDrawerProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (e: React.MouseEvent, sprintId: string) => {
    e.stopPropagation();
    if (!onDeleteSprint) return;
    setIsDeletingId(sprintId);
    try {
      await onDeleteSprint(sprintId);
    } finally {
      setIsDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

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
                      Past 4 Weeks Archive
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-serif text-ink">
                    Past Weeks
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Rolling 4-week archive with 30-day automatic retention.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
                  aria-label="Close past weeks archive"
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
                      No Past Weeks Yet
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      As weekly horizons complete, their retrospective records will appear here for 4 weeks.
                    </p>
                  </div>
                ) : (
                  pastSprints.map((sprint) => {
                    const dateLabel = getSprintDateRangeLabel(
                      sprint.startDate,
                      sprint.durationDays
                    );
                    const weekNum = getWeekNumber(new Date(sprint.startDate));
                    const isConfirming = confirmDeleteId === sprint.id;
                    const isDeleting = isDeletingId === sprint.id;

                    return (
                      <div
                        key={sprint.id}
                        onClick={() => {
                          if (isConfirming) return;
                          if (onSelectSprintAnalytics) {
                            onSelectSprintAnalytics(sprint);
                          }
                        }}
                        className={`group relative rounded-2xl border transition-all duration-150 p-4 ${
                          isConfirming
                            ? 'border-clay/50 bg-clay-wash/30'
                            : 'border-line bg-canvas/70 hover:border-sage/50 hover:bg-canvas hover:shadow-xs cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-ink group-hover:text-sage-deep transition-colors">
                                Week {weekNum}
                              </span>
                              <span className="rounded-full bg-surface border border-line px-2 py-0.5 text-[10px] font-mono text-muted">
                                Archived Week
                              </span>
                            </div>
                            <span className="mt-0.5 block text-xs text-muted font-mono">
                              {dateLabel.includes('·') ? dateLabel.split('·')[1].trim() : dateLabel}
                            </span>
                          </div>

                          {/* Right action controls: Show-up badge & Delete button */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-mono font-bold ${
                                sprint.overallShowUpRate >= 75
                                  ? 'border-sage/40 bg-sage-wash text-sage-deep'
                                  : 'border-clay/40 bg-clay-wash text-clay'
                              }`}
                            >
                              {sprint.overallShowUpRate}%
                            </span>

                            {onDeleteSprint && !isConfirming && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(sprint.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-faint hover:text-clay hover:bg-clay-wash transition-all"
                                title="Delete this archived week record"
                                aria-label={`Delete Week ${weekNum}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Delete Confirmation Bar */}
                        <AnimatePresence>
                          {isConfirming && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 flex items-center justify-between gap-2 border-t border-clay/30 pt-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-[11px] font-mono text-clay font-medium">
                                Delete Week {weekNum} record?
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                  className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[10px] font-mono text-muted hover:text-ink transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={(e) => handleDelete(e, sprint.id)}
                                  className="rounded-lg bg-clay px-2.5 py-1 text-[10px] font-mono font-semibold text-white hover:bg-clay/90 transition-colors flex items-center gap-1"
                                >
                                  {isDeleting ? (
                                    <span className="h-2.5 w-2.5 animate-spin rounded-full border border-white border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-2.5 w-2.5" />
                                  )}
                                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Anchors & Slipped Highlights */}
                        {!isConfirming && (
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
                        )}
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
                <span>Rolling 4-Week Auto-Retention</span>
              </div>
              <p className="mt-1 text-[11px] text-faint leading-relaxed">
                Archived records are maintained for 30 days (4 weeks) before automatic cleanup. You can manually delete any week anytime.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
