import { describe, expect, it, vi } from 'vitest';

// The root layout is only imported here for its `metadata` / `viewport`
// exports, so its render-time dependencies are stubbed: `next/font/google`
// reaches for the font loader, and the two Vercel scripts are client
// components. `globals.css` needs no stub — vitest returns CSS imports empty
// unless `test.css` is enabled.
vi.mock('next/font/google', () => ({
  Montserrat: () => ({ variable: '--font-montserrat' }),
  Parisienne: () => ({ variable: '--font-parisienne' }),
}));
vi.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));
vi.mock('@vercel/speed-insights/next', () => ({ SpeedInsights: () => null }));

import { metadata, viewport } from '@/app/layout';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/wedding';

describe('root metadata', () => {
  /**
   * The load-bearing assertion on this page. A guest's RSVP link is a
   * capability URL (`/rsvp?id=<token>`) — whoever holds it can answer for that
   * invitee — so an indexed page is a disclosure of guest tokens, not a
   * ranking. Metadata merges key by key across segments, so this root rule is
   * what covers `/rsvp`, `/login` and the admin console, none of which set
   * `robots` of their own. See docs/rsvp-spec.md §Security.
   */
  it('keeps every route out of search indexes', () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it('resolves relative share URLs against the deployment base', () => {
    // Without `metadataBase`, the Open Graph image path stays relative and the
    // scrapers that unfurl the invitation drop it.
    expect(metadata.metadataBase).toBeInstanceOf(URL);
  });

  it('describes the occasion for chat-app link previews', () => {
    // Unfurlers ignore `robots`, so the card still has to read well.
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    });
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    });
    expect(metadata.description).toBe(SITE_DESCRIPTION);
  });

  /**
   * Invitations are sent as per-guest capability links (`/rsvp?id=<token>`)
   * pasted into each guest's own chat thread, so the share card must stay
   * identical for everyone and must never echo a token. A per-route `og:url`
   * or `canonical` built from `searchParams` is the way that breaks.
   */
  it('points the share card at the site root, carrying no guest token', () => {
    expect(metadata.openGraph).toMatchObject({ url: '/' });
    expect(metadata.alternates?.canonical).toBeUndefined();
  });

  /**
   * `capable: true` needs an `apple-icon` beside it (favicon.ico is not used
   * for the iOS home screen) and strips the address bar from a saved link. See
   * the block comment in app/layout.tsx.
   */
  it('makes no standalone-web-app claim without an icon to back it', () => {
    expect(metadata.appleWebApp).toBeUndefined();
  });
});

describe('root viewport', () => {
  /**
   * Declared once here rather than on each of the four routes. See the export's
   * own comment for why `cover` is not a fix for the iOS address-bar band.
   */
  it('lets the artwork paint through the iOS insets on every route', () => {
    expect(viewport.viewportFit).toBe('cover');
  });

  it('matches the browser chrome to the ink ground', () => {
    // --ink from app/globals.css; a mismatch flashes white on overscroll.
    expect(viewport.themeColor).toBe('#2c2a1b');
  });
});
