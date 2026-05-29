/**
 * Pharmacquest — Completion computation
 *
 * Given a scenario and the path a player took through it, compute the total
 * reputation change, outcome triggered, and patient log entry.
 *
 * Server-authoritative: the player only reports which choices they made
 * (the node IDs they visited and the choice indices). The server walks the
 * scenario graph and independently computes the result. Tamper-proof.
 *
 * Now supports terminal choices: a choice that ends the scenario immediately.
 */

import type {
  Scenario,
  Outcome,
} from "@/types/scenario";

export interface CompletionResult {
  reputation_change: number;
  outcome: Outcome | null;
  patient_log: {
    scenario_id: string;
    patient_name: string;
    outcome_label: string;
  } | null;
}

/**
 * Walk a scenario along a given path and compute the result.
 *
 * @param scenario  The scenario being played
 * @param path      Node IDs visited in order, starting from start_node
 * @param choices   For decision/multi-select nodes, the choice indices taken
 */
export function computeCompletion(
  scenario: Scenario,
  path: string[],
  choices: Record<string, number | number[]>
): CompletionResult {
  let reputation = 0;
  let outcome: Outcome | null = null;
  let terminalPatientLog: CompletionResult["patient_log"] = null;

  for (const nodeId of path) {
    const node = scenario.nodes[nodeId];
    if (!node) {
      throw new Error(`Path references missing node "${nodeId}"`);
    }

    if (node.type === "decision") {
      const choiceIndex = choices[nodeId];
      if (typeof choiceIndex !== "number") {
        throw new Error(
          `Decision node "${nodeId}" requires a single choice index`
        );
      }
      const choice = node.choices[choiceIndex];
      if (!choice) {
        throw new Error(
          `Choice index ${choiceIndex} out of range for node "${nodeId}"`
        );
      }

      reputation += choice.reputation;

      if (choice.terminal && choice.terminal_outcome) {
        // Terminal choice — scenario ends here, outcome is bad.
        outcome = "bad";
        terminalPatientLog = {
          scenario_id: scenario.id,
          patient_name: scenario.patient.display_name,
          outcome_label: choice.terminal_outcome.log,
        };
        // Stop walking the path; nothing after a terminal choice counts.
        break;
      }

      if (choice.outcome) outcome = choice.outcome;
    }

    if (node.type === "multi_select") {
      const selected = choices[nodeId];
      if (!Array.isArray(selected)) {
        throw new Error(
          `Multi-select node "${nodeId}" requires an array of choice indices`
        );
      }
      if (selected.length > node.max_selections) {
        throw new Error(
          `Multi-select node "${nodeId}" exceeded max_selections`
        );
      }
      let terminatedDuringMulti = false;
      for (const i of selected) {
        const choice = node.choices[i];
        if (!choice) {
          throw new Error(
            `Choice index ${i} out of range for node "${nodeId}"`
          );
        }
        reputation += choice.reputation;
        if (choice.terminal && choice.terminal_outcome) {
          outcome = "bad";
          terminalPatientLog = {
            scenario_id: scenario.id,
            patient_name: scenario.patient.display_name,
            outcome_label: choice.terminal_outcome.log,
          };
          terminatedDuringMulti = true;
          break;
        }
      }
      if (terminatedDuringMulti) break;
    }
  }

  // If we terminated early, the patient log comes from the terminal_outcome.
  // Otherwise, build it from the scenario's outcome node (existing behaviour).
  let patient_log: CompletionResult["patient_log"] = terminalPatientLog;

  if (!patient_log) {
    const outcomeNode = Object.values(scenario.nodes).find(
      (n) => n.type === "outcome"
    );
    if (outcomeNode && outcomeNode.type === "outcome" && outcome) {
      const variant = outcome === "good" ? outcomeNode.good : outcomeNode.bad;
      patient_log = {
        scenario_id: scenario.id,
        patient_name: scenario.patient.display_name,
        outcome_label: variant.log,
      };
    }
  }

  return { reputation_change: reputation, outcome, patient_log };
}