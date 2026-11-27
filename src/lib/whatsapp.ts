import { currentMonthLabel, formatBRL } from "./format";
import type { MonthlyTotals } from "./export-data";

export function createWhatsAppSummary(
  year: number,
  month: number,
  totals: MonthlyTotals
): string {
  return (
    `Resumo de ${currentMonthLabel(year, month)} — Minha Maré\n` +
    `Total vendido: ${formatBRL(totals.totalVendido)}\n` +
    `Gastos da pesca: ${formatBRL(totals.totalGastosPesca)}\n` +
    `Gastos da casa: ${formatBRL(totals.totalGastosCasa)}\n` +
    `Resultado final: ${formatBRL(totals.resultado)}`
  );
}
