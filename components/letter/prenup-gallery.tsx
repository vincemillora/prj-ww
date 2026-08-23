'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { MotionImage } from '@/components/letter/motion-image';
import { MORPH, PhotoLightbox, photoLayoutId } from '@/components/letter/photo-lightbox';
import { cn } from '@/lib/utils';

export type Shot = {
  /** Alt text — also labels the striped placeholder when `image` is unset. */
  alt: string;
  /** Intrinsic pixel size. Landscape (`w > h`) is what earns a 2-column tile. */
  w: number;
  h: number;
  image?: string;
};

/**
 * Client half of the prenup section: a vertical-scroll-driven horizontal gallery. Tapping a tile morphs
 * the photo into the shared `PhotoLightbox` (see photo-lightbox.tsx for the
 * fly-to-centre mechanics). Placeholder tiles (no `image`) are inert.
 */
export function PrenupScrollGallery({ shots }: { shots: Shot[] }) {
  const [active, setActive] = useState<Shot | null>(null);
  const [distance, setDistance] = useState(0);
  const reduce = !!useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const measure = () => {
      setDistance(Math.max(track.scrollWidth - viewport.clientWidth, 0));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, [shots.length]);

  return (
    <>
      <div
        ref={containerRef}
        data-testid="prenup-scroll-container"
        className="relative overflow-x-clip"
        style={{ height: reduce ? 'auto' : `calc(100svh + ${distance}px)` }}
      >
        <div
          ref={viewportRef}
          className={cn(
            'flex items-center',
            reduce
              ? 'relative overflow-x-auto overscroll-x-contain'
              : 'sticky top-0 h-svh overflow-hidden',
          )}
          role="region"
          aria-label="Prenup photos"
        >
          <motion.div
            ref={trackRef}
            className="flex w-max gap-4 will-change-transform sm:gap-6"
            style={{ x: reduce ? 0 : x }}
          >
            {shots.map((shot) => (
              <Tile
                key={shot.alt}
                shot={shot}
                reduce={reduce}
                onOpen={() => setActive(shot)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <PhotoLightbox
        photo={
          active?.image
            ? {
                id: `prenup-${active.alt}`,
                src: active.image,
                alt: active.alt,
                w: active.w,
                h: active.h,
              }
            : null
        }
        reduce={reduce}
        onClose={() => setActive(null)}
      />
    </>
  );
}

/** One photo. No frame, no rounding, no shadow — the image is the whole tile. */
function Tile({
  shot,
  reduce,
  onOpen,
}: {
  shot: Shot;
  reduce: boolean;
  onOpen: () => void;
}) {
  const aspectRatio = `${shot.w} / ${shot.h}`;

  if (!shot.image) {
    return (
      <div
        className="relative h-[20rem] flex-none overflow-hidden sm:h-[30rem]"
        style={{ aspectRatio }}
      >
        <div className="flex size-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--ink),var(--ink)_1px,var(--paper)_1px,var(--paper)_10px)]">
          <span className="font-mono text-micro uppercase tracking-[0.14em] text-ink">
            photo · {shot.alt}
          </span>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View photo: ${shot.alt}`}
      className={cn(
        'relative h-[20rem] flex-none cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink sm:h-[30rem]',
      )}
      style={{ aspectRatio }}
    >
      <MotionImage
        layoutId={reduce ? undefined : photoLayoutId(`prenup-${shot.alt}`)}
        transition={MORPH}
        src={shot.image}
        alt={shot.alt}
        fill
        sizes={
          '(max-width: 639px) 80vw, 35vw'
        }
        className="object-cover"
      />
    </button>
  );
}
