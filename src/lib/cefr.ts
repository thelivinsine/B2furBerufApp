import type { ContentCefr } from "@/types";

export const CEFR_ORDER: ContentCefr[] = ["A2", "B1.1", "B1.2", "B2.1", "B2.2", "C1"];

export const CEFR_LABELS: Record<ContentCefr, string> = {
  A2: "A2",
  "B1.1": "B1.1",
  "B1.2": "B1.2",
  "B2.1": "B2.1",
  "B2.2": "B2.2",
  C1: "C1",
};

export function cefrLabel(level: ContentCefr): string {
  return CEFR_LABELS[level];
}

export function difficultyToBand(difficulty: 1 | 2 | 3): string {
  switch (difficulty) {
    case 1:
      return "B1";
    case 2:
      return "B2.1";
    case 3:
      return "B2.2·C1";
  }
}
