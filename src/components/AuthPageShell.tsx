import Link from "next/link";
import { Waves } from "lucide-react";
import type { ReactNode } from "react";

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
    <main className="flex min-h-dvh flex-col bg-gradient-to-b from-mare-purpleLight/70 via-white to-white px-6 py-8">
      <Link href="/" className="flex items-center gap-2">
        <Waves className="h-7 w-7 text-mare-purple" strokeWidth={2.4} />
        <span className="font-display text-[26px] font-semibold italic text-mare-purple">
          Minha Maré
        </span>
      </Link>
      <section className="my-auto w-full">
        <h1 className="mt-10 text-2xl font-semibold text-mare-ink">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-mare-slate">{description}</p>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
