"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import CategoryIcon from "@/components/CategoryIcon";
import DataStatus from "@/components/DataStatus";
import Header from "@/components/Header";
import { useStore } from "@/lib/store";
import { currentMonthLabel, formatBRL, formatDateShort } from "@/lib/format";
import { fishingExpenseMeta, homeExpenseMeta } from "@/lib/categories";
import { Expense, ExpenseKind } from "@/lib/types";
import { cn } from "@/lib/cn";
import { filterItems } from "@/lib/filters";

function GastosContent() {
  const params = useSearchParams();
  const requestedTab = params.get("tab");
  const [tab, setTab] = useState<ExpenseKind>(
    requestedTab === "casa" ? "casa" : "pesca"
  );
  const [query, setQuery] = useState(params.get("busca") ?? "");
  const [categoryFilter, setCategoryFilter] = useState(
    params.get("categoria") ?? ""
  );
  const { state, totals, selectedMonth, hydrated, ready, deleteExpense } = useStore();

  useEffect(() => {
    setTab(params.get("tab") === "casa" ? "casa" : "pesca");
    setQuery(params.get("busca") ?? "");
    setCategoryFilter(params.get("categoria") ?? "");
  }, [params]);

  const meta = tab === "pesca" ? fishingExpenseMeta : homeExpenseMeta;
  const total = tab === "pesca" ? totals.totalGastosPesca : totals.totalGastosCasa;
  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    filterItems(
      state.expenses.filter((expense) => expense.kind === tab),
      selectedMonth.year,
      selectedMonth.month,
      { getSearchText: (expense) => expense.description }
    ).forEach((expense) =>
      map.set(
        expense.category,
        (map.get(expense.category) ?? 0) + Math.round(expense.value * 100)
      )
    );
    return map;
  }, [state.expenses, selectedMonth, tab]);

  const sortedExpenses = useMemo(
    () =>
      filterItems(
        state.expenses.filter((expense) => expense.kind === tab),
        selectedMonth.year,
        selectedMonth.month,
        {
          query,
          category: categoryFilter || undefined,
          getSearchText: (expense) => expense.description,
        }
      ).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    [state.expenses, selectedMonth, tab, query, categoryFilter]
  );
  const hasActiveFilters = query.trim().length > 0 || categoryFilter !== "";
  const listedTotal =
    sortedExpenses.reduce(
      (cents, expense) => cents + Math.round(expense.value * 100),
      0
    ) / 100;
  const categories = Object.entries(meta) as Array<
    [keyof typeof meta, (typeof meta)[keyof typeof meta]]
  >;

  const changeTab = (nextTab: ExpenseKind) => {
    setTab(nextTab);
    setCategoryFilter("");
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">Histórico de gastos</h1>
        <p className="mt-1 text-lg text-mare-slate">
          Veja o que saiu do trabalho ou de casa.
        </p>

        <div className="mt-4 flex gap-2 rounded-xl2 bg-mare-card p-1">
          <button
            type="button"
            onClick={() => changeTab("pesca")}
            aria-pressed={tab === "pesca"}
            className={cn(
              "min-h-14 flex-1 rounded-full px-2 text-lg font-semibold transition-colors",
              tab === "pesca"
                ? "bg-mare-purple text-white shadow-soft"
                : "text-mare-slate"
            )}
          >
            Trabalho
          </button>
          <button
            type="button"
            onClick={() => changeTab("casa")}
            aria-pressed={tab === "casa"}
            className={cn(
              "min-h-14 flex-1 rounded-full px-2 text-lg font-semibold transition-colors",
              tab === "casa"
                ? "bg-mare-purple text-white shadow-soft"
                : "text-mare-slate"
            )}
          >
            Casa
          </button>
        </div>

        <div
          className={cn(
            "mt-4 rounded-xl2 p-5 shadow-card",
            tab === "pesca" ? "bg-mare-fishingLight" : "bg-mare-homeLight"
          )}
        >
          <p className="text-lg font-semibold text-mare-slate">
            Saiu {tab === "pesca" ? "com o trabalho" : "em casa"} em {monthLabel}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold",
              tab === "pesca" ? "text-mare-positive" : "text-mare-institutional"
            )}
          >
            {ready ? formatBRL(total) : "—"}
          </p>
        </div>

        <p className="mt-5 text-lg font-semibold text-mare-ink">
          Gastos {tab === "pesca" ? "do trabalho" : "da casa"}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {categories.map(([category, categoryMeta]) => {
            const spent = (byCategory.get(category) ?? 0) / 100;
            return (
              <Link
                key={category}
                href={`/gastos/novo?kind=${tab}&categoria=${category}`}
                className="rounded-xl2 border border-black/5 p-4 flex flex-col gap-3 shadow-card active:scale-[0.98] transition-transform"
              >
                <CategoryIcon category={category} kind={tab} size="sm" />
                <div>
                  <p className="font-semibold text-mare-ink text-lg">
                    {categoryMeta.label}
                  </p>
                  <p className="mt-0.5 text-base text-mare-slate">
                    {!ready
                      ? "—"
                      : spent > 0
                        ? formatBRL(spent)
                        : "Adicionar"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href={`/gastos/novo?kind=${tab}`}
          className="mt-4 flex min-h-14 items-center justify-center rounded-full bg-mare-primary px-4 text-lg font-semibold text-white shadow-soft"
        >
          Anotar gasto
        </Link>

        {ready && hasActiveFilters && (
          <p className="mt-3 text-lg text-mare-slate">
            Busca aplicada. Total: {formatBRL(listedTotal)}.{" "}
            <Link href="/mais" className="font-semibold text-mare-purple">
              Mudar busca
            </Link>
          </p>
        )}

        <h2 className="mt-5 text-xl font-semibold text-mare-ink">
          Lançamentos de {monthLabel}
        </h2>
        <ul className="mt-2 divide-y divide-black/5">
          {ready && sortedExpenses.length === 0 && (
            <li className="py-4 text-lg text-mare-slate">
              {hasActiveFilters ? (
                "Nenhum resultado para a busca."
              ) : (
                <Link
                  href={`/gastos/novo?kind=${tab}`}
                  className="font-semibold text-mare-purple underline"
                >
                  Toque aqui para anotar o primeiro gasto.
                </Link>
              )}
            </li>
          )}
          {ready &&
            sortedExpenses.map((expense) => {
              const categoryMeta = meta[expense.category as keyof typeof meta];
              return (
                <li key={expense.id} className="py-3 flex items-center gap-3">
                  <CategoryIcon category={expense.category} kind={tab} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-lg font-medium text-mare-ink">
                      {expense.description}
                    </p>
                    <p className="text-base text-mare-slate">
                      {categoryMeta?.label ?? expense.category} ·{" "}
                      {formatDateShort(expense.date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="whitespace-nowrap text-lg font-semibold text-mare-negative">
                      - {formatBRL(expense.value)}
                    </span>
                    <div className="flex flex-col items-end gap-1 font-medium">
                      <Link
                        href={`/gastos/${encodeURIComponent(expense.id)}/editar`}
                        aria-label={`Editar gasto: ${expense.description}`}
                        className="flex min-h-14 items-center px-2 text-lg text-mare-purple hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => void deleteExpense(expense.id)}
                        aria-label={`Excluir gasto: ${expense.description}`}
                        className="min-h-14 px-2 text-lg font-semibold text-mare-negative hover:underline"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </main>

      <BottomNav />
    </div>
  );
}

export default function GastosPage() {
  return (
    <Suspense fallback={null}>
      <GastosContent />
    </Suspense>
  );
}
