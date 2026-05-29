/**
 * Pharmacquest — Progress indicator
 *
 * A thin line at the top of the scenario player that gives a rough sense
 * of how far through the scenario the player is. Because scenarios branch,
 * "exact progress" is impossible — we approximate using path length vs
 * a heuristic target (most scenarios end between 5-8 nodes deep).
 */

interface ProgressIndicatorProps {
  pathLength: number;
  /** Approximate target node count for this scenario. */
  estimatedNodes?: number;
}

export function ProgressIndicator({
  pathLength,
  estimatedNodes = 7,
}: ProgressIndicatorProps) {
  const ratio = Math.min(1, pathLength / estimatedNodes);
  return (
    <div className="h-1 w-full bg-neutral-200 overflow-hidden rounded-full">
      <div
        className="h-full bg-primary-500 transition-all duration-500 ease-out"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}