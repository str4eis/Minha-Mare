import { describe, expect, it } from "vitest";
import { isAuthPath, isProtectedPath, safeNextPath } from "./auth-routes";

describe("auth route helpers", () => {
  it("accepts only safe internal next paths", () => {
    expect(safeNextPath("/home")).toBe("/home");
    expect(safeNextPath("//evil.com")).toBeNull();
    expect(safeNextPath("https://evil.com")).toBeNull();
    expect(safeNextPath("/\\evil.com")).toBeNull();
    expect(safeNextPath("")).toBeNull();
    expect(safeNextPath(null)).toBeNull();
  });

  it("identifies protected and authentication routes", () => {
    expect(isProtectedPath("/home")).toBe(true);
    expect(isProtectedPath("/vendas/novo")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isAuthPath("/recuperar-senha")).toBe(true);
    expect(isAuthPath("/redefinir-senha")).toBe(false);
  });
});
