import { describe, expect, it } from "vitest";
import { calculateRetirementProgress } from "./retirement";

describe("calculateRetirementProgress", () => {
  it("returns zero when no goal is set", () => {
    expect(calculateRetirementProgress(0, 250)).toEqual({
      percentage: 0,
      barPercentage: 0,
    });
  });

  it("keeps the real percentage while capping the progress bar", () => {
    expect(calculateRetirementProgress(100, 150)).toEqual({
      percentage: 150,
      barPercentage: 100,
    });
  });
});
