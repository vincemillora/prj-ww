import { RequiredMark } from "@/components/letter/rsvp-form/required-mark";
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

/**
 * One shell for every block of the form. Each block is a `fieldset` with the
 * same header voice (sans title + sans hint, centred like the letter's
 * section headings) opened by the same ink hairline — the first block drops the
 * rule, so the sequence reads as one ruled page rather than a stack of cards.
 *
 * The rule is a `::before` on the wrapper, not a border on the fieldset: a
 * rendered `legend` notches a fieldset's own top border, and this document's
 * rules are unbroken hairlines.
 *
 * The rules are thinned ink (`ink/20`) rather than the letter's usual full
 * strength: at full ink, five hairlines inside one small card read as heavier
 * than the answers they separate. This is the one thinned-ink exception in the
 * document (cf. the two-colour note in app/globals.css) and is deliberate.
 */
const sectionShell =
  "relative mt-7 pt-7 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-ink/20 first-of-type:mt-0 first-of-type:pt-0 first-of-type:before:hidden";

/** A ruled block of the form: same header voice, same rule, same rhythm. */
export function Section({
  title,
  hint,
  required,
  children,
}: {
  title: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={sectionShell}>
      <FieldSet className="gap-0">
        <FieldLegend className="mb-0 w-full px-0 text-center font-normal">
          <span className="block font-sans text-subhead">
            {title}
            {required && <RequiredMark />}
          </span>
          {hint && (
            <span className="mt-1.5 block font-sans text-meta">
              {hint}
            </span>
          )}
        </FieldLegend>
        <FieldGroup className="mt-5 gap-4">{children}</FieldGroup>
      </FieldSet>
    </div>
  );
}
