export interface SpeechRecognitionAlternative {
  transcript: string;
}

export interface SpeechRecognitionResult
  extends ArrayLike<SpeechRecognitionAlternative> {
  isFinal: boolean;
}

export interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
}

export interface SpeechRecognitionErrorEvent {
  error: string;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export interface SpeechRecognitionCallbacks {
  onTranscript: (transcript: string) => void;
  onError: (message: string) => void;
  onEnd?: () => void;
}

export interface SpeechRecognitionSession {
  stop: () => void;
  cancel: () => void;
}

export function getSpeechRecognitionConstructor():
  | SpeechRecognitionConstructor
  | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as SpeechRecognitionWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(
  Recognition = getSpeechRecognitionConstructor()
): boolean {
  return Recognition !== null;
}

export function getSpeechRecognitionErrorMessage(
  error: string
): string | null {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
    case "NotAllowedError":
    case "SecurityError":
      return "Permita o uso do microfone para ditar.";
    case "no-speech":
      return "Não ouvi nada. Tente falar de novo.";
    case "audio-capture":
      return "Não encontrei o microfone.";
    case "network":
      return "Sem internet. Tente de novo.";
    case "aborted":
      return null;
    default:
      return "Não deu para ouvir. Tente de novo.";
  }
}

function getErrorName(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string"
  ) {
    return error.name;
  }
  return "";
}

export function startSpeechRecognition(
  callbacks: SpeechRecognitionCallbacks,
  Recognition = getSpeechRecognitionConstructor()
): SpeechRecognitionSession | null {
  if (!Recognition) return null;

  let recognition: SpeechRecognitionLike;
  try {
    recognition = new Recognition();
  } catch (error) {
    const message = getSpeechRecognitionErrorMessage(getErrorName(error));
    if (message) callbacks.onError(message);
    callbacks.onEnd?.();
    return null;
  }

  recognition.lang = "pt-BR";
  recognition.continuous = true;
  recognition.interimResults = true;

  let finished = false;
  const detachHandlers = () => {
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    detachHandlers();
    callbacks.onEnd?.();
  };

  recognition.onresult = (event) => {
    const transcripts: string[] = [];
    for (let index = 0; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result?.[0]?.transcript.trim();
      if (transcript) transcripts.push(transcript);
    }
    if (transcripts.length > 0) callbacks.onTranscript(transcripts.join(" "));
  };
  recognition.onerror = (event) => {
    const message = getSpeechRecognitionErrorMessage(event.error);
    if (message) callbacks.onError(message);
    finish();
  };
  recognition.onend = finish;

  try {
    recognition.start();
  } catch (error) {
    const message = getSpeechRecognitionErrorMessage(getErrorName(error));
    if (message) callbacks.onError(message);
    finish();
    return null;
  }

  return {
    stop: () => {
      if (finished) return;
      try {
        recognition.stop();
      } catch (error) {
        const message = getSpeechRecognitionErrorMessage(getErrorName(error));
        if (message) callbacks.onError(message);
        finish();
      }
    },
    cancel: () => {
      if (finished) return;
      finished = true;
      detachHandlers();
      try {
        recognition.abort();
      } catch {
        // Stopping a session during cleanup is best effort.
      }
    },
  };
}
