"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TreePine,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Flame,
  Layers,
} from 'lucide-react';
import type { PlantedTree, TreeSpecies } from '../../types/focus';
import { PHILOSOPHER_CONFIGS } from '../../types/focus';

interface ZenGroveProps {
  trees: PlantedTree[];
  todayFocusedMinutes: number;
}

export function ZenGrove({ trees, todayFocusedMinutes }: ZenGroveProps) {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter today's vs all-time trees
  const todayTrees = useMemo(() => {
    return trees.filter((t) => t.completedAt.startsWith(todayStr));
  }, [trees, todayStr]);

  const matureTreesCount = useMemo(() => {
    return trees.filter((t) => t.stage === 'mature').length;
  }, [trees]);

  const totalAllTimeMinutes = useMemo(() => {
    return trees
      .filter((t) => t.stage === 'mature')
      .reduce((sum, t) => sum + t.minutes, 0);
  }, [trees]);

  const getSpeciesColor = (species: TreeSpecies) => {
    switch (species) {
      case 'sakura':
        return '#f472b6';
      case 'pine':
        return '#10b981';
      case 'bonsai':
        return '#22c55e';
      case 'willow':
        return '#14b8a6';
      case 'oak':
      default:
        return '#4ade80';
    }
  };

  const formatTimestamp = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-muted mb-1">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Today's Focus</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-ink">
              {todayFocusedMinutes}
            </span>
            <span className="text-xs text-muted">mins</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-muted mb-1">
            <TreePine className="h-4 w-4 text-amber-500" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Trees Grown</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-ink">
              {matureTreesCount}
            </span>
            <span className="text-xs text-muted">planted</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-muted mb-1">
            <Flame className="h-4 w-4 text-rose-500" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Depth</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-ink">
              {(totalAllTimeMinutes / 60).toFixed(1)}
            </span>
            <span className="text-xs text-muted">hours</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-muted mb-1">
            <Layers className="h-4 w-4 text-blue-500" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Today's Trees</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-ink">
              {todayTrees.length}
            </span>
            <span className="text-xs text-muted">sessions</span>
          </div>
        </div>
      </div>

      {/* Visual Forest Grove Grid */}
      <div className="rounded-3xl border border-border/80 bg-card/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-ink tracking-tight flex items-center gap-2">
              <TreePine className="h-5 w-5 text-emerald-500" />
              Daily Zen Grove
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Trees cultivated through unbroken cognitive presence
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
            {todayTrees.filter((t) => t.stage === 'mature').length} Thriving Today
          </span>
        </div>

        {trees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/10 text-muted mb-3">
              <TreePine className="h-8 w-8 opacity-60" />
            </div>
            <h4 className="text-sm font-semibold text-ink">Your Grove is Ready</h4>
            <p className="text-xs text-muted max-w-xs mt-1">
              Start a focus session above to plant your first seed and grow a flourishing mind garden.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {trees.map((tree) => {
              const isWithered = tree.stage === 'withered';
              const speciesColor = getSpeciesColor(tree.species);
              const philosopher = PHILOSOPHER_CONFIGS[tree.archetype] || PHILOSOPHER_CONFIGS.marcus;

              return (
                <motion.div
                  key={tree.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`group relative flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 ${
                    isWithered
                      ? 'border-border/40 bg-card/30 opacity-75'
                      : 'border-border/70 bg-card/60 hover:border-border hover:bg-card/90 shadow-sm'
                  }`}
                >
                  {/* Tree Icon & Species Glow */}
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: isWithered ? '#78716c18' : `${speciesColor}18`,
                      color: isWithered ? '#78716c' : speciesColor,
                      border: `1px solid ${isWithered ? '#78716c30' : `${speciesColor}40`}`,
                    }}
                  >
                    <TreePine className="h-5 w-5" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-ink truncate capitalize">
                        {tree.species} · {tree.minutes}m
                      </h4>
                      <span className="text-[10px] font-mono text-muted shrink-0">
                        {formatTimestamp(tree.completedAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {philosopher.name} Protocol
                    </p>

                    {tree.habitName && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 rounded-md px-2 py-0.5 w-fit">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">Linked: {tree.habitName}</span>
                      </div>
                    )}

                    {isWithered && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 rounded-md px-2 py-0.5 w-fit">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>Withdrawn early</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
