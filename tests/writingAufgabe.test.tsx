import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { writingPrompts } from "@/data/writingPrompts";
import { themes } from "@/data/themes";
import type { ThemeId } from "@/types";

/**
 * The Aufgabe a scope draws must BE what the scope says (founder 2026-07-31:
 * "I selected Forumsbeitrag but the Aufgabe doesn't relate to it"). The unit
 * tests pin the selector; this pins what the learner actually sees, including
 * the honest empty state that replaced the old silent substitution.
 */

// jsdom ships no matchMedia; `useFillEditor` asks it for the lg breakpoint.
window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  onchange: null,
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

vi.mock("@/lib/aiAllowance", () => ({
  useDailyAllowance: () => ({ known: false, remaining: 0, limit: 0 }),
}));
vi.mock("@/lib/writing", () => ({ evaluateWriting: vi.fn() }));

const { GuidedWritingTrainer } = await import("@/features/writing/GuidedWritingTrainer");

afterEach(cleanup);

const THEME_IDS: ThemeId[] = themes.map((t) => t.id);

function mount(search: string, length: "short" | "long") {
  return render(
    <MemoryRouter initialEntries={[`/writing${search}`]}>
      <GuidedWritingTrainer length={length} isSignedIn onRequireAuth={() => {}} />
    </MemoryRouter>,
  );
}

/** Every task text in the bank that carries this Textsorte, at this length. */
function textsFor(format: string, length: "short" | "long"): Set<string> {
  const out = new Set<string>();
  for (const id of THEME_IDS)
    for (const t of writingPrompts[id][length]) if (t.format === format) out.add(t.text);
  return out;
}

describe("Aufgabe rail: the drawn task obeys the scope", () => {
  it("Textsorte: 20 draws under Forumsbeitrag are all Forumsbeiträge", () => {
    const allowed = textsFor("forumsbeitrag", "long");
    expect(allowed.size).toBeGreaterThan(0);
    for (let i = 0; i < 20; i++) {
      const { unmount } = mount("?format=forumsbeitrag", "long");
      // The prompt is the only <p> carrying a full task sentence; find it among
      // the allowed set rather than by position, so card chrome cannot match.
      const shown = [...allowed].filter((text) => screen.queryByText(text));
      expect(shown.length, `draw ${i} served a task outside the Textsorte`).toBe(1);
      unmount();
    }
  });

  it("Niveau + Textsorte: B2 + Bericht draws only B2 Berichte", () => {
    const allowed = new Set<string>();
    for (const id of THEME_IDS)
      for (const t of writingPrompts[id].long)
        if (t.format === "bericht" && t.level?.startsWith("B2")) allowed.add(t.text);
    expect(allowed.size).toBeGreaterThan(0);
    for (let i = 0; i < 10; i++) {
      const { unmount } = mount("?level=B2&format=bericht", "long");
      expect([...allowed].filter((text) => screen.queryByText(text)).length).toBe(1);
      unmount();
    }
  });

  it("an older ?level=B2.1 deep link still selects the B2 band", () => {
    const allowed = new Set<string>();
    for (const id of THEME_IDS)
      for (const t of writingPrompts[id].long)
        if (t.format === "bericht" && t.level?.startsWith("B2")) allowed.add(t.text);
    mount("?level=B2.1&format=bericht", "long");
    expect([...allowed].filter((text) => screen.queryByText(text)).length).toBe(1);
  });

  it("a Textsorte with no task at this length says so and offers the escape", () => {
    // Forumsbeitrag is a Lang shape only. It used to draw a Kurz task of some
    // other Textsorte; now the trainer refuses and names the way out.
    mount("?format=forumsbeitrag", "short");
    expect(screen.getByText("Keine Aufgabe für diese Auswahl")).toBeDefined();
    expect(screen.getByText(/nur bei Lang/)).toBeDefined();
    // No writing field while there is no task to write against.
    expect(document.querySelector("textarea")).toBeNull();
    // And the escape drops exactly the blocking filter, so a task appears.
    fireEvent.click(screen.getByRole("button", { name: /Textsorte zurücksetzen/ }));
    expect(screen.queryByText("Keine Aufgabe für diese Auswahl")).toBeNull();
    expect(document.querySelector("textarea")).not.toBeNull();
  });

  it("the Ziel range is a round number, not words x 1.25", () => {
    // "Ziel 150–188 Wörter" read like a figure to hit exactly.
    mount("?level=B2&format=bericht", "long");
    for (const el of document.querySelectorAll("p")) {
      const m = el.textContent?.match(/Ziel (\d+)–(\d+) Wörter/);
      if (m) expect(Number(m[2]) % 10).toBe(0);
    }
  });
});
