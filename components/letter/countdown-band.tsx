'use client';

import { motion, useReducedMotion } from 'motion/react';
import { AddToCalendar } from '@/components/letter/add-to-calendar';
import { Countdown } from '@/components/countdown';
import {
  EXIT,
  LETTER_EASE,
  REVEAL_VIEWPORT,
} from '@/components/letter/motion-tokens';
import { WeekStrip } from '@/components/letter/week-strip';
import { WEDDING_DAY_LABEL } from '@/lib/wedding';
import { cn } from '@/lib/utils';

/**
 * Date strip, live countdown, and calendar action. It can be composed directly
 * into the welcome message or wrapped by `CountdownBand` when it needs its own
 * section.
 */
export function CountdownDetails({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="flex flex-col items-center text-ink">
        <p className="font-sans text-subhead uppercase leading-none tracking-[0.16em]">
          {WEDDING_DAY_LABEL}
        </p>
        <WeekStrip className="mt-5" />
      </div>

      <h2 className="mt-8 font-sans text-body text-ink">
        counting down to the day
      </h2>

      <Countdown
        align="center"
        size="lg"
        className="mt-5 text-ink"
        srSuffix="until the wedding day"
        label={null}
        tickClassName="text-ink"
      />

      <AddToCalendar className="mt-12" variant="outline" />
    </div>
  );
}

/** A standalone wrapper retained for reuse outside the welcome message. */
export function CountdownBand() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative z-10 bg-paper px-gutter pt-28 pb-section text-center sm:pt-32">
      <motion.div
        className="flex flex-col items-center"
        // Symmetric, like the rest of the letter's blocks: the exit transition
        // rides on `initial`, since leaving the viewport animates back to it.
        initial={
          reduceMotion ? false : { opacity: 0, y: 20, transition: EXIT }
        }
        whileInView={{ opacity: 1, y: 0 }}
        viewport={REVEAL_VIEWPORT}
        transition={{ duration: 0.9, ease: LETTER_EASE }}
      >
        <CountdownDetails />
      </motion.div>
    </section>
  );
}
