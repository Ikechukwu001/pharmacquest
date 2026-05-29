/**
 * Pharmacquest — Global error boundary
 *
 * Catches unhandled errors anywhere in the app.
 * Note: must be a client component because it uses an event handler.
 */

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console for now. Later we'd send this to Sentry.
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <p className="text-sm font-mono text-foreground-subtle">
          Something went wrong
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          We hit an unexpected error.
        </h1>
        <p className="text-foreground-muted leading-relaxed">
          The pharmacy is briefly closed. Try again, or head back to the
          dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}