import { Link } from "react-router-dom";
import { Combine, PenLine, Mic, ChevronRight, type LucideIcon } from "lucide-react";
import type { VocabItem } from "@/types";
import { collocationsBySubTheme, collocationsByTheme } from "@/data/collocations";
import { writingPrompts } from "@/data/writingPrompts";
import { scenariosByTheme } from "@/data/dialogues";

/**
 * Cross-module "Verbunden" panel (Taxonomy Phase 4). Given a vocab word, surface
 * the matching content from the OTHER banks that shares its theme / sub-theme:
 * a collocation, a writing prompt and a dialogue. No hand-maintained id lists,
 * the shared `themeId`/`subThemeId` is the join key, so one theme connects every
 * module. (Redemittel carry no themeId, so they are not linked here.)
 */
interface RelatedRow {
  mod: string;
  text: string;
  to: string;
  cta: string;
  icon: LucideIcon;
  /** icon foreground + soft background classes */
  fg: string;
  bg: string;
}

export function relatedRows(item: VocabItem): RelatedRow[] {
  const rows: RelatedRow[] = [];

  // Collocation: prefer one from the same sub-theme, else the same theme.
  const col =
    (item.subThemeId ? collocationsBySubTheme(item.subThemeId)[0] : undefined) ??
    collocationsByTheme(item.themeId)[0];
  if (col) {
    rows.push({
      mod: "Kollokation",
      text: col.full,
      to: `/collocations?theme=${item.themeId}`,
      cta: "üben",
      icon: Combine,
      fg: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/12",
    });
  }

  // Writing prompt for the theme (always present for the 11 themes).
  const wp = writingPrompts[item.themeId];
  if (wp) {
    rows.push({
      mod: "Schreibtraining",
      text: wp.short,
      to: `/writing?theme=${item.themeId}`,
      cta: "starten",
      icon: PenLine,
      fg: "text-cyan-700 dark:text-cyan-400",
      bg: "bg-cyan-500/12",
    });
  }

  // Dialogue / simulation for the theme, if one exists.
  const sc = scenariosByTheme(item.themeId)[0];
  if (sc) {
    rows.push({
      mod: "Dialog",
      text: sc.title,
      to: "/simulation",
      cta: "öffnen",
      icon: Mic,
      fg: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/12",
    });
  }

  return rows;
}

export function RelatedPanel({ item }: { item: VocabItem }) {
  const rows = relatedRows(item);
  if (rows.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Verbunden · zum selben Thema
      </p>
      <div className="space-y-1.5">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <Link
              key={r.mod}
              to={r.to}
              className="group flex items-center gap-2.5 rounded-lg border border-border/60 p-2 transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${r.bg} ${r.fg}`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-[11px] font-semibold ${r.fg}`}>{r.mod}</span>
                <span className="block truncate text-sm">{r.text}</span>
              </span>
              <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-muted-foreground group-hover:text-primary">
                {r.cta}
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
