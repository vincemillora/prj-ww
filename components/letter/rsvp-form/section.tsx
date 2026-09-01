import { cn } from "@/lib/utils";
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
 *
 * Which block opens the page is told to us (`divider={false}`), not sniffed with
 * `first-of-type`. The conditional blocks are wrapped in a motion.div so they
 * can collapse, which made the allergies section the first `div` inside THAT
 * wrapper — so it dropped its rule and its 28px of clearance and sat flush
 * against the attendance answers. A structural selector cannot see past a
 * wrapper the animation needs; the prop can.
 */
const sectionShell =
  "relative before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-ink/20";

/** The rule and the clearance it sits in the middle of: 28px either side. */
const sectionRule = "mt-7 pt-7";

/** A ruled block of the form: same header voice, same rule, same rhythm. */
export function Section({
  title,
  hint,
  required,
  divider = true,
  children,
}: {
  title: string;
  hint?: string;
  required?: boolean;
  /** False for the block that opens the form, which has nothing to divide from. */
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn(sectionShell, divider ? sectionRule : "before:hidden")}>
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
