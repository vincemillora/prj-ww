'use client';

import { motion, useReducedMotion } from 'motion/react';
import { CountdownLocket } from '@/components/letter/countdown-locket';
import { CountdownDetails } from '@/components/letter/countdown-band';
import { COUPLE } from '@/lib/wedding';

/** The keepsake welcome section that opens the letter before Our Story. */
export function WelcomeBand() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative z-10 bg-paper px-gutter pt-28 pb-section text-center sm:pt-32">
      <motion.div
        className="flex flex-col items-center"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <CountdownLocket />

        <div className="max-w-[36rem] text-center text-ink">
          <p className="font-sans text-body leading-relaxed">
            As we prepare to celebrate our wedding day, it would mean so much
            to have you there with us. This letter has everything you&apos;ll need
            to join us — the schedule, the setting, how to RSVP, and a few
            thoughtful extras along the way.
          </p>
          <p className="mt-5 font-sans text-body leading-relaxed">
            The date below marks the day our next chapter begins. With the
            date set, we&apos;re counting down to a celebration filled with warmth,
            laughter, and the people we love — and we can&apos;t wait to share it
            with you.
          </p>
          <CountdownDetails className="mt-heading" />
          <p className="mt-heading font-script text-entry leading-none">
            with love
          </p>
          <p className="mt-2 font-script text-title leading-none">
            {COUPLE}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
