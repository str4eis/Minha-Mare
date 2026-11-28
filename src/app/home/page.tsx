"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  Eye,
  Home as House,
  Pencil,
  Ship,
  Trash2,
} from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import DataStatus from "@/components/ui/DataStatus";
import WelcomeModal from "@/components/ui/WelcomeModal";
import DetailsModal from "@/components/ui/DetailsModal";
import SpeakButton from "@/components/audio/SpeakButton";
import CategoryIcon from "@/components/forms/CategoryIcon";
import { useStore } from "@/lib/store";
import {
  currentMonthLabel,
  formatBRL,
  formatDateShort,
  formatSaleUnit,
} from "@/lib/domain/format";
import {
  getExpenseCategoryLabel,
  getSaleProductLabel,
} from "@/lib/domain/categories";
import { moneyInWords } from "@/lib/domain/money-words";
import type { Sale, Expense } from "@/lib/domain/types";
import { hasSeenWelcome } from "@/lib/storage/welcome";

export default function HomePage() {
  const {
    state,
    totals,
    selectedMonth,
    hydrated,
    ready,
    userId,
    deleteSale,
    deleteExpense,
  } = useStore();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<{
    kind: "venda";
    sale: Sale;
  } | {
    kind: "gasto";
    expense: Expense;
  } | null>(null);

  useEffect(() => {
    if (!ready) return;
    setWelcomeOpen(Boolean(userId && !hasSeenWelcome(userId)));
  }, [ready, userId]);

  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";
  const recentTransactions = [
    ...state.sales.map((sale) => ({
      id: `sale-${sale.id}`,
      date: sale.date,
      label: getSaleProductLabel(sale.category, sale.customProduct),
      detail: sale.buyer,
      value: sale.value,
      kind: "venda" as const,
      category: sale.category,
    })),
    ...state.expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      label: expense.description,
      detail: expense.kind === "pesca" ? "Gasto do trabalho" : "Gasto de casa",
      value: expense.value,
      kind: expense.kind,
      category: expense.category,
    })),
  ]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 5);
  const sobrouPositivo = totals.resultado >= 0;
  const saldoFalado = sobrouPositivo
    ? `sobrou ${moneyInWords(totals.resultado)}`
    : `os gastos passaram o que entrou por ${moneyInWords(
        Math.abs(totals.resultado)
      )}`;
  const summarySpeech = `Em ${monthLabel}, entrou ${moneyInWords(
    totals.totalVendido
  )}, saiu ${moneyInWords(totals.totalGastos)} e ${saldoFalado}.`;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <Header />
      <main className="flex-1 overflow-y-auto px-5 pb-4">
        <DataStatus />
        <h1 className="text-[26px] font-semibold leading-tight">
          {state.userName ? `Olá, ${state.userName}!` : "Olá!"}
        </h1>
        <p className="mt-1 text-lg text-mare-slate">
          Veja o que entrou, saiu e sobrou.
        </p>

        {ready && (
          <div className="mt-5">
            <SpeakButton text={summarySpeech} label="Ouvir resumo" />
          </div>
        )}

        <section className="mt-4 rounded-xl2 bg-mare-card p-5 shadow-card">
          <h2 className="text-lg font-semibold text-mare-institutional">
            Sobrou
          </h2>
          <p className="mt-1 text-base text-mare-slate">{monthLabel}</p>
          <p
            className={`mt-2 text-3xl font-bold ${
              sobrouPositivo ? "text-mare-institutional" : "text-mare-negative"
            }`}
          >
            {ready ? formatBRL(totals.resultado) : "—"}
          </p>
          <Link
            href="/mais#relatorios"
            className="mt-4 flex min-h-14 items-center justify-center rounded-full bg-mare-primary px-4 text-lg font-semibold text-white"
          >
            Ver lançamentos e relatórios
          </Link>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-2" aria-label="Históricos">
          <Link
            href="/vendas"
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl2 border border-mare-tealDark/30 bg-mare-tealLight px-2 text-center text-base font-semibold text-mare-tealDark"
          >
            <CircleDollarSign className="h-8 w-8" aria-hidden="true" />
            Vendas
          </Link>
          <Link
            href="/gastos?tab=pesca"
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl2 border border-mare-negative/30 bg-mare-negativeLight px-2 text-center text-base font-semibold text-mare-negative"
          >
            <Ship className="h-8 w-8" aria-hidden="true" />
            Gastos do trabalho
          </Link>
          <Link
            href="/gastos?tab=casa"
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl2 border border-mare-negative/30 bg-mare-negativeLight px-2 text-center text-base font-semibold text-mare-negative"
          >
            <House className="h-8 w-8" aria-hidden="true" />
            Gastos de casa
          </Link>
        </section>

        <section className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-mare-ink">
              Movimentações recentes
            </h2>
            <Link
              href="/mais#relatorios"
              className="text-lg font-medium text-mare-purple"
            >
              Ver histórico
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-black/5">
            {ready && recentTransactions.length === 0 && (
              <li className="py-4 text-lg text-mare-slate">
                Ainda não há movimentações neste mês.
              </li>
            )}
            {ready &&
              recentTransactions.map((transaction) => {
                const isSale = transaction.kind === "venda";
                const originalId = transaction.id.replace(
                  /^(sale|expense)-/,
                  "",
                );
                return (
                  <li
                    key={transaction.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <CategoryIcon
                      category={transaction.category}
                      kind={isSale ? "venda" : transaction.kind}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-medium text-mare-ink">
                        {transaction.label}
                      </p>
                      <p className="text-base text-mare-slate">
                        {transaction.detail} ·{" "}
                        {formatDateShort(transaction.date)}
                      </p>
                    </div>
                    <span
                      className={`whitespace-nowrap text-lg font-semibold ${
                        isSale ? "text-mare-tealDark" : "text-mare-negative"
                      }`}
                    >
                      {isSale ? "+" : "−"} {formatBRL(transaction.value)}
                    </span>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (isSale) {
                            const sale = state.sales.find(
                              (s) => s.id === originalId,
                            );
                            if (sale) setViewingEntry({ kind: "venda", sale });
                          } else {
                            const expense = state.expenses.find(
                              (e) => e.id === originalId,
                            );
                            if (expense) {
                              setViewingEntry({ kind: "gasto", expense });
                            }
                          }
                        }}
                        aria-label={
                          isSale
                            ? `Ver venda de ${transaction.label}`
                            : `Ver gasto: ${transaction.label}`
                        }
                        title="Ver"
                        className="flex h-12 w-12 items-center justify-center rounded-full text-mare-institutional hover:bg-mare-purpleLight"
                      >
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <Link
                        href={isSale
                          ? `/vendas/${encodeURIComponent(
                              originalId,
                            )}/editar`
                          : `/gastos/${encodeURIComponent(
                              originalId,
                            )}/editar`}
                        aria-label={
                          isSale
                            ? `Editar venda de ${transaction.label}`
                            : `Editar gasto: ${transaction.label}`
                        }
                        title="Editar"
                        className="flex h-12 w-12 items-center justify-center rounded-full text-mare-purple hover:bg-mare-purpleLight"
                      >
                        <Pencil className="h-5 w-5" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (isSale) {
                            void deleteSale(originalId);
                          } else {
                            void deleteExpense(originalId);
                          }
                        }}
                        aria-label={
                          isSale
                            ? `Excluir venda de ${transaction.label}`
                            : `Excluir gasto: ${transaction.label}`
                        }
                        title="Excluir"
                        className="flex h-12 w-12 items-center justify-center rounded-full text-mare-negative hover:bg-mare-negativeLight"
                      >
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      </main>
      {viewingEntry && (
        <DetailsModal
          title={
            viewingEntry.kind === "venda"
              ? "Detalhes da venda"
              : "Detalhes do gasto"
          }
          fields={
            viewingEntry.kind === "venda"
              ? [
                  { label: "Compradora", value: viewingEntry.sale.buyer },
                  {
                    label: "Produto",
                    value: getSaleProductLabel(
                      viewingEntry.sale.category,
                      viewingEntry.sale.customProduct,
                    ),
                  },
                  {
                    label: "Quantidade",
                    value: `${viewingEntry.sale.quantity} ${formatSaleUnit(
                      viewingEntry.sale.unit,
                      viewingEntry.sale.quantity,
                    )}`,
                  },
                  { label: "Data", value: formatDateShort(viewingEntry.sale.date) },
                  { label: "Valor", value: formatBRL(viewingEntry.sale.value) },
                ]
              : [
                  { label: "Descrição", value: viewingEntry.expense.description },
                  {
                    label: "Tipo",
                    value:
                      viewingEntry.expense.kind === "pesca"
                        ? "Gasto do trabalho"
                        : "Gasto de casa",
                  },
                  {
                    label: "Categoria",
                    value: getExpenseCategoryLabel(
                      viewingEntry.expense.kind,
                      viewingEntry.expense.category,
                      viewingEntry.expense.customDescription,
                    ),
                  },
                  { label: "Data", value: formatDateShort(viewingEntry.expense.date) },
                  { label: "Valor", value: formatBRL(viewingEntry.expense.value) },
                ]
          }
          onClose={() => setViewingEntry(null)}
        />
      )}
      <BottomNav />
      <WelcomeModal
        open={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        userId={userId}
      />
    </div>
  );
}
