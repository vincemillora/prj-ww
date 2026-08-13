import type { GuestRow, GuestStatus } from "@/app/(protected)/dashboard/board/types";

export type LabelSelection = ReadonlySet<string> | null;

/** Apply the board's case-insensitive text search and any-of label filter. */
export function filterGuests(
  rows: GuestRow[],
  query: string,
  selectedLabels: LabelSelection,
): GuestRow[] {
  const normalizedQuery = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (selectedLabels && !row.labels.some((label) => selectedLabels.has(label.id))) {
      return false;
    }
    if (!normalizedQuery) return true;

    return [row.name, row.email, row.phone, ...row.labels.map((label) => label.name)]
      .filter((value): value is string => Boolean(value))
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

/** Partition rows into the fixed status columns while preserving row order. */
export function groupGuestsByStatus(rows: GuestRow[]): Record<GuestStatus, GuestRow[]> {
  const grouped: Record<GuestStatus, GuestRow[]> = {
    pending: [],
    going: [],
    not_going: [],
  };
  for (const row of rows) grouped[row.status].push(row);
  return grouped;
}

/** Rounded percentage of invitee rows that have answered. */
export function responseProgress(rows: GuestRow[]): number {
  if (rows.length === 0) return 0;
  const responded = rows.filter((row) => row.status !== "pending").length;
  return Math.round((responded / rows.length) * 100);
}
