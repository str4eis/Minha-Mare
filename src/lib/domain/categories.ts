import {
  ExpenseKind,
  FishingExpenseCategory,
  HomeExpenseCategory,
  SaleCategory,
} from "./types";

export const saleCategoryMeta: Record<SaleCategory, { label: string }> = {
  ostra: { label: "Ostra" },
  caranguejo: { label: "Caranguejo" },
  peixe: { label: "Peixe" },
  marisco: { label: "Marisco" },
  sururu: { label: "Sururu" },
  camarao: { label: "Camarão" },
  siri: { label: "Siri" },
  outros: { label: "Outro" },
};

export function getSaleProductLabel(
  category: SaleCategory,
  customProduct: string | null = null
): string {
  const label = saleCategoryMeta[category].label;
  const productName = customProduct?.trim();
  return category === "outros" && productName
    ? `${label} — ${productName}`
    : label;
}

export function getExpenseCategoryLabel(
  kind: ExpenseKind,
  category: FishingExpenseCategory | HomeExpenseCategory,
  customDescription: string | null = null
): string {
  const categories = kind === "pesca" ? fishingExpenseMeta : homeExpenseMeta;
  const label =
    categories[category as keyof typeof categories]?.label ?? category;
  const details = customDescription?.trim();
  return category === "outros" && details
    ? `${label} — ${details}`
    : label;
}

export const fishingExpenseMeta: Record<
  FishingExpenseCategory,
  { label: string }
> = {
  combustivel: { label: "Combustível" },
  transporte: { label: "Transporte" },
  gelo: { label: "Gelo" },
  equipamentos: { label: "Material de pesca" },
  manutencao: { label: "Conserto" },
  iscas: { label: "Isca" },
  outros: { label: "Outro" },
};

export const homeExpenseMeta: Record<
  HomeExpenseCategory,
  { label: string }
> = {
  alimentacao: { label: "Alimentação" },
  moradia: { label: "Contas de casa" },
  saude: { label: "Saúde" },
  educacao: { label: "Educação" },
  lazer: { label: "Lazer" },
  outros: { label: "Outro" },
};
