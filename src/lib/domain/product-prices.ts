import type { ProductPrice, Sale, SaleCategory } from "./types";
import { saleCategoryMeta } from "./categories";

export const defaultProductPrices: ProductPrice[] = [
  { id: "prod-marisco", name: "Marisco", unit: "kg", pricePerUnit: 0, isCustom: false },
  { id: "prod-camarao", name: "Camarão", unit: "kg", pricePerUnit: 0, isCustom: false },
  { id: "prod-sururu", name: "Sururu", unit: "kg", pricePerUnit: 0, isCustom: false },
  { id: "prod-ostra", name: "Ostra", unit: "kg", pricePerUnit: 0, isCustom: false },
  { id: "prod-siri", name: "Siri", unit: "kg", pricePerUnit: 0, isCustom: false },
];

export function newCustomProductPrice(
  name: string,
  unit: ProductPrice["unit"],
  pricePerUnit: number
): ProductPrice {
  return {
    id: `custom-${crypto.randomUUID()}`,
    name: name.trim(),
    unit,
    pricePerUnit,
    isCustom: true,
  };
}

export function findProductPrice(
  productPrices: ProductPrice[],
  category: SaleCategory,
  customProduct: string | null
): ProductPrice | null {
  const name =
    category === "outros"
      ? customProduct?.trim() ?? null
      : saleCategoryMeta[category]?.label ?? null;
  if (!name) return null;
  return (
    productPrices.find((price) => price.name.toLowerCase() === name.toLowerCase()) ??
    null
  );
}

export function productPriceToSaleFields(
  price: ProductPrice
): { category: SaleCategory; customProduct: string | null } {
  if (price.isCustom) {
    return { category: "outros", customProduct: price.name };
  }
  for (const [cat, meta] of Object.entries(saleCategoryMeta)) {
    if (meta.label === price.name) {
      return { category: cat as SaleCategory, customProduct: null };
    }
  }
  return { category: "outros", customProduct: price.name };
}

export function totalForQuantity(
  price: ProductPrice | null,
  quantity: number | null
): number | null {
  if (!price || price.pricePerUnit <= 0 || quantity === null) return null;
  return Math.round((price.pricePerUnit * quantity) * 100) / 100;
}
