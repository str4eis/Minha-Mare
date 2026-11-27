"use client";

import Link from "next/link";
import Image from "next/image";
import { UserRound, X } from "lucide-react";

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
          className="flex h-10 w-10 items-center justify-center rounded-full text-mare-primary transition-colors hover:bg-mare-purpleLight"
        >
          <X className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </Link>
      ) : (
        <Link
          href="/perfil"
          aria-label="Abrir perfil"
          className="flex h-10 w-10 items-center justify-center rounded-full text-mare-primary transition-colors hover:bg-mare-purpleLight"
        >
          <UserRound className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        </Link>
      )}
    </header>
  );
}
