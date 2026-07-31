import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useState } from "react";
import {
  CorrectionToggle,
  FixTiles,
  MarkedParagraphs,
  MAX_FIX_TILES,
  useCorrectionDiff,
  type CorrectionViewMode,
} from "@/features/writing/correction";
import { diffWords } from "@/lib/wordDiff";

afterEach(cleanup);

/**
 * These pin the ONE correction language (s172): Fokus, the Kurz/Lang result and
 * the Verlauf render corrections from these pieces, and the Verlauf copies had
 * already drifted away from Fokus (no "→", an em dash for an empty side) before
 * they were shared. A drift here is what the founder sees as "the tiles don't
 * match Fokus".
 */
describe("fix tiles", () => {
  it("shows the category, the struck original, an arrow and the green fix", () => {
    render(<FixTiles changes={diffWords("in meine Wohnung", "in meiner Wohnung").changes} />);
    expect(screen.getByText("Kasus & Artikel")).toBeDefined();
    expect(screen.getByText("meine")).toBeDefined();
    expect(screen.getByText("→")).toBeDefined();
    expect(screen.getByText("meiner")).toBeDefined();
  });

  it("renders a moved word once, with no arrow", () => {
    const changes = diffWords("weil ich war krank.", "weil ich krank war.").changes;
    render(<FixTiles changes={changes} />);
    expect(screen.getByText("Wortstellung")).toBeDefined();
    expect(screen.queryByText("→")).toBeNull();
  });

  it("marks an inserted word with ∅ and a deleted one as (entfernt)", () => {
    const { container } = render(
      <FixTiles changes={[{ from: "", to: "Sie", category: "Ergänzung" }]} />,
    );
    expect(container.textContent).toContain("∅");
    cleanup();
    render(<FixTiles changes={[{ from: "sehr", to: "", category: "Streichung" }]} />);
    expect(screen.getByText("(entfernt)")).toBeDefined();
  });

  it("caps a long list and counts the rest, so it cannot wall off the card", () => {
    const changes = Array.from({ length: MAX_FIX_TILES + 3 }, (_, i) => ({
      from: `a${i}`,
      to: `b${i}`,
      category: "Rechtschreibung",
    }));
    render(<FixTiles changes={changes} max={MAX_FIX_TILES} />);
    expect(screen.getAllByText("Rechtschreibung").length).toBe(MAX_FIX_TILES);
    expect(screen.getByText("+3 weitere")).toBeDefined();
  });

  it("expands the capped tail and folds it back (founder 2026-07-31)", () => {
    const changes = Array.from({ length: MAX_FIX_TILES + 3 }, (_, i) => ({
      from: `a${i}`,
      to: `b${i}`,
      category: "Rechtschreibung",
    }));
    render(<FixTiles changes={changes} max={MAX_FIX_TILES} />);
    const toggle = screen.getByText("+3 weitere");
    fireEvent.click(toggle);
    // Every correction is reachable: the cap only decides what the card opens with.
    expect(screen.getAllByText("Rechtschreibung").length).toBe(changes.length);
    const back = screen.getByText("Weniger");
    fireEvent.click(back);
    expect(screen.getAllByText("Rechtschreibung").length).toBe(MAX_FIX_TILES);
    expect(screen.getByText("+3 weitere")).toBeDefined();
  });

  it("renders nothing at all when there is no edit", () => {
    const { container } = render(<FixTiles changes={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

function Harness({ original, corrected }: { original: string; corrected: string }) {
  const [view, setView] = useState<CorrectionViewMode>("corr");
  const { paragraphs } = useCorrectionDiff(original, corrected);
  return (
    <>
      <CorrectionToggle view={view} onChange={setView} />
      <MarkedParagraphs paragraphs={paragraphs} view={view} />
    </>
  );
}

describe("correction view", () => {
  const original = "Sehr geehrte Damen,\n\nseit drei Tagen ist die Heizung in meine Wohnung kalt.";
  const corrected = "Sehr geehrte Damen,\n\nseit drei Tagen ist die Heizung in meiner Wohnung kalt.";

  it("diffs paragraph by paragraph, so a letter keeps its shape", () => {
    const { paragraphs } = renderHook(() => useCorrectionDiff(original, corrected));
    expect(paragraphs.length).toBe(2);
  });

  it("opens on Korrigiert with green marks and switches to coral on Original", () => {
    const { container } = render(<Harness original={original} corrected={corrected} />);
    expect(container.querySelectorAll(".fx-mark-green").length).toBe(1);
    expect(container.querySelectorAll(".fx-mark-coral").length).toBe(0);
    expect(screen.getByText("meiner")).toBeDefined();

    fireEvent.click(screen.getByText("Original"));
    expect(container.querySelectorAll(".fx-mark-coral").length).toBe(1);
    expect(container.querySelectorAll(".fx-mark-green").length).toBe(0);
    expect(screen.getByText("meine")).toBeDefined();
  });
});

/** Tiny hook harness: render once, capture the value. */
function renderHook<T>(fn: () => T): T {
  let value: T | undefined;
  function Probe() {
    value = fn();
    return null;
  }
  render(<Probe />);
  return value as T;
}
