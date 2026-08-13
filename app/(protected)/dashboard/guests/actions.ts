'use server';

import { updateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireEditor } from '@/lib/dal';
import {
  OK_ACTION_STATE,
  toFieldErrors,
  type ActionState,
} from '@/lib/action-state';
import { db } from '@/db';
import { guests, guestLabels, labels } from '@/db/schema';
import {
  guestCreateSchema,
  guestUpdateSchema,
  guestIdSchema,
  labelInputSchema,
  labelIdSchema,
  rsvpStatusValues,
} from '@/lib/validation';
import { generateToken } from '@/lib/guest-token';
import { guestFormValues } from '@/app/(protected)/dashboard/guests/guest-form';

export type { ActionState } from '@/lib/action-state';

/** Generate an invite token not already used (retry on the rare collision). */
async function uniqueToken(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const token = generateToken();
    const clash = await db
      .select({ id: guests.id })
      .from(guests)
      .where(eq(guests.token, token));
    if (clash.length === 0) return token;
  }
  throw new Error('Could not generate a unique invite token. Try again.');
}

export async function createGuest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireEditor();
  const parsed = guestCreateSchema.safeParse(guestFormValues(formData));
  if (!parsed.success) return toFieldErrors(parsed.error);
  const input = parsed.data;

  const token = await uniqueToken();
  const [row] = await db
    .insert(guests)
    .values({
      token,
      name: input.name,
      maxGuests: input.maxGuests,
      email: input.email,
      phone: input.phone,
      adminNote: input.adminNote,
      snsAccounts: input.snsAccounts,
      // status stays at its 'pending' default — a new invitee hasn't replied.
      adults: input.adults ?? null,
      kids: input.kids ?? null,
    })
    .returning({ id: guests.id });

  // neon-http has no interactive transactions — sequential writes.
  if (input.labelIds.length) {
    await db
      .insert(guestLabels)
      .values(input.labelIds.map((labelId) => ({ guestId: row.id, labelId })));
  }

  updateTag('guests');
  return OK_ACTION_STATE;
}

export async function updateGuest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireEditor();
  const id = guestIdSchema.safeParse(formData.get('guestId'));
  if (!id.success) return { ok: false, error: 'Invalid guest.' };
  const parsed = guestUpdateSchema.safeParse({
    ...guestFormValues(formData),
    status: formData.get('status'),
  });
  if (!parsed.success) return toFieldErrors(parsed.error);
  const input = parsed.data;
  // A declined party brings nobody — zero the counts, same as the guest form.
  const declined = input.status === 'not_going';

  await db
    .update(guests)
    .set({
      name: input.name,
      maxGuests: input.maxGuests,
      email: input.email,
      phone: input.phone,
      adminNote: input.adminNote,
      snsAccounts: input.snsAccounts,
      status: input.status,
      adults: declined ? 0 : (input.adults ?? null),
      kids: declined ? 0 : (input.kids ?? null),
      updatedAt: new Date(),
    })
    .where(eq(guests.id, id.data));

  // Replace the tag set.
  await db.delete(guestLabels).where(eq(guestLabels.guestId, id.data));
  if (input.labelIds.length) {
    await db
      .insert(guestLabels)
      .values(input.labelIds.map((labelId) => ({ guestId: id.data, labelId })));
  }

  updateTag('guests');
  return OK_ACTION_STATE;
}

/**
 * Kanban move: set a guest's RSVP status directly (drag between columns, or
 * the mobile tab flow). Mirrors the form semantics — `not_going` zeroes the
 * party counts, moving back to `pending` clears `respondedAt`, and a first
 * move into a replied status stamps `respondedAt`. Party counts are otherwise
 * left untouched (the edit dialog owns them).
 */
export async function moveGuestStatus(
  guestIdRaw: string,
  statusRaw: string,
): Promise<ActionState> {
  await requireEditor();
  const id = guestIdSchema.safeParse(guestIdRaw);
  const status = z.enum(rsvpStatusValues).safeParse(statusRaw);
  if (!id.success || !status.success) return { ok: false, error: 'Invalid move.' };

  const [row] = await db
    .select({ status: guests.status, respondedAt: guests.respondedAt })
    .from(guests)
    .where(eq(guests.id, id.data));
  if (!row) return { ok: false, error: 'Guest not found.' };
  if (row.status === status.data) return OK_ACTION_STATE;

  await db
    .update(guests)
    .set({
      status: status.data,
      ...(status.data === 'not_going' ? { adults: 0, kids: 0 } : {}),
      respondedAt: status.data === 'pending' ? null : (row.respondedAt ?? new Date()),
      updatedAt: new Date(),
    })
    .where(eq(guests.id, id.data));

  updateTag('guests');
  return OK_ACTION_STATE;
}

export async function deleteGuest(formData: FormData): Promise<void> {
  await requireEditor();
  const guestId = guestIdSchema.parse(formData.get('guestId'));
  await db.delete(guests).where(eq(guests.id, guestId)); // cascade clears guest_labels
  updateTag('guests');
}

export async function createLabel(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireEditor();
  const parsed = labelInputSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return toFieldErrors(parsed.error);
  try {
    await db.insert(labels).values({ name: parsed.data.name });
  } catch {
    return { ok: false, fieldErrors: { name: 'That label already exists.' } };
  }
  updateTag('labels');
  return OK_ACTION_STATE;
}

export async function renameLabel(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireEditor();
  const id = labelIdSchema.safeParse(formData.get('labelId'));
  if (!id.success) return { ok: false, error: 'Invalid label.' };
  const parsed = labelInputSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) return toFieldErrors(parsed.error);
  try {
    await db.update(labels).set({ name: parsed.data.name }).where(eq(labels.id, id.data));
  } catch {
    return { ok: false, fieldErrors: { name: 'That label already exists.' } };
  }
  // Label names are embedded in the cached guest rows — invalidate both.
  updateTag('labels');
  updateTag('guests');
  return OK_ACTION_STATE;
}

export async function deleteLabel(formData: FormData): Promise<void> {
  await requireEditor();
  const labelId = labelIdSchema.parse(formData.get('labelId'));
  await db.delete(labels).where(eq(labels.id, labelId)); // cascade clears guest_labels
  updateTag('labels');
  updateTag('guests');
}
