export type SaleCategory =
  | "ostra"
  | "caranguejo"
  | "peixe"
  | "marisco"
  | "sururu"
  | "camarao"
  | "outros";

export interface Sale {
  id: string;
  category: SaleCategory;
  customProduct: string | null;
  buyer: string;
  quantity: number;
  unit: "dz" | "kg" | "litro";
  value: number;
  date: string; // ISO string
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
  metaAposentadoria: number;
  poupancaAposentadoria: number;
}
