/**
 * Pharmacquest — Auth shell with full-bleed 3D background
 *
 * The 3D ECG scene fills the entire viewport. The wordmark sits at the top.
 * The auth form lives in a floating glass-effect card centered on screen.
 *
 * Variant controls the scene's mood ("calm" for login, "energetic" for signup).
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
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-900">
      {/* Full-bleed 3D background */}
      <div className="absolute inset-0">
        <EcgLineSceneLazy variant={variant} />
      </div>

      {/* Dark vignette over the 3D to keep form text readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/30 via-transparent to-neutral-900/60 pointer-events-none" />

      {/* Wordmark — top left, simple */}
      <motion.header
        className="absolute top-0 left-0 right-0 z-20 px-6 sm:px-10 pt-6"
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

      {/* The floating form card */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <div className="rounded-2xl bg-neutral-0/95 backdrop-blur-xl border border-white/10 shadow-2xl px-6 sm:px-8 py-8 sm:py-10">
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
}