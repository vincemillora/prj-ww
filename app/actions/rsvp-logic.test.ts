import { describe, expect, it } from "vitest";
import type { CompanionInput, RsvpResponse } from "@/lib/validation";
import {
  parseRsvpFormData,
  validateRsvpParty,
} from "@/app/actions/rsvp-logic";

const going: RsvpResponse = {
  token: "invite-token",
  status: "going",
  adults: 2,
  kids: 1,
  dietary: ["shellfish"],
};

const party: CompanionInput[] = [
  {
    kind: "adult",
    position: 2,
    name: "Marites",
    dietary: [],
  },
  {
    kind: "kid",
    position: 1,
    name: "Nino",
    dietary: ["eggs"],
  },
];

describe("parseRsvpFormData", () => {
  it("returns field errors for invalid reply fields", () => {
    const formData = new FormData();
    formData.set("token", "invite-token");
    formData.set("status", "going");
    formData.set("adults", "not-a-count");

    expect(parseRsvpFormData(formData)).toEqual({
      success: false,
      state: {
        ok: false,
        fieldErrors: { adults: "Invalid input: expected number, received NaN" },
      },
    });
  });

  it("returns the existing companion-name error for invalid companions", () => {
    const formData = new FormData();
    formData.set("token", "invite-token");
    formData.set("status", "going");
    formData.set("adults", "2");
    formData.set("kids", "0");
    formData.set("companion.adult-2.name", "");

    expect(parseRsvpFormData(formData)).toEqual({
      success: false,
      state: {
        ok: false,
        error: "Please check the names of everyone you are bringing.",
      },
    });
  });
});

describe("validateRsvpParty", () => {
  it("requires an adult count for a going reply", () => {
    expect(validateRsvpParty({ ...going, adults: undefined }, [], 3)).toEqual({
      success: false,
      state: {
        ok: false,
        fieldErrors: { adults: "How many adults are attending?" },
      },
    });
  });

  it("rejects a party above its seat allotment", () => {
    expect(validateRsvpParty(going, party, 2)).toEqual({
      success: false,
      state: {
        ok: false,
        fieldErrors: { adults: "Only 2 seat(s) are reserved for you." },
      },
    });
  });

  it("requires one named companion for every seat beyond the invitee", () => {
    expect(validateRsvpParty(going, party.slice(0, 1), 3)).toEqual({
      success: false,
      state: {
        ok: false,
        error: "Please give us a name for everyone in your party before sending.",
      },
    });
  });

  it("normalizes a decline", () => {
    const declined: RsvpResponse = {
      ...going,
      status: "not_going",
      dietaryOther: "No pork",
    };

    expect(validateRsvpParty(declined, party, 3)).toEqual({
      success: true,
      data: {
        adults: null,
        kids: null,
        dietary: [],
        dietaryOther: null,
        companions: [],
      },
    });
  });

  it("returns a valid going persistence payload", () => {
    expect(validateRsvpParty(going, party, 3)).toEqual({
      success: true,
      data: {
        adults: 2,
        kids: 1,
        dietary: ["shellfish"],
        dietaryOther: null,
        companions: party,
      },
    });
  });
});
