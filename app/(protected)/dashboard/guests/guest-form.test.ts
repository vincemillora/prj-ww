import { describe, expect, it } from "vitest";
import {
  getGuestPartyState,
  guestFormValues,
} from "@/app/(protected)/dashboard/guests/guest-form";

describe("guestFormValues", () => {
  it("preserves repeated labels and drops blank social handles", () => {
    const formData = new FormData();
    formData.set("name", "Reyes Family");
    formData.set("maxGuests", "3");
    formData.append("labelIds", "family");
    formData.append("labelIds", "vip");
    formData.set("sns_messenger", "  reyes.family  ");
    formData.set("sns_instagram", "  ");

    expect(guestFormValues(formData)).toMatchObject({
      name: "Reyes Family",
      maxGuests: "3",
      labelIds: ["family", "vip"],
      snsAccounts: { messenger: "reyes.family" },
    });
  });
});

describe("getGuestPartyState", () => {
  it("suppresses count validation for a decline", () => {
    expect(
      getGuestPartyState({
        mode: "edit",
        status: "not_going",
        maxGuests: "1",
        adults: "5",
        kids: "5",
      }),
    ).toEqual({
      declined: true,
      hasCounts: false,
      partySize: 10,
      seats: 1,
      partyError: undefined,
    });
  });

  it("requires at least one attendee for a going edit", () => {
    expect(
      getGuestPartyState({
        mode: "edit",
        status: "going",
        maxGuests: "3",
        adults: "0",
        kids: "0",
      }).partyError,
    ).toBe("A party marked Going needs at least 1 adult or kid.");
  });

  it("reports over-capacity parties", () => {
    expect(
      getGuestPartyState({
        mode: "create",
        status: "pending",
        maxGuests: "2",
        adults: "2",
        kids: "1",
      }).partyError,
    ).toBe("Party size (3) can't exceed max guests (2).");
  });

  it("prefers the server-provided party error", () => {
    expect(
      getGuestPartyState({
        mode: "edit",
        status: "going",
        maxGuests: "2",
        adults: "3",
        kids: "0",
        serverError: "Server says no",
      }).partyError,
    ).toBe("Server says no");
  });
});
