import { Expense, Sale } from "./types";

const TIME_ZONE = "America/Recife";

export interface SelectedMonth {
  year: number;
  month: number;
}

function utcTimestamp(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0
): number {
  const date = new Date(0);
  date.setUTCHours(hour, minute, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getTime();
}

function localDateTimeAsUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  const utcGuess = utcTimestamp(year, month, day, hour, minute);
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
    Number(values.day),
    Number(values.hour),
    Number(values.minute)
  ) +
    Number(values.second) * 1000;
  const offset = representedAsUtc - utcGuess;

  return new Date(utcGuess - offset);
}

function localMidnightAsUtc(year: number, month: number): Date {
  return localDateTimeAsUtc(year, month, 1, 0, 0);
}

function dateInputInRecife(date: Date): string {
  if (!Number.isFinite(date.getTime())) {
    throw new RangeError("A data informada é inválida.");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year.padStart(4, "0")}-${values.month}-${values.day}`;
}

function parseDateInput(value: string): {
  year: number;
  month: number;
  day: number;
} {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new RangeError("Use uma data válida no formato AAAA-MM-DD.");

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const timestamp = utcTimestamp(year, month, day);
  const check = new Date(timestamp);

  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new RangeError("A data informada não existe.");
  }

  return { year, month, day };
}

export function dateInputToISO(yyyyMmDd: string, now = new Date()): string {
  const selected = parseDateInput(yyyyMmDd);
  const today = dateInputInRecife(now);

  if (yyyyMmDd > today) {
    throw new RangeError("A data não pode estar no futuro.");
  }

  return yyyyMmDd === today
    ? now.toISOString()
    : localDateTimeAsUtc(selected.year, selected.month, selected.day, 12, 0).toISOString();
}

export function isoToDateInput(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) {
    throw new RangeError("A data informada é inválida.");
  }
  return dateInputInRecife(date);
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
