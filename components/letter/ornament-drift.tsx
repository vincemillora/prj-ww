'use client';

import { useRef, type ReactNode } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

import { MOTION_REDUCE_SAFE } from '@/components/letter/motion-tokens';
import { cn } from '@/lib/utils';

/**
 * Enter AND exit for the letter's ornaments — the charms, the getaway car, the
 * peony border. The piece drifts up into full ink as it comes on screen, holds
 * for as long as it is actually being looked at, and lets go again as it leaves.
 *
 * Scroll-linked rather than a `whileInView` toggle, deliberately. A toggle has
 * to pick a threshold and then snaps at it, which is plainly visible on a page
 * this long; a ramp is tied to where the ornament actually sits, so scrolling
 * back up rewinds the drift instead of replaying it.
 *
 * TWO ramps, anchored to the VIEWPORT EDGES rather than to fractions of the
 * element's passage, and this is the part that matters. A single ramp over
 * `start end -> end start` has to spend its fade on some percentage of the
 * passage, and the passage is one viewport PLUS the ornament's own height — so
 * the taller the ornament, the earlier it starts fading. The peony border is
 * ~380px tall, and on that ramp it was down to 50% opacity while still sitting
 * comfortably in the middle of the screen. Anchoring instead to "top entering
 * the lower quarter" and "bottom leaving the upper quarter" makes the hold band
 * the whole time the ornament is genuinely on screen, at any height.
 *
 * ORNAMENTS ONLY. Text, cards, the reply form, and the lace section seams hold
 * still on the way out — a guest scrolling back to check a time or an address
 * must never watch it dissolve, and the lace bands are the ink section's real
 * edges rather than decoration on it. The Our Story vines and their florals are
 * excluded by request.
 */
export function OrnamentDrift({
  children,
  className,
  distance = 20,
}: {
  children: ReactNode;
  className?: string;
  /** Travel at each end, in px. Larger ornaments want less, not more. */
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();

  // Arriving: the ornament's top climbing from the viewport's bottom edge to
  // three quarters down the screen.
  const { scrollYProgress: arriving } = useScroll({
    target: ref,
    offset: ['start end', 'start 75%'],
  });
  // Leaving: its bottom climbing from a quarter down the screen to the top edge.
  const { scrollYProgress: leaving } = useScroll({
    target: ref,
    offset: ['end 25%', 'end start'],
  });

  const opacity = useTransform(() => arriving.get() * (1 - leaving.get()));
  const y = useTransform(
    () => distance * (1 - arriving.get()) - distance * leaving.get(),
  );

  return (
    <motion.div
      ref={ref}
      // MOTION_REDUCE_SAFE is the guarantee, not the hook — see its note.
      className={cn(MOTION_REDUCE_SAFE, className)}
      style={reduce ? undefined : { opacity, y }}
    >
      {children}
    </motion.div>
  );
}
