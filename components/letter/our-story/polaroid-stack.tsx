"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

import {
  peekRoom,
  StackCard,
  type StackLayout,
} from "@/components/letter/card-stack";
import { TALL_VIEWPORT } from "@/components/letter/motion-tokens";
import type { Memory, StoryPrint } from "@/components/letter/our-story/memories";
import { Polaroid } from "@/components/letter/our-story/story-art";
import { cn } from "@/lib/utils";

/** How long a print stays in front before the stack moves on by itself. */
const AUTO_ADVANCE_MS = 4000;

/**
 * Several prints for one memory, stacked like the venue deck in location.tsx:
 * throw the front print sideways to send it to the back, or tap a peeking
 * print (or a dot) to pull it forward. The deck is dealt once, when it reaches
 * the viewport, so it arrives as one print and fans out to show there are more.
 *
 * AUTO-ADVANCE: while the stack is on screen, the front print is thrown to the
 * back every AUTO_ADVANCE_MS. The timer restarts whenever the front changes,
 * so a manual throw or dot tap gets its full 4 seconds too. It pauses while
 * the pointer or keyboard focus is on the stack (so a guest is never fighting
 * it), while `paused` is set (the lightbox is open), and is off entirely under
 * reduced motion.
 */
export function PolaroidStack({
  memory,
  prints,
  reduce,
  onOpen,
  paused = false,
}: {
  memory: Memory;
  prints: StoryPrint[];
  reduce: boolean;
  onOpen: (print: StoryPrint) => void;
  /** Stops auto-advance, e.g. while one of these prints is in the lightbox. */
  paused?: boolean;
}) {
  const count = prints.length;
  /** Which print is in front. Everything else derives. */
  const [frontIndex, setFrontIndex] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  // TALL_VIEWPORT is not `once`, so this also goes false when the stack
  // scrolls away, which is what stops the auto-advance off screen.
  const dealt = useInView(stackRef, TALL_VIEWPORT);
  /** Pointer over or focus inside the stack: hold the auto-advance. */
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  /** Bumped to tell the front StackCard to throw itself. */
  const [throwSignal, setThrowSignal] = useState(0);

  const autoAdvance = dealt && !reduce && !paused && !hovered && !focused;
  useEffect(() => {
    if (!autoAdvance) return;
    const timer = window.setTimeout(
      () => setThrowSignal((n) => n + 1),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [autoAdvance, frontIndex]);

  // Wider tilts than the venue deck: a print is narrow, so a small turn alone
  // would hide the one behind it. The tilt is what shows there is a second.
  // A shorter throw too, since the column is narrow and clipped by the list.
  // Only the first three behind the front fan out; the rest wait squared up
  // behind them, so an eight-print memory looks like a pile, not a tower.
  const layout: StackLayout = {
    count,
    peek: 10,
    shrink: 0.04,
    tilts: [0, 6, -5, 4],
    throwDistance: 320,
    maxDepth: 3,
  };

  const wrap = (i: number) => ((i % count) + count) % count;
  const depthOf = (index: number) => wrap(index - frontIndex);

  return (
    <div
      className="flex flex-col items-center"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      {/* The outer pad reserves the deepest print's peek. The inner element is
          the positioning context: its height comes from the first print, which
          stays in normal flow while the rest are stretched over it. */}
      <div style={{ paddingBottom: peekRoom(layout) }}>
        <div
          ref={stackRef}
          className="relative"
          role="group"
          aria-roledescription="card stack"
          aria-label={`${memory.title}, ${count} photos`}
        >
          {prints.map((print, index) => (
            <StackCard
              key={print.id}
              layout={layout}
              stretch={index > 0}
              dealt={dealt}
              depth={depthOf(index)}
              isFront={index === frontIndex}
              onDismiss={() => setFrontIndex((i) => wrap(i + 1))}
              onBringToFront={() => setFrontIndex(index)}
              throwSignal={throwSignal}
            >
              <Polaroid
                print={print}
                title={memory.title}
                tilt={memory.tilt}
                reduce={reduce}
                inert={index !== frontIndex}
                onOpen={() => onOpen(print)}
              />
            </StackCard>
          ))}
        </div>
      </div>

      {/* Dots: the keyboard and tap equivalent of throwing the front print. */}
      <div className="mt-5 flex items-center gap-2.5">
        {prints.map((print, index) => (
          <button
            key={print.id}
            type="button"
            onClick={() => setFrontIndex(index)}
            aria-current={index === frontIndex}
            className={cn(
              "size-2.5 rounded-full border border-paper transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper",
              index === frontIndex ? "bg-paper" : "bg-transparent",
            )}
          >
            <span className="sr-only">
              Show photo {index + 1} of {count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
