/**
 * Media queries read as a SUBSCRIPTION, for motion that has to decide something
 * before it can animate.
 *
 * `useSyncExternalStore`, not `useState` in an effect: state seeded in an effect
 * is a second render pass that lint rightly rejects, and — for anything whose
 * resting state comes from motion — a frame of the wrong answer is a frame of
 * invisible content. Every caller must pass an explicit `serverSnapshot`,
 * because the safe assumption differs per query: for reduced motion it is
 * `true` (show the finished thing), for a breakpoint it is `false`
 * (mobile-first). React hydrates against that value and re-renders once if the
 * browser disagrees.
 */
import { useCallback, useSyncExternalStore } from 'react';

/** Tailwind's default `md`, for JS that has to agree with a `md:` class. */
export const MD_QUERY = '(min-width: 48rem)';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function useMediaQuery(query: string, serverSnapshot: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      // Optional calls throughout: a host with no matchMedia (a test renderer,
      // a thumbnailer) must fall back to the caller's safe answer rather than
      // throw during render.
      const mql = window.matchMedia?.(query);
      mql?.addEventListener('change', onChange);
      return () => mql?.removeEventListener('change', onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(query).matches ?? serverSnapshot,
    () => serverSnapshot,
  );
}

/**
 * Whether the guest prefers reduced motion, answered `true` until a browser
 * says otherwise.
 *
 * Use this instead of motion's `useReducedMotion()` wherever the preference
 * decides what CONTENT is rendered rather than merely how it moves. That hook
 * is a one-shot `useState` seeded from module state that is still `null` during
 * the render that matters, so it reports FALSE even when the preference is on —
 * and for typed text that failure mode is a permanently blank heading, not an
 * unanimated one. For a resting state produced by transform or opacity, the
 * CSS floor (`MOTION_REDUCE_SAFE`) remains the guarantee.
 */
export function usePrefersReducedMotion() {
  return useMediaQuery(REDUCED_MOTION_QUERY, true);
}

/** Whether the viewport is at Tailwind's `md` or wider. Mobile-first on the server. */
export function useMinWidthMd() {
  return useMediaQuery(MD_QUERY, false);
}
