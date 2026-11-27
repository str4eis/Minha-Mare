"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { useStore } from "@/lib/store";
import { fishingExpenseMeta, homeExpenseMeta } from "@/lib/categories";
import {
  Expense,
  ExpenseKind,
  FishingExpenseCategory,
  HomeExpenseCategory,
} from "@/lib/types";
import { cn } from "@/lib/cn";
import { dateInputToISO, isoToDateInput } from "@/lib/period";
import { parseMoneyInput } from "@/lib/format";

type ExpenseCategory = FishingExpenseCategory | HomeExpenseCategory;

interface ExpenseFormProps {
  expense?: Expense;
  kind?: ExpenseKind;
  initialCategory?: ExpenseCategory;
}

export default function ExpenseForm({
  expense,
  kind: requestedKind = "pesca",
  initialCategory,
}: ExpenseFormProps) {
  const router = useRouter();
  const { addExpense, updateExpense } = useStore();
  const kind = expense?.kind ?? requestedKind;
  const meta = kind === "pesca" ? fishingExpenseMeta : homeExpenseMeta;
  const categories = Object.keys(meta) as ExpenseCategory[];
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category ?? initialCategory ?? categories[0]
  );
  const [description, setDescription] = useState(expense?.description ?? "");
  const [value, setValue] = useState(
    expense ? expense.value.toFixed(2).replace(".", ",") : ""
  );
  const [today, setToday] = useState("");
  const [date, setDate] = useState(expense ? isoToDateInput(expense.date) : "");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const todayDate = isoToDateInput(new Date().toISOString());
    setToday(todayDate);
    if (!expense) setDate(todayDate);
  }, [expense]);

  const numericValue = parseMoneyInput(value);
  const canSave = numericValue !== null && date !== "" && today !== "";
  const closeHref = `/gastos?tab=${kind}`;

  const handleSave = () => {
    if (!canSave || numericValue === null) return;

    let occurredAt: string;
    try {
      occurredAt = dateInputToISO(date);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      setDateError(error.message);
      return;
    }

    const expenseData = {
      kind,
      category,
      description: description.trim() || meta[category as keyof typeof meta].label,
      value: numericValue,
      date: occurredAt,
    };

    if (expense) updateExpense(expense.id, expenseData);
    else addExpense(expenseData);
    router.push(closeHref);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header variant="close" closeHref={closeHref} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <h1 className="text-2xl font-semibold">
          {expense ? "Editar Gasto" : "Registrar Gasto"}{" "}
          {kind === "pesca" ? "da Pesca" : "da Casa"}
        </h1>
        <p className="text-mare-slate mt-1">
          Selecione a categoria e informe o valor.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {categories.map((currentCategory) => {
            const categoryMeta = meta[currentCategory as keyof typeof meta];
            const Icon = categoryMeta.icon;
            const active = category === currentCategory;
            return (
              <button
                key={currentCategory}
                type="button"
                onClick={() => setCategory(currentCategory)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl2 py-4 border transition-colors",
                  active
                    ? "bg-mare-purple border-mare-purple text-white shadow-soft"
                    : "bg-mare-card border-transparent text-mare-ink hover:border-mare-purple/30"
                )}
              >
                <Icon className={cn("h-6 w-6", active ? "text-white" : "text-mare-purple")} />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-center leading-tight">
                  {categoryMeta.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl2 bg-mare-card p-4">
          <label
            htmlFor="expense-description"
            className="text-xs font-semibold tracking-widest text-mare-slate uppercase"
          >
            Descrição (opcional)
          </label>
          <input
            id="expense-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Gasolina do barco"
            className="mt-2 w-full bg-transparent text-lg placeholder:text-mare-slate/60 focus:outline-none"
          />
        </div>

        <div className="mt-4 rounded-xl2 bg-mare-card p-4">
          <label
            htmlFor="expense-date"
            className="text-xs font-semibold tracking-widest text-mare-slate uppercase"
          >
            Data do gasto
          </label>
          <input
            id="expense-date"
            type="date"
            value={date}
            max={today}
            onChange={(event) => {
              setDate(event.target.value);
              setDateError("");
            }}
            className="mt-2 w-full bg-transparent text-lg text-mare-ink focus:outline-none"
          />
          {dateError && (
            <p className="mt-2 text-sm text-[#B23B5C]" role="alert">
              {dateError}
            </p>
          )}
        </div>

        <div className="mt-4 rounded-xl2 bg-mare-card p-4">
          <label
            htmlFor="expense-value"
            className="text-xs font-semibold tracking-widest text-mare-slate uppercase"
          >
            Valor gasto
          </label>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg text-mare-slate">R$</span>
            <input
              id="expense-value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="w-full bg-transparent text-2xl font-semibold placeholder:text-mare-slate/50 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            "mt-6 w-full flex items-center justify-center gap-2 rounded-full py-4 font-semibold text-white shadow-soft transition-opacity",
            canSave
              ? "bg-gradient-to-r from-mare-purple to-mare-tealDark active:scale-[0.99]"
              : "bg-mare-slate/40 cursor-not-allowed"
          )}
        >
          <CircleCheck className="h-5 w-5" />
          {expense ? "Salvar alterações" : "Salvar Gasto"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
