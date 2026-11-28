import { describe, expect, it } from "vitest";
import {
  defaultProductPrices,
  findProductPrice,
  newCustomProductPrice,
  productPriceToSaleFields,
  totalForQuantity,
} from "./product-prices";
import type { ProductPrice, SaleCategory } from "./types";

describe("defaultProductPrices", () => {
  it("lists the five standard sea products", () => {
    const names = defaultProductPrices.map((p) => p.name);
    expect(names).toEqual(["Marisco", "Camarão", "Sururu", "Ostra", "Siri"]);
    for (const price of defaultProductPrices) {
      expect(price.isCustom).toBe(false);
      expect(["kg", "litro", "bacia"]).toContain(price.unit);
      expect(price.pricePerUnit).toBe(0);
    }
  });
});

describe("newCustomProductPrice", () => {
  it("creates a custom product with a unique id", () => {
    const a = newCustomProductPrice("Lula", "kg", 15);
    const b = newCustomProductPrice("Lula", "litro", 20);
    expect(a.isCustom).toBe(true);
    expect(a.name).toBe("Lula");
    expect(a.unit).toBe("kg");
    expect(a.pricePerUnit).toBe(15);
    expect(b.id).not.toBe(a.id);
  });
});

describe("findProductPrice", () => {
  const prices: ProductPrice[] = [
    ...defaultProductPrices,
    newCustomProductPrice("Lula", "litro", 20),
    newCustomProductPrice("Polvo", "kg", 30),
  ];

  it("finds a standard product by its sale category label", () => {
    expect(findProductPrice(prices, "ostra", null)?.name).toBe("Ostra");
    expect(findProductPrice(prices, "siri", null)?.name).toBe("Siri");
  });

  it("finds a custom product by its name when category is 'outros'", () => {
    expect(findProductPrice(prices, "outros", "Lula")?.name).toBe("Lula");
    expect(findProductPrice(prices, "outros", "polvo")?.name).toBe("Polvo");
  });

  it("is case insensitive", () => {
    expect(findProductPrice(prices, "outros", "LULA")?.name).toBe("Lula");
  });

  it("returns null when there is no match", () => {
    expect(findProductPrice(prices, "peixe", null)).toBeNull();
    expect(findProductPrice(prices, "outros", "Inexistente")).toBeNull();
  });
});

describe("totalForQuantity", () => {
  const price: ProductPrice = {
    id: "prod-x",
    name: "Camarão",
    unit: "kg",
    pricePerUnit: 40,
    isCustom: false,
  };

  it("calculates price per unit times quantity", () => {
    expect(totalForQuantity(price, 2)).toBe(80);
    expect(totalForQuantity(price, 1.5)).toBe(60);
    expect(totalForQuantity(price, 0.25)).toBe(10);
  });

  it("rounds to cents", () => {
    expect(totalForQuantity({ ...price, pricePerUnit: 13.333 }, 3)).toBe(40);
  });

  it("returns null when there is no usable price or quantity", () => {
    expect(totalForQuantity(null, 2)).toBeNull();
    expect(totalForQuantity({ ...price, pricePerUnit: 0 }, 2)).toBeNull();
    expect(totalForQuantity(price, null)).toBeNull();
  });
});

describe("productPriceToSaleFields", () => {
  it("maps custom products to category 'outros' with the name", () => {
    const custom = newCustomProductPrice("Lula", "kg", 20);
    expect(productPriceToSaleFields(custom)).toEqual({
      category: "outros",
      customProduct: "Lula",
    });
  });

  it("maps standard products to their sale category", () => {
    expect(productPriceToSaleFields(defaultProductPrices[3])).toEqual({
      category: "ostra",
      customProduct: null,
    });
    expect(productPriceToSaleFields(defaultProductPrices[4])).toEqual({
      category: "siri",
      customProduct: null,
    });
  });
});
