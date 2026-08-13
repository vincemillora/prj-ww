'use client';

import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
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
 * Client half of the prenup section: the mosaic grid. Tapping a tile morphs
 * the photo into the shared `PhotoLightbox` (see photo-lightbox.tsx for the
 * fly-to-centre mechanics). Placeholder tiles (no `image`) are inert.
 */
export function PrenupMosaic({ shots, mobileCount }: { shots: Shot[]; mobileCount: number }) {
  const [active, setActive] = useState<Shot | null>(null);
  const reduce = !!useReducedMotion();

  return (
    <>
      {/* `auto-rows-*` is the shared tile height; `dense` stops a 2-column tile
          from leaving the column beside it empty. */}
      {/* `mb-1.5` matches the grid's own `gap-1.5`: the gutter between tiles is
          6px, so the bottom row met the peony border with no gap at all while
          every other edge in the mosaic had one. */}
      <div className="mt-heading mb-1.5 grid auto-rows-[15rem] grid-flow-row-dense grid-cols-2 gap-1.5 sm:auto-rows-[22rem] sm:grid-cols-4">
        {shots.map((shot, index) => (
          <Tile
            key={shot.alt}
            shot={shot}
            reduce={reduce}
            // Past the mobile budget: shown on desktop, dropped on phones.
            hiddenOnMobile={index >= mobileCount}
            onOpen={() => setActive(shot)}
          />
        ))}
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
  hiddenOnMobile,
  onOpen,
}: {
  shot: Shot;
  reduce: boolean;
  hiddenOnMobile: boolean;
  onOpen: () => void;
}) {
  const span = shot.w > shot.h ? 'col-span-2' : 'col-span-1';
  const hidden = hiddenOnMobile && 'max-sm:hidden';

  if (!shot.image) {
    return (
      <div className={cn('relative overflow-hidden', span, hidden)}>
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
        'relative cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink',
        span,
        hidden,
      )}
    >
      <MotionImage
        layoutId={reduce ? undefined : photoLayoutId(`prenup-${shot.alt}`)}
        transition={MORPH}
        src={shot.image}
        alt={shot.alt}
        fill
        sizes={
          shot.w > shot.h
            ? '(max-width: 639px) 100vw, 50vw'
            : '(max-width: 639px) 50vw, 25vw'
        }
        className="object-cover"
      />
    </button>
  );
}
