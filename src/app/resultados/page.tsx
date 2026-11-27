"use client";

import { useState } from "react";
import {
  Banknote,
  FileDown,
  Frown,
  Home as HomeIcon,
  Share2,
  Sheet,
  Ship,
  Smile,
} from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import MonthPicker from "@/components/MonthPicker";
import DataStatus from "@/components/DataStatus";
import { useStore } from "@/lib/store";
import { formatBRL, currentMonthLabel } from "@/lib/format";
import { cn } from "@/lib/cn";
import { exportMonthlyExcel } from "@/lib/export-excel";
import { exportMonthlyPdf } from "@/lib/export-pdf";
import { createWhatsAppSummary } from "@/lib/whatsapp";

export default function ResultadosPage() {
  const { state, totals, selectedMonth, hydrated, ready } = useStore();
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const [exportMessage, setExportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const monthLabel = hydrated
    ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
    : "—";

  const gastoPct =
    !ready || totals.totalVendido === 0
      ? 0
      : Math.min(100, Math.round((totals.totalGastos / totals.totalVendido) * 100));

  const positivo = totals.resultado >= 0;

  const shareText = ready
    ? createWhatsAppSummary(
        selectedMonth.year,
        selectedMonth.month,
        totals
      )
    : "";

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
      setExportMessage({ type: "success", text: "Arquivo gerado" });
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
    <div className="flex flex-col min-h-dvh bg-white">
      <Header />
      <MonthPicker />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">Meu Resultado</h1>
        <p className="text-mare-slate mt-1">{monthLabel}</p>

        <div className="mt-4 rounded-xl2 bg-mare-purple text-white p-5 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Total Vendido</p>
            <p className="text-2xl font-semibold mt-1">
              {ready ? formatBRL(totals.totalVendido) : "—"}
            </p>
          </div>
          <span className="h-11 w-11 rounded-full bg-white/15 flex items-center justify-center">
            <Banknote className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-3 rounded-xl2 bg-mare-tealLight p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-mare-institutional">Gastos da Pesca</p>
            <p className="text-2xl font-semibold mt-1 text-mare-tealDark">
              {ready ? formatBRL(totals.totalGastosPesca) : "—"}
            </p>
          </div>
          <span className="h-11 w-11 rounded-full bg-white/50 flex items-center justify-center">
            <Ship className="h-5 w-5 text-mare-tealDark" />
          </span>
        </div>

        <div className="mt-3 rounded-xl2 bg-mare-yellowLight p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-mare-institutional">Gastos da Casa</p>
            <p className="text-2xl font-semibold mt-1 text-mare-yellowDark">
              {ready ? formatBRL(totals.totalGastosCasa) : "—"}
            </p>
          </div>
          <span className="h-11 w-11 rounded-full bg-white/50 flex items-center justify-center">
            <HomeIcon className="h-5 w-5 text-mare-yellowDark" />
          </span>
        </div>

        <div className="mt-5 rounded-xl2 border border-black/5 p-6 text-center shadow-card">
          <span
            className={cn(
              "mx-auto h-12 w-12 rounded-full flex items-center justify-center text-2xl",
              positivo
                ? "bg-mare-accent text-mare-institutional"
                : "bg-mare-negative text-white"
            )}
          >
            {ready ? (
              positivo ? (
                <Smile className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              ) : (
                <Frown className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              )
            ) : (
              "—"
            )}
          </span>
          <p className="mt-3 font-semibold text-mare-ink">Resultado Final</p>
          <p
            className={cn(
              "mt-1 text-3xl font-bold",
              positivo ? "text-mare-positive" : "text-mare-negative"
            )}
          >
            {ready ? formatBRL(totals.resultado) : "—"}
          </p>
          <span
            className={cn(
              "mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold",
              positivo
                ? "bg-mare-accent text-mare-institutional"
                : "bg-mare-negativeLight text-mare-negative"
            )}
          >
            {ready ? (positivo ? "Lucro do Mês" : "Prejuízo do Mês") : "—"}
          </span>

          <div className="mt-5 text-left">
            <div className="flex items-center justify-between text-xs text-mare-slate">
              <span>Gastos Totais vs Vendas</span>
              <span className="font-semibold text-mare-ink">
                {ready ? `${gastoPct}% gasto` : "—"}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-mare-card overflow-hidden">
              <div
                className="h-full rounded-full bg-mare-primary"
                style={{ width: `${gastoPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-mare-slate">
              <span>{ready ? `${formatBRL(totals.totalGastos)} gastos` : "—"}</span>
              <span>{ready ? `${formatBRL(totals.totalVendido)} meta` : "—"}</span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "mt-5 rounded-xl2 p-4 shadow-card",
            !ready
              ? "bg-mare-surface text-mare-secondary"
              : positivo
                ? "bg-mare-accent text-mare-institutional"
                : "bg-mare-negativeLight text-mare-negative"
          )}
        >
          <p role="status" className="text-sm font-medium leading-relaxed">
            {!ready
              ? "—"
              : positivo
                ? "Parabéns! Sua maré está produtiva este mês."
                : "Toda maré tem seu tempo. Vamos ajustar os gastos?"}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={!ready || exporting !== null}
            aria-busy={exporting === "pdf"}
            className="rounded-full border border-black/10 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-mare-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            {exporting === "pdf" ? "Gerando PDF..." : "Exportar PDF"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("excel")}
            disabled={!ready || exporting !== null}
            aria-busy={exporting === "excel"}
            className="rounded-full border border-black/10 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-mare-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sheet className="h-4 w-4" />
            {exporting === "excel" ? "Gerando Excel..." : "Exportar Excel"}
          </button>
        </div>

        {exportMessage && (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-center text-sm ${
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
          className={`mt-3 w-full flex items-center justify-center gap-2 rounded-full bg-mare-primary text-white py-3.5 font-semibold shadow-soft ${
            ready ? "" : "pointer-events-none opacity-50"
          }`}
        >
          <Share2 className="h-4 w-4" />
          Compartilhar no WhatsApp
        </a>
      </main>

      <BottomNav />
    </div>
  );
}
