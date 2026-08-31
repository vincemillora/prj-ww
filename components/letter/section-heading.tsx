import { InkFade, InkStroke } from '@/components/letter/letter-reveals';
import { BEAT } from '@/components/letter/motion-tokens';
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
 * The kicker takes a node, not just a string, so a section can keep a longer
 * lead-in sentence (Hotels) — use `kickerClassName` to cap its measure.
 *
 * MOTION: the pair is the letter's one repeated entrance, and it is repeated on
 * purpose. The script headline is stroked in left to right (see `InkStroke`) and
 * the kicker follows two beats behind. Every section opening is therefore in the
 * same hand, which is what holds nine sections together as one letter. The
 * bodies below deliberately differ. This file stays a server component: only the
 * two reveal spans hydrate, and the `h2`/`p` structure, tones and classes are
 * unchanged, so a heading still renders as plain text without JS.
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
  title: React.ReactNode;
  kicker?: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
  kickerClassName?: string;
}) {
  return (
    <div className={cn('text-center', className)}>
      <h2
        className={cn(
          'font-script text-title',
          TONES[tone].title,
        )}
      >
        <InkStroke>{title}</InkStroke>
      </h2>
      {kicker != null && (
        <p
          className={cn(
            // Caps, and wider tracking to go with them: at 0.04em a capitalised
            // line sets too tight to read as a label. This is the same voice as
            // the field labels and event times, one step up in size.
            'mt-2 font-sans text-kicker uppercase tracking-[0.14em]',
            TONES[tone].kicker,
            kickerClassName,
          )}
        >
          <InkFade delay={BEAT * 2}>{kicker}</InkFade>
        </p>
      )}
    </div>
  );
}
