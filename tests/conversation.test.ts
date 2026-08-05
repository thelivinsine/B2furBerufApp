import { describe, expect, it } from "vitest";
import {
  MAX_LEARNER_TURNS,
  MIN_LEARNER_TURNS,
  addLearnerTurn,
  addPartnerTurn,
  canDebrief,
  canSpeak,
  closeConversation,
  editLastLearnerTurn,
  failTurn,
  learnerText,
  learnerTurnCount,
  learnerWordCount,
  startConversation,
  toWire,
  applyHint,
} from "@/engine/conversation";
import { briefGoals, examBrief, showsTextWhileSpeaking, speakingBrief } from "@/engine/speaking";
import type { ConversationBrief, ExamSet, Scenario } from "@/types";

const brief: ConversationBrief = {
  id: "sc_test",
  title: "Testgespräch",
  partner: { name: "Frau Berger", role: "Teamleiterin", register: "sie" },
  situation: "Du meldest dich krank.",
  goals: ["Absagen", "Grund nennen"],
  targetRedemittel: [],
  level: "B2.1",
  minutes: 5,
  stage: "gespraech",
  exam: false,
};

describe("conversation engine", () => {
  it("starts empty and ready", () => {
    const s = startConversation(brief);
    expect(s.turns).toEqual([]);
    expect(s.status).toBe("ready");
    expect(canSpeak(s)).toBe(true);
    expect(canDebrief(s)).toBe(false);
  });

  it("drops an empty utterance instead of spending a model call on silence", () => {
    const s = startConversation(brief);
    expect(addLearnerTurn(s, "   ")).toBe(s);
    expect(addLearnerTurn(s, "")).toBe(s);
  });

  it("moves to thinking on a learner turn and back to ready on the reply", () => {
    let s = startConversation(brief);
    s = addLearnerTurn(s, "Guten Morgen");
    expect(s.status).toBe("thinking");
    expect(learnerTurnCount(s)).toBe(1);
    s = addPartnerTurn(s, "Morgen!");
    expect(s.status).toBe("ready");
    expect(s.turns).toHaveLength(2);
  });

  it("closes the conversation ON the partner's line at the turn ceiling", () => {
    let s = startConversation(brief);
    for (let i = 0; i < MAX_LEARNER_TURNS; i++) {
      s = addLearnerTurn(s, `Satz ${i}`);
      s = addPartnerTurn(s, `Antwort ${i}`);
    }
    expect(learnerTurnCount(s)).toBe(MAX_LEARNER_TURNS);
    // The learner is never left holding an unanswered question.
    expect(s.turns[s.turns.length - 1].role).toBe("partner");
    expect(s.status).toBe("closed");
    expect(canSpeak(s)).toBe(false);
  });

  it("needs a minimum of real turns before a debrief can say anything true", () => {
    let s = startConversation(brief);
    s = addPartnerTurn(addLearnerTurn(s, "Hallo"), "Hallo!");
    expect(learnerTurnCount(s)).toBe(1);
    expect(canDebrief(s)).toBe(false);
    s = addPartnerTurn(addLearnerTurn(s, "Ich bin krank"), "Oje.");
    expect(learnerTurnCount(s)).toBe(MIN_LEARNER_TURNS);
    expect(canDebrief(s)).toBe(true);
  });

  it("edits the last learner turn and marks it as hand-typed", () => {
    let s = startConversation(brief);
    s = addPartnerTurn(addLearnerTurn(s, "Ich bin kalt"), "Wie bitte?");
    s = editLastLearnerTurn(s, "Ich bin krank");
    const last = s.turns.filter((t) => t.role === "learner").at(-1)!;
    expect(last.text).toBe("Ich bin krank");
    expect(last.edited).toBe(true);
  });

  it("ignores an edit when there is nothing to edit, or the edit is empty", () => {
    const s = startConversation(brief);
    expect(editLastLearnerTurn(s, "Neu")).toBe(s);
    const withTurn = addLearnerTurn(s, "Original");
    expect(editLastLearnerTurn(withTurn, "  ")).toBe(withTurn);
  });

  it("collects only the learner's own words for the correction card", () => {
    let s = startConversation(brief);
    s = addPartnerTurn(addLearnerTurn(s, "Ich melde mich krank"), "Gute Besserung.");
    s = addPartnerTurn(addLearnerTurn(s, "Danke schön"), "Bis bald.");
    expect(learnerText(s)).toBe("Ich melde mich krank\n\nDanke schön");
    expect(learnerText(s)).not.toContain("Besserung");
    expect(learnerWordCount(s)).toBe(6);
  });

  it("maps the partner to assistant and the learner to user on the wire", () => {
    let s = startConversation(brief);
    s = addPartnerTurn(addLearnerTurn(s, "Hallo"), "Guten Tag");
    expect(toWire(s)).toEqual([
      { role: "user", text: "Hallo" },
      { role: "assistant", text: "Guten Tag" },
    ]);
  });

  it("recovers to ready after a failed turn, keeping the message", () => {
    let s = addLearnerTurn(startConversation(brief), "Hallo");
    s = failTurn(s, "Nicht erreichbar");
    expect(s.status).toBe("ready");
    expect(s.error).toBe("Nicht erreichbar");
    expect(canSpeak(s)).toBe(true);
  });

  it("refuses hints in exam mode but allows them in practice", () => {
    expect(applyHint(startConversation(brief)).hintsUsed).toBe(1);
    const exam = startConversation({ ...brief, exam: true });
    expect(applyHint(exam)).toBe(exam);
  });

  it("closes on demand", () => {
    expect(closeConversation(startConversation(brief)).status).toBe("closed");
  });
});

describe("brief derivation", () => {
  const scenario = {
    id: "sc_krank",
    themeId: "health",
    title: "Krankmeldung",
    task: "Melde dich krank.",
    context: "Du bist krank und rufst im Büro an.",
    level: 2,
    minutes: 5,
    start: "n1",
    nodes: {},
    targetRedemittel: [],
  } as unknown as Scenario;

  it("builds a practice brief that always runs as the chat thread", () => {
    const b = speakingBrief(scenario);
    expect(b.id).toBe("sc_krank");
    expect(b.stage).toBe("gespraech");
    expect(b.exam).toBe(false);
    expect(b.level).toBe("B1.2");
  });

  it("falls back to the task line when a scenario has no authored goals", () => {
    expect(briefGoals(scenario)).toEqual(["Melde dich krank."]);
  });

  it("prefers authored goals and caps them at five", () => {
    const many = { ...scenario, goals: ["a", "b", "c", "d", "e", "f"] };
    expect(briefGoals(many)).toHaveLength(5);
  });

  it("uses a neutral partner when none is authored, so nothing is unservable", () => {
    expect(speakingBrief(scenario).partner.register).toBe("sie");
    const withPartner = {
      ...scenario,
      partner: { name: "Tom", role: "Kollege", register: "du" as const },
    };
    expect(speakingBrief(withPartner).partner.name).toBe("Tom");
  });

  const set = {
    id: "ex_test",
    title: "Prüfungssimulation: Betriebsfest planen",
    themeId: "scheduling",
    taskSheet: "Planen Sie gemeinsam das Fest.",
    aspects: ["Termin", "Ort", "Essen"],
    scenarioId: "sc_krank",
    totalMinutes: 6,
    rubric: [],
  } as unknown as ExamSet;

  it("turns exam aspects into the graded goals and drops the title prefix", () => {
    const b = examBrief(set);
    expect(b.goals).toEqual(["Termin", "Ort", "Essen"]);
    expect(b.title).toBe("Betriebsfest planen");
    expect(b.exam).toBe(true);
  });

  it("defaults an exam task to the stage that keeps the Aufgabe on screen", () => {
    expect(examBrief(set).stage).toBe("buehne");
    expect(examBrief({ ...set, stage: "anruf" }).stage).toBe("anruf");
  });

  it("only hides text in the Anruf stage", () => {
    expect(showsTextWhileSpeaking("gespraech")).toBe(true);
    expect(showsTextWhileSpeaking("buehne")).toBe(true);
    expect(showsTextWhileSpeaking("anruf")).toBe(false);
  });
});
