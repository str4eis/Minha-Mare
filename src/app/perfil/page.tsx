"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import DataStatus from "@/components/DataStatus";
import Header from "@/components/Header";
import { useStore } from "@/lib/store";
import { parseMoneyInput } from "@/lib/format";
import { validateProfileForm } from "@/lib/profile-validation";
import { createClient } from "@/lib/supabase/client";

function formatAmount(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export default function PerfilPage() {
  const router = useRouter();
  const {
    state,
    userEmail,
    ready,
    saveProfile,
    clearUserData,
  } = useStore();
  const [fullName, setFullName] = useState("");
  const [retirementGoal, setRetirementGoal] = useState("");
  const [retirementSaved, setRetirementSaved] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!ready) return;
    setFullName(state.userName);
    setRetirementGoal(formatAmount(state.metaAposentadoria));
    setRetirementSaved(formatAmount(state.poupancaAposentadoria));
  }, [
    ready,
    state.metaAposentadoria,
    state.poupancaAposentadoria,
    state.userName,
  ]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const formValues = { fullName, retirementGoal, retirementSaved };
    const validationError = validateProfileForm(formValues);
    if (validationError) {
      setSaveError(validationError);
      setSaveSuccess(false);
      return;
    }

    const goal = parseMoneyInput(retirementGoal, true);
    const saved = parseMoneyInput(retirementSaved, true);
    if (goal === null || saved === null) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      await saveProfile({
        full_name: fullName.trim(),
        retirement_goal: goal,
        retirement_saved: saved,
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

  async function handleDeleteAccount() {
    if (deleteConfirmation !== "EXCLUIR" || deletingAccount) return;
    setDeletingAccount(true);
    setDeleteError("");
    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      if (!response.ok) {
        setDeleteError("Não foi possível excluir a conta. Tente novamente.");
        setDeletingAccount(false);
        return;
      }

      try {
        await createClient().auth.signOut({ scope: "local" });
      } finally {
        clearUserData();
        router.replace("/");
        router.refresh();
      }
    } catch {
      setDeleteError("Não foi possível excluir a conta. Tente novamente.");
    } finally {
      setDeletingAccount(false);
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
                <label htmlFor="profile-name" className="block text-sm font-medium">
                  Nome
                </label>
                <input
                  id="profile-name"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full bg-transparent text-lg focus:outline-none"
                />
              </div>

              <div className="rounded-xl2 bg-mare-card p-4">
                <label htmlFor="profile-email" className="block text-sm font-medium">
                  E-mail
                </label>
                <input
                  id="profile-email"
                  type="email"
                  autoComplete="email"
                  value={userEmail}
                  readOnly
                  className="mt-2 w-full bg-transparent text-mare-slate focus:outline-none"
                />
              </div>

              <div className="rounded-xl2 bg-mare-card p-4">
                <label htmlFor="retirement-goal" className="block text-sm font-medium">
                  Meta da aposentadoria
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-mare-slate">R$</span>
                  <input
                    id="retirement-goal"
                    inputMode="decimal"
                    value={retirementGoal}
                    onChange={(event) => setRetirementGoal(event.target.value)}
                    className="w-full bg-transparent text-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl2 bg-mare-card p-4">
                <label htmlFor="retirement-saved" className="block text-sm font-medium">
                  Valor guardado
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-mare-slate">R$</span>
                  <input
                    id="retirement-saved"
                    inputMode="decimal"
                    value={retirementSaved}
                    onChange={(event) => setRetirementSaved(event.target.value)}
                    className="w-full bg-transparent text-lg focus:outline-none"
                  />
                </div>
              </div>

              {saveError && (
                <p role="alert" className="text-sm text-[#B23B5C]">
                  {saveError}
                </p>
              )}
              {saveSuccess && (
                <p role="status" className="text-sm font-medium text-mare-tealDark">
                  Perfil salvo
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-mare-tealDark py-3.5 font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar perfil"}
              </button>
            </form>

            <section className="mt-6 border-t border-black/5 pt-5">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full rounded-full border border-mare-purple py-3 font-semibold text-mare-purple disabled:opacity-60"
              >
                {loggingOut ? "Saindo..." : "Sair"}
              </button>
              {logoutError && (
                <p role="alert" className="mt-2 text-sm text-[#B23B5C]">
                  {logoutError}
                </p>
              )}
            </section>

            <section className="mt-6 rounded-xl2 border border-[#B23B5C]/30 p-4">
              <h2 className="font-semibold text-[#B23B5C]">Excluir minha conta</h2>
              <p className="mt-2 text-sm text-mare-slate">
                Esta ação é irreversível. Sua conta, perfil, vendas e gastos serão
                excluídos permanentemente.
              </p>
              <label
                htmlFor="delete-account-confirmation"
                className="mt-4 block text-sm font-medium"
              >
                Digite EXCLUIR para confirmar
              </label>
              <input
                id="delete-account-confirmation"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                autoComplete="off"
                className="mt-2 w-full rounded-xl2 border border-black/10 px-3 py-2"
              />
              {deleteError && (
                <p role="alert" className="mt-2 text-sm text-[#B23B5C]">
                  {deleteError}
                </p>
              )}
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "EXCLUIR" || deletingAccount}
                className="mt-4 w-full rounded-full bg-[#B23B5C] py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingAccount ? "Excluindo conta..." : "Excluir minha conta"}
              </button>
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
