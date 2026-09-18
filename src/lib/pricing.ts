const MULTIPLIER_TABLE: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 1.875,
  4: 2.125,
};

export function contributionMultiplier(peopleCount: number): number {
  const n = Math.max(1, Math.floor(peopleCount));
  if (n in MULTIPLIER_TABLE) return MULTIPLIER_TABLE[n];
  return MULTIPLIER_TABLE[4] + 0.05 * (n - 4);
}

export function calculateContributionValue(
  minValue: number,
  peopleCount: number,
) {
  return Math.round(minValue * contributionMultiplier(peopleCount) * 100) / 100;
}
