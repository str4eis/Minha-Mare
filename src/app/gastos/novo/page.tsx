"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleCheck } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useStore } from "@/lib/store";
import { fishingExpenseMeta, homeExpenseMeta } from "@/lib/categories";
import { ExpenseKind, FishingExpenseCategory, HomeExpenseCategory } from "@/lib/types";
import { cn } from "@/lib/cn";
import { parseMoneyInput } from "@/lib/format";

function NovoGastoContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { addExpense } = useStore();

  const kind = (params.get("kind") as ExpenseKind) || "pesca";
  const initialCategory = params.get("categoria") || undefined;

  const meta = kind === "pesca" ? fishingExpenseMeta : homeExpenseMeta;
  const categories = Object.keys(meta) as Array<
    FishingExpenseCategory | HomeExpenseCategory
  >;

  const [category, setCategory] = useState<FishingExpenseCategory | HomeExpenseCategory>(
    (initialCategory as FishingExpenseCategory | HomeExpenseCategory) || categories[0]
  );
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");

  const numericValue = parseMoneyInput(value);
  const canSave = numericValue !== null;

  const handleSave = () => {
    if (numericValue === null) return;
    addExpense({
      kind,
      category,
      description: description.trim() || meta[category as keyof typeof meta].label,
      value: numericValue,
    });
    router.push(`/gastos?tab=${kind}`);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header variant="close" closeHref={`/gastos?tab=${kind}`} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <h1 className="text-2xl font-semibold">
          Registrar Gasto {kind === "pesca" ? "da Pesca" : "da Casa"}
        </h1>
        <p className="text-mare-slate mt-1">Selecione a categoria e informe o valor.</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {categories.map((cat) => {
            const m = meta[cat as keyof typeof meta];
            const Icon = m.icon;
            const active = category === cat;
            return (
              <button
                key={cat as string}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-xl2 py-4 border transition-colors",
                  active
                    ? "bg-mare-purple border-mare-purple text-white shadow-soft"
                    : "bg-mare-card border-transparent text-mare-ink hover:border-mare-purple/30"
                )}
              >
                <Icon className={cn("h-6 w-6", active ? "text-white" : "text-mare-purple")} />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-center leading-tight">
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl2 bg-mare-card p-4">
          <label className="text-xs font-semibold tracking-widest text-mare-slate uppercase">
            Descrição (opcional)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Gasolina do barco"
            className="mt-2 w-full bg-transparent text-lg placeholder:text-mare-slate/60 focus:outline-none"
          />
        </div>

        <div className="mt-4 rounded-xl2 bg-mare-card p-4">
          <label className="text-xs font-semibold tracking-widest text-mare-slate uppercase">
            Valor gasto
          </label>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg text-mare-slate">R$</span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
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
          Salvar Gasto
        </button>
      </main>

      <BottomNav />
    </div>
  );
}

export default function NovoGastoPage() {
  return (
    <Suspense fallback={null}>
      <NovoGastoContent />
    </Suspense>
  );
}
