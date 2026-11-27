"use client";

import { useEffect, useState } from "react";
import { safeNextPath } from "@/lib/auth/auth-routes";
import { isEmbeddedBrowser, mapOAuthError } from "@/lib/auth/oauth";
import { createClient } from "@/lib/supabase/client";

interface GoogleSignInButtonProps {
  nextPath?: string;
}

export default function GoogleSignInButton({
  nextPath = "/home",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [embeddedBrowser, setEmbeddedBrowser] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    setEmbeddedBrowser(isEmbeddedBrowser(navigator.userAgent));
  }, []);

  async function handleSignIn() {
    if (loading) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", safeNextPath(nextPath) ?? "/home");

      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { prompt: "select_account" },
        },
      });

      if (error) {
        setErrorMessage(mapOAuthError(error));
        setLoading(false);
      }
    } catch (error) {
      setErrorMessage(mapOAuthError(error));
      setLoading(false);
    }
  }

  async function handleCopyAddress() {
    setCopyStatus("");
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API indisponível");
      }
      await navigator.clipboard.writeText(window.location.href);
      setCopyStatus("Endereço copiado!");
    } catch {
      setCopyStatus(
        "Não foi possível copiar. Selecione e copie o endereço da página."
      );
    }
  }

  return (
    <div className="w-full">
      {embeddedBrowser && (
        <div className="mb-4 rounded-xl2 border border-mare-purple/20 bg-mare-purpleLight p-4 text-left">
          <p className="text-base leading-relaxed text-mare-institutional">
            Para entrar com o Google, abra este endereço no Chrome.
          </p>
          <button
            type="button"
            onClick={handleCopyAddress}
            className="mt-3 min-h-11 rounded-full border border-mare-primary px-4 text-base font-semibold text-mare-primary"
          >
            Copiar endereço
          </button>
          {copyStatus && (
            <p
              className="mt-2 text-base text-mare-institutional"
              role={copyStatus.startsWith("Endereço") ? "status" : "alert"}
            >
              {copyStatus}
            </p>
          )}
        </div>
      )}

      {errorMessage && (
        <p className="mb-4 text-base leading-relaxed text-mare-negative" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="flex min-h-14 w-full items-center justify-center gap-3 rounded-xl2 border border-black/10 bg-white px-4 py-3 text-lg font-semibold text-mare-institutional shadow-card transition-colors hover:bg-mare-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mare-primary disabled:cursor-wait disabled:opacity-60"
      >
        <GoogleMark />
        <span>{loading ? "Abrindo o Google..." : "Entrar com o Google"}</span>
      </button>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6 shrink-0"
      viewBox="0 0 48 48"
      role="img"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 38.05 46.98 31.87 46.98 24.55z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.55 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
