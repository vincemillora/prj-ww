import { companionsToText } from "@/lib/companions";
import { dietaryList } from "@/lib/dietary";
import type { GuestRow } from "@/app/(protected)/dashboard/board/types";

export const GUEST_CSV_FILENAME = "wedding-rsvps.csv";

const STATUS_TEXT: Record<GuestRow["status"], string> = {
  going: "Going",
  pending: "Awaiting",
  not_going: "Not going",
};

const HEADER = [
  "Name",
  "Email",
  "Phone",
  "Status",
  "Adults",
  "Kids",
  "Max guests",
  "Dietary (invitee)",
  "Also coming",
  "Labels",
  "Guest note",
  "Admin note",
  "Responded at",
  "Invite link",
];

/** Quote a CSV cell and escape embedded double quotes. */
function cell(value: string | number | null): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

/** Serialize the complete guest read model to the dashboard's CSV format. */
export function serializeGuestCsv(rows: GuestRow[], baseUrl: string): string {
  const lines = rows.map((row) =>
    [
      row.name,
      row.email,
      row.phone,
      STATUS_TEXT[row.status],
      row.adults,
      row.kids,
      row.maxGuests,
      dietaryList(row.dietary, row.dietaryOther).join("; "),
      companionsToText(row.companions),
      row.labels.map((label) => label.name).join("; "),
      row.guestNote,
      row.adminNote,
      row.respondedAt ? row.respondedAt.slice(0, 10) : "",
      `${baseUrl}/?id=${row.token}`,
    ]
      .map(cell)
      .join(","),
  );

  return [HEADER.map(cell).join(","), ...lines].join("\r\n");
}
