"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import SaleForm from "@/components/SaleForm";
import { useStore } from "@/lib/store";

export default function EditarVendaPage() {
  const { id } = useParams<{ id: string }>();
  const { state, hydrated } = useStore();

  if (!hydrated) {
    return (
      <div className="flex flex-col min-h-dvh bg-white">
        <Header variant="close" closeHref="/vendas" />
        <main className="flex-1 px-5">
          <p className="text-mare-slate">Carregando venda...</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const sale = state.sales.find((item) => item.id === id);
  if (!sale) {
    return (
      <div className="flex flex-col min-h-dvh bg-white">
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
