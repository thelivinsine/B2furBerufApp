import { Link, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { useLibraryScope } from "@/store/useLibraryScope";
import { cn } from "@/lib/utils";

/**
 * Segmented switcher across the four library surfaces. Since UX overhaul
 * Phase 5 (session 49) all four live under the single `/library` hub, selected
 * by a `?tab=` param (the hard merge that Phase 3 deferred). Each segment link
 * carries the shared scope (`useLibraryScope`) so the active theme travels when
 * you hop between the two theme-scoped segments.
 */
const SEGMENTS: { tab: string; label: string; scoped: boolean }[] = [
  { tab: "woerter", label: "Wörter", scoped: true },
  { tab: "kollokationen", label: "Kollokationen", scoped: true },
  { tab: "redemittel", label: "Redemittel", scoped: false },
  { tab: "grammatik", label: "Grammatik", scoped: false },
];

export const LIBRARY_TABS = SEGMENTS.map((s) => s.tab);
export const DEFAULT_LIBRARY_TAB = "woerter";

export function LibrarySwitcher() {
  const [params] = useSearchParams();
  const current = params.get("tab") ?? DEFAULT_LIBRARY_TAB;
  const { theme, sub } = useLibraryScope();

  const linkFor = (seg: (typeof SEGMENTS)[number]) => {
    const p = new URLSearchParams();
    p.set("tab", seg.tab);
    if (seg.scoped && theme !== "all") {
      p.set("theme", theme);
      if (seg.tab === "woerter" && sub) p.set("sub", sub);
    }
    return `/library?${p.toString()}`;
  };

  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
      {SEGMENTS.map((seg) => {
        const active = current === seg.tab;
        return (
          <Link
            key={seg.tab}
            to={linkFor(seg)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-center text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {seg.label}
          </Link>
        );
      })}
    </div>
  );
}

/** Dismissible chip showing the active library scope on theme-scoped surfaces. */
export function ScopeChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      Kontext: {label}
      <button onClick={onClear} aria-label="Kontext entfernen" className="hover:text-primary/70">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
