import { describe, expect, it } from "vitest";
import {
  addExpense,
  addSale,
  deleteExpense,
  deleteSale,
  restoreExpense,
  restoreSale,
  updateExpense,
  updateSale,
} from "./state";
import { AppState, Expense, Sale } from "./types";

const sale: Sale = {
  id: "s-existing",
  category: "peixe",
  customProduct: null,
  buyer: "Compradora",
  quantity: 2,
  unit: "kg",
  value: 20,
  date: "2026-02-12T15:00:00.000Z",
};

const expense: Expense = {
  id: "e-existing",
  kind: "pesca",
  category: "gelo",
  description: "Gelo",
  value: 5,
  date: "2026-02-12T15:00:00.000Z",
};

const initialState: AppState = {
  userName: "Joana",
  onboarded: true,
  sales: [sale],
  expenses: [expense],
  metaAposentadoria: 100,
  poupancaAposentadoria: 25,
};

describe("sale state operations", () => {
  it("adds a sale without mutating the original state", () => {
    const newSale = { ...sale, id: "s-new" };
    const result = addSale(initialState, newSale);

    expect(result).not.toBe(initialState);
    expect(result.sales).toEqual([newSale, sale]);
    expect(initialState.sales).toEqual([sale]);
  });

  it("updates a sale and preserves its id", () => {
    const result = updateSale(initialState, sale.id, {
      category: sale.category,
      customProduct: sale.customProduct,
      buyer: "Nova compradora",
      quantity: sale.quantity,
      unit: sale.unit,
      value: sale.value,
      date: "2026-02-13T15:00:00.000Z",
    });

    expect(result.sales[0]).toEqual({
      ...sale,
      buyer: "Nova compradora",
      date: "2026-02-13T15:00:00.000Z",
    });
    expect(initialState.sales[0]).toEqual(sale);
  });

  it("deletes a sale", () => {
    expect(deleteSale(initialState, sale.id).sales).toEqual([]);
    expect(initialState.sales).toEqual([sale]);
  });

  it("restores a sale once after an undo", () => {
    const withoutSale = deleteSale(initialState, sale.id);
    expect(restoreSale(withoutSale, sale).sales).toEqual([sale]);
    expect(restoreSale(initialState, sale).sales).toEqual([sale]);
  });
});

describe("expense state operations", () => {
  it("adds an expense without mutating the original state", () => {
    const newExpense = { ...expense, id: "e-new" };
    const result = addExpense(initialState, newExpense);

    expect(result).not.toBe(initialState);
    expect(result.expenses).toEqual([newExpense, expense]);
    expect(initialState.expenses).toEqual([expense]);
  });

  it("updates an expense and preserves its id", () => {
    const result = updateExpense(initialState, expense.id, {
      kind: expense.kind,
      category: expense.category,
      description: "Novo gelo",
      value: expense.value,
      date: "2026-02-13T15:00:00.000Z",
    });

    expect(result.expenses[0]).toEqual({
      ...expense,
      description: "Novo gelo",
      date: "2026-02-13T15:00:00.000Z",
    });
    expect(initialState.expenses[0]).toEqual(expense);
  });

  it("deletes an expense", () => {
    expect(deleteExpense(initialState, expense.id).expenses).toEqual([]);
    expect(initialState.expenses).toEqual([expense]);
  });

  it("restores an expense once after an undo", () => {
    const withoutExpense = deleteExpense(initialState, expense.id);
    expect(restoreExpense(withoutExpense, expense).expenses).toEqual([expense]);
    expect(restoreExpense(initialState, expense).expenses).toEqual([expense]);
  });
});

describe("state operation validation", () => {
  it("returns the original state for missing ids", () => {
    expect(deleteSale(initialState, "missing")).toBe(initialState);
    expect(deleteExpense(initialState, "missing")).toBe(initialState);
    expect(
      updateSale(initialState, "missing", { ...sale, value: Number.NaN })
    ).toBe(initialState);
    expect(
      updateExpense(initialState, "missing", { ...expense, value: Number.NaN })
    ).toBe(initialState);
  });

  it("rejects invalid sale values, quantities, and dates", () => {
    expect(() => addSale(initialState, { ...sale, id: "s-invalid", value: 0 }))
      .toThrow(RangeError);
    expect(() =>
      addSale(initialState, { ...sale, id: "s-invalid", quantity: Number.POSITIVE_INFINITY })
    ).toThrow(RangeError);
    expect(() => addSale(initialState, { ...sale, id: "s-invalid", date: "2026-02-30" }))
      .toThrow(RangeError);
    expect(() =>
      updateSale(initialState, sale.id, {
        category: sale.category,
        customProduct: sale.customProduct,
        buyer: sale.buyer,
        quantity: sale.quantity,
        unit: sale.unit,
        value: Number.POSITIVE_INFINITY,
        date: sale.date,
      })
    ).toThrow(RangeError);
  });

  it("rejects invalid expense values and dates", () => {
    expect(() =>
      addExpense(initialState, { ...expense, id: "e-invalid", value: Number.NaN })
    ).toThrow(RangeError);
    expect(() =>
      addExpense(initialState, { ...expense, id: "e-invalid", date: "invalid" })
    ).toThrow(RangeError);
    expect(() =>
      updateExpense(initialState, expense.id, {
        kind: expense.kind,
        category: expense.category,
        description: expense.description,
        value: expense.value,
        date: "2026-02-30",
      })
    ).toThrow(RangeError);
  });
});
