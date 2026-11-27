import type {
  Expense,
  ExpenseKind,
  FishingExpenseCategory,
  HomeExpenseCategory,
  Sale,
  SaleCategory,
} from "../domain/types";

export interface LocalImportData {
  sales: Array<Omit<Sale, "id">>;
  expenses: Array<Omit<Expense, "id">>;
  ignoredCount: number;
  candidateCount: number;
}

export function hasImportableLocalData(data: LocalImportData): boolean {
  return data.sales.length > 0 || data.expenses.length > 0;
}

const demoSaleIds = new Set(["s1", "s2", "s3", "s4", "s5"]);
const demoExpenseIds = new Set([
  "e1",
  "e2",
  "e3",
  "e4",
  "e5",
  "e6",
  "e7",
  "e8",
  "e9",
]);
const saleCategories = new Set<SaleCategory>([
  "ostra",
  "caranguejo",
  "peixe",
  "marisco",
  "sururu",
  "camarao",
  "outros",
]);
const fishingCategories = new Set<FishingExpenseCategory>([
  "combustivel",
  "transporte",
  "gelo",
  "equipamentos",
  "manutencao",
  "iscas",
  "outros",
]);
const homeCategories = new Set<HomeExpenseCategory>([
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

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    return false;
  }
  const datePart = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!datePart) return false;

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

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function isSeedSale(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && demoSaleIds.has(value.id);
}

export function isSeedExpense(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    demoExpenseIds.has(value.id)
  );
}

function parseSale(value: unknown): Omit<Sale, "id"> | null {
  const customProduct = isRecord(value)
    ? (value.customProduct ?? null)
    : null;
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    typeof value.category !== "string" ||
    !saleCategories.has(value.category as SaleCategory) ||
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
    category: value.category as SaleCategory,
    customProduct,
    buyer: value.buyer,
    quantity: value.quantity,
    unit: value.unit,
    value: value.value,
    date: value.date,
  };
}

function parseExpense(value: unknown): Omit<Expense, "id"> | null {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    (value.kind !== "pesca" && value.kind !== "casa") ||
    typeof value.category !== "string" ||
    typeof value.description !== "string" ||
    !isPositiveFiniteNumber(value.value) ||
    !isValidDate(value.date)
  ) {
    return null;
  }

  const kind = value.kind as ExpenseKind;
  const categoryIsValid =
    kind === "pesca"
      ? fishingCategories.has(value.category as FishingExpenseCategory)
      : homeCategories.has(value.category as HomeExpenseCategory);
  if (!categoryIsValid) return null;

  return {
    kind,
    category: value.category as Expense["category"],
    description: value.description,
    value: value.value,
    date: value.date,
  };
}

export function parseLocalImport(raw: string): LocalImportData | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed.sales) ||
    !Array.isArray(parsed.expenses)
  ) {
    return null;
  }

  const salesToCheck = parsed.sales.filter((sale) => !isSeedSale(sale));
  const expensesToCheck = parsed.expenses.filter(
    (expense) => !isSeedExpense(expense)
  );
  const sales = salesToCheck
    .map(parseSale)
    .filter((sale): sale is Omit<Sale, "id"> => sale !== null);
  const expenses = expensesToCheck
    .map(parseExpense)
    .filter((expense): expense is Omit<Expense, "id"> => expense !== null);

  return {
    sales,
    expenses,
    ignoredCount:
      salesToCheck.length -
      sales.length +
      expensesToCheck.length -
      expenses.length,
    candidateCount: salesToCheck.length + expensesToCheck.length,
  };
}
