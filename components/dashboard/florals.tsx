import { cn } from "@/lib/utils";
import { Spray, type SvgProps } from "@/components/dashboard/florals/spray";
import { A, C, L, type Place } from "@/components/dashboard/florals/stem-geometry";

/**
 * Decorative botanicals for the admin surfaces.
 *
 * These used to be hand-drawn SVG in the imported hi-fi design's own palette:
 * five-petal blossoms built from circle clusters with a gold centre, ellipse
 * leaves, and stems in wisteria and dusty rose — eighty-one hardcoded hexes that
 * appeared nowhere else in the product, and a second illustration style beside
 * the guest letter's.
 *
 * The GEOMETRY is the imported design's and is kept exactly: every stem below is
 * a run it drew, and each frame is offset so that run lands on its component's
 * real border line (see the alignment rule under `FOLLOW_TR`).
 *
 * The vocabulary is the letter's. Leaves and blooms are its own three plants —
 * /florals/rose-bloom.svg, leaf-large.svg and leaf-small.svg, the same assets
 * Our Story grows — drawn as masked silhouettes, so colour comes from the call
 * site: a lane vine wears that lane's pigment while a page corner is a quiet ink
 * watermark, out of one set of art.
 *
 * The maths that hangs a plant on a stem lives in `florals/stem-geometry.ts`,
 * with tests; `florals/spray.tsx` renders it. This file is composition only —
 * which run goes where, and which plant sits at which point along it.
 */

// ── Page corner ────────────────────────────────────────────────────────────
// The dashboard's ground is white, so this is the quietest ink in the ladder at
// low opacity — a watermark pressed into the page, not a second thing to look
// at. Decorative only, and deliberately under any text threshold.
//
// There is ONE, bottom-right. The imported design also put a spray in the
// top-left corner and a mirrored one at the phone's top-right; on this page that
// corner is the masthead, and at any usable opacity the blooms crossed the
// letterforms of the couple's name and of "Manage RSVP". `NameSprig` is the
// botanical up there instead — sized for type, and set in the same ink.

const PAGE_BR_BOX = [300, 300] as const;
const PAGE_BR_RUNS = [
  [
    C([292, 292], [232, 258], [190, 200], [168, 132]),
    C([168, 132], [158, 102], [152, 70], [152, 42]),
  ],
  // Two berry branches, each an out-and-back loop with its tip at the far end
  // of the first segment.
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
        // silently rendered at 0×0.
        //
        // The offsets are small because this layer clips: a stem may run off the
        // page, but a bloom cut in half by the clip edge reads as broken art. At
        // 16/20px only the stem's tail crosses. Phones get no page spray at all,
        // since a 16px gutter has nowhere to put outward-growing leaves.
        "absolute -right-[16px] -bottom-[20px] hidden h-[300px] w-[300px] -scale-x-100 text-ink-faint opacity-25 sm:block"
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

// ── Lane vines ─────────────────────────────────────────────────────────────

/**
 * STRICT ALIGNMENT RULE — vine stems sit exactly ON the component outline.
 * The spray art's stems are inset 42/420 (10%) of the art's HEIGHT from both
 * edges it hugs (the right stem is 42 viewBox units in, and the rendered width
 * is height × 360/420, so that inset is also 10% of the height in px). Shifting
 * the rendered frame by -10% of its own height therefore puts the stem line
 * precisely on the border. A 230px lane frame → -23px offsets. Do not eyeball
 * these — recompute (height × 0.1).
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

// `side` here is the SCREEN-space normal (y down): on the top edge, whose
// tangent runs +x, side 1 is the downward normal and side -1 the upward one; on
// the right edge, tangent +y, they swap. The alternation between them is what
// gives the run leaves on both faces of the stem rather than a one-sided comb,
// and `lift` leans each one along the run so no sprig stands square to it.
// These values are tuned against the render, not derived — change one and look.
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
