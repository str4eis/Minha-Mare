"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Landmark, Wallet, BarChart3 } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/vendas", label: "Vendas", icon: Landmark },
  { href: "/gastos", label: "Gastos", icon: Wallet },
  { href: "/resultados", label: "Resultados", icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 mt-auto bg-white border-t border-black/5 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <ul className="flex items-end justify-between">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-1 group"
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all",
                    active
                      ? "h-11 w-11 bg-mare-purple text-white shadow-soft -translate-y-2"
                      : "h-8 w-8 text-mare-slate group-hover:text-mare-purple"
                  )}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium tracking-tight",
                    active ? "text-mare-purple" : "text-mare-slate"
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
