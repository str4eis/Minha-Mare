"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import CategoryIcon from "@/components/forms/CategoryIcon";
import DataStatus from "@/components/ui/DataStatus";
import Header from "@/components/layout/Header";
import { useStore } from "@/lib/store";
import { currentMonthLabel, formatBRL, formatDateShort } from "@/lib/domain/format";
import { getSaleProductLabel } from "@/lib/domain/categories";
import { filterItems } from "@/lib/domain/filters";
import { formatSaleUnit } from "@/lib/domain/sale-entry";

export default function VendasPage() {
  const { state, totals, selectedMonth, hydrated, ready, deleteSale } = useStore();
  const [query, setQuery] = useState("");
  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("busca") ?? "");
  }, []);

  const sortedSales = useMemo(
    () =>
      filterItems(state.sales, selectedMonth.year, selectedMonth.month, {
        query,
        getSearchText: (sale) =>
          `${sale.buyer} ${getSaleProductLabel(
            sale.category,
            sale.customProduct
          )}`,
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

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">Histórico de vendas</h1>
        <p className="mt-1 text-lg text-mare-slate">
          Tudo o que entrou com suas vendas.
        </p>

        <div className="mt-4 rounded-xl2 bg-mare-purple p-5 text-white shadow-soft">
          <div>
            <p className="text-lg text-white">Entrou em {monthLabel}</p>
            <p className="mt-1 text-2xl font-semibold">
              {ready ? formatBRL(totals.totalVendido) : "—"}
            </p>
          </div>
        </div>

        {ready && hasSearch && (
          <p className="mt-3 text-lg text-mare-slate">
            Busca por “{query}”. Total: {formatBRL(listedTotal)}.{" "}
            <Link href="/mais" className="font-semibold text-mare-purple">
              Mudar busca
            </Link>
          </p>
        )}

        <Link
          href="/vendas/nova"
          className="mt-4 flex min-h-14 items-center justify-center rounded-full bg-mare-primary px-4 text-lg font-semibold text-white shadow-soft"
        >
          Anotar venda
        </Link>

        <h2 className="mt-5 text-xl font-semibold text-mare-ink">
          Lançamentos de {monthLabel}
        </h2>
        <ul className="mt-2 divide-y divide-black/5">
          {ready && sortedSales.length === 0 && (
            <li className="py-6 text-center text-lg text-mare-slate">
              {hasSearch ? (
                "Nenhum resultado para a busca."
              ) : (
                <Link
                  href="/vendas/nova"
                  className="font-semibold text-mare-purple underline"
                >
                  Toque aqui para anotar a primeira venda.
                </Link>
              )}
            </li>
          )}
          {ready &&
            sortedSales.map((sale) => {
              const categoryLabel = getSaleProductLabel(
                sale.category,
                sale.customProduct
              );
              return (
                <li key={sale.id} className="py-3 flex items-center gap-3">
                  <CategoryIcon category={sale.category} kind="venda" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-lg font-medium text-mare-ink">
                      {sale.buyer}
                    </p>
                    <p className="text-base text-mare-slate">
                      {categoryLabel} · {sale.quantity}{" "}
                      {formatSaleUnit(sale.unit, sale.quantity)} ·{" "}
                      {formatDateShort(sale.date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="whitespace-nowrap text-lg font-semibold text-mare-tealDark">
                      + {formatBRL(sale.value)}
                    </span>
                    <div className="flex flex-col items-end gap-1 font-medium">
                      <Link
                        href={`/vendas/${encodeURIComponent(sale.id)}/editar`}
                        aria-label={`Editar venda de ${sale.buyer}`}
                        className="flex min-h-14 items-center px-2 text-lg text-mare-purple hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => void deleteSale(sale.id)}
                        aria-label={`Excluir venda de ${sale.buyer}`}
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
