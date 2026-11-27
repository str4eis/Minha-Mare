import type { Expense, Sale } from "../types";
import type { Database } from "../supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type SaleInsert = Database["public"]["Tables"]["sales"]["Insert"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finitePositiveNumber(value: unknown): number | null {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function finiteNonNegativeNumber(value: unknown): number | null {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    return false;
  }
  const datePart = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!datePart) return false;
  const [, yearText, monthText, dayText] = datePart;
  const date = new Date(0);
  date.setUTCFullYear(Number(yearText), Number(monthText) - 1, Number(dayText));

  return (
    date.getUTCFullYear() === Number(yearText) &&
    date.getUTCMonth() === Number(monthText) - 1 &&
    date.getUTCDate() === Number(dayText)
  );
}

const saleCategories = new Set([
  "ostra",
  "caranguejo",
  "peixe",
  "marisco",
  "sururu",
  "outros",
]);
const fishingCategories = new Set([
  "combustivel",
  "transporte",
  "gelo",
  "equipamentos",
  "manutencao",
  "iscas",
  "outros",
]);
const homeCategories = new Set([
  "alimentacao",
  "moradia",
  "saude",
  "educacao",
  "lazer",
  "outros",
]);

export function mapSaleRow(value: unknown): Sale {
  if (!isRecord(value)) throw new TypeError("Venda recebida em formato inválido.");
  const amount = finitePositiveNumber(value.value);
  const quantity = finitePositiveNumber(value.quantity);

  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    !saleCategories.has(String(value.category)) ||
    typeof value.buyer !== "string" ||
    quantity === null ||
    (value.unit !== "dz" && value.unit !== "kg") ||
    amount === null ||
    !validDate(value.occurred_at)
  ) {
    throw new TypeError("Venda recebida com campos inválidos.");
  }

  return {
    id: value.id,
    category: value.category as Sale["category"],
    buyer: value.buyer,
    quantity,
    unit: value.unit,
    value: amount,
    date: value.occurred_at,
  };
}

export function mapExpenseRow(value: unknown): Expense {
  if (!isRecord(value)) throw new TypeError("Gasto recebido em formato inválido.");
  const amount = finitePositiveNumber(value.value);
  const kind =
    value.kind === "pesca" || value.kind === "casa" ? value.kind : null;
  const categorySet =
    kind === "pesca"
      ? fishingCategories
      : kind === "casa"
        ? homeCategories
        : null;

  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    kind === null ||
    categorySet === null ||
    typeof value.category !== "string" ||
    !categorySet.has(value.category) ||
    typeof value.description !== "string" ||
    amount === null ||
    !validDate(value.occurred_at)
  ) {
    throw new TypeError("Gasto recebido com campos inválidos.");
  }

  return {
    id: value.id,
    kind,
    category: value.category as Expense["category"],
    description: value.description,
    value: amount,
    date: value.occurred_at,
  };
}

export function mapProfileRow(value: unknown): Pick<
  ProfileRow,
  "id" | "full_name" | "retirement_goal" | "retirement_saved"
> {
  if (!isRecord(value)) throw new TypeError("Perfil recebido em formato inválido.");
  const retirementGoal = finiteNonNegativeNumber(value.retirement_goal);
  const retirementSaved = finiteNonNegativeNumber(value.retirement_saved);
  if (
    typeof value.id !== "string" ||
    typeof value.full_name !== "string" ||
    retirementGoal === null ||
    retirementSaved === null
  ) {
    throw new TypeError("Perfil recebido com campos inválidos.");
  }

  return {
    id: value.id,
    full_name: value.full_name,
    retirement_goal: retirementGoal,
    retirement_saved: retirementSaved,
  };
}

export function toSaleInsert(sale: Omit<Sale, "id">): SaleInsert {
  return {
    category: sale.category,
    buyer: sale.buyer,
    quantity: sale.quantity,
    unit: sale.unit,
    value: sale.value,
    occurred_at: sale.date,
  };
}

export function toExpenseInsert(expense: Omit<Expense, "id">): ExpenseInsert {
  return {
    kind: expense.kind,
    category: expense.category,
    description: expense.description,
    value: expense.value,
    occurred_at: expense.date,
  };
}
