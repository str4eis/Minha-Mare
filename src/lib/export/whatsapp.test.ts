import { describe, expect, it } from "vitest";
import type { Expense, Sale } from "../domain/types";
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

  it("includes custom and empty Other expense descriptions", () => {
    const expenses: Expense[] = [
      {
        id: "custom-expense",
        kind: "pesca",
        category: "outros",
        customDescription: "Conserto da rede",
        description: "Outro",
        value: 25,
        date: "2026-11-10T12:00:00.000Z",
      },
      {
        id: "other-expense",
        kind: "casa",
        category: "outros",
        customDescription: null,
        description: "Outro",
        value: 5,
        date: "2026-11-11T12:00:00.000Z",
      },
    ];

    const summary = createWhatsAppSummary(
      2026,
      11,
      {
        totalVendido: 0,
        totalGastosPesca: 25,
        totalGastosCasa: 5,
        totalGastos: 30,
        resultado: -30,
      },
      [],
      expenses
    );

    expect(summary).toContain(
      "Gastos:\n- Outro — Conserto da rede: R$ 25,00\n- Outro: R$ 5,00"
    );
  });
});
