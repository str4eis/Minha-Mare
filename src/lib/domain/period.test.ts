import { describe, expect, it } from "vitest";
import {
  computeTotals,
  dateInputToISO,
  filterByMonth,
  getMonthRange,
  isoToDateInput,
} from "./period";
import { Expense, Sale } from "./types";

describe("getMonthRange", () => {
  it("uses Recife local midnight across a year boundary", () => {
    expect(getMonthRange(2025, 12)).toEqual({
      start: "2025-12-01T03:00:00.000Z",
      end: "2026-01-01T03:00:00.000Z",
    });
  });

  it("calculates the first month of the year", () => {
    expect(getMonthRange(2026, 1)).toEqual({
      start: "2026-01-01T03:00:00.000Z",
      end: "2026-02-01T03:00:00.000Z",
    });
  });

  it("includes 23:59:59 on the last day in Recife", () => {
    const item = { date: "2026-01-01T02:59:59.000Z" };

    expect(filterByMonth([item], 2025, 12)).toEqual([item]);
  });

  it("excludes midnight on the first day of the next month", () => {
    const item = { date: "2026-01-01T03:00:00.000Z" };

    expect(filterByMonth([item], 2025, 12)).toEqual([]);
  });

  it("rejects invalid months", () => {
    expect(() => getMonthRange(2025, 13)).toThrow(RangeError);
  });
});

describe("filterByMonth", () => {
  it("returns an empty list when there are no matching items", () => {
    expect(filterByMonth([{ date: "2025-11-30T12:00:00.000Z" }], 2025, 12)).toEqual([]);
  });

  it("ignores invalid dates without throwing", () => {
    const valid = { date: "2025-12-15T12:00:00.000Z" };
    const invalid = { date: "not-a-date" };

    expect(() => filterByMonth([valid, invalid], 2025, 12)).not.toThrow();
    expect(filterByMonth([valid, invalid], 2025, 12)).toEqual([valid]);
  });
});

describe("dateInputToISO", () => {
  const now = new Date("2026-02-10T14:37:45.000Z");

  it("preserves the current time when the selected date is today in Recife", () => {
    expect(dateInputToISO("2026-02-10", now)).toBe("2026-02-10T14:37:45.000Z");
  });

  it("uses noon in Recife for a past date", () => {
    expect(dateInputToISO("2026-02-09", now)).toBe("2026-02-09T15:00:00.000Z");
  });

  it("handles the first and last day of a month", () => {
    expect(dateInputToISO("2026-02-01", now)).toBe("2026-02-01T15:00:00.000Z");
    expect(dateInputToISO("2026-01-31", now)).toBe("2026-01-31T15:00:00.000Z");
  });

  it("rejects future dates, invalid formats, and nonexistent dates", () => {
    expect(() => dateInputToISO("2026-02-11", now)).toThrow(RangeError);
    expect(() => dateInputToISO("10/02/2026", now)).toThrow(RangeError);
    expect(() => dateInputToISO("2026-02-30", now)).toThrow(RangeError);
  });
});

describe("isoToDateInput", () => {
  it("formats the calendar date in Recife and round-trips past dates", () => {
    expect(isoToDateInput("2026-02-10T02:00:00.000Z")).toBe("2026-02-09");

    const iso = dateInputToISO("2026-02-09", new Date("2026-02-10T14:37:45.000Z"));
    expect(isoToDateInput(iso)).toBe("2026-02-09");
  });
});

describe("computeTotals", () => {
  it("sums monetary values in cents", () => {
    const makeSale = (value: number): Sale => ({
      id: `sale-${value}`,
      category: "peixe",
      customProduct: null,
      buyer: "Compradora",
      quantity: 1,
      unit: "kg",
      value,
      date: "2025-12-10T12:00:00.000Z",
    });
    const makeExpense = (kind: Expense["kind"], value: number): Expense => ({
      id: `expense-${kind}-${value}`,
      kind,
      category: kind === "pesca" ? "gelo" : "moradia",
      customDescription: null,
      description: "Despesa",
      value,
      date: "2025-12-10T12:00:00.000Z",
    });

    expect(
      computeTotals(
        [makeSale(0.1), makeSale(0.2)],
        [makeExpense("pesca", 0.1), makeExpense("casa", 0.2)]
      )
    ).toEqual({
      totalVendido: 0.3,
      totalGastosPesca: 0.1,
      totalGastosCasa: 0.2,
      totalGastos: 0.3,
      resultado: 0,
    });
  });

  it("returns zeroed totals with no entries", () => {
    expect(computeTotals([], [])).toEqual({
      totalVendido: 0,
      totalGastosPesca: 0,
      totalGastosCasa: 0,
      totalGastos: 0,
      resultado: 0,
    });
  });
});
