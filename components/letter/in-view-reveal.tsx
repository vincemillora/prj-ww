'use client';

import { motion, useReducedMotion } from 'motion/react';

import {
  ENTER_S,
  LETTER_EASE,
  MOTION_REDUCE_SAFE,
  REVEAL_VIEWPORT,
} from '@/components/letter/motion-tokens';
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
   * Seconds to wait before starting. For a genuine group only — the two hotel
   * cards, the pair of gift codes — where the items arrive as a set. Cap the
   * total lead-in; see BEAT in motion-tokens.
   */
  delay?: number;
};

const reveal = { opacity: 1, y: 0 };

/**
 * The letter's plain block entrance: a short rise into place, once, when the
 * block is 40% on screen.
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
}: InViewRevealProps) {
  const reduceMotion = useReducedMotion();
  const animation = {
    // MOTION_REDUCE_SAFE is the guarantee, not the hook — see its note.
    className: cn(MOTION_REDUCE_SAFE, className),
    initial: reduceMotion ? (false as const) : { opacity: 0, y: distance },
    whileInView: reveal,
    viewport: REVEAL_VIEWPORT,
    transition: { duration, ease, delay },
  };

  if (as === 'li') {
    return <motion.li {...animation}>{children}</motion.li>;
  }

  return <motion.div {...animation}>{children}</motion.div>;
}
