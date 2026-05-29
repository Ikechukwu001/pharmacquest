/**
 * Pharmacquest — Auth page shell
 *
 * Shared layout for the signup and login pages. Two-column on desktop
 * (marketing left, form right), stacked on mobile.
 */

import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  /** Form-side content. */
  children: ReactNode;
  /** Hide the marketing pane on smaller layouts; keep it visible on lg+. */
  marketingTitle: string;
  marketingBody: string;
}

export function AuthShell({
  children,
  marketingTitle,
  marketingBody,
}: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Marketing pane — hidden on mobile, shown on lg+ */}
      <aside className="hidden lg:flex lg:w-1/2 bg-primary-700 text-white p-12 flex-col justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight hover:text-primary-100 transition-colors"
        >
          Pharmacquest
        </Link>

        <div className="space-y-6 max-w-md">
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight tracking-tight">
            {marketingTitle}
          </h2>
          <p className="text-lg text-primary-100 leading-relaxed">
            {marketingBody}
          </p>
        </div>

        <p className="text-xs text-primary-200">
          Built for Nigerian pharmacy students.
        </p>
      </aside>

      {/* Form pane */}
      <main className="flex-1 flex flex-col">
        {/* Mobile-only top bar with wordmark */}
        <header className="lg:hidden border-b border-border bg-surface">
          <div className="px-4 sm:px-6 h-14 flex items-center">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Pharmacquest
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}