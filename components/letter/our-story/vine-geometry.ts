export const VINE_ROW = 100;
export const VINE_LEAD = 20;
export const VINE_TAIL = 20;
export const VINE_REACH = { mobile: 50, desktop: 22 } as const;
export const VINE_UNIT_ASPECT = { desktop: 1.6, mobile: 0.55 } as const;

const VINE_DWELL = 0;
const VINE_OPPOSITE = { right: "left", left: "right" } as const;

export const vineSide = (index: number) =>
  index % 2 === 0 ? ("right" as const) : ("left" as const);

const vineX = (reach: number) =>
  ({ right: 50 + reach, left: 50 - reach }) as const;

export const vineHeight = (rows: number) =>
  VINE_LEAD + rows * VINE_ROW + VINE_TAIL;

export function getVineNodes(
  rows: number,
  reach: number,
): Array<[number, number]> {
  const pad = (VINE_ROW * (1 - VINE_DWELL)) / 2;
  const lobe = vineX(reach);

  return [
    [50, 0],
    ...Array.from({ length: rows }, (_, index) => {
      const x = lobe[VINE_OPPOSITE[vineSide(index)]];
      const y = VINE_LEAD + index * VINE_ROW;
      return [
        [x, y + pad],
        [x, y + VINE_ROW - pad],
      ] as Array<[number, number]>;
    }).flat(),
    [50, vineHeight(rows)],
  ];
}

export function buildVinePath(rows: number, reach: number) {
  const nodes = getVineNodes(rows, reach);

  return nodes
    .map(([x, y], index) => {
      if (index === 0) return `M ${x} ${y}`;

      const [previousX, previousY] = nodes[index - 1];
      if (previousX === x) {
        return previousY === y ? "" : `L ${x} ${y}`;
      }

      const bend = (y - previousY) / 2;
      return `C ${previousX} ${previousY + bend} ${x} ${y - bend} ${x} ${y}`;
    })
    .join(" ");
}

/** Cubic Bézier component at t. */
export function cubicBezier(
  a: number,
  b: number,
  c: number,
  d: number,
  t: number,
) {
  const u = 1 - t;
  return (
    u * u * u * a +
    3 * u * u * t * b +
    3 * u * t * t * c +
    t * t * t * d
  );
}

export function vineTangent(
  previousX: number,
  previousY: number,
  nextX: number,
  nextY: number,
  t: number,
) {
  const height = nextY - previousY;
  return {
    dx: 6 * (1 - t) * t * (nextX - previousX),
    dy: 1.5 * height * ((1 - t) * (1 - t) + t * t),
  };
}

export function sprigHeading(
  dx: number,
  dy: number,
  outward: number,
  lift: number,
  box: { w: number; h: number } | null,
  heightUnits: number,
) {
  if (!box) return outward * (90 - lift);

  const tangentX = dx * (box.w / 100);
  const tangentY = dy * (box.h / heightUnits);
  const normalX = outward > 0 ? tangentY : -tangentY;
  const normalY = outward > 0 ? -tangentX : tangentX;
  const angle = (-outward * lift * Math.PI) / 180;
  const vectorX = normalX * Math.cos(angle) - normalY * Math.sin(angle);
  const vectorY = normalX * Math.sin(angle) + normalY * Math.cos(angle);

  return (Math.atan2(vectorX, -vectorY) * 180) / Math.PI;
}
