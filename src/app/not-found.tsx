/**
 * Pharmacquest — 404 page
 *
 * Shown automatically by Next.js when a route doesn't exist.
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <p className="text-6xl font-bold font-mono text-primary-200">404</p>
        <h1 className="text-2xl font-bold tracking-tight">
          This page doesn&apos;t exist.
        </h1>
        <p className="text-foreground-muted leading-relaxed">
          The page you were looking for isn&apos;t here. It may have moved, or
          never existed at all.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}