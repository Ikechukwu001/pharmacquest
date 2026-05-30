/**
 * Pharmacquest — Scenario intro
 *
 * Shown before a scenario begins when the scenario has an intro_video.
 * Three states:
 *   1. Ready: poster frame with a "Begin" button
 *   2. Playing: full video with a "Skip" button overlay
 *   3. Done: invisible (signals parent to mount the actual scenario)
 *
 * Click-to-begin satisfies browser autoplay policies for audio.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ScenarioIntroProps {
  videoSrc: string;
  scenarioTitle: string;
  onComplete: () => void;
}

type IntroState = "ready" | "playing";

export function ScenarioIntro({
  videoSrc,
  scenarioTitle,
  onComplete,
}: ScenarioIntroProps) {
  const [state, setState] = useState<IntroState>("ready");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start playing when state transitions to "playing"
  useEffect(() => {
    if (state === "playing" && videoRef.current) {
      // play() returns a promise; handle the autoplay-rejected case gracefully
      videoRef.current.play().catch(() => {
        // If browser still refuses (rare), skip straight to scenario
        onComplete();
      });
    }
  }, [state, onComplete]);

  function handleBegin() {
    setState("playing");
  }

  function handleSkip() {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Ready state — poster + Begin button */}
      {state === "ready" && (
        <div className="text-center space-y-8 px-6 max-w-md">
          <div className="space-y-3">
            <p className="text-sm font-mono uppercase tracking-wider text-primary-300">
              Pharmacquest · Scenario
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {scenarioTitle}
            </h1>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              The intro plays with sound. Make sure your audio is on, then begin.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={handleBegin}
              className="bg-white text-black hover:bg-neutral-100 px-8"
            >
              Begin →
            </Button>
            <button
              onClick={onComplete}
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Skip intro
            </button>
          </div>
        </div>
      )}

      {/* Playing state — video + Skip button */}
      {state === "playing" && (
        <>
          <video
            ref={videoRef}
            src={videoSrc}
            className="w-full h-full object-cover"
            playsInline
            onEnded={onComplete}
            onError={onComplete}
          />
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-black/60 hover:bg-black/80 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm transition-colors"
          >
            Skip →
          </button>
        </>
      )}
    </div>
  );
}