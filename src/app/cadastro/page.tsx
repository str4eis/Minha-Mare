"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthPageShell from "@/components/ui/AuthPageShell";
import { mapAuthError } from "@/lib/auth/auth-errors";
import {
  isValidEmail,
  isValidFullName,
  isValidPassword,
  passwordsMatch,
} from "@/lib/auth/auth-validation";
import { createClient } from "@/lib/supabase/client";

export default function CadastroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!isValidFullName(fullName)) {
      setError("Informe seu nome.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }
    if (!isValidPassword(password)) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (!passwordsMatch(password, confirmation)) {
      setError("As senhas não conferem.");
      return;
    }

    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const { data, error: signUpError } = await createClient().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/home`,
        },
      });
      if (signUpError) {
        setError(mapAuthError(signUpError));
      } else if (data.session) {
        router.replace("/home");
      } else {
        setMessage("Verifique seu e-mail para confirmar o cadastro.");
      }
    } catch (requestError) {
      setError(mapAuthError(requestError as { name?: string; message?: string }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Criar sua conta"
      description="Cadastre-se para guardar seus lançamentos com segurança."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className="block text-lg font-medium">
            Nome
          </label>
          <input
            id="signup-name"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-1 min-h-14 w-full rounded-xl2 border border-black/10 px-4 py-3 text-lg"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="block text-lg font-medium">
            E-mail
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 min-h-14 w-full rounded-xl2 border border-black/10 px-4 py-3 text-lg"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="block text-lg font-medium">
            Senha
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 min-h-14 w-full rounded-xl2 border border-black/10 px-4 py-3 text-lg"
          />
        </div>
        <div>
          <label htmlFor="signup-confirm" className="block text-lg font-medium">
            Confirmar senha
          </label>
          <input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="mt-1 min-h-14 w-full rounded-xl2 border border-black/10 px-4 py-3 text-lg"
          />
        </div>
        {error && <p role="alert" className="text-base text-mare-negative">{error}</p>}
        {message && <p role="status" className="text-base text-mare-tealDark">{message}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="min-h-14 w-full rounded-full bg-mare-primary py-3.5 text-lg font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Criando conta..." : "Criar conta"}
        </button>
      </form>
      <p className="mt-5 text-center text-base text-mare-slate">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-mare-purple">
          Entrar
        </Link>
      </p>
    </AuthPageShell>
  );
}
