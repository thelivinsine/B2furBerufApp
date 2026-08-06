import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AudioLines, ChevronRight, FileText, ListChecks, Shuffle } from "lucide-react";
import { themeById } from "@/data/themes";
import { LISTENING_COUNT, PART_LABEL, READING_COUNT, type MockExamLevel } from "@/engine/exam";
import {
  EMPTY_TEXT_SCOPE,
  MODULE_LEVELS,
  TEXT_KIND_LABEL,
  countTexts,
  kindsInPart,
  levelOfText,
  scopedTexts,
  type ReceptivePart,
  type TextScope,
} from "@/lib/moduleScope";
import { normalizeLevelScope } from "@/lib/writingScope";
import { SECTOR_OPTIONS } from "@/lib/facets";
import { matchesLifeArea, normalizeLifeArea, themeGroupsByArea } from "@/lib/lifeAreas";
import { LifeAreaPills } from "@/features/shared/LifeAreaPills";
import { ScopeRail, ScopeSection, ScopeSelect } from "@/features/shared/ScopeRail";
import { useExamStore } from "@/store/useExamStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModulePicker, ScopeEmpty } from "./ModulePicker";
import { PART_META } from "@/features/exam/partMeta";
import { cn } from "@/lib/utils";

/**
 * Lesen and Hören, without a clock (founder s196).
 *
 * Before this the two receptive modules had no Ohne-Zeit shape of their own:
 * tapping the card composed a random three-text (or two-Ansage) drill and threw
 * the learner straight into it, so the only difference from Mit Zeit was the
 * timer pill, and there was no way to practise a particular text. The founder
 * asked for Schreiben's answer, and this is it: the same "Aufgabe wählen" rail,
 * the same frame, over a list of what the scope actually serves.
 *
 * Starting one text runs the SAME `LesenPart` / `HoerenPart` the Modelltest
 * uses, untimed and over the picked id (`MockExamPicks`), so it scores the same
 * way and its result lands in the same Module-üben Verlauf. The exam draw is
 * still one tap away as "Zufällige Auswahl", which is what the card used to do.
 */

const COUNT_FOR: Record<ReceptivePart, number> = {
  lesen: READING_COUNT,
  hoeren: LISTENING_COUNT,
};

const NOUN: Record<ReceptivePart, { one: string; many: string }> = {
  lesen: { one: "Text", many: "Texte" },
  hoeren: { one: "Ansage", many: "Ansagen" },
};

export function TextModuleHub({ part }: { part: ReceptivePart }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const start = useExamStore((s) => s.start);
  const setZoneExit = useSessionStore((s) => s.setZoneExit);

  // The whole scope lives in the URL, like Schreiben's: a reload, a share and
  // the back button all land on the same list, and the Niveau the hub handed
  // over (`?level=`) is honoured rather than silently dropped.
  const scope: TextScope = useMemo(
    () => ({
      level: normalizeLevelScope(params.get("level") ?? ""),
      sector: params.get("sector") ?? "",
      area: normalizeLifeArea(params.get("area")),
      theme: params.get("theme") ?? "",
      sub: params.get("sub") ?? "",
      kind: params.get("kind") ?? "",
    }),
    [params],
  );

  const patch = useCallback(
    (next: Partial<TextScope>) => {
      const p = new URLSearchParams(params);
      for (const [k, v] of Object.entries(next)) {
        if (!v) p.delete(k);
        else p.set(k, v);
      }
      setParams(p, { replace: true });
    },
    [params, setParams],
  );

  /** The zone's ONE exit (founder s195): a list has nothing to lose, so no confirm. */
  useEffect(() => {
    setZoneExit({ tone: "quiet", run: () => navigate("/anwenden") });
    return () => setZoneExit(null);
  }, [navigate, setZoneExit]);

  const list = useMemo(() => scopedTexts(part, scope), [part, scope]);
  const countWith = useCallback(
    (over: Partial<TextScope>) => countTexts(part, { ...scope, ...over }),
    [part, scope],
  );

  const kinds = useMemo(() => kindsInPart(part), [part]);
  const theme = themeById(scope.theme);
  const subThemes = theme?.subThemes ?? [];

  const resetScope = () => {
    const p = new URLSearchParams(params);
    for (const key of Object.keys(EMPTY_TEXT_SCOPE)) p.delete(key);
    setParams(p, { replace: true });
  };

  /** Open one text as an untimed single-text drill. */
  const openText = (id: string, level: MockExamLevel) => {
    start(level, [part], { untimed: true, picks: { [part]: [id] } });
  };

  /** The classic draw: the module's full exam-shaped set, still without a clock. */
  const openRandom = () => {
    const pool = list.length ? list : scopedTexts(part, EMPTY_TEXT_SCOPE);
    if (!pool.length) return;
    const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, COUNT_FOR[part]);
    // The scope's Niveau wins when the learner set one, so the result is filed
    // under the level they were practising rather than under whichever text the
    // shuffle happened to put first.
    const level = (MODULE_LEVELS.some((l) => l.value === scope.level)
      ? scope.level
      : levelOfText(picked[0])) as MockExamLevel;
    start(level, [part], {
      untimed: true,
      picks: { [part]: picked.map((t) => t.id) },
    });
  };

  // The narrowest active filter, so an empty scope can name what to drop
  // (founder rule: an empty scope gets an empty state naming ONE filter).
  const blame = scope.sub
    ? "das Unterthema"
    : scope.theme
      ? "das Thema"
      : scope.kind
        ? "die Textsorte"
        : scope.area
          ? "den Lebensbereich"
          : scope.level
            ? "das Niveau"
            : null;

  const rail = ({
    layout,
    onClose,
    className,
  }: {
    layout: "rail" | "panel";
    onClose?: () => void;
    className?: string;
  }) => (
    <ScopeRail
      layout={layout}
      onClose={onClose}
      className={className}
      onReset={resetScope}
      resetLabel="Auswahl zurücksetzen"
    >
      {/* Niveau -> Branche -> Lebensbereich -> Thema -> Unterthema -> Textsorte:
          the ONE Bibliothek hierarchy, in the order the Schreiben rail uses. */}
      <ScopeSection label="Niveau">
        <ScopeSelect
          ariaLabel="Niveau"
          triggerLabel={scope.level || "Alle Niveaus"}
          value={scope.level}
          onChange={(level) => patch({ level })}
          groups={[
            {
              label: "",
              options: [
                { value: "", label: "Alle Niveaus", count: countWith({ level: "" }) },
                ...MODULE_LEVELS.map((l) => {
                  const count = countWith({ level: l.value });
                  return { value: l.value, label: l.label, count, disabled: count === 0 };
                }),
              ],
            },
          ]}
        />
      </ScopeSection>

      <ScopeSection label="Branche">
        <ScopeSelect
          ariaLabel="Branche"
          triggerLabel={
            scope.sector
              ? SECTOR_OPTIONS.find((o) => o.value === scope.sector)?.label ?? scope.sector
              : "Alle Branchen"
          }
          value={scope.sector}
          onChange={(sector) => patch({ sector })}
          groups={[
            {
              label: "",
              options: [
                { value: "", label: "Alle Branchen", count: countWith({ sector: "" }) },
                // Soft axis: untagged texts are universal, so a Branche narrows
                // the pool and can never empty it on its own.
                ...SECTOR_OPTIONS.map((o) => {
                  const count = countWith({ sector: o.value });
                  return { value: o.value, label: o.label, count, disabled: count === 0 };
                }),
              ],
            },
          ]}
        />
      </ScopeSection>

      <ScopeSection label="Lebensbereich">
        <LifeAreaPills
          value={scope.area}
          onChange={(area) => patch({ area, theme: "", sub: "" })}
          counts={{
            professional: countWith({ area: "professional", theme: "", sub: "" }),
            personal: countWith({ area: "personal", theme: "", sub: "" }),
          }}
        />
      </ScopeSection>

      <ScopeSection label="Thema">
        <ScopeSelect
          ariaLabel="Thema"
          triggerLabel={scope.theme ? theme?.titleDe ?? scope.theme : "Alle Themen"}
          value={scope.theme}
          onChange={(id) => patch({ theme: id, sub: "" })}
          groups={[
            {
              label: "",
              options: [
                { value: "", label: "Alle Themen", count: countWith({ theme: "", sub: "" }) },
              ],
            },
            // TWO groups, never more: the one app-wide Berufsleben/Alltag fold.
            ...themeGroupsByArea((id) => countWith({ theme: id, sub: "" }), {
              include: (id) => matchesLifeArea(id, scope.area) || id === scope.theme,
              disableZero: true,
            }),
          ]}
        />
      </ScopeSection>

      {subThemes.length > 0 && (
        <ScopeSection label="Unterthema">
          <ScopeSelect
            ariaLabel="Unterthema"
            triggerLabel={
              scope.sub
                ? subThemes.find((s) => s.id === scope.sub)?.titleDe ?? scope.sub
                : "Gesamtes Thema"
            }
            value={scope.sub}
            onChange={(sub) => patch({ sub })}
            groups={[
              {
                label: "",
                options: [
                  { value: "", label: "Gesamtes Thema", count: countWith({ sub: "" }) },
                  ...subThemes.map((s) => {
                    const count = countWith({ sub: s.id });
                    return { value: s.id, label: s.titleDe, count, disabled: count === 0 };
                  }),
                ],
              },
            ]}
          />
        </ScopeSection>
      )}

      {kinds.length > 1 && (
        <ScopeSection label="Textsorte">
          <ScopeSelect
            ariaLabel="Textsorte"
            triggerLabel={
              scope.kind ? TEXT_KIND_LABEL[scope.kind as keyof typeof TEXT_KIND_LABEL] : "Alle Textsorten"
            }
            value={scope.kind}
            onChange={(kind) => patch({ kind })}
            groups={[
              {
                label: "",
                options: [
                  { value: "", label: "Alle Textsorten", count: countWith({ kind: "" }) },
                  ...kinds.map((k) => {
                    const count = countWith({ kind: k });
                    return {
                      value: k,
                      label: TEXT_KIND_LABEL[k],
                      count,
                      disabled: count === 0,
                    };
                  }),
                ],
              },
            ]}
          />
        </ScopeSection>
      )}
    </ScopeRail>
  );

  const noun = NOUN[part];
  const Mark = PART_META[part].icon;

  return (
    <ModulePicker part={part} rail={rail}>
      <div className="space-y-3">
        {/* The count and the random draw, on ONE row: what the scope serves,
            and the one action that does not require choosing (the exam draw the
            card used to perform on its own). */}
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-eyebrow text-muted-foreground">{PART_LABEL[part]} üben</p>
          <Badge variant="muted" className="tabular-nums">
            {list.length} {list.length === 1 ? noun.one : noun.many}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            onClick={openRandom}
            disabled={list.length === 0}
          >
            <Shuffle className="h-3.5 w-3.5" /> Zufällige Auswahl
          </Button>
        </div>

        {list.length === 0 ? (
          <ScopeEmpty what={noun.many} blame={blame} onReset={resetScope} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {list.map((text, i) => {
              const themeOf = themeById(text.themeId);
              const level = levelOfText(text);
              const hasNotes = (text.notes?.length ?? 0) > 0;
              return (
                <motion.button
                  key={text.id}
                  type="button"
                  onClick={() => openText(text.id, level)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.18), duration: 0.16 }}
                  className="card-hover flex flex-col items-start gap-2.5 rounded-xl border border-border bg-surface p-4 text-left shadow-soft"
                >
                  <span className="flex w-full items-start gap-2.5">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        PART_META[part].tile,
                      )}
                    >
                      <Mark className={cn("h-[1.0625rem] w-[1.0625rem]", PART_META[part].ink)} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold leading-snug">
                        {text.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {TEXT_KIND_LABEL[text.kind]}
                        {themeOf ? ` · ${themeOf.titleDe}` : ""}
                      </span>
                    </span>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </span>
                  <span className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2.5 text-xs text-muted-foreground">
                    <Badge variant="outline" className="tabular-nums">
                      {text.cefr}
                    </Badge>
                    <span className="flex items-center gap-1 tabular-nums">
                      <ListChecks className="h-3.5 w-3.5" />
                      {text.checks.length} {text.checks.length === 1 ? "Aufgabe" : "Aufgaben"}
                    </span>
                    {hasNotes && (
                      <span className="flex items-center gap-1">
                        {part === "hoeren" ? (
                          <AudioLines className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                        Notizen
                      </span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </ModulePicker>
  );
}

export function LesenHub() {
  return <TextModuleHub part="lesen" />;
}

export function HoerenHub() {
  return <TextModuleHub part="hoeren" />;
}
