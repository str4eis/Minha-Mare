import {
  createElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
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
      createElement(WelcomeModal, {
        open: true,
        onClose: () => undefined,
        userId: "user-1",
      })
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
    expect(markup).not.toContain("Ouvir explicação");
  });

  it("shows no audio-description control when no video is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_WELCOME_VIDEO_ID", "");
    const modal = WelcomeModal({
      open: true,
      onClose: () => undefined,
      userId: "user-1",
    });
    const markup = renderToStaticMarkup(modal);

    expect(markup).not.toContain("<iframe");
    expect(markup).not.toContain("Ouvir explicação");
    expect(markup).toContain("Entendi, começar");
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
    const modal = WelcomeModal({ open: true, onClose, userId: "user-1" });
    const button = findButton(modal, "Entendi, começar");

    expect(button).not.toBeNull();
    button?.props.onClick?.();

    expect(values.get("minha-mare:welcome-seen:user-1")).toBe("true");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
