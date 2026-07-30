import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { VocabList } from "@/features/vocabulary/VocabList";
import { BrowseToolbar } from "@/features/shared/BrowseToolbar";
import { vocabulary } from "@/data/vocabulary";

afterEach(cleanup);

describe("VocabList incremental rendering", () => {
  it("renders at most 60 cards initially with a load-more control", () => {
    render(<VocabList items={vocabulary} />);
    // Every card shows its German headword exactly once in a <p>.
    const cards = document.querySelectorAll(".card-hover");
    expect(cards.length).toBe(60);
    expect(screen.getByText(/Mehr anzeigen/)).toBeDefined();
  });

  it("grows by another page when load-more is clicked", () => {
    render(<VocabList items={vocabulary} />);
    fireEvent.click(screen.getByText(/Mehr anzeigen/));
    expect(document.querySelectorAll(".card-hover").length).toBe(120);
  });

  it("renders everything when the list fits one page", () => {
    render(<VocabList items={vocabulary.slice(0, 8)} />);
    expect(document.querySelectorAll(".card-hover").length).toBe(8);
    expect(screen.queryByText(/Mehr anzeigen/)).toBeNull();
  });
});

describe("BrowseToolbar debounced search", () => {
  it("keeps typing local and flushes onSearch after the debounce", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(
      <BrowseToolbar
        search=""
        onSearch={onSearch}
        facetItems={[]}
        facets={[]}
        facetSelection={{}}
        onFacetChange={() => {}}
        resultLabel={(n) => String(n)}
        activeChips={[]}
        onRemoveChip={() => {}}
      />,
    );
    const input = screen.getByPlaceholderText("Suchen …") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Ter" } });
    fireEvent.change(input, { target: { value: "Termin" } });
    expect(input.value).toBe("Termin"); // typing reflected immediately
    expect(onSearch).not.toHaveBeenCalled(); // but not flushed yet
    vi.advanceTimersByTime(250);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("Termin");
    vi.useRealTimers();
  });

  it("clearing the field flushes immediately", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(
      <BrowseToolbar
        search="Termin"
        onSearch={onSearch}
        facetItems={[]}
        facets={[]}
        facetSelection={{}}
        onFacetChange={() => {}}
        resultLabel={(n) => String(n)}
        activeChips={[]}
        onRemoveChip={() => {}}
      />,
    );
    // The clear button is the only plain <button> next to the input.
    const clear = document.querySelector(".relative.flex-1 button")!;
    fireEvent.click(clear);
    expect(onSearch).toHaveBeenCalledWith("");
    vi.useRealTimers();
  });
});

describe("verb forms on the Wörter card (s178 audit P2, founder pick C)", () => {
  const byId = (id: string) => vocabulary.find((v) => v.id === id)!;

  it("shows the Perfekt where a noun shows its plural, and the paradigm on the back", () => {
    render(<VocabList items={[byId("v_verschieben")]} />);
    // Front foot pill, same slot and styling as "Pl.: …".
    expect(screen.getByText("Perf.: hat verschoben")).toBeDefined();
    // Back face (both faces are always mounted; the flip is a CSS transform).
    expect(screen.getByText("Präteritum")).toBeDefined();
    expect(screen.getByText("verschob")).toBeDefined();
    expect(screen.getByText("Perfekt")).toBeDefined();
  });

  it("says 'ist' for a sein-verb", () => {
    render(<VocabList items={[byId("v_entstehen")]} />);
    expect(screen.getByText("Perf.: ist entstanden")).toBeDefined();
  });

  it("marks a separable verb and offers its zu-infinitive", () => {
    render(<VocabList items={[byId("v_abstimmen")]} />);
    expect(screen.getByText("Perf.: hat abgestimmt")).toBeDefined();
    expect(screen.getByText("trennbar")).toBeDefined();
    expect(screen.getByText("abzustimmen")).toBeDefined();
    // The particle detaches in the Präteritum: "stimmte ab", never "abstimmte".
    expect(screen.getByText("stimmte ab")).toBeDefined();
  });

  it("leaves a noun's card untouched", () => {
    render(<VocabList items={[byId("v_besprechung")]} />);
    expect(screen.getByText("Pl.: die Besprechungen")).toBeDefined();
    expect(screen.queryByText("Perfekt")).toBeNull();
    expect(screen.queryByText("trennbar")).toBeNull();
  });
});
