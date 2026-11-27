"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import AuthPageShell from "@/components/AuthPageShell";
import { isValidEmail } from "@/lib/auth-validation";
import { createClient } from "@/lib/supabase/client";
import { SupabaseConfigurationError } from "@/lib/supabase/config";

const recoveryMessage = "Se o e-mail estiver cadastrado, você receberá um link";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await createClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
      });
      setMessage(recoveryMessage);
    } catch (requestError) {
      const message =
        requestError instanceof SupabaseConfigurationError
          ? requestError.message
          : recoveryMessage;
      setMessage(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Recuperar senha"
      description="Informe seu e-mail para receber as instruções de recuperação."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recovery-email" className="block text-sm font-medium">
            E-mail
          </label>
          <input
            id="recovery-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl2 border border-black/10 px-4 py-3"
          />
        </div>
        {error && <p role="alert" className="text-sm text-mare-negative">{error}</p>}
        {message && <p role="status" className="text-sm text-mare-tealDark">{message}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-mare-primary py-3.5 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Enviando..." : "Enviar instruções"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm">
        <Link href="/login" className="font-semibold text-mare-purple">
          Voltar para entrar
        </Link>
      </p>
    </AuthPageShell>
  );
}
