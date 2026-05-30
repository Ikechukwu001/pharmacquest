/**
 * Pharmacquest — Floating reputation badge
 *
 * Pops up over a choice when it's selected, floats upward, and fades away.
 * Green for gains, red for losses, neutral for zero.
 *
 * Visual language matches the "weight" of the choice — small numbers get
 * a quiet badge, big numbers get a louder one.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ReputationFloaterProps {
  /** Reputation delta. Positive, negative, or zero. */
  delta: number | null;
  /** Called when the animation finishes so the parent can clear `delta`. */
  onComplete: () => void;
}

export function ReputationFloater({ delta, onComplete }: ReputationFloaterProps) {
  return (
    <AnimatePresence>
      {delta !== null && delta !== 0 && (
        <motion.div
          key={`rep-${delta}-${Date.now()}`}
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -50, scale: 1 }}
          exit={{ opacity: 0, y: -80 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          onAnimationComplete={onComplete}
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 z-20"
        >
          <div
            className={`
              px-3 py-1.5 rounded-full font-mono text-sm font-bold shadow-lg
              ${
                delta > 0
                  ? "bg-success text-white"
                  : "bg-danger text-white"
              }
            `}
          >
            {delta > 0 ? "+" : ""}
            {delta} rep
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}