import { describe, expect, it } from "vitest";
import {
  formatQuantityInput,
  formatSaleUnit,
  getDefaultSaleUnit,
  parseQuantityInput,
  suggestLastSalePrice,
} from "./sale-entry";
import type { Sale } from "./types";

describe("getDefaultSaleUnit", () => {
  it.each([
    ["ostra", "dz", "dúzia"],
    ["caranguejo", "dz", "dúzia"],
    ["sururu", "kg", "quilo"],
    ["marisco", "kg", "quilo"],
    ["peixe", "kg", "quilo"],
    ["camarao", "kg", "quilo"],
    ["outros", "kg", "quilo"],
  ] as const)("uses %s as %s (%s)", (category, unit, label) => {
    expect(getDefaultSaleUnit(category)).toBe(unit);
    expect(formatSaleUnit(getDefaultSaleUnit(category))).toBe(label);
  });

  it("supports liters and plural unit names", () => {
    expect(formatSaleUnit("litro")).toBe("litro");
    expect(formatSaleUnit("litro", 2)).toBe("litros");
    expect(formatSaleUnit("dz", 2)).toBe("dúzias");
    expect(formatSaleUnit("kg", 2)).toBe("quilos");
  });
});

describe("suggestLastSalePrice", () => {
  const sales: Sale[] = [
    {
      id: "older-oyster",
      category: "ostra",
      customProduct: null,
      buyer: "Feira",
      quantity: 2,
      unit: "dz",
      value: 40,
      date: "2026-03-10T12:00:00.000Z",
    },
    {
      id: "newer-oyster",
      category: "ostra",
      customProduct: null,
      buyer: "Restaurante",
      quantity: 4,
      unit: "dz",
      value: 100,
      date: "2026-03-20T12:00:00.000Z",
    },
    {
      id: "fish",
      category: "peixe",
      customProduct: null,
      buyer: "Feira",
      quantity: 1,
      unit: "kg",
      value: 25,
      date: "2026-03-25T12:00:00.000Z",
    },
  ];

  it("uses the last price for the selected product, divided by its quantity", () => {
    expect(suggestLastSalePrice(sales, "ostra")).toEqual({
      pricePerUnit: 25,
      unit: "dz",
    });
  });

  describe("quantity input helpers", () => {
    it("accepts up to three decimal places with comma or point", () => {
      expect(parseQuantityInput("1,25")).toBe(1.25);
      expect(parseQuantityInput("0.125")).toBe(0.125);
      expect(parseQuantityInput("1.2345")).toBeNull();
      expect(parseQuantityInput("0")).toBeNull();
    });

    it("formats quantities for Brazilian input", () => {
      expect(formatQuantityInput(1.25)).toBe("1,25");
    });
  });

  it("returns no suggestion when the product has no history", () => {
    expect(suggestLastSalePrice(sales, "sururu")).toBeNull();
  });
});
