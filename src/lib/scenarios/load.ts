/**
 * Pharmacquest — Scenario loader
 *
 * Loads a scenario JSON file from the content directory and verifies it
 * conforms to the Scenario type. This runs at the server side only — we
 * never expose raw scenario JSON to the browser.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Scenario } from "@/types/scenario";

/**
 * Load a scenario by ID. The ID maps to a filename in content/scenarios/.
 *
 * @param id  The scenario ID, e.g. "scn_001_strong_drugs"
 * @returns   The parsed Scenario object
 * @throws    If the file is missing, malformed, or fails validation
 */
export async function loadScenario(id: string): Promise<Scenario> {
  const filePath = path.join(
    process.cwd(),
    "content",
    "scenarios",
    `${id}.json`
  );

  const raw = await fs.readFile(filePath, "utf-8");
  const parsed: unknown = JSON.parse(raw);

  // Validate the parsed JSON conforms to the Scenario shape.
  // If it doesn't, throw with a useful message.
  assertIsScenario(parsed);

  return parsed;
}

/**
 * Type guard: throws if `data` is not a valid Scenario.
 *
 * This is a runtime check. TypeScript types are erased at runtime, so we
 * need real JavaScript checks to verify shapes that come from JSON files,
 * APIs, or anywhere else outside the compiler's reach.
 *
 * The `asserts` return type tells TypeScript: "if this function returns
 * without throwing, then `data` is a Scenario." Downstream code gets the
 * narrowed type for free.
 */
function assertIsScenario(data: unknown): asserts data is Scenario {
  if (typeof data !== "object" || data === null) {
    throw new Error("Scenario must be an object");
  }

  const s = data as Partial<Scenario>;

  if (typeof s.id !== "string") {
    throw new Error("Scenario.id must be a string");
  }
  if (typeof s.version !== "number") {
    throw new Error("Scenario.version must be a number");
  }
  if (typeof s.start_node !== "string") {
    throw new Error("Scenario.start_node must be a string");
  }
  if (typeof s.nodes !== "object" || s.nodes === null) {
    throw new Error("Scenario.nodes must be an object");
  }
  if (!s.nodes[s.start_node]) {
    throw new Error(
      `Scenario.start_node "${s.start_node}" does not exist in nodes`
    );
  }

  // Validate that every "next" reference in every node points to a real node.
  for (const [nodeId, node] of Object.entries(s.nodes)) {
    if ("next" in node && node.next !== null && node.next !== undefined) {
      if (!s.nodes[node.next as string]) {
        throw new Error(
          `Node "${nodeId}" references missing node "${node.next}"`
        );
      }
    }
    
        if (node.type === "decision") {
      for (let i = 0; i < node.choices.length; i++) {
        const choice = node.choices[i];
        const isTerminal = "terminal" in choice && choice.terminal === true;

        if (isTerminal) {
          if (!("terminal_outcome" in choice) || !choice.terminal_outcome) {
            throw new Error(
              `Terminal choice ${i} in "${nodeId}" is missing a terminal_outcome`
            );
          }
          const t = choice.terminal_outcome;
          if (typeof t.outcome_text !== "string" || !t.outcome_text) {
            throw new Error(
              `Terminal outcome in "${nodeId}" choice ${i} is missing outcome_text`
            );
          }
          if (typeof t.log !== "string" || !t.log) {
            throw new Error(
              `Terminal outcome in "${nodeId}" choice ${i} is missing log`
            );
          }
          if (typeof t.principle !== "string" || !t.principle) {
            throw new Error(
              `Terminal outcome in "${nodeId}" choice ${i} is missing principle`
            );
          }
        } else {
          // Non-terminal decision choices must each have a valid `next`.
          if (!("next" in choice) || !choice.next) {
            throw new Error(
              `Non-terminal choice ${i} in "${nodeId}" is missing 'next'`
            );
          }
          if (!s.nodes[choice.next as string]) {
            throw new Error(
              `Choice ${i} in "${nodeId}" references missing node "${choice.next}"`
            );
          }
        }
      }
    }

    if (node.type === "multi_select") {
      // The multi-select node itself owns the `next` — all choices funnel there.
      if (typeof node.next !== "string" || !node.next) {
        throw new Error(
          `Multi-select node "${nodeId}" is missing 'next'`
        );
      }
      if (!s.nodes[node.next]) {
        throw new Error(
          `Multi-select node "${nodeId}" references missing node "${node.next}"`
        );
      }

      // Validate any terminal choices (rare but allowed).
      for (let i = 0; i < node.choices.length; i++) {
        const choice = node.choices[i];
        const isTerminal = "terminal" in choice && choice.terminal === true;

        if (isTerminal) {
          if (!("terminal_outcome" in choice) || !choice.terminal_outcome) {
            throw new Error(
              `Terminal multi-select choice ${i} in "${nodeId}" is missing a terminal_outcome`
            );
          }
          const t = choice.terminal_outcome;
          if (typeof t.outcome_text !== "string" || !t.outcome_text) {
            throw new Error(
              `Terminal outcome in "${nodeId}" choice ${i} is missing outcome_text`
            );
          }
          if (typeof t.log !== "string" || !t.log) {
            throw new Error(
              `Terminal outcome in "${nodeId}" choice ${i} is missing log`
            );
          }
          if (typeof t.principle !== "string" || !t.principle) {
            throw new Error(
              `Terminal outcome in "${nodeId}" choice ${i} is missing principle`
            );
          }
        }
        // Non-terminal multi-select choices don't need `next` — the node provides it.
      }
    }
  }
}