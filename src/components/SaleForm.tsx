"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Minus, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CategoryIcon from "@/components/CategoryIcon";
import Header from "@/components/Header";
import { useStore } from "@/lib/store";
import { saleCategoryMeta } from "@/lib/categories";
import { cn } from "@/lib/cn";
import { dateInputToISO, isoToDateInput } from "@/lib/period";
import { parseMoneyInput } from "@/lib/format";
import { Sale, SaleCategory } from "@/lib/types";

const categories: SaleCategory[] = [
  "ostra",
  "caranguejo",
  "peixe",
  "marisco",
  "sururu",
  "outros",
];

interface SaleFormProps {
  sale?: Sale;
}

export default function SaleForm({ sale }: SaleFormProps) {
  const router = useRouter();
  const { addSale, updateSale } = useStore();
  const [category, setCategory] = useState<SaleCategory>(sale?.category ?? "ostra");
  const [unit, setUnit] = useState<"dz" | "kg">(sale?.unit ?? "dz");
  const [quantity, setQuantity] = useState(sale?.quantity ?? 1);
  const [buyer, setBuyer] = useState(sale?.buyer ?? "");
  const [value, setValue] = useState(
    sale ? sale.value.toFixed(2).replace(".", ",") : ""
  );
  const [today, setToday] = useState("");
  const [date, setDate] = useState(sale ? isoToDateInput(sale.date) : "");
  const [dateError, setDateError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const todayDate = isoToDateInput(new Date().toISOString());
    setToday(todayDate);
    if (!sale) setDate(todayDate);
  }, [sale]);

  const numericValue = parseMoneyInput(value);
  const canSave =
    numericValue !== null && quantity > 0 && date !== "" && today !== "" && !saving;

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

    const saleData = {
      category,
      buyer: buyer.trim() || "Venda avulsa",
      quantity,
      unit,
      value: numericValue,
      date: occurredAt,
    };

    setSaving(true);
    setSaveError("");
    try {
      if (sale) await updateSale(sale.id, saleData);
      else await addSale(saleData);
      router.push("/vendas");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a venda. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header variant="close" closeHref="/vendas" />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <h1 className="text-2xl font-semibold">
          {sale ? "Editar Venda" : "Registrar Venda"}
        </h1>
        <p className="text-mare-slate mt-1">
          Selecione o produto e informe a quantidade.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {categories.map((cat) => {
            const meta = saleCategoryMeta[cat];
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
                <CategoryIcon category={cat} kind="venda" />
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
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="h-11 w-11 rounded-full bg-white shadow-card flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-5 w-5 text-mare-institutional" strokeWidth={2} aria-hidden="true" />
            </button>
            <span className="text-2xl font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              className="h-11 w-11 rounded-full bg-white shadow-card flex items-center justify-center active:scale-95 transition-transform"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-5 w-5 text-mare-institutional" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            {(["dz", "kg"] as const).map((currentUnit) => (
              <button
                key={currentUnit}
                type="button"
                onClick={() => setUnit(currentUnit)}
                className={cn(
                  "flex-1 rounded-full py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                  unit === currentUnit
                    ? "bg-mare-purple text-white"
                    : "bg-white text-mare-slate border border-black/5"
                )}
              >
                {currentUnit === "dz" ? "Dúzia" : "Quilo"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl2 bg-mare-card p-4">
          <label
            htmlFor="sale-buyer"
            className="text-xs font-semibold tracking-widest text-mare-slate uppercase"
          >
            Comprador (opcional)
          </label>
          <input
            id="sale-buyer"
            value={buyer}
            onChange={(event) => setBuyer(event.target.value)}
            placeholder="Ex: Restaurante do Mar"
            className="mt-2 w-full bg-transparent text-lg placeholder:text-mare-slate focus:outline-none"
          />
        </div>

        <div className="mt-4 rounded-xl2 bg-mare-card p-4">
          <label
            htmlFor="sale-date"
            className="text-xs font-semibold tracking-widest text-mare-slate uppercase"
          >
            Data da venda
          </label>
          <input
            id="sale-date"
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
            <p className="mt-2 text-sm text-mare-negative" role="alert">
              {dateError}
            </p>
          )}
        </div>

        <div className="mt-4 rounded-xl2 bg-mare-card p-4">
          <label
            htmlFor="sale-value"
            className="text-xs font-semibold tracking-widest text-mare-slate uppercase"
          >
            Valor recebido
          </label>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg text-mare-slate">R$</span>
            <input
              id="sale-value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              className="w-full bg-transparent text-2xl font-semibold placeholder:text-mare-slate focus:outline-none"
            />
          </div>
        </div>

        {saveError && (
          <p className="mt-4 text-sm text-mare-negative" role="alert">
            {saveError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={cn(
            "mt-6 w-full flex items-center justify-center gap-2 rounded-full py-4 font-semibold text-white shadow-soft transition-opacity",
            canSave
              ? "bg-mare-primary active:scale-[0.99]"
              : "bg-mare-slate/40 cursor-not-allowed"
          )}
        >
          <CircleCheck className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          {saving ? "Salvando..." : sale ? "Salvar alterações" : "Salvar Venda"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
