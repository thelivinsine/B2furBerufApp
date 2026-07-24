/**
 * Minimal CSV building + download for the /sources admin workbench (s130).
 * Pure string builder (pinned by tests/csv.test.ts) plus a tiny DOM download
 * helper. The file starts with a UTF-8 BOM so Excel opens umlauts correctly.
 */

export type CsvValue = string | number | boolean | null | undefined;

/** Quote a single CSV field per RFC 4180 (quote when it contains , " or \n). */
export function csvEscape(value: CsvValue): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a CSV document from a header row and data rows. */
export function buildCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(","));
  return lines.join("\r\n");
}

/** Trigger a client-side download of a CSV string (BOM-prefixed for Excel). */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Trigger a client-side download of an arbitrary text file (e.g. a Markdown
 *  audit summary that ships alongside the register CSV). */
export function downloadText(
  filename: string,
  text: string,
  mime = "text/plain;charset=utf-8",
): void {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
