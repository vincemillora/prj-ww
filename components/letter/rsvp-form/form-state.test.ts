import { describe, expect, it } from "vitest";
import {
  buildCompanionFields,
  buildFallbackSummary,
  getCapacityMessage,
  getMissingRsvpFields,
} from "@/components/letter/rsvp-form/form-state";

describe("buildCompanionFields", () => {
  it("keeps the invitee as adult one and creates stable companion slugs", () => {
    expect(buildCompanionFields(3, 2)).toEqual([
      { slug: "adult-2", label: "Adult 2", kind: "adult" },
      { slug: "adult-3", label: "Adult 3", kind: "adult" },
      { slug: "kid-1", label: "Kid 1", kind: "kid" },
      { slug: "kid-2", label: "Kid 2", kind: "kid" },
    ]);
  });
});

describe("RSVP completeness", () => {
  it("asks for attendance before any conditional fields", () => {
    expect(
      getMissingRsvpFields({
        status: "",
        adults: 1,
        kids: 0,
        maxGuests: 2,
        companionNames: {},
      }),
    ).toEqual([{ field: "status", message: "Let us know if you can make it." }]);
  });

  it("orders missing companion names before capacity errors", () => {
    expect(
      getMissingRsvpFields({
        status: "going",
        adults: 2,
        kids: 1,
        maxGuests: 2,
        companionNames: { "adult-2": "Marites" },
      }),
    ).toEqual([
      { field: "kid-1-name", message: "Add a name for Kid 1." },
      {
        field: "party",
        message: "We've saved 2 seats for you. You've used 1 too many.",
      },
    ]);
  });

  it("does not require conditional fields for a decline", () => {
    expect(
      getMissingRsvpFields({
        status: "not_going",
        adults: 4,
        kids: 3,
        maxGuests: 1,
        companionNames: {},
      }),
    ).toEqual([]);
  });
});

describe("capacity and fallback summaries", () => {
  it("describes remaining, full, and exceeded capacity", () => {
    expect(getCapacityMessage(1, 3)).toBe(
      "We've saved 3 seats for you. You've used 1.",
    );
    expect(getCapacityMessage(3, 3)).toBe(
      "We've saved 3 seats for you. You've used all 3.",
    );
    expect(getCapacityMessage(4, 3)).toBe(
      "We've saved 3 seats for you. You've used 1 too many.",
    );
  });

  it("builds the same going fallback shape rendered by the reply", () => {
    const companions = buildCompanionFields(2, 1);
    expect(
      buildFallbackSummary({
        status: "going",
        adults: 2,
        kids: 1,
        companions,
        companionNames: { "adult-2": " Marites ", "kid-1": "Nino" },
      }),
    ).toEqual({
      status: "going",
      adults: 2,
      kids: 1,
      dietary: [],
      dietaryOther: null,
      guestNote: null,
      companions: [
        {
          kind: "adult",
          position: 2,
          name: "Marites",
          dietary: [],
          dietaryOther: null,
        },
        {
          kind: "kid",
          position: 1,
          name: "Nino",
          dietary: [],
          dietaryOther: null,
        },
      ],
    });
  });

  it("clears party details in a decline fallback", () => {
    expect(
      buildFallbackSummary({
        status: "not_going",
        adults: 2,
        kids: 1,
        companions: buildCompanionFields(2, 1),
        companionNames: {},
      }),
    ).toMatchObject({
      status: "not_going",
      adults: null,
      kids: null,
      companions: [],
    });
  });
});
