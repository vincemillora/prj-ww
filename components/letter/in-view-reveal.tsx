'use client';

import { motion, useReducedMotion } from 'motion/react';

type RevealEase = 'easeOut' | [number, number, number, number];

type InViewRevealProps = {
  as?: 'div' | 'li';
  children: React.ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  ease?: RevealEase;
};

const reveal = { opacity: 1, y: 0 };
const viewport = { once: true, amount: 0.4 };

/** A small hydration leaf for the letter's repeated entrance animation. */
export function InViewReveal({
  as = 'div',
  children,
  className,
  distance = 20,
  duration = 0.9,
  ease = [0.16, 1, 0.3, 1],
}: InViewRevealProps) {
  const reduceMotion = useReducedMotion();
  const animation = {
    className,
    initial: reduceMotion ? (false as const) : { opacity: 0, y: distance },
    whileInView: reveal,
    viewport,
    transition: { duration, ease },
  };

  if (as === 'li') {
    return <motion.li {...animation}>{children}</motion.li>;
  }

  return <motion.div {...animation}>{children}</motion.div>;
}
