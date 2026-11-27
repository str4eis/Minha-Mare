import { describe, expect, it } from "vitest";
import { isEmbeddedBrowser, mapOAuthError } from "./oauth";

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
