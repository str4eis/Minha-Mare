import type { Sale, SaleCategory } from "./types";
export { formatSaleUnit } from "./format";

const defaultUnits: Record<SaleCategory, Sale["unit"]> = {
  ostra: "dz",
  caranguejo: "dz",
  sururu: "kg",
  marisco: "kg",
  peixe: "kg",
  camarao: "kg",
  outros: "kg",
};

export interface LastSalePriceSuggestion {
  pricePerUnit: number;
  unit: Sale["unit"];
}

export function getDefaultSaleUnit(category: SaleCategory): Sale["unit"] {
  return defaultUnits[category];
}

export function parseQuantityInput(input: string): number | null {
  const normalized = input.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,3})?$/.test(normalized)) return null;

  const quantity = Number(normalized);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : null;
}

export function formatQuantityInput(quantity: number): string {
  return Number(quantity.toFixed(3)).toString().replace(".", ",");
}

export function suggestLastSalePrice(
  sales: Sale[],
  category: SaleCategory
): LastSalePriceSuggestion | null {
  let latest: Sale | null = null;

  for (const sale of sales) {
    if (
      sale.category === category &&
      (!latest || Date.parse(sale.date) > Date.parse(latest.date))
    ) {
      latest = sale;
    }
  }

  if (!latest || latest.quantity <= 0) return null;

  return {
    pricePerUnit: Math.round((latest.value / latest.quantity) * 100) / 100,
    unit: latest.unit,
  };
}
