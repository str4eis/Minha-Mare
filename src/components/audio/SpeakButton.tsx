"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  isSpeechSynthesisSupported,
  speakText,
} from "@/lib/audio/speech";

interface SpeakButtonProps {
  text: string;
  label?: string;
}

export default function SpeakButton({
  text,
  label = "Ouvir",
}: SpeakButtonProps) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setSupported(isSpeechSynthesisSupported());
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  if (!supported) return null;

  function toggleSpeech() {
    if (speaking) {
      cleanupRef.current?.();
      cleanupRef.current = null;
      setSpeaking(false);
      return;
    }

    cleanupRef.current = speakText(text, setSpeaking);
  }

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      aria-label={speaking ? "Parar leitura em voz alta" : label}
      aria-pressed={speaking}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-mare-institutional px-4 text-lg font-semibold text-white shadow-soft"
    >
      <Volume2 className="h-6 w-6" aria-hidden="true" />
      {speaking ? "Parar" : label}
    </button>
  );
}
