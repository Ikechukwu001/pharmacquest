/**
 * Pharmacquest — Dashboard loading state
 */

import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Top bar skeleton */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="h-5 w-32 bg-neutral-200 rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-neutral-200 animate-pulse" />
            <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
            <div className="h-9 w-48 bg-neutral-200 rounded animate-pulse" />
          </div>
          <Card className="bg-primary-100 border-0">
            <CardContent className="py-8 px-6 space-y-3">
              <div className="h-3 w-16 bg-primary-200 rounded animate-pulse" />
              <div className="h-7 w-40 bg-primary-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-primary-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-primary-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="shadow-none">
              <CardContent className="py-4 px-3 sm:px-4 space-y-2">
                <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse" />
                <div className="h-7 w-12 bg-neutral-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}