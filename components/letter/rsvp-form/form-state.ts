import type { ReplySummary } from "@/components/letter/rsvp-reply";

export type RsvpStatusChoice = "going" | "not_going" | "";

export type CompanionField = {
  slug: string;
  label: string;
  kind: "adult" | "kid";
};

export type MissingRsvpField = { field: string; message: string };

type RsvpFormValues = {
  status: RsvpStatusChoice;
  adults: number;
  kids: number;
  maxGuests: number;
  companionNames: Record<string, string>;
};

/** Build one stable field descriptor for every attendee beyond the invitee. */
export function buildCompanionFields(adults: number, kids: number): CompanionField[] {
  return [
    ...Array.from({ length: Math.max(0, adults - 1) }, (_, index) => ({
      slug: `adult-${index + 2}`,
      label: `Adult ${index + 2}`,
      kind: "adult" as const,
    })),
    ...Array.from({ length: kids }, (_, index) => ({
      slug: `kid-${index + 1}`,
      label: `Kid ${index + 1}`,
      kind: "kid" as const,
    })),
  ];
}

/** Return every issue blocking submission in the same order as the form. */
export function getMissingRsvpFields(values: RsvpFormValues): MissingRsvpField[] {
  if (!values.status) {
    return [{ field: "status", message: "Let us know if you can make it." }];
  }
  if (values.status === "not_going") return [];

  const missing: MissingRsvpField[] = [];
  for (const companion of buildCompanionFields(values.adults, values.kids)) {
    if (!(values.companionNames[companion.slug] ?? "").trim()) {
      missing.push({
        field: `${companion.slug}-name`,
        message: `Add a name for ${companion.label}.`,
      });
    }
  }

  const partySize = values.adults + values.kids;
  if (partySize > values.maxGuests) {
    missing.push({
      field: "party",
      message: getCapacityMessage(partySize, values.maxGuests),
    });
  }
  return missing;
}

/** Describe how much of the invitation's seat allotment is currently used. */
export function getCapacityMessage(partySize: number, maxGuests: number): string {
  const seats = `${maxGuests} seat${maxGuests === 1 ? "" : "s"}`;
  if (partySize > maxGuests) {
    return `We've saved ${seats} for you. You've used ${partySize - maxGuests} too many.`;
  }
  if (partySize === maxGuests) {
    return `We've saved ${seats} for you. You've used all ${maxGuests}.`;
  }
  return `We've saved ${seats} for you. You've used ${partySize}.`;
}

/** Last-resort summary when the submitted FormData snapshot is unavailable. */
export function buildFallbackSummary({
  status,
  adults,
  kids,
  companions,
  companionNames,
}: {
  status: RsvpStatusChoice;
  adults: number;
  kids: number;
  companions: CompanionField[];
  companionNames: Record<string, string>;
}): ReplySummary {
  const going = status !== "not_going";
  return {
    status: going ? "going" : "not_going",
    adults: going ? adults : null,
    kids: going ? kids : null,
    dietary: [],
    dietaryOther: null,
    guestNote: null,
    companions: going
      ? companions.map((companion) => ({
          kind: companion.kind,
          position: Number(companion.slug.split("-")[1]),
          name: (companionNames[companion.slug] ?? "").trim(),
          dietary: [],
          dietaryOther: null,
        }))
      : [],
  };
}
