"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import CategoryIcon from "@/components/CategoryIcon";
import DataStatus from "@/components/DataStatus";
import Header from "@/components/Header";
import MonthPicker from "@/components/MonthPicker";
import { useStore } from "@/lib/store";
import { currentMonthLabel, formatBRL, formatDateShort } from "@/lib/format";
import { saleCategoryMeta } from "@/lib/categories";
import { filterItems } from "@/lib/filters";

export default function VendasPage() {
  const { state, totals, selectedMonth, hydrated, ready, deleteSale } = useStore();
  const [query, setQuery] = useState("");
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const historyHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";

  const sortedSales = useMemo(
    () =>
      filterItems(state.sales, selectedMonth.year, selectedMonth.month, {
        query,
        getSearchText: (sale) => sale.buyer,
      }).sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    [state.sales, selectedMonth, query]
  );
  const hasSearch = query.trim().length > 0;
  const listedTotal =
    sortedSales.reduce((cents, sale) => cents + Math.round(sale.value * 100), 0) /
    100;

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header />
      <MonthPicker />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">Vendas</h1>
        <p className="text-mare-slate mt-1">Tudo o que você já vendeu na maré.</p>

        <div className="mt-4 rounded-xl2 bg-mare-purple text-white p-5 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Total vendido em {monthLabel}</p>
            <p className="text-2xl font-semibold mt-1">
              {ready ? formatBRL(totals.totalVendido) : "—"}
            </p>
          </div>
          <Link
            href="/vendas/nova"
            aria-label="Registrar nova venda"
            className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-5 rounded-xl2 bg-mare-card px-4 py-3">
          <label htmlFor="sale-search" className="sr-only">
            Buscar por comprador
          </label>
          <input
            id="sale-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar comprador"
            className="w-full bg-transparent text-sm placeholder:text-mare-slate focus:outline-none"
          />
        </div>
        {ready && hasSearch && (
          <p className="mt-3 text-sm text-mare-slate">
            Total listado: {formatBRL(listedTotal)}
          </p>
        )}

        <h2
          ref={historyHeadingRef}
          tabIndex={-1}
          className="mt-5 font-semibold text-mare-ink focus:outline-none"
        >
          Histórico de vendas
        </h2>
        <ul className="mt-2 divide-y divide-black/5">
          {ready && sortedSales.length === 0 && (
            <li className="py-6 text-center text-sm text-mare-slate">
              {hasSearch
                ? "Nenhum resultado para a busca."
                : `Nenhum lançamento em ${monthLabel}.`}
            </li>
          )}
          {ready &&
            sortedSales.map((sale) => {
              const categoryLabel =
                saleCategoryMeta[sale.category]?.label ?? sale.category;
              return (
                <li key={sale.id} className="py-3 flex items-center gap-3">
                  <CategoryIcon category={sale.category} kind="venda" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-mare-ink truncate">{sale.buyer}</p>
                    <p className="text-xs text-mare-slate">
                      {categoryLabel} · {sale.quantity} {sale.unit} ·{" "}
                      {formatDateShort(sale.date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-semibold text-mare-tealDark whitespace-nowrap">
                      + {formatBRL(sale.value)}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <Link
                        href={`/vendas/${encodeURIComponent(sale.id)}/editar`}
                        aria-label={`Editar venda de ${sale.buyer}`}
                        className="text-mare-purple hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={(event) => {
                          returnFocusRef.current = event.currentTarget;
                          setDeletingSaleId(sale.id);
                        }}
                        aria-label={`Excluir venda de ${sale.buyer}`}
                        className="text-mare-negative hover:underline"
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
        open={deletingSaleId !== null}
        title="Excluir venda?"
        description="Este lançamento será removido permanentemente."
        onCancel={() => setDeletingSaleId(null)}
        onConfirm={() => {
          if (deletingSaleId) void deleteSale(deletingSaleId).catch(() => undefined);
          setDeletingSaleId(null);
        }}
        returnFocusRef={returnFocusRef}
        fallbackFocusRef={historyHeadingRef}
      />

      <Link
        href="/vendas/nova"
        aria-label="Registrar nova venda"
        className="absolute z-10 bottom-24 right-5 h-14 w-14 rounded-full bg-mare-purple text-white shadow-soft flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </Link>

      <BottomNav />
    </div>
  );
}
