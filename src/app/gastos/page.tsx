"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MonthPicker from "@/components/MonthPicker";
import { useStore } from "@/lib/store";
import { currentMonthLabel, formatBRL, formatDateShort } from "@/lib/format";
import { fishingExpenseMeta, homeExpenseMeta } from "@/lib/categories";
import { ExpenseKind } from "@/lib/types";
import { cn } from "@/lib/cn";
import { filterByMonth } from "@/lib/period";

function GastosContent() {
  const params = useSearchParams();
  const initialTab = (params.get("tab") as ExpenseKind) || "pesca";
  const [tab, setTab] = useState<ExpenseKind>(initialTab);
  const { state, totals, selectedMonth, hydrated } = useStore();

  const meta = tab === "pesca" ? fishingExpenseMeta : homeExpenseMeta;
  const total = tab === "pesca" ? totals.totalGastosPesca : totals.totalGastosCasa;
  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    filterByMonth(state.expenses, selectedMonth.year, selectedMonth.month)
      .filter((e) => e.kind === tab)
      .forEach((e) =>
        map.set(e.category, (map.get(e.category) ?? 0) + Math.round(e.value * 100))
      );
    return map;
  }, [state.expenses, selectedMonth, tab]);

  const recent = useMemo(
    () =>
      filterByMonth(state.expenses, selectedMonth.year, selectedMonth.month)
        .filter((e) => e.kind === tab)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8),
    [state.expenses, selectedMonth, tab]
  );

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header />
      <MonthPicker />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <h1 className="text-2xl font-semibold">Gastos</h1>

        <div className="mt-4 flex rounded-full bg-mare-card p-1">
          <button
            onClick={() => setTab("pesca")}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
              tab === "pesca" ? "bg-mare-purple text-white shadow-soft" : "text-mare-slate"
            )}
          >
            Gastos da Pesca
          </button>
          <button
            onClick={() => setTab("casa")}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
              tab === "casa" ? "bg-mare-purple text-white shadow-soft" : "text-mare-slate"
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
            {hydrated ? formatBRL(total) : "—"}
          </p>
        </div>

        <p className="mt-5 font-semibold text-mare-ink">
          Categorias {tab === "pesca" ? "de Pesca" : "da Casa"}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(Object.keys(meta) as Array<keyof typeof meta>).map((cat) => {
            const m = meta[cat];
            const Icon = m.icon;
            const spent = (byCategory.get(cat as string) ?? 0) / 100;
            return (
              <Link
                key={cat as string}
                href={`/gastos/novo?kind=${tab}&categoria=${cat as string}`}
                className="rounded-xl2 border border-black/5 p-4 flex flex-col gap-3 shadow-card active:scale-[0.98] transition-transform"
              >
                <Icon className="h-5 w-5 text-mare-purple" />
                <div>
                  <p className="font-semibold text-mare-ink text-sm">{m.label}</p>
                  <p className="text-xs text-mare-slate mt-0.5">
                    {!hydrated ? "—" : spent > 0 ? formatBRL(spent) : "Adicionar"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="font-semibold text-mare-ink">Lançamentos recentes</p>
        </div>
        <ul className="mt-2 divide-y divide-black/5">
          {hydrated && recent.length === 0 && (
            <li className="py-4 text-sm text-mare-slate">
              Nenhum gasto em {monthLabel}.
            </li>
          )}
          {hydrated && recent.map((e) => {
            const m = meta[e.category as keyof typeof meta];
            const Icon = m?.icon;
            return (
              <li key={e.id} className="py-3 flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-mare-card flex items-center justify-center shrink-0">
                  {Icon && <Icon className="h-5 w-5 text-mare-purple" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-mare-ink truncate">{e.description}</p>
                  <p className="text-xs text-mare-slate">{formatDateShort(e.date)}</p>
                </div>
                <span className="font-semibold text-[#B23B5C] whitespace-nowrap">
                  - {formatBRL(e.value)}
                </span>
              </li>
            );
          })}
        </ul>
      </main>

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
