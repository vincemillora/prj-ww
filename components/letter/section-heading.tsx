import { TypedLines } from '@/components/letter/typed-text';
import { cn } from '@/lib/utils';

/**
 * The letter's section voice: a script headline over a small sans kicker.
 * Every section opens this way, so the pair lives here once instead of as
 * nine hand-copies drifting apart.
 *
 * `tone` picks the ink for the ground the heading sits on:
 *   script — espresso script headline on antique linen (the default)
 *   ink    — headline in full ink, for a section whose imagery brings the
 *            colour instead (Location)
 *   white  — for sections set on the solid ink ground (Our Story, RSVP)
 *
 * The kicker is deliberately the smallest thing in the pair, and it sits tight
 * under the headline. Both matter. A script face carries very little ink for its
 * nominal size, and the kicker is usually the LONGER line — mass reads louder
 * than height — so a kicker set anywhere near reading size stops being a
 * subtitle and becomes the headline. It is the `kicker` role for that reason —
 * `label`'s phone size, but growing faster on a desktop, where a 14px line under
 * a 56px script headline reads as a caption instead of a subtitle.
 *
 * The title and kicker are STRINGS, not nodes: the pair is written a character
 * at a time (below), and a timeline cannot be laid over arbitrary markup. A
 * section that wants a longer lead-in sentence still can — Hotels does — and
 * `kickerClassName` caps its measure.
 *
 * MOTION: the pair is the letter's one repeated entrance, and it is repeated on
 * purpose — every section opens in the same hand, which is what holds nine
 * sections together as one letter. That hand is now a typewriter: the headline
 * is written out, the kicker follows on the same timeline, and both un-write
 * when the heading leaves the viewport (see `TypedLines`). It replaces the ink
 * stroke that used to sweep across the headline; a stroke and a typewriter over
 * the same words would be two entrances arguing. The bodies below deliberately
 * differ. The `h2`/`p` structure, tones and classes are unchanged, and the
 * server still renders the finished words, so a heading reads as plain text
 * without JS.
 */
const TONES = {
  script: { title: 'text-script', kicker: 'text-ink' },
  ink: { title: 'text-ink', kicker: 'text-ink' },
  white: { title: 'text-paper', kicker: 'text-paper' },
} as const;

export function SectionHeading({
  title,
  kicker,
  tone = 'script',
  className,
  kickerClassName,
}: {
  title: string;
  kicker?: string;
  tone?: keyof typeof TONES;
  className?: string;
  kickerClassName?: string;
}) {
  return (
    <TypedLines
      className={cn('text-center', className)}
      // A heading plus a kicker is a tall block on a phone; at 0.4 it starts
      // writing as the guest arrives at it rather than after they have read
      // past it.
      amount={0.4}
      lines={[
        {
          as: 'h2',
          className: cn('font-script text-title', TONES[tone].title),
          text: title,
        },
        ...(kicker != null
          ? [
              {
                as: 'p' as const,
                className: cn(
                  // Caps, and wider tracking to go with them: at 0.04em a
                  // capitalised line sets too tight to read as a label. This is
                  // the same voice as the field labels and event times, one
                  // step up in size.
                  'mt-2 font-sans text-kicker uppercase tracking-[0.14em]',
                  TONES[tone].kicker,
                  kickerClassName,
                ),
                text: kicker,
              },
            ]
          : []),
      ]}
      testId="section-heading"
    />
  );
}
