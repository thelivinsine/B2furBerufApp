import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useLibraryScope } from "@/store/useLibraryScope";
import { cn } from "@/lib/utils";

/**
 * Segmented switcher across the four library surfaces (UX overhaul Phase 3,
 * soft merge). It gives the separate Wörter / Kollokationen / Redemittel /
 * Grammatik pages a single-hub feel without a route merge (that lands in
 * Phase 5 with the nav re-map). Each segment link carries the shared scope
 * (`useLibraryScope`) so the active theme travels when you hop between the two
 * theme-scoped segments.
 */
const SEGMENTS: { to: string; label: string; scoped: boolean }[] = [
  { to: "/vocabulary", label: "Wörter", scoped: true },
  { to: "/collocations", label: "Kollokationen", scoped: true },
  { to: "/redemittel", label: "Redemittel", scoped: false },
  { to: "/grammar", label: "Grammatik", scoped: false },
];

export function LibrarySwitcher() {
  const location = useLocation();
  const { theme, sub } = useLibraryScope();

  const linkFor = (seg: (typeof SEGMENTS)[number]) => {
    if (!seg.scoped || theme === "all") return seg.to;
    const p = new URLSearchParams();
    p.set("theme", theme);
    if (seg.to === "/vocabulary" && sub) p.set("sub", sub);
    return `${seg.to}?${p.toString()}`;
  };

  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1">
      {SEGMENTS.map((seg) => {
        const active = location.pathname === seg.to;
        return (
          <Link
            key={seg.to}
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
