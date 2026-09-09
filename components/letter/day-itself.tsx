import { type ReactNode } from 'react';
import Image from 'next/image';
import dayBackground from '@/public/rsvp-bg.png';
import laceFrame from '@/public/floral-lace-frame.png';
import { cn } from '@/lib/utils';
import { AttireNotes, AttirePlate } from '@/components/letter/attire-guide';
import { HandDrawnFrameLong } from '@/components/letter/hand-drawn-frame';
import { InViewReveal } from '@/components/letter/in-view-reveal';
import { OrnamentDrift } from '@/components/letter/ornament-drift';
import { RsvpEnvelope } from '@/components/letter/rsvp-envelope';
import { SectionHeading } from '@/components/letter/section-heading';
import { Card } from '@/components/ui/card';
import { TypedText } from '@/components/letter/typed-text';

/**
 * The day itself — a full-bleed section standing on the RSVP's floral artwork,
 * with everything above it laid out as PAPER ON THAT GROUND rather than as
 * boxes in a column:
 *
 *   envelope + card   the section's title, on a card in the pocket
 *   sequence sheet    the running order, on a hand-drawn sheet
 *   lace frame        the attire title, set in the lace's open window
 *   plate sheet       the palette illustration, tilted one way
 *   notes sheet       the guidance, inverted to ink, tilted the other
 *
 * Each element laps the one above it and is nudged off-axis, so the run reads
 * as loose papers dropped on the ground rather than a stack of cards. Every one
 * of those offsets is capped by something real — the envelope's flap, the
 * viewport's edge, the fluid type's width — and the caps are noted at each
 * call site. Prenup sits directly above, so this section keeps the same top and
 * bottom spacing rhythm as the rest of the letter.
 *
 * It also absorbed the old AttireGuide section, whose content now lives as two
 * exports in components/letter/attire-guide.tsx.
 *
 * Sequence layout: a single centre rail runs down the middle. Each event
 * alternates sides — a line-icon illustration on one half, the description on
 * the other, with a short horizontal connector from the centre rail to the
 * title. On mobile the rail shifts left, a short connector runs from it to each
 * title, and the illustration sits in the item body AFTER the description. The
 * rail runs from the first event down to the getaway car at the end. Dummy data
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
 *
 * MOTION: each event rises as the rail reaches it — this body is a sequence, so a
 * per-item entrance IS the content. The getaway car at the end is the only
 * ornament here, so it is the only thing that also drifts back OUT: it is the
 * joke at the bottom of the rail, and a joke that lingers after you have scrolled
 * past it stops being one.
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
    // `bg-[#7d6e55]` rather than `bg-paper`: that is the artwork's own measured
    // mean tone, so the frame before the image decodes matches it instead of
    // flashing white and then going dark. Same trick as the `--lace` token in
    // app/globals.css, but not that token — its name says it is the drapery's
    // average, and this is a different picture.
    // `pb-crown-over`, not `pb-section`: the Location section below crowns this
    // one with a paper arch that stands in this section's bottom margin, and
    // the sequence has to clear it. Deliberately a PINNED clearance rather than
    // `pb-dome`, which tracks the arch depth — shallowing the arch then drags
    // this section's last card down onto the curve. The room above the crown is
    // not the gap that needed closing; the empty paper INSIDE it was. See
    // `--spacing-crown-over` in app/globals.css.
    <section className="relative z-0 overflow-x-clip bg-[#7d6e55] px-gutter pt-section pb-crown-over">
      {/* The floral backdrop this section stands on — the SAME artwork the RSVP
          section uses (public/rsvp-bg.png), so the letter's two full-bleed
          sections share a ground instead of introducing a second one.

          Painted ONE VIEWPORT AT A TIME, the same device rsvp.tsx uses, and for
          the same reason. `object-cover` scales to the larger of the two ratios
          it is asked to fill, so a layer spanning this whole (very tall)
          section made its HEIGHT the governing dimension: the 1448x1086 source
          was blown up well past 1x to cover a section thousands of pixels tall,
          of which only a narrow middle strip was ever on screen. A
          `sticky top-0 h-lvh` viewport keeps the painted box one screen tall
          however far the section runs, so the cover scale stays sane and the
          artwork holds still while the sheets scroll across it.

          The section's `overflow-x-clip` is what keeps this working:
          `overflow-hidden` would make the section a scrollport and pin the
          backdrop to it instead of to the viewport. Clip contains the
          horizontal overflow without becoming a scroll container.

          `sizes` describes the PAINTED width, not the container's. Below the
          image's own 4:3 the height governs, so that width is
          `vh * 1448/1086` = ~134vh — on a 390x844 phone that is 288vw, and a
          plain `100vw` under-asks by nearly 3x. Above 4:3 the width governs and
          100vw is exact. Same figures as the RSVP's copy, because it is the
          same artwork.

          `-z-10` puts it behind the content but still ABOVE the section's own
          background colour, because `relative z-0` on the section makes this a
          stacking context that clamps the negative index. */}
      <div
        aria-hidden
        data-slot="day-itself-background"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          data-slot="day-itself-background-viewport"
          className="sticky top-0 h-lvh"
        >
          <Image
            src={dayBackground}
            alt=""
            fill
            placeholder="blur"
            sizes="(max-aspect-ratio: 4/3) 134vh, 100vw"
            className="object-cover object-center"
          />
        </div>
      </div>
      <div className="mx-auto max-w-[56rem] text-center lg:max-w-[76rem]">
        {/* The heading arrives on a card in the RSVP's envelope, which is why
            there is no bare SectionHeading in this section any more.

            `glide={false}`: the RSVP's envelope pins its paper layers and lets
            the card ride out of the pocket on scroll, because there the
            envelope IS the subject. Here it is the section's title block, and
            it has the sequence's own per-event entrances immediately below it —
            a second scroll-driven ornament above them would be two things
            competing for the same gesture. Nothing pins; it scrolls as one
            still composition.

            SIZE is capped here rather than inside the envelope, so the RSVP's
            own is untouched. The envelope is 1.106x as tall as it is wide and
            draws itself 120.2px WIDER than its container, so left at this
            section's 56/76rem measure it would stand over 1300px tall — a title
            block taller than the sequence it introduces. The desktop cap is the
            LARGER of the two: at the phone's 24rem a desktop envelope is 504px
            with a 319px card, which wraps the title onto two lines and makes
            the card tall enough to stand clear of the envelope's mouth. 30rem
            gives a 600px envelope, a 399x178 card and the title on one line.

            DEPTH (`cardTop`) is capped by the FLAP, and was found by rendering
            16/22/28/34% and looking rather than by arithmetic: the flap is a
            triangle whose apex is dead centre, exactly where centred type sits,
            so no single number describes its edge. Sunk far enough that the
            fold crosses the card's lower corners, it reads as a card IN the
            envelope rather than one laid on top. The phone's 34% leaves the
            type about 14px above the fold; the desktop's 36% is the same
            relationship at a larger size. Deeper than that and the flap starts
            crossing the kicker — the ceiling is the type, not the geometry.
            Both are past the envelope's own 30% default, which is tuned for the
            RSVP's tall form card, not two lines of type.

            POSITION is left of centre at every size, and on a phone it runs off
            the screen edge on purpose. The section's `overflow-x-clip` is what
            makes that safe: `overflow-x-hidden` on the body cannot undo a
            widened layout viewport (it leaves a blank strip and re-anchors
            fixed controls), whereas clipping here contains the overflow without
            making the section a scroll container.

            The card takes Our Story's ground — `bg-ink`, the same solid the
            RSVP card's section uses — so the heading is `tone="white"` to sit
            on it. */}
        <div className="mx-auto w-full max-w-[24rem] -translate-x-[14%] sm:max-w-[30rem] sm:-translate-x-[4rem] lg:-translate-x-[6rem]">
          <RsvpEnvelope glide={false} cardTop="mt-[34%] sm:mt-[36%]">
            {/* Double rule, the same treatment the RSVP card carries: a 2px
                paper outline held 2px off the card. `outline-offset` leaves
                that gap TRANSPARENT rather than filling it, so it picks up
                whatever the card is sitting on — which differs from the RSVP's
                case worth knowing: there the gap shows the section's ink, here
                it shows the envelope's cream lining, so the rule reads as a
                white line separated from the ink card by a thread of lining
                rather than by more ink. */}
            <Card className="rounded-lg bg-ink px-3 py-6 shadow-[0_28px_60px_-30px_color-mix(in_srgb,var(--ink)_45%,transparent)] outline-2 outline-offset-2 outline-paper">
              <SectionHeading
                tone="white"
                title="The day itself"
                kicker="What we have planned on this special day"
              />
            </Card>
          </RsvpEnvelope>
        </div>

        {/* The frame gets its OWN wrapper rather than being hung on the
            sequence box below. That box is the positioning context for the
            centre rail (`left-6`, `top-1`, `bottom-1`), so padding it would
            move the rail with it — on a phone `left-6` would land the rail
            directly on the frame's left line, and `top-1`/`bottom-1` would
            stretch it up into the frame's own margin.

            Same drawing the Location and Hotels cards use
            (components/letter/hand-drawn-frame.tsx), but the 9-SLICED variant
            rather than the stretched one: this box is nowhere near the
            drawing's own proportions (roughly 0.8 wide-to-tall on a desktop,
            0.2 on a phone), and stretching one drawing over that made the top
            and bottom strokes several times heavier than the sides and smeared
            the corner flicks into long swooping curves. Slicing keeps the
            corners at their drawn size and just makes the LINES longer.

            It laps the envelope hard and sits slightly off its axis, so the
            two read as one stack coming out of the pocket. The lap sinks the
            envelope's lower half behind this sheet — 192px of its 664 on a
            desktop, the whole pocket and monogram on a phone — which works
            because this sheet is a later sibling and paints in front. Any less
            and the envelope read as sitting BESIDE the sheet rather than behind
            it. The offsets are tied to the envelope's size, so they want
            rechecking if its width cap moves.

            The sideways nudge is capped by the viewport, not by taste: the
            sheet has ~23px of slack on a 390px screen, and past that the
            frame's own side LINE leaves the screen and the drawing reads as
            broken open. The envelope and lace are allowed to bleed off the
            edge; a ruled sheet is not.

            WIDTH is capped on a desktop too. Left to the section's 76rem
            measure this came out 1216px — twice anything else in the section —
            so it read as a different kind of object. 56rem leaves the timeline
            768px of inner width after the `lg` padding, enough for its two
            columns and the centre rail. */}
        <Sheet className="-mt-[12rem] translate-x-[0.75rem] px-6 py-12 sm:mx-auto sm:-mt-56 sm:max-w-[48rem] sm:translate-x-0 sm:px-10 sm:py-16 lg:max-w-[56rem] lg:px-16 lg:py-20">

          {/* Same reasoning as the Our Story thread: each event's description
              gets one half of this, less the centre gutter, so the phone-first
              46rem wrapped short sentences onto two lines on a desktop. */}
          <div className="relative mx-auto max-w-[46rem] lg:max-w-[60rem] xl:max-w-[68rem]">
          {/* The single centre rail: left on mobile, dead-centre on md+. It
              starts at the first event; on md+ it runs on down to the getaway
              car, on mobile it stops at the last event (car is hidden). */}
          <span
            aria-hidden
            className="absolute bottom-1 left-6 top-1 w-0.5 bg-ink md:bottom-32 md:left-1/2 md:-translate-x-1/2"
          />

          {/*
            `overflow-x-clip`, not `overflow-x-hidden`: the rows travel 40px
            sideways on their way in and out, and without a clip that offset can
            push the document wider than the viewport and flash a horizontal
            scrollbar mid-animation. Clip contains it without making this a
            scroll container, which would break the rail's absolute placement.
          */}
          <ol className="relative overflow-x-clip">
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
                // The row arrives from the side its WORDS sit on, so the
                // events alternate across the rail on the way in and leave the
                // same way. `illoRight` puts the illustration right, which puts
                // the description left. Below `md` this is ignored and the row
                // rises instead — see `slideFrom`: the rail is at the left edge
                // there and every row sits to the right of it.
                slideFrom={illoRight ? 'left' : 'right'}
                slideAt="md"
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
                  {/* Written out as the rail reaches the event, unwritten when
                      it passes. The connectors above are anchored to this
                      title's first line in its own `em`, and TypedText keeps
                      the line box open while it is empty, so they do not move
                      while the words are being written. */}
                  <TypedText
                    className="font-script text-entry text-ink"
                    testId="event-title"
                    text={e.what}
                  />
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
          <OrnamentDrift
            className="relative hidden pt-8 md:flex md:justify-center"
            distance={24}
          >
            <Image
              src="/icons/hand_drawn/wedding_2/wedding-car-couple.svg"
              alt="Getaway car"
              width={99}
              height={99}
              className="h-20 w-auto opacity-80 md:h-32"
            />
          </OrnamentDrift>
          </div>
        </Sheet>

        {/* The floral lace frame, closing the section under the sheet, with the
            attire heading set in its open window — the same move as the
            envelope above: an ornament that holds the words rather than sitting
            beside them.

            The asset is stored ROTATED 90° clockwise from the download, so it
            is landscape (1126x819) here — which also stops the title wrapping,
            since the window is now wider than it is tall.

            The window is measured off the asset's alpha channel, not guessed,
            and the artwork is cropped to its own bounds (hence the `aspect-`).
            Its border is thicker on the long sides than the short ones, so the
            type is inset per AXIS. The measurements were x 0.20..0.80 and
            y 0.15..0.85 before the rotation; turning the file a quarter turn
            swaps them, giving x 0.15..0.85 and y 0.20..0.80. Re-measure if the
            artwork changes, and re-swap if it is ever rotated again.

            `tone="ink"` sets the type in Our Story's ground colour. Note this
            is ink over the lace's translucent wash over the mid-dark backdrop,
            so it is the lowest-contrast type in the section by some margin —
            asked for deliberately, and worth a look on a real screen in
            daylight before this ships.

            EVERY width here is sized to the TYPE, not to the container, because
            `text-title` is a fluid role driven by the viewport while the window
            is only 70% of the box. Measured, the script line is ~215px on a
            phone, then 268px at 768, 303 at 1024 and 338 from 1440 up where its
            clamp tops out — so the box has to clear roughly 307 / 399 / 449 /
            499. Hence 21rem, then 26/30/32rem. One cap for all of desktop
            wrapped the title again above 768. Vertically there is slack to
            spare: the window is 60% of a landscape box against ~73px of type. */}
        <div className="relative -mt-[4rem] w-[21rem] -translate-x-[1.5rem] sm:mx-auto sm:-mt-16 sm:w-full sm:max-w-[26rem] sm:-translate-x-[4rem] md:max-w-[30rem] lg:max-w-[32rem] lg:-translate-x-[6rem]">
          <div className="relative aspect-[1126/819]">
            <Image
              src={laceFrame}
              alt=""
              aria-hidden
              fill
              placeholder="blur"
              sizes="(max-width: 640px) 92vw, 32rem"
              className="object-contain"
            />
            <div className="absolute inset-x-[15%] inset-y-[20%] flex flex-col items-center justify-center">
              <SectionHeading
                tone="ink"
                title="What to wear"
                kicker="Attire guide"
              />
            </div>
          </div>
        </div>

        {/* The attire content, on two sheets rather than one: the palette plate
            and the guidance notes are different KINDS of thing — a picture and
            a list of instructions — and giving each its own sheet lets them sit
            apart the way loose papers do, one nudged right and one left, under
            the lace title above.

            Both come from attire-guide.tsx rather than being retyped here, so
            the palette names and the three lines of guidance have one home.

            They LAP the sheet above and each other, and since the frame's fill
            is opaque the sheet beneath loses its bottom LINE but keeps its
            sides — which is what makes a run of them read as papers laid down
            in a stack rather than a column of boxes. Keep the laps small for
            that reason: much more and the sheet underneath stops reading as a
            whole sheet.

            They TILT in opposite directions and offset in opposite directions,
            which turns that stack into two papers dropped on a table. Both are
            capped by the same thing as everything else here — a sheet pushed or
            rotated far enough to put the frame's own side line off the screen
            reads as broken open. 2° is the ceiling on a phone (a rotation
            throws the corners out by roughly half the box height times
            sin(angle), against ~11px of slack), and the left sheet uses 0.75rem
            rather than 1rem because the tilt spends some of that slack: at 1rem
            the rotated corner landed on x=0 exactly.

            Tailwind v4 sets `rotate` and `translate` as separate CSS
            properties, so tilt and nudge compose instead of one winning. Safe
            as classes because neither sheet is itself a motion element — the
            reveals are on the content INSIDE, so nothing writes an inline
            transform over these.

            On a desktop they are CAPPED and pushed further apart. Unconstrained
            they filled the section: 1235px and 1224px wide, the notes sheet a
            1224x292 letterbox, and at that width a 2° tilt lifts one end ~21px
            so the type read as skewed rather than as a sheet laid at an angle.
            Capped at 43/32rem the same tilt lifts ~9px. */}
        <Sheet className="-mt-[2.5rem] translate-x-[0.75rem] rotate-2 px-6 py-10 sm:mx-auto sm:-mt-10 sm:max-w-[43rem] sm:translate-x-[5rem] sm:px-10 sm:py-12 lg:translate-x-[8rem]">
          <AttirePlate />
        </Sheet>

        {/* The notes sheet is INVERTED to match the title card: an ink ground
            with the drawing in paper. Both come from `tone="ink"` — the fill
            and the line are separate baked assets, so they can only switch
            together (see hand-drawn-frame.tsx). */}
        <Sheet
          tone="ink"
          className="-mt-[2rem] -translate-x-[0.75rem] -rotate-2 px-6 py-10 sm:mx-auto sm:-mt-8 sm:max-w-[32rem] sm:-translate-x-[5rem] sm:px-10 sm:py-12 lg:-translate-x-[8rem]"
        >
          <AttireNotes tone="paper" />
        </Sheet>
      </div>
    </section>
  );
}

/**
 * One hand-drawn sheet: the 9-sliced frame, plus whatever is laid on it.
 *
 * `isolate` is the load-bearing part and the reason this is a component rather
 * than three copies of the same two lines. The frame paints at `-z-10` so it
 * sits behind the sheet's content; without a stacking context here that
 * negative index escapes the sheet and vanishes behind the section's own
 * background.
 *
 * The frame carries its own paper too, clipped to the drawn outline, so callers
 * must NOT put a background on the sheet: a `bg-*` here is a plain rectangle,
 * and against this section's artwork you would see its straight edge cross the
 * drawing's wobble and square off the corner flicks.
 *
 * Padding is the caller's, and it is breathing room rather than clearance — the
 * frame's stroke sits on the box's edge, so nothing collides without it.
 */
function Sheet({
  className,
  tone,
  children,
}: {
  className?: string;
  tone?: 'paper' | 'ink';
  children: ReactNode;
}) {
  return (
    <div className={cn('relative isolate', className)}>
      <HandDrawnFrameLong tone={tone} />
      {children}
    </div>
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
