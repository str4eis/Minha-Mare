"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  variant?: "profile" | "close";
  closeHref?: string;
}

export default function Header({ variant = "profile", closeHref = "/vendas" }: HeaderProps) {
  return (
    <header className="flex items-center justify-between bg-white px-5 pb-4 pt-5">
      <Link href="/home" className="flex min-w-0 items-center gap-2">
        <span className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center bg-white">
          <Image
            src="/logo-reginas.png"
            alt="Logo do projeto Reginas"
            width={44}
            height={44}
            priority
            className="h-11 w-11 object-contain"
          />
        </span>
        <span className="truncate font-display text-[20px] font-semibold tracking-tight text-mare-institutional">
          Minha Maré
        </span>
      </Link>
      {variant === "close" ? (
        <Link
          href={closeHref}
          aria-label="Fechar"
          className="flex min-h-14 shrink-0 items-center gap-2 rounded-full px-3 text-lg font-semibold text-mare-primary transition-colors hover:bg-mare-purpleLight"
        >
          <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          <span>Fechar</span>
        </Link>
      ) : (
        <Link
          href="/mais"
          className="flex min-h-14 shrink-0 items-center gap-2 rounded-full px-2 text-lg font-semibold text-mare-primary transition-colors hover:bg-mare-purpleLight"
        >
          <Menu className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          <span>Mais</span>
        </Link>
      )}
    </header>
  );
}
