"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleDollarSign, Home, PlusCircle, Undo2 } from "lucide-react";
import { cn } from "@/lib/cn";
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
            className="flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-lg font-semibold text-mare-institutional"
          >
            <Undo2 className="h-5 w-5" aria-hidden="true" />
            Desfazer
          </button>
        </div>
      )}

      {showChoices && (
        <div
          id="anotar-options"
          className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 mx-auto grid max-w-md grid-cols-2 gap-3 rounded-xl2 bg-white p-3 shadow-soft"
          role="group"
          aria-label="Escolha o que anotar"
        >
          <Link
            href="/vendas/nova"
            onClick={() => setShowChoices(false)}
            className="flex min-h-14 items-center justify-center rounded-xl2 bg-mare-purple px-3 text-center text-lg font-semibold text-white"
          >
            Anotar venda
          </Link>
          <Link
            href="/gastos/novo"
            onClick={() => setShowChoices(false)}
            className="flex min-h-14 items-center justify-center rounded-xl2 bg-mare-primary px-3 text-center text-lg font-semibold text-white"
          >
            Anotar gasto
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
              href="/resultados"
              aria-current={
                pathname.startsWith("/resultados") ? "page" : undefined
              }
              className="flex min-h-14 flex-col items-center justify-center gap-1 py-1 text-mare-slate"
            >
              <CircleDollarSign
                className={cn(
                  "h-6 w-6",
                  pathname.startsWith("/resultados") && "text-mare-purple"
                )}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "text-lg font-semibold",
                  pathname.startsWith("/resultados") && "text-mare-purple"
                )}
              >
                Sobrou
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
