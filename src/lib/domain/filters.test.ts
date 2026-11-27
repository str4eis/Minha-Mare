import { describe, expect, it } from "vitest";
import { filterItems } from "./filters";
import { Expense } from "./types";

const expenses: Expense[] = [
  {
    id: "e1",
    kind: "pesca",
    category: "combustivel",
    customDescription: null,
    description: "Gasolina do barco",
    value: 80,
    date: "2026-02-10T15:00:00.000Z",
  },
  {
    id: "e2",
    kind: "pesca",
    category: "gelo",
    customDescription: null,
    description: "Gelo para o pescado",
    value: 15,
    date: "2026-02-12T15:00:00.000Z",
  },
  {
    id: "e3",
    kind: "casa",
    category: "alimentacao",
    customDescription: null,
    description: "Feira da semana",
    value: 40,
    date: "2026-02-14T15:00:00.000Z",
  },
  {
    id: "e4",
    kind: "pesca",
    category: "combustivel",
    customDescription: null,
    description: "Gasolina antiga",
    value: 60,
    date: "2026-01-10T15:00:00.000Z",
  },
];

const description = (expense: Expense) => expense.description;

describe("filterItems", () => {
  it("searches without case or accent sensitivity", () => {
    expect(
      filterItems(expenses, 2026, 2, {
        query: "GELÔ PARA O PESCÁDO",
        getSearchText: description,
      }).map((expense) => expense.id)
    ).toEqual(["e2"]);
  });

  it("filters by category", () => {
    expect(
      filterItems(expenses, 2026, 2, {
        category: "gelo",
        getSearchText: description,
      }).map((expense) => expense.id)
    ).toEqual(["e2"]);
  });

  it("filters by selected month", () => {
    expect(
      filterItems(expenses, 2026, 2, {
        getSearchText: description,
      }).map((expense) => expense.id)
    ).toEqual(["e1", "e2", "e3"]);
  });

  it("combines month, category, and search filters", () => {
    expect(
      filterItems(expenses, 2026, 2, {
        query: "gasolina",
        category: "combustivel",
        getSearchText: description,
      }).map((expense) => expense.id)
    ).toEqual(["e1"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(
      filterItems(expenses, 2026, 2, {
        query: "inexistente",
        getSearchText: description,
      })
    ).toEqual([]);
    expect(
      filterItems([], 2026, 2, {
        getSearchText: description,
      })
    ).toEqual([]);
  });
});
