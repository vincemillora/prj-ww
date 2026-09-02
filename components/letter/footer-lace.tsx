import Image from 'next/image';

import { InViewReveal } from '@/components/letter/in-view-reveal';
import { BEAT } from '@/components/letter/motion-tokens';
import { COUPLE } from '@/lib/wedding';
import laceBackground from '@/public/lace-bg.png';

/**
 * The letter's sign-off, over the lace drapery.
 *
 * MOTION: the monogram rises first and the contact block follows a beat behind,
 * so the closing reads in the order a hand would have written it. The slow hover
 * zoom on the monogram stays exactly as it was — it is the one deliberate
 * easter egg down here, and it is a hover state rather than an entrance.
 *
 * Nothing in the footer drifts back out. It is the end of the document: there is
 * nothing below it to scroll it away, and a sign-off that fades as you reach it
 * would be the one exit on the page that undoes its own content.
 */
export function FooterLace() {
  return (
    <footer
      // `bg-lace`, not `bg-paper`: the drapery below covers this surface
      // completely, so the declared background should be the drapery's own
      // tone — otherwise the frame before the image decodes flashes white under
      // the white sign-off type.
      className="relative isolate overflow-hidden bg-lace py-section"
      aria-label="Decorative wedding drapery"
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0"
      >
        <Image
          alt=""
          className="object-cover"
          fill
          // Blurred, but still LAZY. The drapery is the last thing on a long
          // page, so making it eager would have it compete with the hero for
          // bandwidth on the screen that matters most (AttireGuide and the RSVP
          // backdrop stay lazy for the same reason). The LQIP is what closes the
          // gap: it paints immediately, so the white sign-off type has real
          // artwork behind it from the first frame instead of the flat fallback.
          placeholder="blur"
          priority={false}
          sizes="100vw"
          src={laceBackground}
        />
      </div>
      <InViewReveal className="relative z-10">
        <Image
          alt=""
          className="mx-auto block h-auto w-[500px] max-w-full transition-transform duration-[2500ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-90 motion-reduce:transition-none motion-reduce:hover:scale-100"
          height={500}
          sizes="500px"
          src="/couple-logo-white.svg"
          width={500}
        />
      </InViewReveal>
      <InViewReveal delay={BEAT * 2} className="relative z-10">
        <address className="px-gutter text-center text-paper not-italic">
          <p className="font-sans text-body">
            For any questions, please contact us at:
          </p>
          <p className="mt-6 font-sans text-body">------</p>
          <p className="mt-6 font-script text-title">{COUPLE}</p>
          <p className="mt-2 font-sans text-body">with love</p>
        </address>
      </InViewReveal>
    </footer>
  );
}
