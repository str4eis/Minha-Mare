"use client";

import { useEffect, useState } from "react";
import { PlusSquare, Share2, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface InstallSnapshot {
  promptAvailable: boolean;
  installed: boolean;
  dismissed: boolean;
}

const dismissedKey = "minha-mare-install-banner-dismissed";
const subscribers = new Set<() => void>();
let installPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
let dismissedForSession = false;
let listenersAttached = false;

function isIOSDevice(): boolean {
  const userAgent = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  return (
    Boolean(standaloneNavigator.standalone) ||
    (typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches)
  );
}

function wasDismissed(): boolean {
  if (dismissedForSession) return true;

  try {
    return window.sessionStorage.getItem(dismissedKey) === "true";
  } catch {
    return false;
  }
}

function getSnapshot(): InstallSnapshot {
  return {
    promptAvailable: installPrompt !== null,
    installed: installed || isStandalone(),
    dismissed: wasDismissed(),
  };
}

function notifySubscribers(): void {
  subscribers.forEach((subscriber) => subscriber());
}

function attachInstallListeners(): void {
  if (listenersAttached) return;
  listenersAttached = true;
  installed = isStandalone();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event as BeforeInstallPromptEvent;
    notifySubscribers();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installed = true;
    notifySubscribers();
  });
}

function subscribe(subscriber: () => void): () => void {
  attachInstallListeners();
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
}

function dismissBanner(): void {
  dismissedForSession = true;
  try {
    window.sessionStorage.setItem(dismissedKey, "true");
  } catch {
    // The banner remains dismissed for this page session.
  }
  notifySubscribers();
}

interface InstallAppBannerProps {
  compact?: boolean;
}

export default function InstallAppBanner({
  compact = false,
}: InstallAppBannerProps) {
  const [snapshot, setSnapshot] = useState<InstallSnapshot>({
    promptAvailable: false,
    installed: false,
    dismissed: false,
  });
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const updateSnapshot = () => setSnapshot(getSnapshot());
    const unsubscribe = subscribe(updateSnapshot);
    setIsIOS(isIOSDevice());
    updateSnapshot();
    return unsubscribe;
  }, []);

  async function requestInstall() {
    const prompt = installPrompt;
    if (!prompt) return;

    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch (error) {
      console.error("Não foi possível abrir a instalação do aplicativo.", error);
    } finally {
      if (installPrompt === prompt) installPrompt = null;
      notifySubscribers();
    }
  }

  if (
    snapshot.installed ||
    snapshot.dismissed ||
    (!snapshot.promptAvailable && !isIOS)
  ) {
    return null;
  }

  return (
    <section
      aria-label="Colocar Minha Maré na tela inicial"
      className={`mt-4 rounded-xl2 border border-mare-purple/20 ${
        compact ? "bg-mare-purpleLight p-3" : "bg-mare-card p-4"
      }`}
    >
      <div className="flex items-start gap-3">
        {!compact && (
          <Smartphone
            className="mt-1 h-6 w-6 shrink-0 text-mare-institutional"
            aria-hidden="true"
          />
        )}
        <h2 className="flex-1 text-lg font-semibold text-mare-institutional">
          Coloque o Minha Maré na tela inicial
        </h2>
        <button
          type="button"
          onClick={dismissBanner}
          aria-label="Fechar aviso de instalação"
          className="flex min-h-14 min-w-14 shrink-0 items-center justify-center rounded-full text-mare-institutional"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {snapshot.promptAvailable ? (
        <button
          type="button"
          onClick={requestInstall}
          className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-mare-institutional px-4 text-lg font-semibold text-white"
        >
          <PlusSquare className="h-5 w-5" aria-hidden="true" />
          Colocar na tela inicial
        </button>
      ) : (
        <ol className="mt-2 space-y-2 text-lg text-mare-ink">
          <li className="flex items-center gap-2">
            <Share2 className="h-5 w-5 shrink-0 text-mare-institutional" aria-hidden="true" />
            <span>1. Toque em Compartilhar</span>
          </li>
          <li className="flex items-center gap-2">
            <PlusSquare className="h-5 w-5 shrink-0 text-mare-institutional" aria-hidden="true" />
            <span>2. Toque em Adicionar à Tela de Início</span>
          </li>
        </ol>
      )}
    </section>
  );
}
