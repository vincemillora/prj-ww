'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Microsoft Clarity project id. It is a public identifier — it ships inside the
 * tag URL on every page that loads it — so it lives in source rather than in an
 * env var that would have to be `NEXT_PUBLIC_` anyway.
 */
const CLARITY_PROJECT_ID = 'yegm3ff50x';

const TAG_ID = 'ms-clarity';

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

/**
 * Loads the Clarity tag and, when the visitor arrived on an invite link
 * (`?id=<code>`), names the session after that code.
 *
 * Mounted ONLY on the two public pages (`/` and `/rsvp`). The admin routes
 * under `app/(protected)` deliberately never render it: those screens show
 * every guest's name, contact details and reply, and a session recording is a
 * verbatim copy of the screen. Do not lift this into `app/layout.tsx`.
 *
 * Reads the URL, so it carries its own Suspense boundary (see the export at the
 * bottom of this file) rather than making each page remember one.
 *
 * The tag bootstrap and the `identify` call are plain effects rather than a
 * <Script strategy="afterInteractive">: with <Script>, the identify effect can
 * fire before the snippet has defined the `window.clarity` queue stub, and the
 * call is then dropped silently. Effects run in mount order, so the stub always
 * exists by the time the second one calls it.
 */
function ClarityTag() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get('id');

  useEffect(() => {
    // Bootstrap the queueing stub exactly as Microsoft's snippet does, so calls
    // made before the tag finishes downloading are replayed once it loads.
    if (!window.clarity) {
      const stub: ClarityFn = (...args: unknown[]) => {
        stub.q = stub.q ?? [];
        stub.q.push(args);
      };
      window.clarity = stub;
    }

    // Guard the <script> insertion separately from the stub: React 18+ runs
    // effects twice in development StrictMode, and a second insertion would
    // load the tag twice.
    if (!document.getElementById(TAG_ID)) {
      const tag = document.createElement('script');
      tag.id = TAG_ID;
      tag.async = true;
      tag.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`;
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    if (!inviteCode) return;
    // identify(custom-id, custom-session-id, custom-page-id, friendly-name).
    // The friendly name is what labels the recording in the Clarity dashboard;
    // the custom id is what groups every session from the same invite.
    window.clarity?.('identify', inviteCode, undefined, undefined, inviteCode);
  }, [inviteCode]);

  return null;
}

/**
 * `useSearchParams` opts its subtree into request-time rendering, so under
 * Cache Components it must sit behind a Suspense boundary or the enclosing page
 * stops prerendering statically. Owning the boundary here keeps `/rsvp`'s shell
 * static without either page having to know that. Nothing renders, so the
 * fallback is nothing.
 */
export function ClarityAnalytics() {
  return (
    <Suspense fallback={null}>
      <ClarityTag />
    </Suspense>
  );
}
