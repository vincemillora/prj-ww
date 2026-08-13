import { describe, expect, it } from "vitest";

import {
  VINE_LEAD,
  VINE_ROW,
  VINE_TAIL,
  buildVinePath,
  getVineNodes,
  vineHeight,
} from "@/components/letter/our-story/vine-geometry";

describe("story vine geometry", () => {
  it("keeps the lead, one row per memory, and the tail in sync", () => {
    expect(vineHeight(5)).toBe(VINE_LEAD + 5 * VINE_ROW + VINE_TAIL);
  });

  it("alternates lobes away from each memory", () => {
    expect(getVineNodes(3, 22)).toEqual([
      [50, 0],
      [28, 70],
      [28, 70],
      [72, 170],
      [72, 170],
      [28, 270],
      [28, 270],
      [50, 340],
    ]);
  });

  it("builds one continuous cubic path through non-coincident nodes", () => {
    expect(buildVinePath(2, 22)).toBe(
      "M 50 0 C 50 35 28 35 28 70  C 28 120 72 120 72 170  C 72 205 50 205 50 240",
    );
  });
});
