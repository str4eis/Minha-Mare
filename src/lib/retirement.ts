export function calculateRetirementProgress(
  goal: number,
  saved: number
): { percentage: number; barPercentage: number } {
  if (!Number.isFinite(goal) || !Number.isFinite(saved) || goal <= 0) {
    return { percentage: 0, barPercentage: 0 };
  }

  const percentage = Math.max(0, (saved / goal) * 100);
  return {
    percentage,
    barPercentage: Math.min(100, percentage),
  };
}
