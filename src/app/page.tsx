/**
 * Pharmacquest — Home / Dashboard
 *
 * The room Amaka lives in. Hierarchy:
 *   1. Hero: greeting + primary CTA
 *   2. Stats: rep / streak / rank — small, glanceable
 *   3. Scenarios: cards with completion status
 *   4. Casebook: patient log
 *   5. Recent attempts (secondary, can be hidden later)
 */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logOut } from "@/lib/auth/actions";
import { SCENARIO_MANIFEST } from "@/lib/scenarios/manifest";
import { getRank, progressToNextRank } from "@/lib/progression/ranks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  // Fetch profile, completions, and patient log in parallel.
  const [
    { data: profile },
    { data: completions },
    { data: patientLog },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, reputation, streak_days, profession, school, year_of_study")
      .eq("id", user.id)
      .single(),
    supabase
      .from("scenario_completions")
      .select("scenario_id, outcome, reputation_change, completed_at")
      .order("completed_at", { ascending: false })
      .limit(20),
    supabase
      .from("patient_log")
      .select("patient_name, outcome_label, scenario_id, encountered_at")
      .order("encountered_at", { ascending: false })
      .limit(10),
  ]);

  const reputation = profile?.reputation ?? 0;
  const streak = profile?.streak_days ?? 0;
  const rank = getRank(reputation);
  const rankProgress = progressToNextRank(reputation);
  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Pharmacist";
  const firstName = displayName.split(/[\s.]/)[0];

  // Build a completion map: scenario_id → best outcome
  const completionMap = new Map<string, "good" | "bad">();
  for (const c of completions ?? []) {
    if (!completionMap.has(c.scenario_id)) {
      completionMap.set(c.scenario_id, (c.outcome as "good" | "bad" | null) ?? "bad");
    } else if (c.outcome === "good") {
      completionMap.set(c.scenario_id, "good");
    }
  }

  // Find next scenario to play: the first uncompleted, or the first one if all completed
  const nextScenario =
    SCENARIO_MANIFEST.find((s) => !completionMap.has(s.id)) ?? SCENARIO_MANIFEST[0];

  return (
    <div className="min-h-screen">
      <TopBar displayName={displayName} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
        {/* Hero */}
        <section className="space-y-4">
          <div>
            <p className="text-sm text-foreground-muted">Welcome back,</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
              {firstName}
            </h1>
            {profile?.year_of_study && (
              <p className="text-sm text-foreground-muted mt-1">
                Year {profile.year_of_study} pharmacy student
              </p>
            )}
          </div>

          {nextScenario && (
            <Card className="bg-primary-500 text-white border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardDescription className="text-primary-100">
                  {completionMap.has(nextScenario.id) ? "Replay" : "Next up"}
                </CardDescription>
                <CardTitle className="text-2xl text-white">
                  {nextScenario.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-primary-50 leading-relaxed">
                  {nextScenario.blurb}
                </p>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="bg-white text-black"
                >
                  <Link href={`/play/${nextScenario.id}`}>
                    Start training →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3">
          <StatTile
            label="Reputation"
            value={reputation.toString()}
            sublabel={rank.title}
          />
          <StatTile
            label="Streak"
            value={streak.toString()}
            sublabel={streak === 1 ? "day" : "days"}
            accent={streak >= 3}
          />
          <StatTile
            label="Casebook"
            value={(patientLog?.length ?? 0).toString()}
            sublabel={patientLog?.length === 1 ? "patient" : "patients"}
          />
        </section>

        {/* Rank progress (only if not at top rank) */}
        {rank.next && (
          <section className="space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-foreground-muted">
                Progress to <span className="text-foreground font-medium">
                  {getRankAfter(rank)?.title ?? "next rank"}
                </span>
              </span>
              <span className="font-mono text-foreground-muted">
                {Math.max(0, reputation - rank.min)} / {rank.next - rank.min}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{ width: `${rankProgress * 100}%` }}
              />
            </div>
          </section>
        )}

        <Separator />

        {/* Scenarios */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">All scenarios</h2>
            <Badge variant="outline" className="font-mono">
              {SCENARIO_MANIFEST.length}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {SCENARIO_MANIFEST.map((s) => (
              <ScenarioCard
                key={s.id}
                scenario={s}
                completion={completionMap.get(s.id)}
              />
            ))}
          </div>
        </section>

        {/* Casebook */}
        <Separator />
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Your casebook</h2>
          {patientLog && patientLog.length > 0 ? (
            <div className="space-y-2">
              {patientLog.map((entry, i) => (
                <Card key={i} className="shadow-none">
                  <CardContent className="py-3 px-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{entry.patient_name}</p>
                      <p className="text-sm text-foreground-muted truncate">
                        {entry.outcome_label}
                      </p>
                    </div>
                    <span className="text-xs text-foreground-subtle whitespace-nowrap">
                      {formatRelativeDate(entry.encountered_at)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-none border-dashed">
              <CardContent className="py-8 px-6 text-center space-y-2">
                <p className="text-foreground font-medium">
                  No patients yet.
                </p>
                <p className="text-sm text-foreground-muted max-w-sm mx-auto">
                  Every scenario you complete adds a patient to your casebook.
                  Start with a quick case from the list above.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

function TopBar({ displayName }: { displayName: string }) {
  const initial = displayName.charAt(0).toUpperCase();
  return (
    <header className="border-b border-border bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Pharmacquest
        </Link>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-medium">
              {initial}
            </AvatarFallback>
          </Avatar>
          <form action={logOut}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

function StatTile({
  label,
  value,
  sublabel,
  accent = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="py-4 px-3 sm:px-4">
        <p className="text-xs text-foreground-muted">{label}</p>
        <p
          className={`text-2xl font-bold mt-1 tabular-nums ${
            accent ? "text-accent-600" : ""
          }`}
        >
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-foreground-subtle mt-0.5 truncate">
            {sublabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ScenarioCard({
  scenario,
  completion,
}: {
  scenario: (typeof SCENARIO_MANIFEST)[number];
  completion?: "good" | "bad";
}) {
  return (
    <Link
      href={`/play/${scenario.id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
    >
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">
              {scenario.title}
            </CardTitle>
            <DifficultyBadge difficulty={scenario.difficulty} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground-muted leading-relaxed line-clamp-2">
            {scenario.blurb}
          </p>
          <div className="flex items-center justify-between text-xs text-foreground-subtle">
            <span>{scenario.setting}</span>
            <span className="font-mono">{scenario.estimated_minutes} min</span>
          </div>
          {completion && (
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={
                  completion === "good"
                    ? "text-success"
                    : "text-foreground-muted"
                }
              >
                {completion === "good" ? "✓ Completed well" : "↻ Try again"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: "easy" | "intermediate" | "hard";
}) {
  const labels: Record<string, string> = {
    easy: "Easy",
    intermediate: "Intermediate",
    hard: "Hard",
  };
  const classes: Record<string, string> = {
    easy: "bg-success-bg text-success border-success/20",
    intermediate: "bg-primary-50 text-primary-700 border-primary-200",
    hard: "bg-danger-bg text-danger border-danger/20",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs whitespace-nowrap ${classes[difficulty]}`}
    >
      {labels[difficulty]}
    </Badge>
  );
}

// ─── Landing for logged-out users ──────────────────────────────────────────

function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-xl space-y-6">
        <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
          For Nigerian pharmacy students
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Train your pharmacy brain.
        </h1>
        <p className="text-lg text-foreground-muted leading-relaxed">
          Realistic clinical scenarios from Nigerian community pharmacy. Learn
          to think under pressure — without the consequences of getting it
          wrong on a real patient.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild size="lg">
            <Link href="/signup">Create account</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

// ─── Utilities ─────────────────────────────────────────────────────────────

function getRankAfter(rank: { title: string; min: number; next?: number }) {
  if (!rank.next) return null;
  return { title: "next tier", min: rank.next };
}

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}