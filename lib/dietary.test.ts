import { describe, expect, it } from "vitest";
import { dietaryLabel, dietaryList } from "@/lib/dietary";

describe("dietary display helpers", () => {
  it("maps current and retired keys and trims free text", () => {
    expect(dietaryList(["shellfish", "vegan"], "  No pork  ")).toEqual([
      "Shellfish",
      "Vegan",
      "No pork",
    ]);
  });

  it("falls back to the stored key when no label is known", () => {
    expect(dietaryLabel("sesame")).toBe("sesame");
  });

  it("omits blank free text", () => {
    expect(dietaryList(null, "   ")).toEqual([]);
  });
});
