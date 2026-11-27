"use client";

import Link from "next/link";
import { Waves, X } from "lucide-react";

interface HeaderProps {
  variant?: "profile" | "close";
  closeHref?: string;
}

export default function Header({ variant = "profile", closeHref = "/vendas" }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-4">
      <Link href="/home" className="flex items-center gap-2">
        <Waves className="h-6 w-6 text-mare-purple" strokeWidth={2.4} />
        <span className="font-display italic text-[22px] font-semibold text-mare-purple tracking-tight">
          Minha Maré
        </span>
      </Link>
      {variant === "close" && (
        <Link
          href={closeHref}
          aria-label="Fechar"
          className="h-9 w-9 rounded-full flex items-center justify-center text-mare-ink hover:bg-mare-card transition-colors"
        >
          <X className="h-6 w-6" strokeWidth={1.8} />
        </Link>
      )}
    </header>
  );
}
