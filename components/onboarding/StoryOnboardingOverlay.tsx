"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  X,
  Compass,
  Zap,
  TreePine,
  Loader2,
} from 'lucide-react';
import type { ZenithUserProfile } from '../../types/auth';
import { ChapterPhilosophy } from './chapters/ChapterPhilosophy';
import { ChapterWorkingWindow } from './chapters/ChapterWorkingWindow';

export interface StoryChapterMeta {
  id: string;
  chapterNumber: number;
  tag: string;
  title: string;
  subtitle: string;
}

export const STORY_CHAPTERS: StoryChapterMeta[] = [
  {
    id: 'philosophy',
    chapterNumber: 1,
    tag: 'Chapter 01 · Philosophy',
    title: 'Consistency without the guilt.',
    subtitle:
      'Most habit apps punish one bad day by resetting your streak to zero. Zenith is built to survive real life.',
  },
  {
    id: 'window',
    chapterNumber: 2,
    tag: 'Chapter 02 · Working Window',
    title: 'Only your real energy hours count.',
    subtitle:
      'Set a daily Working Window. Zenith tracks momentum while your day is open—and lets you rest peacefully when it closes.',
  },
  {
    id: 'micro',
    chapterNumber: 3,
    tag: 'Chapter 03 · Micro-Fallbacks',
    title: 'Never miss twice. Shrink instead.',
    subtitle:
      'Low-energy day? Tap once to shrink any heavy ritual into a 5-minute micro-step and keep your promise alive.',
  },
  {
    id: 'ecosystem',
    chapterNumber: 4,
    tag: 'Chapter 04 · Sanctuary',
    title: 'Grow a grove as you focus.',
    subtitle:
      'Every deep focus session grows a tree in your Zen Grove, paired with mindful AI pattern check-ins and gentle Telegram nudges.',
  },
  {
    id: 'launchpad',
    chapterNumber: 5,
    tag: 'Chapter 05 · Begin',
    title: 'Your sanctuary is ready.',
    subtitle:
      'Take a calm breath. You can refine your rhythm anytime in Settings—or step straight into your dashboard.',
  },
];

export interface StoryOnboardingOverlayProps {
  isOpen: boolean;
  currentChapter: number;
  onChapterChange: (chapter: number) => void;
  onComplete: (profileUpdates?: Partial<ZenithUserProfile>) => Promise<unknown> | void;
  onSkip: () => Promise<unknown> | void;
  isReplaying?: boolean;
  onCloseReplay?: () => void;
  isSaving?: boolean;
  userName?: string;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 42 : -42,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -42 : 42,
    opacity: 0,
    scale: 0.98,
  }),
};

export function StoryOnboardingOverlay({
  isOpen,
  currentChapter,
  onChapterChange,
  onComplete,
  onSkip,
  isReplaying = false,
  onCloseReplay,
  isSaving = false,
  userName,
}: StoryOnboardingOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState<number>(1);
  const touchStartXRef = useRef<number | null>(null);

  const totalChapters = STORY_CHAPTERS.length;
  const safeChapterIndex = Math.max(0, Math.min(totalChapters - 1, currentChapter));
  const activeMeta = STORY_CHAPTERS[safeChapterIndex];
  const isLastChapter = safeChapterIndex === totalChapters - 1;
  const firstName = userName?.trim() ? userName.trim().split(' ')[0] : '';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll while story overlay is active
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const goToChapter = useCallback(
    (nextIndex: number) => {
      if (isSaving) return;
      const bounded = Math.max(0, Math.min(totalChapters - 1, nextIndex));
      if (bounded === safeChapterIndex) return;
      setDirection(bounded > safeChapterIndex ? 1 : -1);
      onChapterChange(bounded);
    },
    [isSaving, totalChapters, safeChapterIndex, onChapterChange]
  );

  const handleNext = useCallback(() => {
    if (isSaving) return;
    if (isLastChapter) {
      onComplete();
    } else {
      goToChapter(safeChapterIndex + 1);
    }
  }, [isSaving, isLastChapter, onComplete, goToChapter, safeChapterIndex]);

  const handlePrev = useCallback(() => {
    if (isSaving || safeChapterIndex === 0) return;
    goToChapter(safeChapterIndex - 1);
  }, [isSaving, safeChapterIndex, goToChapter]);

  const handleDismiss = useCallback(() => {
    if (isSaving) return;
    if (isReplaying && onCloseReplay) {
      onCloseReplay();
    } else {
      onSkip();
    }
  }, [isSaving, isReplaying, onCloseReplay, onSkip]);

  // Keyboard navigation (ArrowLeft / ArrowRight / Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleDismiss]);

  // Mobile touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX;
    if (typeof endX !== 'number') return;

    const deltaX = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 55) return;
    if (deltaX < 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  if (!mounted || !isOpen) return null;

  // Modular stage preview renderer (Steps 3-5 will replace each case with dedicated animated components)
  const renderChapterStage = (index: number) => {
    switch (index) {
      case 0:
        return <ChapterPhilosophy firstName={firstName} />;
      case 1:
        return <ChapterWorkingWindow />;
      case 2:
        return (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-canvas/80 p-6 sm:p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-clay-wash text-clay border border-clay/25">
              <Zap className="h-6 w-6" />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-clay">
              5-Minute Micro-Fallback
            </p>
            <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted leading-relaxed">
              Visual scene coming in Step 4: interactive 45m to 5m ritual shrink card.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-canvas/80 p-6 sm:p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-wash text-sage-deep border border-sage/30">
              <TreePine className="h-6 w-6" />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-sage-deep">
              Zen Grove, AI &amp; Nudges
            </p>
            <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted leading-relaxed">
              Visual scene coming in Step 4: growing focus tree, AI diagnosis &amp; Telegram check-ins.
            </p>
          </div>
        );
      case 4:
      default:
        return (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-sage/30 bg-sage-wash/40 p-6 sm:p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-sage-deep border border-sage/30 shadow-xs">
              <Compass className="h-6 w-6" />
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-sage-deep">
              Ready to Begin
            </p>
            <p className="mt-2 max-w-sm text-xs sm:text-sm text-muted leading-relaxed">
              Launchpad controls coming in Step 5: optional quick window tune &amp; enter dashboard.
            </p>
          </div>
        );
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Zenith Story"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed inset-0 z-[100] flex flex-col justify-between overflow-y-auto bg-canvas/96 backdrop-blur-xl px-4 py-5 sm:px-8 sm:py-8"
      >
        {/* Subtle Ambient Background Auras */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-sage-wash blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-clay-wash/70 blur-3xl"
          />
        </div>

        {/* Top Bar: Segmented Progress + Brand + Skip/Close */}
        <header className="relative z-10 mx-auto w-full max-w-2xl space-y-4">
          {/* Segmented Story Progress Track */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Story progress">
            {STORY_CHAPTERS.map((chapter, idx) => {
              const isCompleted = idx < safeChapterIndex;
              const isCurrent = idx === safeChapterIndex;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => goToChapter(idx)}
                  aria-label={`Go to ${chapter.tag}`}
                  className="group py-1.5 cursor-pointer focus:outline-none"
                >
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-line/80">
                    <motion.div
                      className={`h-full rounded-full transition-colors ${isCurrent ? 'bg-sage-deep' : isCompleted ? 'bg-sage' : 'bg-transparent'
                        }`}
                      initial={false}
                      animate={{
                        width: isCompleted || isCurrent ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-wash overflow-hidden border border-sage/30 shadow-xs shrink-0">
                <img src="/zenithBot.webp" alt="Zenith" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg text-ink tracking-tight">Zenith</span>
                <span className="text-[11px] font-mono text-faint">
                  {safeChapterIndex + 1} / {totalChapters}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface/80 px-3 py-1.5 text-xs font-mono text-muted hover:border-ink/40 hover:text-ink transition-colors disabled:opacity-50 cursor-pointer"
            >
              <span>{isReplaying ? 'Close' : 'Skip Tour'}</span>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* Center Editorial Story Stage */}
        <main className="relative z-10 mx-auto my-auto flex w-full max-w-2xl flex-col py-6 sm:py-8">
          <div className="rounded-3xl border border-line bg-surface/95 p-5 sm:p-8 shadow-calm backdrop-blur-md overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeMeta.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-6"
              >
                {/* Chapter Heading */}
                <div className="space-y-2 text-center sm:text-left">
                  <span className="inline-block rounded-full border border-sage/30 bg-sage-wash/70 px-3 py-0.5 text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-widest text-sage-deep">
                    {activeMeta.tag}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-ink tracking-tight leading-snug">
                    {activeMeta.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed max-w-xl">
                    {activeMeta.subtitle}
                  </p>
                </div>

                {/* Animated Chapter Visual Slot */}
                <div>{renderChapterStage(safeChapterIndex)}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom Thumb-Friendly Navigation Dock */}
        <footer className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={safeChapterIndex === 0 || isSaving}
            className={`inline-flex items-center gap-1.5 rounded-2xl border border-line bg-surface px-4 py-2.5 text-xs font-medium text-muted hover:text-ink hover:border-ink/30 transition-all cursor-pointer disabled:opacity-0 disabled:pointer-events-none`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>

          <span className="hidden sm:inline text-[11px] font-mono text-faint">
            Use ← → keys or swipe to turn chapters
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-sage hover:bg-sage-deep px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-medium text-white shadow-calm transition-all active:scale-[0.98] disabled:opacity-70 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Entering...</span>
              </>
            ) : isLastChapter ? (
              <>
                <span>{isReplaying ? 'Return to Zenith' : 'Enter My Sanctuary'}</span>
                <Sparkles className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </footer>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

