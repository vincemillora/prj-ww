import { describe, expect, it } from "vitest";
import { serializeGuestCsv } from "@/app/(protected)/dashboard/guest-csv";
import type { GuestRow } from "@/app/(protected)/dashboard/board/types";

const row: GuestRow = {
  id: "guest-1",
  token: "invite-token",
  name: 'Reyes, "Family"',
  maxGuests: 3,
  adults: 2,
  kids: 1,
  status: "going",
  email: "family@example.com",
  phone: null,
  adminNote: "Near the aisle",
  snsAccounts: {},
  guestNote: "We cannot wait!",
  dietary: ["shellfish"],
  dietaryOther: "No pork",
  respondedAt: "2026-08-13T12:34:56.000Z",
  labels: [
    { id: "family", name: "Family" },
    { id: "vip", name: "VIP" },
  ],
  companions: [
    {
      kind: "adult",
      position: 2,
      name: "Marites",
      dietary: ["eggs"],
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
};

describe("serializeGuestCsv", () => {
  it("uses the documented column order and CRLF row endings", () => {
    const csv = serializeGuestCsv([row], "https://wedding.example");
    const lines = csv.split("\r\n");

    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      '"Name","Email","Phone","Status","Adults","Kids","Max guests","Dietary (invitee)","Also coming","Labels","Guest note","Admin note","Responded at","Invite link"',
    );
  });

  it("escapes quotes and includes all flattened guest data", () => {
    const csv = serializeGuestCsv([row], "https://wedding.example");

    expect(csv).toContain('"Reyes, ""Family"""');
    expect(csv).toContain('"Shellfish; No pork"');
    expect(csv).toContain('"Adult 2: Marites [Eggs]; Kid 1: Nino"');
    expect(csv).toContain('"Family; VIP"');
    expect(csv).toContain('"2026-08-13"');
    expect(csv).toContain('"https://wedding.example/?id=invite-token"');
  });

  it("serializes an empty list as the header only", () => {
    expect(serializeGuestCsv([], "https://wedding.example")).not.toContain("\r\n");
  });
});
