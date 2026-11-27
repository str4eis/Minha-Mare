import { describe, expect, it } from "vitest";
import { createWhatsAppSummary } from "./whatsapp";

describe("createWhatsAppSummary", () => {
  it("uses the selected month and Brazilian currency totals", () => {
    expect(
      createWhatsAppSummary(2026, 11, {
        totalVendido: 100,
        totalGastosPesca: 20.5,
        totalGastosCasa: 10,
        totalGastos: 30.5,
        resultado: 69.5,
      })
    ).toContain(
      "Resumo de Novembro de 2026 — Minha Maré\n" +
        "Total vendido: R$ 100,00\n" +
        "Gastos da pesca: R$ 20,50\n" +
        "Gastos da casa: R$ 10,00\n" +
        "Resultado final: R$ 69,50"
    );
  });
});
