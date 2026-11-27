"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Home, Ship } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import CategoryIcon from "@/components/forms/CategoryIcon";
import DataStatus from "@/components/ui/DataStatus";
import Header from "@/components/layout/Header";
import MoneyInput from "@/components/ui/MoneyInput";
import { useStore } from "@/lib/store";
import { fishingExpenseMeta, homeExpenseMeta } from "@/lib/domain/categories";
import {
  Expense,
  ExpenseKind,
  FishingExpenseCategory,
  HomeExpenseCategory,
} from "@/lib/domain/types";
import { cn } from "@/lib/utils/cn";
import { dateInputToISO, isoToDateInput } from "@/lib/domain/period";
import { formatMoneyInput, parseMoneyInput } from "@/lib/domain/format";
import { moneyInWords } from "@/lib/domain/money-words";

type ExpenseCategory = FishingExpenseCategory | HomeExpenseCategory;

function getExpenseCategories(kind: ExpenseKind): ExpenseCategory[] {
  const meta = kind === "pesca" ? fishingExpenseMeta : homeExpenseMeta;
  return Object.keys(meta) as ExpenseCategory[];
}

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
  const [kind, setKind] = useState<ExpenseKind>(expense?.kind ?? requestedKind);
  const meta = kind === "pesca" ? fishingExpenseMeta : homeExpenseMeta;
  const categories = getExpenseCategories(kind);
  const [category, setCategory] = useState<ExpenseCategory>(
    expense?.category ??
      (initialCategory && categories.includes(initialCategory)
        ? initialCategory
        : categories[0])
  );
  const [description, setDescription] = useState(expense?.description ?? "");
  const [value, setValue] = useState(
    expense ? formatMoneyInput(expense.value.toFixed(2)) : ""
  );
  const [today, setToday] = useState("");
  const [date, setDate] = useState(expense ? isoToDateInput(expense.date) : "");
  const [dateError, setDateError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const todayDate = isoToDateInput(new Date().toISOString());
    setToday(todayDate);
    if (!expense) setDate(todayDate);
  }, [expense]);

  const parsedValue = parseMoneyInput(value, true);
  const numericValue =
    parsedValue !== null && parsedValue > 0 ? parsedValue : null;
  const canSave =
    numericValue !== null && date !== "" && today !== "" && !saving;
  const closeHref = `/gastos?tab=${kind}`;

  const handleSave = async () => {
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

    setSaving(true);
    setSaveError("");
    try {
      if (expense) await updateExpense(expense.id, expenseData);
      else await addExpense(expenseData);
      router.push(closeHref);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o gasto. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  };

  const chooseKind = (nextKind: ExpenseKind) => {
    setKind(nextKind);
    setCategory(getExpenseCategories(nextKind)[0]);
    setDescription("");
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header variant="close" closeHref={closeHref} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">
          {expense ? "Editar gasto" : "Anotar gasto"}
        </h1>
        <p className="mt-1 text-lg text-mare-slate">
          Escolha onde você gastou.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {(
            [
              { value: "pesca", label: "Gastei no trabalho", Icon: Ship },
              { value: "casa", label: "Gastei em casa", Icon: Home },
            ] as const
          ).map(({ value: currentKind, label, Icon }) => (
            <button
              key={currentKind}
              type="button"
              onClick={() => chooseKind(currentKind)}
              aria-pressed={kind === currentKind}
              className={cn(
                "flex min-h-20 items-center justify-center gap-2 rounded-xl2 border px-3 py-4 text-lg font-semibold transition-colors",
                kind === currentKind
                  ? "border-mare-purple bg-mare-purple text-white shadow-soft"
                  : "border-black/10 bg-white text-mare-institutional"
              )}
            >
              <Icon className="h-6 w-6 shrink-0" strokeWidth={2} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <h2 className="mt-5 text-lg font-semibold text-mare-institutional">
          O que você comprou?
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {categories.map((currentCategory) => {
            const categoryMeta = meta[currentCategory as keyof typeof meta];
            const active = category === currentCategory;
            return (
              <button
                key={currentCategory}
                type="button"
                onClick={() => setCategory(currentCategory)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl2 border px-2 py-3 transition-colors",
                  active
                    ? "bg-mare-purple border-mare-purple text-white shadow-soft"
                    : "bg-mare-card border-transparent text-mare-ink hover:border-mare-purple/30"
                )}
              >
                <CategoryIcon category={currentCategory} kind={kind} />
                <span className="text-lg font-semibold text-center leading-tight">
                  {categoryMeta.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl2 bg-mare-card p-4">
          <label htmlFor="expense-value" className="text-lg font-semibold">
            Quanto você gastou?
          </label>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg text-mare-slate">R$</span>
            <MoneyInput
              id="expense-value"
              value={value}
              onValueChange={setValue}
              placeholder="0,00"
              className="w-full bg-transparent text-2xl font-semibold placeholder:text-mare-slate focus:outline-none"
            />
          </div>
          {parsedValue !== null && (
            <p className="mt-2 text-lg text-mare-slate">
              {moneyInWords(parsedValue)}
            </p>
          )}
        </div>

        <details className="mt-4 rounded-xl2 bg-mare-card p-4" open={Boolean(expense)}>
          <summary className="cursor-pointer text-lg font-semibold text-mare-institutional">
            Mais detalhes (nome ou data)
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="expense-description" className="text-lg font-medium">
                Nome do gasto
              </label>
              <input
                id="expense-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Pode deixar em branco"
                className="mt-2 w-full rounded-xl2 border border-black/10 bg-white px-3 py-3 text-lg focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="expense-date" className="text-lg font-medium">
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
                className="mt-2 w-full rounded-xl2 border border-black/10 bg-white px-3 py-3 text-lg text-mare-ink focus:outline-none"
              />
              {dateError && (
                <p className="mt-2 text-base text-mare-negative" role="alert">
                  {dateError}
                </p>
              )}
            </div>
          </div>
        </details>

        {saveError && (
          <p className="mt-4 text-base text-mare-negative" role="alert">
            {saveError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            "mt-6 min-h-14 w-full flex items-center justify-center gap-2 rounded-full py-4 text-lg font-semibold text-white shadow-soft transition-opacity",
            canSave
              ? "bg-mare-primary active:scale-[0.99]"
              : "bg-mare-slate/40 cursor-not-allowed"
          )}
        >
          <CircleCheck className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          {saving ? "Salvando..." : expense ? "Salvar alterações" : "Anotar gasto"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
