import { describe, expect, it } from "vitest";
import {
  collectCompanions,
  companionsSchema,
  guestCreateSchema,
  guestUpdateSchema,
  rsvpResponseSchema,
} from "@/lib/validation";

describe("admin guest schemas", () => {
  it("normalizes blank optional fields and default counts", () => {
    const result = guestCreateSchema.parse({
      name: "  Reyes family  ",
      maxGuests: "",
      adults: "",
      kids: null,
      email: " ",
      phone: "",
      adminNote: "",
      snsAccounts: {},
      labelIds: [],
    });

    expect(result).toMatchObject({ name: "Reyes family", maxGuests: 1 });
    expect(result.adults).toBeUndefined();
    expect(result.email).toBeUndefined();
  });

  it("rejects a party larger than its allotment", () => {
    const result = guestUpdateSchema.safeParse({
      name: "Reyes family",
      maxGuests: 2,
      adults: 2,
      kids: 1,
      status: "going",
      snsAccounts: {},
      labelIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path: ["partySize"] }),
      );
    }
  });

  it("requires at least one attendee for a going reply", () => {
    const result = guestUpdateSchema.safeParse({
      name: "Solo guest",
      maxGuests: 1,
      adults: 0,
      kids: 0,
      status: "going",
      snsAccounts: {},
      labelIds: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "A party marked Going needs at least 1 adult or kid.",
      );
    }
  });
});

describe("public RSVP schema and companion collection", () => {
  it("accepts absent optional FormData values", () => {
    const result = rsvpResponseSchema.safeParse({
      token: "invite-token",
      status: "going",
      adults: "1",
      kids: "0",
      email: null,
      phone: null,
      guestNote: null,
      dietary: [],
      dietaryOther: null,
    });

    expect(result.success).toBe(true);
  });

  it("normalizes repeated dietary values", () => {
    const result = rsvpResponseSchema.parse({
      token: "invite-token",
      status: "going",
      adults: "2",
      kids: "0",
      dietary: "shellfish",
    });

    expect(result).toMatchObject({ adults: 2, kids: 0, dietary: ["shellfish"] });
  });

  it("collects repeated companion fields and orders adults before kids", () => {
    const formData = new FormData();
    formData.set("companion.kid-1.name", "Nino");
    formData.set("companion.adult-2.name", "Marites");
    formData.append("companion.adult-2.dietary", "shellfish");
    formData.append("companion.adult-2.dietary", "eggs");

    const collected = collectCompanions(formData);
    expect(collected).toEqual([
      {
        kind: "adult",
        position: "2",
        name: "Marites",
        dietary: ["shellfish", "eggs"],
      },
      { kind: "kid", position: "1", name: "Nino" },
    ]);
    expect(companionsSchema.parse(collected)).toHaveLength(2);
  });
});
