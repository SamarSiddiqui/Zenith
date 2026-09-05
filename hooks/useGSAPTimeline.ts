import { useEffect, useRef } from 'react';

type TimelineFactory = (gsap: typeof import('gsap').gsap) => gsap.core.Timeline;

/**
 * Creates a GSAP timeline that runs on mount and cleans up on unmount.
 * Respects prefers-reduced-motion — returns early without animating.
 *
 * Usage:
 *   const ref = useGSAPTimeline((gsap) => {
 *     const tl = gsap.timeline();
 *     tl.from(ref.current, { opacity: 0, y: 12, duration: 0.4 });
 *     return tl;
 *   });
 */
export function useGSAPTimeline(factory: TimelineFactory, deps: unknown[] = []) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    (async () => {
      const { gsap } = await import('gsap');
      ctxRef.current = gsap.context(() => {
        factory(gsap);
      });
    })();

    return () => {
      ctxRef.current?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
