import { PrenupScrollGallery, type Shot } from '@/components/letter/prenup-gallery';

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
 * Layout: a scroll-linked horizontal gallery presented as one continuous dark
 * 35mm film strip. The perforated rails and exposure marks run to both screen
 * edges while every image keeps its natural aspect ratio at a shared height.
 * The gallery pins to the viewport as vertical page progress translates the
 * strip sideways. This file stays a server component while the scrolling
 * gallery lives in `prenup-gallery.tsx` (client); a tap morphs the photo into a
 * centered lightbox via motion's shared `layoutId`.
 *
 * Photo spaces stay visible while the final images are pending. Drop real files
 * in `/public/prenup/`, point `image` at them, and set `w`/`h` to the file's
 * real pixel size so the strip can preserve its proportions.
 */

const SHOTS: Shot[] = [
  { alt: 'the first look', w: 900, h: 1100 },
  { alt: 'rain again', w: 1400, h: 900 },
  { alt: 'the long walk', w: 900, h: 1100 },
  { alt: 'golden hour', w: 900, h: 1350 },
  { alt: 'borrowed bicycle', w: 900, h: 1100 },
  { alt: 'one more, promise', w: 1500, h: 1000 },
];

export function Prenup() {
  return (
    <section id="prenup" className="relative z-0 bg-paper pt-section">
      <PrenupScrollGallery shots={SHOTS} />
    </section>
  );
}
