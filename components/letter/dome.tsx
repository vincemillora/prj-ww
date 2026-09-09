import { cn } from '@/lib/utils';

/**
 * The dome — the letter's one curved section seam.
 *
 * A full-bleed band flush with a section's TOP edge, painting the colour of the
 * section ABOVE (`className` is the fill, e.g. `bg-paper`). The section it sits
 * in is `relative`; the dome is `absolute` and paints over that section's
 * background. `direction` says which way the arch points:
 *
 *     <Dome direction="down"  className="bg-paper" />  // paper hangs into the section
 *     <Dome direction="up"    className="bg-paper" />  // the section rises into the paper
 *     <Dome direction="crown" className="bg-paper" />  // the section rises OVER the one above
 *
 * `down` and `up` are the SAME half-ellipse — `50%` of the width across,
 * `--dome-ry` deep — but they are not the same object, and this is the part
 * that is easy to get wrong:
 *
 *   - `down` is the ellipse DRAWN in the fill: a border radius rounds the band's
 *     two bottom corners away, leaving the paper bulging into the section.
 *   - `up` is the ellipse CUT OUT of the fill: the band is a full rectangle of
 *     paper with the arch masked out of its bottom edge, so the section's own
 *     ground shows through the hole and reads as rising into the paper.
 *
 * Flipping `down` with a transform gives an arch of the WRONG colour — a paper
 * dome standing on the section instead of the section standing in the paper.
 * The arch is always the lower section's ground; only the surround is the fill.
 * That matters here because the section below is the opening backdrop's photo,
 * not a flat colour: a hole shows the photo, whereas any painted arch could
 * only ever approximate it.
 *
 * `crown` is the third case, and the one to reach for when the section ABOVE is
 * a photograph rather than a flat colour. `down` and `up` are both a band of
 * OPAQUE fill sitting inside this section, so the fill has to match the
 * neighbour exactly — against artwork, a flat mean tone reads as a seam. `crown`
 * inverts the problem: it is the half-ellipse ALONE, drawn in this section's own
 * ground and parked just past its top edge, with nothing at all painted around
 * it. The surround is therefore the real section above, photo and all, and no
 * colour has to be matched.
 *
 * A crown asks three things of its neighbours, and drops on the floor without
 * them: the section drawing it needs `relative` and must not clip its overflow
 * VERTICALLY, its title block needs `mt-crown-under` (see below), and the
 * section above needs `pb-dome` so its content clears the arch standing in its
 * lower margin. Clipping the x axis alone is fine and Location does it, to
 * contain a thrown card; `overflow-y` or the `overflow` shorthand would behead
 * the arch.
 *
 * DEPTH is `--dome-ry`, declared once in app/globals.css — 7rem, the shallow
 * ~4rem hero curve on `sm`+ — and shared by all three directions, because an
 * arch's interior reads as empty ground whichever way it points. The clearances
 * derive from it there: `--spacing-dome` for the `pt-dome` on a section
 * receiving a `down` arch, and `--spacing-crown-under` for the `mt-crown-under`
 * on the title block of one drawing a `crown`. Retune the depth in that one
 * place and the arch and both clearances follow; this file declaring its own
 * copy is what used to let them drift apart. The one clearance that does NOT
 * follow is `--spacing-crown-over`, the room above a crown in the section it
 * stands in — that is set by what that section's content needs.
 *
 * THE SEAM is why the box is a pixel taller than the curve. An arch always
 * meets a neighbouring surface along its one flat edge, and both boxes land on
 * fractional positions — the section tops here sit at .953125, .328125 and so
 * on, because every padding above them is a `clamp()` of rems. Two boxes
 * rasterising independently from a fractional boundary can round to different
 * device pixels, and the hairline that opens between them shows the ground
 * BEHIND the arch: dark ink under the RSVP's white dome, the photograph under
 * Location's paper crown. It is intermittent by nature, appearing only at the
 * scroll offsets where the two edges happen to round apart.
 *
 * That pixel is spent entirely on the FLAT edge, pushing it into the neighbour
 * so no rounding can separate them — upwards for `down` and `up`, downwards for
 * `crown`. The curve never sees it: the radius stays `--dome-ry`, so the arch
 * keeps its depth and its apex does not move. Spending it on the radius instead
 * would deepen the arch past the clearances derived from `--dome-ry`, and the
 * title would start riding into the curve.
 */
export function Dome({
  direction = 'down',
  className,
}: {
  /** Which way the arch points. See the note above — these are not mirrors. */
  direction?: 'down' | 'up' | 'crown';
  /** The fill for the band AROUND the arch — a `bg-*` utility, e.g. `bg-paper`. */
  className?: string;
}) {
  // The hard-edged half-ellipse, sat on the bottom edge of the band. The two
  // stops are 0.5% apart rather than coincident: a truly hard stop renders with
  // a visibly jagged edge in Chrome, and this is under half a pixel of feather.
  const arch =
    'radial-gradient(50% var(--dome-ry) at 50% 100%, transparent 99.5%, #000 100%)';

  return (
    <div
      aria-hidden
      className={cn(
        // The `+1px` is the seam overlap — see THE SEAM above. It is written
        // out literally here, and in the two offsets below, because Tailwind
        // reads these class names out of the source text and a composed string
        // would generate nothing.
        'pointer-events-none absolute inset-x-0 h-[calc(var(--dome-ry)+1px)]',
        // Where that pixel goes. `down` and `up` are bands inside the section,
        // so their flat edge is the top one and it overlaps the section ABOVE;
        // `crown` is the arch alone, standing in the margin of the section
        // above, so its flat edge is the bottom one and it overlaps the section
        // BELOW — the one drawing it.
        direction === 'crown' ? 'bottom-[calc(100%-1px)]' : '-top-px',
        direction === 'down' &&
          'rounded-[0_0_50%_50%_/_0_0_var(--dome-ry)_var(--dome-ry)]',
        direction === 'crown' &&
          'rounded-[50%_50%_0_0_/_var(--dome-ry)_var(--dome-ry)_0_0]',
        className
      )}
      style={
        direction === 'up'
          ? { maskImage: arch, WebkitMaskImage: arch }
          : undefined
      }
    />
  );
}
