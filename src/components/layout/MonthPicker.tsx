"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { currentMonthLabel } from "@/lib/domain/format";
import { getCurrentMonth } from "@/lib/domain/period";

export default function MonthPicker() {
  const { hydrated, selectedMonth, changeMonth } = useStore();
  const currentMonth = hydrated ? getCurrentMonth() : null;
  const isCurrentMonth =
    currentMonth !== null &&
    selectedMonth.year === currentMonth.year &&
    selectedMonth.month === currentMonth.month;

  return (
    <div className="mt-3 rounded-xl2 bg-mare-card p-3">
      <div className="text-center">
        <p className="text-lg font-medium text-mare-slate">
          Mês escolhido
        </p>
        <p className="text-xl font-semibold text-mare-ink">
          {hydrated
            ? currentMonthLabel(selectedMonth.year, selectedMonth.month)
            : "—"}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          disabled={!hydrated}
          className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-2 text-lg font-semibold text-mare-purple disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          Anterior
        </button>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          disabled={!hydrated || isCurrentMonth}
          className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-2 text-lg font-semibold text-mare-purple disabled:cursor-not-allowed disabled:opacity-30"
        >
          Próximo
          <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
