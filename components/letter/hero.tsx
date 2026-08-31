'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import lacePng from '@/public/lace.png';
import { COUPLE_NAMES } from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Hero type — the names and lace frame. It paints NO background of its
 * own: the lily photo, its scroll-zoom and the scrim-to-green overlay belong to
 * `OpeningBackdrop` owns the photo, scrim, and scroll treatment around this
 * section. CountdownBand is composed separately by WeddingLetter.
 *
 * The scene is 1.5 small viewport heights tall. Its header sticks for the
 * final half viewport, keeping the lace centred while the background continues
 * to scroll. `svh` keeps that scroll distance stable as mobile browser chrome
 * retracts, while the sticky header uses `dvh` to fill the visible screen.
 */
export function Hero() {
  // Hero content reveals on mount (above the fold), staggered top to bottom.
  const heroItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative z-10 h-[150svh]">
        <header className="sticky top-0 flex h-dvh flex-col px-gutter text-center">
        {/* The lace frame is centred in the full hero viewport. Its `svh` cap
            keeps the ornament clear of mobile browser chrome on short screens. */}
        <motion.div
          className="flex min-h-0 flex-1 flex-col items-center justify-center pb-0 sm:pb-8"
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

        </header>
    </div>
  );
}
