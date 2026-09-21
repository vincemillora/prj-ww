'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';

import { MOTION_REDUCE_SAFE } from '@/components/letter/motion-tokens';
import { cn } from '@/lib/utils';
import laceArt from '@/public/lace.webp';

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

  /**
   * The scroll cue answers its own question: the moment the page moves, the
   * guest knows it can, so the cue fades over the first 160px of scroll rather
   * than riding the whole 150svh scene. `useScroll` with no target reads the
   * window, which is what matters here — the cue is about the document having
   * somewhere to go, not about this section's progress.
   */
  const { scrollY } = useScroll();
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0]);

  return (
    <div className="relative z-10 h-[150svh]">
        <header className="sticky top-0 flex h-dvh flex-col px-gutter text-center">
        {/* The stagger lives on the full-height column so the centred group
            (lace and announcement) and the scroll cue at the foot of the
            viewport still reveal as one sequence: motion propagates variants
            only through motion components, so all of them have to stay inside
            this one. */}
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
              (public/lace.webp), over its frosted-glass window. */}
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
                src={laceArt}
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
            {/* The announcement line, in the same script hand as the names.
                Set at `title`, the letter's script headline role, and not
                caps: Parisienne has no capitals worth tracking out, and it
                reads at roughly half its nominal size (see the token's note in
                app/globals.css), so at `heading` this line came out quieter
                than the body copy further down the page. It is now the caption
                to the monogram rather than a line at the foot of the viewport,
                and a caption that small under a 30rem lace card read as an
                afterthought.
                `text-balance` is for the phone: 22 characters of script at the
                role's 2.5rem floor wrap on a 360px screen, and balanced it
                breaks after "getting" instead of orphaning "married!".
                Level, not tilted with the frame: a script line set on a slant
                fights its own baseline, and the tilt belongs to the lace card.
                Directly under the lace, inside the centred group rather than
                pinned to the foot of the viewport, so the card and its caption
                read as one object. The group's `justify-center` then centres
                the pair, which sits the lace a little above the optical middle
                — correct, since the caption needs to belong to it. */}
            <motion.p
              variants={heroItem}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                MOTION_REDUCE_SAFE,
                'mt-5 font-script text-title text-balance text-paper drop-shadow-[0_1px_10px_color-mix(in_srgb,var(--ink)_65%,transparent)]',
              )}
            >
              We&apos;re getting married!
            </motion.p>
          </motion.div>
          {/* The scroll cue, at the foot of the viewport above the safe-area
              inset so it clears the home indicator on iOS. It carries the
              bottom padding the announcement line used to hold.

              `aria-hidden`: it is an instruction for a sighted guest looking at
              a full-bleed image with no visible edge. Assistive tech reaches
              the sections below by structure, so announcing "scroll" to it
              would be noise. `pointer-events-none` keeps it from swallowing a
              tap meant for the page behind it — it is a sign, not a control.

              Sans, like the invitation's "Tap the envelope" hint: the
              letter's own voice is the script, and an instruction is not part
              of what the couple is saying. It is set at `kicker` rather than
              `label` so it carries across the hero photograph from arm's
              length — a cue nobody notices is not a cue — while staying well
              under the script announcement above it. */}
          <motion.div
            aria-hidden
            variants={heroItem}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ opacity: cueOpacity }}
            className={cn(
              // The floor pins opacity, so a guest with reduced motion on keeps
              // a cue that never fades. That is the right trade: the cue lives
              // inside the sticky hero and leaves with it either way, and the
              // alternative failure — JS never resolving the scroll value and
              // leaving the cue invisible — loses the prompt entirely.
              MOTION_REDUCE_SAFE,
              'pointer-events-none flex flex-col items-center gap-2 pb-[calc(env(safe-area-inset-bottom)+1.75rem)] font-sans text-kicker text-paper/90 drop-shadow-[0_1px_10px_color-mix(in_srgb,var(--ink)_65%,transparent)]',
            )}
          >
            <span>Scroll to read the letter</span>
            {/* Sized off the label rather than a fixed box, so the chevron
                keeps its proportion to the line as `text-kicker` clamps down
                on a narrow screen. */}
            <svg
              className="hero-scroll-cue-chevron h-[1.75em] w-[1.75em]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
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
