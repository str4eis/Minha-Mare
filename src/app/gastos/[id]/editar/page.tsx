"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import ExpenseForm from "@/components/ExpenseForm";
import { useStore } from "@/lib/store";

export default function EditarGastoPage() {
  const { id } = useParams<{ id: string }>();
  const { state, hydrated } = useStore();

  if (!hydrated) {
    return (
      <div className="flex flex-col min-h-dvh bg-white">
        <Header variant="close" closeHref="/gastos" />
        <main className="flex-1 px-5">
          <p className="text-mare-slate">Carregando gasto...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) {
    return (
      <div className="flex flex-col min-h-dvh bg-white">
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
