/**
 * Pharmacquest — Scenario type definitions
 *
 * A Scenario is a graph of nodes. The player starts at `start_node` and
 * traverses the graph by making choices. The graph ends when a node has no
 * `next` property, or `next` is null.
 *
 * This file is the single source of truth for the scenario shape. Every
 * scenario JSON file in content/scenarios/ must conform to the Scenario type
 * exported at the bottom of this file.
 */

// ─── Primitive shared types ────────────────────────────────────────────────

export type Profession = "pharmacy" | "nursing" | "mls" | "medicine";

export type Difficulty = "easy" | "intermediate" | "hard";

export type Outcome = "good" | "bad";

// ─── Metadata ──────────────────────────────────────────────────────────────

export interface ScenarioMeta {
  title: string;
  profession: Profession;
  setting: string;
  difficulty: Difficulty;
  estimated_minutes: number;
  learning_objectives: string[];
  intro_video?: string;
}

// ─── Patient ───────────────────────────────────────────────────────────────

export interface Patient {
  display_name: string;
  age: number;
  sex: "male" | "female";
  appearance: string;
}

// ─── Terminal outcomes (early-ending choices) ──────────────────────────────

/**
 * When a choice ends the scenario immediately, it carries its own narrative
 * outcome and custom coaching content. The player skips remaining nodes
 * and goes straight to a "what happened" + "what you should learn" screen.
 */
export interface TerminalOutcome {
  /** Short narrative — what happened to the patient after this fatal choice. */
  outcome_text: string;

  /** Patient log entry — appears in the user's casebook. */
  log: string;

  /** The lesson from this specific failure. */
  principle: string;

  /** Optional expert note specific to this failure path. */
  expert_note?: string;

  /** Optional references specific to this failure path. */
  references?: string[];
}

// ─── Node types ────────────────────────────────────────────────────────────

/**
 * A Scene node shows narrative text and moves to the next node automatically.
 * Used for intros and transitions.
 */
export interface SceneNode {
  type: "scene";
  text: string;
  next: string;
}

/**
 * A Decision node presents 2-5 choices. Each choice has a reputation delta,
 * an in-character patient reaction, and may declare an outcome (good/bad)
 * that the Outcome node will later read.
 */
export interface DecisionChoice {
  label: string;
  reputation: number;
  reaction?: string;
  outcome?: Outcome;

  /**
   * If true, picking this choice ends the scenario immediately.
   * When terminal is true, `terminal_outcome` must be provided and `next`
   * is ignored (it can be omitted or set to a placeholder).
   */
  terminal?: boolean;

  /** Required when terminal is true. */
  terminal_outcome?: TerminalOutcome;

  /** Next node ID. Optional only when terminal is true. */
  next?: string;
}

export interface DecisionNode {
  type: "decision";
  prompt: string;
  choices: DecisionChoice[];
}

/**
 * A MultiSelect node lets the player pick up to `max_selections` actions
 * before moving on. Each pick reveals information.
 */
export interface MultiSelectChoice {
  label: string;
  reveals: string;
  reputation: number;

  /**
   * If true, picking this option ends the scenario immediately when the
   * player confirms their selection. Rarely used in multi-select.
   */
  terminal?: boolean;

  /** Required when terminal is true. */
  terminal_outcome?: TerminalOutcome;
}

export interface MultiSelectNode {
  type: "multi_select";
  prompt: string;
  max_selections: number;
  choices: MultiSelectChoice[];
  next: string;
}

/**
 * An Outcome node shows the consequence based on the path the player took.
 * The renderer picks `good` or `bad` based on the outcome the player triggered
 * in an earlier DecisionNode.
 */
export interface OutcomeVariant {
  text: string;
  log: string;
}

export interface OutcomeNode {
  type: "outcome";
  good: OutcomeVariant;
  bad: OutcomeVariant;
  next: string;
}

/**
 * A Coaching node is the educational closing screen. No further nodes follow.
 */
export interface CoachingNode {
  type: "coaching";
  principle: string;
  expert_note: string;
  references: string[];
}

/**
 * Union of all node types. The `type` field acts as a discriminator —
 * TypeScript narrows the type automatically when we check `node.type`.
 */
export type ScenarioNode =
  | SceneNode
  | DecisionNode
  | MultiSelectNode
  | OutcomeNode
  | CoachingNode;

// ─── The Scenario itself ───────────────────────────────────────────────────

export interface Scenario {
  id: string;
  version: number;
  meta: ScenarioMeta;
  patient: Patient;
  start_node: string;
  nodes: Record<string, ScenarioNode>;
}