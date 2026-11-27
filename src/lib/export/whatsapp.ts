import { currentMonthLabel, formatBRL } from "../domain/format";
import { getSaleProductLabel } from "../domain/categories";
import { formatSaleUnit } from "../domain/sale-entry";
import type { Sale } from "../domain/types";
import type { MonthlyTotals } from "./export-data";

export function createWhatsAppSummary(
  year: number,
  month: number,
  totals: MonthlyTotals,
  sales: Sale[] = []
): string {
  const salesText = sales.length
    ? `\n\nVendas:\n${sales
        .map((sale) => {
          const quantity = new Intl.NumberFormat("pt-BR", {
            maximumFractionDigits: 3,
            useGrouping: false,
          }).format(sale.quantity);
          return `- ${getSaleProductLabel(
            sale.category,
            sale.customProduct
          )}: ${quantity} ${formatSaleUnit(
            sale.unit,
            sale.quantity
          )} — ${formatBRL(sale.value)}`;
        })
        .join("\n")}`
    : "";

  return (
    `Minha Maré — ${currentMonthLabel(year, month)}\n` +
    `Entrou: ${formatBRL(totals.totalVendido)}\n` +
    `Saiu com trabalho: ${formatBRL(totals.totalGastosPesca)}\n` +
    `Saiu em casa: ${formatBRL(totals.totalGastosCasa)}\n` +
    `Saiu no total: ${formatBRL(totals.totalGastos)}\n` +
    `Sobrou: ${formatBRL(totals.resultado)}` +
    salesText
  );
}
