"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { Dome } from "@/components/letter/dome";
import { PhotoLightbox } from "@/components/letter/photo-lightbox";
import { SectionHeading } from "@/components/letter/section-heading";
import { MEMORIES, type Memory } from "@/components/letter/our-story/memories";
import {
  CameraCharm,
  InkCharm,
  Polaroid,
} from "@/components/letter/our-story/story-art";
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

export function OurStory() {
  const [active, setActive] = useState<Memory | null>(null);
  const reduce = !!useReducedMotion();

  return (
    <section className="relative z-10">
      <Dome direction="up" className="bg-paper" />
      <div className="relative px-gutter pt-section pb-section text-center sm:pt-dome">
        <div className="mx-auto max-w-[64rem] lg:max-w-[80rem]">
          <SectionHeading tone="white" title="Our Story" kicker="How it began" />

          <div className="relative mx-auto mt-[calc(var(--spacing-heading)+79px)] max-w-[52rem] sm:mt-[calc(var(--spacing-heading)+93px)] lg:max-w-[64rem] xl:max-w-[72rem]">
            <CameraCharm className="pointer-events-none absolute left-1/2 top-0 z-20 w-24 -translate-x-1/2 -translate-y-[85%] sm:w-28" />

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
                className={cn(BLEED_X, "sm:hidden")}
              />
              <VineFlorals
                rows={MEMORIES.length}
                reach={VINE_REACH.desktop}
                className="hidden sm:block"
              />

              <div aria-hidden className="h-[calc(var(--row-h)*0.2)]" />
              <ol className="relative">
                {MEMORIES.map((memory, index) => {
                  const onRight = vineSide(index) === "right";

                  return (
                    <li
                      key={memory.date}
                      className="relative flex h-[var(--row-h)] flex-col items-center justify-center sm:items-start"
                    >
                      <motion.div
                        initial={
                          reduce ? undefined : { opacity: 0, y: 24 }
                        }
                        whileInView={
                          reduce ? undefined : { opacity: 1, y: 0 }
                        }
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={cn(
                          "flex w-[62%] flex-col items-center sm:w-[42%]",
                          onRight
                            ? "ml-[38%] items-start sm:ml-[58%]"
                            : "mr-[38%] items-end sm:mr-[58%]",
                        )}
                      >
                        <Polaroid
                          memory={memory}
                          reduce={reduce}
                          onOpen={() => setActive(memory)}
                        />

                        <div
                          className={cn(
                            "mt-6 max-w-sm px-2",
                            onRight ? "text-left" : "text-right",
                          )}
                        >
                          <p className="font-sans text-label font-medium uppercase tracking-[0.16em] text-paper">
                            {memory.date}
                          </p>
                          <h3 className="mt-1 font-script text-entry text-paper">
                            {memory.title}
                          </h3>
                          <p className="mt-2 text-body text-paper">
                            {memory.body}
                          </p>
                        </div>
                      </motion.div>
                    </li>
                  );
                })}
              </ol>
              <div aria-hidden className="h-[calc(var(--row-h)*0.2)]" />
            </div>

            <div className="relative flex flex-col items-center">
              <InkCharm
                src="/icons/hand_drawn/illustrations/wedding-rings-linework.svg"
                className="aspect-[211.1815/126.2234] mt-8 w-44 sm:w-52"
              />
            </div>
          </div>
        </div>
      </div>

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
