import { describe, it, expect } from "vitest";
import { csvEscape, buildCsv } from "@/lib/csv";

describe("csv builder", () => {
  it("passes plain values through unquoted", () => {
    expect(csvEscape("das Wort")).toBe("das Wort");
    expect(csvEscape(42)).toBe("42");
    expect(csvEscape(true)).toBe("true");
  });

  it("renders null/undefined as empty fields", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  it("quotes fields containing commas, quotes or newlines", () => {
    expect(csvEscape("eine, zwei")).toBe('"eine, zwei"');
    expect(csvEscape('der "Chef"')).toBe('"der ""Chef"""');
    expect(csvEscape("Zeile1\nZeile2")).toBe('"Zeile1\nZeile2"');
  });

  it("keeps umlauts untouched", () => {
    expect(csvEscape("die Übung, bitte")).toBe('"die Übung, bitte"');
    expect(csvEscape("größer")).toBe("größer");
  });

  it("builds a CRLF document with a header row", () => {
    const csv = buildCsv(["id", "label"], [["v_x", "das Wort"], ["v_y", "mit, Komma"]]);
    expect(csv).toBe('id,label\r\nv_x,das Wort\r\nv_y,"mit, Komma"');
  });

  it("keeps column count stable across rows with empty values", () => {
    const csv = buildCsv(["a", "b", "c"], [["1", null, "3"]]);
    expect(csv.split("\r\n")[1]).toBe("1,,3");
  });
});
