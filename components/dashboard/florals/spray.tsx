import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  at,
  orient,
  PLANTS,
  toPath,
  type Place,
  type Sample,
  type Seg,
} from "@/components/dashboard/florals/stem-geometry";

export type SvgProps = { className?: string; style?: CSSProperties };

/**
 * One pressed botanical, in three spans, and each level earns its place.
 *
 * The OUTER span is the attachment point: positioned on the stem, sized to the
 * sprig's width so the middle span has a percentage to resolve against, and
 * rotated about its own top-left corner (`transform-origin: 0 0`) so the point
 * on the vine is the pivot.
 *
 * The MIDDLE span offsets the art so the plant's stem point lands on that pivot.
 *
 * The INNER span carries `wind-rustle`, and it has to be its own element: those
 * keyframes set `transform`, which REPLACES an inline transform outright rather
 * than composing with it. On a single span every sprig lost both its offset and
 * its angle the instant the animation started.
 */
function Sprig({
  place,
  point,
  box,
  index,
}: {
  place: Place;
  point: Sample;
  /** The frame's viewBox, so a sprig can turn units into percentages. */
  box: readonly [number, number];
  index: number;
}) {
  const plant = PLANTS[place.plant];
  const [bw, bh] = box;
  const { angle, stemX, mirrored } = orient(place, point);
  const mask = `url('${plant.src}')`;

  return (
    <span
      className="absolute"
      style={{
        left: `${(point.x / bw) * 100}%`,
        top: `${(point.y / bh) * 100}%`,
        width: `${(place.w / bw) * 100}%`,
        transform: `rotate(${angle.toFixed(2)}deg)`,
        transformOrigin: "0 0",
      }}
    >
      <span
        className="absolute top-0 left-0 block w-full"
        style={{
          aspectRatio: plant.ratio,
          transform: `translate(${-stemX * 100}%, ${-plant.stem[1] * 100}%)${
            mirrored ? " scaleX(-1)" : ""
          }`,
        }}
      >
        {/* Every other sprig rustles.

            The dashboard renders 58 of these, and animating all of them meant
            58 infinite compositor animations for pure decoration. Alternating
            halves that at no visual cost — at four degrees over three seconds
            the difference between a moving leaf and a still one is not
            legible, and a spray where some of it holds still reads more like a
            plant than one that breathes as a block.

            `wind-rustle` is disabled under `prefers-reduced-motion` in
            app/globals.css, so this needs no second guard. */}
        <span
          className={cn("block size-full bg-current", index % 2 === 0 && "wind-rustle")}
          style={{
            maskImage: mask,
            WebkitMaskImage: mask,
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskPosition: "center",
            WebkitMaskPosition: "center",
            animationDelay: `${(index % 6) * 0.42}s`,
            animationDuration: `${3.3 + (index % 4) * 0.35}s`,
          }}
        />
      </span>
    </span>
  );
}

/**
 * A spray: the stem runs drawn as one SVG, with the plants hung off them.
 *
 * Two layers rather than one, because a masked silhouette is an HTML box and
 * cannot live inside `<svg>`. The frame is always positioned by its caller —
 * that is what puts the stem on a border line — so it is the containing block
 * for its own sprigs.
 */
export function Spray({
  box,
  runs,
  places,
  className,
  style,
}: SvgProps & {
  box: readonly [number, number];
  runs: readonly (readonly Seg[])[];
  places: readonly Place[];
}) {
  const [w, h] = box;
  const paths: ReactNode[] = runs.map((run, i) => {
    const d = toPath(run);
    return (
      // The main run is the one the component is anchored by; the short
      // offshoots that carry a single bud are drawn a third lighter.
      //
      // `non-scaling-stroke` because the same art renders at very different
      // sizes — a 300px page corner, a 230px lane vine — and a scaled stroke
      // came out at 1.2px on the lane and vanished. The letter's Our Story vine
      // does the same.
      <path
        key={d}
        d={d}
        strokeWidth={i === 0 ? 1.6 : 1.1}
        vectorEffect="non-scaling-stroke"
      />
    );
  });

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      style={{ aspectRatio: `${w} / ${h}`, ...style }}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 size-full overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
      >
        {paths}
      </svg>
      {places.map((place, index) => (
        <Sprig
          key={`${place.plant}-${place.run ?? 0}-${place.seg}-${place.t}`}
          place={place}
          point={at(runs[place.run ?? 0][place.seg], place.t)}
          box={box}
          index={index}
        />
      ))}
    </div>
  );
}
