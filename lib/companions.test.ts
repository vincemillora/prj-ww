import { describe, expect, it } from "vitest";
import {
  companionDietary,
  companionLabel,
  companionsToText,
  sortCompanions,
  type CompanionSummary,
} from "@/lib/companions";

const kid: CompanionSummary = {
  kind: "kid",
  position: 1,
  name: "Nino",
  dietary: [],
  dietaryOther: null,
};

const adult: CompanionSummary = {
  kind: "adult",
  position: 2,
  name: "Marites Reyes",
  dietary: ["vegan", "nut_allergy"],
  dietaryOther: null,
};

describe("companion display helpers", () => {
  it("labels positions consistently", () => {
    expect(companionLabel("adult", 2)).toBe("Adult 2");
    expect(companionLabel("kid", 1)).toBe("Kid 1");
  });

  it("sorts adults before kids without mutating the input", () => {
    const input = [kid, adult];
    expect(sortCompanions(input)).toEqual([adult, kid]);
    expect(input).toEqual([kid, adult]);
  });

  it("formats restrictions and flat export text", () => {
    expect(companionDietary(adult)).toBe("Vegan, Nut allergy");
    expect(companionsToText([kid, adult])).toBe(
      "Adult 2: Marites Reyes [Vegan; Nut allergy]; Kid 1: Nino",
    );
  });
});
