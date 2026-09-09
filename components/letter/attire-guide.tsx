'use client';

import { useState } from 'react';
import { useReducedMotion } from 'motion/react';

// WEBP, not PNG: the artwork is a smooth-gradient illustration, and PNG can
// only shrink it by quantising to 256 colours — which bands the sky. At q92
// this is 209KB against the PNG's 1.8MB with a mean error of 1.3/255.
import attireGuide from '@/public/attire-guide.webp';
import { cn } from '@/lib/utils';
import { InViewReveal } from '@/components/letter/in-view-reveal';
import { PlateReveal } from '@/components/letter/letter-reveals';
import { MotionImage } from '@/components/letter/motion-image';
import { BEAT } from '@/components/letter/motion-tokens';
import {
  MORPH,
  PhotoLightbox,
  photoLayoutId,
} from '@/components/letter/photo-lightbox';

const PLATE_ID = 'attire-guide';
const PLATE_ALT =
  'Illustrated guests on the beach wearing the wedding palette — wine, raspberry, lilac, mauve, olive, forest green and pale gold';

/*
 * The prose lives in consts rather than inline JSX attributes: a multi-line
 * string ATTRIBUTE keeps its own newlines and indentation in the DOM (JSX only
 * collapses whitespace in children), which browsers hide but tests and
 * copy-checks do not.
 */
const MEN_LOOK =
  'A barong, a polo shirt or a full-button polo — whichever you are most ' +
  'comfortable in. No jacket needed; it will be warm by the sea. Trousers or ' +
  'shorts both work, and loafers or sandals are good for the walk on sand.';

const WOMEN_LOOK =
  'Wear something with movement — a midi or a floor-length dress — and the sea ' +
  'breeze will do the rest. Chiffon, linen and cotton will keep you cool in ' +
  'the sun, and florals in these colours are very welcome. Do skip the ' +
  'stilettos: block heels, wedges or flats are far kinder on sand.';

/**
 * The palette plate, the two guide cards and the closing notes are separate
 * exports because Day Itself presents each one differently — a polaroid, two
 * drawn sheets and the lace frame. Keeping them here rather than inlining the
 * markup at the call site keeps ONE source for the copy: the colours named in
 * the alt text and every line of guidance are wedding facts, and two divergent
 * copies of a fact is how a site starts telling guests different things in
 * different places.
 */
export function AttirePlate({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const reduce = !!useReducedMotion();

  return (
    <>
      <PlateReveal className={className}>
        {/* A POLAROID, the same object as the Our Story prints — paper mount,
            deep bottom lip, drop shadow, laid at a slight angle — only
            landscape, because the artwork is 1672x941 and cropping it square
            would throw away half the guests in it. It replaces the hand-drawn
            sheet this used to sit on: a picture in a paper mount is a
            photograph on the table, where the drawn frame made it one more
            written card in a run of written cards.

            Tapping it flies the print to the centre of the screen — the same
            shared-`layoutId` morph the prenup strip and the Our Story
            polaroids use (see photo-lightbox.tsx). The figures are small at
            this size, and the palette is the one thing on the page a guest
            will want to look at closely, so it earns that zoom.

            The tilt is on the FIGURE, not on a wrapper: PlateReveal is a
            motion element and writes its own inline transform, which would
            overwrite a `rotate-*` class set on it. */}
        <figure
          style={{ transform: 'rotate(-1.2deg)' }}
          className="mx-auto w-full rounded-[2px] bg-paper p-3 pb-12 shadow-[0_14px_28px_-6px_color-mix(in_srgb,var(--ink)_50%,transparent),0_2px_5px_color-mix(in_srgb,var(--ink)_30%,transparent)] sm:p-4 sm:pb-14"
        >
          {/* The window is OUTLINED. This artwork is near-white at its edges,
              so against a white mount the print and its border dissolved into
              one another and the polaroid read as a picture with a lot of
              empty space around it rather than as a print in a paper frame.
              A hairline is all it takes to put the edge back.

              A line rather than the Our Story prints' inset shadow: an inset
              box-shadow paints under the element's CONTENT, so an opaque
              image sitting in the window covers it completely. */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`View illustration: ${PLATE_ALT}`}
            className="block w-full cursor-zoom-in overflow-hidden rounded-[1px] border border-ink/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            <MotionImage
              layoutId={reduce ? undefined : photoLayoutId(PLATE_ID)}
              transition={MORPH}
              src={attireGuide}
              alt={PLATE_ALT}
              placeholder="blur"
              className="h-auto w-full"
              sizes="(max-width: 640px) 92vw, min(80vw, 56rem)"
            />
          </button>
          <figcaption className="mt-3 text-center font-script text-subhead leading-tight text-ink">
            our colours
          </figcaption>
        </figure>
      </PlateReveal>

      <PhotoLightbox
        photo={
          open
            ? {
                id: PLATE_ID,
                src: attireGuide.src,
                alt: PLATE_ALT,
                w: attireGuide.width,
                h: attireGuide.height,
                // A wide plate, so the lightbox box is width-bound at every
                // breakpoint rather than capped near 600px like a polaroid.
                sizes: '(max-width: 652px) 92vw, min(92vw, 1600px)',
              }
            : null
        }
        reduce={reduce}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/**
 * The rule that covers everyone, and it closes the run. See AttirePlate on why
 * these are exported.
 *
 * `tone` picks the ground these sit on. The classes have to switch rather than
 * inherit: each line carries its own colour (`text-ink`, and
 * `text-muted-foreground` for the body, which is a mixed-down ink), so a colour
 * set on an ancestor would not reach them.
 */
export function AttireNotes({
  className,
  tone = 'ink',
}: {
  className?: string;
  tone?: 'ink' | 'paper';
}) {
  const onInk = tone === 'paper';
  return (
    <InViewReveal
      delay={BEAT * 2}
      className={cn('mx-auto flex max-w-md flex-col gap-3', className)}
    >
      <p
        className={cn(
          'font-sans text-subhead',
          onInk ? 'text-paper' : 'text-ink',
        )}
      >
        Semi-formal — beach wedding
      </p>
      <p
        className={cn(
          'text-body',
          onInk ? 'text-paper/80' : 'text-muted-foreground',
        )}
      >
        We would love to see you in the colours above — wear one, or mix a
        few.
      </p>
    </InViewReveal>
  );
}

/**
 * One half of the who-wears-what pair: a title, the colours to reach for, and
 * a few sentences on the clothes themselves.
 *
 * The `look` half is PROSE addressed to the guest, not bullets. A dress code
 * set as a list of clipped fragments reads as a packing checklist — the rest
 * of this page is a letter, and this was the one place speaking in telegrams.
 *
 * Men and women get their OWN card rather than two columns on one, because the
 * sheets are the section's layout unit: a two-column block inside a single
 * tilted sheet would set the two halves against each other, and would have to
 * collapse to a stack on a phone anyway.
 *
 * `tone` matches AttireNotes: 'ink' means ink type on paper, 'paper' means
 * paper type on an ink ground. Day Itself lays both cards on INK sheets and so
 * passes 'paper'.
 */
function GuideCard({
  title,
  palette,
  swatches,
  look,
  className,
  tone = 'ink',
}: {
  title: string;
  /** The colours, NAMED — set in caps, so keep it to the names themselves. */
  palette: string;
  /**
   * Optional colour chips shown above the palette line. Decorative: the line
   * underneath names the same colours in words, so a guest who cannot see the
   * chips (or is reading this printed in grey) still gets the instruction.
   * That is also why the row is `aria-hidden` rather than a list of swatches
   * with hex codes read out one by one.
   */
  swatches?: string[];
  /** The clothes, said in a sentence or two. */
  look: string;
  className?: string;
  tone?: 'ink' | 'paper';
}) {
  const onInk = tone === 'paper';

  return (
    <InViewReveal
      delay={BEAT}
      className={cn('mx-auto flex max-w-md flex-col gap-3', className)}
    >
      <h3
        className={cn(
          'font-script text-entry',
          onInk ? 'text-paper' : 'text-ink',
        )}
      >
        {title}
      </h3>
      {/* TWO labelled halves with a rule between them, because they answer
          two different questions: which colours to wear, and what garment to
          wear them as. Unlabelled, the chips and the clothing lines ran
          together as one paragraph of advice and the palette stopped reading
          as a palette. The labels are the same role as the date line in Our
          Story — small, uppercase, wide-tracked — so the card gains structure
          without gaining a second heading typeface. */}
      <p
        className={cn(
          'font-sans text-micro font-medium uppercase tracking-[0.2em]',
          onInk ? 'text-paper/70' : 'text-ink/50',
        )}
      >
        Colours
      </p>
      {swatches ? (
        <div aria-hidden className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {swatches.map((hex) => (
            <span
              key={hex}
              // Hex straight from the couple's palette, so these are inline
              // rather than theme tokens — they are the wedding's colours, not
              // the site's. The hairline ring keeps the palest chips from
              // dissolving into the paper they sit on.
              style={{ backgroundColor: hex }}
              // 40px chips (48 from sm up). Six fit on one line inside the
              // narrowest sheet — 6x40 plus five 8px gaps is 280px against
              // ~315px of inner width on a 390px phone — so the women's seven
              // wrap to a second, centred row there and sit on one line from
              // about 400px up. That wrap is fine BECAUSE the row is centred;
              // a left-aligned row would leave a ragged tail.
              className={cn(
                'size-10 rounded-full ring-1 ring-inset sm:size-12',
                onInk ? 'ring-paper/30' : 'ring-ink/15',
              )}
            />
          ))}
        </div>
      ) : null}
      {/* The uppercase label role, which is why `palette` must stay SHORT — a
          full sentence in caps with this much tracking runs to three lines and
          reads as shouted. Anything beyond naming the colours belongs in
          `look` below. */}
      <p
        className={cn(
          'font-sans text-label font-medium uppercase tracking-[0.16em]',
          onInk ? 'text-paper' : 'text-ink',
        )}
      >
        {palette}
      </p>
      {/* A drawn hairline rather than a border on the list: it is the seam
          between the two halves, so it belongs to neither. */}
      <hr
        className={cn(
          'mt-1 w-full border-0 border-t',
          onInk ? 'border-paper/25' : 'border-ink/15',
        )}
      />
      <p
        className={cn(
          'font-sans text-micro font-medium uppercase tracking-[0.2em]',
          onInk ? 'text-paper/70' : 'text-ink/50',
        )}
      >
        {/* Not "What to wear": that is the section's own title in the lace
            frame above, and a second copy of it inside a card would make the
            heading ambiguous (day-itself.test.tsx guards there being exactly
            one). */}
        The look
      </p>
      <p
        className={cn(
          'text-body',
          onInk ? 'text-paper/80' : 'text-muted-foreground',
        )}
      >
        {look}
      </p>
    </InViewReveal>
  );
}

export function AttireForMen({
  className,
  tone = 'ink',
}: {
  className?: string;
  tone?: 'ink' | 'paper';
}) {
  return (
    <GuideCard
      className={className}
      tone={tone}
      title="For the men"
      palette="Cream or sand"
      swatches={['#f4e3d2', '#eacdb2']}
      look={MEN_LOOK}
    />
  );
}

export function AttireForWomen({
  className,
  tone = 'ink',
}: {
  className?: string;
  tone?: 'ink' | 'paper';
}) {
  return (
    <GuideCard
      className={className}
      tone={tone}
      title="For the women"
      palette="Pastel dusty rose or pastel green"
      swatches={[
        '#c06e75',
        '#e3a5a3',
        '#cc9a97',
        '#bbbba4',
        '#9e9f77',
        '#d0d1b8',
        '#eacdb2',
      ]}
      look={WOMEN_LOOK}
    />
  );
}

/*
 * The `AttireGuide` SECTION has been retired: DayItself carries the "What to
 * wear" title and lays out everything under it, so a second copy below it was
 * the same content twice. This file is deliberately only the exports above —
 * it is where the attire copy lives, not a section. `git log` has the old
 * section if the standalone layout is ever wanted back.
 */
