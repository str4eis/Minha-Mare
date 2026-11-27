"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import DataStatus from "@/components/DataStatus";
import Header from "@/components/Header";
import SaleForm from "@/components/SaleForm";
import { getSaleById } from "@/lib/data/sales";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { Sale } from "@/lib/types";

export default function EditarVendaPage() {
  const { id } = useParams<{ id: string }>();
  const { state, hydrated, loading, error, selectMonthForDate } = useStore();
  const saleInMonth = state.sales.find((item) => item.id === id);
  const [lookedUpSale, setLookedUpSale] = useState<Sale | null>(null);
  const [lookupError, setLookupError] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const sale = saleInMonth ?? lookedUpSale;

  useEffect(() => {
    if (!hydrated || loading || error || saleInMonth) return;
    let active = true;
    setLookupError(false);
    setLookupDone(false);
    getSaleById(createClient(), id)
      .then((found) => {
        if (!active) return;
        if (found) {
          setLookedUpSale(found);
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
  }, [error, hydrated, id, loading, lookupAttempt, saleInMonth, selectMonthForDate]);

  if (!hydrated || loading || (!lookupDone && !sale && !error)) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <Header variant="close" closeHref="/vendas" />
        <main className="flex-1 px-5">
          <p className="text-mare-slate">Carregando venda...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || lookupError) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <Header variant="close" closeHref="/vendas" />
        <main className="flex-1 px-5">
          {error ? (
            <DataStatus />
          ) : (
            <div role="alert" className="text-sm text-mare-negative">
              Não foi possível carregar esta venda.
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

  if (!sale) {
    return (
      <div className="flex min-h-dvh flex-col bg-white">
        <Header variant="close" closeHref="/vendas" />
        <main className="flex-1 px-5">
          <h1 className="text-2xl font-semibold">Venda não encontrada</h1>
          <p className="mt-2 text-mare-slate">
            Ela pode ter sido excluída ou não está mais disponível.
          </p>
          <Link href="/vendas" className="mt-4 inline-block font-semibold text-mare-purple">
            Voltar às vendas
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return <SaleForm key={sale.id} sale={sale} />;
}
