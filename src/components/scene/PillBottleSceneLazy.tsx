/**
 * Pharmacquest — Lazy wrapper for PillBottleScene
 *
 * Defers loading Three.js until this component mounts AND the browser
 * supports WebGL. Falls back to a static SVG illustration otherwise.
 */

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isWebGLAvailable } from "@/lib/scene/webgl-detect";
import { SceneFallback } from "./SceneFallback";

const PillBottleScene = dynamic(
  () =>
    import("./PillBottleScene").then((mod) => ({
      default: mod.PillBottleScene,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 animate-pulse rounded-lg">
        <div className="text-sm text-foreground-muted">Loading scene…</div>
      </div>
    ),
  }
);

export function PillBottleSceneLazy() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  // While we're checking, show the loading skeleton.
  if (webglSupported === null) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-neutral-100 animate-pulse rounded-lg">
        <div className="text-sm text-foreground-muted">Loading scene…</div>
      </div>
    );
  }

  // WebGL not available — show the static fallback.
  if (!webglSupported) {
    return <SceneFallback />;
  }

  // All good — load the real 3D scene.
  return <PillBottleScene />;
}