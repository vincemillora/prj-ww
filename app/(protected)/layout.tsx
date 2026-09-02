import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

import { PageFloralBottomRight } from "@/components/dashboard/florals";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage wedding guests, invitations, and RSVP responses.",
};

// Matches the public routes so all four opt into the full screen rather than
// two of them declaring it and two not. No measured effect in portrait on
// iPhone 17 Pro / iOS 26.5 — `env(safe-area-inset-*)` are `0px` there either
// way — so this is for landscape insets and consistency, NOT a fix for the
// address-bar band. See docs/rsvp-spec.md §1 for why that band cannot be moved.
export const viewport: Viewport = {
  viewportFit: "cover",
};

/**
 * Sidebar-less admin shell: a full-width, centred container on plain white. The
 * dashboard is a task surface and takes the quietest ground there is; what makes
 * it the guest letter's sibling is the espresso ink, the type, the earth-pigment
 * status lanes, and the letter's own botanicals. The page-corner floral sprays
 * live in their own `overflow-hidden` layer so their bleed is clipped WITHOUT
 * clipping page chrome — the content wrapper stays overflow-visible so small
 * decorative flourishes (e.g. the account-chip sprigs) aren't cut at the edges.
 * Global horizontal scroll is guarded on `<body>` (see `app/layout.tsx`).
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    // `admin-surface` themes the parts of the page we did not draw — selection,
    // caret, scrollbar — from the same ink. See app/globals.css.
    <div className="admin-surface relative flex-1">
      {/* ONE page spray, bottom-right, and both halves of that are deliberate.

          The imported design put a second spray in the top-left corner and a
          mirrored one at the phone's top-right. On this page that corner is the
          masthead: at any usable opacity the blooms crossed the letterforms of
          the couple's name and of “Manage RSVP”, and ornament over display type
          is ornament competing with the task. The nameplate already carries its
          own botanical — `NameSprig`, sized for type and set in the same ink —
          so the corner spray was redundant there as well as in the way.

          The offsets are small (16/20px, not the imported 46/52) because this
          layer clips: a stem may run off the page, but a bloom cut in half by
          the clip edge reads as broken art. At these offsets only the stem's
          tail crosses. Phones get no page spray at all — a 16px gutter has
          nowhere to put outward-growing leaves. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <PageFloralBottomRight className="pointer-events-none absolute -right-[16px] -bottom-[20px] hidden h-[300px] w-[300px] -scale-x-100 text-ink-faint opacity-25 sm:block" />
      </div>
      <div className="relative mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {children}
      </div>
    </div>
  );
}
