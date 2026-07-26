import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { AdminWorkbench, type WorkbenchApi } from "@/features/legal/AdminWorkbench";
import { provenance } from "@/data/provenance";
import type { ProvenanceReview } from "@/lib/provenanceReviews";

afterEach(cleanup);

function makeApi(marks: ProvenanceReview[] = []): WorkbenchApi {
  return {
    reviews: new Map(marks.map((m) => [m.content_id, m])),
    onChange: vi.fn(async () => true),
  };
}

describe("admin workbench (/sources)", () => {
  it("renders the full register with an export button and paged table", () => {
    render(<AdminWorkbench api={makeApi()} lang="de" />);
    expect(screen.getByText(new RegExp(`${provenance.length} von ${provenance.length} Einträgen`))).toBeDefined();
    expect(screen.getByText(/CSV exportieren/)).toBeDefined();
    // The table pages, it never mounts thousands of rows at once.
    const rows = document.querySelectorAll("tbody tr");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(200);
  });

  it("search narrows the table and the export count follows", async () => {
    const target = provenance[0];
    render(<AdminWorkbench api={makeApi()} lang="de" />);
    const search = screen.getByPlaceholderText(/Suchen/);
    fireEvent.change(search, { target: { value: target.content_id } });
    // The shared SearchField debounces; wait for the filtered count to land.
    await waitFor(() => {
      const btn = screen.getByText(/CSV exportieren \((\d+)\)/);
      const n = Number(/\((\d+)\)/.exec(btn.textContent ?? "")?.[1]);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThan(provenance.length / 10);
    });
  });

  it("approves a review through the api when the Freigeben control is clicked", () => {
    const api = makeApi();
    // Unfiltered, unsorted: the first table row is provenance[0].
    render(<AdminWorkbench api={api} lang="de" />);
    const approve = document.querySelector('tbody button[aria-label="Freigeben"]') as HTMLButtonElement;
    expect(approve).not.toBeNull();
    fireEvent.click(approve);
    expect(api.onChange).toHaveBeenCalledWith(provenance[0].content_id, { decision: "approve" });
  });

  it("rejects a review through the api when the Ablehnen control is clicked", () => {
    const api = makeApi();
    render(<AdminWorkbench api={api} lang="de" />);
    const reject = document.querySelector('tbody button[aria-label="Ablehnen"]') as HTMLButtonElement;
    expect(reject).not.toBeNull();
    fireEvent.click(reject);
    expect(api.onChange).toHaveBeenCalledWith(provenance[0].content_id, { decision: "reject" });
  });

  it("shows saved marks from the review map", () => {
    const api = makeApi([
      { content_id: provenance[0].content_id, verified: true, decision: "approve", comment: "ok" },
    ]);
    render(<AdminWorkbench api={api} lang="de" />);
    const approve = document.querySelector('tbody button[aria-label="Freigeben"]') as HTMLButtonElement;
    expect(approve.getAttribute("aria-pressed")).toBe("true");
    expect((document.querySelector('tbody input[type="text"]') as HTMLInputElement).value).toBe("ok");
  });

  it("surfaces a Save button once the note is edited", () => {
    const api = makeApi();
    render(<AdminWorkbench api={api} lang="de" />);
    const note = document.querySelector('tbody input[type="text"]') as HTMLInputElement;
    expect(screen.queryByText("Speichern")).toBeNull();
    fireEvent.change(note, { target: { value: "check the source" } });
    const save = screen.getByText("Speichern");
    fireEvent.click(save);
    expect(api.onChange).toHaveBeenCalledWith(provenance[0].content_id, { comment: "check the source" });
  });
});
