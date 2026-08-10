import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ConversationBriefCard } from "@/features/sprechen/ConversationBriefCard";
import type { ConversationBrief } from "@/types";

/**
 * The brief screen states the SITUATION (s209).
 *
 * The founder reported it missing: the chooser card explains the task in two
 * lines, and every screen after it dropped that explanation. The text was in
 * the brief object the whole time, read by the AI partner and by nobody else.
 */

const BRIEF: ConversationBrief = {
  id: "sc_test",
  title: "Homeoffice-Regelung einführen",
  partner: { name: "Petra Sommer", role: "Teamleiterin", register: "du" },
  situation:
    "Ihr Unternehmen möchte Homeoffice einführen. Einigen Sie sich auf eine faire und praktikable Regelung.",
  goals: ["Nenne zwei Vorteile.", "Schlage eine Regelung vor.", "Einigt euch auf einen Termin."],
  targetRedemittel: ["suggestions"],
  level: "B2.1",
  minutes: 6,
  stage: "gespraech",
  exam: false,
};

afterEach(cleanup);

describe("ConversationBriefCard", () => {
  it("states what the conversation is about", () => {
    render(<ConversationBriefCard brief={BRIEF} onStart={() => {}} />);
    expect(screen.getByText(BRIEF.situation)).toBeTruthy();
  });

  it("states it exactly once, and never as a second Situation label", () => {
    const { container } = render(<ConversationBriefCard brief={BRIEF} onStart={() => {}} />);
    expect(screen.getAllByText(BRIEF.situation)).toHaveLength(1);
    // The head above the card carries the one "Situation" eyebrow (microcopy
    // budget: a fact appears once).
    const labels = Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent?.trim().toLowerCase() === "situation",
    );
    expect(labels).toHaveLength(1);
  });

  it("still leads with the task title and the Leitpunkte it is graded on", () => {
    render(<ConversationBriefCard brief={BRIEF} onStart={() => {}} />);
    expect(screen.getByText(BRIEF.title)).toBeTruthy();
    for (const g of BRIEF.goals) expect(screen.getByText(g)).toBeTruthy();
  });

  it("renders a brief that carries no situation without an empty divider block", () => {
    const { container } = render(
      <ConversationBriefCard brief={{ ...BRIEF, situation: "" }} onStart={() => {}} />,
    );
    // One divider only: the partner row above the Leitpunkte.
    expect(container.querySelectorAll(".h-px").length).toBe(1);
  });
});
