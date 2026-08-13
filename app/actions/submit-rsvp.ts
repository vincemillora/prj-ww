'use server';

import { updateTag } from 'next/cache';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { companions, guests } from '@/db/schema';
import type { ActionState } from '@/lib/action-state';
import { parseRsvpFormData, validateRsvpParty } from '@/app/actions/rsvp-logic';

/** Result of the RSVP submission, consumed via `useActionState` on the form. */
export type RsvpState = ActionState;

/**
 * Records a guest's RSVP reply.
 *
 * Input: FormData carrying `token`, `status` (`going`|`not_going`), `adults`,
 * `kids`, optional `email`/`phone`/`guestNote`, the invitee's own
 * `dietary`/`dietaryOther`, and one group of `companion.<kind>-<n>.*` fields per
 * person they are bringing. Re-validated server-side — the client is never
 * trusted. The `token` (capability link) identifies the row.
 *
 * Behaviour:
 * - Unknown token → `{ ok: false, error }`.
 * - Already answered (status not `pending`) → `{ ok: false, error }` (no overwrite).
 * - `going`: requires `adults` ≥ 1, `adults + kids` ≤ maxGuests, and exactly one
 *   named companion per seat beyond the invitee (`adults - 1` adults + `kids`
 *   kids). A party that does not add up is rejected rather than half-recorded.
 * - `not_going`: `adults`/`kids` forced to null, dietary cleared, no companions.
 *
 * On success writes status/adults/kids/guestNote/dietary/dietaryOther/respondedAt
 * plus the companion rows, and returns `{ ok: true }`.
 *
 * Companions are upserted on `(guest_id, kind, position)` BEFORE the guest row
 * flips off `pending`: the neon-http driver has no interactive transaction, so
 * this order means a failure between the two writes leaves the reply re-sendable
 * and a retry heals itself instead of doubling the party.
 */
export async function submitRsvp(
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  const parsed = parseRsvpFormData(formData);
  if (!parsed.success) return parsed.state;
  const { input, companions: submittedCompanions } = parsed;

  const [guest] = await db
    .select({ id: guests.id, status: guests.status, maxGuests: guests.maxGuests })
    .from(guests)
    .where(eq(guests.token, input.token));

  if (!guest) return { ok: false, error: 'This invite link is not valid.' };
  if (guest.status !== 'pending') {
    return { ok: false, error: 'You have already responded.' };
  }

  const validated = validateRsvpParty(input, submittedCompanions, guest.maxGuests);
  if (!validated.success) return validated.state;
  const {
    adults,
    kids,
    dietary,
    dietaryOther,
    companions: party,
  } = validated.data;

  const updates: Partial<typeof guests.$inferInsert> = {
    status: input.status,
    adults,
    kids,
    guestNote: input.guestNote ?? null,
    dietary,
    dietaryOther,
    respondedAt: new Date(),
    updatedAt: new Date(),
    // Only overwrite contact when the guest supplied it — keep admin-set values otherwise.
    ...(input.email ? { email: input.email } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
  };

  if (party.length > 0) {
    await db
      .insert(companions)
      .values(
        party.map((c) => ({
          guestId: guest.id,
          kind: c.kind,
          position: c.position,
          name: c.name,
          dietary: c.dietary,
          dietaryOther: c.dietaryOther ?? null,
        })),
      )
      .onConflictDoUpdate({
        target: [companions.guestId, companions.kind, companions.position],
        set: {
          name: sql`excluded.name`,
          dietary: sql`excluded.dietary`,
          dietaryOther: sql`excluded.dietary_other`,
          updatedAt: new Date(),
        },
      });
  }

  await db.update(guests).set(updates).where(eq(guests.id, guest.id));

  // Refresh the admin dashboard and this token's own cached lookup.
  updateTag('guests');

  return { ok: true };
}
