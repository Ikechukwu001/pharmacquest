/**
 * Pharmacquest — Scenario player page
 *
 * Loads a scenario on the server (where we can read files) and passes it
 * down to the client component (where the player makes choices).
 *
 * URL: /play/scn_001_strong_drugs
 */
import Link from "next/link";
import { loadScenario } from "@/lib/scenarios/load";
import { ScenarioPlayer } from "./ScenarioPlayer";

interface PageProps {
  params: Promise<{ scenarioId: string }>;
}

export default async function PlayPage({ params }: PageProps) {
  const { scenarioId } = await params;

  let scenario;
  try {
    scenario = await loadScenario(scenarioId);
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <p className="text-sm font-mono text-foreground-subtle">
            Scenario not found
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            That scenario doesn&apos;t exist.
          </h1>
          <p className="text-foreground-muted leading-relaxed">
            It may have been removed, or the link may be wrong. Pick a
            scenario from the dashboard.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-4xl bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return <ScenarioPlayer scenario={scenario} />;
}