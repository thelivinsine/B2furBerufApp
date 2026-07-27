import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  claimLiveWork,
  hasLiveWork,
  liveWorkLabels,
  flushLiveWork,
  resetLiveWork,
} from "@/lib/liveWork";
import {
  saveAutosavedDraft,
  loadAutosavedDraft,
  clearAutosavedDraft,
} from "@/features/writing/draftAutosave";
import {
  sessionSignature,
  saveSessionSnapshot,
  loadSessionSnapshot,
  clearSessionSnapshot,
} from "@/features/session/sessionResume";
import type { SessionPlan } from "@/types";

/**
 * s172: a deploy landing mid-task used to reload the page and destroy the
 * learner's draft / running session. These cover both halves of the fix — the
 * "wait, work is open" signal and the persistence that makes any unavoidable
 * reload recoverable.
 */

describe("live-work registry", () => {
  beforeEach(() => resetLiveWork());

  it("reports no live work when nothing is claimed", () => {
    expect(hasLiveWork()).toBe(false);
  });

  it("holds a claim until it is released", () => {
    const release = claimLiveWork({ label: "writing:kurz" });
    expect(hasLiveWork()).toBe(true);
    expect(liveWorkLabels()).toEqual(["writing:kurz"]);
    release();
    expect(hasLiveWork()).toBe(false);
  });

  it("tracks concurrent claims independently", () => {
    const a = claimLiveWork({ label: "writing:fokus" });
    const b = claimLiveWork({ label: "session" });
    a();
    expect(hasLiveWork()).toBe(true);
    expect(liveWorkLabels()).toEqual(["session"]);
    b();
    expect(hasLiveWork()).toBe(false);
  });

  it("flushes every claim, and a throwing handler cannot block the others", () => {
    const ok = vi.fn();
    claimLiveWork({
      label: "broken",
      flush: () => {
        throw new Error("storage full");
      },
    });
    claimLiveWork({ label: "session", flush: ok });
    expect(() => flushLiveWork()).not.toThrow();
    expect(ok).toHaveBeenCalledTimes(1);
  });

  it("does not flush a released claim", () => {
    const flush = vi.fn();
    claimLiveWork({ label: "writing:lang", flush })();
    flushLiveWork();
    expect(flush).not.toHaveBeenCalled();
  });
});

describe("writing draft autosave", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a guided draft with its Aufgabe", () => {
    saveAutosavedDraft({
      mode: "kurz",
      text: "Sehr geehrte Frau Meier,",
      theme: "behoerde",
      length: "short",
      promptIndex: 3,
    });
    const draft = loadAutosavedDraft("kurz");
    expect(draft?.text).toBe("Sehr geehrte Frau Meier,");
    expect(draft?.theme).toBe("behoerde");
    expect(draft?.promptIndex).toBe(3);
  });

  it("keeps a separate draft per mode", () => {
    saveAutosavedDraft({ mode: "fokus", text: "Ich habe das Formular ausgefüllt." });
    saveAutosavedDraft({ mode: "lang", text: "Langer Text", theme: "behoerde" });
    expect(loadAutosavedDraft("fokus")?.text).toBe("Ich habe das Formular ausgefüllt.");
    expect(loadAutosavedDraft("lang")?.text).toBe("Langer Text");
    expect(loadAutosavedDraft("kurz")).toBeNull();
  });

  it("clearing one mode leaves the others intact", () => {
    saveAutosavedDraft({ mode: "fokus", text: "eins" });
    saveAutosavedDraft({ mode: "kurz", text: "zwei", theme: "behoerde" });
    clearAutosavedDraft("fokus");
    expect(loadAutosavedDraft("fokus")).toBeNull();
    expect(loadAutosavedDraft("kurz")?.text).toBe("zwei");
  });

  it("an emptied editor clears the draft instead of storing blanks", () => {
    saveAutosavedDraft({ mode: "fokus", text: "etwas" });
    saveAutosavedDraft({ mode: "fokus", text: "   " });
    expect(loadAutosavedDraft("fokus")).toBeNull();
  });

  it("ignores a draft older than a week", () => {
    saveAutosavedDraft({ mode: "fokus", text: "alt" });
    const raw = JSON.parse(localStorage.getItem("genauly.writing.autosave")!);
    raw.fokus.savedAt = Date.now() - 8 * 24 * 60 * 60 * 1000;
    localStorage.setItem("genauly.writing.autosave", JSON.stringify(raw));
    expect(loadAutosavedDraft("fokus")).toBeNull();
  });

  it("survives corrupt storage", () => {
    localStorage.setItem("genauly.writing.autosave", "{not json");
    expect(loadAutosavedDraft("kurz")).toBeNull();
    expect(() => saveAutosavedDraft({ mode: "kurz", text: "neu", theme: "behoerde" })).not.toThrow();
    expect(loadAutosavedDraft("kurz")?.text).toBe("neu");
  });
});

describe("session resume snapshot", () => {
  const plan: SessionPlan = {
    blocks: [
      { kind: "flashcard", key: "a", source: "vocab", sourceId: "v1", de: "der Antrag", en: "application" },
      { kind: "flashcard", key: "b", source: "vocab", sourceId: "v2", de: "die Frist", en: "deadline" },
      { kind: "flashcard", key: "c", source: "vocab", sourceId: "v3", de: "der Termin", en: "appointment" },
    ],
    minutes: 10,
    preview: "3 fällige Wörter",
    focus: "Behörde",
  };
  const sig = sessionSignature({ minutes: 10, scope: "behoerde" });
  const snapshot = {
    signature: sig,
    plan,
    index: 1,
    xpEarned: 24,
    correctCount: 1,
    combo: 1,
    loot: [{ de: "der Antrag", en: "application", level: 2, up: true }],
    sttDisabled: false,
  };

  beforeEach(() => sessionStorage.clear());

  it("resumes the same run at the block the learner was on", () => {
    saveSessionSnapshot(snapshot);
    const restored = loadSessionSnapshot(sig);
    expect(restored?.index).toBe(1);
    expect(restored?.xpEarned).toBe(24);
    expect(restored?.plan.blocks).toHaveLength(3);
    expect(restored?.loot[0]?.de).toBe("der Antrag");
  });

  it("never resumes into a differently-scoped session", () => {
    saveSessionSnapshot(snapshot);
    expect(loadSessionSnapshot(sessionSignature({ minutes: 10, scope: "arzt" }))).toBeNull();
    expect(loadSessionSnapshot(sessionSignature({ minutes: 5, scope: "behoerde" }))).toBeNull();
  });

  it("treats the Bibliothek hand-off ids as part of the identity", () => {
    const a = sessionSignature({ minutes: 10, contentScope: "vocab", libraryIds: ["v1", "v2"] });
    const b = sessionSignature({ minutes: 10, contentScope: "vocab", libraryIds: ["v1", "v3"] });
    expect(a).not.toBe(b);
  });

  it("drops a snapshot whose index no longer fits the plan", () => {
    saveSessionSnapshot({ ...snapshot, index: 3 });
    expect(loadSessionSnapshot(sig)).toBeNull();
  });

  it("drops a stale snapshot", () => {
    saveSessionSnapshot(snapshot);
    const raw = JSON.parse(sessionStorage.getItem("genauly.session.run")!);
    raw.savedAt = Date.now() - 4 * 60 * 60 * 1000;
    sessionStorage.setItem("genauly.session.run", JSON.stringify(raw));
    expect(loadSessionSnapshot(sig)).toBeNull();
  });

  it("clears on finish / exit / Neue Runde", () => {
    saveSessionSnapshot(snapshot);
    clearSessionSnapshot();
    expect(loadSessionSnapshot(sig)).toBeNull();
  });

  it("survives corrupt storage", () => {
    sessionStorage.setItem("genauly.session.run", "{not json");
    expect(loadSessionSnapshot(sig)).toBeNull();
  });
});
