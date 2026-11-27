import { describe, expect, it } from "vitest";
import {
  isSeedExpense,
  isSeedSale,
  parseLocalImport,
} from "./local-import";

const seededSale = {
  id: "s1",
  category: "peixe",
  buyer: "Restaurante do Mar",
  quantity: 4,
  unit: "kg",
  value: 120,
  date: "2026-02-10T12:00:00.000Z",
};

const realSale = {
  ...seededSale,
  id: "s1770000000000",
};

const seededExpense = {
  id: "e3",
  kind: "pesca",
  category: "gelo",
  description: "Gelo para conservação",
  value: 90,
  date: "2026-02-10T12:00:00.000Z",
};

const realExpense = {
  ...seededExpense,
  id: "e1770000000000",
};

describe("parseLocalImport", () => {
  it("ignores legacy examples by ID without excluding real data with the same text", () => {
    expect(isSeedSale(seededSale)).toBe(true);
    expect(isSeedExpense(seededExpense)).toBe(true);
    const result = parseLocalImport(
      JSON.stringify({
        sales: [seededSale, realSale],
        expenses: [seededExpense, realExpense],
      })
    );

    expect(result).toMatchObject({
      sales: [{ buyer: "Restaurante do Mar" }],
      expenses: [{ description: "Gelo para conservação" }],
      ignoredCount: 0,
      candidateCount: 2,
    });
  });

  it("skips invalid values, categories, units, kinds, and dates", () => {
    const result = parseLocalImport(
      JSON.stringify({
        sales: [
          realSale,
          { ...realSale, id: "bad-value", value: Number.NaN },
          { ...realSale, id: "bad-category", category: "Peixe" },
          { ...realSale, id: "bad-unit", unit: "un" },
          { ...realSale, id: "bad-date", date: "2026-02-30" },
        ],
        expenses: [
          realExpense,
          { ...realExpense, id: "bad-kind", kind: "outros" },
          { ...realExpense, id: "bad-category", category: "saude" },
          { ...realExpense, id: "bad-value", value: 0 },
          { ...realExpense, id: "bad-date", date: "not-a-date" },
        ],
      })
    );

    expect(result?.sales).toHaveLength(1);
    expect(result?.expenses).toHaveLength(1);
    expect(result?.ignoredCount).toBe(8);
    expect(result?.candidateCount).toBe(10);
  });

  it("ignores malformed JSON and unexpected structures", () => {
    expect(parseLocalImport("{")).toBeNull();
    expect(parseLocalImport(JSON.stringify({ sales: [] }))).toBeNull();
  });

  it("returns no import candidates when the old seed is the only content", () => {
    const result = parseLocalImport(
      JSON.stringify({ sales: [seededSale], expenses: [seededExpense] })
    );

    expect(result?.candidateCount).toBe(0);
    expect(result?.sales).toEqual([]);
    expect(result?.expenses).toEqual([]);
  });
});
