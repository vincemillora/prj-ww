import Image from 'next/image';
import attireGuide from '@/public/attire-guide.png';
import { cn } from '@/lib/utils';
import { InViewReveal } from '@/components/letter/in-view-reveal';
import { PlateReveal } from '@/components/letter/letter-reveals';
import { BEAT } from '@/components/letter/motion-tokens';

/**
 * The palette plate and the guidance notes are separate exports because the Day
 * Itself section lays them out one to a hand-drawn sheet, tilted apart, rather
 * than as one stacked block. Keeping them here rather than inlining the markup
 * at the call site keeps ONE source for the copy: the colours named in the alt
 * text and the three lines of guidance are wedding facts, and two divergent
 * copies of a fact is how a site starts telling guests different things in
 * different places.
 */
export function AttirePlate({ className }: { className?: string }) {
  return (
    <PlateReveal className={className}>
      <Image
        src={attireGuide}
        alt="Illustrated guests wearing the wedding palette — wine, raspberry, lilac, mauve, olive, forest green and pale gold"
        placeholder="blur"
        className="mx-auto h-auto w-full"
        sizes="(max-width: 640px) 92vw, min(80vw, 56rem)"
      />
    </PlateReveal>
  );
}

/**
 * The three lines of guidance. See AttirePlate on why these are exported.
 *
 * `tone` picks the ground these sit on. The classes have to switch rather than
 * inherit: each line carries its own colour (`text-ink`, and
 * `text-muted-foreground` for the body, which is a mixed-down ink), so a colour
 * set on an ancestor would not reach them.
 */
export function AttireNotes({
  className,
  tone = 'ink',
}: {
  className?: string;
  tone?: 'ink' | 'paper';
}) {
  const onInk = tone === 'paper';
  return (
    <InViewReveal
      delay={BEAT * 2}
      className={cn('mx-auto flex max-w-md flex-col gap-3', className)}
    >
      <p
        className={cn(
          'font-sans text-subhead',
          onInk ? 'text-paper' : 'text-ink',
        )}
      >
        Semi-formal — garden party
      </p>
      <p
        className={cn(
          'text-body',
          onInk ? 'text-paper/80' : 'text-muted-foreground',
        )}
      >
        We would love to see you in the colours above — wear one, or mix a
        few.
      </p>
      <p
        className={cn(
          'text-body',
          onInk ? 'text-paper/80' : 'text-muted-foreground',
        )}
      >
        Please leave white and ivory for the couple.
      </p>
    </InViewReveal>
  );
}

/*
 * The `AttireGuide` SECTION has been retired: DayItself now carries the "What
 * to wear" title and lays the plate and the notes out on their own hand-drawn
 * sheets, so a second copy of all three below it was the same content twice.
 * This file is deliberately just the two exports above now — it is where the
 * attire copy lives, not a section. `git log` has the old section if the
 * standalone layout is ever wanted back.
 */
