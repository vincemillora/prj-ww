'use client';

import { motion, useReducedMotion } from 'motion/react';
import { AddToCalendar } from '@/components/letter/add-to-calendar';
import { CountdownLocket } from '@/components/letter/countdown-locket';
import { Countdown } from '@/components/countdown';

/**
 * Countdown band — a PAPER interruption between the Hero and Our Story. It sits
 * inside the opening backdrop (Hero → Countdown → Our Story) but paints its own
 * `bg-paper` over the pinned lily photo, so the shared ink field is hidden for
 * exactly this section's height and resumes underneath Our Story. Type is
 * therefore INK on paper — the letter's default direction, not Our Story's
 * inversion.
 *
 * Neither the old white dome nor the reversed black arch that replaced it
 * survives: both existed to disguise a hard colour change in the middle of the
 * countdown, and the shared ink field removes the colour change itself. The top
 * is a plain flush seam at the Hero's bottom edge, where the pin releases, and
 * `pt-28 sm:pt-32` seats the first line clear of it.
 *
 * Bottom: a plain `pb-section`. It used to be `pb-dome`, reserving 12rem for Our
 * Story's dome to rise into; Our Story has no dome and no overlap now, so the
 * band just leaves one section of space like any other.
 *
 * The section speaks one sentence, and the number is a word in it: the day
 * count is the display element and the script line finishes the thought. There
 * is deliberately no separate "Counting down to the day" heading above it — a
 * title plus a number plus a label was three things saying one thing, which is
 * what made the block read as a stat readout rather than a letter.
 *
 * The open locket starts the band as a keepsake before the count completes the
 * thought. It is decorative, keeping the countdown itself as the band’s
 * readable focal point.
 *
 * Colour is the letter's two-colour system upright: ink type on paper, both at
 * full strength. Nothing here is tinted — the count reads loudest because it is
 * the largest, not because everything around it was faded. Rank is carried by
 * size, face and weight only. The action uses the light-ground `outline`
 * variant; `outlineOnInk` would draw lichen on paper and wash out.
 */
export function CountdownBand() {
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

        {/* Quiet intro line — deliberately smaller than the count, so the
            section has one loud thing in it and not three. The locket’s own
            lower spacing separates the keepsake from this sentence. */}
        <h2 className="font-sans text-subhead text-ink">counting down to the day</h2>

        {/* The row and the script line are one sentence: `Countdown` renders
            the four-unit serif line, then this script label completes it. The
            intro above and the date below are both serif, like the count — the
            script is kept for the two lines that speak (the ring on the record
            and "until we say I do"), so rank comes from size, not face. */}
        <Countdown
          align="center"
          size="lg"
          className="mt-8 text-ink"
          srSuffix="until we say I do"
          labelClassName="font-script text-title text-ink"
          tickClassName="text-ink"
          label="until we say I do"
        />

        {/* The one action in the band: put the date somewhere it won't be
            forgotten. Outlined rather than filled so the day count stays the
            loudest thing on the section. */}
        <AddToCalendar className="mt-12" variant="outline" />
      </motion.div>
    </section>
  );
}
