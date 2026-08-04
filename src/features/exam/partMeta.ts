import { BookOpen, Headphones, Mic, PenLine, type LucideIcon } from "lucide-react";
import type { MockPartId } from "@/engine/exam";

/**
 * Shared look + copy for the four exam parts (hub rows, Anleitung pages,
 * runner chrome). Tints come from the sanctioned gradient families
 * (teal/amber/blue/cyan); Schreiben and Sprechen echo their route colours.
 * `bar` is the solid version of the same hue, for the Verlauf result segments:
 * a 6 px bar needs the full colour, not the 10 % tile wash.
 */
export const PART_META: Record<
  MockPartId,
  { icon: LucideIcon; tile: string; ink: string; bar: string; desc: string; instructions: string }
> = {
  lesen: {
    icon: BookOpen,
    tile: "bg-teal-500/10 dark:bg-teal-400/15",
    ink: "text-teal-700 dark:text-teal-300",
    bar: "bg-teal-500 dark:bg-teal-400",
    desc: "3 Texte mit Aufgaben",
    instructions:
      "Sie lesen drei Texte. Wählen Sie zu jeder Aufgabe die richtige Antwort. Über die Nummernleiste können Sie Aufgaben überspringen und später zurückkommen.",
  },
  hoeren: {
    icon: Headphones,
    tile: "bg-amber-500/10 dark:bg-amber-400/15",
    ink: "text-amber-700 dark:text-amber-400",
    bar: "bg-amber-500 dark:bg-amber-400",
    desc: "2 Ansagen · Notizen",
    instructions:
      "Sie hören zwei Ansagen. Notieren Sie beim Hören die wichtigen Angaben und lösen Sie danach die Aufgaben. Sie können jede Ansage maximal zweimal hören.",
  },
  schreiben: {
    icon: PenLine,
    tile: "bg-primary/10 dark:bg-primary/15",
    ink: "text-primary",
    bar: "bg-primary",
    desc: "1 Aufgabe · voller Brief",
    instructions:
      "Sie schreiben einen Text zu der Aufgabe. Bearbeiten Sie alle Inhaltspunkte und achten Sie auf Anrede und Länge. Am Ende bewertet eine KI Ihren Text.",
  },
  sprechen: {
    icon: Mic,
    tile: "bg-cyan-500/10 dark:bg-cyan-400/15",
    ink: "text-cyan-700 dark:text-cyan-300",
    bar: "bg-cyan-500 dark:bg-cyan-400",
    desc: "1 Gespräch mit Partner",
    instructions:
      "Sie lösen eine Aufgabe im Gespräch mit einer Partnerin oder einem Partner. Reagieren Sie auf Vorschläge und finden Sie gemeinsam eine Lösung. Am Ende bewerten Sie sich selbst anhand des Prüfungsrasters.",
  },
};

/**
 * Display title for an exam set. The bank's titles carry a "Prüfungssimulation:"
 * prefix from the era when that was the page's name (they are content, with
 * provenance rows and human-verified stamps, so they are not rewritten to follow
 * a UI rename); every surface strips it here rather than each doing its own.
 * Lives beside the part meta, NOT in `engine/exam`, so a caller does not pull the
 * content banks in behind one string helper.
 */
export function examSetTitle(title: string): string {
  return title.replace(/^Prüfungssimulation:\s*/, "");
}
