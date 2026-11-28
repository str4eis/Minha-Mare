export type SaleCategory =
  | "ostra"
  | "caranguejo"
  | "peixe"
  | "marisco"
  | "sururu"
  | "camarao"
  | "siri"
  | "outros";

export interface Sale {
  id: string;
  category: SaleCategory;
  customProduct: string | null;
  buyer: string;
  quantity: number;
  unit: "dz" | "kg" | "litro" | "bacia";
  value: number;
  date: string; // ISO string
}

export interface ProductPrice {
  id: string;
  name: string;
  unit: "kg" | "litro" | "bacia";
  pricePerUnit: number;
  isCustom: boolean;
}

export interface AppState {
  userName: string;
  onboarded: boolean;
  sales: Sale[];
  expenses: Expense[];
  productPrices: ProductPrice[];
}

export type ExpenseKind = "pesca" | "casa";

export type FishingExpenseCategory =
  | "combustivel"
  | "transporte"
  | "gelo"
  | "equipamentos"
  | "manutencao"
  | "iscas"
  | "outros";

export type HomeExpenseCategory =
  | "alimentacao"
  | "moradia"
  | "saude"
  | "educacao"
  | "lazer"
  | "outros";

export interface Expense {
  id: string;
  kind: ExpenseKind;
  category: FishingExpenseCategory | HomeExpenseCategory;
  customDescription: string | null;
  description: string;
  value: number;
  date: string; // ISO string
}

export interface AppState {
  userName: string;
  onboarded: boolean;
  sales: Sale[];
  expenses: Expense[];
}
