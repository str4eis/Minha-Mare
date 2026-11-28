import {
  AppState,
  Expense,
  ExpenseKind,
  FishingExpenseCategory,
  HomeExpenseCategory,
  Sale,
  SaleCategory,
} from "../domain/types";
import { defaultProductPrices } from "../domain/product-prices";

export const STORAGE_KEY = "minha-mare:v1";
export const STORAGE_BACKUP_KEY = "minha-mare:v1:backup";

export function createEmptyAppState(): AppState {
  return {
    userName: "",
    onboarded: false,
    sales: [],
    expenses: [],
    productPrices: [...defaultProductPrices],
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
  "camarao",
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
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    return false;
  }

  const datePart = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!datePart) return true;

  const [, yearText, monthText, dayText] = datePart;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    year >= 1 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function migrateSale(value: unknown): Sale | null {
  if (!isRecord(value)) return null;
  const customProduct = value.customProduct ?? null;
  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    typeof value.category !== "string" ||
    !SALE_CATEGORIES.has(value.category as SaleCategory) ||
    typeof value.buyer !== "string" ||
    !isPositiveFiniteNumber(value.quantity) ||
    (value.unit !== "dz" && value.unit !== "kg" && value.unit !== "litro") ||
    (customProduct !== null && typeof customProduct !== "string") ||
    !isPositiveFiniteNumber(value.value) ||
    !isValidDate(value.date)
  ) {
    return null;
  }

  return {
    id: value.id,
    category: value.category as SaleCategory,
    customProduct,
    buyer: value.buyer,
    quantity: value.quantity,
    unit: value.unit,
    value: value.value,
    date: value.date,
  };
}

function migrateExpense(value: unknown): Expense | null {
  if (!isRecord(value)) return null;
  const customDescription = value.customDescription ?? null;
  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    (value.kind !== "pesca" && value.kind !== "casa") ||
    typeof value.category !== "string" ||
    (customDescription !== null && typeof customDescription !== "string") ||
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
    customDescription,
    description: value.description,
    value: value.value,
    date: value.date,
  };
}

export function migrateStoredState(
  raw: string | null
): { state: AppState; ok: boolean; discarded: number } {
  if (raw === null) {
    return { state: createEmptyAppState(), ok: true, discarded: 0 };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { state: createEmptyAppState(), ok: false, discarded: 0 };
  }

  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.sales) ||
    !Array.isArray(parsed.expenses) ||
    typeof parsed.userName !== "string" ||
    typeof parsed.onboarded !== "boolean"
  ) {
    return { state: createEmptyAppState(), ok: false, discarded: 0 };
  }

  const migratedSales = parsed.sales.map(migrateSale);
  const migratedExpenses = parsed.expenses.map(migrateExpense);
  const discarded =
    migratedSales.filter((sale) => sale === null).length +
    migratedExpenses.filter((expense) => expense === null).length;
  const sales = migratedSales
    .filter((sale): sale is Sale => sale !== null)
    .filter((sale) => !DEMO_SALE_IDS.has(sale.id));
  const expenses = migratedExpenses
    .filter((expense): expense is Expense => expense !== null)
    .filter((expense) => !DEMO_EXPENSE_IDS.has(expense.id));

  return {
    state: {
      userName: parsed.userName === "Maria da Maré" ? "" : parsed.userName,
      onboarded: parsed.onboarded,
      sales,
      expenses,
      productPrices: [...defaultProductPrices],
    },
    ok: true,
    discarded,
  };
}

export function shouldPersistStoredState(
  initialReadOk: boolean | null,
  hasUserChanges: boolean
): boolean {
  return initialReadOk !== null && hasUserChanges;
}

export function backupCorruptedStoredState(
  raw: string | null,
  storage: Pick<Storage, "getItem" | "setItem">
): void {
  if (raw === null || storage.getItem(STORAGE_BACKUP_KEY) !== null) return;
  storage.setItem(STORAGE_BACKUP_KEY, raw);
}
