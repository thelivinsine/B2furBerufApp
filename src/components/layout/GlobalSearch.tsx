import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { SearchGroup } from "@/lib/search";

/**
 * `lib/search` statically imports EVERY content bank (vocabulary,
 * collocations, dialogues, redemittel, grammar), and this component is mounted
 * eagerly by AppShell on every page. Importing it lazily keeps the banks that
 * only search needs (dialogues, collocations) out of the main bundle; the
 * module is fetched once when the dialog first opens and cached by the module
 * system afterwards.
 */
type SearchFn = (query: string) => SearchGroup[];
let searchFn: SearchFn | null = null;
function loadSearch(): Promise<SearchFn> {
  return import("@/lib/search").then((m) => (searchFn = m.searchAll));
}

/**
 * The universal search surface (UX overhaul Phase 2, Tier 1): one query box
 * over every content bank, opened via the header icon (mobile), the Sidebar
 * entry (desktop), or ⌘K/Ctrl+K from anywhere. Grouped results deep-link into
 * their home surface and close the dialog. Controlled by the parent (AppShell)
 * so both trigger points and the keyboard shortcut share one open state.
 */
export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    // Warm the search module while the user reaches for the keyboard.
    if (!searchFn) void loadSearch();
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  // Defer the corpus scan + result-list render behind keystrokes so typing
  // stays responsive on slow devices; the input itself uses the live value.
  const deferredQuery = useDeferredValue(query);
  const [groups, setGroups] = useState<SearchGroup[]>([]);
  useEffect(() => {
    if (deferredQuery.trim().length < 2) {
      setGroups([]);
      return;
    }
    if (searchFn) {
      setGroups(searchFn(deferredQuery));
      return;
    }
    let cancelled = false;
    void loadSearch().then((fn) => {
      if (!cancelled) setGroups(fn(deferredQuery));
    });
    return () => {
      cancelled = true;
    };
  }, [deferredQuery]);
  const totalResults = groups.reduce((n, g) => n + g.count, 0);
  // The empty/hint states read the deferred query too, so "Keine Ergebnisse"
  // never flashes while results for fresh keystrokes are still being computed.
  const trimmed = deferredQuery.trim();

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[14%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Suche</DialogTitle>
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Wörter, Kollokationen, Redemittel, Grammatik durchsuchen …"
            className="h-6 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {trimmed.length < 2 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              Mindestens 2 Zeichen eingeben …
            </p>
          ) : totalResults === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              Keine Ergebnisse für „{trimmed}".
            </p>
          ) : (
            <div className="space-y-1">
              {groups.map((g) => (
                <div key={g.kind}>
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {g.label} ({g.count})
                  </p>
                  {g.results.map((r) => (
                    <button
                      key={`${g.kind}_${r.id}`}
                      onClick={() => go(r.to)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
                    >
                      <span className="min-w-0 truncate font-medium">{r.title}</span>
                      {r.subtitle && (
                        <span className="min-w-0 shrink truncate text-muted-foreground">{r.subtitle}</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
