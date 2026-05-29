/**
 * Pharmacquest — Rank tiers
 *
 * Maps a reputation number to a display title. Centralized here so the
 * thresholds are easy to tune across the app.
 */

export interface Rank {
  title: string;
  min: number;
  next?: number;
}

const RANKS: Rank[] = [
  { title: "Intern",              min: 0,    next: 25 },
  { title: "Junior Pharmacist",   min: 25,   next: 75 },
  { title: "Pharmacist",          min: 75,   next: 150 },
  { title: "Senior Pharmacist",   min: 150,  next: 300 },
  { title: "Clinical Lead",       min: 300,  next: 500 },
  { title: "Consultant",          min: 500 },
];

export function getRank(reputation: number): Rank {
  const value = Math.max(0, reputation);
  // Walk from highest to lowest, return the first match.
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (value >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

export function progressToNextRank(reputation: number): number {
  const rank = getRank(reputation);
  if (!rank.next) return 1;
  const span = rank.next - rank.min;
  const into = reputation - rank.min;
  return Math.min(1, Math.max(0, into / span));
}