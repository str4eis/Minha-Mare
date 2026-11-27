import { currentMonthLabel, formatBRL } from "./format";
import type { MonthlyTotals } from "./export-data";

export function createWhatsAppSummary(
  year: number,
  month: number,
  totals: MonthlyTotals
): string {
  return (
    `Minha Maré — ${currentMonthLabel(year, month)}\n` +
    `Entrou: ${formatBRL(totals.totalVendido)}\n` +
    `Saiu com trabalho: ${formatBRL(totals.totalGastosPesca)}\n` +
    `Saiu em casa: ${formatBRL(totals.totalGastosCasa)}\n` +
    `Saiu no total: ${formatBRL(totals.totalGastos)}\n` +
    `Sobrou: ${formatBRL(totals.resultado)}`
  );
}
