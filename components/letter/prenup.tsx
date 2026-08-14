import { SectionHeading } from '@/components/letter/section-heading';
import { PrenupMosaic, type Shot } from '@/components/letter/prenup-gallery';

/**
 * Prenup gallery — EDGE-TO-EDGE paper section between Our Story and DayItself,
 * and the first paper ground after the opening's ink. DayItself follows as
 * another plain paper section, so the seam between them is invisible.
 *
 * It used to pull itself up `-mt-48` BEHIND Our Story's bottom dome and clear
 * the curve again with `pt-dome`. Our Story has no dome now (see our-story.tsx),
 * so both are gone: a plain `pt-section` and ordinary flow. Leaving the overlap
 * in place would have slid this paper section up under a section that no longer
 * paints a background — the paper would have shown straight through.
 *
 * Layout: a photo mosaic — bare images, no frame, no rounding, no shadow, no
 * caption, and no horizontal padding, so it runs to both screen edges. Every
 * tile is the SAME HEIGHT (a fixed `grid-auto-rows`); tiles differ only in
 * WIDTH, and landscape shots take two columns. 2 columns on phones, 4 from `sm`
 * up, 6px gutter. Because heights are uniform there is no masonry packing and
 * nothing needs measuring. This file stays a server component that does the
 * slot-budget math; the grid itself lives in `prenup-gallery.tsx` (client),
 * because tiles are clickable — a tap morphs the photo into a centered
 * lightbox via motion's shared `layoutId`.
 *
 * The mosaic is capped at 2 rows on desktop and 3 on mobile, so it stays a band
 * in the letter rather than an endless wall. The cap is a budget of column
 * slots (cols x rows) that each shot spends 1 of, or 2 if it's landscape — see
 * `fittingCount`. A shot beyond the budget is NOT rendered, so adding a seventh
 * shot below does nothing until the row cap goes up. `grid-flow-row-dense`
 * keeps a 2-column tile from leaving a hole in the column beside it.
 *
 * Photos are placeholders: seeded picsum stand-ins (same approach as
 * `our-story.tsx`) so each slot keeps its image between loads. Drop real files
 * in `/public/prenup/`, point `image` at them, and set `w`/`h` to the file's
 * real pixel size — that is what decides whether it takes one column or two.
 * Unset `image` falls back to the striped placeholder. The seeded host is
 * allowed by `next.config.ts`; `MotionImage` keeps the shared lightbox
 * transition while routing the files through Next.js image optimization.
 */

// Slot costs run [1, 2, 1, 1, 1, 2]: the first five spend the mobile budget of
// 6 exactly, and all six spend the desktop budget of 8 exactly — so both
// breakpoints come out as full rectangles with no gaps.
const SHOTS: Shot[] = [
  { alt: 'the first look', w: 900, h: 1100, image: 'https://picsum.photos/seed/ww-prenup-1/900/1100' },
  { alt: 'rain again', w: 1400, h: 900, image: 'https://picsum.photos/seed/ww-prenup-2/1400/900' },
  { alt: 'the long walk', w: 900, h: 1100, image: 'https://picsum.photos/seed/ww-prenup-3/900/1100' },
  { alt: 'golden hour', w: 900, h: 1350, image: 'https://picsum.photos/seed/ww-prenup-4/900/1350' },
  { alt: 'borrowed bicycle', w: 900, h: 1100, image: 'https://picsum.photos/seed/ww-prenup-5/900/1100' },
  { alt: 'one more, promise', w: 1500, h: 1000, image: 'https://picsum.photos/seed/ww-prenup-6/1500/1000' },
];

/** Column count and row cap per breakpoint. Must match the grid's Tailwind classes. */
const MOBILE = { cols: 2, rows: 3 };
const DESKTOP = { cols: 4, rows: 2 };

/** A landscape shot occupies two columns, so it costs two slots of the budget. */
function slotCost(shot: Shot) {
  return shot.w > shot.h ? 2 : 1;
}

/** How many leading shots fit in `cols * rows` column slots. */
function fittingCount({ cols, rows }: { cols: number; rows: number }) {
  const budget = cols * rows;
  let spent = 0;
  let count = 0;
  for (const shot of SHOTS) {
    const cost = slotCost(shot);
    if (spent + cost > budget) break;
    spent += cost;
    count += 1;
  }
  return count;
}

const MOBILE_COUNT = fittingCount(MOBILE);
const DESKTOP_COUNT = fittingCount(DESKTOP);

// Rendered once and trimmed per breakpoint in CSS (`max-sm:hidden`), so the
// count never depends on JS and nothing shifts on load.
const VISIBLE = SHOTS.slice(0, Math.max(MOBILE_COUNT, DESKTOP_COUNT));

export function Prenup() {
  return (
    <section id="prenup" className="relative z-0 bg-paper pt-section">
      <Heading />

      <PrenupMosaic shots={VISIBLE} mobileCount={MOBILE_COUNT} />
    </section>
  );
}

function Heading() {
  return (
    <SectionHeading
      className="px-gutter"
      title="Before the day"
      kicker="Our prenup shoot — photos coming soon"
    />
  );
}
