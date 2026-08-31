'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';

import {
  ENTER,
  LETTER_EASE,
  MOTION_REDUCE_SAFE,
  REVEAL_VIEWPORT,
  STROKE_S,
} from '@/components/letter/motion-tokens';
import { cn } from '@/lib/utils';

/**
 * The letter's signature entrance: ink laid down left to right.
 *
 * A soft-edged gradient mask sweeps across the line at a slight rise, so the
 * words appear the way they were written rather than fading up out of nowhere.
 * This is the one entrance the letter repeats on purpose — every section opens
 * in the same hand, and that is what makes nine sections read as one letter
 * instead of nine panels. The section BODIES below each heading deliberately do
 * NOT share an entrance; each one moves like the thing it is.
 *
 * Three safeguards, all of them load-bearing:
 *   - The mask is cleared the instant the sweep finishes, so a heading that
 *     later reflows (a font swap, a resize, a long title wrapping) can never be
 *     clipped by a stale gradient. It has to be an explicit `none`, not a
 *     dropped style object: the gradient is a MotionValue, so motion writes it
 *     to the node imperatively and React does not know it is there to remove.
 *   - Server-rendered HTML carries no mask, so a guest with JS disabled or
 *     still loading reads plain text.
 *   - Under `prefers-reduced-motion` the mask is struck by CSS, not by the JS
 *     branch below — see MOTION_REDUCE_SAFE for why the hook cannot be trusted
 *     with that on its own.
 *
 * `inline-block` gives the span the box the mask needs. Inside the centred
 * heading it still centres, and long titles still wrap inside it.
 */
export function InkStroke({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = !!useReducedMotion();
  const inView = useInView(ref, REVEAL_VIEWPORT);
  const [done, setDone] = useState(false);

  // 0 -> 1 drives both gradient stops, so the soft edge keeps its width for the
  // whole crossing instead of stretching.
  const sweep = useMotionValue(0);
  const solid = useTransform(sweep, [0, 1], ['-16%', '112%']);
  const fade = useTransform(sweep, [0, 1], ['2%', '132%']);
  // 100deg, not 90: the stroke lifts very slightly as it crosses, which is how
  // a hand moves across a line.
  const mask =
    useMotionTemplate`linear-gradient(100deg, rgb(0 0 0) ${solid}, rgb(0 0 0 / 0) ${fade})`;

  useEffect(() => {
    if (reduce || done || !inView) return;
    const controls = animate(sweep, 1, {
      duration: STROKE_S,
      ease: LETTER_EASE,
      onComplete: () => setDone(true),
    });
    return () => controls.stop();
  }, [done, inView, reduce, sweep]);

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={cn('inline-block', MOTION_REDUCE_SAFE, className)}
      // Once the sweep is done the mask goes away entirely rather than resting
      // at its final value — see the note above on why this is an explicit
      // `none` rather than an absent style.
      style={
        done
          ? { maskImage: 'none', WebkitMaskImage: 'none', willChange: 'auto' }
          : { maskImage: mask, WebkitMaskImage: mask, willChange: 'mask-image' }
      }
    >
      {children}
    </motion.span>
  );
}

/**
 * The quiet half of the heading pair, and anything else that should arrive a
 * beat behind an `InkStroke`. A short fade and rise — the kicker is a label, and
 * a second stroke beside the first would read as competition.
 */
export function InkFade({
  children,
  className,
  delay = 0,
  distance = 6,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}) {
  const reduce = !!useReducedMotion();

  if (reduce) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      className={cn('inline-block', MOTION_REDUCE_SAFE, className)}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ ...ENTER, delay }}
    >
      {children}
    </motion.span>
  );
}

/**
 * For a painted plate — currently the attire illustration, the one section whose
 * body is a single picture. It DEVELOPS: out of focus and a hair oversized, then
 * settling sharp, the way a print comes up. A fade-and-rise would have treated
 * the letter's only piece of painted artwork as another content block.
 *
 * The blur is the expensive part, so it is bounded on every axis: one element,
 * 6px, once, and `will-change` dropped on completion so nothing keeps a
 * composited layer alive for the rest of the session. The filter itself is a
 * plain animated property rather than a MotionValue, so it settles at
 * `blur(0px)` and needs no explicit clearing the way `InkStroke`'s mask does.
 */
export function PlateReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const [done, setDone] = useState(false);

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(MOTION_REDUCE_SAFE, className)}
      initial={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.85, ease: LETTER_EASE }}
      onAnimationComplete={() => setDone(true)}
      style={done ? undefined : { willChange: 'filter, transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}
