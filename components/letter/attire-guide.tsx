import Image from 'next/image';
import attireGuide from '@/public/attire-guide.png';
import { InViewReveal } from '@/components/letter/in-view-reveal';
import { PlateReveal } from '@/components/letter/letter-reveals';
import { BEAT } from '@/components/letter/motion-tokens';
import { SectionHeading } from '@/components/letter/section-heading';

/**
 * Attire guide — white section after DayItself, same header pattern. Shows
 * the palette/outfit illustration (public/attire-guide.png) with short
 * guidance notes below. Placeholder copy — edit freely. Swatch row and
 * richer guidance deliberately deferred (see 2026-07-21 discussion).
 *
 * MOTION: this is the only section whose body is a single painted picture, so it
 * DEVELOPS rather than rising into place — out of focus and a hair oversized,
 * settling sharp (see `PlateReveal`). The guidance notes follow a beat behind on
 * the letter's plain block entrance, because they are ordinary copy.
 */
export function AttireGuide() {
  return (
    <section className="bg-paper px-gutter py-section">
      <div className="mx-auto max-w-[56rem] text-center">
        <SectionHeading title="What to wear" kicker="Attire guide" />
        <PlateReveal className="mt-heading">
          <Image
            src={attireGuide}
            alt="Illustrated guests wearing the wedding palette — wine, raspberry, lilac, mauve, olive, forest green and pale gold"
            placeholder="blur"
            className="mx-auto h-auto w-full"
            sizes="(max-width: 640px) 92vw, min(80vw, 56rem)"
          />
        </PlateReveal>
        <InViewReveal
          delay={BEAT * 2}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3"
        >
          <p className="font-sans text-subhead text-ink">
            Semi-formal — garden party
          </p>
          <p className="text-body text-muted-foreground">
            We would love to see you in the colours above — wear one, or mix a
            few.
          </p>
          <p className="text-body text-muted-foreground">
            Please leave white and ivory for the couple.
          </p>
        </InViewReveal>
      </div>
    </section>
  );
}
