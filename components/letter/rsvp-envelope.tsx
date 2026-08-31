"use client";

import { type ReactNode } from "react";
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

type PaperLayerProps = {
  className: string;
  src: string;
  children?: ReactNode;
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

/**
 * Decorative RSVP envelope split into sticky back and front layers. The card
 * sits in ordinary document flow between them, so scrolling carries it through
 * the pocket without moving the card itself.
 */
export function RsvpEnvelope({ children }: RsvpEnvelopeProps) {
  return (
    <div
      data-slot="rsvp-envelope"
      className="relative left-1/2 isolate mt-[calc(var(--spacing-heading)+6rem)] grid w-[calc(100%+120.2px)] grid-cols-1 grid-rows-[auto_30svh] -translate-x-1/2"
    >
      {/* The paper layers are 83.195% of this canvas. Adding 120.2px to the
          canvas adds exactly 100px to their visible width; subtracting that
          same 100px here preserves the card's approved measure. */}
      <div
        aria-hidden
        data-slot="rsvp-envelope-sticky"
        className="pointer-events-none sticky top-6 bottom-0 z-10 col-start-1 row-start-1 row-end-3 self-start"
      >
        <div
          data-slot="rsvp-envelope-paper"
          className="relative aspect-[1446/1599] w-full"
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
        </div>
      </div>

      <div
        data-slot="rsvp-envelope-card"
        className="relative z-20 col-start-1 row-start-1 mx-auto mt-[55%] w-[calc(83.195%-100px)] self-start"
      >
        {children}
      </div>

      <div
        aria-hidden
        data-slot="rsvp-envelope-front-sticky"
        className="pointer-events-none sticky top-6 bottom-0 z-30 col-start-1 row-start-1 row-end-3 self-start"
      >
        <div
          data-slot="rsvp-envelope-front-paper"
          className="relative aspect-[1446/1599] w-full"
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
        </div>
      </div>
    </div>
  );
}
