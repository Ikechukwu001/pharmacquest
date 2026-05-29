/**
 * Pharmacquest — Scenario Server Actions
 *
 * Server-side functions that the player UI calls when a scenario finishes.
 * Validates the path, computes the result, writes to the database.
 */

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { loadScenario } from "@/lib/scenarios/load";
import { computeCompletion } from "@/lib/progression/computeCompletion";

interface RecordCompletionInput {
  scenarioId: string;
  path: string[];
  choices: Record<string, number | number[]>;
}

interface RecordCompletionResult {
  success: boolean;
  error?: string;
  reputation_change?: number;
  outcome?: "good" | "bad" | null;
}

/**
 * Record a scenario completion for the currently logged-in user.
 *
 * The DB trigger we set up in Step 26 will automatically:
 *   - Update profiles.reputation
 *   - Update profiles.last_played_at
 */
export async function recordCompletion(
  input: RecordCompletionInput
): Promise<RecordCompletionResult> {
  const supabase = await createClient();

  // Require login.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not logged in" };
  }

  // Load the scenario from disk (the source of truth).
  let scenario;
  try {
    scenario = await loadScenario(input.scenarioId);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  // Compute the result server-side. The player's reported choices are
  // re-evaluated against the trusted scenario data.
  let result;
  try {
    result = computeCompletion(scenario, input.path, input.choices);
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }

  // Insert the completion. RLS ensures user_id must match auth.uid().
  const { data: completion, error: completionError } = await supabase
    .from("scenario_completions")
    .insert({
      user_id: user.id,
      scenario_id: input.scenarioId,
      path_taken: input.path,
      reputation_change: result.reputation_change,
      outcome: result.outcome,
    })
    .select("id")
    .single();

  if (completionError || !completion) {
    return {
      success: false,
      error: completionError?.message ?? "Failed to record completion",
    };
  }

  // Insert the patient log entry if one was generated.
  if (result.patient_log) {
    const { error: logError } = await supabase.from("patient_log").insert({
      user_id: user.id,
      completion_id: completion.id,
      scenario_id: result.patient_log.scenario_id,
      patient_name: result.patient_log.patient_name,
      outcome_label: result.patient_log.outcome_label,
    });

    if (logError) {
      // We don't fail the whole completion just because the log entry failed.
      // Log it server-side for debugging.
      console.error("Failed to write patient log entry:", logError);
    }
  }

  // Invalidate cached dashboard data so the user sees their updated stats.
  revalidatePath("/");

  return {
    success: true,
    reputation_change: result.reputation_change,
    outcome: result.outcome,
  };
}