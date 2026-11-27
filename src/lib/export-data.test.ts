import { describe, expect, it } from "vitest";
import {
  excelDateInRecife,
  formatExportDate,
  formatPdfQuantity,
  prepareMonthlyExportData,
  preparePdfExpenseRows,
  preparePdfSalesRows,
  preparePdfSummaryRows,
  protectSpreadsheetText,
} from "./export-data";
import type { Expense, Sale } from "./types";

const totals = {
  totalVendido: 20.3,
  totalGastosPesca: 2.1,
  totalGastosCasa: 3.2,
  totalGastos: 5.3,
  resultado: 15,
};

const sale: Sale = {
  id: "s1",
  category: "peixe",
  buyer: "=1+1",
  quantity: 1.5,
  unit: "kg",
  value: 20.3,
  date: "2026-11-01T02:30:00.000Z",
};

const expense: Expense = {
  id: "e1",
  kind: "casa",
  category: "alimentacao",
  description: "@SUM(A1:A2)",
  value: 5.3,
  date: "2026-11-02T15:00:00.000Z",
};

describe("export data preparation", () => {
  it("protects spreadsheet formula prefixes as literal text", () => {
    expect(protectSpreadsheetText("=1+1")).toBe("'=1+1");
    expect(protectSpreadsheetText("+cmd")).toBe("'+cmd");
    expect(protectSpreadsheetText("-2+3")).toBe("'-2+3");
    expect(protectSpreadsheetText("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");
    expect(protectSpreadsheetText("Compradora")).toBe("Compradora");
  });

  it("formats exported dates in Recife time", () => {
    expect(formatExportDate("2026-11-01T02:30:00.000Z")).toBe(
      "31/10/2026, 23:30"
    );
    expect(excelDateInRecife("2026-11-01T02:30:00.000Z")).toEqual(
      new Date("2026-10-31T23:30:00.000Z")
    );
  });

  it("formats PDF quantities with Brazilian decimals and no trailing zeros", () => {
    expect(formatPdfQuantity(6.25)).toBe("6,25");
    expect(formatPdfQuantity(15.5)).toBe("15,5");
    expect(formatPdfQuantity(1.234)).toBe("1,234");
  });

  it("prepares selected-month rows with numeric totals and localized summary", () => {
    const data = prepareMonthlyExportData(
      [sale],
      [expense],
      totals,
      2026,
      11
    );

    expect(data.monthKey).toBe("2026-11");
    expect(data.monthLabel).toBe("Novembro de 2026");
    expect(data.sales[0]).toMatchObject({
      date: new Date("2026-10-31T23:30:00.000Z"),
      dateLabel: "31/10/2026, 23:30",
      category: "Peixe",
      buyer: "=1+1",
      unit: "quilo",
      value: 20.3,
    });
    expect(data.expenses[0]).toMatchObject({
      date: new Date("2026-11-02T12:00:00.000Z"),
      dateLabel: "02/11/2026, 12:00",
      kind: "Casa",
      category: "Alimentação",
      description: "@SUM(A1:A2)",
      value: 5.3,
    });
    expect(data.summary.find((row) => row.label === "Entrou")?.value).toBe(
      20.3
    );
    expect(preparePdfSummaryRows(data)).toContainEqual([
      "Sobrou",
      "R$ 15,00",
    ]);
  });

  it("prepares empty tables without altering the selected month", () => {
    const data = prepareMonthlyExportData([], [], totals, 2026, 11);

    expect(data.sales).toEqual([]);
    expect(data.expenses).toEqual([]);
    expect(data.monthKey).toBe("2026-11");
    expect(preparePdfSalesRows(data)).toEqual([
      ["Nenhum lançamento neste mês", "", "", "", "", ""],
      ["Total", "", "", "", "", "R$ 20,30"],
    ]);
    expect(preparePdfExpenseRows(data)).toEqual([
      ["Nenhum lançamento neste mês", "", "", "", ""],
      ["Total", "", "", "", "R$ 5,30"],
    ]);
  });

  it("uses localized quantities in the prepared PDF sales rows", () => {
    const data = prepareMonthlyExportData(
      [
        { ...sale, quantity: 6.25 },
        { ...sale, id: "s2", quantity: 15.5 },
      ],
      [],
      totals,
      2026,
      11
    );

    expect(preparePdfSalesRows(data).map((row) => row[3])).toEqual([
      "6,25",
      "15,5",
      "",
    ]);
  });
});
