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

let voiceRotationCursor = 0;

/**
 * Talker variability (#30): round-robins through the available German voices
 * so consecutive utterances differ (round-robin, not random, guarantees that).
 * Returns undefined under 2 voices, degrading to the default `voices[0]`.
 * Note: the cursor also advances for utterances cancelled by `synth.cancel()`
 * on rapid taps; cosmetic, no fix needed.
 */
export function nextGermanVoiceURI(): string | undefined {
  const voices = getGermanVoices();
  if (voices.length < 2) return undefined;
  const voice = voices[voiceRotationCursor % voices.length];
  voiceRotationCursor += 1;
  return voice.voiceURI;
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  /** Rotate through the available German voices instead of the default. Ignored when `voiceURI` is set. */
  variety?: boolean;
  /**
   * Called once when the utterance is over, whichever way it ended: finished,
   * cancelled or failed. A caller that gates UI on "is it still speaking"
   * (the exam's Hören play button) would otherwise latch forever on an
   * utterance that errored, because `onend` does not fire for those.
   */
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
  // Precedence: a pinned voiceURI wins, else variety rotation, else voices[0].
  const resolvedURI = opts.voiceURI ?? (opts.variety ? nextGermanVoiceURI() : undefined);
  const chosen = (resolvedURI && voices.find((v) => v.voiceURI === resolvedURI)) || voices[0];
  if (chosen) u.voice = chosen;
  if (opts.onEnd) {
    let fired = false;
    const done = () => {
      if (fired) return;
      fired = true;
      opts.onEnd!();
    };
    u.onend = done;
    u.onerror = done;
  }
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

/**
 * Fold the result list into one transcript (s209).
 *
 * A segment that RESTATES the previous one and extends it replaces it instead
 * of being appended. iOS Safari grows an utterance by re-delivering it as a
 * longer prefix ("hallo" · "hallo Petra" · "hallo Petra ich"), so appending
 * every piece is what wrote a sentence out word by word, over and over.
 * Comparison is case-insensitive because a browser may capitalise the segment
 * only once it settles.
 */
export function joinTranscript(chunks: string[]): string {
  const out: string[] = [];
  for (const raw of chunks) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const prev = out[out.length - 1];
    if (prev && chunk.toLowerCase().startsWith(prev.toLowerCase())) out[out.length - 1] = chunk;
    else out.push(chunk);
  }
  return out.join(" ");
}

/**
 * Open the microphone. Both text callbacks report the WHOLE transcript heard
 * since this call, never a delta, and both are safe to re-deliver: each event
 * rebuilds the transcript from the full result list rather than accumulating
 * on the caller's side. That is what a browser re-sending a result it has
 * already sent requires (iOS Safari does exactly that, and also flags interim
 * results as final), and it is why a caller must ASSIGN what it receives here.
 */
export function listen(handlers: {
  /** The full transcript so far, including the live, still-changing tail. */
  onPartial?: (text: string) => void;
  /** The full settled transcript so far. Fires only when that text changes. */
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

  let lastFinal = "";

  rec.onresult = (e: any) => {
    const finals: string[] = [];
    const interims: string[] = [];
    for (let i = 0; i < e.results.length; i++) {
      const r = e.results?.[i];
      const text = r?.[0]?.transcript;
      if (typeof text !== "string") continue;
      (r.isFinal ? finals : interims).push(text);
    }
    const final = joinTranscript(finals);
    const live = joinTranscript([final, ...interims]);
    handlers.onPartial?.(live);
    if (final !== lastFinal) {
      lastFinal = final;
      handlers.onFinal?.(final);
    }
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
