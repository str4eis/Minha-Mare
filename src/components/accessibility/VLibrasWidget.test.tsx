import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const scriptCallbacks = vi.hoisted(() => ({
  onLoad: undefined as (() => void) | undefined,
}));

vi.mock("next/script", () => ({
  default: (props: { onLoad?: () => void }) => {
    scriptCallbacks.onLoad = props.onLoad;
    return null;
  },
}));

import VLibrasWidget from "./VLibrasWidget";

afterEach(() => {
  vi.unstubAllGlobals();
  scriptCallbacks.onLoad = undefined;
});

describe("VLibrasWidget", () => {
  it("renders the plugin structure", () => {
    const markup = renderToStaticMarkup(createElement(VLibrasWidget));

    expect(markup).toContain('vw=""');
    expect(markup).toContain('vw-access-button=""');
    expect(markup).toContain('vw-plugin-wrapper=""');
    expect(markup).toContain('class="vw-plugin-top-wrapper"');
  });

  it("initializes the widget once when the script loads", () => {
    const urls: string[] = [];
    class MockWidget {
      constructor(url: string) {
        urls.push(url);
      }
    }
    vi.stubGlobal("window", { VLibras: { Widget: MockWidget } });
    renderToStaticMarkup(createElement(VLibrasWidget));

    scriptCallbacks.onLoad?.();
    scriptCallbacks.onLoad?.();

    expect(urls).toEqual(["https://vlibras.gov.br/app"]);
  });

  it("does not throw when the external widget is unavailable", () => {
    vi.stubGlobal("window", {});
    renderToStaticMarkup(createElement(VLibrasWidget));

    expect(() => scriptCallbacks.onLoad?.()).not.toThrow();
  });

  it("fails silently if the widget constructor throws", () => {
    class FailingWidget {
      constructor() {
        throw new Error("widget unavailable");
      }
    }
    vi.stubGlobal("window", { VLibras: { Widget: FailingWidget } });
    renderToStaticMarkup(createElement(VLibrasWidget));

    expect(() => scriptCallbacks.onLoad?.()).not.toThrow();
  });
});
