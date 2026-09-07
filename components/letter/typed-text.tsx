'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
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

/**
 * The hand's speed for a block: derived from how much there is to write in
 * total, so a two-line block keeps one rhythm across both lines.
 */
function charMsFor(total: number) {
  return Math.min(
    CHAR_MS_MAX,
    Math.max(CHAR_MS_MIN, Math.round(WRITE_MS / Math.max(total, 1))),
  );
}

/** How many ticks a block takes: the sum of its lines, or the longest one. */
function stepsFor(texts: string[], parallel: boolean) {
  const lengths = texts.map((t) => t.length);
  return parallel
    ? Math.max(0, ...lengths)
    : lengths.reduce((sum, n) => sum + n, 0);
}

/**
 * How long this block will take to write, in seconds, for a caller that has to
 * time something against the END of a write rather than guess at it — the
 * invitation's hint, which lands as the senders' line finishes.
 *
 * Pass the same `parallel` the block uses, or the answer is wrong in the
 * direction that matters: parallel writing is FASTER, and a hint timed to the
 * sequential length would sit there after the words had settled.
 */
export function writeDurationS(texts: string[], parallel = false) {
  const total = texts.reduce((sum, t) => sum + t.length, 0);
  return (stepsFor(texts, parallel) * charMsFor(total)) / 1000;
}

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
  /**
   * Seconds to hold before the first character, for a block that is ALREADY in
   * view when the page loads — the invitation's senders' line, which would
   * otherwise start writing in the same frame as the artwork behind it. Scrolled
   * blocks want 0: the scroll is the cue.
   */
  startDelay?: number;
  /**
   * Server-render this block EMPTY, with a `<noscript>` copy of the words
   * behind it, for a block that is above the fold.
   *
   * Everywhere else the server renders the finished text, which is right: those
   * blocks are below the fold, so nobody sees them before hydration, and the
   * full text is the correct resting state for a guest whose JS never runs.
   * Above the fold that same choice is visible as a FLASH — measured on the
   * invitation: the complete senders' line painted, then blanked at hydration,
   * then wrote itself out. The gap is however long hydration takes, which on a
   * cold phone is not one frame.
   *
   * The `<noscript>` copy is what keeps this honest: scripting off still reads
   * whole words, and a guest who prefers reduced motion gets the full line the
   * moment hydration lands, since nothing is typed for them at all.
   */
  aboveFold?: boolean;
  /**
   * Write every line AT ONCE instead of one after another.
   *
   * The default is sequential, and inside the letter that is the point: a
   * heading has to finish before its kicker starts, or the pair reads as two
   * machines rather than one hand. Parallel is for a block where the lines are
   * one utterance and the wait is the cost — the invitation's "you have
   * received a letter from / Vince and Kc", which is the first thing on the
   * page and gates the hint behind it.
   *
   * The hand's speed per character does not change; the block simply finishes
   * in the LONGEST line's ticks rather than the sum of them (31 instead of 43
   * on the invitation, so about 0.4s back). Each line still being written
   * carries its own cursor, which is what makes the simultaneity legible
   * rather than looking like a glitch.
   */
  parallel?: boolean;
  testId?: string;
};

/**
 * Text written a character at a time when the block enters the viewport, and
 * erased in reverse when it leaves.
 *
 * By default the lines are ONE timeline: a title finishes before its kicker
 * starts, and the kicker unwinds before the title is touched. That is the point
 * inside the letter — nine headings typing their two lines at once would read
 * as two machines rather than one hand. `parallel` opts out, for a block whose
 * lines are one utterance and where the wait is the cost; see that prop.
 *
 * Either way it is ONE clock. The lines never animate independently, so they
 * cannot drift apart or leave a cursor burning on a line nobody is writing.
 *
 * REDUCED MOTION / NO JS: the words are never withheld by an animation that
 * may not run. The server renders the finished text — or, for an `aboveFold`
 * block, an empty line with a `<noscript>` copy behind it — and client state is
 * the only thing that ever shortens it. That is why the preference comes from
 * `usePrefersReducedMotion` (a subscription, server snapshot `true`) rather
 * than motion's `useReducedMotion()`, which reports FALSE under SSR: for text,
 * that hook's failure mode is a permanently BLANK heading, not merely an
 * unanimated one.
 */
export function TypedLines({
  lines,
  className,
  amount = 0.5,
  startDelay = 0,
  aboveFold = false,
  parallel = false,
  testId = 'typed-text',
}: TypedLinesProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Not `REVEAL_VIEWPORT`'s once-only: this is the one entrance in the letter
  // that replays, because an erase is only worth animating if the guest can
  // still see it happen.
  const inView = useInView(ref, { amount });
  const texts = lines.map((line) => line.text);
  const total = texts.reduce((sum, text) => sum + text.length, 0);
  // One tick writes one character of every line at once when `parallel`, so a
  // block's length is its longest line rather than all of them added up.
  const steps = stepsFor(texts, parallel);

  const typing = !usePrefersReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!typing) return;

    const target = inView ? steps : 0;
    if (count === target) return;

    // Speed comes from the TOTAL, not the step count: the hand writes at the
    // same pace either way, and parallel simply gets more done per tick.
    const charMs = charMsFor(total);
    const stepMs = inView
      ? charMs
      : Math.max(ERASE_MS_MIN, Math.round(charMs * ERASE_RATIO));

    const step = inView ? 1 : -1;
    // The hold applies to the FIRST character of a write only: it is a cue to
    // wait for, not a rhythm, so it must not slow the rest of the line and must
    // never delay an erase.
    const wait = inView && count === 0 ? stepMs + startDelay * 1000 : stepMs;
    const id = window.setTimeout(() => setCount((c) => c + step), wait);
    return () => window.clearTimeout(id);
  }, [typing, inView, count, steps, total, startDelay]);

  // `typing` is false for the server render, for the hydration render, and for
  // a guest who prefers reduced motion — all three show the finished text,
  // unless this block is above the fold and has asked to start empty.
  const hydrated = useHydrated();
  const shown = aboveFold && !hydrated ? 0 : typing ? count : steps;

  return (
    <div className={className} data-testid={testId} ref={ref}>
      {/*
        The `<noscript>` copy exists for the server render only, and it is
        dropped the moment the page hydrates — a hydrated page has JS, so the
        copy could never be shown again, and leaving it mounted would re-render
        a finished copy of every line on EVERY character. React hydrates
        against it (both the server and the hydration render see `!hydrated`)
        and then removes it on the first commit.
      */}
      {aboveFold && !hydrated ? (
        <noscript>
          {lines.map((line) => (
            <TypedLine
              as={line.as}
              chars={line.text.length}
              className={line.className}
              cursor={false}
              key={line.text}
              text={line.text}
            />
          ))}
        </noscript>
      ) : null}
      {lines.map((line, index) => {
        // Where this line begins on the timeline. Zero for every line when the
        // block writes in parallel, since they all start together. Recomputed
        // per line rather than accumulated in a running total: these are two-
        // and three-item arrays, and a mutable counter inside the map is
        // exactly what react-hooks/immutability is for.
        const start = parallel
          ? 0
          : texts.slice(0, index).reduce((sum, prev) => sum + prev.length, 0);
        const chars = Math.min(Math.max(shown - start, 0), line.text.length);
        return (
          <TypedLine
            as={line.as}
            chars={chars}
            className={line.className}
            // Sequential blocks have ONE cursor, on whichever line is being
            // written. Parallel blocks have one per unfinished line — that is
            // what makes two lines filling at once read as deliberate rather
            // than as a glitch.
            cursor={typing && chars > 0 && chars < line.text.length}
            key={line.text}
            text={line.text}
          />
        );
      })}
    </div>
  );
}

/**
 * A single line of typed text — the common case (an item title). Every timing
 * and placement prop is forwarded, so reaching for `TypedLines` is only ever
 * about wanting MORE THAN ONE line on the shared timeline.
 */
export function TypedText({
  as,
  className,
  text,
  wrapperClassName,
  ...timing
}: Omit<TypedLinesProps, 'lines' | 'className'> & {
  as?: TypedLineSpec['as'];
  /** Classes for the line itself. */
  className?: string;
  text: string;
  /** Classes for the block around it, where a caller needs both. */
  wrapperClassName?: string;
}) {
  return (
    <TypedLines
      {...timing}
      className={wrapperClassName}
      lines={[{ text, className, as }]}
    />
  );
}

/**
 * Whether React has hydrated, without an effect: the server snapshot is false
 * and the client's is true, so the value flips on the first commit and the
 * markup the server produced is what React hydrates against.
 *
 * Both callbacks are MODULE constants, not inline arrows. `useSyncExternalStore`
 * resubscribes whenever `subscribe` changes identity, and this component
 * re-renders once per character — an inline arrow would tear down and rebuild
 * the subscription on every letter of every typed block on the page.
 */
const subscribeNever = () => () => {};
const hydratedSnapshot = () => true;
const serverSnapshot = () => false;

function useHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    hydratedSnapshot,
    serverSnapshot,
  );
}

/**
 * One line, written up to `chars`.
 *
 * THE WHOLE LINE IS ALWAYS IN THE DOM. The characters not yet written are
 * rendered in a `visibility: hidden` span, which keeps its space, so the line
 * wraps and the block is sized from the FINISHED text in the very first frame.
 *
 * The alternative — mounting only the typed prefix — is what this used to do,
 * and it reflows on almost every character: a centred line re-centres as it
 * widens, and a long one (Hotels' kicker, any wrapping title) jumps a whole
 * line box as the last word wraps, shoving everything below it down. Measured
 * that way, the invitation alone logged 0.0093 of layout shift and the letter
 * 0.0284, all of it attributed to typed blocks. Reserving the final box costs
 * one extra span per line and removes the class of bug entirely.
 *
 * It also reads better: the words fill in from where they will finally sit,
 * instead of sliding sideways under the cursor.
 */
function TypedLine({
  as: Tag = 'p',
  chars,
  className,
  cursor,
  text,
}: {
  as?: TypedLineSpec['as'];
  /** How many characters are written. `text.length` renders the finished line. */
  chars: number;
  className?: string;
  cursor: boolean;
  text: string;
}) {
  const written = text.slice(0, chars);
  const pending = text.slice(chars);

  return (
    <Tag className={className}>
      {written}
      {/*
        The cursor rides between the written and pending text, in a ZERO-WIDTH
        inline box with the bar absolutely placed inside it. A cursor that took
        real width would be the one thing left that could still push the last
        word onto a new line — exactly the jump the pending span exists to
        prevent — and it would do it only on lines that happen to end near the
        measure, which is the worst kind of bug to reproduce.
      */}
      <span aria-hidden className="relative inline-block w-0 align-baseline">
        <span
          className={cn(
            'absolute bottom-0 left-[0.04em] h-[0.8em] w-[0.06em] bg-current',
            cursor ? 'animate-pulse opacity-70' : 'opacity-0',
          )}
        />
      </span>
      <span
        aria-hidden
        // `invisible`, not `opacity-0` or a removed node: visibility keeps the
        // glyphs' boxes, which is the entire point — they are what holds the
        // line's width, wrapping and height steady while it is written.
        className={cn('invisible', pending === '' && 'hidden')}
        // Marked so a test can tell written from pending: both are in
        // `textContent`, and jsdom computes neither visibility nor innerText.
        data-slot="pending"
      >
        {pending}
      </span>
    </Tag>
  );
}

