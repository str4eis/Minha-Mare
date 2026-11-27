import { AppState, Expense, Sale } from "./types";

export type SaleUpdate = Omit<Sale, "id">;
export type ExpenseUpdate = Omit<Expense, "id">;

function isValidDate(value: string): boolean {
  if (!Number.isFinite(Date.parse(value))) return false;

  const datePart = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!datePart) return true;

  const [, yearText, monthText, dayText] = datePart;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateValue(value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError("O valor precisa ser um número maior que zero.");
  }
}

function validateSale(sale: SaleUpdate): void {
  validateValue(sale.value);
  if (!Number.isFinite(sale.quantity) || sale.quantity <= 0) {
    throw new RangeError("A quantidade precisa ser um número maior que zero.");
  }
  if (!isValidDate(sale.date)) {
    throw new RangeError("A data do lançamento é inválida.");
  }
}

function validateExpense(expense: ExpenseUpdate): void {
  validateValue(expense.value);
  if (!isValidDate(expense.date)) {
    throw new RangeError("A data do lançamento é inválida.");
  }
}

export function addSale(state: AppState, sale: Sale): AppState {
  validateSale(sale);
  return { ...state, sales: [sale, ...state.sales] };
}

export function updateSale(
  state: AppState,
  id: string,
  sale: SaleUpdate
): AppState {
  if (!state.sales.some((item) => item.id === id)) return state;
  validateSale(sale);

  return {
    ...state,
    sales: state.sales.map((item) => (item.id === id ? { ...sale, id } : item)),
  };
}

export function deleteSale(state: AppState, id: string): AppState {
  if (!state.sales.some((item) => item.id === id)) return state;
  return { ...state, sales: state.sales.filter((item) => item.id !== id) };
}

export function addExpense(state: AppState, expense: Expense): AppState {
  validateExpense(expense);
  return { ...state, expenses: [expense, ...state.expenses] };
}

export function updateExpense(
  state: AppState,
  id: string,
  expense: ExpenseUpdate
): AppState {
  if (!state.expenses.some((item) => item.id === id)) return state;
  validateExpense(expense);

  return {
    ...state,
    expenses: state.expenses.map((item) =>
      item.id === id ? { ...expense, id } : item
    ),
  };
}

export function deleteExpense(state: AppState, id: string): AppState {
  if (!state.expenses.some((item) => item.id === id)) return state;
  return { ...state, expenses: state.expenses.filter((item) => item.id !== id) };
}
