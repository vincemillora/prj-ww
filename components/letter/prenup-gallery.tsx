'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { MotionImage } from '@/components/letter/motion-image';
import { MORPH, PhotoLightbox, photoLayoutId } from '@/components/letter/photo-lightbox';
import { cn } from '@/lib/utils';

const EXPOSURE_HEIGHT =
  'h-[min(20rem,calc(100svh-8rem))] sm:h-[min(30rem,calc(100svh-9rem))]';

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
            className="relative flex w-max gap-2 bg-film px-2 py-14 will-change-transform sm:gap-3 sm:px-3 sm:py-16"
            style={{ x: reduce ? 0 : x }}
            role="list"
            aria-label="Prenup film strip"
          >
            <SprocketRail position="top" />
            {shots.map((shot, index) => (
              <div
                key={shot.alt}
                role="listitem"
                className="relative flex-none border border-paper"
              >
                <span
                  aria-hidden="true"
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-micro tabular-nums tracking-[0.12em] text-paper"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Tile
                  shot={shot}
                  reduce={reduce}
                  onOpen={() => setActive(shot)}
                />
              </div>
            ))}
            <SprocketRail position="bottom" />
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

function SprocketRail({ position }: { position: 'top' | 'bottom' }) {
  const patternId = `prenup-sprockets-${position}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn(
        'pointer-events-none absolute inset-x-0 h-4 w-full text-paper',
        position === 'top' ? 'top-3' : 'bottom-3',
      )}
    >
      <defs>
        <pattern
          id={patternId}
          width="24"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect x="5" y="2" width="12" height="12" rx="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

/** One exposure. The surrounding film strip owns its frame and markings. */
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
        className={cn('relative flex-none overflow-hidden', EXPOSURE_HEIGHT)}
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
        'relative flex-none cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper',
        EXPOSURE_HEIGHT,
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
