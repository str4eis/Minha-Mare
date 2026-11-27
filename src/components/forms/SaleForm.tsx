"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Minus, Plus } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import CategoryIcon from "@/components/forms/CategoryIcon";
import DataStatus from "@/components/ui/DataStatus";
import Header from "@/components/layout/Header";
import MoneyInput from "@/components/ui/MoneyInput";
import SpeakButton from "@/components/audio/SpeakButton";
import { useStore } from "@/lib/store";
import { saleCategoryMeta } from "@/lib/domain/categories";
import { cn } from "@/lib/utils/cn";
import { dateInputToISO, isoToDateInput } from "@/lib/domain/period";
import { formatMoneyInput, parseMoneyInput } from "@/lib/domain/format";
import { moneyInWords } from "@/lib/domain/money-words";
import {
  formatQuantityInput,
  formatSaleUnit,
  getDefaultSaleUnit,
  parseQuantityInput,
  suggestLastSalePrice,
} from "@/lib/domain/sale-entry";
import { getLatestSale, getLatestSaleForCategory } from "@/lib/data/sales";
import { createClient } from "@/lib/supabase/client";
import { Sale, SaleCategory } from "@/lib/domain/types";

const categories: SaleCategory[] = [
  "ostra",
  "caranguejo",
  "sururu",
  "marisco",
  "peixe",
  "outros",
];

interface SaleFormProps {
  sale?: Sale;
}

export default function SaleForm({ sale }: SaleFormProps) {
  const router = useRouter();
  const { addSale, updateSale, ready } = useStore();
  const [category, setCategory] = useState<SaleCategory | null>(
    sale?.category ?? null
  );
  const [unit, setUnit] = useState<"dz" | "kg">(sale?.unit ?? "kg");
  const [quantity, setQuantity] = useState(
    sale ? formatQuantityInput(sale.quantity) : "1"
  );
  const [buyer, setBuyer] = useState(sale?.buyer ?? "");
  const [value, setValue] = useState(
    sale ? formatMoneyInput(sale.value.toFixed(2)) : ""
  );
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [priceSuggestion, setPriceSuggestion] = useState<{
    category: SaleCategory;
    pricePerUnit: number;
    unit: "dz" | "kg";
  } | null>(null);
  const [lastSaleError, setLastSaleError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [today, setToday] = useState("");
  const [date, setDate] = useState(sale ? isoToDateInput(sale.date) : "");
  const [dateError, setDateError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const valueWasEdited = useRef(Boolean(sale));
  const priceRequestId = useRef(0);

  useEffect(() => {
    const todayDate = isoToDateInput(new Date().toISOString());
    setToday(todayDate);
    if (!sale) setDate(todayDate);
  }, [sale]);

  useEffect(() => {
    if (!ready || sale) return;
    let active = true;

    getLatestSale(createClient())
      .then((latest) => {
        if (active) setLastSale(latest);
      })
      .catch(() => {
        if (active) {
          setLastSaleError(
            "Não foi possível carregar sua última venda. Você pode preencher os dados."
          );
        }
      });

    return () => {
      active = false;
    };
  }, [ready, sale]);

  useEffect(() => {
    if (!ready || !category || sale) return;
    let active = true;
    const requestId = ++priceRequestId.current;
    setPriceSuggestion(null);
    setPriceError("");

    getLatestSaleForCategory(createClient(), category)
      .then((latest) => {
        if (!active || requestId !== priceRequestId.current) return;
        const suggestion = latest
          ? suggestLastSalePrice([latest], category)
          : null;
        setPriceSuggestion(
          suggestion ? { ...suggestion, category } : null
        );
      })
      .catch(() => {
        if (active && requestId === priceRequestId.current) {
          setPriceError("Não foi possível buscar o último preço.");
        }
      });

    return () => {
      active = false;
    };
  }, [category, ready, sale]);

  const quantityValue = parseQuantityInput(quantity);
  const parsedValue = parseMoneyInput(value, true);
  const numericValue =
    parsedValue !== null && parsedValue > 0 ? parsedValue : null;
  const canSave =
    category !== null &&
    numericValue !== null &&
    quantityValue !== null &&
    date !== "" &&
    today !== "" &&
    !saving;

  useEffect(() => {
    if (
      !priceSuggestion ||
      priceSuggestion.category !== category ||
      priceSuggestion.unit !== unit ||
      quantityValue === null ||
      valueWasEdited.current
    ) {
      return;
    }

    setValue(
      formatMoneyInput(
        (priceSuggestion.pricePerUnit * quantityValue).toFixed(2)
      )
    );
  }, [category, priceSuggestion, quantityValue, unit]);

  const handleSave = async () => {
    if (!canSave || numericValue === null || quantityValue === null || !category) {
      return;
    }

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
      quantity: quantityValue,
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

  const chooseCategory = (nextCategory: SaleCategory) => {
    setCategory(nextCategory);
    setUnit(getDefaultSaleUnit(nextCategory));
    setPriceSuggestion(null);
    setPriceError("");
    if (!sale) {
      setValue("");
      valueWasEdited.current = false;
    }
  };

  const repeatLastSale = () => {
    if (!lastSale) return;
    setCategory(lastSale.category);
    setUnit(lastSale.unit);
    setQuantity(formatQuantityInput(lastSale.quantity));
    setBuyer(lastSale.buyer === "Venda avulsa" ? "" : lastSale.buyer);
    setValue(formatMoneyInput(lastSale.value.toFixed(2)));
    const suggestion = suggestLastSalePrice([lastSale], lastSale.category);
    setPriceSuggestion(
      suggestion ? { ...suggestion, category: lastSale.category } : null
    );
    setDate(today);
    valueWasEdited.current = true;
  };

  const updateQuantity = (next: number) => {
    setQuantity(formatQuantityInput(Math.max(0.001, next)));
  };

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header variant="close" closeHref="/vendas" />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">
          {sale ? "Editar venda" : "Anotar venda"}
        </h1>
        <p className="mt-1 text-lg text-mare-slate">
          Escolha o que você vendeu.
        </p>

        {!sale && lastSale && (
          <button
            type="button"
            onClick={repeatLastSale}
            className="mt-4 min-h-14 w-full rounded-xl2 border-2 border-mare-purple px-4 py-3 text-left text-lg font-semibold text-mare-purple"
          >
            Repetir última venda
          </button>
        )}
        {lastSaleError && (
          <p className="mt-3 text-base text-mare-slate" role="status">
            {lastSaleError}
          </p>
        )}

        <h2 className="mt-5 text-lg font-semibold text-mare-institutional">
          1. O que você vendeu?
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const meta = saleCategoryMeta[cat];
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => chooseCategory(cat)}
                aria-pressed={active}
                className={cn(
                  "flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl2 border px-2 py-3 transition-colors",
                  active
                    ? "bg-mare-purple border-mare-purple text-white shadow-soft"
                    : "bg-mare-card border-transparent text-mare-ink hover:border-mare-purple/30"
                )}
              >
                <CategoryIcon category={cat} kind="venda" />
                <span className="text-lg font-semibold">
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl2 bg-mare-card p-4">
          <h2 className="text-lg font-semibold text-mare-institutional">
            2. Quanto você vendeu?
          </h2>
          <p className="mt-1 text-base text-mare-slate">
            {category
              ? `Quantidade em ${formatSaleUnit(unit)}.`
              : "Escolha um produto primeiro."}
          </p>
          <div
            className={cn(
              "mt-3 flex items-center justify-between gap-3",
              !category && "opacity-50"
            )}
          >
            <button
              type="button"
              disabled={!category}
              onClick={() => updateQuantity((quantityValue ?? 1) - 1)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-card transition-transform active:scale-95 disabled:cursor-not-allowed"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-5 w-5 text-mare-institutional" strokeWidth={2} aria-hidden="true" />
            </button>
            <input
              aria-label="Quantidade"
              inputMode="decimal"
              disabled={!category}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="min-w-0 w-full bg-transparent text-center text-2xl font-semibold tabular-nums focus:outline-none"
            />
            <button
              type="button"
              disabled={!category}
              onClick={() => updateQuantity((quantityValue ?? 0) + 1)}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-card transition-transform active:scale-95 disabled:cursor-not-allowed"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-5 w-5 text-mare-institutional" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          {quantity !== "" && quantityValue === null && (
            <p className="mt-2 text-lg text-mare-negative" role="alert">
              Coloque uma quantidade válida.
            </p>
          )}
          <div className={cn("mt-3 flex gap-2", !category && "opacity-50")}>
            {(["dz", "kg"] as const).map((currentUnit) => (
              <button
                key={currentUnit}
                type="button"
                disabled={!category}
                onClick={() => setUnit(currentUnit)}
                aria-pressed={unit === currentUnit}
                className={cn(
                  "min-h-14 flex-1 rounded-full px-3 py-2 text-lg font-semibold transition-colors disabled:cursor-not-allowed",
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
          <h2 className="text-lg font-semibold text-mare-institutional">
            3. Quanto você recebeu?
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg text-mare-slate">R$</span>
            <MoneyInput
              id="sale-value"
              disabled={!category}
              value={value}
              onValueChange={(nextValue) => {
                valueWasEdited.current = true;
                setValue(nextValue);
              }}
              placeholder="0,00"
              className="w-full bg-transparent text-2xl font-semibold placeholder:text-mare-slate focus:outline-none"
            />
          </div>
          {parsedValue !== null && (
            <p className="mt-2 text-lg text-mare-slate">
              {moneyInWords(parsedValue)}
            </p>
          )}
          {category && numericValue !== null && (
            <div className="mt-3">
              <SpeakButton
                label="Ouvir valor"
                text={`Produto: ${saleCategoryMeta[
                  category
                ].label}. Valor total: ${moneyInWords(
                  numericValue
                )}.`}
              />
            </div>
          )}
          {priceSuggestion && category === priceSuggestion.category && (
            <p className="mt-2 text-lg text-mare-slate" role="status">
              Último preço: {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(priceSuggestion.pricePerUnit)}{" "}
              por {formatSaleUnit(priceSuggestion.unit)}.
            </p>
          )}
          {priceError && (
            <p className="mt-2 text-base text-mare-slate" role="status">
              {priceError}
            </p>
          )}
        </div>

        <details className="mt-4 rounded-xl2 bg-mare-card p-4" open={Boolean(sale)}>
          <summary className="cursor-pointer text-lg font-semibold text-mare-institutional">
            Mais detalhes (data ou comprador)
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="sale-buyer" className="text-lg font-medium">
                Comprador
              </label>
              <input
                id="sale-buyer"
                value={buyer}
                onChange={(event) => setBuyer(event.target.value)}
                placeholder="Pode deixar em branco"
                className="mt-2 w-full rounded-xl2 border border-black/10 bg-white px-3 py-3 text-lg focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="sale-date" className="text-lg font-medium">
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
          {saving ? "Salvando..." : sale ? "Salvar alterações" : "Anotar venda"}
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
