"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Plus,
  Pencil,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import DataStatus from "@/components/ui/DataStatus";
import MoneyInput from "@/components/ui/MoneyInput";
import { useStore } from "@/lib/store";
import { formatBRL } from "@/lib/domain/format";
import { cn } from "@/lib/utils/cn";

type PriceUnit = "kg" | "litro" | "bacia";

const unitOptions: Array<{ value: PriceUnit; label: string }> = [
  { value: "kg", label: "Quilo" },
  { value: "litro", label: "Litro" },
  { value: "bacia", label: "Bacia" },
];

export default function PrecosPage() {
  const router = useRouter();
  const { productPrices, upsertProductPrice, deleteProductPrice, ready } =
    useStore();
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");
  const [priceError, setPriceError] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState<PriceUnit>("kg");
  const [newPrice, setNewPrice] = useState("");
  const [addError, setAddError] = useState("");

  if (!ready) return null;

  const saveEditedPrice = (id: string) => {
    const price = productPrices.find((p) => p.id === id);
    if (!price) return;
    const parsed = parseMoneyAllowZero(editingPriceValue);
    if (parsed === null) {
      setPriceError("Preço inválido.");
      return;
    }
    setPriceError("");
    upsertProductPrice({ ...price, pricePerUnit: parsed });
    setEditingPriceId(null);
    setEditingPriceValue("");
  };

  const addCustomProduct = () => {
    setAddError("");
    if (!newName.trim()) {
      setAddError("Informe o nome do produto.");
      return;
    }
    const parsed = parseMoneyAllowZero(newPrice);
    if (parsed === null) {
      setAddError("Preço inválido.");
      return;
    }
    upsertProductPrice({
      id: `custom-${crypto.randomUUID()}`,
      name: newName.trim(),
      unit: newUnit,
      pricePerUnit: parsed,
      isCustom: true,
    });
    setAdding(false);
    setNewName("");
    setNewUnit("kg");
    setNewPrice("");
  };

  const standardPrices = productPrices.filter((p) => !p.isCustom);
  const customPrices = productPrices.filter((p) => p.isCustom);

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      <Header variant="close" closeHref="/home" />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        <DataStatus />
        <h1 className="text-2xl font-semibold">Meus Preços</h1>
        <p className="mt-1 text-lg text-mare-slate">
          Defina a unidade padrão e o preço unitário de cada produto da maré.
        </p>

        <section className="mt-5">
          <h2 className="text-lg font-semibold text-mare-ink">
            Produtos da maré
          </h2>
          <p className="mt-1 text-base text-mare-slate">
            Toque no lápis para editar o preço unitário.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-3">
            {standardPrices.map((price) => (
              <li
                key={price.id}
                className="rounded-xl2 border p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <Tag className="h-8 w-8 text-mare-purple" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-mare-ink">{price.name}</p>
                    <p className="mt-0.5 text-sm text-mare-slate">
                      Unidade padrão: {unitLabel(price.unit)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    {unitOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          upsertProductPrice({
                            ...price,
                            unit: option.value,
                          })
                        }
                        aria-pressed={price.unit === option.value}
                        className={cn(
                          "min-h-10 flex-1 rounded-full px-2 py-2 text-sm font-semibold transition-colors",
                          price.unit === option.value
                            ? "bg-mare-purple text-white"
                            : "bg-white text-mare-slate border border-black/5"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {editingPriceId === price.id ? (
                    <div className="flex items-end gap-2 mt-2">
                      <MoneyInput
                        id={`price-${price.id}`}
                        value={editingPriceValue}
                        onValueChange={setEditingPriceValue}
                        placeholder="0,00"
                        className="w-24 text-lg font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => saveEditedPrice(price.id)}
                        aria-label="Salvar preço"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-mare-primary text-white"
                      >
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPriceId(null);
                          setEditingPriceValue("");
                          setPriceError("");
                        }}
                        aria-label="Cancelar"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-mare-slate hover:bg-black/5"
                      >
                        <X className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg font-semibold", price.pricePerUnit > 0 ? "text-mare-ink" : "text-mare-slate")}>
                        {price.pricePerUnit > 0
                          ? formatBRL(price.pricePerUnit)
                          : "Preço não definido"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPriceValue(
                            formatMoneyInput(price.pricePerUnit.toFixed(2))
                          );
                          setEditingPriceId(price.id);
                          setPriceError("");
                        }}
                        aria-label={`Editar preço de ${price.name}`}
                        title="Editar preço"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-mare-purple hover:bg-mare-purpleLight"
                      >
                        <Pencil className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                  {priceError && editingPriceId === price.id && (
                    <p className="mt-1 text-base text-mare-negative" role="alert">
                      {priceError}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {customPrices.length > 0 && (
          <section className="mt-5">
            <h2 className="text-lg font-semibold text-mare-ink">
              Meus produtos
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-3">
              {customPrices.map((price) => (
                <li
                  key={price.id}
                  className="rounded-xl2 border p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-8 w-8 text-mare-purple" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-mare-ink">{price.name}</p>
                      <p className="mt-0.5 text-sm text-mare-slate">
                        Unidade padrão: {unitLabel(price.unit)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex items-center gap-1">
                      {unitOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            upsertProductPrice({
                              ...price,
                              unit: option.value,
                            })
                          }
                          aria-pressed={price.unit === option.value}
                          className={cn(
                            "min-h-10 flex-1 rounded-full px-2 py-2 text-sm font-semibold transition-colors",
                            price.unit === option.value
                              ? "bg-mare-purple text-white"
                              : "bg-white text-mare-slate border border-black/5"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg font-semibold", price.pricePerUnit > 0 ? "text-mare-ink" : "text-mare-slate")}>
                        {price.pricePerUnit > 0
                          ? formatBRL(price.pricePerUnit)
                          : "Preço não definido"}
                      </span>
                      {editingPriceId === price.id ? (
                        <div className="flex items-end gap-2 mt-2">
                          <MoneyInput
                            id={`price-${price.id}`}
                            value={editingPriceValue}
                            onValueChange={setEditingPriceValue}
                            placeholder="0,00"
                            className="w-24 text-lg font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => saveEditedPrice(price.id)}
                            aria-label="Salvar preço"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-mare-primary text-white"
                          >
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPriceId(null);
                              setEditingPriceValue("");
                              setPriceError("");
                            }}
                            aria-label="Cancelar"
                            className="flex h-10 w-10 items-center justify-center rounded-full text-mare-slate hover:bg-black/5"
                          >
                            <X className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceValue(
                              formatMoneyInput(price.pricePerUnit.toFixed(2))
                            );
                            setEditingPriceId(price.id);
                            setPriceError("");
                          }}
                          aria-label={`Editar preço de ${price.name}`}
                          title="Editar preço"
                          className="flex h-10 w-10 items-center justify-center rounded-full text-mare-purple hover:bg-mare-purpleLight"
                        >
                          <Pencil className="h-5 w-5" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteProductPrice(price.id)}
                        aria-label={`Excluir produto ${price.name}`}
                        title="Excluir"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-mare-negative hover:bg-mare-negativeLight"
                      >
                        <Trash2 className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    {priceError && editingPriceId === price.id && (
                      <p className="mt-1 text-base text-mare-negative" role="alert">
                        {priceError}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setAdding(!adding)}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-mare-primary bg-mare-primary/10 px-4 text-lg font-semibold text-mare-purple hover:bg-mare-primary/20"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            {adding ? "Cancelar" : "+ Outro produto"}
          </button>
        </div>

        {adding && (
          <div className="mt-4 rounded-xl2 border p-4">
            <h2 className="text-lg font-semibold text-mare-ink mb-2">
              Novo produto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                id="new-product-name"
                placeholder="Nome do produto"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="min-h-14 rounded-xl2 border border-black/10 bg-white px-3 text-lg focus:outline-none"
              />
              <div className="flex items-center gap-1">
                {unitOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setNewUnit(option.value)}
                    aria-pressed={newUnit === option.value}
                    className={cn(
                      "min-h-14 flex-1 rounded-full px-2 py-2 text-sm font-semibold transition-colors",
                      newUnit === option.value
                        ? "bg-mare-purple text-white"
                        : "bg-white text-mare-slate border border-black/5"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <MoneyInput
                id="new-product-price"
                placeholder="0,00"
                value={newPrice}
                onValueChange={setNewPrice}
                className="min-h-14 rounded-xl2 border border-black/10 bg-white px-3 text-lg focus:outline-none"
              />
            </div>
            {addError && (
              <p className="mt-2 text-base text-mare-negative" role="alert">
                {addError}
              </p>
            )}
            <div className="mt-3 flex items-end gap-2">
              <button
                type="button"
                onClick={addCustomProduct}
                disabled={!newName.trim()}
                className="flex h-12 w-full items-center justify-center rounded-full bg-mare-primary px-4 text-lg font-semibold text-white disabled:cursor-not-allowed disabled:bg-mare-slate/40"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="flex h-12 w-full items-center justify-center rounded-full border border-black/10 px-4 text-lg font-semibold text-mare-ink"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function unitLabel(unit: PriceUnit): string {
  return unit === "kg" ? "Quilo" : unit === "litro" ? "Litro" : "Bacia";
}

function parseMoneyAllowZero(input: string): number | null {
  const normalized = input.trim().replace(/\./g, "").replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

function formatMoneyInput(value: string): string {
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  const padded = digits.padStart(3, "0");
  const whole = padded.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${whole},${padded.slice(-2)}`;
}

