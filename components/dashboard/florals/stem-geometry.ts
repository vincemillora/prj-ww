/**
 * The stem geometry the admin's botanicals hang off.
 *
 * A vine is described as DATA rather than as a `d` string, and that is the
 * whole point: `toPath` renders the segments and `at` samples them, so the line
 * that gets drawn and the points the plants attach to come from one source and
 * cannot drift apart. An earlier version hand-estimated attachment points as
 * percentages of the frame, and every leaf floated beside a stem it never
 * touched.
 *
 * Units are viewBox units of whichever frame owns the run.
 */

export type Pt = readonly [number, number];

export type Seg =
  | { k: "L"; a: Pt; b: Pt }
  | { k: "C"; a: Pt; c1: Pt; c2: Pt; b: Pt }
  | { k: "A"; a: Pt; b: Pt; r: number; sweep: 0 | 1 };

export const L = (a: Pt, b: Pt): Seg => ({ k: "L", a, b });
export const C = (a: Pt, c1: Pt, c2: Pt, b: Pt): Seg => ({ k: "C", a, c1, c2, b });
export const A = (a: Pt, b: Pt, r: number, sweep: 0 | 1): Seg => ({ k: "A", a, b, r, sweep });

/** The `d` attribute for one run of segments. */
export function toPath(segs: readonly Seg[]) {
  let d = `M${segs[0].a[0]} ${segs[0].a[1]}`;
  for (const s of segs) {
    if (s.k === "L") d += ` L${s.b[0]} ${s.b[1]}`;
    else if (s.k === "C")
      d += ` C${s.c1[0]} ${s.c1[1]} ${s.c2[0]} ${s.c2[1]} ${s.b[0]} ${s.b[1]}`;
    else d += ` A${s.r} ${s.r} 0 0 ${s.sweep} ${s.b[0]} ${s.b[1]}`;
  }
  return d;
}

export type Sample = { x: number; y: number; tx: number; ty: number };

/**
 * Point and tangent at `t` along one segment.
 *
 * `A` is sampled as its chord. The only arcs here are the 18-unit quarter turns
 * where a corner frame rounds from one border onto the next, and nothing is ever
 * planted on a corner — a leaf there would stand off the outline rather than on
 * it, which is the rule the whole system exists to keep.
 */
export function at(s: Seg, t: number): Sample {
  if (s.k === "C") {
    const u = 1 - t;
    const p = (a: number, b: number, c: number, d: number) =>
      u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
    const dp = (a: number, b: number, c: number, d: number) =>
      3 * u * u * (b - a) + 6 * u * t * (c - b) + 3 * t * t * (d - c);
    return {
      x: p(s.a[0], s.c1[0], s.c2[0], s.b[0]),
      y: p(s.a[1], s.c1[1], s.c2[1], s.b[1]),
      tx: dp(s.a[0], s.c1[0], s.c2[0], s.b[0]),
      ty: dp(s.a[1], s.c1[1], s.c2[1], s.b[1]),
    };
  }
  return {
    x: s.a[0] + (s.b[0] - s.a[0]) * t,
    y: s.a[1] + (s.b[1] - s.a[1]) * t,
    tx: s.b[0] - s.a[0],
    ty: s.b[1] - s.a[1],
  };
}

/**
 * The guest letter's three plants — the same assets Our Story grows along its
 * vine. `stem` is the fraction of the asset's own box where its stalk was cut,
 * i.e. the point that has to land on the vine, and `bearing` is the direction
 * that stalk grows in the untouched art, in degrees clockwise from up. Both are
 * the measured values from components/letter/our-story/vine-art.tsx; they
 * describe the artwork, so do not re-guess them.
 */
export const PLANTS = {
  bloom: { src: "/florals/rose-bloom.svg", ratio: 180 / 210, stem: [0.4, 0.65], bearing: 30 },
  leaf: { src: "/florals/leaf-large.svg", ratio: 117 / 84, stem: [0.96, 0.28], bearing: -113 },
  bud: { src: "/florals/leaf-small.svg", ratio: 92 / 87, stem: [0.21, 0.97], bearing: 17 },
} as const;

export type Plant = keyof typeof PLANTS;

export type Place = {
  plant: Plant;
  /** Which run of the spray's stems. 0 is the main run; the rest are offshoots. */
  run?: number;
  /** Which segment inside that run, and where along it. */
  seg: number;
  t: number;
  /** Width in viewBox units. Height follows the asset's own ratio. */
  w: number;
  /**
   * Which side of the stem the plant grows out of, in SCREEN coordinates where
   * y points down: 1 is the right-hand side of travel (so, downward on a run
   * heading right), -1 the left. Omit at a tip, where the plant carries on
   * along the tangent instead of standing off the side.
   */
  side?: 1 | -1;
  /**
   * Grow against the direction of travel. A run that simply stops mid-air reads
   * as a cut line rather than as a plant, so every open end carries one sprig
   * pointing back out of it — which needs the tangent reversed at `t: 0`.
   */
  back?: boolean;
  /** Degrees of lean toward the tip, so a sprig is never square to its stem. */
  lift?: number;
  /** Mirrors the art. Defaults to the -1 side, which is what looks grown. */
  flip?: boolean;
};

const DEG = 180 / Math.PI;

/**
 * How one plant is oriented where it meets the stem: the CSS rotation in
 * degrees, and the horizontal stem fraction to offset by (which moves to
 * `1 - x` when the art is mirrored, because `scaleX(-1)` is applied before the
 * translate in a CSS transform list).
 */
export function orient(place: Place, point: Sample) {
  const plant = PLANTS[place.plant];
  const len = Math.hypot(point.tx, point.ty) || 1;
  const ux = point.tx / len;
  const uy = point.ty / len;

  // Growth direction: a stem normal, the tangent at a tip, or its reverse at an
  // open end.
  let gx = ux;
  let gy = uy;
  if (place.side) {
    gx = place.side > 0 ? -uy : uy;
    gy = place.side > 0 ? ux : -ux;
  } else if (place.back) {
    gx = -ux;
    gy = -uy;
  }
  if (place.lift) {
    const r = place.lift / DEG;
    const rx = gx * Math.cos(r) - gy * Math.sin(r);
    const ry = gx * Math.sin(r) + gy * Math.cos(r);
    gx = rx;
    gy = ry;
  }

  // Degrees clockwise from up, which is what CSS `rotate()` speaks.
  const heading = Math.atan2(gx, -gy) * DEG;
  const mirrored = place.flip ?? place.side === -1;
  const angle = mirrored ? heading + plant.bearing : heading - plant.bearing;
  return {
    // Normalised to (-180, 180]. Without it a growth vector with a negative
    // zero component (which happens on every axis-aligned run) comes out of
    // atan2 as -180 rather than 180, and the same rotation is reported as -210
    // in one place and 150 in another.
    angle: ((((angle + 180) % 360) + 360) % 360) - 180,
    stemX: mirrored ? 1 - plant.stem[0] : plant.stem[0],
    mirrored,
  };
}
