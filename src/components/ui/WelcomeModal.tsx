"use client";

import { Check, X } from "lucide-react";
import SpeakButton from "../audio/SpeakButton";
import {
  getWelcomeVideoEmbedUrl,
  markWelcomeAsSeen,
} from "../../lib/storage/welcome";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const welcomeExplanation =
  "No Minha Maré, você anota suas vendas e seus gastos. " +
  "Assim, acompanha o que entrou, saiu e sobrou. " +
  "Toque em Anotar para registrar uma venda ou um gasto. " +
  "Em Mais, você encontra seu histórico e seus relatórios.";

export default function WelcomeModal({
  open,
  onClose,
}: WelcomeModalProps) {
  if (!open) return null;

  const handleClose = () => {
    markWelcomeAsSeen();
    onClose();
  };
  const videoUrl = getVideoUrl();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        className="flex max-h-[92dvh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-soft"
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth p-5">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="welcome-modal-title"
              className="text-xl font-semibold text-mare-institutional"
            >
              Bem-vinda ao Minha Maré
            </h2>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fechar boas-vindas"
              className="flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full px-3 text-lg font-semibold text-mare-institutional"
            >
              <X className="h-5 w-5" aria-hidden="true" />
              <span>Fechar</span>
            </button>
          </div>

          {videoUrl && (
            <div className="mx-auto mt-3 aspect-[9/16] h-[56dvh] max-h-[56dvh] w-[min(31.5dvh,100%)] overflow-hidden rounded-2xl bg-black">
              <iframe
                src={videoUrl}
                title="Vídeo de boas-vindas do Minha Maré"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          )}

          <p className="mt-4 text-lg leading-relaxed text-mare-ink">
            {welcomeExplanation}
          </p>
          <div className="mt-3">
            <SpeakButton
              label="Ouvir explicação"
              text={welcomeExplanation}
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-black/5 bg-white p-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-mare-primary px-4 text-lg font-semibold text-white shadow-soft"
          >
            <Check className="h-5 w-5" aria-hidden="true" />
            Entendi, começar
          </button>
        </div>
      </div>
    </div>
  );
}

function getVideoUrl(): string | null {
  return getWelcomeVideoEmbedUrl(
    process.env.NEXT_PUBLIC_WELCOME_VIDEO_ID
  );
}
