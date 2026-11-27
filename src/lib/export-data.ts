import {
  fishingExpenseMeta,
  homeExpenseMeta,
  saleCategoryMeta,
} from "./categories";
import { currentMonthLabel, formatBRL } from "./format";
import type { Expense, Sale } from "./types";

export interface MonthlyTotals {
  totalVendido: number;
  totalGastosPesca: number;
  totalGastosCasa: number;
  totalGastos: number;
  resultado: number;
}

export interface ExportSaleRow {
  date: Date;
  dateLabel: string;
  category: string;
  buyer: string;
  quantity: number;
  unit: string;
  value: number;
}

export interface ExportExpenseRow {
  date: Date;
  dateLabel: string;
  kind: string;
  category: string;
  description: string;
  value: number;
}

export interface ExportSummaryRow {
  label: string;
  value: string | number;
  currency: boolean;
}

export interface MonthlyExportData {
  monthLabel: string;
  monthKey: string;
  summary: ExportSummaryRow[];
  sales: ExportSaleRow[];
  expenses: ExportExpenseRow[];
  salesTotal: number;
  expensesTotal: number;
}

export function formatExportDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (!Number.isFinite(date.getTime())) {
    throw new RangeError("A data do lançamento é inválida.");
  }
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Recife",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export function excelDateInRecife(isoDate: string): Date {
  const instant = new Date(isoDate);
  if (!Number.isFinite(instant.getTime())) {
    throw new RangeError("A data do lançamento é inválida.");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Recife",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, Number(value)])
  );
  const excelDate = new Date(0);
  excelDate.setUTCHours(
    values.hour,
    values.minute,
    values.second,
    instant.getUTCMilliseconds()
  );
  excelDate.setUTCFullYear(values.year, values.month - 1, values.day);
  return excelDate;
}

export function formatPdfQuantity(quantity: number): string {
  return quantity.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
    useGrouping: false,
  });
}

export function protectSpreadsheetText(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

export function prepareMonthlyExportData(
  sales: Sale[],
  expenses: Expense[],
  totals: MonthlyTotals,
  year: number,
  month: number
): MonthlyExportData {
  const monthLabel = currentMonthLabel(year, month);
  return {
    monthLabel,
    monthKey: `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`,
    summary: [
      { label: "Mês", value: monthLabel, currency: false },
      { label: "Ano", value: year, currency: false },
      { label: "Total vendido", value: totals.totalVendido, currency: true },
      {
        label: "Gastos da pesca",
        value: totals.totalGastosPesca,
        currency: true,
      },
      {
        label: "Gastos da casa",
        value: totals.totalGastosCasa,
        currency: true,
      },
      { label: "Total de gastos", value: totals.totalGastos, currency: true },
      { label: "Resultado", value: totals.resultado, currency: true },
    ],
    sales: sales.map((sale) => ({
      date: excelDateInRecife(sale.date),
      dateLabel: formatExportDate(sale.date),
      category: saleCategoryMeta[sale.category].label,
      buyer: sale.buyer,
      quantity: sale.quantity,
      unit: sale.unit,
      value: sale.value,
    })),
    expenses: expenses.map((expense) => ({
      date: excelDateInRecife(expense.date),
      dateLabel: formatExportDate(expense.date),
      kind: expense.kind === "pesca" ? "Pesca" : "Casa",
      category:
        expense.kind === "pesca"
          ? fishingExpenseMeta[expense.category as keyof typeof fishingExpenseMeta].label
          : homeExpenseMeta[expense.category as keyof typeof homeExpenseMeta].label,
      description: expense.description,
      value: expense.value,
    })),
    salesTotal: totals.totalVendido,
    expensesTotal: totals.totalGastos,
  };
}

export function preparePdfSummaryRows(
  data: MonthlyExportData
): Array<[string, string]> {
  return data.summary
    .filter((row) => row.label !== "Mês" && row.label !== "Ano")
    .map((row) => [
      row.label,
      row.currency ? formatBRL(Number(row.value)) : String(row.value),
    ]);
}

export function preparePdfSalesRows(
  data: MonthlyExportData
): Array<Array<string | number>> {
  const rows = data.sales.map((sale) => [
    sale.dateLabel,
    sale.category,
    sale.buyer,
    formatPdfQuantity(sale.quantity),
    sale.unit,
    formatBRL(sale.value),
  ]);
  if (rows.length === 0) {
    rows.push(["Nenhum lançamento neste mês", "", "", "", "", ""]);
  }
  rows.push(["Total", "", "", "", "", formatBRL(data.salesTotal)]);
  return rows;
}

export function preparePdfExpenseRows(
  data: MonthlyExportData
): Array<Array<string | number>> {
  const rows = data.expenses.map((expense) => [
    expense.dateLabel,
    expense.kind,
    expense.category,
    expense.description,
    formatBRL(expense.value),
  ]);
  if (rows.length === 0) {
    rows.push(["Nenhum lançamento neste mês", "", "", "", ""]);
  }
  rows.push(["Total", "", "", "", formatBRL(data.expensesTotal)]);
  return rows;
}
