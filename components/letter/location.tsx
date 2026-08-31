'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'motion/react';

import { cn } from '@/lib/utils';
import { WEDDING_VENUE } from '@/lib/wedding';
import { DeferredMap } from '@/components/letter/deferred-map';
import { letterButton } from '@/components/letter/letter-button';
import { ENTER, TALL_VIEWPORT } from '@/components/letter/motion-tokens';
import { SectionHeading } from '@/components/letter/section-heading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const VENUE = {
  name: WEDDING_VENUE,
  tag: 'Ceremony & reception',
  address: 'Gumasa, Glan, Sarangani, Philippines',
  /* Sits under the map, directly above the maps link. Interpolates the venue
     name so it can't drift from WEDDING_VENUE. */
  caption: `Join us at ${WEDDING_VENUE} as we exchange our vows, surrounded by the people we love most.`,
  embed:
    'https://www.google.com/maps?q=Anvy+Beach+Resort&ll=5.8086321,125.1743154&z=17&output=embed',
  maps:
    'https://www.google.com/maps/place/Anvy+Beach+Resort+(Resort+Hotel)/@5.8086321,125.1743154,17z/data=!3m1!4b1!4m6!3m5!1s0x32f7abe38273c2df:0x97f91a6833d5039d!8m2!3d5.8086321!4d125.1743154!16s%2Fg%2F11j8l9rqnb',
};

/**
 * The photos stacked behind the venue card. Stand-ins for now: seeded
 * picsum shots (same approach as `our-story.tsx` / `prenup.tsx`, so each slot
 * keeps its image between loads). Swap for real files under `/public/venue/`
 * when we have them. The narrow remote pattern in `next.config.ts` allows
 * these seeded placeholders through the Next.js image optimizer meanwhile.
 */
const PHOTOS = [
  {
    id: 'shoreline',
    caption: 'the shoreline',
    image: 'https://picsum.photos/seed/ww-venue-shore/900/1200',
  },
  {
    id: 'pavilion',
    caption: 'the pavilion',
    image: 'https://picsum.photos/seed/ww-venue-pavilion/900/1200',
  },
  {
    id: 'lawn',
    caption: 'reception lawn',
    image: 'https://picsum.photos/seed/ww-venue-lawn/900/1200',
  },
  {
    id: 'sunset',
    caption: 'sunset over the bay',
    image: 'https://picsum.photos/seed/ww-venue-sunset/900/1200',
  },
];

/**
 * The deck's running order, and the order the pager dots are drawn in. It is
 * fixed: paging rotates a pointer through this list rather than shuffling the
 * list itself, so ‹ and › always step exactly one dot, whatever you last did.
 */
const DECK = ['venue', ...PHOTOS.map((p) => p.id)];
const COUNT = DECK.length;

/** Dot labels, keyed by card id — used by the pager buttons under the stack. */
const LABELS: Record<string, string> = {
  venue: 'the map',
  ...Object.fromEntries(PHOTOS.map((p) => [p.id, p.caption])),
};

/** Wrap an index into the deck, for either direction of travel. */
const wrap = (i: number) => ((i % COUNT) + COUNT) % COUNT;

/** Per-depth resting tilt, in degrees, so the deck reads as hand-stacked. */
const TILTS = [0, -2.2, 1.8, -1.4, 2.4];
/** Vertical peek per card behind the front one, in px. */
const PEEK = 15;
/** How much each card behind the front one shrinks. */
const SHRINK = 0.045;
/** Room under the stack for the deepest card's peek. */
const PEEK_ROOM = (COUNT - 1) * PEEK;

/** Offset + velocity past which a drag throws the card to the back. */
const THROW_THRESHOLD = 160;

/** Shared silhouette: the photos are bare images, but they sit in the deck
    with the same corner radius and drop shadow as the venue card. */
const CARD_SHELL =
  'rounded-xl shadow-[0_20px_44px_-26px_color-mix(in_srgb,var(--ink)_45%,transparent)]';

/** The two chevrons flanking the dots — bare glyphs, no button chrome. The
    padding is hit area only, so the tap target clears 24px on touch. */
const PAGER_ARROW =
  'flex items-center justify-center p-1 text-ink transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

/**
 * Location — section after AttireGuide. Centred header (font-script h2 +
 * font-sans label) over a draggable card stack, after the Motion card
 * stack example (motion.dev/examples/react-card-stack). The map card leads the
 * deck; venue photos sit behind it, peeking at the bottom edge. Throwing the
 * front card sideways sends it to the back; the dots under the stack are the
 * keyboard/tap equivalent.
 *
 * MOTION: the deck is DEALT. Until the stack is in view every card sits squared
 * up on the front one — one card, as it looks in the hand — and on arrival they
 * spring out to their peek, shrink and tilt. It is the same spring that already
 * runs on every shuffle, so the entrance and the interaction are literally the
 * same motion, and the fan doubles as the affordance: it is what tells a guest
 * there is more than one card here. No per-card delay is needed; the deeper
 * cards travel farther, so the spring staggers them for free.
 */
export function Location() {
  /** Which card in DECK is currently in front. Everything else derives. */
  const [frontIndex, setFrontIndex] = useState(0);
  const front = DECK[frontIndex];
  /** Fans the deck open once, when the stack reaches the viewport. */
  const stackRef = useRef<HTMLDivElement>(null);
  const dealt = useInView(stackRef, TALL_VIEWPORT);

  /** How far back in the deck a card is sitting right now. */
  const depthOf = (id: string) => wrap(DECK.indexOf(id) - frontIndex);

  /** Send the front card to the back — also what a drag-throw does. */
  const goNext = () => setFrontIndex((i) => wrap(i + 1));
  /** Pull the card at the back of the deck around to the front. */
  const goPrev = () => setFrontIndex((i) => wrap(i - 1));
  /** Jump straight to a card. The running order is unchanged, so the next ›
      still steps to the dot immediately after this one. */
  const bringToFront = (id: string) => setFrontIndex(DECK.indexOf(id));

  return (
    <section className="bg-paper px-gutter py-section">
      <div className="mx-auto max-w-[56rem] text-center lg:max-w-[64rem]">
        <SectionHeading tone="ink" title="Where we’ll be" kicker="Location" />

        {/* Roughly three quarters of the section's measure: the card is a
            single column of text over a map, so it reads better slimmer than
            the two-up Hotels grid that shares the same container width. */}
        <div className="relative mx-auto mt-heading max-w-2xl md:max-w-[42rem] lg:max-w-[48rem]">
          {/* Outer pad reserves the peek room, so the deepest card's bottom
              edge doesn't collide with whatever follows. The inner element is
              the positioning context: its height comes from the venue card,
              which stays in normal flow while every photo card is absolutely
              stretched over it — that keeps all five cards the same box no
              matter which one is currently in front. */}
          <motion.div
            style={{ paddingBottom: PEEK_ROOM }}
            // Opacity only on the wrapper: the fan below is the entrance, and a
            // rise on top of it would move every card twice.
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={TALL_VIEWPORT}
            transition={ENTER}
          >
            <div
              ref={stackRef}
              className="relative"
              role="group"
              aria-roledescription="card stack"
              aria-label={`${VENUE.name} — map and photos`}
            >
              <StackCard
                dealt={dealt}
                depth={depthOf('venue')}
                isFront={front === 'venue'}
                onDismiss={goNext}
                onBringToFront={() => bringToFront('venue')}
              >
                {/* 2px ink border, the same stroke and colour as the timeline
                    rail in components/letter/day-itself.tsx. `ring-0` kills
                    the Card's default hairline ring so the two don't draw one
                    over the other. */}
                <Card
                  inert={front !== 'venue'}
                  className={cn(
                    CARD_SHELL,
                    'flex flex-col border-2 border-ink bg-paper px-2 py-8 ring-0 sm:px-6',
                  )}
                >
                  <CardHeader className="text-center">
                    <CardTitle className="font-sans text-ink">
                      {VENUE.name}
                    </CardTitle>
                    <CardDescription className="font-sans tracking-wide">
                      {VENUE.tag}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col text-center">
                    {/* Same address row as the Hotels cards, centred: pin icon
                        and street line on one line, icon aligned to the first
                        line of wrapped text. */}
                    <dl className="text-meta text-muted-foreground">
                      <div className="flex justify-center gap-2">
                        <dt className="pt-0.5">
                          <MapPin
                            aria-hidden
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          <span className="sr-only">Address</span>
                        </dt>
                        <dd className="leading-relaxed">{VENUE.address}</dd>
                      </div>
                    </dl>

                    {/* The iframe swallows pointer events, so a drag can
                        never start on the map itself — it only accepts them
                        while this card is in front, and the card is dragged
                        from the paper around it (or paged with the dots). */}
                    <DeferredMap
                      title={`Map — ${VENUE.name}`}
                      src={VENUE.embed}
                      active={front === 'venue'}
                    />

                    {/* Measure-capped so the centred line doesn't run the full
                        width of the widened card on desktop. */}
                    <p className="mx-auto mt-5 max-w-prose text-body text-muted-foreground">
                      {VENUE.caption}
                    </p>

                    <a
                      href={VENUE.maps}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(letterButton(), 'mx-auto mt-4')}
                    >
                      <MapPin aria-hidden strokeWidth={1.5} />
                      Open in Google Maps
                    </a>
                  </CardContent>
                </Card>
              </StackCard>

              {PHOTOS.map((photo) => (
                <StackCard
                  key={photo.id}
                  stretch
                  dealt={dealt}
                  depth={depthOf(photo.id)}
                  isFront={front === photo.id}
                  onDismiss={goNext}
                  onBringToFront={() => bringToFront(photo.id)}
                >
                  {/* Bare photo — no paper frame, no caption. It only borrows
                      the venue card's radius and shadow so the deck keeps one
                      silhouette as the cards shuffle. */}
                  <div
                    className={cn(
                      CARD_SHELL,
                      'relative size-full overflow-hidden bg-ink select-none',
                    )}
                  >
                    <Image
                      src={photo.image}
                      alt={`${VENUE.name} — ${photo.caption}`}
                      fill
                      sizes="(max-width: 768px) 92vw, 48rem"
                      className="object-cover"
                      draggable={false}
                    />
                  </div>
                </StackCard>
              ))}
            </div>
          </motion.div>

          {/* Pager. Doubles as the accessible control for the deck: dragging
              is pointer-only, these are not. The deck wraps in both
              directions, so neither chevron is ever disabled. */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button type="button" onClick={goPrev} className={PAGER_ARROW}>
              <ChevronLeft aria-hidden className="size-5" strokeWidth={1.5} />
              <span className="sr-only">Previous card</span>
            </button>

            <div className="flex items-center gap-2.5">
              {DECK.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => bringToFront(id)}
                  aria-current={front === id}
                  className={cn(
                    'size-2.5 rounded-full border border-ink transition-colors',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
                    front === id ? 'bg-ink' : 'bg-transparent',
                  )}
                >
                  <span className="sr-only">Show {LABELS[id]}</span>
                </button>
              ))}
            </div>

            <button type="button" onClick={goNext} className={PAGER_ARROW}>
              <ChevronRight aria-hidden className="size-5" strokeWidth={1.5} />
              <span className="sr-only">Next card</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One card in the deck.
 *
 * Two nested motion elements so the two motions never fight over `rotate`:
 * the outer one animates the card's resting place in the deck (depth peek,
 * shrink, tilt), the inner one carries the live drag (x, tilt-with-throw,
 * fade-out on dismiss).
 *
 * `stretch` absolutely fills the stack's box — every card uses it except the
 * venue card, which stays in normal flow and is what gives the box its height.
 *
 * `dealt` is the entrance: false means squared up on the front card, true means
 * out at this card's depth. It feeds the SAME `animate` target the shuffle uses,
 * so no second transition, no separate reveal, and no chance of the two fighting
 * over `y`.
 */
function StackCard({
  dealt,
  depth,
  isFront,
  onDismiss,
  onBringToFront,
  stretch = false,
  children,
}: {
  /** False until the stack reaches the viewport — see Location's deal-in note. */
  dealt: boolean;
  depth: number;
  isFront: boolean;
  onDismiss: () => void;
  onBringToFront: () => void;
  stretch?: boolean;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const lift = useMotionValue(0);
  const dragRotate = useTransform(x, [-240, 240], reduce ? [0, 0] : [-14, 14]);

  /**
   * Throw the card off the side, then slide it back in *underneath* the deck.
   *
   * The two legs are split by `onDismiss()`: while the card is off-screen the
   * deck re-orders, so this card's `z-index` drops to the back. The return leg
   * then travels the same path in reverse with every other card drawn over it,
   * which reads as the card tucking under the stack rather than vanishing. The
   * outer element's spring is meanwhile settling into the new depth's peek and
   * shrink, so the card arrives already sized for the bottom of the deck.
   */
  const throwAway = async (direction: number) => {
    if (reduce) {
      onDismiss();
      return;
    }

    await Promise.all([
      animate(x, direction * 460, { duration: 0.26, ease: [0.32, 0, 0.67, 0] }),
      // A shallow dip on the way out, so the arc back in comes from below the
      // deck's front edge rather than straight across it.
      animate(lift, PEEK_ROOM * 0.5, { duration: 0.26, ease: 'easeOut' }),
    ]);

    onDismiss();

    await Promise.all([
      animate(x, 0, { duration: 0.46, ease: [0.33, 1, 0.68, 1] }),
      animate(lift, 0, { duration: 0.46, ease: [0.33, 1, 0.68, 1] }),
    ]);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Velocity counts as distance travelled, so a short fast flick throws too.
    const power = info.offset.x + info.velocity.x * 0.2;
    if (Math.abs(power) > THROW_THRESHOLD) void throwAway(Math.sign(power));
  };

  return (
    <motion.div
      // Both branches must be positioned: `z-index` is what orders the deck,
      // and it is ignored on a `position: static` element.
      className={cn(stretch ? 'absolute inset-0' : 'relative')}
      style={{ zIndex: COUNT - depth }}
      animate={{
        y: dealt ? depth * PEEK : 0,
        scale: dealt ? 1 - depth * SHRINK : 1,
        rotate: reduce || !dealt ? 0 : (TILTS[depth] ?? 0),
      }}
      transition={
        reduce
          ? { duration: 0.15 }
          : { type: 'spring', stiffness: 320, damping: 34 }
      }
    >
      <motion.div
        className={cn(
          stretch && 'size-full',
          isFront ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        )}
        style={{ x, y: lift, rotate: dragRotate }}
        drag={isFront ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        // A card behind the front one is mostly hidden; its peeking bottom
        // edge is the tap target that pulls it forward.
        onClick={isFront ? undefined : onBringToFront}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
