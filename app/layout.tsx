import type { Metadata, Viewport } from "next";
import {
  Montserrat,
  Parisienne,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";
import { COUPLE, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/wedding";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

// Calligraphic accent for the couple's names and letter headings.
const parisienne = Parisienne({
  variable: "--font-parisienne",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The base `metadataBase` resolves the relative `/opengraph-image` path against
 * — unfurlers reject a relative image, so getting this wrong costs the card,
 * silently.
 *
 * `APP_URL` first, since that is the same base the OAuth redirect is built from
 * (.env.example) and therefore the one value already guaranteed correct in
 * production. `VERCEL_PROJECT_PRODUCTION_URL` is the fallback because APP_URL
 * is a project-wide env var that may only be set for the production
 * environment: on a preview deployment the first would be missing and, without
 * this, every preview would advertise a localhost image.
 */
const APP_URL =
  process.env.APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${COUPLE}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_TITLE,
  authors: [{ name: COUPLE }],
  // No `alternates.canonical`: metadata merges key by key, so a root canonical
  // is inherited verbatim by every route — /rsvp and /login would both claim
  // to be `/`. There is nothing for a canonical to disambiguate on a noindex
  // site anyway.
  /**
   * NOINDEX EVERYWHERE, deliberately. A guest's RSVP link is a capability URL
   * (`/rsvp?id=<token>`) — whoever holds it can answer for that invitee — so a
   * crawled and indexed token would be a disclosure, not a ranking. See
   * docs/rsvp-spec.md §Security. app/robots.ts disallows crawlers as well; this
   * covers the pages a crawler reaches without reading robots.txt.
   *
   * Chat-app unfurlers (Messenger, WhatsApp, iMessage, Viber) do not honour
   * this, so the Open Graph card below still renders where guests share the
   * invitation.
   */
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    type: "website",
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    // Deliberately the site root on every route, NOT the guest's own
    // `/rsvp?id=<token>`. Invitations go out as per-guest capability links, so
    // a per-route `og:url` would have to be built from `searchParams` — which
    // would print the token into the share card's metadata and force /rsvp's
    // metadata dynamic. Chat clients link the URL that was pasted rather than
    // `og:url`, so the token still survives the share; see docs/rsvp-spec.md.
    url: "/",
    // The image itself comes from app/opengraph-image.tsx, which Next resolves
    // into `openGraph.images` — listing it here would overwrite that.
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  /**
   * No `appleWebApp`. `capable: true` claims the site is a standalone web app,
   * and it is the wrong claim on two counts: iOS then needs an `apple-icon`
   * (which this site has no raster for — `favicon.ico` is not used for the home
   * screen, so the tile would fall back to a screenshot), and a home-screen
   * launch reopens whatever URL was saved with NO address bar, which for a
   * guest who saved their own `/rsvp?id=<token>` link removes the one control
   * that could recover it. `statusBarStyle` only applies once `capable` is set,
   * so it would be inert in Safari anyway. Add both together, or neither.
   */
  /**
   * iOS Safari otherwise turns the letter's dates and the venue's number into
   * blue tap-to-call/tap-to-add links, which breaks the hand-set typography.
   * The letter provides its own "Add to calendar" button (lib/wedding.ts
   * WEDDING_EVENT) for the one case the detection was trying to serve.
   */
  formatDetection: { telephone: false, date: false, address: false },
};

/**
 * `viewportFit: 'cover'` is global, not per-page: every public page uses the
 * `viewport-bleed-stage` treatment that paints artwork through iOS Safari's
 * insets (see app/globals.css), and the admin pages sit on the same drapery.
 * It measured no effect in portrait on iPhone 17 Pro / iOS 26.5 — the
 * `env(safe-area-inset-*)` values are `0px` there either way — so it is for
 * landscape insets, NOT a fix for the address-bar band (docs/rsvp-spec.md §1
 * explains why that band cannot be moved).
 *
 * `themeColor` is the ink ground (--ink, app/globals.css), so the browser and
 * status-bar chrome matches the page instead of flashing white on scroll.
 */
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#2c2a1b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        montserrat.variable,
        parisienne.variable,
        "h-full antialiased",
      )}
    >
      <body className="flex min-h-dvh flex-col overflow-x-hidden">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
