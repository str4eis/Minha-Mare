"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LegalLinks from "@/components/ui/LegalLinks";
import GoogleSignInButton from "@/components/ui/GoogleSignInButton";
import { getSessionRedirectPath } from "@/lib/auth/oauth";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const router = useRouter();
  const [sessionError, setSessionError] = useState("");
  const redirecting = useRef(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => undefined;

    const redirectForSession = (session: { user: unknown } | null) => {
      if (!active || redirecting.current) return;
      const destination = getSessionRedirectPath(session);
      if (!destination) return;

      redirecting.current = true;
      router.replace(destination);
    };

    const showSessionError = () => {
      if (active && !redirecting.current) {
        setSessionError("Não foi possível verificar seu acesso. Tente novamente.");
      }
    };

    try {
      const auth = createClient().auth;
      const { data } = auth.onAuthStateChange((_event, session) => {
        redirectForSession(session);
      });
      unsubscribe = () => data.subscription.unsubscribe();

      void auth
        .getSession()
        .then(({ data: sessionData, error }) => {
          if (!active) return;
          if (error) {
            showSessionError();
            return;
          }
          redirectForSession(sessionData.session);
        })
        .catch(showSessionError);
    } catch {
      showSessionError();
    }

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

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
            <p className="mt-2 text-lg leading-relaxed text-mare-secondary">
              Controle suas vendas e gastos da maré, do seu jeito.
            </p>
            {sessionError && (
              <p role="alert" className="mt-3 text-base text-mare-negative">
                {sessionError}
              </p>
            )}
            <div className="mt-5 grid gap-3">
              <GoogleSignInButton nextPath="/home" />
              <Link
                href="/login?modo=email"
                className="flex min-h-14 w-full items-center justify-center px-4 text-lg font-medium text-mare-primary underline underline-offset-4"
              >
                Entrar com e-mail e senha
              </Link>
            </div>
          </div>
        </div>
        <LegalLinks className="pt-4 text-xs text-mare-slate" />
      </section>
    </main>
  );
}
