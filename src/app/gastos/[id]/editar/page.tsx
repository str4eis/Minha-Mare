"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import DataStatus from "@/components/DataStatus";
import Header from "@/components/Header";
import ExpenseForm from "@/components/ExpenseForm";
import { getExpenseById } from "@/lib/data/expenses";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Expense } from "@/lib/types";

export default function EditarGastoPage() {
  const { id } = useParams<{ id: string }>();
  const { state, hydrated, loading, error, selectMonthForDate } = useStore();
  const expenseInMonth = state.expenses.find((item) => item.id === id);
  const [lookedUpExpense, setLookedUpExpense] = useState<Expense | null>(null);
  const [lookupError, setLookupError] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const expense = expenseInMonth ?? lookedUpExpense;

  useEffect(() => {
    if (!hydrated || loading || error || expenseInMonth) return;
    let active = true;
    setLookupError(false);
    setLookupDone(false);
    getExpenseById(createClient(), id)
      .then((found) => {
        if (!active) return;
        if (found) {
          setLookedUpExpense(found);
          selectMonthForDate(found.date);
        }
        setLookupDone(true);
      })
      .catch(() => {
        if (active) {
          setLookupError(true);
          setLookupDone(true);
        }
      });

    return () => {
      active = false;
    };
  }, [
    error,
    expenseInMonth,
    hydrated,
    id,
    loading,
    lookupAttempt,
    selectMonthForDate,
  ]);

  if (!hydrated || loading || (!lookupDone && !expense && !error)) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <Header variant="close" closeHref="/gastos" />
        <main className="flex-1 px-5">
          <p className="text-mare-slate">Carregando gasto...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || lookupError) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <Header variant="close" closeHref="/gastos" />
        <main className="flex-1 px-5">
          {error ? (
            <DataStatus />
          ) : (
            <div role="alert" className="text-sm text-[#B23B5C]">
              Não foi possível carregar este gasto.
              <button
                type="button"
                onClick={() => setLookupAttempt((attempt) => attempt + 1)}
                className="ml-2 font-semibold text-mare-purple"
              >
                Tentar de novo
              </button>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <Header variant="close" closeHref="/gastos" />
        <main className="flex-1 px-5">
          <h1 className="text-2xl font-semibold">Gasto não encontrado</h1>
          <p className="mt-2 text-mare-slate">
            Ele pode ter sido excluído ou não está mais disponível.
          </p>
          <Link href="/gastos" className="mt-4 inline-block font-semibold text-mare-purple">
            Voltar aos gastos
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return <ExpenseForm key={expense.id} expense={expense} />;
}
