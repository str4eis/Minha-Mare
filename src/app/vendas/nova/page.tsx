"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, CircleCheck } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useStore } from "@/lib/store";
import { saleCategoryMeta } from "@/lib/categories";
import { SaleCategory } from "@/lib/types";
import { cn } from "@/lib/cn";

const categories: SaleCategory[] = [
  "ostra",
  "caranguejo",
  "peixe",
  "marisco",
  "sururu",
  "outros",
];

export default function NovaVendaPage() {
  const router = useRouter();
  const { addSale } = useStore();

  const [category, setCategory] = useState<SaleCategory>("ostra");
  const [unit, setUnit] = useState<"dz" | "kg">("dz");
  const [quantity, setQuantity] = useState(1);
  const [buyer, setBuyer] = useState("");
  const [value, setValue] = useState("");

  const numericValue = Number(value.replace(",", ".")) || 0;
  const canSave = numericValue > 0;

  const handleSave = () => {
    if (!canSave) return;
    addSale({
      category,
      buyer: buyer.trim() || "Venda avulsa",
      quantity,
      unit,
      value: numericValue,
    });
    router.push("/vendas");
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header variant="close" closeHref="/vendas" />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <h1 className="text-2xl font-semibold">Registrar Venda</h1>
        <p className="text-mare-slate mt-1">Selecione o produto e informe a quantidade.</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {categories.map((cat) => {
            const meta = saleCategoryMeta[cat];
            const Icon = meta.icon;
            const active = category === cat;
            return (
              <button
                key={cat}
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
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl2 bg-mare-card p-4">
          <p className="text-xs font-semibold tracking-widest text-mare-slate uppercase">
            Quantidade ({unit === "dz" ? "dúzia" : "kg"})
          </p>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-11 w-11 rounded-full bg-white shadow-card flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-5 w-5 text-mare-ink" />
            </button>
            <span className="text-2xl font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="h-11 w-11 rounded-full bg-white shadow-card flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-5 w-5 text-mare-ink" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            {(["dz", "kg"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                  unit === u
                    ? "bg-mare-purple text-white"
                    : "bg-white text-mare-slate border border-black/5"
                )}
              >
                {u === "dz" ? "Dúzia" : "Quilo"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl2 bg-mare-card p-4">
          <label className="text-xs font-semibold tracking-widest text-mare-slate uppercase">
            Comprador (opcional)
          </label>
          <input
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            placeholder="Ex: Restaurante do Mar"
            className="mt-2 w-full bg-transparent text-lg placeholder:text-mare-slate/60 focus:outline-none"
          />
        </div>

        <div className="mt-4 rounded-xl2 bg-mare-card p-4">
          <label className="text-xs font-semibold tracking-widest text-mare-slate uppercase">
            Valor recebido
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
          Salvar Venda
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
