import type { ComponentProps } from 'react';
import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { COUPLE } from '@/lib/wedding';
import { getCurrentUser } from '@/lib/dal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LaceBackdrop } from '@/components/letter/lace-backdrop';
import { CardSprayBottomLeft, CardSprayTopRight } from '@/components/dashboard/florals';

type LoginSearchParams = { pending?: string; error?: string };

const ERROR_MESSAGES: Record<string, string> = {
  oauth: 'Sign-in was cancelled or failed. Please try again.',
  state: 'Your sign-in session expired. Please try again.',
  unverified: 'Your Google email is not verified.',
  auth: 'We could not sign you in. Please try again.',
  denied: 'This Google account is not an authorized admin.',
};

// See the note on the same export in app/(protected)/layout.tsx.
export const viewport: Viewport = {
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Admin Sign In',
  description: 'Sign in to the wedding RSVP administration console.',
};

function GoogleIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  // Authoritative check (not the optimistic proxy one): a signed-in, active
  // admin has no business here. Disabled/deleted users resolve to null and
  // still see the login page — no redirect loop with the dashboard gate.
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] ?? 'Something went wrong.' : null;

  return (
    // The same drapery the guests see. `/` (the envelope invitation), the
    // loading screen and the letter's hero all stand on this one artwork, and
    // the admin door now stands on it too — same house, staff entrance. It is
    // also the reason this page needs no corner florals of its own: the
    // photograph is the decoration, and the card's own vine is the only
    // botanical the composition can carry without becoming busy.
    //
    // `lace-page` is what tells app/globals.css to paint the document canvas in
    // ink behind Safari's chrome and let the body go transparent, exactly as
    // `.invitation-page` and `.letter-page` do. `admin-surface` themes
    // selection, caret and scrollbar from the same ink.
    //
    // `viewport-bleed-stage` sizes the page past the layout viewport so the
    // drapery covers the strip iOS Safari keeps outside it, and owns the height
    // (so no `min-h-dvh` here). The stage cannot scroll — fine for one centred
    // card, but anything taller than the viewport would be unreachable.
    <main className="lace-page viewport-bleed-stage admin-surface relative flex items-center justify-center overflow-hidden bg-ink p-6">
      <LaceBackdrop />

      <div className="relative flex w-full max-w-sm flex-col items-center gap-6">
        {/* Same corner vines as the dashboard's cards, hugging this card's own
            border. Scaled down from the dashboard's tall-lane proportions
            (h-[125%]/-12.5%) to h-[50%]/-5% — same self-hugging formula
            (offset = 10% of the frame's OWN height), just sized for this
            card's wider, shorter shape so the two corners don't collide in
            the middle. Card sits at z-10 above them so only the sliver that
            grows past the card's own edge shows, not a wash over its face. */}
        <div className="relative w-full">
          <CardSprayTopRight className="pointer-events-none absolute -top-[5%] right-0 z-0 h-[50%] w-auto translate-x-[11.667%] text-ink-faint opacity-70" />
          <CardSprayBottomLeft className="pointer-events-none absolute -bottom-[5%] left-0 z-0 h-[50%] w-auto -translate-x-[11.667%] text-ink-faint opacity-70" />
          <Card className="w-full shadow-[0_4px_10px_color-mix(in_srgb,var(--ink)_22%,transparent),0_24px_60px_color-mix(in_srgb,var(--ink)_35%,transparent)]">
            <CardHeader className="text-center">
              {/* The couple's real monogram, at the size the letter gives it —
                  this is the one ceremonial moment in the admin, and the mark
                  needs room to read. A pair of cartoon figures in the old
                  wisteria palette used to sit inline with the title at 36px,
                  where neither the drawing nor the letter's hand survived. */}
              <Image
                src="/couple-logo-rustic.svg"
                alt={COUPLE}
                width={2000}
                height={2000}
                priority
                className="mx-auto mb-2 h-56 w-56"
              />
              <CardTitle className="text-xl font-medium">Admin sign in</CardTitle>
              <CardDescription>Sign in to manage guest responses.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {params.pending && (
                <Alert>
                  <AlertTitle>Account pending approval</AlertTitle>
                  <AlertDescription>
                    An administrator must activate your account before you can sign in.
                  </AlertDescription>
                </Alert>
              )}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              {/* Plain anchor (via render) so the GET is never prefetched. */}
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                nativeButton={false}
                render={<a href="/api/auth/google" />}
              >
                <GoogleIcon data-icon="inline-start" />
                Continue with Google
              </Button>
              {/* Inside the card, not under it. This line used to sit on the
                  page ground, which is now a photograph: white 12px type over
                  drapery is exactly the case the hero's measured scrim table
                  says not to trust (worst case 3.15:1, and that was for large
                  script). On paper it is the tertiary ink at 5.69:1. */}
              <p className="border-t border-rule pt-3 text-center text-xs text-muted-foreground">
                Access is restricted to approved administrators.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </main>
  );
}
