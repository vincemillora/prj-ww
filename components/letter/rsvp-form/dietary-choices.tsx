"use client";

import { DIETARY_OPTIONS } from "@/lib/dietary";
import { fieldLabel } from "@/components/letter/letter-type";
import { Choice } from "@/components/letter/rsvp-form/choice";
import { Field, FieldLabel } from "@/components/ui/field";

/**
 * The allergy presets plus the "Something else" toggle, shared by the invitee's
 * own section and every companion card so one set of allergies is asked for
 * the same way whoever it belongs to. `name` is the field the presets post under; the
 * caller owns `otherOpen` because it also renders the matching free-text field.
 *
 * Content-width chips rather than a fixed grid: the labels are one or two short
 * words each, and a fixed grid would wrap the longer ones at phone width.
 */
export function DietaryChoices({
  name,
  label,
  otherOpen,
  onOther,
}: {
  name: string;
  /**
   * Names the chip group where nothing else does. The invitee's own set needs
   * none — its Section legend already names it — but inside a companion card the
   * chips would otherwise be the only control with no label.
   */
  label?: string;
  otherOpen: boolean;
  onOther: (open: boolean) => void;
}) {
  const labelId = `${name}-label`;

  const chips = (
    <div className="flex flex-wrap gap-2.5">
      {DIETARY_OPTIONS.map((opt) => (
        <Choice
          key={opt.key}
          type="checkbox"
          name={name}
          value={opt.key}
          label={opt.label}
        />
      ))}
      {/* Wraps in with the presets, sized to its own label like they are. It
          used to be pushed onto its own full-width line to mark it as the one
          chip that opens a field rather than posting a value; that read as a
          separate control instead of the last option in the set. */}
      <Choice
        type="checkbox"
        label="Something else"
        checked={otherOpen}
        onChange={(e) => onOther(e.target.checked)}
      />
    </div>
  );

  if (!label) return chips;

  return (
    <Field aria-labelledby={labelId} className="gap-2">
      <FieldLabel id={labelId} className={fieldLabel}>
        {label}
      </FieldLabel>
      {chips}
    </Field>
  );
}
