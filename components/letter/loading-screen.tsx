import Image from 'next/image';
import { LaceBackdrop } from '@/components/letter/lace-backdrop';
import { COUPLE_NAMES } from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * The public site's loading screen, shared by `/` and `/rsvp`.
 *
 * It is NOT a neutral spinner on purpose. It stands on the same `LaceBackdrop`
 * as the invitation and the letter's hero, and carries the same white monogram
 * the hero holds inside its lace frame. The background therefore never changes
 * across the journey: the envelope dissolves, the monogram settles into the
 * middle, and the hero's lace frame closes around it. The guest reads one scene
 * opening, not three page loads.
 *
 * Because the backdrop was already fetched by the screen before it, this paints
 * from cache on the first frame rather than flashing ink. Everything animated
 * here is CSS (app/globals.css) so it needs no JS — which matters, because this
 * screen is usually standing in for JS that has not arrived yet.
 *
 * The names are set as a `<p>`, deliberately not an `<h1>`. This screen is a
 * Suspense fallback — transient chrome that is swapped out a moment later — and
 * a heading that exists only while a route is loading contributes nothing to
 * the document outline the guest actually reads.
 */
export function LetterLoadingScreen({ caption }: { caption: string }) {
  return (
    <main className="letter-theme relative flex h-lvh flex-col items-center justify-center overflow-hidden bg-ink px-gutter text-center">
      <LaceBackdrop />
      {/* The monogram is a thin white line drawing over a mid-tone photograph,
          so the backdrop's own scrim alone leaves it washed out. On the letter's
          hero the lace frame and its frosted window do this job; here a soft
          pool of ink stands in for them. */}
      <div aria-hidden className="letter-loading-vignette absolute inset-0" />

      <div className="relative flex flex-col items-center text-paper">
        <div
          aria-hidden
          className="letter-loading-mark relative aspect-square w-[min(44vw,10.5rem)] drop-shadow-[0_2px_18px_color-mix(in_srgb,var(--ink)_85%,transparent)]"
        >
          <Image
            src="/couple-logo-white.svg"
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 45rem) 44vw, 10.5rem"
            className="object-contain"
          />
        </div>

        <p className="mt-6 flex items-baseline gap-2 font-script text-title leading-none drop-shadow-[0_1px_10px_color-mix(in_srgb,var(--ink)_65%,transparent)]">
          <span>{NAME_A}</span>
          <span className="opacity-70">&amp;</span>
          <span>{NAME_B}</span>
        </p>

        {/* Indeterminate progress. The bar is decorative — `role="status"` sits
            on the caption instead, so assistive tech is given the words
            ("Opening your letter") rather than a shape it cannot read. */}
        <div aria-hidden className="letter-loading-track mt-7 h-[2px] w-44 rounded-full">
          <span className="letter-loading-sweep block h-full w-2/5 rounded-full" />
        </div>

        <p
          role="status"
          className="mt-6 font-sans text-label uppercase tracking-[0.35em] opacity-80"
        >
          {caption}
        </p>
      </div>
    </main>
  );
}
