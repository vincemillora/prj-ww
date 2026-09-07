import { CountdownLocket } from '@/components/letter/countdown-locket';
import { CountdownDetails } from '@/components/letter/countdown-band';
import { InViewReveal } from '@/components/letter/in-view-reveal';
import { TypedLines } from '@/components/letter/typed-text';
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
 *
 * The signature is the exception: it is typed rather than revealed, on its own
 * in-view trigger, so it starts when the guest has actually reached it instead
 * of a beat after the locket.
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

          {/*
            The signature is the one block here that is not a rise: it is
            written. See TypedLines — it types on entry and erases on exit, and
            it owns its own in-view trigger, so it is NOT wrapped in an
            InViewReveal that would fade the same words a second time.
          */}
          <TypedLines
            className="mt-heading"
            lines={[
              {
                className: 'font-script text-entry leading-none',
                text: 'with love',
              },
              {
                className: 'mt-2 font-script text-title leading-none',
                text: COUPLE,
              },
            ]}
            testId="welcome-sign-off"
          />
        </div>
      </div>
    </section>
  );
}
