import type { ComponentProps } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
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
import {
  CardSprayBottomLeft,
  CardSprayTopRight,
  CoupleFigures,
  PageFloralBottomRight,
  PageFloralTopLeft,
} from '@/components/dashboard/florals';

type LoginSearchParams = { pending?: string; error?: string };

const ERROR_MESSAGES: Record<string, string> = {
  oauth: 'Sign-in was cancelled or failed. Please try again.',
  state: 'Your sign-in session expired. Please try again.',
  unverified: 'Your Google email is not verified.',
  auth: 'We could not sign you in. Please try again.',
  denied: 'This Google account is not an authorized admin.',
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
    <main className="relative flex min-h-dvh items-center justify-center p-6">
      {/* Page-corner floral sprays on the wisteria gradient, clipped to the
          viewport in their own layer — same shell as the dashboard. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <PageFloralTopLeft />
        <PageFloralBottomRight />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center gap-6">
        {/* Botanical frame around the card, same as the dashboard guest-list card. */}
        <div className="relative w-full">
          <CardSprayTopRight />
          <CardSprayBottomLeft />
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 font-sans text-xl">
                <CoupleFigures className="h-[36px] w-auto shrink-0" />
                Admin sign in
              </CardTitle>
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
            </CardContent>
          </Card>
        </div>

        <p className="max-w-xs text-center text-xs text-muted-foreground">
          Access is restricted to approved administrators.
        </p>
      </div>
    </main>
  );
}
