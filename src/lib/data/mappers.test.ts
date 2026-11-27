import { describe, expect, it } from "vitest";
import {
  mapExpenseRow,
  mapSaleRow,
  toExpenseInsert,
  toSaleInsert,
} from "./mappers";
import type { Expense, Sale } from "../domain/types";

const sale: Omit<Sale, "id"> = {
  category: "peixe",
  customProduct: null,
  buyer: "Restaurante do Mar",
  quantity: 2,
  unit: "kg",
  value: 42.5,
  date: "2025-12-10T12:00:00.000Z",
};

const expense: Omit<Expense, "id"> = {
  kind: "pesca",
  category: "gelo",
  description: "Gelo para a pesca",
  value: 12.75,
  date: "2025-12-11T12:00:00.000Z",
};

describe("database mappers", () => {
  it("maps sales to database rows and back, including numeric strings", () => {
    const insert = toSaleInsert(sale);
    const result = mapSaleRow({
      ...insert,
      id: "sale-id",
      user_id: "user-id",
      quantity: "2.000",
      value: "42.50",
      created_at: sale.date,
    });

    expect(result).toEqual({ ...sale, id: "sale-id" });
  });

  it("preserves shrimp, liters, and a custom product name", () => {
    const customSale: Omit<Sale, "id"> = {
      ...sale,
      category: "outros",
      customProduct: "Siri",
      unit: "litro",
    };
    const insert = toSaleInsert(customSale);

    expect(insert).toMatchObject({
      category: "outros",
      custom_product: "Siri",
      unit: "litro",
    });
    expect(
      mapSaleRow({
        ...insert,
        id: "custom-sale",
        occurred_at: customSale.date,
      })
    ).toEqual({ ...customSale, id: "custom-sale" });
    expect(
      mapSaleRow({
        ...insert,
        id: "shrimp-sale",
        category: "camarao",
        custom_product: null,
        unit: "kg",
        occurred_at: customSale.date,
      })
    ).toMatchObject({ category: "camarao", unit: "kg", customProduct: null });
  });

  it("maps expenses to database rows and back", () => {
    const insert = toExpenseInsert(expense);
    const result = mapExpenseRow({
      ...insert,
      id: "expense-id",
      user_id: "user-id",
      value: "12.75",
      created_at: expense.date,
    });

    expect(result).toEqual({ ...expense, id: "expense-id" });
  });

  it("preserves stable IDs for retryable local imports", () => {
    expect(toSaleInsert(sale, "00000000-0000-4000-8000-000000000001")).toMatchObject({
      id: "00000000-0000-4000-8000-000000000001",
      occurred_at: sale.date,
    });
    expect(toExpenseInsert(expense, "00000000-0000-4000-8000-000000000002")).toMatchObject({
      id: "00000000-0000-4000-8000-000000000002",
      occurred_at: expense.date,
    });
  });

  it("rejects malformed or invalid database rows", () => {
    expect(() => mapSaleRow(null)).toThrow();
    expect(() => mapSaleRow({ id: "x", value: "NaN" })).toThrow();
    expect(() =>
      mapExpenseRow({
        id: "x",
        kind: "pesca",
        category: "moradia",
        description: "",
        value: 2,
        occurred_at: expense.date,
      })
    ).toThrow();
    expect(() =>
      mapExpenseRow({
        id: "x",
        kind: "casa",
        category: "moradia",
        description: "",
        value: -1,
        occurred_at: expense.date,
      })
    ).toThrow();
  });
});
