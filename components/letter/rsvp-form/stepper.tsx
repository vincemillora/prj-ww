"use client";

import { Minus, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { letterButton } from "@/components/letter/letter-button";
import { fieldLabel } from "@/components/letter/letter-type";
import {
  disabledControl,
  errorText,
} from "@/components/letter/rsvp-form/form-style";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

/**
 * −/+ stepper for a whole-number count. Posts its value through a hidden input
 * (`name`) so the server action reads it exactly like the old number field.
 * `canIncrement` caps the party at `maxGuests` from the caller (total across
 * both steppers); per-field `min`/`max` are the local bounds. The two round
 * buttons are `letterButton` in its outline variant, so the form has exactly
 * one button implementation.
 */
export function Stepper({
  label,
  icon: Icon,
  name,
  value,
  setValue,
  min,
  max,
  canIncrement,
  error,
}: {
  label: string;
  /** Same glyph the matching companion cards carry, so the count and the cards
   *  it produces are visibly the same thing. */
  icon: LucideIcon;
  name: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
  max: number;
  canIncrement: boolean;
  error?: string;
}) {
  const step = cn(
    letterButton({ variant: "outline" }),
    "size-11 shrink-0 justify-center rounded-full p-0",
    disabledControl,
  );

  return (
    <Field className="gap-2" data-invalid={Boolean(error)}>
      <FieldLabel
        htmlFor={`${name}-value`}
        className={cn(fieldLabel, "flex items-center justify-center gap-1.5")}
      >
        <Icon aria-hidden strokeWidth={1.5} className="size-3.5 shrink-0" />
        {label}
      </FieldLabel>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          className={step}
          onClick={() => setValue(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus aria-hidden strokeWidth={1.5} />
        </button>
        <output
          id={`${name}-value`}
          aria-live="polite"
          className="min-w-8 flex-1 text-center font-sans text-heading tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          className={step}
          onClick={() => setValue(Math.min(max, value + 1))}
          disabled={value >= max || !canIncrement}
          aria-label={`Increase ${label}`}
        >
          <Plus aria-hidden strokeWidth={1.5} />
        </button>
      </div>
      <input type="hidden" name={name} value={value} />
      {error ? <FieldError className={errorText}>{error}</FieldError> : null}
    </Field>
  );
}
