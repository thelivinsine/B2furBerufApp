import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { MockPartId } from "@/engine/exam";
import { ModuleHeader } from "./ModuleHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The frame every Ohne-Zeit module chooser shares (founder s196).
 *
 * The founder asked for Sprechen, Lesen and Hören to look like Schreiben, so
 * this is literally Schreiben's frame: the desktop content column with the
 * sticky 16rem "Aufgabe wählen" rail beside it, and on a phone the same rail as
 * a collapsible panel behind ONE toggle. The toggle rides in the module row the
 * zone already carries on every mobile screen (`ModuleHeader`), so the picker
 * costs a phone no extra row, exactly like the Schreibtrainer's since s195.
 *
 * It owns nothing about content: the module passes its own rail and its own
 * list, and every scope decision stays in the module.
 */
export function ModulePicker({
  part,
  head,
  rail,
  children,
}: {
  part: MockPartId;
  /** Rendered above the whole frame, full width (a switcher, a scope row). */
  head?: React.ReactNode;
  /** The module's rail. `layout`/`onClose` come from this frame. */
  rail: (props: { layout: "rail" | "panel"; onClose?: () => void; className?: string }) => React.ReactNode;
  /** The list of Aufgaben the current scope serves. */
  children: React.ReactNode;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="space-y-3 sm:space-y-5">
      {head}

      {/* Mobile: the module row, with the rail's toggle in its trailing slot. */}
      <ModuleHeader
        part={part}
        right={
          <Button
            /* Closed = the Himmelblau tile of the rail it opens (founder s166,
               the `outline` fill was too faint against the page ground). */
            variant={pickerOpen ? "default" : "accent"}
            aria-expanded={pickerOpen}
            aria-pressed={pickerOpen}
            aria-label="Aufgabe wählen"
            className="-my-0.5 h-7 shrink-0 gap-1 rounded-md px-2 text-[12.5px] font-semibold"
            onClick={() => setPickerOpen((o) => !o)}
          >
            Aufgabe
            <ChevronDown
              className={cn("h-3.5 w-3.5 shrink-0 transition-transform", pickerOpen && "rotate-180")}
            />
          </Button>
        }
      />

      <div className={cn("lg:hidden", pickerOpen && "pb-1")}>
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

      {/* Desktop: content + sticky rail, the Bibliothek 16rem grid. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8">
        <div className="min-w-0">{children}</div>
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
