/**
 * The letter's motion vocabulary, in one file so nine sections cannot drift
 * apart.
 *
 * Only page rhythm lives here — entrances, exits, and the beat between
 * siblings. The interactive springs (the Location deck, the lightbox morph, the
 * RSVP envelope's scroll ramp) stay with the components that own them, because
 * their feel is part of that interaction rather than of the document.
 *
 * `LETTER_EASE` is an exponential ease-out: quick off the mark, long settle.
 * A letter arrives; it does not bounce. Nothing here uses an elastic curve.
 */
export const LETTER_EASE = [0.16, 1, 0.3, 1] as const;

/** Entrance length for a block of content. */
export const ENTER_S = 0.62;

/**
 * Exits run at under half an entrance. Arriving is worth watching; leaving is
 * not, and a slow exit reads as latency.
 */
export const EXIT_S = 0.26;

/** The heading stroke — the one deliberately authored beat in the letter. */
export const STROKE_S = 0.72;

export const ENTER = { duration: ENTER_S, ease: LETTER_EASE } as const;
export const EXIT = { duration: EXIT_S, ease: 'easeOut' } as const;
export const STROKE = { duration: STROKE_S, ease: LETTER_EASE } as const;

/**
 * One beat of a cascade. Four beats is the cap — 3 x 0.09s of lead-in — because
 * beyond that the last item in a group is waiting on the first for long enough
 * to feel like a queue.
 */
export const BEAT = 0.09;

/**
 * When a reveal fires. 0.4 of the block has to be on screen, and it fires once:
 * this page is reread over months, so nothing that carries words replays.
 * `OrnamentDrift` is the deliberate exception, and it is scroll-linked rather
 * than a toggle.
 */
export const REVEAL_VIEWPORT = { once: true, amount: 0.4 } as const;

/**
 * A softer trigger for tall blocks. A section-sized element rarely reaches 40%
 * on a phone before its top has already scrolled well past the fold.
 */
export const TALL_VIEWPORT = { once: true, amount: 0.2 } as const;

/**
 * The reduced-motion floor, and it HAS to be CSS. Put this on anything whose
 * resting state is produced by motion — every wrapper in this letter that starts
 * hidden, offset, masked, or blurred.
 *
 * Why not `useReducedMotion()` alone: that hook is a one-shot `useState` seeded
 * from motion's module-level `prefersReducedMotion.current`, and on the server
 * `initPrefersReducedMotion()` sets its “already listening” flag and returns
 * before reading the media query. The value that reaches the render that matters
 * is therefore `null`, so the hook reports FALSE even when the guest has the
 * preference on. Motion itself sees the preference and declines to animate — so
 * the two together produce the worst possible outcome: `initial` gets applied,
 * nothing ever animates it away, and the guest is left looking at invisible
 * headings, kickers, ornaments and illustrations.
 *
 * Verified by emulating `prefers-reduced-motion: reduce`: every reveal on the
 * page sat at its server-rendered initial state. The JS checks are kept as the
 * fast path, but the guarantee lives here, in the stylesheet, where a media
 * query cannot be wrong about a media query. `!` (Tailwind v4's important
 * modifier) is required — motion writes these as inline styles.
 */
export const MOTION_REDUCE_SAFE =
  'motion-reduce:opacity-100! motion-reduce:transform-none! motion-reduce:filter-none! motion-reduce:[mask-image:none]! motion-reduce:[-webkit-mask-image:none]!';

/**
 * The same floor for a group that animates its HEIGHT open — the RSVP form's
 * collapsing sections. Here the stakes are higher than a hidden ornament: a
 * group stuck at `height: 0` means a guest with reduced motion on cannot answer
 * at all, so the open state has to be reachable without JS agreeing to run.
 */
export const MOTION_REDUCE_OPEN = `${MOTION_REDUCE_SAFE} motion-reduce:h-auto!`;
