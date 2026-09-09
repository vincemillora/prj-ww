import type { MetadataRoute } from 'next';

/**
 * Disallow every crawler, site-wide.
 *
 * This is a private invitation, and a guest's RSVP link is a capability URL
 * (`/rsvp?id=<token>`): anyone holding it can answer for that invitee, so an
 * indexed token is a disclosure rather than a ranking (docs/rsvp-spec.md
 * §Security). The root layout also sets `robots: { index: false }` for crawlers
 * that reach a page without reading this file.
 *
 * There is deliberately no sitemap: nothing here should be discovered.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
