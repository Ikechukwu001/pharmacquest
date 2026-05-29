/**
 * Pharmacquest — Scenario player loading state
 *
 * Shown automatically while the scenario data is being fetched.
 * Mimics the layout of the real player to prevent layout jump.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen pb-12">
      {/* Top bar skeleton */}
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-3 pb-2 space-y-2">
          <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full w-1/12 bg-primary-300 animate-pulse" />
          </div>
          <div className="flex items-center justify-between gap-3 h-6">
            <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
            <div className="h-5 w-16 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Patient card skeleton */}
        <Card className="shadow-none">
          <CardContent className="py-3 px-4 flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-neutral-200 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-neutral-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Main content skeleton */}
        <Card>
          <CardContent className="py-5 px-5 sm:py-6 sm:px-6 space-y-4">
            <div className="h-3 w-20 bg-neutral-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-neutral-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-14 w-full bg-neutral-100 rounded-lg animate-pulse" />
              <div className="h-14 w-full bg-neutral-100 rounded-lg animate-pulse" />
              <div className="h-14 w-full bg-neutral-100 rounded-lg animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}