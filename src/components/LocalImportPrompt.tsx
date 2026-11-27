"use client";

import { useEffect, useState } from "react";
import {
  insertImportedExpenses,
  insertImportedSales,
} from "@/lib/data/local-import";
import { LocalImportData, parseLocalImport } from "@/lib/local-import";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_KEY } from "@/lib/storage";

interface ImportPromptState {
  raw: string;
  data: LocalImportData;
}

interface ImportProgress {
  fingerprint: string;
  salesIds: string[];
  expenseIds: string[];
}

function isImportProgress(value: unknown): value is ImportProgress {
  if (typeof value !== "object" || value === null) return false;
  const progress = value as Record<string, unknown>;
  return (
    typeof progress.fingerprint === "string" &&
    Array.isArray(progress.salesIds) &&
    progress.salesIds.every((id) => typeof id === "string") &&
    Array.isArray(progress.expenseIds) &&
    progress.expenseIds.every((id) => typeof id === "string")
  );
}

async function fingerprint(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function createIds(count: number): string[] {
  return Array.from({ length: count }, () => window.crypto.randomUUID());
}

function progressKey(userId: string): string {
  return `minha-mare:import:v1:${userId}`;
}

function makeImportProgress(
  key: string,
  fingerprintValue: string,
  data: LocalImportData
): ImportProgress {
  let existing: unknown;
  try {
    const rawProgress = window.localStorage.getItem(key);
    existing = rawProgress ? JSON.parse(rawProgress) : null;
  } catch {
    existing = null;
  }

  if (
    isImportProgress(existing) &&
    existing.fingerprint === fingerprintValue &&
    existing.salesIds.length === data.sales.length &&
    existing.expenseIds.length === data.expenses.length
  ) {
    return existing;
  }

  const progress: ImportProgress = {
    fingerprint: fingerprintValue,
    salesIds: createIds(data.sales.length),
    expenseIds: createIds(data.expenses.length),
  };
  window.localStorage.setItem(key, JSON.stringify(progress));
  return progress;
}

export default function LocalImportPrompt() {
  const { userId, ready, refreshData } = useStore();
  const [prompt, setPrompt] = useState<ImportPromptState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    setPrompt(null);
    setError("");
    if (!userId || !ready) return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = parseLocalImport(raw);
      if (!data || data.candidateCount === 0) return;
      setPrompt({ raw, data });
    } catch {
      setError("Não foi possível ler os dados locais neste navegador.");
    }
  }, [ready, userId]);

  async function importData() {
    if (!userId || !prompt || busy) return;
    setBusy(true);
    setError("");
    setResult("");

    const key = progressKey(userId);
    try {
      const sourceFingerprint = await fingerprint(prompt.raw);
      const progress = makeImportProgress(key, sourceFingerprint, prompt.data);
      const client = createClient();

      await insertImportedSales(
        client,
        prompt.data.sales,
        progress.salesIds
      );
      await insertImportedExpenses(
        client,
        prompt.data.expenses,
        progress.expenseIds
      );

      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(key);
      setPrompt(null);
      setResult(
        `Importação concluída: ${prompt.data.sales.length} vendas e ${prompt.data.expenses.length} gastos. ${prompt.data.ignoredCount} itens inválidos foram ignorados.`
      );
      refreshData();
    } catch {
      setError(
        "Não foi possível concluir a importação. Seus dados locais foram mantidos; tente novamente."
      );
    } finally {
      setBusy(false);
    }
  }

  function discardData() {
    if (!userId || busy) return;
    if (!window.confirm("Isso apaga os dados deste navegador. Continuar?")) {
      return;
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(progressKey(userId));
      setPrompt(null);
      setError("");
    } catch {
      setError("Não foi possível descartar os dados locais.");
    }
  }

  if (result) {
    return (
      <aside className="sticky top-0 z-30 border-b border-mare-institutional/20 bg-mare-accent px-4 py-3 text-sm text-mare-institutional">
        <div className="flex items-start justify-between gap-3">
          <p role="status">{result}</p>
          <button
            type="button"
            aria-label="Fechar mensagem de importação"
            onClick={() => setResult("")}
            className="font-semibold text-mare-institutional underline"
          >
            Fechar
          </button>
        </div>
      </aside>
    );
  }

  if (!prompt && !error) return null;

  return (
    <aside className="sticky top-0 z-30 border-b border-mare-purple/10 bg-mare-purpleLight px-4 py-4">
      {prompt && (
        <>
          <p className="font-semibold text-mare-ink">
            Encontramos dados salvos neste navegador
          </p>
          <p className="mt-1 text-sm text-mare-slate">
            {prompt.data.sales.length} vendas e {prompt.data.expenses.length} gastos
            válidos para importar
            {prompt.data.ignoredCount > 0 &&
              `; ${prompt.data.ignoredCount} itens inválidos serão ignorados`}
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={importData}
              disabled={busy}
              className="rounded-full bg-mare-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Importando..." : "Importar para minha conta"}
            </button>
            <button
              type="button"
              onClick={discardData}
              disabled={busy}
              className="rounded-full border border-mare-purple px-4 py-2 text-sm font-semibold text-mare-purple disabled:opacity-60"
            >
              Descartar
            </button>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-mare-negative">
          {error}
        </p>
      )}
    </aside>
  );
}
