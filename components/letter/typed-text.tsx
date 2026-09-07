'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

import { usePrefersReducedMotion } from '@/components/letter/use-media-query';
import { cn } from '@/lib/utils';

/**
 * How long a whole block should take to write, and the floor and ceiling on
 * per-character speed.
 *
 * A fixed ms-per-character does not survive contact with the letter's real
 * copy: "RSVP" is four characters and Hotels' kicker is over a hundred, so one
 * speed either makes the short lines crawl or the long ones take six seconds.
 * The budget is per BLOCK instead — a heading and its kicker write at whatever
 * speed gets them both down in about a second and a half — with a floor so a
 * long kicker never becomes a blur, and a ceiling so a two-word title still
 * reads as a hand rather than a stutter.
 */
const WRITE_MS = 1400;
const CHAR_MS_MIN = 16;
const CHAR_MS_MAX = 62;

/** Erasing runs well under half of writing: arriving is worth watching. */
const ERASE_RATIO = 0.42;
const ERASE_MS_MIN = 8;

export type TypedLineSpec = {
  text: string;
  /** Utility classes for this line — the same ones the static markup had. */
  className?: string;
  /** The element to render. Keep the tag the static markup used. */
  as?: 'p' | 'h2' | 'h3' | 'span' | 'div';
};

type TypedLinesProps = {
  lines: TypedLineSpec[];
  className?: string;
  /**
   * How much of the block has to be on screen before the hand starts writing.
   * A tall block (a heading plus a long kicker) needs a smaller share than a
   * single short line, or it never crosses the threshold on a phone.
   */
  amount?: number;
  testId?: string;
};

/**
 * Text written a character at a time when the block enters the viewport, and
 * erased in reverse when it leaves.
 *
 * The lines are ONE timeline, not one per line: a title finishes before its
 * kicker starts, and the kicker unwinds before the title is touched. Animating
 * each line independently would type the pair at once, which reads as two
 * machines rather than one hand.
 *
 * REDUCED MOTION / NO JS: the server renders the finished text and the state
 * below is the only thing that ever shortens it, so a guest who prefers reduced
 * motion — or whose JS never runs — reads whole words. That is why the
 * preference comes from `usePrefersReducedMotion` (a subscription, server
 * snapshot `true`) rather than motion's `useReducedMotion()`, which reports
 * FALSE under SSR: for text, that hook's failure mode is a permanently BLANK
 * heading, not merely an unanimated one.
 */
export function TypedLines({
  lines,
  className,
  amount = 0.5,
  testId = 'typed-text',
}: TypedLinesProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Not `REVEAL_VIEWPORT`'s once-only: this is the one entrance in the letter
  // that replays, because an erase is only worth animating if the guest can
  // still see it happen.
  const inView = useInView(ref, { amount });
  const total = lines.reduce((sum, line) => sum + line.text.length, 0);

  const typing = !usePrefersReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!typing) return;

    const target = inView ? total : 0;
    if (count === target) return;

    const charMs = Math.min(
      CHAR_MS_MAX,
      Math.max(CHAR_MS_MIN, Math.round(WRITE_MS / Math.max(total, 1))),
    );
    const stepMs = inView
      ? charMs
      : Math.max(ERASE_MS_MIN, Math.round(charMs * ERASE_RATIO));

    const step = inView ? 1 : -1;
    const id = window.setTimeout(() => setCount((c) => c + step), stepMs);
    return () => window.clearTimeout(id);
  }, [typing, inView, count, total]);

  // `typing` is false for the server render, for the hydration render, and for
  // a guest who prefers reduced motion — all three show the finished text.
  const shown = typing ? count : total;

  return (
    <div className={className} data-testid={testId} ref={ref}>
      {lines.map((line, index) => {
        // Where this line begins on the shared timeline. Recomputed per line
        // rather than accumulated in a running total: these are two- and
        // three-item arrays, and a mutable counter inside the map is exactly
        // what react-hooks/immutability is for.
        const start = lines
          .slice(0, index)
          .reduce((sum, prev) => sum + prev.text.length, 0);
        const chars = Math.min(Math.max(shown - start, 0), line.text.length);
        return (
          <TypedLine
            as={line.as}
            className={line.className}
            // One cursor for the whole block: it sits on the line being
            // written and goes out once the block is complete and settled.
            cursor={typing && shown > start && shown < total}
            key={line.text}
            text={line.text.slice(0, chars)}
          />
        );
      })}
    </div>
  );
}

/** A single line of typed text — the common case. */
export function TypedText({
  as,
  className,
  text,
  amount,
  testId,
  wrapperClassName,
}: {
  as?: TypedLineSpec['as'];
  className?: string;
  text: string;
  amount?: number;
  testId?: string;
  wrapperClassName?: string;
}) {
  return (
    <TypedLines
      amount={amount}
      className={wrapperClassName}
      lines={[{ text, className, as }]}
      testId={testId}
    />
  );
}

function TypedLine({
  as: Tag = 'p',
  className,
  cursor,
  text,
}: {
  as?: TypedLineSpec['as'];
  className?: string;
  cursor: boolean;
  text: string;
}) {
  return (
    <Tag className={className}>
      {text}
      {/*
        A zero-width nbsp holds the line box open while the line is empty, so
        nothing below steps up and down as the text is written and erased — and
        so the connectors Day itself anchors to a title's first line stay put.
        Reserving the full WIDTH instead would centre the type against an
        invisible copy of itself; the words have to stay centred as they grow,
        the way handwriting does.
      */}
      <span aria-hidden className="inline-block w-0 overflow-hidden">
        &nbsp;
      </span>
      <span
        aria-hidden
        className={cn(
          'ml-[0.06em] inline-block h-[0.8em] w-[0.06em] translate-y-[0.02em] bg-current align-baseline',
          cursor ? 'animate-pulse opacity-70' : 'opacity-0',
        )}
      />
    </Tag>
  );
}

