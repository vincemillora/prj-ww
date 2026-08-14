'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import lacePng from '@/public/lace.png';
import { WeekStrip } from '@/components/letter/week-strip';
import { COUPLE_NAMES, WEDDING_DAY_LABEL } from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Hero type — the names, the line, the date. It paints NO background of its
 * own: the lily photo, its scroll-zoom and the scrim-to-green overlay belong to
 * `OpeningBackdrop` owns the photo, scrim, and scroll treatment around this
 * section. CountdownBand is composed separately by WeddingLetter.
 *
 * The section is exactly ONE viewport tall (`100dvh`), so it holds the screen
 * once and then scrolls away with the page. It used to be 150svh with the
 * content `sticky top-0` inside it, which pinned the names for half a viewport
 * of scrolling; at one viewport there is no travel left for a pin to use, so the
 * sticky track is gone and this is a plain full-height header.
 *
 * `dvh`, not `svh`: the section is meant to fill what the reader can actually
 * see. The trade-off is that `dvh` tracks the mobile browser's retracting UI, so
 * the hero's height changes as that chrome hides — the two flex rows below
 * absorb it, but it is a live resize rather than a fixed box.
 */
export function Hero() {
  // Hero content reveals on mount (above the fold), staggered top to bottom.
  const heroItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative h-dvh">
        <header className="flex h-full flex-col px-gutter text-center">
        {/* Two groups, one screen. The lace + line ride in a `flex-1` row so
            they sit centred in whatever space is left above the date, and the
            date block is a `shrink-0` row pinned to the bottom. Because they are
            separate flex rows they can never overlap: on a short screen the
            centre row is the one that gives up height, and the lace is capped in
            `svh` (below) so it shrinks with it instead of pushing through. */}
        <motion.div
          className="flex min-h-0 flex-1 flex-col items-center justify-center pb-8"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.18, delayChildren: 0.15 }}
        >
          {/* Names sit inside a square floral lace frame (public/lace.png):
              a frosted-glass window shows through the lace's open center,
              with the couple's names stacked to fit the square. */}
          <motion.div
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative aspect-square w-[min(92vw,30rem,54svh)] -rotate-6 md:w-[min(92vw,39rem,54svh)]"
          >
            {/* Frosted glass filling the lace's open window. */}
            <div
              aria-hidden
              className="absolute inset-[23%] rounded-sm bg-paper/[0.07] backdrop-blur-[3px]"
            />
            {/* The lace frame. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 drop-shadow-[0_8px_30px_color-mix(in_srgb,var(--ink)_55%,transparent)]"
            >
              <Image
                src={lacePng}
                alt=""
                fill
                loading="eager"
                sizes="(max-width: 768px) 86vw, 541px"
                className="object-contain"
              />
            </div>
            {/* Names centered in the window, stacked to fit the square. */}
            <h1 className="absolute inset-[22%] font-weight-bold flex flex-col items-center justify-center gap-0.5 font-script leading-none text-paper drop-shadow-[0_2px_14px_color-mix(in_srgb,var(--ink)_75%,transparent)]">
              {/* Sized against the lace window rather than the type scale:
                  the names have to fit the frame they sit in, so they track
                  the frame's own breakpoint, not the document's. */}
              <span className="text-7xl md:text-[5.625rem]">{NAME_A}</span>
              <span className="text-3xl opacity-75 md:text-[2.25rem]">&amp;</span>
              <span className="text-7xl md:text-[5.625rem]">{NAME_B}</span>
            </h1>
          </motion.div>
          {/* <Countdown
            align="center"
            className="mt-10 text-paper drop-shadow-[0_1px_10px_color-mix(in_srgb,var(--ink)_65%,transparent)]"
          /> */}
        </motion.div>

        {/* Bottom group. The hero says who, then what, then when: the
            spelled-out date over the week strip with the day ringed, sitting on
            the bottom edge of the screen. Both are white with the names' shadow
            so they hold up over the photo; `WeekStrip` draws itself in
            `currentColor`. Its stagger picks up where the centre group's left
            off. */}
        <motion.div
          className="flex shrink-0 flex-col items-center pb-[max(2rem,5svh)]"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.18, delayChildren: 0.51 }}
        >
          <motion.p
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-sans text-subhead uppercase leading-none tracking-[0.16em] text-paper drop-shadow-[0_2px_14px_color-mix(in_srgb,var(--ink)_75%,transparent)]"
          >
            {WEDDING_DAY_LABEL}
          </motion.p>
          <motion.div
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <WeekStrip className="mt-5 text-paper drop-shadow-[0_2px_14px_color-mix(in_srgb,var(--ink)_75%,transparent)]" />
          </motion.div>
        </motion.div>
        </header>
    </div>
  );
}
