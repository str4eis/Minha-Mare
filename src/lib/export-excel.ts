import {
  prepareMonthlyExportData,
  protectSpreadsheetText,
  type MonthlyExportData,
  type MonthlyTotals,
} from "./export-data";
import type { Expense, Sale } from "./types";
import type { Workbook } from "exceljs";

const currencyFormat = '"R$" #,##0.00;[Red]-"R$" #,##0.00';
const primaryFill = {
  type: "pattern" as const,
  pattern: "solid" as const,
  fgColor: { argb: "FF7E22CE" },
};
const whiteFont = { color: { argb: "FFFFFFFF" } };

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fillWorkbook(data: MonthlyExportData, workbook: Workbook): void {
  workbook.creator = "Minha Maré";

  const summary = workbook.addWorksheet("Entrou, Saiu e Sobrou");
  summary.properties.tabColor = { argb: "FF7E22CE" };
  summary.columns = [
    { header: "Indicador", key: "label", width: 28 },
    { header: "Valor", key: "value", width: 24 },
  ];
  summary.addRows(
    data.summary.map(({ label, value }) => ({ label, value }))
  );
  summary.getRow(1).font = { bold: true, ...whiteFont };
  summary.getRow(1).fill = primaryFill;
  data.summary.forEach((row, index) => {
    if (row.currency) summary.getRow(index + 2).getCell(2).numFmt = currencyFormat;
  });

  const sales = workbook.addWorksheet("Vendas");
  sales.properties.tabColor = { argb: "FF7E22CE" };
  sales.columns = [
    { header: "Data", key: "date", width: 21, style: { numFmt: "dd/mm/yyyy hh:mm" } },
    { header: "Categoria", key: "category", width: 18 },
    { header: "Comprador", key: "buyer", width: 30 },
    { header: "Quantidade", key: "quantity", width: 15 },
    { header: "Unidade", key: "unit", width: 12 },
    { header: "Valor", key: "value", width: 18 },
  ];
  sales.addRows(
    data.sales.map((row) => ({
      ...row,
      buyer: protectSpreadsheetText(row.buyer),
    }))
  );
  if (data.sales.length === 0) sales.addRow(["Nenhum lançamento neste mês"]);
  const salesTotal = sales.addRow([
    "Total",
    "",
    "",
    "",
    "",
    data.salesTotal,
  ]);
  sales.getRow(1).font = { bold: true, ...whiteFont };
  sales.getRow(1).fill = primaryFill;
  salesTotal.font = { bold: true };
  sales.getColumn("quantity").numFmt = "0.###";
  sales.getColumn("value").numFmt = currencyFormat;
  salesTotal.getCell(6).numFmt = currencyFormat;

  const expenses = workbook.addWorksheet("Gastos");
  expenses.properties.tabColor = { argb: "FF7E22CE" };
  expenses.columns = [
    { header: "Data", key: "date", width: 21, style: { numFmt: "dd/mm/yyyy hh:mm" } },
    { header: "Tipo", key: "kind", width: 14 },
    { header: "Categoria", key: "category", width: 20 },
    { header: "Descrição", key: "description", width: 34 },
    { header: "Valor", key: "value", width: 18 },
  ];
  expenses.addRows(
    data.expenses.map((row) => ({
      ...row,
      description: protectSpreadsheetText(row.description),
    }))
  );
  if (data.expenses.length === 0) {
    expenses.addRow(["Nenhum lançamento neste mês"]);
  }
  const expensesTotal = expenses.addRow([
    "Total",
    "",
    "",
    "",
    data.expensesTotal,
  ]);
  expenses.getRow(1).font = { bold: true, ...whiteFont };
  expenses.getRow(1).fill = primaryFill;
  expensesTotal.font = { bold: true };
  expenses.getColumn("value").numFmt = currencyFormat;
  expensesTotal.getCell(5).numFmt = currencyFormat;
}

export async function exportMonthlyExcel(
  sales: Sale[],
  expenses: Expense[],
  totals: MonthlyTotals,
  year: number,
  month: number
): Promise<void> {
  const data = prepareMonthlyExportData(sales, expenses, totals, year, month);
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  fillWorkbook(data, workbook);

  const output = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([new Uint8Array(output)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `minha-mare-${data.monthKey}.xlsx`
  );
}
