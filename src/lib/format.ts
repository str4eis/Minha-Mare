import { getCurrentMonth, isoToDateInput } from "./period";

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDateShort(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const isToday = isoToDateInput(iso) === isoToDateInput(now.toISOString());

  const time = d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Recife",
  });

  if (isToday) return `Hoje, ${time}`;

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Recife",
  });
}

export function currentMonthLabel(year?: number, month?: number): string {
  const selected = year === undefined || month === undefined
    ? getCurrentMonth()
    : { year, month };
  const date = new Date(Date.UTC(selected.year, selected.month - 1, 1));
  const label = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function parseMoneyInput(input: string): number | null {
  const normalized = input.trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(normalized)) return null;

  const value = Number(normalized.replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return null;

  return Math.round(value * 100) / 100;
}
