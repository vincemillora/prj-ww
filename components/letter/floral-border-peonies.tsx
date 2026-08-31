import { OrnamentDrift } from '@/components/letter/ornament-drift';

/**
 * Full-bleed peony border painted in the letter's ink.
 *
 * MOTION: pure ornament, so it drifts in and back out with the scroll rather
 * than latching on once (see OrnamentDrift). The drift lives here rather than at
 * the call site because it belongs to the ornament, not to the seam it happens
 * to be sitting in.
 */
export function FloralBorderPeonies() {
  const mask = "url('/icons/hand_drawn/illustrations/floral-border-peonies.svg')";

  return (
    <OrnamentDrift distance={16}>
      <span
        aria-hidden
        className="block aspect-[1032.1908/270.9679] w-full bg-ink"
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskSize: 'calc(100% + 20px) auto',
          WebkitMaskSize: 'calc(100% + 20px) auto',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />
    </OrnamentDrift>
  );
}
