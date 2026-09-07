'use client';

import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import {
  EXIT,
  LETTER_EASE,
  MOTION_REDUCE_SAFE,
  REVEAL_VIEWPORT,
} from '@/components/letter/motion-tokens';
import { cn } from '@/lib/utils';

/**
 * The letter's one authored, section-specific entrance.
 *
 * This file used to also hold `InkStroke` and `InkFade` — a gradient mask that
 * swept across a section headline and a quiet fade for its kicker. Section
 * openings are now written out a character at a time instead (see
 * `TypedLines` in components/letter/typed-text.tsx), which is the repeated
 * entrance that holds the sections together as one letter, so both were
 * removed rather than left here to drift.
 *
 * What remains is the exception: a reveal for a single painted plate. The
 * section BODIES below each heading deliberately do NOT share an entrance;
 * each one moves like the thing it is.
 */

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
 * `blur(0px)` and needs no explicit clearing.
 *
 * Under `prefers-reduced-motion` the initial style is struck by CSS, not by the
 * JS branch below — see MOTION_REDUCE_SAFE for why the hook cannot be trusted
 * with that on its own.
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
      // The plate un-develops when it leaves, the same as every other block on
      // the page — but on the fast exit curve, so the blur is only on screen
      // for a quarter second on the way out.
      initial={{
        opacity: 0,
        scale: 1.03,
        filter: 'blur(6px)',
        transition: EXIT,
      }}
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
