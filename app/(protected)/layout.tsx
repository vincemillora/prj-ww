import type { ReactNode } from "react";
import type { Metadata } from "next";

import {
  PageFloralBottomRight,
  PageFloralTopLeft,
} from "@/components/dashboard/florals";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage wedding guests, invitations, and RSVP responses.",
};

/**
 * Sidebar-less admin shell (imported single-page design): a full-width, centered
 * container on the wisteria gradient background. The page-corner floral sprays
 * live in their own `overflow-hidden` layer so their bleed is clipped WITHOUT
 * clipping page chrome — the content wrapper stays overflow-visible so small
 * decorative flourishes (e.g. the account-chip sprigs) aren't cut at the edges.
 * Global horizontal scroll is guarded on `<body>` (see `app/layout.tsx`).
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <PageFloralTopLeft />
        <PageFloralBottomRight />
        {/* Phone layout uses a single mirrored spray at the top-right instead. */}
        <PageFloralBottomRight className="pointer-events-none absolute -top-[24px] -right-[40px] h-[170px] w-[170px] -scale-x-100 opacity-[0.42] md:hidden" />
      </div>
      <div className="relative mx-auto w-full max-w-[1300px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {children}
      </div>
    </div>
  );
}
