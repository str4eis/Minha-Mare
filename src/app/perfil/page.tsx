"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import DataStatus from "@/components/ui/DataStatus";
import Header from "@/components/layout/Header";
import { useStore } from "@/lib/store";
import { validateProfileForm } from "@/lib/domain/profile-validation";
import { createClient } from "@/lib/supabase/client";

export default function PerfilPage() {
  const router = useRouter();
  const {
    state,
    ready,
    saveProfile,
    clearUserData,
    flushPendingDeletion,
  } = useStore();
  const [fullName, setFullName] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    if (!ready) return;
    setFullName(state.userName);
  }, [ready, state.userName]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const validationError = validateProfileForm({ fullName });
    if (validationError) {
      setSaveError(validationError);
      setSaveSuccess(false);
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await saveProfile({
        full_name: fullName.trim(),
      });
      setSaveSuccess(true);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar seu perfil. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await flushPendingDeletion();
      const { error } = await createClient().auth.signOut();
      if (error) throw error;
      clearUserData();
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("Não foi possível sair da conta. Tente novamente.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Header variant="close" closeHref="/home" />
      <main className="flex-1 overflow-y-auto px-5 pb-4">
        <h1 className="text-2xl font-semibold">Meu perfil</h1>
        <DataStatus />

        {ready && (
          <>
            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="rounded-xl2 bg-mare-card p-4">
                <label
                  htmlFor="profile-name"
                  className="block text-lg font-medium"
                >
                  Nome ou apelido
                </label>
                <input
                  id="profile-name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full bg-transparent text-lg focus:outline-none"
                />
              </div>

              {saveError && (
                <p role="alert" className="text-lg text-mare-negative">
                  {saveError}
                </p>
              )}
              {saveSuccess && (
                <p role="status" className="text-lg font-medium text-mare-positive">
                  Perfil salvo
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="min-h-14 w-full rounded-full bg-mare-primary py-3.5 text-lg font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar perfil"}
              </button>
            </form>

            <section className="mt-6 border-t border-black/5 pt-5">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="min-h-14 w-full rounded-full border border-mare-purple py-3 text-lg font-semibold text-mare-purple disabled:opacity-60"
              >
                {loggingOut ? "Saindo..." : "Sair"}
              </button>
              {logoutError && (
                <p role="alert" className="mt-2 text-lg text-mare-negative">
                  {logoutError}
                </p>
              )}
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
