"use client";

import type { CSSProperties } from "react";

import { MORPH, photoLayoutId } from "@/components/letter/photo-lightbox";
import { MotionImage } from "@/components/letter/motion-image";
import type { Memory } from "@/components/letter/our-story/memories";
import { cn } from "@/lib/utils";

export function Polaroid({
  memory,
  reduce,
  onOpen,
}: {
  memory: Memory;
  reduce: boolean;
  onOpen: () => void;
}) {
  const { image, caption, title, tilt } = memory;

  return (
    <figure
      className="relative w-[min(56vw,13rem)] rounded-[2px] bg-paper p-3 pb-9 shadow-[0_14px_28px_-6px_color-mix(in_srgb,var(--ink)_50%,transparent),0_2px_5px_color-mix(in_srgb,var(--ink)_30%,transparent)] sm:w-64"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="relative aspect-square overflow-hidden rounded-[1px] bg-ink shadow-[inset_0_2px_10px_color-mix(in_srgb,var(--ink)_30%,transparent)]">
        {image ? (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`View photo: ${title}`}
            className="block size-full cursor-zoom-in focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-paper"
          >
            <MotionImage
              layoutId={reduce ? undefined : photoLayoutId(`story-${memory.date}`)}
              transition={MORPH}
              src={image}
              alt={title}
              width={600}
              height={600}
              sizes="(max-width: 639px) min(56vw, 13rem), 16rem"
              className="size-full object-cover"
            />
          </button>
        ) : (
          <div className="flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_1px,transparent_1px,transparent_10px)]">
            <span className="font-mono text-micro uppercase tracking-[0.14em] text-paper">
              photo · {caption.replace(/\s*♡$/, "")}
            </span>
          </div>
        )}
      </div>

      <figcaption className="absolute inset-x-3 bottom-1 text-center font-script text-subhead leading-tight text-ink">
        {caption}
      </figcaption>
    </figure>
  );
}

export function InkCharm({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: CSSProperties;
}) {
  const mask = `url('${src}')`;

  return (
    <span
      aria-hidden
      className={cn("block bg-paper", className)}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        ...style,
      }}
    />
  );
}

export function CameraCharm({ className }: { className?: string }) {
  return (
    <InkCharm
      src="/icons/hand_drawn/wedding_2/polaroid-camera.svg"
      className={cn("aspect-[91.8867/89.3203]", className)}
    />
  );
}
