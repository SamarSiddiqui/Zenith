"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import type { ExecutiveSynthesis } from '../../types/diagnosis';

interface ExecutiveSynthesisCardProps {
  synthesis: ExecutiveSynthesis;
  onExploreOptimizations?: () => void;
}

export function ExecutiveSynthesisCard({
  synthesis,
  onExploreOptimizations,
}: ExecutiveSynthesisCardProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-calm">
      {/* Editorial Headline & AI Quote */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sage-wash text-sage-deep border border-sage/30">
            <Compass className="h-4 w-4" />
          </div>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sage-deep">
            Circadian AI Synthesis
          </span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl text-ink leading-tight">
          &ldquo;{synthesis.headline}&rdquo;
        </h2>

        <p className="text-sm text-muted font-light leading-relaxed pt-1">
          {synthesis.briefing}
        </p>
      </div>

      {/* Primary Breakthrough Opportunity Card */}
      {synthesis.primaryGrowthOpportunity && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-sage/30 bg-sage-wash/50 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage text-white shrink-0 shadow-xs">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-sage-deep">
                Primary Growth Opportunity
              </span>
              <p className="text-xs sm:text-sm font-medium text-ink mt-0.5">
                {synthesis.primaryGrowthOpportunity}
              </p>
            </div>
          </div>

          {onExploreOptimizations && (
            <button
              type="button"
              onClick={onExploreOptimizations}
              className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl bg-sage px-3.5 py-1.5 text-xs font-mono font-medium text-white shadow-xs hover:bg-sage-deep transition-all cursor-pointer shrink-0"
            >
              <span>View Habit Lab</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Strengths Pills */}
      {synthesis.strengths && synthesis.strengths.length > 0 && (
        <div className="pt-2 border-t border-line/60">
          <span className="block text-[11px] font-mono text-faint mb-2">
            Demonstrated Strengths This Sprint:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {synthesis.strengths.map((str, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1 text-xs font-mono text-ink shadow-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-sage-deep stroke-[2]" />
                <span>{str}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
