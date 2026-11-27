import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isValidFullName,
  isValidPassword,
  passwordsMatch,
} from "./auth-validation";

describe("auth validation", () => {
  it("accepts valid e-mail and rejects malformed addresses", () => {
    expect(isValidEmail("marisqueira@example.com")).toBe(true);
    expect(isValidEmail("marisqueira@")).toBe(false);
    expect(isValidEmail("sem-arroba.example.com")).toBe(false);
  });

  it("requires a password with at least eight characters", () => {
    expect(isValidPassword("mare1234")).toBe(true);
    expect(isValidPassword("curta12")).toBe(false);
  });

  it("checks password confirmation and non-empty name", () => {
    expect(passwordsMatch("senha1234", "senha1234")).toBe(true);
    expect(passwordsMatch("senha1234", "senha4321")).toBe(false);
    expect(isValidFullName("  Maria da Maré ")).toBe(true);
    expect(isValidFullName("   ")).toBe(false);
  });
});
