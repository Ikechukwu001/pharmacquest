/**
 * Pharmacquest — Scenario player (client component)
 *
 * Manages player state and renders the appropriate UI for each node type.
 * Visual design: persistent patient card, thin progress bar, choice cards
 * with weight, and distinct visual treatment for terminal endings + coaching.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import type {
  Scenario,
  ScenarioNode,
  Outcome,
  TerminalOutcome,
} from "@/types/scenario";
import { recordCompletion } from "@/lib/scenarios/actions";
import { PatientCard } from "@/components/scenario/PatientCard";
import { ProgressIndicator } from "@/components/scenario/ProgressIndicator";
import { ChoiceButton } from "@/components/scenario/ChoiceButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ScenarioPlayerProps {
  scenario: Scenario;
}

type PlayerChoice = number | number[];
type SaveState = "idle" | "saving" | "saved" | "error";

export function ScenarioPlayer({ scenario }: ScenarioPlayerProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>(scenario.start_node);
  const [reputation, setReputation] = useState<number>(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [path, setPath] = useState<string[]>([scenario.start_node]);
  const [choices, setChoices] = useState<Record<string, PlayerChoice>>({});
  const [terminalEnd, setTerminalEnd] = useState<TerminalOutcome | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const currentNode = scenario.nodes[currentNodeId];
  if (!currentNode) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="py-6 text-center text-foreground-muted">
            Error: node &quot;{currentNodeId}&quot; not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  function advance(nextNodeId: string) {
    setCurrentNodeId(nextNodeId);
    setPath((prev) => [...prev, nextNodeId]);
  }

  function handleDecisionChoice(
    choiceIndex: number,
    nextNodeId: string | undefined,
    reputationDelta: number,
    choiceOutcome?: Outcome,
    terminalOutcome?: TerminalOutcome
  ) {
    setReputation((prev) => prev + reputationDelta);
    setChoices((prev) => ({ ...prev, [currentNodeId]: choiceIndex }));

    if (terminalOutcome) {
      setOutcome("bad");
      setTerminalEnd(terminalOutcome);
      return;
    }

    if (choiceOutcome) setOutcome(choiceOutcome);
    if (nextNodeId) advance(nextNodeId);
  }

  function handleMultiSelect(
    selectedIndices: number[],
    reputationDelta: number,
    nextNodeId: string
  ) {
    setReputation((prev) => prev + reputationDelta);
    setChoices((prev) => ({ ...prev, [currentNodeId]: selectedIndices }));
    advance(nextNodeId);
  }

  async function saveCompletion() {
    if (saveState !== "idle") return;
    setSaveState("saving");
    setSaveError(null);

    const result = await recordCompletion({
      scenarioId: scenario.id,
      path,
      choices,
    });

    if (result.success) {
      setSaveState("saved");
    } else {
      setSaveState("error");
      setSaveError(result.error ?? "Unknown error");
    }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Top bar: progress + title + rep */}
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-3 pb-2 space-y-2">
          <ProgressIndicator pathLength={path.length} />
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2">
              <Link
                href="/"
                className="text-sm text-foreground-muted hover:text-foreground shrink-0"
              >
                ← Exit
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <p className="text-sm font-medium truncate">{scenario.meta.title}</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs shrink-0">
              {reputation >= 0 ? "+" : ""}{reputation} rep
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Persistent patient card */}
        <PatientCard patient={scenario.patient} />

        {/* Current scene/decision */}
        {terminalEnd ? (
          <TerminalEndRenderer
            terminalOutcome={terminalEnd}
            onSave={saveCompletion}
            saveState={saveState}
            saveError={saveError}
          />
        ) : (
          <NodeRenderer
            node={currentNode}
            outcome={outcome}
            onDecisionChoice={handleDecisionChoice}
            onMultiSelect={handleMultiSelect}
            onAdvance={advance}
            onScenarioEnd={saveCompletion}
            saveState={saveState}
            saveError={saveError}
          />
        )}
      </main>
    </div>
  );
}

// ─── Node renderer ─────────────────────────────────────────────────────────

interface NodeRendererProps {
  node: ScenarioNode;
  outcome: Outcome | null;
  onDecisionChoice: (
    choiceIndex: number,
    nextNodeId: string | undefined,
    reputationDelta: number,
    choiceOutcome?: Outcome,
    terminalOutcome?: TerminalOutcome
  ) => void;
  onMultiSelect: (
    selectedIndices: number[],
    reputationDelta: number,
    nextNodeId: string
  ) => void;
  onAdvance: (nextNodeId: string) => void;
  onScenarioEnd: () => void;
  saveState: SaveState;
  saveError: string | null;
}

function NodeRenderer({
  node,
  outcome,
  onDecisionChoice,
  onMultiSelect,
  onAdvance,
  onScenarioEnd,
  saveState,
  saveError,
}: NodeRendererProps) {
  switch (node.type) {
    case "scene":
      return (
        <Card>
          <CardContent className="py-5 px-5 sm:py-6 sm:px-6 space-y-5">
            <p className="text-base leading-relaxed whitespace-pre-line">
              {node.text}
            </p>
            <div className="flex justify-end">
              <Button onClick={() => onAdvance(node.next)}>
                Continue →
              </Button>
            </div>
          </CardContent>
        </Card>
      );

    case "decision":
      return (
        <Card>
          <CardContent className="py-5 px-5 sm:py-6 sm:px-6 space-y-4">
            <p className="text-xs uppercase tracking-wider text-primary-700 font-semibold">
              Decision
            </p>
            <h2 className="text-xl font-bold leading-tight">{node.prompt}</h2>
            <div className="space-y-2.5">
              {node.choices.map((choice, i) => (
                <ChoiceButton
                  key={i}
                  label={choice.label}
                  onClick={() =>
                    onDecisionChoice(
                      i,
                      choice.next,
                      choice.reputation,
                      choice.outcome,
                      choice.terminal_outcome
                    )
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>
      );

    case "multi_select":
      return (
        <MultiSelectRenderer
          node={node}
          onConfirm={(selected, repDelta) =>
            onMultiSelect(selected, repDelta, node.next)
          }
        />
      );

    case "outcome": {
      const variant = outcome === "good" ? node.good : node.bad;
      const isGood = outcome === "good";
      return (
        <Card
          className={
            isGood
              ? "border-success/30 bg-success-bg/50"
              : "border-danger/30 bg-danger-bg/50"
          }
        >
          <CardContent className="py-5 px-5 sm:py-6 sm:px-6 space-y-4">
            <p
              className={`text-xs uppercase tracking-wider font-semibold ${
                isGood ? "text-success" : "text-danger"
              }`}
            >
              {isGood ? "Two weeks later" : "Two weeks later"}
            </p>
            <p className="text-base leading-relaxed">{variant.text}</p>
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-1">
                Patient log
              </p>
              <p className="text-sm font-mono">{variant.log}</p>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => onAdvance(node.next)}>
                Continue →
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    case "coaching":
      return (
        <div className="space-y-4">
          <Card>
            <CardContent className="py-5 px-5 sm:py-6 sm:px-6 space-y-5">
              <p className="text-xs uppercase tracking-wider text-primary-700 font-semibold">
                What you should learn
              </p>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Key principle</p>
                  <p className="text-base leading-relaxed text-foreground">
                    {node.principle}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">From the pharmacist</p>
                  <p className="text-base leading-relaxed text-foreground-muted italic">
                    {node.expert_note}
                  </p>
                </div>
                {node.references && node.references.length > 0 && (
                  <div className="pt-3 border-t border-border/60">
                    <p className="text-xs uppercase tracking-wider text-foreground-subtle mb-2">
                      References
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-sm text-foreground-muted">
                      {node.references.map((ref, i) => (
                        <li key={i}>{ref}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <SaveSection
            saveState={saveState}
            saveError={saveError}
            onSave={onScenarioEnd}
          />
        </div>
      );

    default: {
      const _exhaustive: never = node;
      return <div>Unknown node type: {JSON.stringify(_exhaustive)}</div>;
    }
  }
}

// ─── Multi-select sub-component ────────────────────────────────────────────

interface MultiSelectRendererProps {
  node: Extract<ScenarioNode, { type: "multi_select" }>;
  onConfirm: (selectedIndices: number[], reputationDelta: number) => void;
}

function MultiSelectRenderer({ node, onConfirm }: MultiSelectRendererProps) {
  const [selected, setSelected] = useState<number[]>([]);

  function selectChoice(index: number) {
    if (selected.includes(index)) return;
    if (selected.length >= node.max_selections) return;
    setSelected([...selected, index]);
  }

  function confirm() {
    const totalRep = selected.reduce(
      (sum, i) => sum + node.choices[i].reputation,
      0
    );
    onConfirm(selected, totalRep);
  }

  const maxReached = selected.length >= node.max_selections;

  return (
    <Card>
      <CardContent className="py-5 px-5 sm:py-6 sm:px-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-wider text-accent-700 font-semibold">
            Gather information
          </p>
          <Badge variant="outline" className="font-mono text-xs">
            {selected.length} / {node.max_selections}
          </Badge>
        </div>
        <h2 className="text-xl font-bold leading-tight">{node.prompt}</h2>

        <div className="space-y-2.5">
          {node.choices.map((choice, i) => {
            const isSelected = selected.includes(i);
            const isDisabled = isSelected || maxReached;
            return (
              <ChoiceButton
                key={i}
                label={choice.label}
                selected={isSelected}
                disabled={isDisabled}
                locked={isSelected}
                detail={choice.reveals}
                onClick={() => selectChoice(i)}
              />
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={confirm} disabled={selected.length === 0}>
            Continue with {selected.length} selection{selected.length === 1 ? "" : "s"} →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Terminal end renderer ─────────────────────────────────────────────────

function TerminalEndRenderer({
  terminalOutcome,
  onSave,
  saveState,
  saveError,
}: {
  terminalOutcome: TerminalOutcome;
  onSave: () => void;
  saveState: SaveState;
  saveError: string | null;
}) {
  return (
    <div className="space-y-4">
      <Card className="border-danger/30 bg-danger-bg/40">
        <CardContent className="py-5 px-5 sm:py-6 sm:px-6 space-y-4">
          <p className="text-xs uppercase tracking-wider text-danger font-semibold">
            The scenario ended
          </p>
          <p className="text-base leading-relaxed">
            {terminalOutcome.outcome_text}
          </p>
          <div className="pt-2 border-t border-danger/20">
            <p className="text-xs uppercase tracking-wider text-foreground-subtle mb-1">
              Patient log
            </p>
            <p className="text-sm font-mono">{terminalOutcome.log}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5 px-5 sm:py-6 sm:px-6 space-y-4">
          <p className="text-xs uppercase tracking-wider text-primary-700 font-semibold">
            What you should learn
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-1">Key principle</p>
              <p className="text-base leading-relaxed">
                {terminalOutcome.principle}
              </p>
            </div>
            {terminalOutcome.expert_note && (
              <div>
                <p className="text-sm font-semibold mb-1">From the pharmacist</p>
                <p className="text-base leading-relaxed text-foreground-muted italic">
                  {terminalOutcome.expert_note}
                </p>
              </div>
            )}
            {terminalOutcome.references && terminalOutcome.references.length > 0 && (
              <div className="pt-3 border-t border-border/60">
                <p className="text-xs uppercase tracking-wider text-foreground-subtle mb-2">
                  References
                </p>
                <ul className="space-y-1 list-disc list-inside text-sm text-foreground-muted">
                  {terminalOutcome.references.map((ref, i) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <SaveSection saveState={saveState} saveError={saveError} onSave={onSave} />
    </div>
  );
}

// ─── Save section ──────────────────────────────────────────────────────────

function SaveSection({
  saveState,
  saveError,
  onSave,
}: {
  saveState: SaveState;
  saveError: string | null;
  onSave: () => void;
}) {
  if (saveState === "idle") {
    return (
      <div className="flex justify-center pt-2">
        <Button size="lg" onClick={onSave}>
          Save my progress
        </Button>
      </div>
    );
  }

  if (saveState === "saving") {
    return (
      <p className="text-center text-foreground-muted py-3">
        Saving your progress…
      </p>
    );
  }

  if (saveState === "saved") {
    return (
      <Card className="border-success/30 bg-success-bg/40">
        <CardContent className="py-5 px-5 text-center space-y-3">
          <p className="text-success font-semibold">Progress saved</p>
          <Button asChild variant="outline">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-danger/30 bg-danger-bg/40">
      <CardContent className="py-5 px-5 space-y-3">
        <p className="text-danger font-medium">Failed to save: {saveError}</p>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onSave}>
            Try again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}