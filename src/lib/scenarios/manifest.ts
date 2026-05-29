/**
 * Pharmacquest — Scenario manifest
 *
 * The catalog of available scenarios, with display metadata for the
 * dashboard. In v1 this is hand-maintained; later it can be auto-derived
 * from the content/scenarios/ folder or queried from the database.
 *
 * To add a scenario: drop the JSON into content/scenarios/, then add an
 * entry here.
 */

import type { Difficulty, Profession } from "@/types/scenario";

export interface ScenarioListing {
  id: string;
  title: string;
  blurb: string;
  setting: string;
  estimated_minutes: number;
  difficulty: Difficulty;
  profession: Profession;
}

export const SCENARIO_MANIFEST: ScenarioListing[] = [
  {
    id: "scn_002_small_fever",
    title: "Small Fever",
    blurb: "A worried mother walks in with her 18-month-old. Paracetamol or something stronger?",
    setting: "Community pharmacy · Abuja",
    estimated_minutes: 6,
    difficulty: "easy",
    profession: "pharmacy",
  },
  {
    id: "scn_001_strong_drugs",
    title: "Strong Drugs",
    blurb: "Uncle Sunday wants diclofenac for his knees. He's on lisinopril for his blood pressure.",
    setting: "Community pharmacy · Wuse",
    estimated_minutes: 7,
    difficulty: "intermediate",
    profession: "pharmacy",
  },
  {
    id: "scn_003_just_two_tabs",
    title: "Just Two Tabs",
    blurb: "An aggressive customer demands tramadol 225mg. No prescription. Just two tablets.",
    setting: "Community pharmacy · Lagos",
    estimated_minutes: 7,
    difficulty: "intermediate",
    profession: "pharmacy",
  },
  {
    id: "scn_004_faith_and_fasting",
    title: "Faith and Fasting",
    blurb: "A diabetic patient stopped her metformin two weeks ago. Her religious leader told her to.",
    setting: "Community pharmacy",
    estimated_minutes: 7,
    difficulty: "intermediate",
    profession: "pharmacy",
  },
];