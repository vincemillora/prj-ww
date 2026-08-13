import { SNS_PLATFORMS, type SnsAccounts } from "@/lib/sns";

export type RsvpStatus = "pending" | "going" | "not_going";
export type GuestFormMode = "create" | "edit";

export type GuestData = {
  id: string;
  name: string;
  maxGuests: number;
  adults: number | null;
  kids: number | null;
  email: string | null;
  phone: string | null;
  adminNote: string | null;
  snsAccounts: SnsAccounts;
  status: RsvpStatus;
  labelIds: string[];
};

export const STATUS_LABEL: Record<RsvpStatus, string> = {
  pending: "Pending",
  going: "Going",
  not_going: "Not going",
};

export const STATUS_OPTIONS: RsvpStatus[] = ["pending", "going", "not_going"];

/** Convert admin guest FormData to the raw shape consumed by the Zod schemas. */
export function guestFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    maxGuests: formData.get("maxGuests"),
    adults: formData.get("adults"),
    kids: formData.get("kids"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    adminNote: formData.get("adminNote"),
    labelIds: formData.getAll("labelIds"),
    snsAccounts: Object.fromEntries(
      SNS_PLATFORMS.map((platform) => [
        platform,
        String(formData.get(`sns_${platform}`) ?? "").trim(),
      ]).filter(([, value]) => value !== ""),
    ),
  };
}

/** Derive the admin form's live party-count state without React dependencies. */
export function getGuestPartyState({
  mode,
  status,
  maxGuests,
  adults,
  kids,
  serverError,
}: {
  mode: GuestFormMode;
  status: RsvpStatus;
  maxGuests: string;
  adults: string;
  kids: string;
  serverError?: string;
}) {
  const declined = mode === "edit" && status === "not_going";
  const hasCounts = !declined && (adults !== "" || kids !== "");
  const partySize = (Number(adults) || 0) + (Number(kids) || 0);
  const seats = Number(maxGuests) || 0;
  const partyError =
    serverError ??
    (hasCounts && seats > 0 && partySize > seats
      ? `Party size (${partySize}) can't exceed max guests (${seats}).`
      : !declined && mode === "edit" && status === "going" && partySize < 1
        ? "A party marked Going needs at least 1 adult or kid."
        : undefined);

  return { declined, hasCounts, partySize, seats, partyError };
}
