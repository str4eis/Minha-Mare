import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import LegalLinks from "@/components/ui/LegalLinks";

interface LegalPageShellProps {
  children: ReactNode;
  title: string;
  updatedAt: string;
}

export default function LegalPageShell({
  children,
  title,
  updatedAt,
}: LegalPageShellProps) {
  return (
    <main className="min-h-dvh bg-mare-bg">
      <header className="bg-white px-5 py-4 shadow-card">
        <Link href="/" className="mx-auto flex w-fit items-center gap-3">
          <Image
            src="/logo-reginas.png"
            alt="Logo do projeto Reginas"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <span className="font-display text-xl font-semibold text-mare-institutional">
            Minha Maré
          </span>
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <Link
          href="/"
          className="mb-4 inline-flex min-h-14 items-center text-lg font-medium text-mare-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mare-primary"
        >
          ← Voltar
        </Link>

        <article className="rounded-xl2 bg-white p-5 shadow-card sm:p-8">
          <h1 className="font-display text-3xl font-semibold leading-tight text-mare-institutional">
            {title}
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-mare-secondary">
            Última atualização: {updatedAt}
          </p>
          <div className="mt-7 space-y-7 text-lg leading-relaxed text-mare-secondary">
            {children}
          </div>
        </article>

        <footer className="mt-6 rounded-xl2 bg-white p-5 shadow-card">
          <LegalLinks className="text-lg text-mare-secondary" />
          <Link
            href="/"
            className="mt-4 flex min-h-14 items-center justify-center text-lg font-medium text-mare-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mare-primary"
          >
            Voltar para o início
          </Link>
        </footer>
      </div>
    </main>
  );
}
