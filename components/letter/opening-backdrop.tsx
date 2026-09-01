'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import laceBackground from '@/public/lace-bg.png';
import { Hero } from '@/components/letter/hero';

/**
 * The hero's scroll-zoom scene. The background artwork is the only animated
 * layer; the lace remains in Hero's separate sticky layer above it.
 *
 * The scrim is load-bearing, not decoration. The couple's names are white script
 * over a drapery photograph whose brightest folds reach a relative luminance of
 * 0.54, and without it about a tenth of the glyph area sat below 3:1 against what
 * was directly behind it — worst case 1.55:1. It is NEUTRAL black rather than
 * ink-tinted, per PRODUCT.md: a scrim's job is to darken the photograph, not to
 * colour it (ink-tinting cast a green wash over the previous hero photo).
 *
 * 30% is the measured floor, not a guess. Co-located contrast of the glyph
 * pixels against the pixels beneath them, at 1440x900:
 *
 *     none  worst 1.55:1   10.2% of glyphs below 3:1
 *     /20   worst 2.47:1    1.9% below
 *     /25   worst 2.77:1    0.5% below
 *     /30   worst 3.15:1    0.0% below   <- chosen
 *     /50   worst 5.37:1    0.0% below
 *
 * PRODUCT.md recorded /50, but that value was tuned for the retired lily
 * photograph; on this artwork it darkens the backdrop's median luminance from
 * 0.121 to 0.030 and flattens the drapery for no legibility gain. Re-measure
 * this table if the backdrop image is ever replaced.
 */
export function OpeningBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 1.15]);

  return (
    <div ref={ref} className="relative h-[150svh] bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="sticky top-0 h-lvh overflow-hidden">
          <motion.div className="absolute inset-0" style={{ scale }}>
            <Image
              data-slot="hero-background-sharp"
              src={laceBackground}
              alt=""
              fill
              preload
              placeholder="blur"
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
          {/* Inside the sticky, overflow-hidden viewport so it tracks the
              VISIBLE backdrop rather than the whole 150svh scene, and after the
              image so it paints over it with no z-index of its own. The scaled
              layer is a sibling, so the zoom never drags the scrim with it. */}
          <div data-slot="hero-scrim" className="absolute inset-0 bg-black/30" />
        </div>
      </div>
      <Hero />
    </div>
  );
}
