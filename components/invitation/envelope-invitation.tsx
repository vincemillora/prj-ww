'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COUPLE_NAMES } from '@/lib/wedding';
import envelopeBack from '@/public/index-invitation/back.png';
import envelopeFront from '@/public/index-invitation/front.png';
import laceCollar from '@/public/index-invitation/lace.png';

/**
 * How long the envelope is allowed to open before the router is told to move.
 *
 * The beat is deliberate. `/rsvp`'s shell is prefetched, so on a warm connection
 * the navigation resolves faster than the eye can read it and the tap would land
 * as an unexplained jump-cut. Holding the push for one beat lets the envelope
 * visibly leave first, and on a cold connection the same animation covers the
 * fetch instead of leaving the screen frozen — which is what made the old plain
 * `<a>` feel hung.
 */
const OPEN_BEAT_MS = 460;

/**
 * How long the opened state is allowed to stand before the invitation is put
 * back. The envelope animates to `opacity: 0`, so if the push never lands (a
 * dropped connection, a route that fails to fetch) the guest would be left
 * looking at an empty backdrop with no way back. Restoring the envelope gives
 * them something to tap again.
 */
const OPEN_RESET_MS = 6000;

/** "Vince and Kc" — the prose form of `COUPLE` ("Vince & Kc"), for running text. */
const SENDERS = COUPLE_NAMES.join(' and ');

/**
 * The invitation stage: the senders' line, the tappable envelope, and the hint
 * beneath it.
 *
 * This is a client component for one reason — the handoff into `/rsvp` has to be
 * animated, and the animation has to start on the tap rather than on the
 * response. Navigation is a client transition (`next/link` + `router.push`), not
 * a document load, so the browser never blanks the page while the next route
 * streams in.
 *
 * The exit is choreographed against the loading screen and the letter's hero:
 * all three stand on the same `LaceBackdrop`, so only the foreground moves and
 * the journey reads as one continuous scene. The envelope lifts towards the
 * viewer and dissolves — nothing is drawn out of it, since a stand-in sheet next
 * to this artwork only read as a plain white rectangle.
 */
export function EnvelopeInvitation({ href }: { href: string }) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);

  /**
   * The push is deferred here rather than from the click handler so React owns
   * the timers: navigating away unmounts this component, which cancels both for
   * free. Re-entering `opening` while it is already true is a no-op, so a second
   * tap cannot queue a second push.
   */
  useEffect(() => {
    if (!opening) return;
    const push = window.setTimeout(() => router.push(href), OPEN_BEAT_MS);
    const restore = window.setTimeout(() => setOpening(false), OPEN_RESET_MS);
    return () => {
      window.clearTimeout(push);
      window.clearTimeout(restore);
    };
  }, [opening, href, router]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Modified clicks and non-primary buttons belong to the browser: this is a
    // real anchor with a real href, so open-in-new-tab keeps working.
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    // Read the motion preference here rather than through a hook: a hook would
    // have to guess during SSR, and a wrong guess leaves the guest staring at a
    // stalled animation. In an event handler the real value is available.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Let Link navigate immediately, unanimated.
    }

    event.preventDefault();
    setOpening(true);
  }

  return (
    <div
      className="invitation-stage relative flex h-dvh flex-col items-center justify-center px-gutter text-center"
      data-opening={opening || undefined}
    >
      <div className="invitation-senders text-paper">
        <p className="font-sans text-label uppercase tracking-[0.08em]">
          you have received a letter from
        </p>
        <p className="font-script text-title">{SENDERS}</p>
      </div>

      {/* Default prefetch (`auto`), deliberately NOT `prefetch`. Measured against
          the production build: the default fetches `/rsvp`'s prerendered PPR
          shell, which comes back `Cache-Control: s-maxage=31536000` and so is
          served from the CDN edge. Forcing a full prefetch instead fetches the
          55.7 KB navigation payload, marked `private, no-cache, no-store` — an
          uncacheable origin hit plus a `getGuestByToken` read for every visitor
          who merely loads this page, whether or not they ever tap.

          The shell is what the transition is actually made of: the backdrop, the
          hero, the letter's frame. The guest's own RSVP card sits at the foot of
          a long letter behind its own <Suspense>, many seconds of scrolling
          away, so pre-paying for it buys nothing anybody can see. */}
      <Link
        href={href}
        onClick={handleClick}
        aria-label="Open RSVP invitation"
        aria-busy={opening || undefined}
        className="relative block w-[min(96vw,34rem)] aspect-[468/326] outline-none transition-transform duration-1000 ease-out hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-4 focus-visible:ring-offset-ink"
      >
        {/* All four layers scale from this fixed Canva frame. Keep the lace's
            width and offset percentage-based; breakpoint overrides would break
            its approved alignment with the front flap.

            All four load eagerly: the envelope IS the above-the-fold subject,
            and the lace collar was measuring as this page's LCP while being
            lazy-loaded by default. */}
        <span className="invitation-envelope absolute inset-0 block">
          <Image src={envelopeBack} alt="" fill loading="eager" className="object-contain" />
          <span aria-hidden className="pointer-events-none absolute inset-0 block overflow-hidden">
            <Image
              src={laceCollar}
              alt=""
              loading="eager"
              className="absolute -left-[8.5%] -top-[74%] h-auto w-[118%] max-w-none"
            />
          </span>
          <Image
            src={envelopeFront}
            alt=""
            fill
            loading="eager"
            className="pointer-events-none object-contain"
          />
          <span className="pointer-events-none absolute inset-x-0 top-[15%] z-10 mx-auto block aspect-square w-[35%]">
            <Image
              src="/couple-logo-rustic.svg"
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 45rem) 28vw, 12.5rem"
              className="object-contain"
            />
          </span>
        </span>
      </Link>

      {/* One line, two states, swapped in CSS off the stage's `data-opening` so
          the copy ships in the prerendered HTML and the swap costs no re-render
          mid-animation. No `aria-live` here: the DOM never mutates, so a live
          region would never fire — `aria-busy` on the link above is what tells
          assistive tech the tap was received. */}
      <p className="invitation-hint mt-6 font-sans text-label text-paper">
        <span data-slot="idle">Tap the envelope to open the letter</span>
        <span data-slot="opening">Opening the letter…</span>
      </p>
    </div>
  );
}
