import { describe, expect, it } from "vitest";
import { validateProfileForm } from "./profile-validation";

const validProfile = {
  fullName: "Maria da Maré",
};

describe("validateProfileForm", () => {
  it("accepts a profile name", () => {
    expect(validateProfileForm(validProfile)).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(validateProfileForm({ ...validProfile, fullName: " " })).toContain(
      "nome"
    );
  });
});
