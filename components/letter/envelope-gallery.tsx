'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

/**
 * The keepsake — a scroll-scrubbed WHITE envelope pinned to the bottom of the
 * screen. As you scroll it opens like a real envelope: the triangular flap
 * lifts and folds back, revealing the triangular mouth, and a continuous line
 * of near-full-width photos is drawn up out of that opening. Sits between Our
 * Story (ink) and Prenup (paper); carries the ink -> paper transition across
 * itself so Prenup continues seamlessly.
 *
 * Mechanic (validated in scratchpad/mockup.html before porting):
 *  • The envelope is a 3D scene (`.env-wrap` keeps its `perspective`; we add
 *    `preserve-3d`). Paint order is by translateZ, NOT z-index:
 *      back (z -6) < photo strip (z -2) < front wall (z 0) < flap.
 *  • The FRONT WALL is one SVG shape: rounded bottom corners, SQUARE top
 *    corners (the hinge cannot be rounded), and a triangular NOTCH cut from the
 *    top centre = the opening. Opaque, so it hides the part of a photo still
 *    inside and frames the triangular mouth.
 *  • The FLAP is the top triangle, hinged at the top edge. It folds open
 *    (rotateX) and is simultaneously pushed BEHIND the photos (translateZ) so a
 *    drawn photo never gets painted over by the folded flap.
 *  • The photo STRIP is anchored at the envelope's centre line (the notch apex)
 *    and pulled straight up; fixed `gap` => photos never overlap. Early photos
 *    scroll off the top as later ones emerge — intended.
 *
 * Scroll is driven by motion's `useScroll` (JS/rAF) with a sticky pin sized in
 * `svh`, deliberately NOT a CSS `scroll()` timeline (the source of the retired
 * intro's mobile jitter — see project note envelope-reveal-scroll-approaches).
 *
 * prefers-reduced-motion: renders a static open state (flap up, a few photos out).
 */

type Card = { alt: string };

// Eight temporary photo slots drawn out in order. Add local files under
// /public/keepsake/ when the final photographs are ready.
const CARDS: Card[] = [
  { alt: 'a kept moment' },
  { alt: 'a kept moment' },
  { alt: 'a kept moment' },
  { alt: 'a kept moment' },
  { alt: 'a kept moment' },
  { alt: 'a kept moment' },
  { alt: 'a kept moment' },
  { alt: 'a kept moment' },
];

// Corner radius shared by the envelope and the photo cards ("same roundedness
// as the cards"). The flap/hinge (top edge) stays square.
const RADIUS = '8px';

export function EnvelopeGallery() {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Ground fades ink -> paper near the end, so Prenup continues on paper.
  const paperOpacity = useTransform(scrollYProgress, [0.84, 0.97], [0, 1]);
  // Envelope settle at the very top of the runway.
  const envScale = useTransform(scrollYProgress, [0, 0.06], [0.92, 1]);
  const envOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  // Flap opens over the first 30% (rotateX 0 -> -150deg, folded back).
  const flapRotate = useTransform(scrollYProgress, [0, 0.3], [0, -150]);
  // Flap depth: in FRONT while sealing (z +0.5), pushed BEHIND the photos as it
  // opens (z -42) so the folded flap never paints over an emerging photo.
  const flapZ = useTransform(scrollYProgress, [0.08, 0.26], [0.5, -42]);
  // The strip: tucked (hidden below the notch) until the flap has opened, then
  // pulled straight up. Percentages are of the strip's own height, so it stays
  // responsive. Ends with the last photo just clearing the mouth.
  const stripY = useTransform(scrollYProgress, [0.3, 1], ['0%', '-105%']);

  const photoShadow =
    'shadow-[0_10px_20px_-6px_color-mix(in_srgb,var(--ink)_45%,transparent)]';

  return (
    <section
      ref={sectionRef}
      id="keepsake"
      className="relative z-0 bg-ink"
      // Long runway so the envelope opens and the line is drawn out slowly.
      style={{ height: reduce ? 'auto' : '560svh' }}
    >
      {/* Envelope pinned to the BOTTOM of the screen; photos are drawn up out of
          its mouth into the empty space above it. */}
      <div className="sticky top-0 flex h-[100svh] items-end justify-center overflow-hidden pb-[4svh]">
        {/* Ground: ink base with a paper layer that fades in over it. */}
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-paper"
          style={{ opacity: reduce ? 1 : paperOpacity }}
        />

        {/* The envelope. A 3D scene: `perspective` comes from `.env-wrap`
            (globals.css); we add preserve-3d so the flap can fold to the back
            plane behind the photos. `animation:none` kills the class's one-shot
            zoom. Size + aspect are set here (the class's own are overridden). */}
        <motion.div
          className="env-wrap relative"
          style={{
            animation: 'none',
            transformStyle: 'preserve-3d',
            width: 'clamp(16rem, 82vw, 22rem)',
            height: 'auto',
            aspectRatio: '300 / 188',
            ['--env-r' as string]: RADIUS,
            scale: reduce ? 1 : envScale,
            opacity: reduce ? 1 : envOpacity,
          }}
        >
          {/* Back wall — behind the photos. Rounded bottom, square top (hinge). */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: '#dfe3df',
              borderRadius: '0 0 var(--env-r) var(--env-r)',
              transform: 'translateZ(-6px)',
              boxShadow: '0 18px 40px -12px color-mix(in srgb, var(--ink) 55%, transparent)',
            }}
          />

          {/* Photo strip — anchored at the notch apex (env centre), pulled up.
              z -2 keeps it behind the front wall (hidden inside) and in front of
              the folded-back flap. */}
          <motion.div
            aria-hidden
            className="absolute left-[4%] top-1/2 flex w-[92%] flex-col items-center gap-[6px]"
            style={{
              transformOrigin: 'top center',
              y: reduce ? '-55%' : stripY,
              z: -2,
            }}
          >
            {CARDS.map((card, i) => (
              <figure
                key={i}
                className={`w-full overflow-hidden bg-paper ${photoShadow}`}
                style={{ borderRadius: 'var(--env-r)' }}
              >
                <div className="relative aspect-[4/3] bg-ink">
                  <div className="flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_1px,transparent_1px,transparent_10px)]">
                    <span className="font-mono text-micro uppercase tracking-[0.14em] text-paper">
                      photo · {card.alt}
                    </span>
                  </div>
                </div>
              </figure>
            ))}
          </motion.div>

          {/* Front wall — ONE svg: rounded bottom corners (r matches the cards),
              square top corners (hinge), triangular notch = the opening. Opaque
              white; hides the inside and frames the mouth. viewBox matches the
              envelope aspect so the corner arcs stay circular. */}
          <svg
            aria-hidden
            viewBox="0 0 300 188"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            style={{ transform: 'translateZ(0px)' }}
          >
            <path
              d="M0,0 L150,94 L300,0 L300,180 A8,8 0 0 1 292,188 L8,188 A8,8 0 0 1 0,180 Z"
              fill="#f5f7f5"
            />
          </svg>

          {/* Flap — top triangle, hinged at the top edge (square corners). Folds
              open and is pushed behind the photos as it opens. */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/2"
            style={{
              background: '#eaeee9',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transformOrigin: 'top center',
              rotateX: reduce ? -150 : flapRotate,
              z: reduce ? -42 : flapZ,
              boxShadow: 'inset 0 2px 0 rgba(0,0,0,0.04)',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
