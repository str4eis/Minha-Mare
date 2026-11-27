import { describe, expect, it } from "vitest";
import { validateProfileForm } from "./profile-validation";

const validProfile = {
  fullName: "Maria da Maré",
  retirementGoal: "1250,50",
  retirementSaved: "0",
};

describe("validateProfileForm", () => {
  it("accepts comma/dot money formats and a zero balance", () => {
    expect(validateProfileForm(validProfile)).toBeNull();
    expect(
      validateProfileForm({ ...validProfile, retirementGoal: "1250.50" })
    ).toBeNull();
  });

  it("rejects an empty name and invalid or negative amounts", () => {
    expect(validateProfileForm({ ...validProfile, fullName: " " })).toContain(
      "nome"
    );
    expect(
      validateProfileForm({ ...validProfile, retirementGoal: "NaN" })
    ).toContain("meta");
    expect(
      validateProfileForm({ ...validProfile, retirementSaved: "-10" })
    ).toContain("guardado");
  });
});
