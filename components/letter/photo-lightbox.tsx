'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { MotionImage } from '@/components/letter/motion-image';

/**
 * Shared photo lightbox with a fly-to-centre morph, used by the prenup mosaic
 * and the Our Story polaroids. Tapping a photo doesn't pop a dialog — the
 * photo itself flies from its place in the page to the centre of the screen
 * and becomes the modal (motion's shared-layout `layoutId` morph), then flies
 * back on close.
 *
 * Contract: the in-page image must be a `MotionImage` with
 * `layoutId={photoLayoutId(id)}` and `transition={MORPH}`, where `id` matches
 * the `LightboxPhoto.id` passed here. Under `prefers-reduced-motion` the
 * caller passes `reduce` (and drops its own layoutId) — the lightbox then
 * plain-fades instead of morphing.
 *
 * This is deliberately NOT a shadcn/Radix Dialog: a portal that mounts and
 * animates via data-state would break the shared-element morph, which needs
 * both imgs to be motion elements sharing a layoutId.
 */
export type LightboxPhoto = {
  /** Stable id — pairs the page img with the lightbox img for the morph. */
  id: string;
  src: string;
  alt: string;
  /** Intrinsic pixel size — fixes the lightbox's aspect ratio so `object-cover` never crops. */
  w: number;
  h: number;
};

/** Spring shared by the page img and the lightbox img — keep both in step. */
export const MORPH = { type: 'spring', bounce: 0.12, duration: 0.5 } as const;

export const photoLayoutId = (id: string) => `photo-${id}`;

const subscribeNoop = () => () => {};
const getTrue = () => true;
const getFalse = () => false;

export function PhotoLightbox({
  photo,
  reduce,
  onClose,
}: {
  photo: LightboxPhoto | null;
  reduce: boolean;
  onClose: () => void;
}) {
  // Portal target only exists client-side; false during SSR/hydration.
  const mounted = useSyncExternalStore(subscribeNoop, getTrue, getFalse);

  // Lightbox housekeeping: Esc closes, page scroll locks while it is open.
  useEffect(() => {
    if (!photo) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [photo, onClose]);

  if (!mounted) return null;

  // Portaled to <body>: the letter sections carry their own stacking contexts
  // (dome overlaps via relative z-0/z-10), so a fixed overlay rendered in
  // place would be trapped under a sibling section. The layoutId morph still
  // tracks the page img across the portal boundary.
  return createPortal(
    <AnimatePresence>
      {photo && <Overlay key={photo.id} photo={photo} reduce={reduce} onClose={onClose} />}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * Centered full-size view. The img shares its `layoutId` with the page img,
 * so mounting it makes the photo fly into the centre; unmounting flies it
 * back. `aspectRatio` from the photo's intrinsic size means the clamped box
 * matches the photo exactly, so `object-cover` never crops once settled.
 */
function Overlay({
  photo,
  reduce,
  onClose,
}: {
  photo: LightboxPhoto;
  reduce: boolean;
  onClose: () => void;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-ink/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />
      {/* Wrapper shrink-wraps the img so the close button can anchor to the
          photo's own top-right corner, not the viewport's. */}
      <div className="relative">
        <MotionImage
          layoutId={reduce ? undefined : photoLayoutId(photo.id)}
          transition={MORPH}
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
            : {})}
          src={photo.src}
          alt={photo.alt}
          width={photo.w}
          height={photo.h}
          sizes="(max-width: 652px) 92vw, 600px"
          className="max-h-[85svh] max-w-[92vw] object-cover"
          style={{ aspectRatio: `${photo.w} / ${photo.h}` }}
        />
        {/* Fades in a beat after the photo lands (the wrapper sits at the
            final position from frame one, so an instant button would float
            alone while the photo is still in flight). */}
        <motion.button
          type="button"
          onClick={onClose}
          aria-label="Close photo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.2, delay: reduce ? 0 : 0.3 } }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          className="absolute top-3 right-3 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-paper backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <X className="size-5" strokeWidth={2.25} />
        </motion.button>
      </div>
    </motion.div>
  );
}
