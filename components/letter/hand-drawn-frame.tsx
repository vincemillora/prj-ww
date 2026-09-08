import { cn } from '@/lib/utils';

/**
 * The hand-drawn card outline, from `public/icons/_library/hand_drawn/wedding/
 * Frame_1.svg`. Both paths below are that file's single path, verbatim — once
 * whole, and once split at its second subpath (see the paper note further
 * down). No coordinate was redrawn.
 *
 * Frame_2 was tried here and reverted. Worth knowing why, so it is not tried
 * again by accident: Frame_2 is a double line whose strokes are INSET from the
 * artwork's edges (~8.4% horizontally, ~9% vertically), so the cards had to
 * carry extra padding just to keep their content off the line — and because
 * that inset is a proportion of the box, the padding needed differed per card
 * and was a fixed value standing in for a proportional one. Frame_1's line sits
 * on the artwork's edge, which is why it drops straight into the place a CSS
 * border used to occupy and needs no padding of its own.
 *
 * INLINE rather than an `<Image>` for one reason: colour. The library asset is
 * hardcoded `#3a3b3a`, a cool grey that is not the letter's `--ink` (#2c2a1b,
 * espresso olive). An `<img>` cannot read a CSS variable from the page, so a
 * served copy of the file would have to hardcode the token's value into the
 * asset. Inlined, the fill is `currentColor` and the frame simply inherits
 * `text-ink` from the card, like every other ink stroke in the letter.
 *
 * `preserveAspectRatio="none"` is deliberate, and was chosen by rendering it.
 * The obvious tool for a frame is `border-image` with a corner slice, which
 * keeps corners undistorted and stretches only the edges. That was tried and
 * it looks WORSE here: this drawing's character lives in the wobble along its
 * edges and in the small flick at each corner, and 9-slicing flattens every
 * edge middle into a dead-straight line (`stretch`) or tiles it with visible
 * seams (`round`). Stretching the whole drawing keeps the wobble and the
 * corner flicks; because the frame is a thin ring, the distortion reads as more
 * hand-drawn irregularity rather than as a squashed shape. It holds to roughly
 * 2:1 — past that the horizontal and vertical stroke weights visibly diverge.
 *
 * The path spans nearly its whole viewBox, so at `inset-0` the stroke lands on
 * the card's real edge. That is the point: this REPLACES a `border-2
 * border-ink`, so it has to sit exactly where that border sat, not float inside
 * it.
 *
 * It also carries the card's PAPER. The library path is a closed ring — an
 * outer contour and an inner one, filled with a hole between them — and the
 * inner contour on its own is exactly the shape the frame encloses. Filling
 * that with paper means the card's white stops at the drawn line instead of at
 * a rectangle, so the slivers outside the wobble (and outside the corner
 * flicks) stay transparent and whatever the card sits on shows through. A
 * `bg-paper` on the card box cannot do this: it would paint the full rectangle,
 * including the corners the drawing deliberately cuts away.
 *
 * Consequence for the caller: this layer is OPAQUE, so it must sit behind the
 * card's content. It carries `-z-10`, which needs the card to be an `isolate`d
 * stacking context — without that the negative index escapes the card and the
 * paper disappears behind the section instead.
 */
export function HandDrawnFrame({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      // `absolute inset-0 size-full` so the frame is laid over the card's own
      // box without taking part in its layout — the card keeps the padding it
      // had when it drew a CSS border. `-z-10` puts it behind the content; see
      // the note above about the card needing `isolate`.
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 size-full',
        className,
      )}
      viewBox="0 0 603 611.2"
      preserveAspectRatio="none"
    >
      {/* The inner contour alone — the card's paper, clipped to the drawn
          outline. First, so the ink ring below paints over its edge. */}
      <path fill="var(--paper)" d="M561.2,26c-2.3-5.1-1.1-11.9-5.1-15.6-9.5-4.7-21.6-1.3-32-2.7-29.4-2.1-58.7-2-88.2-.7-78.2,4.6-156.7-1.2-234.9,4.5-39.8,2.2-79.5,3.3-119.3,4.9-15.2,2.1-31.7-8.8-36.3,11.8C8.5,81.9,3.9,7.8,7,119c2.5,126.3,2.6,252.6,5.5,378.9.7,13.7.3,27.5-.4,41.2-.8,6.7,2.3,12.4,9.3,13.5,12.2,3.2,22.8,9.7,30,19.9,8,8.4,8.5,20.4,13.5,29.6,24.9,6,52.8,2.3,78.4,2.5,47.7-.5,95.3-5,143-4.1,51.2,2,102.5,4.3,153.8,2,33.3-1,66.6-2.1,99.9-1.8,14.9.7,12.2-22.8,23.5-30.7,5.8-6.3,12.7-11.6,20.7-14.2,3.6-1.1,7.9-2,10.2-5.1,2.2-2.9,1.9-7.8,1.8-11.6-.2-22.2-.4-44.1-.3-66.3-.9-66.3,1.3-132.6-4.4-198.7-2.9-67.4,5.4-135,.4-202.4,3.2-35.7-19.8-17.1-30.9-45.6v-.2q0,0,0,0Z" />
      {/* The ring itself: both contours, so the hole between them is what gets
          inked. `currentColor`, hence the card's `text-ink`. */}
      <path fill="currentColor" d="M517.6,1.5c13.5.8,28-.5,41.4,1.8,11.9,5.3-1.3,27.7,26.2,38.1,10.7,3.6,13.8,3.4,11.1,17,.2,13.3,2.3,26.9,2.7,40.1,2.7,64.4-5.2,128.9,0,193.3,6.4,85.3,1.4,171.3,3.8,256.7,3.2,20.3-34.2,1.5-45.9,47.8-2.7,13.8-7.6,9.3-19,9.3-27,.6-54,2.2-81.1,2.1-58,3.5-116.5,1.2-174.5-1.1-46.3-.6-92.6,3.2-138.9,4.1-22.7.7-45.5.8-68.1-.4-24,1.6-15.3-11.2-23.9-26.5-7.5-15.9-23.3-24.9-40.2-27.3-7.2-2.1-3.5-9.2-4.3-15.3-.3-18.2.3-36.8-.9-55-1.8-114.1-3.2-228.1-4.6-342.3.2-31.6-3.5-64.6.6-95.8,1-1.5,2.5-2.1,4.4-2.3,20,1.7,31.2-13.7,38.4-30.1,9.2-9.4,26-2.5,37.8-4.6,22.1-.8,44.3-2.8,66.4-3.1,47.9-1,95.5-6.3,143.4-5.1,37.9,0,75.8.7,113.8-.4,37-1.5,74.4-4.2,111.4-1h.2ZM561.2,26c-2.3-5.1-1.1-11.9-5.1-15.6-9.5-4.7-21.6-1.3-32-2.7-29.4-2.1-58.7-2-88.2-.7-78.2,4.6-156.7-1.2-234.9,4.5-39.8,2.2-79.5,3.3-119.3,4.9-15.2,2.1-31.7-8.8-36.3,11.8C8.5,81.9,3.9,7.8,7,119c2.5,126.3,2.6,252.6,5.5,378.9.7,13.7.3,27.5-.4,41.2-.8,6.7,2.3,12.4,9.3,13.5,12.2,3.2,22.8,9.7,30,19.9,8,8.4,8.5,20.4,13.5,29.6,24.9,6,52.8,2.3,78.4,2.5,47.7-.5,95.3-5,143-4.1,51.2,2,102.5,4.3,153.8,2,33.3-1,66.6-2.1,99.9-1.8,14.9.7,12.2-22.8,23.5-30.7,5.8-6.3,12.7-11.6,20.7-14.2,3.6-1.1,7.9-2,10.2-5.1,2.2-2.9,1.9-7.8,1.8-11.6-.2-22.2-.4-44.1-.3-66.3-.9-66.3,1.3-132.6-4.4-198.7-2.9-67.4,5.4-135,.4-202.4,3.2-35.7-19.8-17.1-30.9-45.6v-.2q0,0,0,0Z" />
    </svg>
  );
}

/**
 * The same drawing as HandDrawnFrame, but 9-SLICED instead of stretched — for a
 * box far from the artwork's own proportions.
 *
 * Why a second technique rather than a prop on the first: stretching a thin
 * ring is fine while the box stays near the drawing's own 0.99, which is true
 * of the cards. It is not true of a whole section. The Day Itself section runs
 * ~0.81 wide-to-tall on a desktop and ~0.18 on a phone, and at 0.18 stretching
 * fails in two visible ways at once — the horizontal strokes are scaled 3.1x
 * while the vertical ones are scaled 0.58x, so the top and bottom read several
 * times heavier than the sides, and the corner flicks smear into long swooping
 * curves.
 *
 * 9-slicing pins the four corners at their drawn size and extends only the
 * straight runs between them, which is what a longer frame actually wants: the
 * lines get longer, the corners stay themselves, and the stroke weight stays
 * even on all four sides at any aspect.
 *
 * `stretch`, not `round` or `repeat`: the edge runs are near-straight, so
 * stretching them is invisible, whereas both tiling modes put a visible seam
 * every repeat down the long sides. All three were rendered at this section's
 * real mobile and desktop boxes before choosing.
 *
 * The border-image source has to be a FILE rather than the inlined path the
 * other component uses, which costs two things:
 *   - The asset needs intrinsic `width`/`height`. The library file carries only
 *     a viewBox, and without real dimensions the slice units are undefined and
 *     the edge slices render completely BLANK — corners only, no lines. That is
 *     the whole reason `public/icons/hand_drawn/wedding/frame-1.svg` exists as
 *     a separate, sized copy.
 *   - `currentColor` cannot reach it, so that copy hardcodes `--ink`'s value
 *     (#2c2a1b) in place of the library asset's grey. If the ink token moves,
 *     that file has to move with it.
 *
 * It carries the PAPER too, clipped to the outline, so the caller must not put
 * a background on the framed box: a `bg-paper` there is a plain rectangle, and
 * against a dark ground you see its straight edge cutting across the drawing's
 * wobble and squaring off the corner flicks.
 *
 * The paper is a SECOND sliced layer under the ink one, sourced from
 * `frame-1-paper.svg` — the artwork's inner contour alone, filled. Its `fill`
 * keyword is what paints the middle (border-image normally draws only the nine
 * edge and corner slices and leaves the centre empty), while its corner and
 * edge slices carry the contour itself, so the paper's boundary is the drawing's
 * boundary at any aspect. Same trick as the card frame's paper path, moved into
 * an asset because border-image takes a URL rather than markup.
 *
 * Two things to know if that asset is ever regenerated:
 *   - Like the ink copy it needs intrinsic `width`/`height`, or the slices are
 *     undefined and nothing renders.
 *   - Its fill hardcodes `--paper`'s value (#ffffff), for the same reason the
 *     ink copy hardcodes `--ink`'s: `currentColor` cannot reach a URL.
 *
 * `border-width` sets how big the corners are drawn. It is a fixed length, so
 * it does not track the box: 40px reads right across this section's range, and
 * would want revisiting for a very different box.
 */
export function HandDrawnFrameLong({
  className,
  tone = 'paper',
}: {
  className?: string;
  /**
   * Which way round the sheet reads: `paper` is an ink line on a paper fill,
   * `ink` inverts it to a paper line on an ink fill, matching the ink cards
   * elsewhere in the letter.
   *
   * Both layers switch together, and they HAVE to. `currentColor` cannot reach
   * either of them — border-image takes a URL, so every colour here is baked
   * into an asset. Setting `text-paper` on the caller does nothing; leaving the
   * ink fill with the ink line drew ink on ink and the frame vanished
   * completely, which is how this was found.
   */
  tone?: 'paper' | 'ink';
}) {
  const fill =
    tone === 'ink'
      ? '[border-image:url(/icons/hand_drawn/wedding/frame-1-paper-ink.svg)_60_fill_stretch]'
      : '[border-image:url(/icons/hand_drawn/wedding/frame-1-paper.svg)_60_fill_stretch]';
  const line =
    tone === 'ink'
      ? '[border-image:url(/icons/hand_drawn/wedding/frame-1-line-paper.svg)_60_stretch]'
      : '[border-image:url(/icons/hand_drawn/wedding/frame-1.svg)_60_stretch]';
  // Both layers need the SAME border width, or the paper's boundary and the
  // drawing's boundary are sliced at different scales and stop coinciding.
  const slice = 'absolute inset-0 border-[28px] sm:border-[40px]';
  return (
    <div
      aria-hidden
      data-slot="hand-drawn-frame-long"
      data-tone={tone}
      className={cn('pointer-events-none absolute inset-0 -z-10', className)}
    >
      <div className={cn(slice, fill)} />
      <div className={cn(slice, line)} />
    </div>
  );
}
