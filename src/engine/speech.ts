/**
 * Thin, feature-detected wrappers around the Web Speech API.
 * Everything degrades gracefully when the browser lacks support.
 */

export const ttsSupported = (): boolean =>
  typeof window !== "undefined" && "speechSynthesis" in window;

let cachedVoices: SpeechSynthesisVoice[] = [];

export function getGermanVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return [];
  if (cachedVoices.length === 0) cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices.filter((v) => v.lang.toLowerCase().startsWith("de"));
}

if (ttsSupported()) {
  // Voices may load asynchronously.
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!ttsSupported()) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = opts.rate ?? 0.95;
  u.pitch = opts.pitch ?? 1;
  const voices = getGermanVoices();
  const chosen =
    (opts.voiceURI && voices.find((v) => v.voiceURI === opts.voiceURI)) || voices[0];
  if (chosen) u.voice = chosen;
  if (opts.onEnd) u.onend = opts.onEnd;
  synth.speak(u);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/* ---------------- Speech recognition (optional) ---------------- */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export const recognitionSupported = (): boolean => getRecognitionCtor() !== null;

export interface RecognitionHandle {
  stop: () => void;
}

export function listen(handlers: {
  onPartial?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}): RecognitionHandle | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "de-DE";
  rec.continuous = true;
  rec.interimResults = true;

  rec.onresult = (e: any) => {
    let interim = "";
    let final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (interim) handlers.onPartial?.(interim);
    if (final) handlers.onFinal?.(final);
  };
  rec.onerror = (e: any) => handlers.onError?.(e?.error ?? "unknown");
  rec.onend = () => handlers.onEnd?.();

  try {
    rec.start();
  } catch {
    return null;
  }
  return { stop: () => rec.stop() };
}
