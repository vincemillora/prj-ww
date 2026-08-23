"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

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
const CARD_START_Y = 108;
const CARD_REST_Y = 36;

type PaperLayerProps = {
  className: string;
  src: string;
};

type RsvpEnvelopeProps = {
  children: ReactNode;
};

function PaperLayer({ className, src }: PaperLayerProps) {
  return (
    <div
      className={cn(
        "absolute inset-y-0 left-1/2 w-[83.195%] -translate-x-1/2",
        className,
      )}
    >
      <Image src={src} alt="" fill sizes={PAPER_LAYER_SIZES} />
    </div>
  );
}

/** Decorative envelope that tucks the RSVP card between its paper layers. */
export function RsvpEnvelope({ children }: RsvpEnvelopeProps) {
  const envelopeRef = useRef<HTMLDivElement>(null);
  const reduceMotion = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: envelopeRef,
    offset: ["start 82%", "start 37%"],
  });
  const cardY = useTransform(
    scrollYProgress,
    [0, 1],
    [CARD_START_Y, CARD_REST_Y],
  );

  return (
    <div
      ref={envelopeRef}
      data-slot="rsvp-envelope"
      className="relative left-1/2 isolate mt-heading w-[calc(100%+120.2px)] -translate-x-1/2 sm:mt-[calc(var(--spacing-heading)+10.25rem)]"
    >
      {/* On wider screens the short no-token/answered cards are shallower than
          the enlarged envelope overlap. This geometry clearance keeps the
          paper apex below the heading; taller form states simply use the room. */}
      {/* The paper layers are 83.195% of this canvas. Adding 120.2px to the
          canvas adds exactly 100px to their visible width; subtracting that
          same 100px here preserves the card's approved measure. */}
      <motion.div
        data-slot="rsvp-envelope-card"
        className="relative z-20 mx-auto w-[calc(83.195%-100px)]"
        style={{ y: reduceMotion ? CARD_REST_Y : cardY }}
      >
        {children}
      </motion.div>

      <div
        aria-hidden
        data-slot="rsvp-envelope-paper"
        className="pointer-events-none relative -mt-[50%] aspect-[1446/1599] w-full"
      >
        <div className="absolute inset-0">
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

          <PaperLayer
            src="/envelope/front.png"
            className="z-30 origin-center rotate-[5deg]"
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
  );
}
