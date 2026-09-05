import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

interface ScrollTriggerOptions {
  /** Trigger element — defaults to the returned ref */
  trigger?: RefObject<Element | null>;
  /** e.g. "top 80%" */
  start?: string;
  /** e.g. "bottom 20%" */
  end?: string;
  /** Link animation progress to scroll position (true = boolean snap, number = lag) */
  scrub?: boolean | number;
  /** Whether to reverse animation when scrolling back up */
  toggleActions?: string;
  /** Fire once only */
  once?: boolean;
  /** Markers in dev (never ship true) */
  markers?: boolean;
}

/**
 * Returns a ref to attach to the element you want to trigger animations on.
 * Pass a callback that receives (gsap, trigger element) and returns a GSAP tween/timeline.
 *
 * Automatically:
 *  - Registers ScrollTrigger plugin
 *  - Kills the trigger on unmount
 *  - Respects prefers-reduced-motion
 */
export function useGSAPScrollTrigger<T extends Element = HTMLDivElement>(
  callback: (gsap: typeof import('gsap').gsap, el: T) => gsap.core.Tween | gsap.core.Timeline | void,
  options: ScrollTriggerOptions = {},
  deps: unknown[] = []
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Bail out for reduced motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ctx: gsap.Context | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const tween = callback(gsap, el as T);

        if (tween) {
          ScrollTrigger.create({
            trigger: (options.trigger?.current ?? el) as Element,
            start: options.start ?? 'top 82%',
            end: options.end ?? 'bottom 20%',
            scrub: options.scrub,
            toggleActions: options.toggleActions ?? 'play none none none',
            once: options.once ?? true,
            markers: options.markers ?? false,
            animation: tween instanceof gsap.core.Timeline ? tween : undefined,
          });
        }
      });
    })();

    return () => {
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref as RefObject<T | null>;
}
