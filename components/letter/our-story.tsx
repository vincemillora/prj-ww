"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";

import { PhotoLightbox } from "@/components/letter/photo-lightbox";
import { SectionHeading } from "@/components/letter/section-heading";
import { MEMORIES, type Memory } from "@/components/letter/our-story/memories";
import {
  CameraCharm,
  InkCharm,
  Polaroid,
} from "@/components/letter/our-story/story-art";
import { InViewReveal } from "@/components/letter/in-view-reveal";
import { BEAT } from "@/components/letter/motion-tokens";
import { TypedText } from "@/components/letter/typed-text";
import { OrnamentDrift } from "@/components/letter/ornament-drift";
import { Vine, VineFlorals } from "@/components/letter/our-story/vine-art";
import {
  VINE_REACH,
  VINE_UNIT_ASPECT,
  vineSide,
} from "@/components/letter/our-story/vine-geometry";
import { cn } from "@/lib/utils";

const BLEED_X =
  "w-[calc(100%+var(--spacing-gutter)*2)] -translate-x-gutter overflow-hidden";
const SPRIG_EDGE_ZONE = 26;
const LACE_URL = "url('/laces/Untitled-1%20%5BRecovered%5D-15.svg?v=3')";
const LACE_BAND_CLASS =
  "pointer-events-none relative z-30 h-[4.5rem] overflow-hidden bg-paper sm:h-24";

function LaceBand({ flipped = false }: { flipped?: boolean }) {
  return (
    <div aria-hidden className={`${LACE_BAND_CLASS}${flipped ? " rotate-180" : ""}`}>
      <div
        data-slot="our-story-lace"
        className="size-full bg-ink"
        style={{
          maskImage: LACE_URL,
          WebkitMaskImage: LACE_URL,
          maskRepeat: "repeat-x",
          WebkitMaskRepeat: "repeat-x",
          maskSize: "auto 100%",
          WebkitMaskSize: "auto 100%",
        }}
      />
    </div>
  );
}

export function OurStory() {
  const [active, setActive] = useState<Memory | null>(null);
  const reduce = !!useReducedMotion();

  return (
    <section className="relative z-10 bg-ink">
      <LaceBand />
      <div className="relative px-gutter py-section text-center">
        <div className="mx-auto max-w-[64rem] lg:max-w-[80rem]">
          <SectionHeading tone="white" title="Our Story" kicker="How it began" />

          <div className="relative mx-auto mt-heading max-w-[52rem] lg:max-w-[64rem] xl:max-w-[72rem]">
            {/* The two charms are the section's ornaments, so they drift in and
                back out with the scroll (see OrnamentDrift). The VINES and their
                florals below are deliberately NOT wrapped — they are the
                section's structure, and they were excluded by request. The two
                LaceBands are excluded for the same reason: they are the ink
                section's real top and bottom edges, not decoration on it. */}
            <OrnamentDrift className="flex justify-center" distance={14}>
              <CameraCharm className="pointer-events-none w-24 sm:w-28" />
            </OrnamentDrift>

            {/* Row height and vine units are paired. If story copy changes,
                re-measure the tallest memory before adjusting either value. */}
            <div className="relative [--row-h:46rem] sm:[--row-h:44rem]">
              <Vine
                rows={MEMORIES.length}
                reach={VINE_REACH.mobile}
                className={cn(BLEED_X, "sm:hidden")}
              />
              <Vine
                rows={MEMORIES.length}
                reach={VINE_REACH.desktop}
                className="hidden sm:block"
              />
              <VineFlorals
                rows={MEMORIES.length}
                reach={VINE_REACH.mobile}
                edgeZone={SPRIG_EDGE_ZONE}
                unitAspect={VINE_UNIT_ASPECT.mobile}
                media="mobile"
                className={cn(BLEED_X, "sm:hidden")}
              />
              <VineFlorals
                rows={MEMORIES.length}
                reach={VINE_REACH.desktop}
                media="desktop"
                className="hidden sm:block"
              />

              <div aria-hidden className="h-[calc(var(--row-h)*0.2)]" />
              {/*
                `overflow-x-clip`, not `overflow-x-hidden`: the memories travel
                40px sideways on their way in and out, and a right-hand block
                already sits against the measure's edge — without a clip that
                offset can widen the document and flash a horizontal scrollbar
                mid-animation. Clip contains it without making this a scroll
                container, which the vines behind it are not clipped by.
              */}
              <ol className="relative overflow-x-clip">
                {MEMORIES.map((memory, index) => {
                  const onRight = vineSide(index) === "right";

                  // Shared by both halves of the memory, so the print and its
                  // caption cannot drift onto different curves or sides. No
                  // `distance`: `slideAt` is at its default here, so these
                  // always travel on x and the vertical fallback is never read.
                  const arrival = {
                    // Both halves come from the side of the vine the memory
                    // hangs on, and leave the same way. Unlike Day itself's
                    // rail, the vine keeps both sides on a phone, so the sides
                    // are real at every width. The Polaroid's own tilt is on
                    // the figure inside, so it survives this transform.
                    slideFrom: onRight ? ("right" as const) : ("left" as const),
                    // Tall rows (46rem): at 40% the memory would arrive long
                    // after its top had passed the fold.
                    tall: true,
                    duration: 0.7,
                    ease: "easeOut" as const,
                  };

                  return (
                    <li
                      key={memory.date}
                      className="relative flex h-[var(--row-h)] flex-col items-center justify-center sm:items-start"
                    >
                      {/*
                        The photo and the caption are TWO reveals sharing one
                        layout box, not one reveal around both: the print lands
                        first and the words follow two beats behind, which is
                        the order a photograph and its caption are read in.
                        Wrapping both in a third reveal would fade the pair a
                        second time and move everything twice.
                      */}
                      <div
                        className={cn(
                          "flex w-[62%] flex-col items-center sm:w-[42%]",
                          onRight
                            ? "ml-[38%] items-start sm:ml-[58%]"
                            : "mr-[38%] items-end sm:mr-[58%]",
                        )}
                      >
                        <InViewReveal {...arrival}>
                          <Polaroid
                            memory={memory}
                            reduce={reduce}
                            onOpen={() => setActive(memory)}
                          />
                        </InViewReveal>

                        <InViewReveal
                          {...arrival}
                          // Two beats behind the print. The delay is on the
                          // ENTRANCE only — the exit rides on `initial`, which
                          // carries no delay — so the pair staggers in and
                          // leaves together. Arriving is worth watching;
                          // leaving in sequence would just be slow.
                          delay={BEAT * 2}
                          className={cn(
                            "mt-6 max-w-sm px-2",
                            onRight ? "text-left" : "text-right",
                          )}
                        >
                          <p className="font-sans text-label font-medium uppercase tracking-[0.16em] text-paper">
                            {memory.date}
                          </p>
                          {/* Written out as the memory arrives, and unwritten
                              when it leaves — the same hand as the section
                              headings. The date above and body below are static:
                              three typed lines in one block would turn a memory
                              into a terminal. */}
                          <TypedText
                            as="h3"
                            className="mt-1 font-script text-entry text-paper"
                            testId="story-title"
                            text={memory.title}
                          />
                          <p className="mt-2 text-body text-paper">
                            {memory.body}
                          </p>
                        </InViewReveal>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div aria-hidden className="h-[calc(var(--row-h)*0.2)]" />
            </div>

            <OrnamentDrift
              className="relative flex flex-col items-center"
              distance={14}
            >
              <InkCharm
                src="/icons/hand_drawn/illustrations/wedding-rings-linework.svg"
                className="aspect-[211.1815/126.2234] mt-8 w-44 sm:w-52"
              />
            </OrnamentDrift>
          </div>
        </div>
      </div>

      <LaceBand flipped />

      <PhotoLightbox
        photo={
          active?.image
            ? {
                id: `story-${active.date}`,
                src: active.image,
                alt: active.title,
                w: 600,
                h: 600,
              }
            : null
        }
        reduce={reduce}
        onClose={() => setActive(null)}
      />
    </section>
  );
}
