"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ErrorBoundary({
  unstable_retry,
}: ErrorBoundaryProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-gutter py-section">
      <Alert className="max-w-md bg-paper p-6 text-center">
        <AlertTitle>
          <h2 className="font-script text-title text-ink">
            Something went wrong
          </h2>
        </AlertTitle>
        <AlertDescription className="mt-2">
          We could not load this page. Please try again.
        </AlertDescription>
        <Button className="mx-auto mt-5" onClick={unstable_retry}>
          Try again
        </Button>
      </Alert>
    </main>
  );
}
