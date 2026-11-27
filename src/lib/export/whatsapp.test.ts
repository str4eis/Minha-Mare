import { describe, expect, it } from "vitest";
import type { Sale } from "../domain/types";
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

  it("includes the custom product name in the shared sales list", () => {
    const sale: Sale = {
      id: "custom-sale",
      category: "outros",
      customProduct: "Siri",
      buyer: "Feira",
      quantity: 2,
      unit: "kg",
      value: 40,
      date: "2026-11-10T12:00:00.000Z",
    };

    const summary = createWhatsAppSummary(
      2026,
      11,
      {
        totalVendido: 40,
        totalGastosPesca: 0,
        totalGastosCasa: 0,
        totalGastos: 0,
        resultado: 40,
      },
      [sale]
    );

    expect(summary).toContain("Vendas:\n- Outro — Siri: 2 quilos — R$ 40,00");
  });
});
