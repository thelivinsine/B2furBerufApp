import type { RefObject } from "react";
import { cn } from "@/lib/utils";

/**
 * German special-character insert bar (s150) for the writing inputs: learners
 * on non-German keyboards tap ä ö ü ß Ä Ö Ü to insert at the cursor (works over
 * a selection too). Neutral at rest (bg-surface), flashes Himmelblau on press so
 * it sits in the design without competing with the primary action. Used by the
 * Fokus Satzlabor and the Kurz/Lang guided editor.
 */

const CHARS = ["ä", "ö", "ü", "ß", "Ä", "Ö", "Ü"] as const;

export function UmlautKeys({
  textareaRef,
  value,
  onChange,
  className,
}: {
  textareaRef: RefObject<HTMLTextAreaElement>;
  value: string;
  onChange: (next: string) => void;
  className?: string;
}) {
  const insert = (ch: string) => {
    const ta = textareaRef.current;
    const start = ta ? ta.selectionStart : value.length;
    const end = ta ? ta.selectionEnd : value.length;
    onChange(value.slice(0, start) + ch + value.slice(end));
    // Restore the caret just after the inserted character, once React has
    // re-rendered the controlled value.
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      const pos = start + ch.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className={cn("flex gap-1.5", className)} role="group" aria-label="Umlaute einfügen">
      {CHARS.map((ch) => (
        <button
          key={ch}
          type="button"
          aria-label={`${ch} einfügen`}
          // Keep the textarea focused so the caret position is preserved.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insert(ch)}
          className="grid h-6 min-w-[1.6rem] place-items-center rounded-lg border border-border bg-surface px-1 text-sm font-semibold text-foreground transition-colors hover:border-accent/60 hover:bg-accent/20 hover:text-accent-ink active:scale-95"
        >
          {ch}
        </button>
      ))}
    </div>
  );
}
