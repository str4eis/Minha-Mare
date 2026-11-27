import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSpeechSynthesisPort,
  isSpeechSynthesisSupported,
  speakText,
  stopSpeech,
  SpeechEvent,
  SpeechOptions,
  SpeechSynthesisPort,
} from "./speech";

afterEach(() => stopSpeech());

function createSpeechPort() {
  const events: Array<(event: SpeechEvent) => void> = [];
  const calls: Array<{ text: string; options: SpeechOptions }> = [];
  const port: SpeechSynthesisPort = {
    cancel: vi.fn(),
    speak: vi.fn((text, options, onEvent) => {
      calls.push({ text, options });
      events.push(onEvent);
    }),
  };

  return { port, events, calls };
}

describe("speech synthesis", () => {
  it("reports no support when the browser API is unavailable", () => {
    expect(getSpeechSynthesisPort()).toBeNull();
    expect(isSpeechSynthesisSupported()).toBe(false);
    expect(isSpeechSynthesisSupported(null)).toBe(false);

    const onSpeakingChange = vi.fn();
    expect(speakText("Olá", onSpeakingChange, null)).toBeNull();
    expect(onSpeakingChange).toHaveBeenCalledWith(false);
  });

  it("starts a slower Portuguese voice", () => {
    const { port, calls } = createSpeechPort();
    const onSpeakingChange = vi.fn();

    speakText("Olá", onSpeakingChange, port);

    expect(calls).toEqual([
      { text: "Olá", options: { lang: "pt-BR", rate: 0.95 } },
    ]);
    expect(onSpeakingChange).toHaveBeenCalledWith(true);
  });

  it("cancels the previous speech before starting another", () => {
    const { port, calls } = createSpeechPort();
    const firstState = vi.fn();
    const firstCleanup = speakText("Primeira fala", firstState, port);

    speakText("Segunda fala", vi.fn(), port);

    expect(port.cancel).toHaveBeenCalledTimes(3);
    expect(calls.map(({ text }) => text)).toEqual([
      "Primeira fala",
      "Segunda fala",
    ]);
    expect(firstState).toHaveBeenLastCalledWith(false);

    firstCleanup?.();
    expect(port.cancel).toHaveBeenCalledTimes(3);
  });

  it("tracks playback until the speech ends or is stopped", () => {
    const { port, events } = createSpeechPort();
    const onSpeakingChange = vi.fn();
    const cleanup = speakText("Resumo", onSpeakingChange, port);

    expect(onSpeakingChange).toHaveBeenLastCalledWith(true);
    events[0]("end");
    expect(onSpeakingChange).toHaveBeenLastCalledWith(false);

    const stopState = vi.fn();
    const stop = speakText("Outra fala", stopState, port);
    stop?.();
    expect(stopState).toHaveBeenLastCalledWith(false);
  });
});
