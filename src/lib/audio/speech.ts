export type SpeechEvent = "start" | "end" | "error";

export interface SpeechOptions {
  lang: "pt-BR";
  rate: 0.95;
}

export interface SpeechSynthesisPort {
  cancel: () => void;
  speak: (
    text: string,
    options: SpeechOptions,
    onEvent: (event: SpeechEvent) => void
  ) => void;
}

let activeSpeech:
  | {
      id: number;
      port: SpeechSynthesisPort;
      onSpeakingChange: (speaking: boolean) => void;
    }
  | null = null;
let nextSpeechId = 0;

export function getSpeechSynthesisPort(): SpeechSynthesisPort | null {
  if (typeof window === "undefined") return null;

  try {
    const synthesis = window.speechSynthesis;
    if (
      !synthesis ||
      typeof synthesis.cancel !== "function" ||
      typeof synthesis.speak !== "function" ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return null;
    }

    return {
      cancel: () => synthesis.cancel(),
      speak: (text, options, onEvent) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang;
        utterance.rate = options.rate;
        utterance.onstart = () => onEvent("start");
        utterance.onend = () => onEvent("end");
        utterance.onerror = () => onEvent("error");
        synthesis.speak(utterance);
      },
    };
  } catch {
    return null;
  }
}

export function isSpeechSynthesisSupported(
  port = getSpeechSynthesisPort()
): boolean {
  return port !== null;
}

function cancelSpeech(id: number, port: SpeechSynthesisPort): void {
  if (activeSpeech?.id !== id) return;

  const current = activeSpeech;
  activeSpeech = null;
  current.onSpeakingChange(false);

  try {
    port.cancel();
  } catch {
    // Some embedded browsers expose the API but do not allow playback.
  }
}

export function stopSpeech(): void {
  if (activeSpeech) cancelSpeech(activeSpeech.id, activeSpeech.port);
}

export function speakText(
  text: string,
  onSpeakingChange: (speaking: boolean) => void,
  port = getSpeechSynthesisPort()
): (() => void) | null {
  if (!port || !text.trim()) {
    onSpeakingChange(false);
    return null;
  }

  if (activeSpeech) cancelSpeech(activeSpeech.id, activeSpeech.port);

  const id = ++nextSpeechId;
  activeSpeech = { id, port, onSpeakingChange };
  onSpeakingChange(true);

  try {
    port.cancel();
    port.speak(
      text,
      { lang: "pt-BR", rate: 0.95 },
      (event) => {
        if (activeSpeech?.id !== id) return;
        if (event === "start") {
          onSpeakingChange(true);
          return;
        }

        activeSpeech = null;
        onSpeakingChange(false);
      }
    );
  } catch {
    if (activeSpeech?.id === id) {
      activeSpeech = null;
      onSpeakingChange(false);
    }
    return null;
  }

  return () => cancelSpeech(id, port);
}
