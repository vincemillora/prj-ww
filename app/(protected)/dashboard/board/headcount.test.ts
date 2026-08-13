import { describe, expect, it } from "vitest";
import { headcount, partyBreakdown, partySize } from "@/app/(protected)/dashboard/board/headcount";
import type { GuestRow } from "@/app/(protected)/dashboard/board/types";

function guest(overrides: Partial<GuestRow>): GuestRow {
  return {
    id: "guest-id",
    token: "token",
    name: "Guest",
    maxGuests: 1,
    adults: null,
    kids: null,
    status: "pending",
    email: null,
    phone: null,
    adminNote: null,
    snsAccounts: {},
    guestNote: null,
    dietary: [],
    dietaryOther: null,
    respondedAt: null,
    labels: [],
    companions: [],
    ...overrides,
  };
}

describe("dashboard headcounts", () => {
  it("counts actual attendees for going and allotments otherwise", () => {
    const going = guest({ status: "going", maxGuests: 5, adults: 2, kids: 1 });
    const pending = guest({ id: "pending", maxGuests: 4 });
    const declined = guest({ id: "declined", status: "not_going", maxGuests: 3 });

    expect(partySize(going)).toBe(3);
    expect(partySize(pending)).toBe(4);
    expect(headcount([going, pending, declined])).toBe(10);
  });

  it("formats only non-zero party parts", () => {
    expect(partyBreakdown(2, 1)).toBe("2 adults · 1 kid");
    expect(partyBreakdown(1, 0)).toBe("1 adult");
    expect(partyBreakdown(null, null)).toBe("");
  });
});
