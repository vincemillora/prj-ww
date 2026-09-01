import { type CSSProperties, type ReactNode } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

const ENVELOPE_SIZES =
  "(max-width: 45rem) calc(100vw + 5rem), 49.5rem";
const PAPER_LAYER_SIZES =
  "(max-width: 45rem) calc(83vw + 4rem), 41.25rem";
const INSIDE_LAYER_SIZES =
  "(max-width: 45rem) calc(72vw + 3.5rem), 36rem";
const INSIDE_CLIP_PATH =
  "polygon(50% 0, 44.1% 2.1%, 0 41.2%, 0 100%, 100% 100%, 100% 41.2%, 55.9% 2.1%)";
const LACE_RAISE = "-translate-y-[16.83%]";

/**
 * Every measurement the glide depends on, in one place and in terms of each
 * other, because they are not independent: move one and the others follow.
 *
 * `--envelope-height` is the artwork's own ratio applied to the canvas width, so
 * it tracks `aspect-[1446/1599]` on the paper boxes below — change one and
 * change the other. It carries a container unit, so it is only ever consumed by
 * a CHILD of the canvas: `cqw` read on the canvas itself would be a
 * self-reference and silently fall back to the viewport.
 *
 * `--pin-top` is where the layers hold, and therefore WHEN the glide starts:
 * they pin the moment the envelope's top edge reaches this line, so a larger
 * offset starts the card moving earlier, with less of the envelope needing to
 * arrive first. A flat `top-6` made the guest wait for the envelope to climb the
 * full height of the screen before anything happened — worst on a phone, where
 * the envelope is SHORTER than the viewport and so sat fully visible, doing
 * nothing, for most of a screen.
 *
 * What caps it is the far end of the glide, not the near one. The card comes to
 * rest with its bottom edge `--envelope-height` minus `--runway` below the pin,
 * so lowering the pin pushes that edge toward the fold, and past a point the
 * tuck happens off-screen. This is that point less a margin, i.e. the earliest
 * pin at any size: the fold, plus the runway the rest position is measured back
 * from, less the envelope's height, less 2.5rem under the card's tucked edge.
 * `max()` keeps the pin sane on a short viewport, where that can go negative.
 */
const ENVELOPE_GEOMETRY = {
  "--envelope-height": "calc(100cqw * 1599 / 1446)",
  "--runway": "30svh",
  "--pin-top":
    "max(1.5rem, calc(100svh + var(--runway) - var(--envelope-height) - 2.5rem))",
} as CSSProperties;

/** The box both paper stacks live in — see `--envelope-height` on the ratio. */
const PAPER_BOX = "relative aspect-[1446/1599] w-full";

/**
 * Shared by the back and front stacks. Spanning both rows is what lets the
 * layers stay pinned across the runway; `self-start` keeps them at the top of
 * that span so the pin has room to travel.
 */
const STICKY_LAYER =
  "pointer-events-none sticky top-[var(--pin-top)] bottom-0 col-start-1 row-start-1 row-end-3 self-start";

type PaperLayerProps = {
  className: string;
  src: string;
  children?: ReactNode;
};

type StickyPaperProps = {
  children: ReactNode;
  /** z-index utility; the card sits at z-20, between the two stacks. */
  className: string;
  paperSlot: string;
  stickySlot: string;
};

type RsvpEnvelopeProps = {
  children: ReactNode;
};

function PaperLayer({ children, className, src }: PaperLayerProps) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 left-1/2 w-[83.195%] -translate-x-1/2",
        className,
      )}
    >
      <Image src={src} alt="" fill sizes={PAPER_LAYER_SIZES} />
      {children}
    </div>
  );
}

function StickyPaper({
  children,
  className,
  paperSlot,
  stickySlot,
}: StickyPaperProps) {
  return (
    <div
      aria-hidden
      data-slot={stickySlot}
      className={cn(STICKY_LAYER, className)}
    >
      <div data-slot={paperSlot} className={PAPER_BOX}>
        {children}
      </div>
    </div>
  );
}

/**
 * Decorative RSVP envelope split into sticky back and front layers. The card
 * sits in ordinary document flow between them, so scrolling carries it through
 * the pocket without moving the card itself.
 */
export function RsvpEnvelope({ children }: RsvpEnvelopeProps) {
  return (
    <div
      data-slot="rsvp-envelope"
      style={ENVELOPE_GEOMETRY}
      className="@container relative left-1/2 isolate mt-[calc(var(--spacing-heading)+6rem)] grid w-[calc(100%+120.2px)] grid-cols-1 grid-rows-[auto_var(--runway)] -translate-x-1/2"
    >
      {/* The paper layers are 83.195% of this canvas. Adding 120.2px to the
          canvas adds exactly 100px to their visible width; subtracting that
          same 100px off the card preserves its approved measure. `@container` is
          what lets the layers read this canvas's width — see ENVELOPE_GEOMETRY. */}
      <StickyPaper
        stickySlot="rsvp-envelope-sticky"
        paperSlot="rsvp-envelope-paper"
        className="z-10"
      >
        <PaperLayer
          src="/envelope/back.png"
          className="z-10 origin-center rotate-[5deg]"
        />

        <div
          className="absolute left-1/2 top-[11.91%] z-10 h-[84.33%] w-[72.38%] origin-[50%_45.17%] -translate-x-1/2 -translate-y-[10px] rotate-[5deg] overflow-hidden"
          style={{ clipPath: INSIDE_CLIP_PATH }}
        >
          <Image
            src="/envelope/inside.png"
            alt=""
            fill
            sizes={INSIDE_LAYER_SIZES}
            className="scale-[1.02664] object-cover"
          />
        </div>

        <Image
          src="/envelope/lace.png"
          alt=""
          fill
          sizes={ENVELOPE_SIZES}
          className={cn(
            "z-0 origin-center translate-x-[10px] rotate-[185deg]",
            LACE_RAISE,
          )}
        />
      </StickyPaper>

      {/* Where the card starts in the pocket. The flap only clears the card's
          full width above 46.32% of the envelope — 51.2% of this canvas's width
          — so a card starting at 55% opened with its first lines cut at both
          sides before a guest had scrolled at all. 30% starts it well above that
          line, reading as a card already lifting out of the pocket rather than a
          buried one. */}
      <div
        data-slot="rsvp-envelope-card"
        className="relative z-20 col-start-1 row-start-1 mx-auto mt-[30%] w-[calc(83.195%-100px)] self-start"
      >
        {children}
      </div>

      <StickyPaper
        stickySlot="rsvp-envelope-front-sticky"
        paperSlot="rsvp-envelope-front-paper"
        className="z-30"
      >
        <PaperLayer
          src="/envelope/front.png"
          className="z-30 origin-center rotate-[5deg]"
        >
          <div
            data-slot="rsvp-envelope-logo"
            className="absolute inset-x-0 bottom-[4%] z-10 mx-auto aspect-square w-[30%]"
          >
            <Image
              src="/couple-logo-rustic.svg"
              alt=""
              fill
              sizes="(max-width: 45rem) 28vw, 12.5rem"
              className="object-contain"
            />
          </div>
        </PaperLayer>
      </StickyPaper>
    </div>
  );
}
