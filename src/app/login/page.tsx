"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthPageShell from "@/components/AuthPageShell";
import { mapAuthError } from "@/lib/auth-errors";
import { isValidEmail } from "@/lib/auth-validation";
import { safeNextPath } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
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
      description="Acesse sua conta para acompanhar sua maré."
    >
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
        {(error || params.get("erro") === "callback") && (
          <p role="alert" className="text-sm text-[#B23B5C]">
            {error || "Não foi possível confirmar o acesso. Solicite um novo link e tente novamente."}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-mare-tealDark py-3.5 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <div className="mt-5 flex flex-col gap-3 text-center text-sm">
        <Link href="/recuperar-senha" className="font-medium text-mare-purple">
          Esqueci minha senha
        </Link>
        <p className="text-mare-slate">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-mare-purple">
            Cadastre-se
          </Link>
        </p>
      </div>
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
