import { CountdownLocket } from '@/components/letter/countdown-locket';
import { CountdownDetails } from '@/components/letter/countdown-band';
import { InViewReveal } from '@/components/letter/in-view-reveal';
import { BEAT } from '@/components/letter/motion-tokens';
import { COUPLE } from '@/lib/wedding';

/**
 * The keepsake welcome section that opens the letter before Our Story.
 *
 * MOTION: the band arrives as four beats, not one. It used to be a single
 * 0.9s reveal wrapped around everything, which meant the locket, two
 * paragraphs, the countdown and the signature all moved as one slab — the
 * crudest motion on the page, on the first thing a guest reads after the hero.
 *
 * The beats follow the reading order, which is also the order of the keepsake:
 * the locket, then the note, then the date it counts to, then the signature.
 * Total lead-in is 3 x BEAT, so the signature starts a quarter second after the
 * locket rather than arriving on its own scroll.
 */
export function WelcomeBand() {
  return (
    <section className="relative z-10 bg-paper px-gutter pt-28 pb-section text-center sm:pt-32">
      <div className="flex flex-col items-center">
        <InViewReveal>
          <CountdownLocket />
        </InViewReveal>

        <div className="max-w-[36rem] text-center text-ink">
          <InViewReveal delay={BEAT}>
            <p className="font-sans text-body leading-relaxed">
              As we prepare to celebrate our wedding day, it would mean so much
              to have you there with us. This letter has everything you&apos;ll
              need to join us — the schedule, the setting, how to RSVP, and a few
              thoughtful extras along the way.
            </p>
            <p className="mt-5 font-sans text-body leading-relaxed">
              The date below marks the day our next chapter begins. With the
              date set, we&apos;re counting down to a celebration filled with
              warmth, laughter, and the people we love — and we can&apos;t wait
              to share it with you.
            </p>
          </InViewReveal>

          <InViewReveal delay={BEAT * 2}>
            <CountdownDetails className="mt-heading" />
          </InViewReveal>

          <InViewReveal delay={BEAT * 3}>
            <p className="mt-heading font-script text-entry leading-none">
              with love
            </p>
            <p className="mt-2 font-script text-title leading-none">{COUPLE}</p>
          </InViewReveal>
        </div>
      </div>
    </section>
  );
}
