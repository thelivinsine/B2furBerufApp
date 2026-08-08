import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Shuffle } from "lucide-react";
import type { MockPartId } from "@/engine/exam";
import { ModuleHeader } from "./ModuleHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Both toolbar controls, in one class: 32px tall, the squircle `rounded-lg` the
 * zone's other toggles wear, and the 13px label the Schreiben "Aufgabe" button
 * uses, so the two buttons in this row are one control family rather than two
 * sizes of Button variant sitting next to each other. `size="sm"` supplies the
 * padding; everything the size variant would otherwise decide is stated here,
 * AFTER it, so the merge order is not a question.
 */
const TOOLBAR_BUTTON = "h-8 rounded-lg px-2.5 text-[13px] font-semibold";

/**
 * The desktop grid a module page is laid out on: the content column plus the
 * 16rem rail column, the Bibliothek measurements Schreiben also uses.
 *
 * Every row of the page rides it, including the rows a rail-less tab has, so
 * switching Üben <-> Verlauf never moves the switcher or the card edges
 * sideways (the Prüfung law: both tabs share one frame).
 */
const MODULE_GRID = "lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8";

/**
 * A module page WITHOUT the Aufgabe rail (the Verlauf tab): the module row, the
 * switcher and the content, in exactly the columns `ModulePicker` puts them in.
 */
export function ModulePage({
  part,
  head,
  children,
}: {
  part: MockPartId;
  head?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 sm:space-y-5">
      <ModuleHeader part={part} />
      {head && (
        <div className={MODULE_GRID}>
          <div className="min-w-0 lg:col-start-1">{head}</div>
        </div>
      )}
      <div className={MODULE_GRID}>
        <div className="min-w-0 lg:col-start-1">{children}</div>
      </div>
    </div>
  );
}

/**
 * The frame every Ohne-Zeit module chooser shares (founder s196).
 *
 * The founder asked for Sprechen, Lesen and Hören to look like Schreiben, so
 * this is literally Schreiben's frame: the desktop content column with the
 * sticky 16rem "Aufgabe wählen" rail beside it, and on a phone the same rail as
 * a collapsible panel behind ONE toggle.
 *
 * **Where that toggle lives changed in s201** (founder: "the header bar
 * shouldn't have the aufgabe button, place it somewhere else"). It used to ride
 * in the module row, which is the row that answers "which module am I in" and
 * nothing else; a filter control sitting in it made a label row look like a
 * toolbar. It now sits at the right end of the chooser's OWN toolbar row, level
 * with the count it changes and directly above the panel it opens, which is the
 * Bibliothek's rule for a filter toggle and Schreiben's for the same button
 * (there it rides the switcher row, the first control row that page has).
 *
 * The toolbar is part of THIS frame rather than each module's markup, so the
 * three choosers cannot drift apart again: one row, one order, one geometry.
 *
 * It owns nothing about content: the module passes its own rail and its own
 * list, and every scope decision stays in the module.
 */
export function ModulePicker({
  part,
  head,
  toolbar,
  rail,
  children,
}: {
  part: MockPartId;
  /** Rendered between the module row and the toolbar (a switcher). */
  head?: React.ReactNode;
  /** The chooser's toolbar row: what the scope serves, plus its two controls. */
  toolbar: {
    /** Desktop-only page title, e.g. "Lesen üben" (the module row says it on a phone). */
    eyebrow: string;
    /** Already-formatted count, e.g. "16 Texte". */
    count: string;
    /** The random draw. Hidden while the scope serves nothing. */
    onShuffle?: () => void;
    /** Full label for the draw; the phone shows `shortLabel`. */
    shuffleLabel?: string;
    shuffleShortLabel?: string;
    /** False hides the draw (an empty scope has nothing to draw from). */
    canShuffle?: boolean;
  };
  /** The module's rail. `layout`/`onClose` come from this frame. */
  rail: (props: { layout: "rail" | "panel"; onClose?: () => void; className?: string }) => React.ReactNode;
  /** The list of Aufgaben the current scope serves. */
  children: React.ReactNode;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const reduce = useReducedMotion();
  const {
    eyebrow,
    count,
    onShuffle,
    shuffleLabel = "Zufällige Auswahl",
    shuffleShortLabel = "Zufällig",
    canShuffle = true,
  } = toolbar;

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Mobile: the module row, and ONLY the module row (founder s201). */}
      <ModuleHeader part={part} />

      {/* A switcher belongs over the CONTENT column, not over content + rail:
          centred across both, it sits ~9rem right of everything it heads
          (Schreiben solved this the same way, with the same grid). */}
      {head && (
        <div className={MODULE_GRID}>
          <div className="min-w-0 lg:col-start-1">{head}</div>
        </div>
      )}

      {/* Desktop: content + sticky rail, the Bibliothek 16rem grid. */}
      <div className={MODULE_GRID}>
        <div className="min-w-0 space-y-3">
          {/* The toolbar: what the scope serves on the left, the two controls
              that change it on the right. The eyebrow is desktop-only because
              on a phone the module row two lines up already says the word. */}
          <div className="flex items-center gap-2">
            <p className="text-eyebrow hidden text-muted-foreground lg:block">{eyebrow}</p>
            <Badge variant="muted" className="tabular-nums">
              {count}
            </Badge>
            <div className="ml-auto flex items-center gap-2">
              <Button
                size="sm"
                /* Closed = the Himmelblau tile of the rail it opens (founder
                   s166, the `outline` fill was too faint against the page).
                   Same wording, same chevron and the same 13px as the Schreiben
                   toggle, which is the other "Aufgabe" button in this zone. */
                variant={pickerOpen ? "default" : "accent"}
                aria-expanded={pickerOpen}
                aria-pressed={pickerOpen}
                aria-label="Aufgabe wählen"
                className={cn(TOOLBAR_BUTTON, "gap-1 lg:hidden")}
                onClick={() => setPickerOpen((o) => !o)}
              >
                Aufgabe
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    pickerOpen && "rotate-180",
                  )}
                />
              </Button>
              {onShuffle && canShuffle && (
                <Button
                  size="sm"
                  variant="outline"
                  className={TOOLBAR_BUTTON}
                  onClick={onShuffle}
                  title={shuffleLabel}
                >
                  <Shuffle className="h-4 w-4" />
                  <span className="hidden sm:inline">{shuffleLabel}</span>
                  <span className="sm:hidden">{shuffleShortLabel}</span>
                </Button>
              )}
            </div>
          </div>

          {/* The panel opens directly under the button that opens it. */}
          <div className="lg:hidden">
            <AnimatePresence initial={false}>
              {pickerOpen && (
                <motion.div
                  key="aufgabe-panel"
                  // Fade/slide, NOT a height collapse: a height animation needs
                  // overflow-hidden, which would clip the dropdown popovers.
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
                >
                  {rail({ layout: "panel", onClose: () => setPickerOpen(false) })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {children}
        </div>
        {rail({ layout: "rail", className: "hidden lg:block lg:sticky lg:top-24" })}
      </div>
    </div>
  );
}

/**
 * The empty state every chooser shows when its scope yields nothing. Names the
 * ONE filter to drop, which is the founder's rule for an empty scope: never a
 * bare "nichts gefunden" the learner has to debug themselves.
 */
export function ScopeEmpty({
  what,
  blame,
  onReset,
}: {
  /** Plural noun for what is missing ("Situationen", "Texte", "Ansagen"). */
  what: string;
  /** The narrowest active filter, named so the learner knows what to drop. */
  blame: string | null;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center shadow-soft">
      <p className="font-semibold">Keine {what} in dieser Auswahl</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        {blame
          ? `Nimm ${blame} aus der Auswahl, dann gibt es wieder etwas zu üben.`
          : "Setz die Auswahl zurück, dann gibt es wieder etwas zu üben."}
      </p>
      <Button size="sm" variant="outline" onClick={onReset}>
        Auswahl zurücksetzen
      </Button>
    </div>
  );
}
