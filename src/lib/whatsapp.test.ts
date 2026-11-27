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
      "Minha Maré — Novembro de 2026\n" +
        "Entrou: R$ 100,00\n" +
        "Saiu com trabalho: R$ 20,50\n" +
        "Saiu em casa: R$ 10,00\n" +
        "Saiu no total: R$ 30,50\n" +
        "Sobrou: R$ 69,50"
    );
  });
});
