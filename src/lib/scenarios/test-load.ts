/**
 * Temporary test script. Run with:
 *   npx tsx src/lib/scenarios/test-load.ts
 */

import { loadScenario } from "./load";

const scenarioIds = [
  "scn_001_strong_drugs",
  "scn_002_small_fever",
  "scn_003_just_two_tabs",
  "scn_004_faith_and_fasting",
];

async function main() {
  for (const id of scenarioIds) {
    const scenario = await loadScenario(id);
    console.log(`✅ ${id}: ${scenario.meta.title}`);
    console.log(`   Difficulty: ${scenario.meta.difficulty}`);
    console.log(`   Nodes: ${Object.keys(scenario.nodes).length}`);
    console.log(`   Patient: ${scenario.patient.display_name}`);
    console.log();
  }
}

main().catch((err) => {
  console.error("❌ Failed to load scenario:");
  console.error(err.message);
  process.exit(1);
});