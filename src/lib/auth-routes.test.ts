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
    expect(safeNextPath(undefined)).toBeNull();
  });

  it("identifies protected and authentication routes", () => {
    expect(isProtectedPath("/home")).toBe(true);
    expect(isProtectedPath("/vendas/novo")).toBe(true);
    expect(isProtectedPath("/perfil")).toBe(true);
    expect(isProtectedPath("/perfil/editar")).toBe(true);
    expect(isProtectedPath("/mais")).toBe(true);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isAuthPath("/login")).toBe(true);
    expect(isAuthPath("/cadastro")).toBe(true);
    expect(isAuthPath("/recuperar-senha")).toBe(false);
    expect(isAuthPath("/redefinir-senha")).toBe(false);
    expect(isAuthPath("/mais")).toBe(false);
    expect(isAuthPath("/auth/callback")).toBe(false);
  });

  it.each(["/privacidade", "/termos"])(
    "keeps %s public and outside authentication routes",
    (pathname) => {
      expect(isProtectedPath(pathname)).toBe(false);
      expect(isAuthPath(pathname)).toBe(false);
    }
  );
});
