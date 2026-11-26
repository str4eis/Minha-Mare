"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MonthPicker from "@/components/MonthPicker";
import { useStore } from "@/lib/store";
import { currentMonthLabel, formatBRL, formatDateShort } from "@/lib/format";
import { saleCategoryMeta } from "@/lib/categories";
import { filterByMonth } from "@/lib/period";

export default function VendasPage() {
  const { state, totals, selectedMonth, hydrated } = useStore();
  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";

  const sortedSales = filterByMonth(
    state.sales,
    selectedMonth.year,
    selectedMonth.month
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header />
      <MonthPicker />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <h1 className="text-2xl font-semibold">Vendas</h1>
        <p className="text-mare-slate mt-1">Tudo o que você já vendeu na maré.</p>

        <div className="mt-4 rounded-xl2 bg-mare-purple text-white p-5 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-sm text-white/75">Total vendido em {monthLabel}</p>
            <p className="text-2xl font-semibold mt-1">
              {hydrated ? formatBRL(totals.totalVendido) : "—"}
            </p>
          </div>
          <span className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </span>
        </div>

        <ul className="mt-5 divide-y divide-black/5">
          {hydrated && sortedSales.length === 0 && (
            <li className="py-6 text-center text-sm text-mare-slate">
              Nenhuma venda em {monthLabel}.
            </li>
          )}
          {hydrated && sortedSales.map((sale) => {
            const meta = saleCategoryMeta[sale.category];
            const Icon = meta.icon;
            return (
              <li key={sale.id} className="py-3 flex items-center gap-3">
                <span className="h-11 w-11 rounded-full bg-mare-tealLight flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-mare-tealDark" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-mare-ink truncate">{sale.buyer}</p>
                  <p className="text-xs text-mare-slate">
                    {meta.label} · {sale.quantity} {sale.unit} · {formatDateShort(sale.date)}
                  </p>
                </div>
                <span className="font-semibold text-mare-tealDark whitespace-nowrap">
                  + {formatBRL(sale.value)}
                </span>
              </li>
            );
          })}
        </ul>
      </main>

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
