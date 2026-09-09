import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

import {
  COUPLE,
  SITE_TITLE,
  WEDDING_MONTH_LABEL,
  WEDDING_VENUE,
} from '@/lib/wedding';

/**
 * The link-preview card — what a guest sees when the invitation is pasted into
 * Messenger, WhatsApp or iMessage.
 *
 * Typographic rather than photographic, and on purpose: the hero's lace frame
 * and lily backdrop are megabyte-scale WebP built for a full-height viewport,
 * and every asset an ImageResponse embeds counts against its 500KB bundle. The
 * ink ground, the script names and the tracked-out caps are the invitation's
 * own voice, and they survive being scaled down to a chat bubble's thumbnail
 * where a cropped photograph would not.
 *
 * Every string is read from lib/wedding.ts, so moving the date or the venue
 * redraws this card with the rest of the site.
 */

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * This route renders on demand, and there is no in-app lever to change that.
 * Cache Components is on (next.config.ts), so a route is dynamic until it opts
 * in, and neither opt-in fits an image route: a file-scope `'use cache'` may
 * only export async functions, while this file must also export the three
 * constants above, and an in-function `'use cache'` cannot return an
 * `ImageResponse` (a `Response` subclass is not serializable — it fails the
 * prerender with "Only plain objects … can be passed to Client Components").
 * `export const dynamic = 'force-static'` is accepted but has no effect here.
 *
 * Nothing about the card is request-dependent, so it is cached at the edge
 * instead: next.config.ts `headers()` gives `/opengraph-image` the same
 * long-lived `Cache-Control` as the rest of the artwork, and satori runs on the
 * first unfurl rather than on every one.
 */

/**
 * Satori needs raw font bytes; it cannot read the `next/font` faces the pages
 * use. The two files are vendored under app/_fonts (a private folder — Next
 * keeps `_`-prefixed directories out of the router) so a build never depends on
 * reaching Google Fonts. This route is prerendered at build time, hence the
 * `process.cwd()` read.
 */
async function loadFont(file: string) {
  return readFile(join(process.cwd(), 'app/_fonts', file));
}

// --ink and --paper from app/globals.css. Satori resolves no CSS variables, so
// the two ground colours are written out literally here.
const INK = '#2c2a1b';
const PAPER = '#ffffff';

export default async function OpengraphImage() {
  const [script, sans] = await Promise.all([
    loadFont('Parisienne-Regular.ttf'),
    loadFont('Montserrat-Regular.ttf'),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: INK,
          color: PAPER,
          fontFamily: 'Montserrat',
        }}
      >
        {/* A hairline frame inset from the edge — the printed-stationery cue,
            and the one ornament that stays legible at thumbnail size. */}
        <div
          style={{
            position: 'absolute',
            top: 32,
            right: 32,
            bottom: 32,
            left: 32,
            border: `1px solid ${PAPER}`,
            opacity: 0.35,
          }}
        />
        <div
          style={{
            fontSize: 26,
            letterSpacing: 12,
            textTransform: 'uppercase',
            opacity: 0.72,
          }}
        >
          We&apos;re getting married
        </div>
        {/* The names carry the card. Parisienne holds roughly half the visual
            weight of its nominal size, so it is set far larger than the caps
            around it to read as the headline rather than as a caption — the
            same correction the dashboard letterhead makes. */}
        <div
          style={{
            fontFamily: 'Parisienne',
            fontSize: 148,
            lineHeight: 1.1,
            padding: '12px 0 24px',
          }}
        >
          {COUPLE}
        </div>
        <div style={{ width: 132, height: 1, background: PAPER, opacity: 0.45 }} />
        <div
          style={{
            display: 'flex',
            fontSize: 27,
            letterSpacing: 7,
            textTransform: 'uppercase',
            opacity: 0.85,
            paddingTop: 28,
          }}
        >
          {`${WEDDING_MONTH_LABEL}  ·  ${WEDDING_VENUE}`}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Parisienne', data: script, style: 'normal', weight: 400 },
        { name: 'Montserrat', data: sans, style: 'normal', weight: 400 },
      ],
    },
  );
}
