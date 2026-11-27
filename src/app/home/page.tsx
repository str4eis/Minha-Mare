"use client";

import Link from "next/link";
import {
  TrendingUp,
  Wallet,
  Home as HomeIcon,
  BarChart3,
  Target,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MonthPicker from "@/components/MonthPicker";
import DataStatus from "@/components/DataStatus";
import { useStore } from "@/lib/store";
import { currentMonthLabel, formatBRL, formatDateShort } from "@/lib/format";
import { saleCategoryMeta } from "@/lib/categories";
import { calculateRetirementProgress } from "@/lib/retirement";

export default function HomePage() {
  const { state, totals, selectedMonth, hydrated, ready } = useStore();

  const totalActivity = ready ? totals.totalVendido + totals.totalGastos : 0;
  const vendasShare =
    totalActivity > 0
      ? Math.round((totals.totalVendido / totalActivity) * 100)
      : 0;

  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";
  const retirementProgress = calculateRetirementProgress(
    state.metaAposentadoria,
    state.poupancaAposentadoria
  );
  const retirementPercentage = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(retirementProgress.percentage);
  const recentSales = [...state.sales]
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header />
      <MonthPicker />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <DataStatus />
        <h1 className="text-[26px] font-semibold leading-tight">
          {state.userName ? `Olá, ${state.userName}!` : "Olá!"}
        </h1>
        <p className="mt-1 text-mare-slate">
          A maré está subindo. Ótimo dia para a coleta!
        </p>

        {/* Resumo do mês */}
        <section className="mt-5 rounded-xl2 bg-mare-card p-5 shadow-card">
          <p className="text-xs font-semibold tracking-widest text-mare-slate uppercase">
            Resumo de {monthLabel}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-mare-slate">Vendas</p>
              <p className="mt-0.5 font-semibold text-mare-tealDark">
                {ready ? formatBRL(totals.totalVendido) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-mare-slate">Gastos</p>
              <p className="mt-0.5 font-semibold text-[#B23B5C]">
                {ready ? formatBRL(totals.totalGastos) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-mare-slate">Resultado</p>
              <p className="mt-0.5 font-semibold text-mare-purple">
                {ready ? formatBRL(totals.resultado) : "—"}
              </p>
            </div>
          </div>
          <div
            className={`mt-4 h-2 w-full rounded-full overflow-hidden ${
              totalActivity > 0 ? "bg-[#F3C9D3]" : "bg-[#E5E7EB]"
            }`}
          >
            <div
              className="h-full rounded-full bg-mare-tealDark"
              style={{ width: `${vendasShare}%` }}
            />
          </div>
        </section>

        {/* Grid de atalhos */}
        <section className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/vendas/nova"
            className="rounded-xl2 bg-mare-purpleLight p-4 h-28 flex flex-col justify-between shadow-card active:scale-[0.98] transition-transform"
          >
            <TrendingUp className="h-6 w-6 text-mare-purple" strokeWidth={2} />
            <span className="font-semibold text-mare-ink leading-tight">
              Registrar
              <br />
              Venda
            </span>
          </Link>
          <Link
            href="/gastos?tab=pesca"
            className="rounded-xl2 bg-mare-tealLight p-4 h-28 flex flex-col justify-between shadow-card active:scale-[0.98] transition-transform"
          >
            <Wallet className="h-6 w-6 text-mare-tealDark" strokeWidth={2} />
            <span className="font-semibold text-mare-ink leading-tight">
              Gastos da
              <br />
              Pesca
            </span>
          </Link>
          <Link
            href="/gastos?tab=casa"
            className="rounded-xl2 bg-mare-yellowLight p-4 h-28 flex flex-col justify-between shadow-card active:scale-[0.98] transition-transform"
          >
            <HomeIcon className="h-6 w-6 text-mare-yellowDark" strokeWidth={2} />
            <span className="font-semibold text-mare-ink leading-tight">
              Gastos da
              <br />
              Casa
            </span>
          </Link>
          <Link
            href="/resultados"
            className="rounded-xl2 bg-mare-card p-4 h-28 flex flex-col justify-between shadow-card active:scale-[0.98] transition-transform"
          >
            <BarChart3 className="h-6 w-6 text-mare-ink" strokeWidth={2} />
            <span className="font-semibold text-mare-ink leading-tight">
              Meu
              <br />
              Resultado
            </span>
          </Link>
        </section>

        <section className="mt-4 rounded-xl2 border border-black/5 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mare-purpleLight">
              <Target className="h-5 w-5 text-mare-purple" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-mare-ink">Minha Aposentadoria</p>
              {!ready ? (
                <p className="text-sm text-mare-slate">—</p>
              ) : state.metaAposentadoria === 0 ? (
                <Link
                  href="/perfil"
                  className="text-sm font-medium text-mare-purple hover:underline"
                >
                  Defina sua meta
                </Link>
              ) : (
                <p className="text-sm text-mare-slate">
                  {retirementPercentage}% da meta guardada
                </p>
              )}
            </div>
          </div>
          {ready && state.metaAposentadoria > 0 && (
            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-mare-purpleLight"
              role="progressbar"
              aria-label="Progresso da meta de aposentadoria"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={retirementProgress.barPercentage}
            >
              <div
                className="h-full rounded-full bg-mare-purple"
                style={{ width: `${retirementProgress.barPercentage}%` }}
              />
            </div>
          )}
        </section>

        {/* Vendas recentes */}
        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-mare-ink">Vendas Recentes</h2>
            <Link href="/vendas" className="text-sm font-medium text-mare-purple">
              Ver tudo
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-black/5">
            {ready && recentSales.length === 0 && (
              <li className="py-4 text-sm text-mare-slate">
                Nenhuma venda em {monthLabel}.
              </li>
            )}
            {ready && recentSales.map((sale) => {
              const meta = saleCategoryMeta[sale.category];
              const Icon = meta.icon;
              return (
                <li key={sale.id} className="py-3 flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-mare-tealLight flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-mare-tealDark" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-mare-ink truncate">{sale.buyer}</p>
                    <p className="text-xs text-mare-slate">{formatDateShort(sale.date)}</p>
                  </div>
                  <span className="font-semibold text-mare-tealDark whitespace-nowrap">
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
