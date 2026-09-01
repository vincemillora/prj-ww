"use client";

import { useActionState, useState } from "react";
import { Baby, UserRound } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { submitRsvp, type RsvpState } from "@/app/actions/submit-rsvp";
import { cn } from "@/lib/utils";
import { fieldLabel } from "@/components/letter/letter-type";
import {
  ENTER_S,
  EXIT_S,
  LETTER_EASE,
  MOTION_REDUCE_OPEN,
} from "@/components/letter/motion-tokens";
import { RsvpReply, type ReplySummary } from "@/components/letter/rsvp-reply";
import { Choice } from "@/components/letter/rsvp-form/choice";
import { CompanionFields } from "@/components/letter/rsvp-form/companion-fields";
import { DietaryChoices } from "@/components/letter/rsvp-form/dietary-choices";
import { errorText } from "@/components/letter/rsvp-form/form-style";
import {
  buildCompanionFields,
  buildFallbackSummary,
  getCapacityMessage,
  getMissingRsvpFields,
  type RsvpStatusChoice,
} from "@/components/letter/rsvp-form/form-state";
import { Section } from "@/components/letter/rsvp-form/section";
import { Stepper } from "@/components/letter/rsvp-form/stepper";
import { SubmitArea } from "@/components/letter/rsvp-form/submit-area";
import { summarizeReply } from "@/components/letter/rsvp-form/summarize-reply";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initial: RsvpState = { ok: false };

/**
 * A group of fields opening and closing.
 *
 * This is the one place in the letter where an EXIT carries real meaning: the
 * form changes shape under the guest's hands. Answering “Joyfully accept” opens
 * two more sections, declining closes them again, and every press of a stepper
 * adds or removes a companion card. Without motion those are jump cuts — and on
 * a phone a jump cut moves the control you were about to tap.
 *
 * Height and opacity rather than a transform, deliberately: everything below the
 * group has to travel with it, which is the whole point. Closing runs at the
 * letter's exit length, well under half the opening — a guest who has just
 * declined should not have to sit through the party-size counters leaving.
 *
 * Reduced motion is honoured twice over. The hook zeroes the durations, and
 * MOTION_REDUCE_OPEN pins the open state in CSS — which is the one that actually
 * has to hold, because the hook is unreliable (see its note) and a group left at
 * `height: 0` would mean a guest could not answer at all.
 */
function Collapse({ children }: { children: React.ReactNode }) {
  const reduce = !!useReducedMotion();

  return (
    <motion.div
      className={cn('overflow-hidden', MOTION_REDUCE_OPEN)}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{
        height: 0,
        opacity: 0,
        transition: reduce
          ? { duration: 0 }
          : { duration: EXIT_S, ease: 'easeOut' },
      }}
      transition={
        reduce ? { duration: 0 } : { duration: ENTER_S * 0.7, ease: LETTER_EASE }
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * Public RSVP form for a single invitee, in five ruled sections: attendance,
 * party size, allergies, contact details, and a note for the couple.
 * Contact is its own section rather than a tail on the note field — it is the
 * couple's way of reaching the guest back, not part of the message.
 *
 * Styling is the guest letter's: shadcn tokens for every field (so the
 * `.letter-theme` scope in app/globals.css paints it in paper + `--ink` with no
 * colour of its own) and the shared `letterButton` for every button, since this
 * form only ever renders inside that letter.
 *
 * `token` is the capability link id (`?id=<token>`); `maxGuests` bounds the
 * party-size steppers. On a successful reply it swaps to a thank-you.
 */
export function RsvpForm({
  token,
  maxGuests,
}: {
  token: string;
  maxGuests: number;
}) {
  const [state, action, pending] = useActionState(submitRsvp, initial);
  const [status, setStatus] = useState<RsvpStatusChoice>("");
  const [adults, setAdults] = useState(1);
  const [kids, setKids] = useState(0);
  const [dietaryOther, setDietaryOther] = useState(false);
  // Which companion cards have their "Something else" field open, by slug.
  const [companionOther, setCompanionOther] = useState<Record<string, boolean>>(
    {},
  );
  // Companion names are controlled so the send button can judge the reply, and
  // so a name survives a count going down and back up.
  const [companionNames, setCompanionNames] = useState<Record<string, string>>(
    {},
  );
  // A field only turns red once the guest has left it, or once they have tried
  // to send: nothing is scolded for being empty before it has been reached.
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});
  const [attemptedSend, setAttemptedSend] = useState(false);
  // What was actually posted, captured as the form went. The dietary chips and
  // the note are uncontrolled, so this snapshot is the only place their values
  // exist on the client — and taking it at submit time means an edit made while
  // the request is in flight cannot change what we read back.
  const [sent, setSent] = useState<ReplySummary | null>(null);
  const partySize = adults + kids;
  const overCapacity = status === "going" && partySize > maxGuests;
  // A one-seat invitation has nothing to count: the guest is adult 1 and there
  // is no room for anyone else, so the counters would be four dead buttons
  // asking a question with a single possible answer.
  const solo = maxGuests === 1;

  /**
   * Everyone in the party except the invitee, who is adult 1 and answers for
   * themselves in the section above. Slugs are stable per position, so a card
   * keeps its answers when the count of the OTHER kind changes.
   */
  const companions = buildCompanionFields(adults, kids);

  /**
   * Everything still standing between the guest and a sent reply, in the order
   * the form asks for it. This is the single source for all three consequences:
   * the send button is dead while it is non-empty, the note above the button says
   * what is left, and the matching field is marked invalid.
   */
  const missing = getMissingRsvpFields({
    status,
    adults,
    kids,
    maxGuests,
    companionNames,
  });

  /** True once this field should show as wrong rather than merely empty. */
  const showsError = (field: string) =>
    (attemptedSend || blurred[field]) && missing.some((m) => m.field === field);

  // Sent. The reply is read back from the snapshot taken as it went, in the same
  // component the letter uses for a guest who answered on an earlier visit — so
  // "just sent" and "already answered" show the identical record.
  //
  // MOTION: this swap is the payoff of the whole site, and it used to be a hard
  // cut. `mode="wait"` sends the form out before the reply comes in, so the
  // sequence reads as one thing replacing another rather than two things
  // crossing. The form leaves quickly and slightly upward, as if posted; the
  // reply settles in from just below. `initial={false}` keeps the first paint
  // still — a guest arriving on an already-answered link should find their reply
  // there, not watch it arrive.
  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.ok ? (
        <motion.div
          key="reply"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ENTER_S, ease: LETTER_EASE }}
        >
          <RsvpReply
            reply={
              sent ??
              buildFallbackSummary({
                status,
                adults,
                kids,
                companions,
                companionNames,
              })
            }
          />
        </motion.div>
      ) : (
        <motion.form
          key="form"
          action={action}
          aria-busy={pending}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: EXIT_S, ease: 'easeOut' }}
          // Not preventDefault: the server action still runs. This only reads the
          // outgoing FormData on the way past.
          onSubmit={(e) => setSent(summarizeReply(new FormData(e.currentTarget)))}
        >
          <input type="hidden" name="token" value={token} />

          <Section title="Will you attend?" required divider={false}>
            <div
              className="grid gap-2.5"
              aria-describedby={showsError("status") ? "status-error" : undefined}
            >
              <Choice
                type="radio"
                name="status"
                value="going"
                label="Joyfully accept"
                size="lg"
                checked={status === "going"}
                onChange={() => setStatus("going")}
                invalid={showsError("status")}
                required
              />
              <Choice
                type="radio"
                name="status"
                value="not_going"
                label="Regretfully decline"
                size="lg"
                checked={status === "not_going"}
                onChange={() => setStatus("not_going")}
                invalid={showsError("status")}
              />
            </div>
            {showsError("status") && (
              <span id="status-error" role="alert" className={errorText}>
                Let us know if you can make it.
              </span>
            )}
          </Section>

          <AnimatePresence initial={false}>
            {status === "going" && (
              <Collapse key="going">
              <Section
                title="Any allergies?"
                hint={
                  solo
                    ? 'Anything you are allergic to, so the kitchen knows.'
                    : 'Anything you are allergic to. We ask about anyone you bring below.'
                }
              >
                <DietaryChoices
                  name="dietary"
                  otherOpen={dietaryOther}
                  onOther={setDietaryOther}
                />
                <AnimatePresence initial={false}>
                  {dietaryOther && (
                    <Collapse key="dietary-other">
                      <Field className="gap-2">
                        <FieldLabel htmlFor="dietaryOther" className={fieldLabel}>
                          Please tell us
                        </FieldLabel>
                        <Textarea
                          id="dietaryOther"
                          name="dietaryOther"
                          rows={2}
                          maxLength={200}
                          className="placeholder:italic"
                          placeholder="Another allergy, or a diet we should cook around"
                        />
                      </Field>
                    </Collapse>
                  )}
                </AnimatePresence>
              </Section>

              {solo ? (
                // The counts still post, so the server reads a one-seat reply the
                // same way it reads every other one.
                <>
                  <input type="hidden" name="adults" value={adults} />
                  <input type="hidden" name="kids" value={kids} />
                </>
              ) : (
                <Section title="Who is coming?" required>
                  {/* One counter per row on a phone, the two abreast from `sm`
                      up. Side by side they need 268px of hard minimum — 44px a
                      button, 32px a readout, plus the gaps between them — and
                      Tailwind's `grid-cols-2` is `minmax(0, 1fr)`, so on a 320px
                      screen the columns shrank UNDER their content rather than
                      scrolling, and the card's `overflow-hidden` clipped the
                      right-hand "+" clean off. Stacked, each counter gets the
                      whole column at any width.

                      From `sm` the gap BETWEEN the two counters stays wider than
                      the gap inside each one — without that contrast the four
                      round buttons read as one run of four rather than as two
                      separate counts. */}
                  <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                    <Stepper
                      label="Adults"
                      icon={UserRound}
                      name="adults"
                      value={adults}
                      setValue={setAdults}
                      min={1}
                      max={maxGuests}
                      canIncrement={partySize < maxGuests}
                      error={state.fieldErrors?.adults}
                    />
                    <Stepper
                      label="Kids"
                      icon={Baby}
                      name="kids"
                      value={kids}
                      setValue={setKids}
                      min={0}
                      max={maxGuests}
                      canIncrement={partySize < maxGuests}
                      error={state.fieldErrors?.kids}
                    />
                  </div>
                  <p
                    aria-live="polite"
                    className={cn(
                      "text-center text-meta",
                      overCapacity && "font-medium text-destructive",
                    )}
                  >
                    {getCapacityMessage(partySize, maxGuests)}
                  </p>

                  <AnimatePresence initial={false}>
                    {companions.length > 0 && (
                      <Collapse key="companions">
                        <div className="flex flex-col gap-3">
                          <p className="text-center font-sans text-meta">
                            We&rsquo;d love a name for each of them, and anything
                            they can&rsquo;t eat &mdash; it helps us seat everyone
                            and get the food right.
                          </p>
                          {/* One Collapse per card, so a stepper press grows or
                              folds exactly the card it added or removed.

                              The 12px between cards rides INSIDE each card as
                              `pt-3` rather than as the parent's `gap-3`: a flex gap
                              survives its item's collapse, so it would sit there as
                              a 12px hole and snap shut at the very end of the exit.
                              The container's `-mt-3` cancels the first card's copy
                              of it, leaving the run spaced exactly as before. */}
                          <div className="-mt-3">
                          <AnimatePresence initial={false}>
                            {companions.map((c) => (
                              <Collapse key={c.slug}>
                                <div className="pt-3">
                                <CompanionFields
                                  slug={c.slug}
                                  label={c.label}
                                  kind={c.kind}
                                  name={companionNames[c.slug] ?? ""}
                                  onName={(v) =>
                                    setCompanionNames((prev) => ({
                                      ...prev,
                                      [c.slug]: v,
                                    }))
                                  }
                                  onNameBlur={() =>
                                    setBlurred((prev) => ({
                                      ...prev,
                                      [`${c.slug}-name`]: true,
                                    }))
                                  }
                                  nameError={showsError(`${c.slug}-name`)}
                                  otherOpen={!!companionOther[c.slug]}
                                  onOther={(open) =>
                                    setCompanionOther((prev) => ({
                                      ...prev,
                                      [c.slug]: open,
                                    }))
                                  }
                                />
                                </div>
                              </Collapse>
                            ))}
                          </AnimatePresence>
                          </div>
                        </div>
                      </Collapse>
                    )}
                  </AnimatePresence>
                </Section>
              )}
              </Collapse>
            )}
          </AnimatePresence>

          <Section
            title="How can we reach you?"
            hint="Only if you would like us to have these."
          >
            <Field className="gap-2" data-invalid={Boolean(state.fieldErrors?.email)}>
              <FieldLabel htmlFor="email" className={fieldLabel}>
                Email
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={200}
                aria-invalid={!!state.fieldErrors?.email}
                aria-describedby={
                  state.fieldErrors?.email ? "email-error" : undefined
                }
              />
              {state.fieldErrors?.email && (
                <FieldError id="email-error" className={errorText}>
                  {state.fieldErrors.email}
                </FieldError>
              )}
            </Field>
            <Field className="gap-2" data-invalid={Boolean(state.fieldErrors?.phone)}>
              <FieldLabel htmlFor="phone" className={fieldLabel}>
                Phone
              </FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                aria-invalid={!!state.fieldErrors?.phone}
                aria-describedby={
                  state.fieldErrors?.phone ? "phone-error" : undefined
                }
              />
              {state.fieldErrors?.phone && (
                <FieldError id="phone-error" className={errorText}>
                  {state.fieldErrors.phone}
                </FieldError>
              )}
            </Field>
          </Section>

          <Section
            title="A note for the two of us"
            hint="A congratulations, a blessing, a memory of us you love."
          >
            <Field>
              <FieldLabel htmlFor="guestNote" className="sr-only">
                Message for the couple
              </FieldLabel>
              <Textarea
                id="guestNote"
                name="guestNote"
                maxLength={1000}
                placeholder="Congratulations, you two…"
                // shadcn's Textarea is `field-sizing-content`, so it hugs whatever is
                // typed and `rows` does nothing — the box rendered at its `min-h-16`
                // floor, barely taller than the single-line inputs above it. Raising
                // the floor is what gives it a note-sized opening; it still grows
                // from there as the guest writes.
                className="min-h-40"
              />
            </Field>
          </Section>

          <SubmitArea
            pending={pending}
            error={state.error}
            missing={missing}
            onAttemptSend={() => setAttemptedSend(true)}
          />
        </motion.form>
      )}
    </AnimatePresence>
  );
}
