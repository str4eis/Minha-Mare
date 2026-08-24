"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Waves, ArrowRight, Ship, Fish, ReceiptText } from "lucide-react";
import { useStore } from "@/lib/store";

export default function WelcomePage() {
  const { state, hydrated, finishOnboarding } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && state.onboarded) {
      router.replace("/home");
    }
  }, [hydrated, state.onboarded, router]);

  const handleStart = () => {
    finishOnboarding();
    router.push("/home");
  };

  return (
    <div className="flex flex-col min-h-dvh px-6 pt-8 pb-8 bg-gradient-to-b from-mare-purpleLight/70 via-white to-white">
      <div className="flex items-center gap-2">
        <Waves className="h-7 w-7 text-mare-purple" strokeWidth={2.4} />
        <span className="font-display italic text-[26px] font-semibold text-mare-purple">
          Minha Maré
        </span>
      </div>

      <div className="mt-8 rounded-xl2 overflow-hidden shadow-soft border border-black/5">
        <svg
          viewBox="0 0 400 320"
          className="w-full h-64"
          role="img"
          aria-label="Ilustração de manguezal ao entardecer com águas da maré"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F1E7FB" />
              <stop offset="100%" stopColor="#C3F0E5" />
            </linearGradient>
            <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3FC8B4" />
              <stop offset="100%" stopColor="#0B6D64" />
            </linearGradient>
          </defs>
          <rect width="400" height="320" fill="url(#sky)" />
          <circle cx="330" cy="70" r="34" fill="#F7C948" opacity="0.9" />
          <path d="M0 190 C 60 170, 120 210, 180 190 S 300 170, 400 195 V320 H0 Z" fill="url(#water)" />
          <path d="M0 210 C 60 195, 120 225, 180 210 S 300 195, 400 215 V320 H0 Z" fill="#0B6D64" opacity="0.55" />
          {/* mangrove roots */}
          <g stroke="#3B1A5C" strokeWidth="4" strokeLinecap="round" opacity="0.85">
            <path d="M40 320 L60 220 L30 180" fill="none" />
            <path d="M60 220 L95 230 L120 190" fill="none" />
            <path d="M95 230 L90 320" fill="none" />
            <path d="M340 320 L365 230 L340 175" fill="none" />
            <path d="M365 230 L390 245 L400 210" fill="none" />
          </g>
          <ellipse cx="60" cy="175" rx="36" ry="20" fill="#5B2A86" opacity="0.85" />
          <ellipse cx="355" cy="165" rx="30" ry="18" fill="#5B2A86" opacity="0.75" />
          {/* basket */}
          <path d="M170 250 q30 -14 60 0 l-8 34 q-22 10 -44 0 z" fill="#F7C948" stroke="#8A6212" strokeWidth="2" />
          <path d="M172 250 q28 16 56 0" fill="none" stroke="#8A6212" strokeWidth="2" />
        </svg>
      </div>

      <div className="mt-8 text-center px-2">
        <p className="font-display italic text-2xl text-mare-ink">Boas-vindas!</p>
        <p className="mt-3 text-mare-slate leading-relaxed">
          Organize suas vendas e acompanhe seus resultados
        </p>
      </div>

      <div className="mt-auto pt-10">
        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-mare-tealDark text-white font-semibold text-lg py-4 shadow-soft active:scale-[0.99] transition-transform"
        >
          Começar
          <ArrowRight className="h-5 w-5" />
        </button>
        <p className="mt-4 text-center text-[11px] tracking-widest text-mare-slate uppercase">
          Sua maré, seu trabalho, sua conta.
        </p>
        <div className="mt-5 flex items-center justify-center gap-6 text-mare-tealDark/70">
          <Ship className="h-5 w-5" />
          <Waves className="h-5 w-5" />
          <ReceiptText className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
