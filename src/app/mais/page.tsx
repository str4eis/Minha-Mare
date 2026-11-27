"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileDown,
  Search,
  Share2,
  Sheet,
  Target,
  UserRound,
} from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import DataStatus from "@/components/ui/DataStatus";
import Header from "@/components/layout/Header";
import InstallAppBanner from "@/components/ui/InstallAppBanner";
import MonthPicker from "@/components/layout/MonthPicker";
import { useStore } from "@/lib/store";
import { formatBRL, currentMonthLabel } from "@/lib/domain/format";
import { fishingExpenseMeta, homeExpenseMeta } from "@/lib/domain/categories";
import { ExpenseKind } from "@/lib/domain/types";
import { exportMonthlyExcel } from "@/lib/export/export-excel";
import { exportMonthlyPdf } from "@/lib/export/export-pdf";
import { createWhatsAppSummary } from "@/lib/export/whatsapp";

export default function MaisPage() {
  const router = useRouter();
  const { state, totals, selectedMonth, hydrated, ready } = useStore();
  const [saleSearch, setSaleSearch] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseKind, setExpenseKind] = useState<ExpenseKind>("pesca");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const [exportMessage, setExportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";
  const categoryOptions =
    expenseKind === "pesca" ? fishingExpenseMeta : homeExpenseMeta;
  const shareText = ready
    ? createWhatsAppSummary(
        selectedMonth.year,
        selectedMonth.month,
        totals,
        state.sales
      )
    : "";

  function searchSales(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (saleSearch.trim()) params.set("busca", saleSearch.trim());
    const search = params.toString();
    router.push(`/vendas${search ? `?${search}` : ""}`);
  }

  function searchExpenses(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ tab: expenseKind });
    if (expenseSearch.trim()) params.set("busca", expenseSearch.trim());
    if (expenseCategory) params.set("categoria", expenseCategory);
    router.push(`/gastos?${params.toString()}`);
  }

  async function handleExport(kind: "pdf" | "excel") {
    if (!ready || exporting) return;
    setExporting(kind);
    setExportMessage(null);
    try {
      if (kind === "pdf") {
        await exportMonthlyPdf(
          state.sales,
          state.expenses,
          totals,
          selectedMonth.year,
          selectedMonth.month
        );
      } else {
        await exportMonthlyExcel(
          state.sales,
          state.expenses,
          totals,
          selectedMonth.year,
          selectedMonth.month
        );
      }
      setExportMessage({ type: "success", text: "Arquivo pronto." });
    } catch {
      setExportMessage({
        type: "error",
        text: "Não foi possível gerar o arquivo. Tente novamente.",
      });
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Header />
      <main className="flex-1 overflow-y-auto px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">Mais opções</h1>
        <p className="mt-1 text-lg text-mare-slate">
          Histórico, relatórios e sua conta.
        </p>
        <InstallAppBanner />

        <section className="mt-5">
          <h2 className="text-xl font-semibold text-mare-institutional">
            Mudar o mês
          </h2>
          <MonthPicker />
        </section>

        <section className="mt-5">
          <h2 className="text-xl font-semibold text-mare-institutional">
            Procurar no histórico
          </h2>
          <form onSubmit={searchSales} className="mt-3 rounded-xl2 border border-black/10 p-4">
            <label htmlFor="search-sales" className="text-lg font-medium">
              Vendas: nome de quem comprou
            </label>
            <input
              id="search-sales"
              type="search"
              value={saleSearch}
              onChange={(event) => setSaleSearch(event.target.value)}
              className="mt-2 min-h-14 w-full rounded-xl2 border border-black/10 px-3 text-lg"
              placeholder="Ex.: feira"
            />
            <button
              type="submit"
              className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-mare-primary px-4 text-lg font-semibold text-white"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              Procurar vendas
            </button>
          </form>

          <form onSubmit={searchExpenses} className="mt-3 rounded-xl2 border border-black/10 p-4">
            <label htmlFor="expense-kind" className="text-lg font-medium">
              Gastos
            </label>
            <select
              id="expense-kind"
              value={expenseKind}
              onChange={(event) => {
                setExpenseKind(event.target.value as ExpenseKind);
                setExpenseCategory("");
              }}
              className="mt-2 min-h-14 w-full rounded-xl2 border border-black/10 bg-white px-3 text-lg"
            >
              <option value="pesca">Do trabalho</option>
              <option value="casa">Da casa</option>
            </select>
            <label htmlFor="expense-category" className="mt-3 block text-lg font-medium">
              Categoria
            </label>
            <select
              id="expense-category"
              value={expenseCategory}
              onChange={(event) => setExpenseCategory(event.target.value)}
              className="mt-2 min-h-14 w-full rounded-xl2 border border-black/10 bg-white px-3 text-lg"
            >
              <option value="">Todas</option>
              {Object.entries(categoryOptions).map(([id, meta]) => (
                <option key={id} value={id}>
                  {meta.label}
                </option>
              ))}
            </select>
            <label htmlFor="search-expenses" className="mt-3 block text-lg font-medium">
              Nome do gasto
            </label>
            <input
              id="search-expenses"
              type="search"
              value={expenseSearch}
              onChange={(event) => setExpenseSearch(event.target.value)}
              className="mt-2 min-h-14 w-full rounded-xl2 border border-black/10 px-3 text-lg"
              placeholder="Ex.: gelo"
            />
            <button
              type="submit"
              className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-mare-primary px-4 text-lg font-semibold text-white"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              Procurar gastos
            </button>
          </form>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-mare-institutional">
            Relatórios de {monthLabel}
          </h2>
          <p className="mt-1 text-lg text-mare-slate">
            Entrou {ready ? formatBRL(totals.totalVendido) : "—"} · Saiu{" "}
            {ready ? formatBRL(totals.totalGastos) : "—"}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleExport("pdf")}
              disabled={!ready || exporting !== null}
              className="flex min-h-14 items-center justify-center gap-2 rounded-full border border-mare-purple px-3 text-lg font-semibold text-mare-purple disabled:opacity-50"
            >
              <FileDown className="h-5 w-5" aria-hidden="true" />
              {exporting === "pdf" ? "Preparando..." : "Salvar em PDF"}
            </button>
            <button
              type="button"
              onClick={() => handleExport("excel")}
              disabled={!ready || exporting !== null}
              className="flex min-h-14 items-center justify-center gap-2 rounded-full border border-mare-purple px-3 text-lg font-semibold text-mare-purple disabled:opacity-50"
            >
              <Sheet className="h-5 w-5" aria-hidden="true" />
              {exporting === "excel" ? "Preparando..." : "Salvar em Excel"}
            </button>
          </div>
          {exportMessage && (
            <p
              className={`mt-3 rounded-xl2 px-4 py-3 text-lg ${
                exportMessage.type === "success"
                  ? "bg-mare-accent text-mare-institutional"
                  : "bg-mare-negativeLight text-mare-negative"
              }`}
              role={exportMessage.type === "success" ? "status" : "alert"}
            >
              {exportMessage.text}
            </p>
          )}
          <a
            href={
              ready
                ? `https://wa.me/?text=${encodeURIComponent(shareText)}`
                : undefined
            }
            aria-disabled={!ready}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={ready ? undefined : -1}
            className={`mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-mare-primary px-4 text-lg font-semibold text-white shadow-soft ${
              ready ? "" : "pointer-events-none opacity-50"
            }`}
          >
            <Share2 className="h-5 w-5" aria-hidden="true" />
            Compartilhar pelo WhatsApp
          </a>
        </section>

        <section className="mt-6 space-y-3">
          <h2 className="text-xl font-semibold text-mare-institutional">
            Sua conta
          </h2>
          <Link
            href="/perfil#retirement-goal-section"
            className="flex min-h-14 items-center gap-3 rounded-xl2 border border-black/10 px-4 text-lg font-medium text-mare-ink"
          >
            <Target className="h-5 w-5 text-mare-purple" aria-hidden="true" />
            Meta para o futuro
          </Link>
          <Link
            href="/perfil"
            className="flex min-h-14 items-center gap-3 rounded-xl2 border border-black/10 px-4 text-lg font-medium text-mare-ink"
          >
            <UserRound className="h-5 w-5 text-mare-purple" aria-hidden="true" />
            Perfil, sair ou excluir conta
          </Link>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
