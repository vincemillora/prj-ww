import Image from 'next/image';
import laceBackground from '@/public/lace-bg.png';

/**
 * The drapery artwork every public screen stands on, and its scrim.
 *
 * This is a component rather than three copies of an `<Image>` because the
 * invitation, the loading screen and the letter's hero have to paint the SAME
 * backdrop for the handoff to work: the envelope dissolves, the loading screen
 * repaints, the hero arrives, and because nothing behind them changes the guest
 * reads one continuous scene instead of three page loads. Kept as markup in
 * three places, that invariant survived only as a comment.
 *
 * Renders into whatever `relative` container it is given — both layers are
 * absolutely positioned, so the caller owns the sizing and stacking.
 *
 * The 30% scrim is load-bearing and NEUTRAL black, not ink-tinted; it is what
 * carries white type over the drapery. See the measured contrast table in
 * components/letter/opening-backdrop.tsx before changing it. That file paints
 * its own copy rather than using this one, because its image is scroll-scaled
 * inside a `motion` layer and its scrim has to sit in the sticky viewport — if
 * this value changes, change it there too.
 */
export function LaceBackdrop() {
  return (
    <>
      <Image
        src={laceBackground}
        alt=""
        fill
        preload
        placeholder="blur"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-black/30" />
    </>
  );
}
