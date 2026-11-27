"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  Home as House,
  Ship,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import DataStatus from "@/components/DataStatus";
import { useStore } from "@/lib/store";
import { formatBRL, currentMonthLabel } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function ResultadosPage() {
  const { totals, selectedMonth, hydrated, ready } = useStore();
  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";
  const sobrouPositivo = totals.resultado >= 0;
  const hasActivity = totals.totalVendido > 0 || totals.totalGastos > 0;
  const message = !ready
    ? "—"
    : !hasActivity
      ? "Ainda não tem nada anotado. Quando registrar, vamos mostrar aqui quanto entrou, saiu e sobrou."
      : sobrouPositivo
        ? `Depois dos gastos, sobraram ${formatBRL(totals.resultado)} neste mês.`
        : "Os gastos passaram do que entrou. Você pode ver os lançamentos em Mais.";

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Header />
      <main className="flex-1 overflow-y-auto px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">Entrou, saiu e sobrou</h1>
        <p className="mt-1 text-lg text-mare-slate">{monthLabel}</p>
        <p className="mt-1 text-base text-mare-slate">
          Para escolher outro mês, abra Mais.
        </p>

        <section className="mt-5 space-y-3">
          <div className="flex min-h-20 items-center justify-between gap-3 rounded-xl2 bg-mare-tealLight p-4">
            <p className="flex items-center gap-2 text-lg font-semibold text-mare-tealDark">
              <ArrowUpRight className="h-6 w-6" aria-hidden="true" />
              Entrou
            </p>
            <p className="text-2xl font-bold text-mare-tealDark">
              {ready ? formatBRL(totals.totalVendido) : "—"}
            </p>
          </div>
          <div className="flex min-h-20 items-center justify-between gap-3 rounded-xl2 bg-mare-negativeLight p-4">
            <p className="flex items-center gap-2 text-lg font-semibold text-mare-negative">
              <ArrowDownRight className="h-6 w-6" aria-hidden="true" />
              Saiu
            </p>
            <p className="text-2xl font-bold text-mare-negative">
              {ready ? formatBRL(totals.totalGastos) : "—"}
            </p>
          </div>
          <div
            className={cn(
              "flex min-h-24 items-center justify-between gap-3 rounded-xl2 p-4",
              sobrouPositivo
                ? "bg-mare-purpleLight text-mare-institutional"
                : "bg-mare-negativeLight text-mare-negative"
            )}
          >
            <p className="flex items-center gap-2 text-lg font-semibold">
              {sobrouPositivo ? (
                <CircleCheck className="h-6 w-6" aria-hidden="true" />
              ) : (
                <CircleAlert className="h-6 w-6" aria-hidden="true" />
              )}
              Sobrou
            </p>
            <p className="text-2xl font-bold">
              {ready ? formatBRL(totals.resultado) : "—"}
            </p>
          </div>
        </section>

        <section className="mt-4 rounded-xl2 border border-black/10 p-4">
          <h2 className="text-lg font-semibold text-mare-institutional">
            Saiu com
          </h2>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-lg text-mare-slate">
              <Ship className="h-5 w-5 text-mare-tealDark" aria-hidden="true" />
              Trabalho
            </p>
            <p className="text-lg font-semibold text-mare-ink">
              {ready ? formatBRL(totals.totalGastosPesca) : "—"}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-lg text-mare-slate">
              <House className="h-5 w-5 text-mare-institutional" aria-hidden="true" />
              Casa
            </p>
            <p className="text-lg font-semibold text-mare-ink">
              {ready ? formatBRL(totals.totalGastosCasa) : "—"}
            </p>
          </div>
        </section>

        <div
          className={cn(
            "mt-5 rounded-xl2 p-5",
            !ready
              ? "bg-mare-surface text-mare-secondary"
              : sobrouPositivo
                ? "bg-mare-accent text-mare-institutional"
                : "bg-mare-negativeLight text-mare-negative"
          )}
        >
          <p role="status" className="text-lg font-medium leading-relaxed">
            {message}
          </p>
        </div>

        <Link
          href="/mais"
          className="mt-5 flex min-h-14 items-center justify-center rounded-full bg-mare-primary px-4 text-lg font-semibold text-white"
        >
          Ver lançamentos e relatórios
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}
