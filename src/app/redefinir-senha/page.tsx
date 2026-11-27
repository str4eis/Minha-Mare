"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AuthPageShell from "@/components/AuthPageShell";
import { mapAuthError } from "@/lib/auth-errors";
import { isValidPassword, passwordsMatch } from "@/lib/auth-validation";
import { createClient } from "@/lib/supabase/client";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (!isValidPassword(password)) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (!passwordsMatch(password, confirmation)) {
      setError("As senhas não conferem.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) {
        setError(mapAuthError(updateError));
        return;
      }
      router.replace("/home");
    } catch (requestError) {
      setError(mapAuthError(requestError as { name?: string; message?: string }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageShell
      title="Criar nova senha"
      description="Escolha uma senha com pelo menos 8 caracteres."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium">
            Nova senha
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl2 border border-black/10 px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="new-password-confirm" className="block text-sm font-medium">
            Confirmar nova senha
          </label>
          <input
            id="new-password-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="mt-1 w-full rounded-xl2 border border-black/10 px-4 py-3"
          />
        </div>
        {error && <p role="alert" className="text-sm text-[#B23B5C]">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-mare-tealDark py-3.5 font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
    </AuthPageShell>
  );
}
