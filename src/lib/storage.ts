import {
  AppState,
  Expense,
  ExpenseKind,
  FishingExpenseCategory,
  HomeExpenseCategory,
  Sale,
  SaleCategory,
} from "./types";

export const STORAGE_KEY = "minha-mare:v1";
export const STORAGE_BACKUP_KEY = "minha-mare:v1:backup";

export function createEmptyAppState(): AppState {
  return {
    userName: "",
    onboarded: false,
    sales: [],
    expenses: [],
    metaAposentadoria: 0,
    poupancaAposentadoria: 0,
  };
}

const DEMO_SALE_IDS = new Set(["s1", "s2", "s3", "s4", "s5"]);
const DEMO_EXPENSE_IDS = new Set(["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9"]);
const SALE_CATEGORIES = new Set<SaleCategory>([
  "ostra",
  "caranguejo",
  "peixe",
  "marisco",
  "sururu",
  "outros",
]);
const FISHING_EXPENSE_CATEGORIES = new Set<FishingExpenseCategory>([
  "combustivel",
  "transporte",
  "gelo",
  "equipamentos",
  "manutencao",
  "iscas",
  "outros",
]);
const HOME_EXPENSE_CATEGORIES = new Set<HomeExpenseCategory>([
  "alimentacao",
  "moradia",
  "saude",
  "educacao",
  "lazer",
  "outros",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function migrateSale(value: unknown): Sale | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    typeof value.category !== "string" ||
    !SALE_CATEGORIES.has(value.category as SaleCategory) ||
    typeof value.buyer !== "string" ||
    !isPositiveFiniteNumber(value.quantity) ||
    (value.unit !== "dz" && value.unit !== "kg") ||
    !isPositiveFiniteNumber(value.value) ||
    !isValidDate(value.date)
  ) {
    return null;
  }

  return {
    id: value.id,
    category: value.category as SaleCategory,
    buyer: value.buyer,
    quantity: value.quantity,
    unit: value.unit,
    value: value.value,
    date: value.date,
  };
}

function migrateExpense(value: unknown): Expense | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    (value.kind !== "pesca" && value.kind !== "casa") ||
    typeof value.category !== "string" ||
    typeof value.description !== "string" ||
    !isPositiveFiniteNumber(value.value) ||
    !isValidDate(value.date)
  ) {
    return null;
  }

  const kind = value.kind as ExpenseKind;
  const validCategory =
    kind === "pesca"
      ? FISHING_EXPENSE_CATEGORIES.has(value.category as FishingExpenseCategory)
      : HOME_EXPENSE_CATEGORIES.has(value.category as HomeExpenseCategory);
  if (!validCategory) return null;

  return {
    id: value.id,
    kind,
    category: value.category as Expense["category"],
    description: value.description,
    value: value.value,
    date: value.date,
  };
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function migrateStoredState(
  raw: string | null
): { state: AppState; ok: boolean } {
  if (raw === null) return { state: createEmptyAppState(), ok: true };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { state: createEmptyAppState(), ok: false };
  }

  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.sales) ||
    !Array.isArray(parsed.expenses) ||
    typeof parsed.userName !== "string" ||
    typeof parsed.onboarded !== "boolean" ||
    !isNonNegativeFiniteNumber(parsed.metaAposentadoria) ||
    !isNonNegativeFiniteNumber(parsed.poupancaAposentadoria)
  ) {
    return { state: createEmptyAppState(), ok: false };
  }

  const sales = parsed.sales
    .map(migrateSale)
    .filter((sale): sale is Sale => sale !== null)
    .filter((sale) => !DEMO_SALE_IDS.has(sale.id));
  const expenses = parsed.expenses
    .map(migrateExpense)
    .filter((expense): expense is Expense => expense !== null)
    .filter((expense) => !DEMO_EXPENSE_IDS.has(expense.id));

  return {
    state: {
      userName: parsed.userName === "Maria da Maré" ? "" : parsed.userName,
      onboarded: parsed.onboarded,
      sales,
      expenses,
      metaAposentadoria:
        parsed.metaAposentadoria === 500 ? 0 : parsed.metaAposentadoria,
      poupancaAposentadoria:
        parsed.poupancaAposentadoria === 225 ? 0 : parsed.poupancaAposentadoria,
    },
    ok: true,
  };
}

export function backupCorruptedStoredState(
  raw: string | null,
  storage: Pick<Storage, "getItem" | "setItem">
): void {
  if (raw === null || storage.getItem(STORAGE_BACKUP_KEY) !== null) return;
  storage.setItem(STORAGE_BACKUP_KEY, raw);
}
