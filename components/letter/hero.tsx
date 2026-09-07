'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

import { MOTION_REDUCE_SAFE } from '@/components/letter/motion-tokens';
import { cn } from '@/lib/utils';
import lacePng from '@/public/lace.png';

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
  /**
   * Hero content settles on mount (above the fold), staggered top to bottom.
   *
   * TRANSFORM ONLY — no opacity, and that is a performance decision rather than
   * a stylistic one. An element at `opacity: 0` is not a paint candidate, so
   * fading this section in made the LARGEST CONTENTFUL PAINT wait for the
   * animation: measured on the production build at 4x CPU throttle, `/rsvp`
   * reported LCP at 1908ms against the announcement line, while the same page
   * under `prefers-reduced-motion` — where motion leaves opacity alone —
   * reported 96ms against the monogram. Every candidate up here was inside the
   * fade, so the fade was the metric.
   *
   * A rise reads as a settle rather than an arrival, which is the right note
   * anyway: the guest has just come from the invitation, whose envelope
   * dissolved over this same backdrop, so this content should already be here.
   */
  const heroItem = {
    hidden: { y: 20 },
    show: { y: 0 },
  };

  return (
    <div className="relative z-10 h-[150svh]">
        <header className="sticky top-0 flex h-dvh flex-col px-gutter text-center">
        {/* The stagger lives on the full-height column so the frame and the
            announcement line can sit at opposite ends of the viewport and
            still reveal as one sequence: motion propagates variants only
            through motion components, so both have to stay inside this one. */}
        <motion.div
          className="flex min-h-0 flex-1 flex-col"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.18, delayChildren: 0.15 }}
        >
          {/* The lace frame is centred in the full hero viewport. Its `svh` cap
              keeps the ornament clear of mobile browser chrome on short screens. */}
          <motion.div className="flex min-h-0 flex-1 flex-col items-center justify-center pb-8">
          {/* The footer monogram sits inside the square floral lace frame
              (public/lace.png), over its frosted-glass window. */}
          <motion.div
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            // The -6deg tilt has to come through motion, not a `-rotate-6`
            // class: motion writes the animated transform inline, which wins
            // over the class and flattens the frame to `transform: none` the
            // moment the reveal runs. Passed as a motion value, the rotation
            // composes with the reveal's translateY instead of losing to it.
            style={{ rotate: -6 }}
            // NO `MOTION_REDUCE_SAFE` here, deliberately: its
            // `motion-reduce:transform-none!` would take the -6deg TILT with
            // it, and the tilt is this card's design, not its animation —
            // measured, it flattened to 0deg under the preference. The floor is
            // there to rescue a resting state that only motion can produce,
            // and this entrance no longer touches opacity, so the worst case
            // without it (JS never runs) is a card sitting 20px low, tilted
            // and fully legible. Reduced motion WITH JS lands at rest, because
            // motion jumps a transform animation straight to its target.
            className="relative aspect-square w-[min(92vw,30rem,54svh)] md:w-[min(92vw,39rem,54svh)] lg:w-[min(92vw,42rem,60svh)]"
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
            {/* Eager, like the lace frame around it: this is the first thing
                the guest sees on arriving from the invitation, so it must not
                wait for the lazy-loading pass. Everything below the hero keeps
                the default lazy behaviour. */}
            <Image
              alt=""
              className="absolute top-1/2 left-1/2 h-auto w-[60%] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_14px_color-mix(in_srgb,var(--ink)_75%,transparent)]"
              height={2000}
              loading="eager"
              sizes="(max-width: 768px) 55vw, 325px"
              src="/couple-logo-white.svg"
              width={2000}
            />
            </motion.div>
          </motion.div>
          {/* The announcement line, in the same script hand as the names.
              Set at `heading` and not caps: Parisienne has no capitals worth
              tracking out, and a script face carries little ink for its
              nominal size, so a kicker-sized line would disappear under a
              7xl name. It still reads as the subordinate line because the
              names are ~3x its size.
              Level, not tilted with the frame: a script line set on a slant
              fights its own baseline, and the tilt belongs to the lace card.
              Sat at the foot of the viewport, above the safe-area inset so it
              clears the home indicator on iOS. */}
          <motion.p
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              MOTION_REDUCE_SAFE,
              'pb-[calc(env(safe-area-inset-bottom)+2.5rem)] font-script text-heading text-paper drop-shadow-[0_1px_10px_color-mix(in_srgb,var(--ink)_65%,transparent)]',
            )}
          >
            We&apos;re getting married!
          </motion.p>
          {/* <Countdown
            align="center"
            className="mt-10 text-paper drop-shadow-[0_1px_10px_color-mix(in_srgb,var(--ink)_65%,transparent)]"
          /> */}
        </motion.div>

        </header>
    </div>
  );
}
