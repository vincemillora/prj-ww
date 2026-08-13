import { describe, expect, it } from "vitest";
import {
  filterGuests,
  groupGuestsByStatus,
  responseProgress,
} from "@/app/(protected)/dashboard/board/board-data";
import type { GuestRow } from "@/app/(protected)/dashboard/board/types";

function guest(overrides: Partial<GuestRow> = {}): GuestRow {
  return {
    id: "guest-1",
    token: "token",
    name: "Reyes Family",
    maxGuests: 3,
    adults: null,
    kids: null,
    status: "pending",
    email: "family@example.com",
    phone: "+81 90 1234",
    adminNote: null,
    snsAccounts: {},
    guestNote: null,
    dietary: [],
    dietaryOther: null,
    respondedAt: null,
    labels: [{ id: "family", name: "Bride Family" }],
    companions: [],
    ...overrides,
  };
}

describe("filterGuests", () => {
  const rows = [
    guest(),
    guest({
      id: "guest-2",
      name: "College Friend",
      email: null,
      phone: null,
      labels: [{ id: "friends", name: "University" }],
    }),
  ];

  it.each(["reyes", "FAMILY@EXAMPLE.COM", "90 1234", "bride family"])(
    "matches query text across guest fields: %s",
    (query) => {
      expect(filterGuests(rows, query, null).map((row) => row.id)).toEqual(["guest-1"]);
    },
  );

  it("matches any selected label", () => {
    expect(filterGuests(rows, "", new Set(["friends"]))).toEqual([rows[1]]);
  });

  it("combines text and label filters", () => {
    expect(filterGuests(rows, "reyes", new Set(["friends"]))).toEqual([]);
  });
});

describe("board grouping and progress", () => {
  const rows = [
    guest(),
    guest({ id: "going", status: "going" }),
    guest({ id: "declined", status: "not_going" }),
  ];

  it("always returns all three status groups", () => {
    const grouped = groupGuestsByStatus(rows);
    expect(grouped.pending.map((row) => row.id)).toEqual(["guest-1"]);
    expect(grouped.going.map((row) => row.id)).toEqual(["going"]);
    expect(grouped.not_going.map((row) => row.id)).toEqual(["declined"]);
  });

  it("rounds the response percentage and handles an empty board", () => {
    expect(responseProgress(rows)).toBe(67);
    expect(responseProgress([])).toBe(0);
  });
});
