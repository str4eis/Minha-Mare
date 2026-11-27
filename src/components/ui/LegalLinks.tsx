import Link from "next/link";

interface LegalLinksProps {
  className?: string;
}

export default function LegalLinks({ className = "" }: LegalLinksProps) {
  return (
    <nav
      aria-label="Links legais"
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${className}`}
    >
      <Link
        href="/privacidade"
        className="underline decoration-mare-slate/40 underline-offset-4 hover:text-mare-primary"
      >
        Privacidade
      </Link>
      <span aria-hidden="true">·</span>
      <Link
        href="/termos"
        className="underline decoration-mare-slate/40 underline-offset-4 hover:text-mare-primary"
      >
        Termos de Uso
      </Link>
    </nav>
  );
}
