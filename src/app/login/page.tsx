"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthPageShell from "@/components/ui/AuthPageShell";
import { mapAuthError } from "@/lib/auth/auth-errors";
import { isValidEmail } from "@/lib/auth/auth-validation";
import { safeNextPath } from "@/lib/auth/auth-routes";
import {
  getSessionRedirectPath,
  mapOAuthError,
} from "@/lib/auth/oauth";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = safeNextPath(params.get("next"));
  const emailMode = params.get("modo") === "email";
  const oauthError =
    params.get("error") ??
    (params.get("erro") === "callback" ? "callback" : null);
  const emailLoginHref = nextPath
    ? `/login?modo=email&next=${encodeURIComponent(nextPath)}`
    : "/login?modo=email";
  const regularLoginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const redirecting = useRef(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;

    const redirectForSession = (session: { user: unknown } | null) => {
      if (!active || redirecting.current) return;
      const destination = getSessionRedirectPath(session, nextPath);
      if (!destination) return;

      redirecting.current = true;
      router.replace(destination);
    };

    try {
      const auth = createClient().auth;
      const { data } = auth.onAuthStateChange((_event, session) => {
        redirectForSession(session);
      });
      unsubscribe = () => data.subscription.unsubscribe();

      void auth
        .getSession()
        .then(({ data: sessionData, error: sessionCheckError }) => {
          if (!active) return;
          if (sessionCheckError) {
            setSessionError(
              "Não foi possível verificar seu acesso. Tente novamente."
            );
            return;
          }
          redirectForSession(sessionData.session);
        })
        .catch(() => {
          if (active) {
            setSessionError(
              "Não foi possível verificar seu acesso. Tente novamente."
            );
          }
        });
    } catch {
      setSessionError("Não foi possível verificar seu acesso. Tente novamente.");
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [nextPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const { error: signInError } = await createClient().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(mapAuthError(signInError));
        return;
      }
      router.replace(safeNextPath(params.get("next")) ?? "/home");
    } catch (requestError) {
      setError(mapAuthError(requestError as { name?: string; message?: string }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Entrar"
      description="Entre com o Google ou use seu e-mail e senha."
    >
      {oauthError && (
        <p role="alert" className="mb-4 text-base leading-relaxed text-mare-negative">
          {mapOAuthError(oauthError)}
        </p>
      )}
      {sessionError && (
        <p role="alert" className="mb-4 text-base leading-relaxed text-mare-negative">
          {sessionError}
        </p>
      )}
      <GoogleSignInButton nextPath={nextPath ?? "/home"} />

      {emailMode ? (
        <>
          <p className="mb-4 mt-6 border-t border-black/10 pt-5 text-center text-base text-mare-slate">
            Ou entre com e-mail e senha
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-lg font-medium">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 min-h-14 w-full rounded-xl2 border border-black/10 px-4 py-3 text-lg"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-lg font-medium">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 min-h-14 w-full rounded-xl2 border border-black/10 px-4 py-3 text-lg"
              />
            </div>
            {error && (
              <p role="alert" className="text-base text-mare-negative">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="min-h-14 w-full rounded-full bg-mare-primary py-3.5 text-lg font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <div className="mt-5 flex flex-col gap-3 text-center text-base">
            <Link
              href="/recuperar-senha"
              className="font-medium text-mare-purple"
            >
              Esqueci minha senha
            </Link>
            <p className="text-mare-slate">
              Ainda não tem conta?{" "}
              <Link href="/cadastro" className="font-semibold text-mare-purple">
                Criar conta
              </Link>
            </p>
            <Link href={regularLoginHref} className="text-mare-slate underline">
              Voltar
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-col gap-3 text-center">
          <Link
            href={emailLoginHref}
            className="flex min-h-14 items-center justify-center text-lg font-medium text-mare-primary underline underline-offset-4"
          >
            Entrar com e-mail e senha
          </Link>
          <p className="text-base text-mare-slate">
            Primeira vez aqui?{" "}
            <Link href="/cadastro" className="font-semibold text-mare-purple">
              Criar conta por e-mail
            </Link>
          </p>
        </div>
      )}
    </AuthPageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-6 text-mare-slate">Carregando...</p>}>
      <LoginForm />
    </Suspense>
  );
}
