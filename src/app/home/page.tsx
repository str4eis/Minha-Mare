"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
} from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import DataStatus from "@/components/ui/DataStatus";
import CategoryIcon from "@/components/forms/CategoryIcon";
import { useStore } from "@/lib/store";
import { currentMonthLabel, formatBRL, formatDateShort } from "@/lib/domain/format";
import { saleCategoryMeta } from "@/lib/domain/categories";

export default function HomePage() {
  const { state, totals, selectedMonth, hydrated, ready } = useStore();
  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";
  const recentSales = [...state.sales]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 3);
  const sobrouPositivo = totals.resultado >= 0;

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

        <section className="mt-5 rounded-xl2 bg-mare-card p-5 shadow-card">
          <h2 className="text-lg font-semibold text-mare-institutional">
            Este mês: {monthLabel}
          </h2>
          <dl className="mt-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-lg font-medium text-mare-tealDark">
                <ArrowUpRight className="h-6 w-6" aria-hidden="true" />
                Entrou
              </dt>
              <dd className="text-xl font-semibold text-mare-tealDark">
                {ready ? formatBRL(totals.totalVendido) : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-lg font-medium text-mare-negative">
                <ArrowDownRight className="h-6 w-6" aria-hidden="true" />
                Saiu
              </dt>
              <dd className="text-xl font-semibold text-mare-negative">
                {ready ? formatBRL(totals.totalGastos) : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-3">
              <dt
                className={`flex items-center gap-2 text-lg font-semibold ${
                  sobrouPositivo ? "text-mare-institutional" : "text-mare-negative"
                }`}
              >
                {sobrouPositivo ? (
                  <CircleCheck className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <CircleAlert className="h-6 w-6" aria-hidden="true" />
                )}
                Sobrou
              </dt>
              <dd
                className={`text-xl font-bold ${
                  sobrouPositivo ? "text-mare-institutional" : "text-mare-negative"
                }`}
              >
                {ready ? formatBRL(totals.resultado) : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-3">
          <Link
            href="/vendas/nova"
            className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-mare-primary px-4 text-lg font-semibold text-white shadow-soft"
          >
            <ArrowUpRight className="h-6 w-6" aria-hidden="true" />
            Anotar venda
          </Link>
          <Link
            href="/gastos/novo"
            className="flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-mare-primary px-4 text-lg font-semibold text-mare-primary"
          >
            <ArrowDownRight className="h-6 w-6" aria-hidden="true" />
            Anotar gasto
          </Link>
        </section>

        {ready && totals.totalVendido === 0 && (
          <Link
            href="/vendas/nova"
            className="mt-4 block rounded-xl2 bg-mare-purpleLight p-4 text-lg font-semibold text-mare-institutional"
          >
            Toque aqui para anotar a primeira venda.
          </Link>
        )}

        <section className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-mare-ink">
              Vendas recentes
            </h2>
            <Link href="/mais" className="text-lg font-medium text-mare-purple">
              Ver histórico
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-black/5">
            {ready && recentSales.length === 0 && (
              <li className="py-4 text-lg text-mare-slate">
                Ainda não há vendas neste mês.
              </li>
            )}
            {ready &&
              recentSales.map((sale) => {
                const categoryLabel =
                  saleCategoryMeta[sale.category]?.label ?? sale.category;
                return (
                  <li key={sale.id} className="flex items-center gap-3 py-3">
                    <CategoryIcon
                      category={sale.category}
                      kind="venda"
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-medium text-mare-ink">
                        {sale.buyer}
                      </p>
                      <p className="text-base text-mare-slate">
                        {categoryLabel} · {formatDateShort(sale.date)}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-lg font-semibold text-mare-tealDark">
                      + {formatBRL(sale.value)}
                    </span>
                  </li>
                );
              })}
          </ul>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
