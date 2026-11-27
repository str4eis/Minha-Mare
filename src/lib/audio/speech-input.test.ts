import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getSpeechRecognitionErrorMessage,
  isSpeechRecognitionSupported,
  SpeechRecognitionLike,
  SpeechRecognitionResultEvent,
  startSpeechRecognition,
} from "./speech-input";

afterEach(() => vi.unstubAllGlobals());

function createRecognition() {
  const instances: FakeRecognition[] = [];

  class FakeRecognition implements SpeechRecognitionLike {
    lang = "";
    continuous = true;
    interimResults = true;
    onresult: ((event: SpeechRecognitionResultEvent) => void) | null = null;
    onerror:
      | ((event: { error: string }) => void)
      | null = null;
    onend: (() => void) | null = null;
    start = vi.fn();
    stop = vi.fn();
    abort = vi.fn();

    constructor() {
      instances.push(this);
    }
  }

  return { Constructor: FakeRecognition, instances };
}

describe("speech input", () => {
  it("does not start when the browser has no speech recognition API", () => {
    expect(isSpeechRecognitionSupported()).toBe(false);
    expect(isSpeechRecognitionSupported(null)).toBe(false);
    expect(
      startSpeechRecognition(
        { onTranscript: vi.fn(), onError: vi.fn() },
        null
      )
    ).toBeNull();
  });

  it("detects the standard and WebKit browser APIs", () => {
    const { Constructor } = createRecognition();
    vi.stubGlobal("window", { SpeechRecognition: Constructor });
    expect(isSpeechRecognitionSupported()).toBe(true);

    vi.stubGlobal("window", { webkitSpeechRecognition: Constructor });
    expect(isSpeechRecognitionSupported()).toBe(true);
  });

  it("starts Portuguese dictation and captures interim transcripts", () => {
    const { Constructor, instances } = createRecognition();
    const onTranscript = vi.fn();
    const session = startSpeechRecognition(
      { onTranscript, onError: vi.fn() },
      Constructor
    );
    const recognition = instances[0];
    const result = Object.assign([{ transcript: "Siri" }], { isFinal: true });

    expect(session).not.toBeNull();
    expect(recognition.lang).toBe("pt-BR");
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(true);
    expect(recognition.start).toHaveBeenCalledOnce();

    const previousResult = Object.assign(
      [{ transcript: "Caranguejo" }],
      { isFinal: true }
    );
    recognition.onresult?.({
      resultIndex: 1,
      results: [previousResult, result],
    });

    expect(onTranscript).toHaveBeenCalledWith("Caranguejo Siri");
  });

  it("stops or cancels an active listening session", () => {
    const { Constructor, instances } = createRecognition();
    const stopped = startSpeechRecognition(
      { onTranscript: vi.fn(), onError: vi.fn() },
      Constructor
    );
    stopped?.stop();
    expect(instances[0].stop).toHaveBeenCalledOnce();

    const cancelled = startSpeechRecognition(
      { onTranscript: vi.fn(), onError: vi.fn() },
      Constructor
    );
    cancelled?.cancel();
    expect(instances[1].abort).toHaveBeenCalledOnce();
    expect(instances[1].onresult).toBeNull();
  });

  it("maps microphone and no-speech errors to helpful Portuguese", () => {
    const { Constructor, instances } = createRecognition();
    const onError = vi.fn();
    const onEnd = vi.fn();
    startSpeechRecognition(
      { onTranscript: vi.fn(), onError, onEnd },
      Constructor
    );

    instances[0].onerror?.({ error: "not-allowed" });
    expect(onError).toHaveBeenLastCalledWith(
      "Permita o uso do microfone para ditar."
    );
    expect(onEnd).toHaveBeenCalledOnce();

    const noSpeechError = vi.fn();
    startSpeechRecognition(
      { onTranscript: vi.fn(), onError: noSpeechError },
      Constructor
    );
    instances[1].onerror?.({ error: "no-speech" });
    expect(noSpeechError).toHaveBeenLastCalledWith(
      "Não ouvi nada. Tente falar de novo."
    );
    expect(getSpeechRecognitionErrorMessage("aborted")).toBeNull();
  });
});
