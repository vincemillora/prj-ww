import Image from 'next/image';
import { cn } from '@/lib/utils';
import { InViewReveal } from '@/components/letter/in-view-reveal';
import { SectionHeading } from '@/components/letter/section-heading';

/**
 * Sequence of events — EDGE-TO-EDGE paper section. Prenup now sits directly
 * above it, so this section owns the same top and bottom spacing rhythm as the
 * other letter sections.
 *
 * Layout: a single centre rail runs down the middle. Each event alternates
 * sides — a line-icon illustration on one half, the description on the other,
 * with a short horizontal connector from the centre rail to the title. On
 * mobile the rail shifts left, a short connector runs from it to each title,
 * and the illustration sits in the item body AFTER the description. The rail
 * runs from the first event down to the getaway car at the end. Dummy data
 * for now.
 */

/**
 * Hand-drawn illustrations from `public/icons/hand_drawn/wedding_2`. Intrinsic
 * sizes come from each asset's viewBox — they are rendered at a fixed height
 * with `w-auto`, so the differing aspect ratios stay honest.
 */
const ILLOS = {
  arrive: { src: 'church.svg', width: 115, height: 123 },
  ceremony: { src: 'floral-arch.svg', width: 92, height: 92 },
  cocktails: { src: 'cocktails-two-glasses.svg', width: 112, height: 105 },
  dinner: { src: 'wedding-cake-tiered.svg', width: 108, height: 100 },
  dance: { src: 'dancing-couple-bride-groom.svg', width: 101, height: 105 },
  fireworks: { src: 'fireworks.svg', width: 108, height: 104 },
} as const;

type EventIllo = keyof typeof ILLOS;

/**
 * Only the first event carries a time. Guests arrive at a fixed hour — that is
 * the one thing they need to plan around; everything after it runs when it
 * runs, so no other row gets a clock. Do NOT add times back to the rest.
 */
const EVENTS: {
  time?: string;
  what: string;
  detail: string;
  illo: EventIllo;
}[] = [
  { time: '2:00 pm', what: 'Guests arrive', detail: 'Welcome drinks on the terrace.', illo: 'arrive' },
  { what: 'Ceremony', detail: 'In the garden, weather permitting.', illo: 'ceremony' },
  { what: 'Cocktails & photos', detail: 'Canapés and a string quartet.', illo: 'cocktails' },
  { what: 'Dinner', detail: 'Four seasonal courses in the Garden House.', illo: 'dinner' },
  { what: 'First dance & party', detail: 'The dance floor opens.', illo: 'dance' },
  { what: 'Fireworks', detail: 'One last hurrah on the lawn.', illo: 'fireworks' },
];

export function DayItself() {
  return (
    // `px-gutter` on BOTH sides: this section used to carry `pr-5` alone, so on
    // a phone it had no left gutter at all — the centred heading sat 10px off
    // centre and a long one would have run into the screen edge.
    <section className="relative z-0 bg-paper px-gutter pt-section pb-section">
      <div className="mx-auto max-w-[56rem] text-center lg:max-w-[76rem]">
        <SectionHeading
          title="The day itself"
          kicker="What we have planned on this special day"
        />

        {/* Same reasoning as the Our Story thread: each event's description
            gets one half of this, less the centre gutter, so the phone-first
            46rem wrapped short sentences onto two lines on a desktop. */}
        <div className="relative mx-auto mt-heading max-w-[46rem] lg:max-w-[60rem] xl:max-w-[68rem]">
          {/* The single centre rail: left on mobile, dead-centre on md+. It
              starts at the first event; on md+ it runs on down to the getaway
              car, on mobile it stops at the last event (car is hidden). */}
          <span
            aria-hidden
            className="absolute bottom-1 left-6 top-1 w-0.5 bg-ink md:bottom-32 md:left-1/2 md:-translate-x-1/2"
          />

          <ol className="relative">
            {EVENTS.map((e, i) => {
            // Even rows: illustration left, description right. Odd: swapped.
            const illoRight = i % 2 === 1;
            return (
              <InViewReveal
                as="li"
                key={e.what}
                className="relative flex flex-col items-start gap-3 pb-12 pl-16 last:pb-0 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-x-10 md:pl-0"
                distance={24}
                duration={0.7}
                ease="easeOut"
              >
                {/* Connector from the LEFT rail to the title (mobile only) —
                    stops short of the title (small gap) and is vertically
                    centred on the title's first line. */}
                <span
                  aria-hidden
                  // Vertically centred on the title's FIRST LINE, expressed in
                  // the title's own `em` (via `text-entry` on this span, which
                  // has no text of its own) so it tracks the fluid role instead
                  // of drifting off it. The extra 0.25rem is the body's `pt-1`.
                  className="absolute left-6 top-[calc(0.625em+0.25rem)] h-0.5 w-8 bg-ink text-entry md:hidden"
                />

                {/* Hand-drawn illustration — a side cell on md+; on mobile it
                    sits in the item body, after the description (order-2). */}
                <div
                  className={cn(
                    // On md+ the illustration hugs the centre rail rather than
                    // sitting in the middle of its half.
                    'order-2 flex shrink-0 justify-center md:order-2 md:shrink',
                    illoRight
                      ? 'md:order-3 md:justify-start'
                      : 'md:order-1 md:justify-end'
                  )}
                >
                  <EventIllustration illo={e.illo} />
                </div>

                {/* Spacer for the centre rail track (md grid middle column). */}
                <span aria-hidden className="hidden md:order-2 md:block md:w-0" />

                {/* Description + connector to the centre rail. */}
                <div
                  className={cn(
                    'order-1 relative pt-1 text-left md:pt-0',
                    illoRight
                      ? 'md:order-1 md:pr-2 md:text-right'
                      : 'md:order-3 md:pl-2 md:text-left'
                  )}
                >
                  {/* Horizontal connector from centre rail to the title (md+). */}
                  <span
                    aria-hidden
                    className={cn(
                      // Same anchoring as the mobile connector above; no
                      // `pt-1` to compensate for here (`md:pt-0`).
                      'absolute top-[0.625em] hidden h-0.5 w-10 bg-ink text-entry md:block',
                      illoRight ? 'md:-right-10' : 'md:-left-10'
                    )}
                  />
                  <p className="font-script text-entry text-ink">
                    {e.what}
                  </p>
                  {/* The hour, as a subtitle under its event. Small caps in the
                      sans face — the same treatment the dates get on the Our
                      Story polaroids — so it labels the line without competing
                      with the handwritten title above it. Only the arrival row
                      has a `time` at all (see EVENTS). */}
                  {e.time && (
                    <p className="mt-1 font-sans text-label font-medium uppercase tracking-[0.16em] text-ink">
                      {e.time}
                    </p>
                  )}
                  <p className="mt-2 text-body text-ink">{e.detail}</p>
                </div>
              </InViewReveal>
              );
            })}
          </ol>

          {/* Getaway car — where the rail ends. Hidden on mobile for now; on
              md+ it hangs off the bottom of the centre rail. */}
          <InViewReveal
            className="relative hidden pt-8 md:flex md:justify-center"
            distance={24}
            duration={0.7}
            ease="easeOut"
          >
            <Image
              src="/icons/hand_drawn/wedding_2/wedding-car-couple.svg"
              alt="Getaway car"
              width={99}
              height={99}
              className="h-20 w-auto opacity-80 md:h-32"
            />
          </InViewReveal>
        </div>
      </div>
    </section>
  );
}

/**
 * Hand-drawn illustration for one event. Same treatment as the getaway car at
 * the end of the rail: the asset's own ink, softened slightly, at a fixed
 * height so every row lines up regardless of the drawing's aspect ratio.
 */
function EventIllustration({ illo }: { illo: EventIllo }) {
  const { src, width, height } = ILLOS[illo];
  return (
    <Image
      src={`/icons/hand_drawn/wedding_2/${src}`}
      alt=""
      aria-hidden
      width={width}
      height={height}
      className="h-30 w-auto opacity-80 md:h-32"
    />
  );
}
