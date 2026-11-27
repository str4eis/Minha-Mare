import {
  prepareMonthlyExportData,
  preparePdfExpenseRows,
  preparePdfSalesRows,
  preparePdfSummaryRows,
  type MonthlyTotals,
} from "./export-data";
import type { Expense, Sale } from "./types";
import type { jsPDF } from "jspdf";
import type { default as autoTableType } from "jspdf-autotable";

type PDFWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

function drawTableHeading(
  doc: PDFWithAutoTable,
  title: string,
  startY: number,
  autoTable: typeof autoTableType,
  head: string[],
  body: Array<Array<string | number>>
): number {
  const margin = 14;
  const pageHeight = doc.internal.pageSize.getHeight();
  let headingY = startY;
  if (headingY + 24 > pageHeight - margin) {
    doc.addPage();
    headingY = margin;
  }
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin, headingY);
  autoTable(doc, {
    startY: headingY + 3,
    head: [head],
    body,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [126, 34, 206], textColor: [255, 255, 255] },
    rowPageBreak: "avoid",
  });
  return doc.lastAutoTable?.finalY ?? headingY + 24;
}

export async function exportMonthlyPdf(
  sales: Sale[],
  expenses: Expense[],
  totals: MonthlyTotals,
  year: number,
  month: number
): Promise<void> {
  const data = prepareMonthlyExportData(sales, expenses, totals, year, month);
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  }) as PDFWithAutoTable;
  const margin = 14;
  let cursorY = 17;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Minha Maré", margin, cursorY);
  cursorY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Entrou, saiu e sobrou — ${data.monthLabel}`, margin, cursorY);
  cursorY += 5;

  cursorY = drawTableHeading(
    doc,
    "Valores do mês",
    cursorY + 4,
    autoTable,
    ["Indicador", "Valor"],
    preparePdfSummaryRows(data)
  );
  cursorY = drawTableHeading(
    doc,
    "Vendas",
    cursorY + 9,
    autoTable,
    ["Data", "Categoria", "Comprador", "Quantidade", "Unidade", "Valor"],
    preparePdfSalesRows(data)
  );
  drawTableHeading(
    doc,
    "Gastos",
    cursorY + 9,
    autoTable,
    ["Data", "Tipo", "Categoria", "Descrição", "Valor"],
    preparePdfExpenseRows(data)
  );

  doc.save(`minha-mare-${data.monthKey}.pdf`);
}
