import { AudioLines, FileText, MessagesSquare, SquarePen, type LucideIcon } from "lucide-react";
import type { MockPartId } from "@/engine/exam";

/**
 * Shared look + copy for the four exam modules (hub cards, Anleitung pages,
 * runner chrome).
 *
 * Marks and colours were re-cut in s189 (founder: "I don't like the icons and
 * their colors"). Two things were wrong with the old set. Three of the four
 * glyphs were rounded objects (book, headphones, microphone), so they blurred
 * together at tile size; and Schreiben was brand blue against Sprechen's cyan,
 * one hue apart, so the two productive modules read as the same colour.
 *
 * The set the founder picked: flatter, geometric marks, and colour that carries
 * a FACT rather than just telling the four apart. The two RECEPTIVE modules are
 * the green family (Lesen emerald, Hören teal), the two PRODUCTIVE ones the
 * blue family (Schreiben the brand blue it already owns, Sprechen sky), so the
 * pairs read as pairs. All four hues stay inside the sanctioned families.
 *
 * `bar` is the solid version of the same hue, for the Verlauf result segments:
 * a 6 px bar needs the full colour, not the 10 % tile wash.
 *
 * `fillPale`/`fillSolid` are the two segments of a Stärkeprofil column: pale =
 * the first attempt, solid = the gain since.
 *
 * **`tile` is a FLAT tint, never a gradient** (founder s191: "get rid of the
 * colored gradient from the tiles"). s190 had made it fade within its own hue
 * and had added a matching hue radial across the whole card (`.mod-wash-*`);
 * both are gone. The colour still carries the receptive/productive fact, it
 * just carries it as one even wash.
 */
export const PART_META: Record<
  MockPartId,
  {
    icon: LucideIcon;
    tile: string;
    ink: string;
    bar: string;
    fillPale: string;
    fillSolid: string;
    instructions: string;
    /**
     * Hören only: the wording for a draw with no Notizen sheet. Only voicemails
     * carry note fields, so a Hören drawn entirely from Durchsagen (always the
     * case at C1) used to promise a note-taking task it could not contain
     * (s194 audit P16). The Anleitung picks by what the plan actually drew.
     */
    instructionsPlain?: string;
  }
> = {
  lesen: {
    icon: FileText,
    tile: "bg-emerald-500/15 dark:bg-emerald-400/20",
    ink: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500 dark:bg-emerald-400",
    fillPale: "bg-emerald-500/30 dark:bg-emerald-400/25",
    fillSolid: "bg-emerald-500 dark:bg-emerald-400",
    instructions:
      "Sie lesen drei Texte. Wählen Sie zu jeder Aufgabe die richtige Antwort. Über die Nummernleiste können Sie Aufgaben überspringen und später zurückkommen.",
  },
  hoeren: {
    icon: AudioLines,
    tile: "bg-teal-500/15 dark:bg-teal-400/20",
    ink: "text-teal-700 dark:text-teal-300",
    bar: "bg-teal-500 dark:bg-teal-400",
    fillPale: "bg-teal-500/30 dark:bg-teal-400/25",
    fillSolid: "bg-teal-500 dark:bg-teal-400",
    instructions:
      "Sie hören zwei Ansagen. Notieren Sie beim Hören die wichtigen Angaben und lösen Sie danach die Aufgaben. Sie können jede Ansage maximal zweimal hören.",
    instructionsPlain:
      "Sie hören zwei Ansagen. Hören Sie genau zu und lösen Sie danach die Aufgaben. Sie können jede Ansage maximal zweimal hören.",
  },
  schreiben: {
    icon: SquarePen,
    tile: "bg-primary/15 dark:bg-primary/20",
    ink: "text-primary",
    bar: "bg-primary",
    fillPale: "bg-primary/30 dark:bg-primary/25",
    fillSolid: "bg-primary",
    instructions:
      "Sie schreiben einen Text zu der Aufgabe. Bearbeiten Sie alle Inhaltspunkte und achten Sie auf Anrede und Länge. Am Ende bewertet eine KI Ihren Text.",
  },
  sprechen: {
    icon: MessagesSquare,
    tile: "bg-sky-500/15 dark:bg-sky-400/20",
    ink: "text-sky-700 dark:text-sky-300",
    bar: "bg-sky-500 dark:bg-sky-400",
    fillPale: "bg-sky-500/30 dark:bg-sky-400/25",
    fillSolid: "bg-sky-500 dark:bg-sky-400",
    // s194 audit P20: this still told the candidate "Am Ende bewerten Sie sich
    // selbst anhand des Prüfungsrasters", which s193 replaced with a real spoken
    // conversation graded by the AI debrief. It is the last screen a candidate
    // reads before Teil Sprechen, so it has to describe the part they get.
    instructions:
      "Sie lösen eine Aufgabe im Gespräch mit einer Gesprächspartnerin oder einem Gesprächspartner. Sprechen Sie alle Punkte der Aufgabe an, reagieren Sie auf Vorschläge und finden Sie gemeinsam eine Lösung. Am Ende bekommen Sie eine Rückmeldung von einer KI.",
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
