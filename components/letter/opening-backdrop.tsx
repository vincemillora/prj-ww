'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useMotionTemplate } from 'motion/react';
import heroLily from '@/public/hero-lily.jpg';
import { Hero } from '@/components/letter/hero';

/**
 * The opening hero backdrop — the lily photo, with a darkening ink layer as the
 * hero leaves the viewport. CountdownBand and OurStory are ordinary siblings
 * in WeddingLetter, so their section spacing and backgrounds stay independent.
 *
 * TWO colours, never three. The ramp is the photo under a fixed dark scrim,
 * with ONE ink layer fading in on top. An earlier version faded a botanical
 * green in first and then covered it with ink, which read as a third colour
 * arriving and leaving mid-scroll. The palette's accents are for controls; a
 * background transition only ever moves between the photo and the ink.
 *
 * The backdrop is scoped to the hero. Our Story owns its own ink background;
 * this keeps the photo's scroll range bounded to the viewport-sized hero and
 * prevents later sections from changing the backdrop's measured progress.
 *
 * The backdrop is a viewport-sized `sticky top-0 h-lvh` box nested inside an
 * `absolute inset-0` layer. Both parts matter:
 *
 *   - sticky + `h-svh` keeps the photo framed to the SCREEN. A single
 *     `absolute inset-0` photo spanning three sections would be scaled to a box
 *     several viewports tall and cropped to a sliver.
 *   - the `absolute` parent takes it out of flow, so it contributes no height and
 *     cannot perturb the wrapper that `useScroll` measures. An earlier version
 *     put the sticky box directly in flow and cancelled its height with
 *     `-mb-[100svh]`; that made the measured progress collapse back to 0 over the
 *     last ~7% of the range, and the photo snapped back to full strength just as
 *     Our Story ended. Verified: ink opacity ran 0 -> 0.97 and then fell to 0.75
 *     and 0 across the final screens.
 *
 * Everything after it is `relative`, so it paints above.
 *
 * `overflow-hidden` sits on the backdrop's own box, never on an ancestor of the
 * Hero: an `overflow-hidden` ancestor makes a `sticky` element stick inside a
 * box that never scrolls, which would kill the Hero's own pin. The backdrop is
 * the Hero's SIBLING, so its clip cannot reach the sticky header.
 */
export function OpeningBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  // The backdrop's progress is measured only across the hero wrapper.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [0, 8]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  // Ink fading in over the photo. Reaches 1 at 0.96 rather than 1 so the last
  // sliver of the section is unambiguously flat, with no residual photo texture
  // under the closing lines.
  const inkIn = useTransform(scrollYProgress, [0, 0.96], [0, 1]);

  return (
    <div ref={ref} className="relative bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* `lvh`, the LARGEST viewport height: the pinned box has to keep
            covering the screen when a mobile browser retracts its chrome. At
            `svh` it would be short by exactly that chrome's height and leave an
            uncovered strip along the bottom; `dvh` would cover but resize the
            photo mid-scroll. `lvh` overflows a little and is clipped instead. */}
        <div className="sticky top-0 h-lvh overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ scale, filter, transformOrigin: '50% 50%' }}
        >
          {/* next/image (static import): responsive srcset, preload as the LCP
              image, and an inline blur-up placeholder while it streams in. */}
          <Image
            src={heroLily}
            alt=""
            fill
            preload
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        {/* Constant scrim: the hero's type sits on the photo from the first
            frame, so its legibility cannot depend on scroll position. */}
        <div className="absolute inset-0 bg-black/55" />
        {/* The ink, coming up over the photo — driven through a CSS CUSTOM
            PROPERTY, not through `opacity` directly.

            A plain `opacity` motion value is handed to the browser as a native
            scroll-driven animation. Outside that animation's range the browser
            stops applying it and the element snaps back to its base inline
            style, which is why the photo came back at full strength exactly as
            Our Story ended: computed opacity climbed to 0.97, then fell to 0.75
            and to 0 across the last screens while the inline style still read
            `opacity:0`. Moving the fade to the same element as the blur did not
            help — opacity is accelerated on its own regardless of its
            neighbours.

            A custom property has no accelerated equivalent, so Motion writes it
            from JS on every frame and the value holds past the end of the range.
            `opacity: var(--ink-in)` still animates on the compositor. */}
        <motion.div
          className="absolute inset-0 bg-ink opacity-[var(--ink-in)]"
          style={{ '--ink-in': inkIn } as React.CSSProperties}
        />
        </div>
      </div>
      <Hero />
    </div>
  );
}
