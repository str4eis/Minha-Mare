"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthPageShell from "@/components/AuthPageShell";
import { mapAuthError } from "@/lib/auth-errors";
import { isValidEmail } from "@/lib/auth-validation";
import { safeNextPath } from "@/lib/auth-routes";
import { mapOAuthError } from "@/lib/oauth";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";

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
      <GoogleSignInButton nextPath={nextPath ?? "/home"} />

      {emailMode ? (
        <>
          <p className="mb-4 mt-6 border-t border-black/10 pt-5 text-center text-base text-mare-slate">
            Ou entre com e-mail e senha
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-xl2 border border-black/10 px-4 py-3"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl2 border border-black/10 px-4 py-3"
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
              className="w-full rounded-full bg-mare-primary py-3.5 text-lg font-semibold text-white disabled:opacity-60"
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
            className="flex min-h-12 items-center justify-center text-lg font-medium text-mare-primary underline underline-offset-4"
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
