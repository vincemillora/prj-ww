import { OrnamentDrift } from '@/components/letter/ornament-drift';
import { SectionHeading } from '@/components/letter/section-heading';

/**
 * Full-bleed string of party lights on paper, hung in the seam between Our
 * Story's ink section and DayItself's photo ground.
 *
 * Masked rather than served as an image, the same way the peony border is: the
 * source drawing is blue line art, and a mask recolours it to `--ink` without an
 * edited copy of the asset.
 *
 * One screen tall (`min-h-lvh`): a placeholder note for the pre-wedding photos
 * sits in the middle, and the lights are pinned to the bottom edge with
 * `mt-auto` so they always stand on the seam with DayItself.
 *
 * MOTION: the lights are pure ornament, so they drift in and back out with the
 * scroll (see OrnamentDrift).
 */
export function StringLightsBand() {
  const mask = "url('/icons/hand_drawn/illustrations/band-string-lights.svg')";

  return (
    <section className="flex min-h-lvh flex-col bg-paper pt-2">
      <div className="flex flex-1 items-center justify-center px-gutter py-section">
        <SectionHeading
          title="Pre-wedding photos"
          kicker="You can see our pre-wedding photos here soon."
        />
      </div>
      <OrnamentDrift className="mt-auto" distance={16}>
        <span
          aria-hidden
          data-slot="string-lights-band"
          className="block aspect-[1032.35/411.5] w-full bg-ink"
          style={{
            maskImage: mask,
            WebkitMaskImage: mask,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskSize: '100% auto',
            WebkitMaskSize: '100% auto',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
      </OrnamentDrift>
    </section>
  );
}
