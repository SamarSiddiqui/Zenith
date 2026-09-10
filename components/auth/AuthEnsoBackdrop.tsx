"use client";

import React, { useEffect, useRef } from 'react';

/**
 * Ambient Enso motif for Authentication screens.
 * Features slow rotating hairline rings and subtle organic pulsing.
 */
export function AuthEnsoBackdrop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRingRef = useRef<SVGSVGElement>(null);
  const innerRingRef = useRef<SVGSVGElement>(null);
  const pulseCircleRef = useRef<SVGCircleElement>(null);

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
        if (outerRingRef.current) {
          gsap.to(outerRingRef.current, {
            rotate: 360,
            duration: 160,
            ease: 'none',
            repeat: -1,
            transformOrigin: 'center center'
          });
        }

        if (innerRingRef.current) {
          gsap.to(innerRingRef.current, {
            rotate: -360,
            duration: 110,
            ease: 'none',
            repeat: -1,
            transformOrigin: 'center center'
          });
        }

        if (pulseCircleRef.current) {
          gsap.to(pulseCircleRef.current, {
            strokeOpacity: 0.45,
            duration: 3.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.easeInOut'
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
      {/* Centered ambient Enso wheel */}
      <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 opacity-40 lg:left-[45%]">
        <svg ref={outerRingRef} viewBox="0 0 400 400" className="h-full w-full">
          <circle cx="200" cy="200" r="196" fill="none" stroke="var(--color-line)" strokeWidth="1" />
          <circle
            ref={pulseCircleRef}
            cx="200"
            cy="200"
            r="152"
            fill="none"
            stroke="var(--color-sage)"
            strokeOpacity="0.2"
            strokeWidth="1.5"
            strokeDasharray="3 10"
          />
          <circle cx="200" cy="200" r="112" fill="none" stroke="var(--color-line)" strokeWidth="1" />
        </svg>
      </div>

      {/* Ambient glow patches */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-sage-wash/50 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-clay-wash/40 blur-3xl" />
    </div>
  );
}
