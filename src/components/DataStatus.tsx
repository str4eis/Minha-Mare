"use client";

import { useStore } from "@/lib/store";

export default function DataStatus() {
  const { loading, error, retry } = useStore();
  if (!loading && !error) return null;

  return (
    <div
      className="mt-4 rounded-xl2 bg-mare-card p-4 text-lg text-mare-slate"
      role={error ? "alert" : "status"}
      aria-live="polite"
    >
      <p>{error ?? "Carregando seus dados..."}</p>
      {error && (
        <button
          type="button"
          onClick={retry}
          className="mt-3 min-h-14 rounded-full bg-mare-purple px-5 text-lg font-semibold text-white"
        >
          Tentar de novo
        </button>
      )}
    </div>
  );
}
