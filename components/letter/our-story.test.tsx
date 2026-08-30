import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("motion/react", () => ({
  motion: { div: "div" },
  useReducedMotion: () => true,
}));

vi.mock("@/components/letter/photo-lightbox", () => ({
  PhotoLightbox: () => null,
}));
vi.mock("@/components/letter/section-heading", () => ({
  SectionHeading: () => null,
}));
vi.mock("@/components/letter/our-story/memories", () => ({
  MEMORIES: [],
}));
vi.mock("@/components/letter/our-story/story-art", () => ({
  CameraCharm: () => null,
  InkCharm: () => null,
  Polaroid: () => null,
}));
vi.mock("@/components/letter/our-story/vine-art", () => ({
  Vine: () => null,
  VineFlorals: () => null,
}));
vi.mock("@/components/letter/our-story/vine-geometry", () => ({
  VINE_REACH: { mobile: 0, desktop: 0 },
  VINE_UNIT_ASPECT: { mobile: 0, desktop: 0 },
  vineSide: () => "left",
}));

import { OurStory } from "@/components/letter/our-story";

describe("OurStory", () => {
  it("uses the latest lace 15 asset for both border bands", () => {
    const { container } = render(<OurStory />);

    expect(container.querySelectorAll("[data-slot='our-story-lace']")).toHaveLength(2);
    expect(container.innerHTML).toContain(
      "Untitled-1%20%5BRecovered%5D-15.svg?v=3",
    );
  });

  it("uses the complete seven-motif lace strip to minimize repeat seams", () => {
    const lace15 = readFileSync(
      resolve(process.cwd(), "public/laces/Untitled-1 [Recovered]-15.svg"),
      "utf8",
    );

    expect(lace15).toContain('viewBox="31 82.8 658 42"');
  });

  it("bridges the solid strip edges so repeated masks do not show a hairline", () => {
    const lace15 = readFileSync(
      resolve(process.cwd(), "public/laces/Untitled-1 [Recovered]-15.svg"),
      "utf8",
    );
    const svg = new DOMParser().parseFromString(lace15, "image/svg+xml");

    expect(
      svg.querySelector("[data-seam-bridge]")?.getAttribute("d"),
    ).toBe(
      "M30.6 94h.8v12h-.8zM30.6 109.4h.8v3.2h-.8zM30.6 122.8h.8v2.2h-.8zM688.6 94h.8v12h-.8zM688.6 109.4h.8v3.2h-.8zM688.6 122.8h.8v2.2h-.8z",
    );
  });
});
