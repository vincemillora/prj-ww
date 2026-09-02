import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Decorative botanicals for the admin surfaces (/login and /dashboard).
 *
 * These used to be hand-drawn SVG in the imported hi-fi design's own palette:
 * five-petal blossoms built from circle clusters with a gold centre, ellipse
 * leaves, and stems in wisteria and dusty rose — eighty-one hardcoded hexes that
 * appeared nowhere else in the product, and a second illustration style beside
 * the guest letter's.
 *
 * The GEOMETRY is the imported design's and is kept exactly. Every stem below is
 * the run it drew, and the alignment rule under `Corner` still holds: a vine
 * sits ON its component's real border line, never floating near a corner.
 *
 * What changed is the vocabulary. Leaves and blooms are now the letter's own
 * three plants — /florals/rose-bloom.svg, leaf-large.svg and leaf-small.svg, the
 * same assets Our Story grows along its vine — drawn as masked silhouettes, so
 * the colour comes from the call site rather than from the file. That is what
 * lets one vine wear a status lane's pigment while another is a quiet ink
 * watermark, out of one set of art.
 *
 * HOW A SPRIG JOINS ITS STEM — the part that has to be exact, and that the first
 * pass got wrong twice over: sprigs sat at hand-estimated percentages of the
 * frame rather than on the path, and each was centred on its point rather than
 * hung from it. Together that left leaves floating beside a vine they never
 * touched.
 *
 * So the stems are DATA here, not `d` strings. `toPath` draws them and `at`
 * samples them, which means the drawn line and the attachment points cannot
 * drift apart. A placement names a segment and a `t` along it; the sampler
 * returns the point and the tangent there; the plant is hung by its OWN stem
 * point — the pixel where its stalk was cut in the source asset — and rotated so
 * its natural growth direction follows the stem's normal (or its tangent, at a
 * tip). The stem points and bearings are the letter's measured values from
 * components/letter/our-story/vine-art.tsx; do not re-guess them.
 *
 * All of it is decorative: `aria-hidden`, `pointer-events-none`, rendered on the
 * server, no interactivity.
 *
 * CURRENTLY RENDERED: `PageFloralBottomRight` (one page corner, sm and up),
 * `NameSprig` (the masthead), `AccountGarland`, and the two `ColumnVine*` lane
 * frames. `PageFloralTopLeft` and `CardCornerFrame` are kept and exported but
 * nothing draws them: the top-left page corner is where the masthead lives, and
 * the per-card frame needs more room than a phone's 16px gutter has. Both are
 * one line away from returning if the layout ever gives them space.
 */

// ── Stem geometry ──────────────────────────────────────────────────────────

type Pt = readonly [number, number];

type Seg =
  | { k: "L"; a: Pt; b: Pt }
  | { k: "C"; a: Pt; c1: Pt; c2: Pt; b: Pt }
  | { k: "A"; a: Pt; b: Pt; r: number; sweep: 0 | 1 };

const L = (a: Pt, b: Pt): Seg => ({ k: "L", a, b });
const C = (a: Pt, c1: Pt, c2: Pt, b: Pt): Seg => ({ k: "C", a, c1, c2, b });
const A = (a: Pt, b: Pt, r: number, sweep: 0 | 1): Seg => ({ k: "A", a, b, r, sweep });

/** The `d` attribute for one run of segments. */
function toPath(segs: readonly Seg[]) {
  let d = `M${segs[0].a[0]} ${segs[0].a[1]}`;
  for (const s of segs) {
    if (s.k === "L") d += ` L${s.b[0]} ${s.b[1]}`;
    else if (s.k === "C")
      d += ` C${s.c1[0]} ${s.c1[1]} ${s.c2[0]} ${s.c2[1]} ${s.b[0]} ${s.b[1]}`;
    else d += ` A${s.r} ${s.r} 0 0 ${s.sweep} ${s.b[0]} ${s.b[1]}`;
  }
  return d;
}

/**
 * Point and tangent at `t` along one segment, in viewBox units.
 *
 * `A` is sampled as its chord. The only arcs here are the 18-unit quarter turns
 * where a corner frame rounds from one border to the next, and nothing is ever
 * planted on a corner — a leaf there would stand off the outline rather than on
 * it, which is the whole rule.
 */
function at(s: Seg, t: number) {
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

// ── Plants ─────────────────────────────────────────────────────────────────

/**
 * The letter's three plants. `stem` is the fraction of the asset's own box where
 * its stalk was cut — the point that has to land on the vine — and `bearing` is
 * the direction that stalk grows in the untouched art, in degrees clockwise from
 * up. Both are the measured values from the letter's Our Story vine.
 */
const PLANTS = {
  bloom: { src: "/florals/rose-bloom.svg", ratio: 180 / 210, stem: [0.4, 0.65], bearing: 30 },
  leaf: { src: "/florals/leaf-large.svg", ratio: 117 / 84, stem: [0.96, 0.28], bearing: -113 },
  bud: { src: "/florals/leaf-small.svg", ratio: 92 / 87, stem: [0.21, 0.97], bearing: 17 },
} as const;

type Plant = keyof typeof PLANTS;

type Place = {
  plant: Plant;
  /** Which run of the spray's stems. 0 is the main run; the rest are offshoots. */
  run?: number;
  /** Which segment inside that run, and where along it. */
  seg: number;
  t: number;
  /** Width in viewBox units. Height follows the asset's own ratio. */
  w: number;
  /**
   * Which side of the stem the plant grows out of: 1 is the left-hand normal in
   * screen coordinates, -1 the right-hand one. Omit at a tip, where the plant
   * carries on along the tangent instead of standing off the side.
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
 * One pressed botanical, in three spans, and each level earns its place.
 *
 * The OUTER span is the attachment point: it is positioned on the stem, sized to
 * the sprig's width so the middle span has a percentage to resolve against, and
 * rotated about its own top-left corner (`transform-origin: 0 0`) so the point
 * on the vine is the pivot.
 *
 * The MIDDLE span offsets the art so the plant's stem point lands on that pivot.
 * When mirrored, the stem point moves to `1 - x`, because `scaleX(-1)` is applied
 * before the translate in a CSS transform list.
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
  point: { x: number; y: number; tx: number; ty: number };
  /** The frame's viewBox, so a sprig can turn units into percentages. */
  box: readonly [number, number];
  index: number;
}) {
  const plant = PLANTS[place.plant];
  const [bw, bh] = box;

  const len = Math.hypot(point.tx, point.ty) || 1;
  const ux = point.tx / len;
  const uy = point.ty / len;

  // Growth direction: a stem normal, or the tangent itself at a tip.
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
    const r = (place.lift * Math.PI) / 180;
    const rx = gx * Math.cos(r) - gy * Math.sin(r);
    const ry = gx * Math.sin(r) + gy * Math.cos(r);
    gx = rx;
    gy = ry;
  }

  // Degrees clockwise from up, which is what CSS `rotate()` speaks.
  const heading = Math.atan2(gx, -gy) * DEG;
  const mirrored = place.flip ?? place.side === -1;
  const angle = mirrored ? heading + plant.bearing : heading - plant.bearing;
  const stemX = mirrored ? 1 - plant.stem[0] : plant.stem[0];

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
        <span
          className="wind-rustle block size-full bg-current"
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

type SvgProps = { className?: string; style?: CSSProperties };

/**
 * A spray: the stem runs drawn as one SVG, with the plants hung off them.
 *
 * Two layers rather than one, because a masked silhouette is an HTML box and
 * cannot live inside `<svg>`. The frame is always positioned by its caller —
 * that is what puts the stem on a border line — so it is the containing block
 * for its own sprigs.
 */
function Spray({
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
        {runs.map((run, i) => (
          // The main run is the one the component is anchored by; the short
          // offshoots that carry a single bud are drawn a third lighter.
          //
          // `non-scaling-stroke` because the same art renders at three very
          // different sizes — a 300px page corner, a 230px column vine, a 170px
          // card corner — and a scaled stroke came out at 1.2px on the column
          // and vanished. The letter's Our Story vine does the same.
          <path
            key={toPath(run)}
            d={toPath(run)}
            strokeWidth={i === 0 ? 1.6 : 1.1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {places.map((place, index) => {
        const run = runs[place.run ?? 0];
        return (
          <Sprig
            key={`${place.plant}-${place.run ?? 0}-${place.seg}-${place.t}`}
            place={place}
            point={at(run[place.seg], place.t)}
            box={box}
            index={index}
          />
        );
      })}
    </div>
  );
}

// ── Page corners ───────────────────────────────────────────────────────────
// The dashboard's ground is white, so these are the quietest ink in the ladder
// at low opacity — a watermark pressed into the page, not a second thing to look
// at. They are decorative only and sit well under any text threshold on purpose.
// (/login stands on the letter's drapery instead and carries no spray at all;
// the photograph is already the ornament.)

const PAGE_TL_BOX = [340, 340] as const;
const PAGE_TL_RUNS = [
  // The long stem down from the corner.
  [
    C([8, 8], [70, 40], [108, 96], [128, 168]),
    C([128, 168], [136, 198], [140, 232], [138, 262]),
  ],
  // Three berry branches, each an out-and-back loop with its tip at the far end
  // of the first segment.
  [C([128, 168], [150, 150], [186, 148], [214, 160]), C([214, 160], [182, 170], [150, 176], [128, 168])],
  [C([108, 116], [130, 96], [168, 92], [196, 102]), C([196, 102], [166, 116], [132, 128], [108, 116])],
  [C([92, 74], [112, 56], [146, 52], [172, 60]), C([172, 60], [146, 74], [116, 84], [92, 74])],
] as const;
const PAGE_TL_PLACES: readonly Place[] = [
  { plant: "bloom", run: 1, seg: 0, t: 1, w: 62 },
  { plant: "bloom", run: 2, seg: 0, t: 1, w: 52 },
  { plant: "bud", run: 3, seg: 0, t: 1, w: 34 },
  { plant: "leaf", run: 0, seg: 0, t: 0.45, w: 46, side: -1, lift: 26 },
  { plant: "bud", run: 0, seg: 0, t: 0.72, w: 30, side: 1, lift: 22 },
  { plant: "leaf", run: 0, seg: 1, t: 0.3, w: 42, side: -1, lift: 24 },
  { plant: "bud", run: 0, seg: 1, t: 1, w: 32 },
];

export function PageFloralTopLeft({ className, style }: SvgProps) {
  return (
    <Spray
      box={PAGE_TL_BOX}
      runs={PAGE_TL_RUNS}
      places={PAGE_TL_PLACES}
      className={
        className ??
        // Hidden on phones (the mobile layout uses a single top-right spray);
        // tablet shows a 240px version, desktop the full 340px. Quieter than its
        // linen-ground ancestor: on white this sits directly behind the masthead,
        // and anything above ~0.25 reads as a smudge under the couple's name.
        "absolute -top-[30px] -left-[40px] hidden h-[240px] w-[240px] text-ink-faint opacity-25 md:block lg:-top-[46px] lg:-left-[58px] lg:h-[340px] lg:w-[340px]"
      }
      style={style}
    />
  );
}

const PAGE_BR_BOX = [300, 300] as const;
const PAGE_BR_RUNS = [
  [
    C([292, 292], [232, 258], [190, 200], [168, 132]),
    C([168, 132], [158, 102], [152, 70], [152, 42]),
  ],
  [C([168, 132], [146, 150], [112, 152], [86, 142]), C([86, 142], [114, 130], [146, 122], [168, 132])],
  [C([182, 182], [160, 200], [126, 204], [100, 194]), C([100, 194], [130, 180], [160, 170], [182, 182])],
] as const;
const PAGE_BR_PLACES: readonly Place[] = [
  { plant: "bloom", run: 1, seg: 0, t: 1, w: 56 },
  { plant: "bloom", run: 2, seg: 0, t: 1, w: 46 },
  { plant: "bud", run: 0, seg: 1, t: 1, w: 30 },
  { plant: "leaf", run: 0, seg: 0, t: 0.35, w: 42, side: 1, lift: 26 },
  { plant: "leaf", run: 0, seg: 0, t: 0.72, w: 38, side: 1, lift: 22 },
  { plant: "bud", run: 0, seg: 1, t: 0.45, w: 28, side: -1, lift: 20 },
];

export function PageFloralBottomRight({ className, style }: SvgProps) {
  return (
    <Spray
      box={PAGE_BR_BOX}
      runs={PAGE_BR_RUNS}
      places={PAGE_BR_PLACES}
      className={
        className ??
        // Explicit box: the frame is an HTML div whose children are all
        // absolutely positioned, so with `width: auto` it shrink-wraps to zero
        // and `aspect-ratio` has no definite side to resolve against — the spray
        // silently rendered at 0×0. Give it a definite side (either an explicit
        // height, as the column vines do, or both, as here).
        "absolute -right-[46px] -bottom-[52px] hidden h-[300px] w-[300px] -scale-x-100 text-ink-faint opacity-25 lg:block"
      }
      style={style}
    />
  );
}

// ── Nameplate sprig ────────────────────────────────────────────────────────
// Ink, not the watermark tone: this one is a companion to the couple's script
// name, and a mark set beside type has to be written in the same hand as it.

const NAME_BOX = [58, 30] as const;
const NAME_RUNS = [[C([2, 15], [14, 15], [20, 8], [27, 8])]] as const;
const NAME_PLACES: readonly Place[] = [
  { plant: "bloom", seg: 0, t: 1, w: 26 },
  { plant: "leaf", seg: 0, t: 0.3, w: 20, side: -1, lift: 30 },
  { plant: "bud", seg: 0, t: 0.62, w: 14, side: 1, lift: 24 },
];

export function NameSprig({ className }: SvgProps) {
  return (
    <Spray
      box={NAME_BOX}
      runs={NAME_RUNS}
      places={NAME_PLACES}
      // Inline beside the name rather than pinned to a border, so this is the
      // one spray that positions itself.
      className={cn("relative h-[30px] w-[58px] shrink-0 text-ink", className)}
    />
  );
}

// ── Account chip garland ───────────────────────────────────────────────────

const GARLAND_BOX = [207, 76] as const;
const GARLAND_RUNS = [
  [C([189, 24], [196, 42], [186, 56], [163, 59.5]), L([163, 59.5], [57, 60])],
] as const;
const GARLAND_PLACES: readonly Place[] = [
  { plant: "bloom", seg: 0, t: 0, w: 26, back: true, flip: true },
  { plant: "leaf", seg: 0, t: 0.6, w: 20, side: -1, lift: 24 },
  { plant: "leaf", seg: 1, t: 0.18, w: 20, side: -1, lift: 26 },
  { plant: "bud", seg: 1, t: 0.34, w: 14, side: 1, lift: 22 },
  { plant: "leaf", seg: 1, t: 0.5, w: 19, side: -1, lift: 26 },
  { plant: "bud", seg: 1, t: 0.66, w: 14, side: 1, lift: 22 },
  { plant: "leaf", seg: 1, t: 0.82, w: 18, side: -1, lift: 26 },
  { plant: "bloom", seg: 1, t: 1, w: 24, flip: true },
];

export function AccountGarland({ className }: SvgProps) {
  return (
    <Spray
      box={GARLAND_BOX}
      runs={GARLAND_RUNS}
      places={GARLAND_PLACES}
      className={
        // Right-anchored: the arc was drawn around the chip's right edge (the
        // chip is a fixed width in the design but ours grows with the admin's
        // name), so pinning the right side keeps the wreath on the outline.
        className ??
        "absolute -top-4 -right-[21px] z-5 hidden h-[76px] w-[207px] text-ink-faint opacity-45 lg:block"
      }
    />
  );
}

// ── Corner frames ──────────────────────────────────────────────────────────

export type Corner = "tl" | "tr" | "bl" | "br";

/**
 * STRICT ALIGNMENT RULE — vine stems sit exactly ON the component outline.
 * The spray art's stems are inset 42/420 (10%) of the art's HEIGHT from both
 * edges it hugs (the right stem is 42 viewBox units in, and the rendered width
 * is height × 360/420, so that inset is also 10% of the height in px). Shifting
 * the rendered frame by -10% of its own height therefore puts the stem line
 * precisely on the border. Fixed-height frames: 230px column → -23px, 170px card
 * corner → -17px. Do not eyeball these — recompute (height × 0.1).
 *
 * A frame that has to FOLLOW its component's height cannot use a px offset at
 * all, and the imported design's `-42px` with `h-[calc(100%+84px)]` only landed
 * on the border for a card exactly 336px tall. The relationship that holds at
 * every height is proportional: frame = 125% of the component, offset = 12.5%
 * of the component (because 0.1 × 125% = 12.5%). The horizontal offset is a
 * translate of 11.667% of the frame's OWN width, since a percentage `right`
 * would resolve against the component's width instead of the frame's height.
 */
const FOLLOW_TR = "absolute -top-[12.5%] right-0 h-[125%] w-auto translate-x-[11.667%]";
const FOLLOW_BL = "absolute -bottom-[12.5%] left-0 h-[125%] w-auto -translate-x-[11.667%]";

const SPRAY_BOX = [360, 420] as const;

// Top edge runs left→right at y=42, then a quarter turn, then the right edge
// runs top→bottom at x=318. Nothing is planted on the turn.
const SPRAY_TR_RUNS = [
  [L([112, 42], [300, 42]), A([300, 42], [318, 60], 18, 1), L([318, 60], [318, 372])],
  [C([200, 42], [198, 30], [204, 22], [214, 18])],
  [C([318, 150], [330, 148], [338, 142], [342, 132])],
  [C([318, 268], [330, 266], [338, 260], [342, 250])],
  [C([150, 42], [146, 32], [148, 24], [156, 20])],
] as const;

// On the top edge the tangent runs +x, so side 1 is the upward normal (out of
// the component); on the right edge the tangent runs +y, so side -1 is the
// outward one. Every leaf leans toward the tip via `lift`, which is what keeps
// the run reading as one growing plant instead of a comb.
const SPRAY_TR_PLACES: readonly Place[] = [
  { plant: "leaf", run: 0, seg: 0, t: 0.1, w: 40, side: 1, lift: 34 },
  { plant: "bud", run: 0, seg: 0, t: 0.24, w: 26, side: -1, lift: 26 },
  { plant: "bloom", run: 0, seg: 0, t: 0.36, w: 50, side: 1, lift: 22 },
  { plant: "leaf", run: 0, seg: 0, t: 0.52, w: 38, side: 1, lift: 34 },
  { plant: "bud", run: 0, seg: 0, t: 0.64, w: 24, side: -1, lift: 26 },
  { plant: "leaf", run: 0, seg: 0, t: 0.78, w: 36, side: 1, lift: 30 },
  { plant: "bloom", run: 0, seg: 0, t: 0.92, w: 44, side: 1, lift: 18 },
  { plant: "bloom", run: 0, seg: 2, t: 0.08, w: 46, side: -1, lift: 22 },
  { plant: "leaf", run: 0, seg: 2, t: 0.2, w: 38, side: -1, lift: 32 },
  { plant: "bud", run: 0, seg: 2, t: 0.3, w: 26, side: 1, lift: 26 },
  { plant: "leaf", run: 0, seg: 2, t: 0.4, w: 36, side: -1, lift: 30 },
  { plant: "bloom", run: 0, seg: 2, t: 0.52, w: 44, side: -1, lift: 20 },
  { plant: "leaf", run: 0, seg: 2, t: 0.64, w: 36, side: -1, lift: 32 },
  { plant: "bud", run: 0, seg: 2, t: 0.74, w: 24, side: 1, lift: 26 },
  { plant: "leaf", run: 0, seg: 2, t: 0.86, w: 34, side: -1, lift: 30 },
  { plant: "bud", run: 1, seg: 0, t: 1, w: 24 },
  { plant: "bud", run: 2, seg: 0, t: 1, w: 24 },
  { plant: "bud", run: 3, seg: 0, t: 1, w: 24 },
  { plant: "bud", run: 4, seg: 0, t: 1, w: 22 },
  // The run's two open ends, so neither stops as a bare cut line.
  { plant: "bud", run: 0, seg: 0, t: 0, w: 30, back: true },
  { plant: "bud", run: 0, seg: 2, t: 1, w: 30 },
];

export function CardSprayTopRight({ className }: SvgProps) {
  return (
    <Spray
      box={SPRAY_BOX}
      runs={SPRAY_TR_RUNS}
      places={SPRAY_TR_PLACES}
      className={className ?? cn(FOLLOW_TR, "z-6 text-ink-faint opacity-70")}
    />
  );
}

// The mirror: left edge top→bottom at x=42, quarter turn, bottom edge
// left→right at y=378.
const SPRAY_BL_RUNS = [
  [L([42, 60], [42, 360]), A([42, 360], [60, 378], 18, 0), L([60, 378], [248, 378])],
  [C([42, 210], [30, 208], [22, 202], [18, 192])],
  [C([42, 300], [30, 298], [22, 292], [18, 282])],
  [C([160, 378], [158, 390], [164, 398], [174, 402])],
  [C([210, 378], [208, 390], [214, 398], [224, 402])],
] as const;

const SPRAY_BL_PLACES: readonly Place[] = [
  { plant: "bloom", run: 0, seg: 0, t: 0.08, w: 46, side: 1, lift: 22 },
  { plant: "leaf", run: 0, seg: 0, t: 0.2, w: 38, side: 1, lift: 32 },
  { plant: "bud", run: 0, seg: 0, t: 0.3, w: 26, side: -1, lift: 26 },
  { plant: "leaf", run: 0, seg: 0, t: 0.4, w: 36, side: 1, lift: 30 },
  { plant: "bloom", run: 0, seg: 0, t: 0.52, w: 44, side: 1, lift: 20 },
  { plant: "leaf", run: 0, seg: 0, t: 0.64, w: 36, side: 1, lift: 32 },
  { plant: "bud", run: 0, seg: 0, t: 0.74, w: 24, side: -1, lift: 26 },
  { plant: "leaf", run: 0, seg: 0, t: 0.86, w: 34, side: 1, lift: 30 },
  { plant: "leaf", run: 0, seg: 2, t: 0.1, w: 40, side: -1, lift: 34 },
  { plant: "bud", run: 0, seg: 2, t: 0.24, w: 26, side: 1, lift: 26 },
  { plant: "bloom", run: 0, seg: 2, t: 0.36, w: 50, side: -1, lift: 22 },
  { plant: "leaf", run: 0, seg: 2, t: 0.52, w: 38, side: -1, lift: 34 },
  { plant: "bud", run: 0, seg: 2, t: 0.64, w: 24, side: 1, lift: 26 },
  { plant: "leaf", run: 0, seg: 2, t: 0.78, w: 36, side: -1, lift: 30 },
  { plant: "bud", run: 1, seg: 0, t: 1, w: 24 },
  { plant: "bud", run: 2, seg: 0, t: 1, w: 24 },
  { plant: "bud", run: 3, seg: 0, t: 1, w: 24 },
  { plant: "bud", run: 4, seg: 0, t: 1, w: 22 },
  // The run's two open ends, so neither stops as a bare cut line.
  { plant: "bud", run: 0, seg: 0, t: 0, w: 30, back: true, flip: true },
  { plant: "bud", run: 0, seg: 2, t: 1, w: 30, flip: true },
];

export function CardSprayBottomLeft({ className }: SvgProps) {
  return (
    <Spray
      box={SPRAY_BOX}
      runs={SPRAY_BL_RUNS}
      places={SPRAY_BL_PLACES}
      className={className ?? cn(FOLLOW_BL, "z-6 text-ink-faint opacity-70")}
    />
  );
}

/**
 * Per-column vine for the kanban board. Each takes its own lane's pigment, so
 * the ornament says the same thing the lane does instead of being decoration
 * laid over it. Attending has NO vine — an explicit decision after the
 * full-outline attempts failed review.
 */
export function ColumnVineBottomLeft() {
  return (
    <CardSprayBottomLeft className="pointer-events-none absolute -bottom-[23px] -left-[23px] z-0 h-[230px] w-auto text-(--pending-ink) opacity-40" />
  );
}

// Declined runs a step quieter than Awaiting at the same size. Not a luminance
// correction — measured against their own washes the two pigments are within
// 0.03 of each other (1.83 vs 1.86 at opacity 40). It is placement: this frame's
// dense corner cluster lands beside the lane title and its rule, where Awaiting's
// sits in empty space at the bottom of the lane.
export function ColumnVineTopRight() {
  return (
    <CardSprayTopRight className="pointer-events-none absolute -top-[23px] -right-[23px] z-0 h-[230px] w-auto text-(--declined-ink) opacity-30" />
  );
}

/**
 * Card-scale corner frame for one guest card (the mobile list): the stem traces
 * two edges of one rounded corner, on the card's border line. Built by flipping
 * the top-right / bottom-left art; the caller cycles the corner per item so the
 * vine walks around the stack.
 */
export function CardCornerFrame({ corner }: { corner: Corner }) {
  const bottom = corner === "bl" || corner === "br";
  const flipX = corner === "tl" || corner === "br";
  // 170px, not the design's 128: a real botanical silhouette needs about twice
  // the size a filled ellipse did before the individual leaf reads. Offsets stay
  // height × 0.1 per the alignment rule above.
  const pos = {
    tl: "-top-[17px] -left-[17px]",
    tr: "-top-[17px] -right-[17px]",
    bl: "-bottom-[17px] -left-[17px]",
    br: "-bottom-[17px] -right-[17px]",
  }[corner];
  const cls = cn(
    // Quiet ink rather than a lane pigment: these sit on white cards inside
    // whichever tab is open, so a lane colour here would follow the card around
    // and stop meaning anything.
    "pointer-events-none absolute z-0 h-[170px] w-auto text-ink-faint opacity-70",
    pos,
    flipX && "-scale-x-100",
  );
  return bottom ? <CardSprayBottomLeft className={cls} /> : <CardSprayTopRight className={cls} />;
}
