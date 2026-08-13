"use client";

import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ProtectedErrorBoundary({
  unstable_retry,
}: ErrorBoundaryProps) {
  return (
    <main className="flex min-h-[60dvh] items-center justify-center px-4 py-12">
      <Alert className="max-w-md bg-card p-6 text-center">
        <AlertTitle>
          <h2 className="font-sans text-xl font-semibold">
            Something went wrong
          </h2>
        </AlertTitle>
        <AlertDescription className="mt-2">
          The admin console could not load this view.
        </AlertDescription>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={unstable_retry}>Try again</Button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to dashboard
          </Link>
        </div>
      </Alert>
    </main>
  );
}
