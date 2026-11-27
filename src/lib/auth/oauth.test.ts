import { describe, expect, it } from "vitest";
import {
  getOAuthRedirectUrl,
  getOAuthSuccessPath,
  getSessionRedirectPath,
  isEmbeddedBrowser,
  mapOAuthError,
} from "./oauth";

describe("OAuth callback URL", () => {
  it.each([
    ["http://localhost:3000", "http://localhost:3000/auth/callback?next=%2Fhome"],
    [
      "https://minha-mare.vercel.app",
      "https://minha-mare.vercel.app/auth/callback?next=%2Fhome",
    ],
  ])("uses the current app origin: %s", (origin, expected) => {
    expect(getOAuthRedirectUrl(origin)).toBe(expected);
  });

  it("keeps a safe destination and rejects an external one", () => {
    expect(getOAuthRedirectUrl("http://localhost:3000", "/resultados")).toBe(
      "http://localhost:3000/auth/callback?next=%2Fresultados"
    );
    expect(
      getOAuthRedirectUrl("http://localhost:3000", "//example.com")
    ).toBe("http://localhost:3000/auth/callback?next=%2Fhome");
  });
});

describe("OAuth success path", () => {
  it.each([undefined, null, "/", "//outside", "https://outside.test"])(
    "defaults missing or unsafe destinations to home: %s",
    (nextPath) => {
      expect(getOAuthSuccessPath(nextPath)).toBe("/home");
    }
  );

  it("preserves a safe internal destination", () => {
    expect(getOAuthSuccessPath("/resultados")).toBe("/resultados");
  });
});

describe("getSessionRedirectPath", () => {
  it("does not redirect without an active session", () => {
    expect(getSessionRedirectPath(null, "/resultados")).toBeNull();
  });

  it("redirects an active session to the safe destination", () => {
    expect(getSessionRedirectPath({ user: { id: "user-1" } })).toBe("/home");
    expect(getSessionRedirectPath({ user: { id: "user-1" } }, "/resultados")).toBe(
      "/resultados"
    );
    expect(getSessionRedirectPath({ user: { id: "user-1" } }, "//outside")).toBe(
      "/home"
    );
  });
});

describe("mapOAuthError", () => {
  it.each(["access_denied", "User canceled", { code: "access_denied" }])(
    "maps cancellation and denial into a friendly message",
    (error) => {
      expect(mapOAuthError(error)).toBe(
        "Você cancelou a entrada. Toque no botão para tentar de novo."
      );
    }
  );

  it.each([
    { name: "AuthRetryableFetchError", message: "Failed to fetch" },
    new TypeError("Load failed"),
    "offline",
  ])("maps network errors without showing technical details", (error) => {
    expect(mapOAuthError(error)).toBe("Sem internet no momento. Tente de novo.");
  });

  it("uses a safe message for unknown errors", () => {
    expect(mapOAuthError({ message: "internal server detail" })).toBe(
      "Não deu certo. Tente de novo em alguns instantes."
    );
  });
});

describe("isEmbeddedBrowser", () => {
  it.each([
    "Mozilla/5.0 Instagram 320.0.0",
    "Mozilla/5.0 FBAN/FBIOS; FBAV/450.0.0",
    "Mozilla/5.0 WhatsApp/2.26.10",
    "Mozilla/5.0 Line/14.0.0",
    "Mozilla/5.0 TikTok 40.0.0",
    "Mozilla/5.0 Musical_ly 40.0.0",
  ])("detects an embedded browser in %s", (userAgent) => {
    expect(isEmbeddedBrowser(userAgent)).toBe(true);
  });

  it.each([
    "Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 Version/18.0 Mobile Safari/605.1.15",
  ])("does not flag a regular browser in %s", (userAgent) => {
    expect(isEmbeddedBrowser(userAgent)).toBe(false);
  });
});
