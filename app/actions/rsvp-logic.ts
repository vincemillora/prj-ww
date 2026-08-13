import { toFieldErrors, type ActionState } from "@/lib/action-state";
import {
  collectCompanions,
  companionsSchema,
  rsvpResponseSchema,
  type CompanionInput,
  type RsvpResponse,
} from "@/lib/validation";

type ParsedRsvpForm =
  | { success: true; input: RsvpResponse; companions: CompanionInput[] }
  | { success: false; state: ActionState };

export type NormalizedRsvpParty = {
  adults: number | null;
  kids: number | null;
  dietary: RsvpResponse["dietary"];
  dietaryOther: string | null;
  companions: CompanionInput[];
};

type ValidatedRsvpParty =
  | { success: true; data: NormalizedRsvpParty }
  | { success: false; state: ActionState };

/** Parse and validate the flat public RSVP FormData without performing I/O. */
export function parseRsvpFormData(formData: FormData): ParsedRsvpForm {
  const parsed = rsvpResponseSchema.safeParse({
    token: formData.get("token"),
    status: formData.get("status"),
    adults: formData.get("adults"),
    kids: formData.get("kids"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    guestNote: formData.get("guestNote"),
    dietary: formData.getAll("dietary"),
    dietaryOther: formData.get("dietaryOther"),
  });
  if (!parsed.success) {
    return { success: false, state: toFieldErrors(parsed.error) };
  }

  const parsedCompanions = companionsSchema.safeParse(collectCompanions(formData));
  if (!parsedCompanions.success) {
    return {
      success: false,
      state: {
        ok: false,
        error: "Please check the names of everyone you are bringing.",
      },
    };
  }

  return {
    success: true,
    input: parsed.data,
    companions: parsedCompanions.data,
  };
}

/** Apply invitation capacity and companion-count rules without database access. */
export function validateRsvpParty(
  input: RsvpResponse,
  companions: CompanionInput[],
  maxGuests: number,
): ValidatedRsvpParty {
  if (input.status === "not_going") {
    return {
      success: true,
      data: {
        adults: null,
        kids: null,
        dietary: [],
        dietaryOther: null,
        companions: [],
      },
    };
  }

  if (input.adults == null) {
    return {
      success: false,
      state: {
        ok: false,
        fieldErrors: { adults: "How many adults are attending?" },
      },
    };
  }

  if (input.adults + input.kids > maxGuests) {
    return {
      success: false,
      state: {
        ok: false,
        fieldErrors: { adults: `Only ${maxGuests} seat(s) are reserved for you.` },
      },
    };
  }

  const expectedAdults = input.adults - 1;
  const gotAdults = companions.filter((companion) => companion.kind === "adult").length;
  const gotKids = companions.filter((companion) => companion.kind === "kid").length;
  if (gotAdults !== expectedAdults || gotKids !== input.kids) {
    return {
      success: false,
      state: {
        ok: false,
        error: "Please give us a name for everyone in your party before sending.",
      },
    };
  }

  return {
    success: true,
    data: {
      adults: input.adults,
      kids: input.kids,
      dietary: input.dietary,
      dietaryOther: input.dietaryOther ?? null,
      companions,
    },
  };
}
