"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  Home,
  PlusCircle,
  Tag,
  Undo2,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useStore } from "@/lib/store";

export default function BottomNav() {
  const pathname = usePathname();
  const [showChoices, setShowChoices] = useState(false);
  const { undoNotice, undoDelete } = useStore();
  const anotarActive =
    pathname.startsWith("/vendas/nova") || pathname.startsWith("/gastos/novo");

  return (
    <>
      {undoNotice && (
        <div
          className="fixed inset-x-4 bottom-[calc(10rem+env(safe-area-inset-bottom))] z-40 mx-auto flex min-h-14 max-w-md items-center justify-between gap-3 rounded-xl2 bg-mare-institutional px-4 py-3 text-white shadow-soft"
          role="status"
          aria-live="polite"
        >
          <span className="text-lg font-medium">{undoNotice}</span>
          <button
            type="button"
            onClick={undoDelete}
            className="flex min-h-14 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-lg font-semibold text-mare-institutional"
          >
            <Undo2 className="h-5 w-5" aria-hidden="true" />
            Desfazer
          </button>
        </div>
      )}

      {showChoices && (
        <div
          id="anotar-options"
          className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto grid max-w-md grid-cols-1 gap-4 rounded-xl2 bg-white p-4 shadow-soft"
          role="group"
          aria-label="Escolha o que anotar"
        >
          <Link
            href="/vendas/nova"
            onClick={() => setShowChoices(false)}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-emerald-500/40 bg-emerald-500/15 px-3 text-center text-lg font-semibold text-emerald-800"
          >
            <CircleDollarSign className="h-10 w-10" aria-hidden="true" />
            Venda
          </Link>
          <Link
            href="/gastos/novo"
            onClick={() => setShowChoices(false)}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-rose-500/40 bg-rose-500/15 px-3 text-center text-lg font-semibold text-rose-700"
          >
            <Wallet className="h-10 w-10" aria-hidden="true" />
            Gasto
          </Link>
        </div>
      )}

      <nav className="sticky bottom-0 z-30 mt-auto border-t border-black/5 bg-white px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <ul className="flex items-end justify-between">
          <li className="flex-1">
            <Link
              href="/home"
              aria-current={pathname.startsWith("/home") ? "page" : undefined}
              className="flex min-h-14 flex-col items-center justify-center gap-1 py-1 text-mare-slate"
            >
              <Home
                className={cn(
                  "h-6 w-6",
                  pathname.startsWith("/home") && "text-mare-purple"
                )}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-lg font-semibold",
                  pathname.startsWith("/home") && "text-mare-purple"
                )}
              >
                Início
              </span>
            </Link>
          </li>
          <li className="flex-1">
            <button
              type="button"
              aria-expanded={showChoices}
              aria-controls={showChoices ? "anotar-options" : undefined}
              onClick={() => setShowChoices((visible) => !visible)}
              className={cn(
                "flex min-h-14 w-full flex-col items-center justify-center gap-1 py-1",
                anotarActive || showChoices ? "text-mare-purple" : "text-mare-slate"
              )}
            >
              <PlusCircle className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              <span className="text-lg font-semibold">Anotar</span>
            </button>
          </li>
          <li className="flex-1">
            <Link
              href="/precos"
              aria-current={
                pathname.startsWith("/precos") ? "page" : undefined
              }
              className="flex min-h-14 flex-col items-center justify-center gap-1 py-1 text-mare-slate"
            >
              <Tag
                className={cn(
                  "h-6 w-6",
                  pathname.startsWith("/precos") && "text-mare-purple"
                )}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-lg font-semibold",
                  pathname.startsWith("/precos") && "text-mare-purple"
                )}
              >
                Meus Preços
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
