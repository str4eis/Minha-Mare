"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { currentMonthLabel } from "@/lib/format";
import { getCurrentMonth } from "@/lib/period";

export default function MonthPicker() {
  const { selectedMonth, changeMonth } = useStore();
  const currentMonth = getCurrentMonth();
  const isCurrentMonth =
    selectedMonth.year === currentMonth.year &&
    selectedMonth.month === currentMonth.month;

  return (
    <div className="mx-5 mb-3 flex items-center justify-between rounded-xl2 bg-mare-card px-3 py-2">
      <button
        type="button"
        onClick={() => changeMonth(-1)}
        aria-label="Mês anterior"
        className="flex h-10 w-10 items-center justify-center rounded-full text-mare-purple hover:bg-mare-purpleLight"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-mare-slate">
          Mês selecionado
        </p>
        <p className="font-semibold text-mare-ink">
          {currentMonthLabel(selectedMonth.year, selectedMonth.month)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => changeMonth(1)}
        disabled={isCurrentMonth}
        aria-label="Próximo mês"
        className="flex h-10 w-10 items-center justify-center rounded-full text-mare-purple hover:bg-mare-purpleLight disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
