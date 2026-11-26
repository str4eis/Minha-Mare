import { Expense, Sale } from "./types";

const TIME_ZONE = "America/Recife";

export interface SelectedMonth {
  year: number;
  month: number;
}

function utcTimestamp(year: number, month: number, day: number): number {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getTime();
}

function localMidnightAsUtc(year: number, month: number): Date {
  const utcGuess = utcTimestamp(year, month, 1);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(new Date(utcGuess));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const representedAsUtc = utcTimestamp(
    Number(values.year),
    Number(values.month),
    Number(values.day)
  ) +
    Number(values.hour) * 60 * 60 * 1000 +
    Number(values.minute) * 60 * 1000 +
    Number(values.second) * 1000;
  const offset = representedAsUtc - utcGuess;

  return new Date(utcGuess - offset);
}

export function getMonthRange(
  year: number,
  month: number
): { start: string; end: string } {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9998 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new RangeError("Ano ou mês inválido.");
  }

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return {
    start: localMidnightAsUtc(year, month).toISOString(),
    end: localMidnightAsUtc(nextYear, nextMonth).toISOString(),
  };
}

export function getCurrentMonth(now = new Date()): SelectedMonth {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
  };
}

export function filterByMonth<T extends { date: string }>(
  items: T[],
  year: number,
  month: number
): T[] {
  const { start, end } = getMonthRange(year, month);
  const startTime = Date.parse(start);
  const endTime = Date.parse(end);

  return items.filter((item) => {
    const itemTime = Date.parse(item.date);
    return Number.isFinite(itemTime) && itemTime >= startTime && itemTime < endTime;
  });
}

function sumAsCents(values: number[]): number {
  return values.reduce((total, value) => total + Math.round(value * 100), 0);
}

export function computeTotals(
  sales: Sale[],
  expenses: Expense[]
): {
  totalVendido: number;
  totalGastosPesca: number;
  totalGastosCasa: number;
  totalGastos: number;
  resultado: number;
} {
  const totalVendido = sumAsCents(sales.map((sale) => sale.value)) / 100;
  const totalGastosPesca =
    sumAsCents(
      expenses.filter((expense) => expense.kind === "pesca").map((expense) => expense.value)
    ) / 100;
  const totalGastosCasa =
    sumAsCents(
      expenses.filter((expense) => expense.kind === "casa").map((expense) => expense.value)
    ) / 100;
  const totalGastos = Math.round((totalGastosPesca + totalGastosCasa) * 100) / 100;
  const resultado = Math.round((totalVendido - totalGastos) * 100) / 100;

  return {
    totalVendido,
    totalGastosPesca,
    totalGastosCasa,
    totalGastos,
    resultado,
  };
}
