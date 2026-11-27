"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataStatus from "@/components/DataStatus";
import Header from "@/components/Header";
import MonthPicker from "@/components/MonthPicker";
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
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const historyHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const { state, totals, selectedMonth, hydrated, ready, deleteExpense } = useStore();

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
      <MonthPicker />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">Gastos</h1>

        <div className="mt-4 flex rounded-full bg-mare-card p-1">
          <button
            type="button"
            onClick={() => changeTab("pesca")}
            aria-pressed={tab === "pesca"}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
              tab === "pesca"
                ? "bg-mare-purple text-white shadow-soft"
                : "text-mare-slate"
            )}
          >
            Gastos da Pesca
          </button>
          <button
            type="button"
            onClick={() => changeTab("casa")}
            aria-pressed={tab === "casa"}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
              tab === "casa"
                ? "bg-mare-purple text-white shadow-soft"
                : "text-mare-slate"
            )}
          >
            Gastos da Casa
          </button>
        </div>

        <div
          className={cn(
            "mt-4 rounded-xl2 p-5 shadow-card",
            tab === "pesca" ? "bg-mare-tealLight" : "bg-mare-yellowLight"
          )}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-mare-slate">
            Total {tab === "pesca" ? "com a pesca" : "com a casa"} em {monthLabel}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold",
              tab === "pesca" ? "text-mare-tealDark" : "text-mare-yellowDark"
            )}
          >
            {ready ? formatBRL(total) : "—"}
          </p>
        </div>

        <p className="mt-5 font-semibold text-mare-ink">
          Categorias {tab === "pesca" ? "de Pesca" : "da Casa"}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {categories.map(([category, categoryMeta]) => {
            const Icon = categoryMeta.icon;
            const spent = (byCategory.get(category) ?? 0) / 100;
            return (
              <Link
                key={category}
                href={`/gastos/novo?kind=${tab}&categoria=${category}`}
                className="rounded-xl2 border border-black/5 p-4 flex flex-col gap-3 shadow-card active:scale-[0.98] transition-transform"
              >
                <Icon className="h-5 w-5 text-mare-purple" />
                <div>
                  <p className="font-semibold text-mare-ink text-sm">
                    {categoryMeta.label}
                  </p>
                  <p className="text-xs text-mare-slate mt-0.5">
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

        <div className="mt-5 rounded-xl2 bg-mare-card px-4 py-3">
          <label htmlFor="expense-search" className="sr-only">
            Buscar por descrição
          </label>
          <input
            id="expense-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar descrição"
            className="w-full bg-transparent text-sm placeholder:text-mare-slate focus:outline-none"
          />
        </div>
        <div className="mt-3">
          <label
            htmlFor="expense-category"
            className="mb-1 block text-xs font-semibold text-mare-slate"
          >
            Filtrar por categoria
          </label>
          <select
            id="expense-category"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="w-full rounded-xl2 border border-black/10 bg-white px-3 py-2 text-sm text-mare-ink"
          >
            <option value="">Todas as categorias</option>
            {categories.map(([category, categoryMeta]) => (
              <option key={category} value={category}>
                {categoryMeta.label}
              </option>
            ))}
          </select>
        </div>
        {ready && hasActiveFilters && (
          <p className="mt-3 text-sm text-mare-slate">
            Total listado: {formatBRL(listedTotal)}
          </p>
        )}

        <h2
          ref={historyHeadingRef}
          tabIndex={-1}
          className="mt-5 font-semibold text-mare-ink focus:outline-none"
        >
          Lançamentos
        </h2>
        <ul className="mt-2 divide-y divide-black/5">
          {ready && sortedExpenses.length === 0 && (
            <li className="py-4 text-sm text-mare-slate">
              {hasActiveFilters
                ? "Nenhum resultado para a busca."
                : `Nenhum lançamento em ${monthLabel}.`}
            </li>
          )}
          {ready &&
            sortedExpenses.map((expense) => {
              const categoryMeta = meta[expense.category as keyof typeof meta];
              const Icon = categoryMeta?.icon;
              return (
                <li key={expense.id} className="py-3 flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-mare-card flex items-center justify-center shrink-0">
                    {Icon && <Icon className="h-5 w-5 text-mare-purple" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-mare-ink truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-mare-slate">
                      {formatDateShort(expense.date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-[#B23B5C] whitespace-nowrap">
                      - {formatBRL(expense.value)}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Link
                        href={`/gastos/${encodeURIComponent(expense.id)}/editar`}
                        aria-label={`Editar gasto: ${expense.description}`}
                        className="text-mare-purple hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={(event) => {
                          returnFocusRef.current = event.currentTarget;
                          setDeletingExpenseId(expense.id);
                        }}
                        aria-label={`Excluir gasto: ${expense.description}`}
                        className="text-[#B23B5C] hover:underline"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </main>

      <ConfirmDialog
        open={deletingExpenseId !== null}
        title="Excluir gasto?"
        description="Este lançamento será removido permanentemente."
        onCancel={() => setDeletingExpenseId(null)}
        onConfirm={() => {
          if (deletingExpenseId) {
            void deleteExpense(deletingExpenseId).catch(() => undefined);
          }
          setDeletingExpenseId(null);
        }}
        returnFocusRef={returnFocusRef}
        fallbackFocusRef={historyHeadingRef}
      />

      <Link
        href={`/gastos/novo?kind=${tab}`}
        aria-label="Registrar novo gasto"
        className="absolute z-10 bottom-24 right-5 h-14 w-14 rounded-full bg-mare-purple text-white shadow-soft flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </Link>

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
