"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { InkCharm } from "@/components/letter/our-story/story-art";
import {
  VINE_LEAD,
  VINE_ROW,
  VINE_TAIL,
  VINE_UNIT_ASPECT,
  buildVinePath,
  cubicBezier,
  getVineNodes,
  sprigHeading,
  vineHeight,
  vineSide,
  vineTangent,
} from "@/components/letter/our-story/vine-geometry";
import { cn } from "@/lib/utils";

const VINE_OPPOSITE = { right: "left", left: "right" } as const;
const VINE_FLATTEN_STEPS = 48;
const SPRIGS_PER_ROW = 3;

type Sprig = {
  src: string;
  aspect: string;
  stem: { x: number; y: number };
  bearing: number;
};

const BLOOM: Sprig = {
  src: "/florals/rose-bloom.svg",
  aspect: "aspect-[180/210]",
  stem: { x: 0.4, y: 0.65 },
  bearing: 30,
};
const LEAF_LARGE: Sprig = {
  src: "/florals/leaf-large.svg",
  aspect: "aspect-[117/84]",
  stem: { x: 0.96, y: 0.28 },
  bearing: -113,
};
const LEAF_SMALL: Sprig = {
  src: "/florals/leaf-small.svg",
  aspect: "aspect-[92/87]",
  stem: { x: 0.21, y: 0.97 },
  bearing: 17,
};

const SPRIG_CYCLE: Array<{ sprig: Sprig; w: string; lift: number }> = [
  { sprig: BLOOM, w: "w-10 sm:w-14 lg:w-[4.5rem]", lift: 38 },
  { sprig: LEAF_LARGE, w: "w-8 sm:w-12 lg:w-16", lift: 22 },
  { sprig: LEAF_SMALL, w: "w-7 sm:w-9 lg:w-11", lift: 8 },
  { sprig: BLOOM, w: "w-8 sm:w-11 lg:w-14", lift: 22 },
  { sprig: LEAF_SMALL, w: "w-7 sm:w-10 lg:w-12", lift: 34 },
  { sprig: LEAF_LARGE, w: "w-8 sm:w-11 lg:w-14", lift: 4 },
];

export function Vine({
  rows,
  reach,
  className,
}: {
  rows: number;
  reach: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 100 ${vineHeight(rows)}`}
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute inset-0 size-full overflow-visible",
        className,
      )}
    >
      <path
        d={buildVinePath(rows, reach)}
        fill="none"
        stroke="var(--paper)"
        strokeWidth={3}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

type VinePoint = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  at: number;
};

function plantSprigs(rows: number, reach: number, unitAspect: number) {
  const height = vineHeight(rows);
  const nodes = getVineNodes(rows, reach);
  const walk: VinePoint[] = [];
  let run = 0;

  for (let index = 1; index < nodes.length; index++) {
    const [previousX, previousY] = nodes[index - 1];
    const [nextX, nextY] = nodes[index];
    if (previousX === nextX && previousY === nextY) continue;

    const bend = (nextY - previousY) / 2;
    for (let step = 0; step <= VINE_FLATTEN_STEPS; step++) {
      const t = step / VINE_FLATTEN_STEPS;
      const x = cubicBezier(previousX, previousX, nextX, nextX, t);
      const y = cubicBezier(
        previousY,
        previousY + bend,
        nextY - bend,
        nextY,
        t,
      );
      const last = walk.at(-1);
      if (last) run += Math.hypot((x - last.x) * unitAspect, y - last.y);
      walk.push({
        x,
        y,
        ...vineTangent(previousX, previousY, nextX, nextY, t),
        at: run,
      });
    }
  }

  const usable = walk.filter(
    (point) =>
      point.y > VINE_LEAD * 2 && point.y < height - VINE_TAIL * 2,
  );
  const count = rows * SPRIGS_PER_ROW;
  const from = usable[0]?.at ?? 0;
  const span = (usable.at(-1)?.at ?? 0) - from;
  const interval = span / count;
  let cursor = 0;

  return Array.from({ length: count }, (_, index) => {
    const target = from + interval * (index + 0.5);
    while (
      cursor < usable.length - 1 &&
      usable[cursor + 1].at < target
    ) {
      cursor++;
    }
    return usable[cursor];
  }).filter(Boolean);
}

export function VineFlorals({
  rows,
  reach,
  edgeZone = 0,
  unitAspect = VINE_UNIT_ASPECT.desktop,
  className,
}: {
  rows: number;
  reach: number;
  unitAspect?: number;
  edgeZone?: number;
  className?: string;
}) {
  const height = vineHeight(rows);
  const reduce = !!useReducedMotion();
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height: measuredHeight } = entry.contentRect;
      setBox({ w: width, h: measuredHeight });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // ResizeObserver updates the rendered-box angle only. The flattened path is
  // invariant for a breakpoint, so avoid rebuilding it on that state update.
  const planted = useMemo(
    () => plantSprigs(rows, reach, unitAspect),
    [rows, reach, unitAspect],
  );

  return (
    <div
      ref={boxRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-10", className)}
    >
      {planted.map(({ x, y, dx, dy }, index) => {
        const { sprig, w, lift } = SPRIG_CYCLE[index % SPRIG_CYCLE.length];
        const row = Math.min(
          rows - 1,
          Math.max(0, Math.floor((y - VINE_LEAD) / VINE_ROW)),
        );
        const away = VINE_OPPOSITE[vineSide(row)] === "left" ? -1 : 1;
        const margin = away < 0 ? x : 100 - x;
        const outward = margin < edgeZone ? -away : away;
        const mirrored = outward > 0;
        const heading = sprigHeading(
          dx,
          dy,
          outward,
          lift,
          box,
          height,
        );
        const angle =
          heading - (mirrored ? -sprig.bearing : sprig.bearing);
        const stemX = mirrored ? 1 - sprig.stem.x : sprig.stem.x;

        return (
          <motion.span
            key={`${x}-${y}`}
            className="absolute"
            initial={reduce ? undefined : { opacity: 0 }}
            whileInView={reduce ? undefined : { opacity: 1 }}
            viewport={{ once: false, margin: "-9% 0px -9% 0px" }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            style={{
              left: `${x}%`,
              top: `${(y / height) * 100}%`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "0 0",
            }}
          >
            <InkCharm
              src={sprig.src}
              className={cn("absolute", sprig.aspect, w)}
              style={{
                transform: `translate(${-stemX * 100}%, ${-sprig.stem.y * 100}%)${mirrored ? " scaleX(-1)" : ""}`,
              }}
            />
          </motion.span>
        );
      })}
    </div>
  );
}
