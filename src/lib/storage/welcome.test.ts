import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getWelcomeVideoEmbedUrl,
  hasSeenWelcome,
  markWelcomeAsSeen,
  WELCOME_SEEN_KEY,
} from "./welcome";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("welcome storage", () => {
  it("reads and saves whether the guide has been seen", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });

    expect(hasSeenWelcome()).toBe(false);
    markWelcomeAsSeen();
    expect(values.get(WELCOME_SEEN_KEY)).toBe("true");
    expect(hasSeenWelcome()).toBe(true);
  });

  it("falls back safely when local storage is blocked", () => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("storage blocked");
      },
    });

    expect(hasSeenWelcome()).toBe(false);
    expect(() => markWelcomeAsSeen()).not.toThrow();
  });

  it("returns no embed URL for a missing or blank video ID", () => {
    expect(getWelcomeVideoEmbedUrl()).toBeNull();
    expect(getWelcomeVideoEmbedUrl("   ")).toBeNull();
  });

  it("builds a privacy-friendly URL and sanitizes spaces in the video ID", () => {
    expect(getWelcomeVideoEmbedUrl("  video id  ")).toBe(
      "https://www.youtube-nocookie.com/embed/video%20id?rel=0&modestbranding=1&playsinline=1&cc_load_policy=1&hl=pt"
    );
  });
});
