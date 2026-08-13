import { z } from 'zod';
import { SNS_PLATFORMS } from '@/lib/sns';
import { DIETARY_KEYS } from '@/lib/dietary';

/** Input schemas / DTOs for Server Actions — the single source of type truth. */

export const userIdSchema = z.string().uuid();
export const guestIdSchema = z.string().uuid();
export const labelIdSchema = z.string().uuid();

/** Mirrors the `rsvp_status` pg enum in db/schema.ts. */
export const rsvpStatusValues = ['pending', 'going', 'not_going'] as const;

/** Treat blank form fields as absent so optional() applies. */
const blankToUndefined = (v: unknown) =>
  v == null || (typeof v === 'string' && v.trim() === '') ? undefined : v;

/** Optional head-count field: blank → undefined (no reply), else 0–20 int. */
const partyCount = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce.number().int().min(0).max(20).optional(),
);

/**
 * Cross-field party rules, checked before save:
 * party size = adults + kids; it must fit inside `maxGuests`, and a `going`
 * reply must bring at least one attendee. Issues report under `partySize`.
 */
function checkPartyCounts(
  data: {
    maxGuests: number;
    adults?: number;
    kids?: number;
    status?: (typeof rsvpStatusValues)[number];
  },
  ctx: z.RefinementCtx,
) {
  const partySize = (data.adults ?? 0) + (data.kids ?? 0);
  if ((data.adults != null || data.kids != null) && partySize > data.maxGuests) {
    ctx.addIssue({
      code: 'custom',
      path: ['partySize'],
      message: `Party size (${partySize}) can't exceed max guests (${data.maxGuests}).`,
    });
  }
  if (data.status === 'going' && partySize < 1) {
    ctx.addIssue({
      code: 'custom',
      path: ['partySize'],
      message: 'A party marked Going needs at least 1 adult or kid.',
    });
  }
}

/** Admin input for a guest (party/household), shared by create and edit. */
const guestBaseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  maxGuests: z.preprocess(
    (v) => (v === '' || v == null ? 1 : v),
    z.coerce.number().int().min(1).max(20),
  ),
  adults: partyCount,
  kids: partyCount,
  email: z.preprocess(blankToUndefined, z.email('Enter a valid email').max(200).optional()),
  phone: z.preprocess(blankToUndefined, z.string().trim().max(30).optional()),
  adminNote: z.preprocess(blankToUndefined, z.string().trim().max(1000).optional()),
  // Social handles keyed by platform; blanks are dropped before parse.
  snsAccounts: z
    .partialRecord(z.enum(SNS_PLATFORMS), z.string().trim().min(1).max(100))
    .default({}),
  labelIds: z.array(z.string().uuid()).default([]),
});

/** Create: no status input — a new invitee always starts `pending`. */
export const guestCreateSchema = guestBaseSchema.superRefine(checkPartyCounts);
export type GuestCreateInput = z.infer<typeof guestCreateSchema>;

/** Edit: status is editable alongside the party counts. */
export const guestUpdateSchema = guestBaseSchema
  .extend({ status: z.enum(rsvpStatusValues) })
  .superRefine(checkPartyCounts);
export type GuestUpdateInput = z.infer<typeof guestUpdateSchema>;

/**
 * Guest RSVP reply (submitted from the public `?id=<token>` form).
 * The guest only ever sets `going` or `not_going` — never `pending`.
 * `adults`/`kids` are the head-count; their total is bound to the invitee's
 * seat allotment server-side and both are zeroed when the reply is `not_going`.
 */
export const rsvpResponseSchema = z.object({
  token: z.string().trim().min(1),
  status: z.enum(['going', 'not_going']),
  adults: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.coerce.number().int().min(1).max(20).optional(),
  ),
  kids: z.preprocess(
    (v) => (v === '' || v == null ? 0 : v),
    z.coerce.number().int().min(0).max(20),
  ),
  email: z.preprocess(blankToUndefined, z.email('Enter a valid email').max(200).optional()),
  phone: z.preprocess(blankToUndefined, z.string().trim().max(30).optional()),
  guestNote: z.preprocess(blankToUndefined, z.string().trim().max(1000).optional()),
  // Dietary presets (checkboxes) + free-text "Other". FormData sends `dietary`
  // zero-or-more times; normalize to an array and drop unknown keys.
  dietary: z.preprocess(
    (v) => (Array.isArray(v) ? v : v == null ? [] : [v]),
    z.array(z.enum(DIETARY_KEYS)).default([]),
  ),
  dietaryOther: z.preprocess(blankToUndefined, z.string().trim().max(200).optional()),
});
export type RsvpResponse = z.infer<typeof rsvpResponseSchema>;

/** FormData keys the guest form posts per companion: `companion.<kind>-<n>.<field>`. */
const COMPANION_FIELD = /^companion\.(adult|kid)-(\d{1,2})\.(name|dietary|dietaryOther)$/;

/** Dietary arrives zero-or-more times per companion; normalize to an array. */
const toArray = (v: unknown) => (Array.isArray(v) ? v : v == null ? [] : [v]);

/**
 * One companion of a party: a person the invitee is bringing, with their own
 * name and their own restrictions. `kind` + `position` mirror the label the form
 * showed them under ("Adult 2", "Kid 1").
 *
 * The name is required here as well as in the browser — the `required` attribute
 * is a courtesy, this is the rule.
 */
export const companionSchema = z.object({
  kind: z.enum(['adult', 'kid']),
  position: z.coerce.number().int().min(1).max(20),
  name: z.string().trim().min(1, 'Every guest needs a name').max(120),
  dietary: z.preprocess(toArray, z.array(z.enum(DIETARY_KEYS)).default([])),
  dietaryOther: z.preprocess(blankToUndefined, z.string().trim().max(200).optional()),
});
export type CompanionInput = z.infer<typeof companionSchema>;

export const companionsSchema = z.array(companionSchema).max(19);

/**
 * Gathers the flat `companion.adult-2.name`-style fields of a FormData back into
 * one object per companion, sorted kids-after-adults and by position so the
 * stored order matches the order the guest filled in.
 *
 * Returns the raw shapes; the caller validates them with `companionsSchema` so
 * every failure is reported the same way as the rest of the reply.
 */
export function collectCompanions(formData: FormData): unknown[] {
  const byKey = new Map<string, Record<string, unknown>>();

  for (const key of new Set(formData.keys())) {
    const match = COMPANION_FIELD.exec(key);
    if (!match) continue;
    const [, kind, position, field] = match;
    const slug = `${kind}-${position}`;
    const entry = byKey.get(slug) ?? { kind, position };
    entry[field] =
      field === 'dietary' ? formData.getAll(key) : formData.get(key);
    byKey.set(slug, entry);
  }

  return [...byKey.values()].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'adult' ? -1 : 1;
    return Number(a.position) - Number(b.position);
  });
}

/** Add/rename a label (tag). */
export const labelInputSchema = z.object({
  name: z.string().trim().min(1, 'Label name is required').max(40),
});
export type LabelInput = z.infer<typeof labelInputSchema>;
