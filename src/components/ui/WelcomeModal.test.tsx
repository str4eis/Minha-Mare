import {
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import SpeakButton from "../audio/SpeakButton";
import WelcomeModal from "./WelcomeModal";

type ButtonProps = {
  children?: ReactNode;
  onClick?: () => void;
};

function findButton(node: ReactNode, label: string): ReactElement<ButtonProps> | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findButton(child, label);
      if (found) return found;
    }
    return null;
  }
  if (!isValidElement<{ children?: ReactNode }>(node)) return null;

  if (
    node.type === "button" &&
    getText(node.props.children).trim() === label
  ) {
    return node as ReactElement<ButtonProps>;
  }
  return findButton(node.props.children, label);
}

function findSpeakButton(node: ReactNode): ReactElement<{ label?: string }> | null {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findSpeakButton(child);
      if (found) return found;
    }
    return null;
  }
  if (!isValidElement<{ children?: ReactNode }>(node)) return null;
  if (node.type === SpeakButton) {
    return node as ReactElement<{ label?: string }>;
  }
  return findSpeakButton(node.props.children);
}

function getText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getText(node.props.children);
  }
  return "";
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("WelcomeModal", () => {
  it("shows the vertical video when an ID is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WELCOME_VIDEO_ID", "welcome-video");
    const markup = renderToStaticMarkup(
      createElement(WelcomeModal, { open: true, onClose: () => undefined })
    );

    expect(markup).toContain('role="dialog"');
    expect(markup).toContain('aria-modal="true"');
    expect(markup).toContain(
      "https://www.youtube-nocookie.com/embed/welcome-video?"
    );
    expect(markup).toContain('title="Vídeo de boas-vindas do Minha Maré"');
    expect(markup).toContain(
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"'
    );
    expect(markup).toContain('allowfullscreen=""');
  });

  it("shows the visual and spoken explanation without a video", () => {
    vi.stubEnv("NEXT_PUBLIC_WELCOME_VIDEO_ID", "");
    const modal = WelcomeModal({ open: true, onClose: () => undefined });
    const markup = renderToStaticMarkup(modal);

    expect(markup).not.toContain("<iframe");
    expect(markup).toContain("anota suas vendas e seus gastos");
    expect(findSpeakButton(modal)?.props.label).toBe("Ouvir explicação");
  });

  it("marks the guide as seen and closes from the main button", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    const onClose = vi.fn();
    const modal = WelcomeModal({ open: true, onClose });
    const button = findButton(modal, "Entendi, começar");

    expect(button).not.toBeNull();
    button?.props.onClick?.();

    expect(values.get("minha-mare:welcome-seen:v1")).toBe("true");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
