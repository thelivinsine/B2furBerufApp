import { useReducedMotion, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import { cn } from "@/lib/utils";

/**
 * The Prüfung hub's tab switcher.
 *
 * It lives in its own module because s196 rendered a SECOND copy of it from
 * `AppShell` (app-wide chrome, mounted on every route) and that copy could not
 * be allowed to reach `PruefungHub.tsx`, which pulls in `engine/exam` and,
 * behind it, the text/dialogue/writing content banks (CLAUDE.md: "never
 * re-introduce a static import chain from eager code to a bank"). s197 took
 * that copy back out (founder pick C: the switcher IS the page header, at every
 * width, and the app header's greeting slot stays empty on this route), so the
 * hub is the only caller again. The split stays: it costs nothing, and it is
 * what keeps the eager bundle safe if the header ever wants the switcher back.
 */

export type Tab = "module" | "modelltest";

export const TABS: { id: Tab; label: string }[] = [
  { id: "module", label: "Module üben" },
  { id: "modelltest", label: "Modelltest" },
];

export const tabId = (t: Tab) => `pruefung-tab-${t}`;
export const panelId = (t: Tab) => `pruefung-panel-${t}`;

/** The Prüfung tab, read from and written to the URL's `?tab=` param. */
export function usePruefungTab(): [Tab, (t: Tab) => void] {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("tab") === "modelltest" ? "modelltest" : "module";
  const selectTab = (next: Tab) => {
    const p = new URLSearchParams(params);
    if (next === "module") p.delete("tab");
    else p.set("tab", next);
    setParams(p, { replace: true });
  };
  return [tab, selectTab];
}

/**
 * The page header switcher. Same mechanism as `LibrarySwitcher`: a recessed
 * grey track with ONE always-mounted white pill measured to the active
 * segment, never a per-segment crossfade. Two segments, so it is
 * content-sized from lg up rather than stretched across the column.
 *
 * A REAL tablist (s194 audit P27): ids paired with the panel it controls, a
 * roving tab stop and arrow keys.
 */
export function TabSwitcher({
  tab,
  onSelect,
  className,
}: {
  tab: Tab;
  onSelect: (t: Tab) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(tab);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const ix = TABS.findIndex((t) => t.id === tab);
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (ix + 1) % TABS.length
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (ix - 1 + TABS.length) % TABS.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? TABS.length - 1
              : -1;
    if (next === -1) return;
    e.preventDefault();
    onSelect(TABS[next].id);
    // Focus follows selection, which is the automatic-activation pattern the
    // sliding pill already implements visually.
    (e.currentTarget as HTMLElement)
      .querySelector<HTMLElement>(`#${tabId(TABS[next].id)}`)
      ?.focus();
  };

  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="tablist"
      aria-label="Prüfung"
      onKeyDown={onKeyDown}
      // The column is `items-center`, so from lg up the track sizes to its two
      // labels instead of stretching across the page, which is the "switcher
      // too big" shape rejected in s149. Full width on a phone.
      className={cn(
        "relative flex w-full max-w-sm items-stretch gap-1 rounded-lg border border-border bg-muted p-1 shadow-soft lg:w-auto lg:max-w-none",
        className,
      )}
    >
      {rect && (
        <motion.span
          aria-hidden
          className="absolute bottom-1 left-0 top-1 rounded-md bg-surface shadow-soft"
          initial={false}
          animate={{ x: rect.left, width: rect.width }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
        />
      )}
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            ref={registerItem(t.id) as React.Ref<HTMLButtonElement>}
            type="button"
            role="tab"
            id={tabId(t.id)}
            aria-selected={active}
            aria-controls={panelId(t.id)}
            // One tab stop for the whole set, as ARIA's tabs pattern requires.
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(t.id)}
            className={cn(
              "relative z-10 flex-1 rounded-md px-5 py-1.5 text-sm transition-colors lg:flex-none",
              active ? "font-bold text-foreground" : "font-semibold text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
