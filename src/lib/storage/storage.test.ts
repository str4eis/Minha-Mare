import { describe, expect, it } from "vitest";
import {
  backupCorruptedStoredState,
  migrateStoredState,
  shouldPersistStoredState,
  STORAGE_BACKUP_KEY,
  STORAGE_KEY,
} from "./storage";
import { Expense, Sale } from "../domain/types";

const sampleSale: Sale = {
  id: "s1",
  category: "peixe",
  customProduct: null,
  buyer: "Compradora de exemplo",
  quantity: 1,
  unit: "kg",
  value: 10,
  date: "2025-12-10T12:00:00.000Z",
};

const realSale: Sale = {
  ...sampleSale,
  id: "s-real",
  buyer: "Compradora real",
  value: 25.5,
};

const sampleExpense: Expense = {
  id: "e1",
  kind: "pesca",
  category: "gelo",
  customDescription: null,
  description: "Despesa de exemplo",
  value: 5,
  date: "2025-12-11T12:00:00.000Z",
};

const realExpense: Expense = {
  ...sampleExpense,
  id: "e-real",
  description: "Despesa real",
  value: 2.5,
};

function storedState(
  overrides: Record<string, unknown> = {}
): string {
  return JSON.stringify({
    userName: "Maria da Maré",
    onboarded: false,
    sales: [],
    expenses: [],
    metaAposentadoria: 500,
    poupancaAposentadoria: 225,
    ...overrides,
  });
}

describe("migrateStoredState", () => {
  it("removes only the sample transactions and default profile values", () => {
    const result = migrateStoredState(
      storedState({
        sales: [sampleSale],
        expenses: [sampleExpense],
      })
    );

    expect(result.ok).toBe(true);
    expect(result.discarded).toBe(0);
    expect(result.state).toMatchObject({
      userName: "",
      metaAposentadoria: 0,
      poupancaAposentadoria: 0,
      sales: [],
      expenses: [],
    });
  });

  it("keeps real transactions mixed with sample data", () => {
    const result = migrateStoredState(
      storedState({
        sales: [sampleSale, realSale],
        expenses: [sampleExpense, realExpense],
      })
    );

    expect(result.ok).toBe(true);
    expect(result.discarded).toBe(0);
    expect(result.state.sales).toEqual([realSale]);
    expect(result.state.expenses).toEqual([realExpense]);
  });

  it("keeps custom expense descriptions and fills the field for old records", () => {
    const customExpense: Expense = {
      ...realExpense,
      id: "e-custom",
      category: "outros",
      customDescription: "Conserto da rede",
    };
    const legacyExpense = { ...realExpense } as Record<string, unknown>;
    delete legacyExpense.customDescription;
    const result = migrateStoredState(
      storedState({ expenses: [customExpense, legacyExpense] })
    );

    expect(result.ok).toBe(true);
    expect(result.discarded).toBe(0);
    expect(result.state.expenses).toEqual([
      customExpense,
      { ...realExpense, customDescription: null },
    ]);
  });

  it("keeps valid real data and non-default profile values", () => {
    const result = migrateStoredState(
      storedState({
        userName: "Joana",
        sales: [realSale],
        expenses: [realExpense],
        metaAposentadoria: 700,
        poupancaAposentadoria: 130,
      })
    );

    expect(result.ok).toBe(true);
    expect(result.discarded).toBe(0);
    expect(result.state).toMatchObject({
      userName: "Joana",
      sales: [realSale],
      expenses: [realExpense],
      metaAposentadoria: 700,
      poupancaAposentadoria: 130,
    });
  });

  it("keeps custom products and accepts shrimp sold by the liter", () => {
    const shrimpSale: Sale = {
      ...realSale,
      id: "s-shrimp",
      category: "camarao",
      customProduct: "Siri",
      unit: "litro",
    };
    const result = migrateStoredState(
      storedState({
        sales: [shrimpSale],
        metaAposentadoria: 700,
        poupancaAposentadoria: 130,
      })
    );

    expect(result.state.sales).toEqual([shrimpSale]);
    expect(result.discarded).toBe(0);
  });

  it("backs up invalid JSON without changing the primary value", () => {
    const raw = "{json inválido";
    const values = new Map([[STORAGE_KEY, raw]]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    const result = migrateStoredState(raw);
    backupCorruptedStoredState(raw, storage);

    expect(result.ok).toBe(false);
    expect(result.discarded).toBe(0);
    expect(result.state.sales).toEqual([]);
    expect(values.get(STORAGE_KEY)).toBe(raw);
    expect(values.get(STORAGE_BACKUP_KEY)).toBe(raw);
  });

  it("backs up the original data when invalid transactions are discarded", () => {
    const raw = storedState({
      sales: [{ ...realSale, value: "inválido" }],
    });
    const values = new Map([[STORAGE_KEY, raw]]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    const result = migrateStoredState(raw);
    if (!result.ok || result.discarded > 0) {
      backupCorruptedStoredState(raw, storage);
    }

    expect(result.ok).toBe(true);
    expect(result.discarded).toBe(1);
    expect(values.get(STORAGE_KEY)).toBe(raw);
    expect(values.get(STORAGE_BACKUP_KEY)).toBe(raw);
  });

  it("does not persist after a failed initial read until the user changes state", () => {
    expect(shouldPersistStoredState(false, false)).toBe(false);
    expect(shouldPersistStoredState(false, true)).toBe(true);
  });

  it("does not rewrite a successful initial read unless the user changes state", () => {
    expect(shouldPersistStoredState(null, true)).toBe(false);
    expect(shouldPersistStoredState(true, false)).toBe(false);
    expect(shouldPersistStoredState(true, true)).toBe(true);
  });

  it("does not overwrite an existing backup", () => {
    const values = new Map([
      [STORAGE_BACKUP_KEY, "backup anterior"],
    ]);
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    backupCorruptedStoredState("{json inválido", storage);

    expect(values.get(STORAGE_BACKUP_KEY)).toBe("backup anterior");
  });

  it("rejects storage with a missing sales array", () => {
    const withoutSales = JSON.parse(storedState({ sales: [realSale] })) as Record<
      string,
      unknown
    >;
    delete withoutSales.sales;

    const result = migrateStoredState(JSON.stringify(withoutSales));

    expect(result.ok).toBe(false);
    expect(result.discarded).toBe(0);
    expect(result.state.sales).toEqual([]);
    expect(result.state.expenses).toEqual([]);
  });

  it("drops an invalid transaction but retains valid transactions", () => {
    const invalidSale = { ...realSale, value: "invalid" };
    const invalidDateSale = { ...realSale, id: "s-invalid-date", date: "2026-02-30" };
    const result = migrateStoredState(
      storedState({ sales: [invalidSale, invalidDateSale, realSale] })
    );

    expect(result.ok).toBe(true);
    expect(result.discarded).toBe(2);
    expect(result.state.sales).toEqual([realSale]);
  });
});
