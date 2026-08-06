import { useReducedMotion, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import { cn } from "@/lib/utils";

/**
 * The Prüfung hub's tab switcher, split out of `PruefungHub.tsx` into its own
 * tiny module (founder, this session: the AppShell header's "Guten Morgen"
 * space becomes a "Prüfung" title next to the toggle buttons on desktop).
 *
 * AppShell renders this DESKTOP copy eagerly (it is app-wide chrome, mounted
 * on every route), so this file may import ONLY light, route-agnostic deps.
 * `PruefungHub.tsx` pulls in `engine/exam` and, behind it, the text/dialogue/
 * writing content banks (CLAUDE.md: "the Dashboard imports NO content bank ...
 * never re-introduce a static import chain from eager code to a bank"); that
 * rule applies even harder to AppShell, which every route mounts through. Do
 * not move this back into `PruefungHub.tsx` and import it from AppShell.
 */

export type Tab = "module" | "modelltest";

export const TABS: { id: Tab; label: string }[] = [
  { id: "module", label: "Module üben" },
  { id: "modelltest", label: "Modelltest" },
];

export const tabId = (t: Tab, scope: string) => `pruefung-tab-${scope ? `${scope}-` : ""}${t}`;
export const panelId = (t: Tab) => `pruefung-panel-${t}`;

/**
 * The Prüfung tab, read from the URL. Both the hub's own mobile switcher and
 * the AppShell header's desktop copy call this, so the two never disagree on
 * how `?tab=` is parsed or written.
 */
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
 *
 * Two copies exist since this session: the hub's own (mobile, `lg:hidden` in
 * the page body) and the AppShell header's (desktop, beside the "Prüfung"
 * title). Both drive the SAME `tab` URL param via `usePruefungTab` above, so
 * `idPrefix` only has to keep their button ids apart; `aria-controls` still
 * names the one real panel that `PruefungHub` renders.
 */
export function TabSwitcher({
  tab,
  onSelect,
  idPrefix = "",
  className,
}: {
  tab: Tab;
  onSelect: (t: Tab) => void;
  idPrefix?: string;
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
      .querySelector<HTMLElement>(`#${tabId(TABS[next].id, idPrefix)}`)
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
            id={tabId(t.id, idPrefix)}
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
