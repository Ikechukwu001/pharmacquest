/**
 * Pharmacquest — Auth shell with dedicated 3D hero band
 *
 * Layout (top to bottom):
 *   1. Pharmacquest wordmark at the very top
 *   2. ECG line scene as a dedicated horizontal hero band (no form overlap)
 *   3. The auth form card below the scene
 *
 * The dark background fills the whole viewport for cohesion. The ECG has
 * its own real estate so it's always visible.
 */

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { EcgLineSceneLazy } from "@/components/scene/EcgLineSceneLazy";

interface AuthShellProps {
  children: ReactNode;
  /** Controls the 3D scene's mood. */
  variant?: "calm" | "energetic";
}

export function AuthShell({ children, variant = "calm" }: AuthShellProps) {
  return (
    <div className="min-h-screen w-full bg-neutral-900 flex flex-col">
      {/* Wordmark */}
      <motion.header
        className="relative z-20 px-6 sm:px-10 pt-6 pb-2 shrink-0"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Link
          href="/"
          className="text-lg sm:text-xl font-bold tracking-tight text-white hover:text-primary-100 transition-colors"
        >
          Pharmacquest
        </Link>
      </motion.header>

      {/* ECG hero band — dedicated visual space */}
      <motion.section
        className="relative w-full h-48 sm:h-56 md:h-64 overflow-hidden shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        aria-hidden="true"
      >
        <EcgLineSceneLazy variant={variant} />
        {/* Soft fade at the bottom of the scene to blend into form area */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-neutral-900 pointer-events-none" />
      </motion.section>

      {/* Form area — flexes to fill remaining space */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-6 py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl bg-neutral-0 border border-neutral-200 shadow-2xl px-6 sm:px-8 py-8 sm:py-10">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
}