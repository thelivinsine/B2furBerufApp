import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useState } from "react";
import { FeedbackLangChip } from "@/features/writing/FeedbackLang";

afterEach(cleanup);

/**
 * The DE/EN switch for AI feedback prose (s179, founder: "with an english toggle
 * button even for this section"). It is deliberately STICKY, unlike the
 * hold-to-peek `EnPeek` used for learning content: a Kurz/Lang tip is a
 * paragraph, and nobody reads a paragraph with a finger held down. The label
 * says which language the press switches TO, which is what keeps the two chips
 * apart at a glance.
 */
function Harness({ de, en }: { de: string; en: string }) {
  const [english, setEnglish] = useState(false);
  return (
    <p>
      {english ? en : de}
      <FeedbackLangChip showEnglish={english} onChange={setEnglish} />
    </p>
  );
}

describe("feedback language chip", () => {
  it("swaps the text and stays switched (no hold required)", () => {
    render(<Harness de="Schreib dazu, was du probiert hast." en="Add what you tried." />);
    expect(screen.getByText(/Schreib dazu/)).toBeDefined();

    const chip = screen.getByRole("button", { name: "Auf Englisch anzeigen" });
    expect(chip.textContent).toBe("EN");
    fireEvent.click(chip);

    // Sticky: one click, and it is still English afterwards.
    expect(screen.getByText(/Add what you tried/)).toBeDefined();
    const back = screen.getByRole("button", { name: "Auf Deutsch anzeigen" });
    expect(back.textContent).toBe("DE");
    expect(back.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(back);
    expect(screen.getByText(/Schreib dazu/)).toBeDefined();
  });
});
