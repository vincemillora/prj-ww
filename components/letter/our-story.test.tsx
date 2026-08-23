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
  it("uses lace 15 for both border bands", () => {
    const { container } = render(<OurStory />);

    expect(container.querySelectorAll("[data-slot='our-story-lace']")).toHaveLength(2);
    expect(container.innerHTML).toContain("Untitled-1%20%5BRecovered%5D-15.svg");
  });

  it("crops lace 15 to its complete repeat tile", () => {
    const lace15 = readFileSync(
      resolve(process.cwd(), "public/laces/Untitled-1 [Recovered]-15.svg"),
      "utf8",
    );

    expect(lace15).toContain('viewBox="31 82.8 94 42"');
  });
});
