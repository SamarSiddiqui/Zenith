"use client";

import React, { useEffect, useRef } from 'react';

const HABIT_TAGS = [
  { label: 'Morning Flow 🌿', angle: 0 },
  { label: 'Deep Work ⚡', angle: 72 },
  { label: 'Meditation 🧘', angle: 144 },
  { label: 'Journaling ✍️', angle: 216 },
  { label: 'Rest & Recovery 🌙', angle: 288 }
];

/**
 * Ambient hairline rings & orbiting habit nodes behind the hero.
 * Powered by GSAP continuous timelines and subtle floating motion.
 */
export function EnsoBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRingRef = useRef<SVGSVGElement>(null);
  const innerRingRef = useRef<SVGSVGElement>(null);
  const pulseRingRef = useRef<SVGCircleElement>(null);
  const orbitGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: gsap.Context;
    let isCancelled = false;

    async function initGSAP() {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || isCancelled) return;

      const gsapModule = await import('gsap');
      const gsap = gsapModule.default || gsapModule;

      if (isCancelled || !containerRef.current) return;

      ctx = gsap.context(() => {
        // Continuous slow rotation for outer ring
        if (outerRingRef.current) {
          gsap.to(outerRingRef.current, {
            rotate: 360,
            duration: 180,
            ease: 'none',
            repeat: -1,
            transformOrigin: 'center center'
          });
        }

        // Counter rotation for inner ring
        if (innerRingRef.current) {
          gsap.to(innerRingRef.current, {
            rotate: -360,
            duration: 120,
            ease: 'none',
            repeat: -1,
            transformOrigin: 'center center'
          });
        }

        // Pulse dashed ring opacity
        if (pulseRingRef.current) {
          gsap.to(pulseRingRef.current, {
            strokeOpacity: 0.6,
            duration: 3.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.easeInOut'
          });
        }

        // Orbiting habit tags stagger entrance & floating bounce
        if (orbitGroupRef.current) {
          const tags = orbitGroupRef.current.querySelectorAll('.orbit-tag');
          gsap.fromTo(
            tags,
            { opacity: 0, scale: 0.8 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.8,
              stagger: 0.15,
              ease: 'back.out(1.7)',
              delay: 0.3
            }
          );

          // Subtle floating float on each tag
          tags.forEach((tag, idx) => {
            gsap.to(tag, {
              y: idx % 2 === 0 ? -6 : 6,
              duration: 3 + idx * 0.4,
              repeat: -1,
              yoyo: true,
              ease: 'sine.easeInOut'
            });
          });
        }
      }, containerRef);
    }

    initGSAP();

    return () => {
      isCancelled = true;
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Top right main Enso wheel */}
      <div className="absolute -right-40 -top-32 h-[680px] w-[680px] opacity-70 lg:-right-20">
        <svg ref={outerRingRef} viewBox="0 0 400 400" className="h-full w-full">
          <circle cx="200" cy="200" r="196" fill="none" stroke="var(--color-line)" strokeWidth="1" />
          <circle
            ref={pulseRingRef}
            cx="200"
            cy="200"
            r="152"
            fill="none"
            stroke="var(--color-sage)"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeDasharray="3 9"
          />
          <circle cx="200" cy="200" r="112" fill="none" stroke="var(--color-line)" strokeWidth="1" />
        </svg>

        {/* Orbiting Habit Tags */}
        <div ref={orbitGroupRef} className="absolute inset-0 flex items-center justify-center">
          {HABIT_TAGS.map((tag) => {
            const rad = (tag.angle * Math.PI) / 180;
            const radius = 152; // matches middle dashed ring radius in SVG space
            // Offset from center in % space roughly
            const x = Math.cos(rad) * (radius * 0.72);
            const y = Math.sin(rad) * (radius * 0.72);

            return (
              <div
                key={tag.label}
                className="orbit-tag absolute rounded-full border border-sage/30 bg-surface/90 px-3 py-1 text-[11px] font-medium text-sage-deep shadow-xs backdrop-blur-xs"
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
              >
                {tag.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom left subtle ring motif */}
      <div className="absolute -left-32 bottom-0 h-[420px] w-[420px] opacity-50">
        <svg ref={innerRingRef} viewBox="0 0 400 400" className="h-full w-full">
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            stroke="var(--color-line)"
            strokeWidth="1"
            strokeDasharray="3 14"
          />
          <circle cx="200" cy="200" r="130" fill="none" stroke="var(--color-sage)" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
      </div>
    </div>
  );
}

