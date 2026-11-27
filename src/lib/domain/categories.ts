import {
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
  outros: { label: "Outro" },
};

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
