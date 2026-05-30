/**
 * Pharmacquest — Client wrapper for scenarios with optional intro videos
 *
 * Manages the intro → scenario transition. If the scenario has no
 * intro_video, this just renders the player directly.
 */

"use client";

import { useState } from "react";
import type { Scenario } from "@/types/scenario";
import { ScenarioIntro } from "@/components/scenario/ScenarioIntro";
import { ScenarioPlayer } from "./ScenarioPlayer";

interface Props {
  scenario: Scenario;
}

export function ScenarioPlayerWithIntro({ scenario }: Props) {
  const hasIntro = Boolean(scenario.meta.intro_video);
  const [introComplete, setIntroComplete] = useState(!hasIntro);

  if (!introComplete && scenario.meta.intro_video) {
    return (
      <ScenarioIntro
        videoSrc={scenario.meta.intro_video}
        scenarioTitle={scenario.meta.title}
        onComplete={() => setIntroComplete(true)}
      />
    );
  }

  return <ScenarioPlayer scenario={scenario} />;
}