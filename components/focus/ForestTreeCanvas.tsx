"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TreeSpecies, GrowthStage } from '../../types/focus';

interface ForestTreeCanvasProps {
  species: TreeSpecies;
  stage: GrowthStage;
  progress: number; // 0.0 to 1.0
  isBreak?: boolean;
  accentColor?: string;
  className?: string;
}

export function ForestTreeCanvas({
  species,
  stage,
  progress,
  isBreak = false,
  accentColor = '#10b981',
  className = '',
}: ForestTreeCanvasProps) {
  // Generate distinct species colors and aesthetic accents
  const speciesTheme = useMemo(() => {
    switch (species) {
      case 'sakura':
        return {
          trunk: '#5c3a21',
          foliage1: '#f472b6',
          foliage2: '#fb7185',
          foliage3: '#fda4af',
          leafGlow: 'rgba(244, 114, 182, 0.4)',
          particleColor: '#fbcfe8',
          name: 'Cherry Blossom',
        };
      case 'pine':
        return {
          trunk: '#3e2723',
          foliage1: '#065f46',
          foliage2: '#047857',
          foliage3: '#10b981',
          leafGlow: 'rgba(16, 185, 129, 0.35)',
          particleColor: '#a7f3d0',
          name: 'Alpine Pine',
        };
      case 'bonsai':
        return {
          trunk: '#4a3728',
          foliage1: '#15803d',
          foliage2: '#22c55e',
          foliage3: '#86efac',
          leafGlow: 'rgba(34, 197, 94, 0.4)',
          particleColor: '#bbf7d0',
          name: 'Ancient Bonsai',
        };
      case 'willow':
        return {
          trunk: '#3d2b1f',
          foliage1: '#0d9488',
          foliage2: '#14b8a6',
          foliage3: '#5eead4',
          leafGlow: 'rgba(20, 184, 166, 0.35)',
          particleColor: '#99f6e4',
          name: 'Weeping Willow',
        };
      case 'oak':
      default:
        return {
          trunk: '#543d2b',
          foliage1: '#166534',
          foliage2: '#15803d',
          foliage3: '#4ade80',
          leafGlow: 'rgba(74, 222, 128, 0.35)',
          particleColor: '#bbf7d0',
          name: 'Stoic Oak',
        };
    }
  }, [species]);

  const isWithered = stage === 'withered';
  const isMature = stage === 'mature';

  // Dynamic scale calculation based on progress
  const trunkScaleY = isWithered ? 0.8 : Math.max(0.2, Math.min(1, progress * 1.1));
  const canopyScale = isWithered ? 0.3 : Math.max(0.1, progress);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden select-none ${className}`}>
      {/* Ambient Radial Aura */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: isMature ? [0.6, 0.85, 0.6] : [0.25, 0.4, 0.25],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute h-72 w-72 rounded-full blur-3xl pointer-events-none"
        style={{
          background: isWithered
            ? 'radial-gradient(circle, rgba(120, 113, 108, 0.3) 0%, transparent 70%)'
            : `radial-gradient(circle, ${speciesTheme.leafGlow} 0%, transparent 70%)`,
        }}
      />

      {/* Main Organic Tree Canvas SVG */}
      <svg
        viewBox="0 0 400 400"
        className="relative h-full w-full max-h-[380px] max-w-[380px] drop-shadow-2xl"
      >
        <defs>
          <linearGradient id={`trunkGrad-${species}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isWithered ? '#44403c' : speciesTheme.trunk} />
            <stop offset="100%" stopColor={isWithered ? '#292524' : '#271810'} />
          </linearGradient>

          <linearGradient id={`canopyGrad-${species}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isWithered ? '#78716c' : speciesTheme.foliage3} />
            <stop offset="50%" stopColor={isWithered ? '#57534e' : speciesTheme.foliage2} />
            <stop offset="100%" stopColor={isWithered ? '#292524' : speciesTheme.foliage1} />
          </linearGradient>

          <radialGradient id={`glowGrad-${species}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={speciesTheme.foliage3} stopOpacity="0.8" />
            <stop offset="100%" stopColor={speciesTheme.foliage1} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Floating Ambient Zen Spores / Petals */}
        {!isWithered && progress > 0.3 && (
          <g className="opacity-75">
            {[...Array(8)].map((_, i) => (
              <motion.circle
                key={i}
                r={i % 2 === 0 ? 2.5 : 1.5}
                fill={speciesTheme.particleColor}
                initial={{
                  cx: 160 + (i * 25) % 80,
                  cy: 220 - (i * 20) % 100,
                  opacity: 0,
                }}
                animate={{
                  cy: [220 - (i * 20) % 100, 100 - (i * 15), 60],
                  cx: [
                    160 + (i * 25) % 80,
                    150 + (i * 30) % 100 + Math.sin(i) * 20,
                    140 + (i * 25) % 120,
                  ],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 4 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </g>
        )}

        {/* Zen Mound / Pedestal Base */}
        <g transform="translate(200, 340)">
          {/* Shadow */}
          <ellipse cx="0" cy="10" rx="90" ry="14" fill="rgba(0,0,0,0.3)" />

          {/* Grass Island */}
          <path
            d="M -80,0 Q 0,-18 80,0 Q 0,16 -80,0"
            fill={isWithered ? '#44403c' : '#1c3826'}
            stroke={isWithered ? '#57534e' : '#2d5a3f'}
            strokeWidth="2"
          />

          {/* Tiny Zen Stones */}
          <circle cx="-50" cy="-2" r="5" fill="#78716c" opacity="0.8" />
          <circle cx="-42" cy="2" r="3.5" fill="#a8a29e" opacity="0.8" />
          <circle cx="55" cy="1" r="4" fill="#78716c" opacity="0.8" />
        </g>

        {/* 1. SEED / SPROUT STAGE (< 25% Progress) */}
        {stage === 'seed' && (
          <g transform="translate(200, 335)">
            {/* Glowing Seed Pod */}
            <motion.circle
              cx="0"
              cy="-2"
              r="6"
              fill={speciesTheme.foliage2}
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Tiny First Leaves */}
            <motion.path
              d="M 0,-2 Q -10,-15 -4,-22 Q 0,-15 0,-2"
              fill={speciesTheme.foliage3}
              initial={{ scale: 0 }}
              animate={{ scale: Math.max(0.4, progress * 4) }}
              transition={{ duration: 0.5 }}
            />
            <motion.path
              d="M 0,-2 Q 10,-15 4,-22 Q 0,-15 0,-2"
              fill={speciesTheme.foliage3}
              initial={{ scale: 0 }}
              animate={{ scale: Math.max(0.4, progress * 4) }}
              transition={{ duration: 0.5 }}
            />
          </g>
        )}

        {/* 2. GROWING TRUNK (Oak, Pine, Bonsai, Willow, Sakura) */}
        {stage !== 'seed' && (
          <motion.g
            initial={{ scaleY: 0 }}
            animate={{ scaleY: trunkScaleY }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ transformOrigin: '200px 340px' }}
          >
            {/* Species-Specific Trunk Geometry */}
            {species === 'bonsai' ? (
              // Twisting Bonsai Trunk
              <path
                d="M 194,340 C 185,300 225,270 190,230 C 175,210 205,180 200,165 C 196,180 178,215 198,235 C 228,275 190,305 206,340 Z"
                fill={`url(#trunkGrad-${species})`}
              />
            ) : species === 'pine' ? (
              // Tall Straight Conifer Trunk
              <path
                d="M 194,340 L 198,140 L 202,140 L 206,340 Z"
                fill={`url(#trunkGrad-${species})`}
              />
            ) : (
              // Classic Spreading Oak / Sakura / Willow Trunk
              <path
                d="M 192,340 C 192,290 185,250 175,210 C 165,170 180,160 190,165 C 195,190 205,190 210,165 C 220,160 235,170 225,210 C 215,250 208,290 208,340 Z"
                fill={`url(#trunkGrad-${species})`}
              />
            )}

            {/* Primary Branch Tendrils */}
            <path
              d="M 185,240 Q 150,210 130,220 Q 155,225 183,248"
              fill={`url(#trunkGrad-${species})`}
            />
            <path
              d="M 215,240 Q 250,210 270,220 Q 245,225 217,248"
              fill={`url(#trunkGrad-${species})`}
            />
            <path
              d="M 190,195 Q 160,170 145,160 Q 165,180 192,198"
              fill={`url(#trunkGrad-${species})`}
            />
            <path
              d="M 210,195 Q 240,170 255,160 Q 235,180 208,198"
              fill={`url(#trunkGrad-${species})`}
            />
          </motion.g>
        )}

        {/* 3. SPECIES FOLIAGE CANOPY */}
        {stage !== 'seed' && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: canopyScale,
              opacity: isWithered ? 0.6 : 1,
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ transformOrigin: '200px 180px' }}
          >
            {/* PINE CANOPY (Tiered Triangles) */}
            {species === 'pine' && (
              <g>
                {/* Bottom Tier */}
                <polygon
                  points="200,190 120,270 280,270"
                  fill={`url(#canopyGrad-${species})`}
                />
                {/* Mid Tier */}
                <polygon
                  points="200,140 140,215 260,215"
                  fill={`url(#canopyGrad-${species})`}
                />
                {/* Top Tier */}
                <polygon
                  points="200,90 160,160 240,160"
                  fill={isWithered ? '#57534e' : speciesTheme.foliage3}
                />
              </g>
            )}

            {/* BONSAI CANOPY (Zen Cloud Pads) */}
            {species === 'bonsai' && (
              <g>
                {/* Left Cloud Pad */}
                <ellipse cx="140" cy="205" rx="45" ry="24" fill={`url(#canopyGrad-${species})`} />
                <ellipse cx="140" cy="200" rx="35" ry="18" fill={speciesTheme.foliage3} opacity="0.4" />

                {/* Right Cloud Pad */}
                <ellipse cx="260" cy="210" rx="42" ry="22" fill={`url(#canopyGrad-${species})`} />
                <ellipse cx="260" cy="206" rx="32" ry="16" fill={speciesTheme.foliage3} opacity="0.4" />

                {/* Top Crown Cloud Pad */}
                <ellipse cx="200" cy="140" rx="55" ry="28" fill={`url(#canopyGrad-${species})`} />
                <ellipse cx="200" cy="134" rx="42" ry="20" fill={speciesTheme.foliage3} opacity="0.6" />
              </g>
            )}

            {/* SAKURA / OAK / WILLOW CANOPY (Lush Organic Cloud Clusters) */}
            {species !== 'pine' && species !== 'bonsai' && (
              <g>
                {/* Background Shadow Canopy */}
                <circle cx="200" cy="165" r="75" fill={`url(#canopyGrad-${species})`} opacity="0.95" />
                <circle cx="150" cy="180" r="55" fill={`url(#canopyGrad-${species})`} />
                <circle cx="250" cy="180" r="55" fill={`url(#canopyGrad-${species})`} />
                <circle cx="170" cy="120" r="50" fill={`url(#canopyGrad-${species})`} />
                <circle cx="230" cy="120" r="50" fill={`url(#canopyGrad-${species})`} />
                <circle cx="200" cy="105" r="45" fill={isWithered ? '#57534e' : speciesTheme.foliage3} />

                {/* Weeping Willow Drooping Fronds */}
                {species === 'willow' && !isWithered && (
                  <g stroke={speciesTheme.foliage2} strokeWidth="3" strokeLinecap="round">
                    <path d="M 140,190 Q 120,240 130,280" />
                    <path d="M 160,200 Q 150,255 155,290" />
                    <path d="M 240,200 Q 250,255 245,290" />
                    <path d="M 260,190 Q 280,240 270,280" />
                  </g>
                )}

                {/* Shimmer Highlight Crests */}
                {!isWithered && (
                  <>
                    <circle cx="185" cy="95" r="22" fill="#ffffff" opacity="0.18" />
                    <circle cx="140" cy="155" r="18" fill="#ffffff" opacity="0.15" />
                    <circle cx="255" cy="155" r="18" fill="#ffffff" opacity="0.15" />
                  </>
                )}
              </g>
            )}
          </motion.g>
        )}

        {/* 4. MATURE COMPLETION CELESTIAL CROWN */}
        {isMature && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <circle cx="200" cy="150" r="110" fill={`url(#glowGrad-${species})`} />
            <motion.circle
              cx="200"
              cy="70"
              r="8"
              fill="#fbbf24"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.g>
        )}
      </svg>

      {/* Growth Stage Badge */}
      <div className="absolute bottom-2 flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1 text-[11px] font-medium backdrop-blur-md shadow-xs">
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{
            backgroundColor: isWithered ? '#78716c' : isMature ? '#fbbf24' : accentColor,
          }}
        />
        <span className="text-muted">
          {isWithered
            ? 'Withered · Focus Interrupted'
            : isMature
            ? `Mature ${speciesTheme.name} Planted 🎉`
            : `${speciesTheme.name} · ${Math.round(progress * 100)}% Growth`}
        </span>
      </div>
    </div>
  );
}
