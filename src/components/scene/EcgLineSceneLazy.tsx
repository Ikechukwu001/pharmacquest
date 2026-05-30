/**
 * Pharmacquest — Lazy wrapper for the ECG line scene
 *
 * Defers loading Three.js until this component mounts AND WebGL is available.
 * Falls back to a static gradient if not.
 */

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { isWebGLAvailable } from "@/lib/scene/webgl-detect";

const EcgLineScene = dynamic(
  () =>
    import("./EcgLineScene").then((mod) => ({
      default: mod.EcgLineScene,
    })),
  {
    ssr: false,
    loading: () => <EcgFallback />,
  }
);

function EcgFallback() {
  return (
    <div className="w-full h-full bg-linear-to-br from-primary-900 via-primary-800 to-neutral-900" />
  );
}

interface Props {
  variant?: "calm" | "energetic";
}

export function EcgLineSceneLazy({ variant = "calm" }: Props) {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  if (webglSupported === null) return <EcgFallback />;
  if (!webglSupported) return <EcgFallback />;

  return <EcgLineScene variant={variant} />;
}