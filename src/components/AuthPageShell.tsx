import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import LegalLinks from "@/components/LegalLinks";

interface AuthPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthPageShell({
  title,
  description,
  children,
}: AuthPageShellProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-gradient-to-b from-mare-purpleLight/50 via-white to-white px-6 py-8">
      <Link
        href="/"
        className="-mx-6 -mt-8 flex flex-col items-center bg-white px-6 pb-5 pt-4"
      >
        <Image
          src="/logo-reginas.png"
          alt="Logo do projeto Reginas"
          width={160}
          height={160}
          priority
          className="h-40 w-40 object-contain"
        />
        <span className="font-display text-xl font-semibold text-mare-institutional">
          Minha Maré
        </span>
      </Link>
      <section className="my-auto w-full">
        <h1 className="mt-8 text-2xl font-semibold text-mare-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-mare-slate">{description}</p>
        <div className="mt-6">{children}</div>
      </section>
      <footer className="mt-auto pt-8 text-xs text-mare-slate">
        <LegalLinks />
      </footer>
    </main>
  );
}
