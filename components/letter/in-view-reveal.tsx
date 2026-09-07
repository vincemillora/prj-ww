'use client';

import { motion, useReducedMotion } from 'motion/react';

import {
  ENTER_S,
  EXIT,
  LETTER_EASE,
  MOTION_REDUCE_SAFE,
  REVEAL_VIEWPORT,
  TALL_VIEWPORT,
} from '@/components/letter/motion-tokens';
import { useMinWidthMd } from '@/components/letter/use-media-query';
import { cn } from '@/lib/utils';

type RevealEase = 'easeOut' | readonly [number, number, number, number];

type InViewRevealProps = {
  as?: 'div' | 'li';
  children: React.ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  ease?: RevealEase;
  /**
   * Fire at 20% on screen instead of 40%, for a block tall enough that 40%
   * arrives well after its top has passed the fold — Our Story's memories.
   */
  tall?: boolean;
  /**
   * Seconds to wait before starting. For a genuine group only — the two hotel
   * cards, the pair of gift codes — where the items arrive as a set. Cap the
   * total lead-in; see BEAT in motion-tokens.
   */
  delay?: number;
  /**
   * Come in sideways instead of rising, for a block that sits to one side of a
   * spine — Our Story's memories either side of the vine, Day itself's events
   * either side of the centre rail. The block also LEAVES to its own side.
   */
  slideFrom?: 'left' | 'right';
  /**
   * Which widths the sideways entrance applies at. Read only with `slideFrom`.
   *
   * `'always'` for a layout that alternates at every width (Our Story: the
   * memories keep their sides on a phone). `'md'` for a spine that only exists
   * on a wide screen (Day itself: the rail moves to the LEFT EDGE on a phone
   * and every row sits to the right of it, so a left-hand row would slide in
   * from a side it does not occupy — and 40px of a 360px screen is a real
   * chunk of the measure). Under `md` such a block keeps the vertical rise.
   */
  slideAt?: 'always' | 'md';
  /** Sideways travel, in px. Only read when `slideFrom` is set. */
  distanceX?: number;
};

const reveal = { opacity: 1, x: 0, y: 0 };

/**
 * The letter's plain block entrance and exit: a short rise into place when the
 * block is 40% on screen, and a shorter settle back out when it leaves.
 *
 * This is the SUPPORTING voice, not the authored one. Use it where a section's
 * body is genuinely a list or a run of blocks. Where a body has a material of
 * its own — a plate that develops, a deck that fans — that section animates
 * like the thing it is instead. Nine identical body entrances under nine
 * identical headings would flatten the letter into a template.
 */
export function InViewReveal({
  as = 'div',
  children,
  className,
  distance = 20,
  duration = ENTER_S,
  ease = LETTER_EASE,
  delay = 0,
  tall = false,
  slideFrom,
  slideAt = 'always',
  distanceX = 40,
}: InViewRevealProps) {
  const reduceMotion = useReducedMotion();
  const wide = useMinWidthMd();
  // Sideways OR up, never both: two axes on one block is movement twice, and
  // the diagonal drift that produces reads as a slide gone wrong.
  const sideways = slideFrom != null && (slideAt === 'always' || wide);
  const offset = sideways
    ? { x: slideFrom === 'left' ? -distanceX : distanceX }
    : { y: distance };

  const animation = {
    // MOTION_REDUCE_SAFE is the guarantee, not the hook — see its note.
    className: cn(MOTION_REDUCE_SAFE, className),
    // The exit transition rides on `initial`, because leaving the viewport is
    // an animation BACK to it. Without this the way out would inherit the
    // entrance's duration, and a slow exit reads as latency (see EXIT). A
    // sideways block therefore also LEAVES to its own side.
    initial: reduceMotion
      ? (false as const)
      : { opacity: 0, ...offset, transition: EXIT },
    whileInView: reveal,
    viewport: tall ? TALL_VIEWPORT : REVEAL_VIEWPORT,
    transition: { duration, ease, delay },
  };

  // REMOUNT when the axis changes, and this is load-bearing rather than
  // defensive. motion applies `initial` once, at mount; the media store below
  // cannot know the viewport until the client's first commit, so a desktop row
  // mounts holding the mobile rise and a later prop change does NOT move it.
  // Measured before this key existed: every Day itself row rose 24px on its
  // first entrance and only started sliding on the second pass. The key flips
  // once, right after hydration and long before any row is in view, and it
  // never changes at all for the reveals that pass no `slideFrom`.
  const axisKey = sideways ? 'x' : 'y';

  if (as === 'li') {
    return (
      <motion.li key={axisKey} {...animation}>
        {children}
      </motion.li>
    );
  }

  return (
    <motion.div key={axisKey} {...animation}>
      {children}
    </motion.div>
  );
}

