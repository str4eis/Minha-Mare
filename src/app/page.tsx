import Link from "next/link";
import Image from "next/image";
import LegalLinks from "@/components/LegalLinks";

export default function WelcomePage() {
  return (
    <main className="flex h-dvh min-h-dvh flex-col overflow-hidden bg-mare-brand">
      <div className="flex h-[58%] shrink-0 items-center justify-center bg-mare-brand">
        <Image
          src="/logo-reginas-branca.png"
          alt="Logo do projeto Reginas"
          width={320}
          height={320}
          priority
          className="h-[min(48dvh,320px)] w-[min(48dvh,320px)] object-contain"
        />
      </div>

      <section className="-mt-5 flex min-h-0 flex-1 flex-col rounded-t-[32px] bg-white px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-6 shadow-[0_-8px_24px_rgba(88,28,135,0.12)]">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center text-center">
          <div>
            <h1 className="font-display text-[28px] font-semibold leading-9 text-mare-institutional">
              Minha Maré
            </h1>
            <p className="mt-2 text-sm leading-5 text-mare-secondary">
              Controle suas vendas e gastos da maré, do seu jeito.
            </p>
            <div className="mt-5 grid gap-3">
              <Link
                href="/cadastro"
                className="flex min-h-12 w-full items-center justify-center rounded-full bg-mare-primary px-4 text-base font-semibold text-white shadow-soft transition-transform active:scale-[0.99]"
              >
                Criar conta
              </Link>
              <Link
                href="/login"
                className="flex min-h-12 w-full items-center justify-center rounded-full border-2 border-mare-primary px-4 text-base font-semibold text-mare-primary transition-colors hover:bg-mare-purpleLight"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
        <LegalLinks className="pt-4 text-xs text-mare-slate" />
      </section>
    </main>
  );
}
