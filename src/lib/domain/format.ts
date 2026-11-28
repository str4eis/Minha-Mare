import { getCurrentMonth, isoToDateInput } from "./period";
import type { Sale } from "./types";

export function formatSaleUnit(unit: Sale["unit"], quantity = 1): string {
  const unitLabel =
    unit === "dz"
      ? "dúzia"
      : unit === "kg"
        ? "quilo"
        : unit === "litro"
          ? "litro"
          : "bacia";
  if (quantity === 1) return unitLabel;
  return unit === "dz" ? "dúzias" : `${unitLabel}s`;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatMoneyInput(input: string): string {
  const digits = input.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";

  const padded = digits.padStart(3, "0");
  const whole = padded
    .slice(0, -2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${whole},${padded.slice(-2)}`;
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

export function parseMoneyInput(input: string, allowZero = false): number | null {
  let normalized = input.trim();
  if (normalized.includes(",")) {
    if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,2}$/.test(normalized)) {
      return null;
    }
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0 || (!allowZero && value === 0)) {
    return null;
  }

  return Math.round(value * 100) / 100;
}
