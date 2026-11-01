'use client';

import { useEffect, useRef } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'motion/react';

import { cn } from '@/lib/utils';

/**
 * The resting shape of a deck: how many cards, how far each one behind the
 * front peeks out, how much it shrinks, and its hand-stacked tilt. Shared by
 * every card in one deck so they all agree on where depth N sits.
 */
export type StackLayout = {
  count: number;
  /** Vertical peek per card behind the front one, in px. */
  peek: number;
  /** How much each card behind the front one shrinks. */
  shrink: number;
  /** Per-depth resting tilt, in degrees. */
  tilts: readonly number[];
  /** How far sideways a thrown card travels before it tucks back under. */
  throwDistance?: number;
  /** Deepest depth that still fans out. Cards past it sit squared up behind
      that one, so a long deck does not grow a tall, shrinking tail. */
  maxDepth?: number;
};

/** Where a card at `depth` is drawn: its real depth, capped at `maxDepth`. */
const shownDepth = (layout: StackLayout, depth: number) =>
  Math.min(depth, layout.maxDepth ?? Infinity);

/** Room under the stack for the deepest card's peek. */
export const peekRoom = (layout: StackLayout) =>
  shownDepth(layout, layout.count - 1) * layout.peek;

/** Offset + velocity past which a drag throws the card to the back. */
const THROW_THRESHOLD = 160;

/**
 * One card in a draggable deck, after the Motion card stack example
 * (motion.dev/examples/react-card-stack). Used by the venue deck in
 * location.tsx and the stacked prints in Our Story.
 *
 * Two nested motion elements so the two motions never fight over `rotate`:
 * the outer one animates the card's resting place in the deck (depth peek,
 * shrink, tilt), the inner one carries the live drag (x, tilt-with-throw,
 * fade-out on dismiss).
 *
 * `stretch` absolutely fills the stack's box. Every card uses it except one,
 * which stays in normal flow and is what gives the box its height.
 *
 * `dealt` is the entrance: false means squared up on the front card, true means
 * out at this card's depth. It feeds the SAME `animate` target the shuffle uses,
 * so no second transition, no separate reveal, and no chance of the two fighting
 * over `y`.
 */
export function StackCard({
  layout,
  dealt,
  depth,
  isFront,
  onDismiss,
  onBringToFront,
  stretch = false,
  throwSignal = 0,
  children,
}: {
  layout: StackLayout;
  /** False until the stack reaches the viewport. */
  dealt: boolean;
  depth: number;
  isFront: boolean;
  onDismiss: () => void;
  onBringToFront: () => void;
  stretch?: boolean;
  /** Bump this to throw the front card as if it were dragged off to the
      right. Used for auto-advance; 0 (the default) never throws. */
  throwSignal?: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const lift = useMotionValue(0);
  const dragRotate = useTransform(x, [-240, 240], reduce ? [0, 0] : [-14, 14]);
  /** Set once a drag starts, so the click that ends it can be swallowed: a
      card holding a button (a print that opens the lightbox) must not fire
      it at the end of a throw. Reset on every new press. */
  const dragged = useRef(false);

  /**
   * Throw the card off the side, then slide it back in *underneath* the deck.
   *
   * The two legs are split by `onDismiss()`: while the card is off-screen the
   * deck re-orders, so this card's `z-index` drops to the back. The return leg
   * then travels the same path in reverse with every other card drawn over it,
   * which reads as the card tucking under the stack rather than vanishing. The
   * outer element's spring is meanwhile settling into the new depth's peek and
   * shrink, so the card arrives already sized for the bottom of the deck.
   */
  const throwAway = async (direction: number) => {
    if (reduce) {
      onDismiss();
      return;
    }

    const distance = layout.throwDistance ?? 460;
    await Promise.all([
      animate(x, direction * distance, {
        duration: 0.26,
        ease: [0.32, 0, 0.67, 0],
      }),
      // A shallow dip on the way out, so the arc back in comes from below the
      // deck's front edge rather than straight across it.
      animate(lift, peekRoom(layout) * 0.5, { duration: 0.26, ease: 'easeOut' }),
    ]);

    onDismiss();

    await Promise.all([
      animate(x, 0, { duration: 0.46, ease: [0.33, 1, 0.68, 1] }),
      animate(lift, 0, { duration: 0.46, ease: [0.33, 1, 0.68, 1] }),
    ]);
  };

  // Auto-advance: a new signal throws the front card the same way a drag
  // does. Only the front card reacts; the others just watch for their turn.
  // `throwAway` is left out of the deps on purpose: it is rebuilt every render,
  // and only a NEW signal should throw.
  useEffect(() => {
    if (throwSignal > 0 && isFront) void throwAway(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [throwSignal]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Velocity counts as distance travelled, so a short fast flick throws too.
    const power = info.offset.x + info.velocity.x * 0.2;
    if (Math.abs(power) > THROW_THRESHOLD) void throwAway(Math.sign(power));
  };

  return (
    <motion.div
      // Both branches must be positioned: `z-index` is what orders the deck,
      // and it is ignored on a `position: static` element.
      className={cn(stretch ? 'absolute inset-0' : 'relative')}
      style={{ zIndex: layout.count - depth }}
      animate={{
        y: dealt ? shownDepth(layout, depth) * layout.peek : 0,
        scale: dealt ? 1 - shownDepth(layout, depth) * layout.shrink : 1,
        rotate:
          reduce || !dealt
            ? 0
            : (layout.tilts[shownDepth(layout, depth)] ?? 0),
      }}
      transition={
        reduce
          ? { duration: 0.15 }
          : { type: 'spring', stiffness: 320, damping: 34 }
      }
    >
      <motion.div
        className={cn(
          stretch && 'size-full',
          isFront ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
        )}
        style={{ x, y: lift, rotate: dragRotate }}
        drag={isFront ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.9}
        dragMomentum={false}
        onPointerDownCapture={() => {
          dragged.current = false;
        }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={handleDragEnd}
        onClickCapture={(event) => {
          if (!dragged.current) return;
          event.preventDefault();
          event.stopPropagation();
        }}
        // A card behind the front one is mostly hidden; its peeking bottom
        // edge is the tap target that pulls it forward.
        onClick={isFront ? undefined : onBringToFront}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
