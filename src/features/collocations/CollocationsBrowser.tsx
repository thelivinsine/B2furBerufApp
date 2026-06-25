import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown, Combine, ListChecks, Search, X } from "lucide-react";
import { collocations } from "@/data/collocations";
import { themes, themeById } from "@/data/themes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { HubHero } from "@/components/shared/HubHero";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function normalise(s: string) {
  return s.toLowerCase().replace(/[äöü]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue" }[c] ?? c));
}

const pillBase =
  "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors border";
const pillIdle =
  "bg-white text-foreground border-border/60 hover:border-primary/40 hover:text-primary dark:bg-white/8 dark:border-white/15 dark:hover:border-primary/50";
const pillActive = "bg-primary text-primary-foreground border-primary";

type Collocation = (typeof collocations)[number];

function CollocationCard({ c }: { c: Collocation }) {
  return (
    <Card className="card-hover h-full">
      <CardContent className="p-4">
        {/* Phrase + translation, with the formell badge top-right (matches the
            Wortschatz Kollokationen tiles). */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="min-w-0 truncate font-semibold">{c.full}</p>
              <SpeakButton text={c.full} className="shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">{c.en}</p>
          </div>
          {c.register === "formal" && (
            <Badge variant="accent" className="shrink-0">
              formell
            </Badge>
          )}
        </div>

        {/* Example: divider + italic German, with its English translation and
            its own audio kept (the extra content this view carries). */}
        <div className="mt-2 border-t border-border pt-2">
          <div className="flex items-start gap-1.5">
            <p className="min-w-0 flex-1 text-sm italic text-muted-foreground">„{c.example.de}"</p>
            <SpeakButton text={c.example.de} className="shrink-0" />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{c.example.en}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CollocationsBrowser() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const themeParam = params.get("theme") ?? "all";
  const [search, setSearch] = useState("");
  const [verbFilter, setVerbFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const availableVerbs = useMemo(() => {
    const base =
      themeParam === "all" ? collocations : collocations.filter((c) => c.themeId === themeParam);
    return [...new Set(base.map((c) => c.verb))].sort();
  }, [themeParam]);

  const filtered = useMemo(() => {
    let list =
      themeParam === "all" ? collocations : collocations.filter((c) => c.themeId === themeParam);
    if (verbFilter !== "all") list = list.filter((c) => c.verb === verbFilter);
    if (search.trim()) {
      const q = normalise(search.trim());
      list = list.filter(
        (c) =>
          normalise(c.full).includes(q) ||
          normalise(c.noun).includes(q) ||
          normalise(c.verb).includes(q) ||
          normalise(c.en).includes(q),
      );
    }
    return list;
  }, [themeParam, verbFilter, search]);

  const activeTheme = themeParam !== "all" ? themeById(themeParam) : null;

  const setTheme = (val: string) => {
    setVerbFilter("all");
    const p = new URLSearchParams(params);
    if (val === "all") p.delete("theme");
    else p.set("theme", val);
    setParams(p, { replace: true });
  };

  const toggleVerb = (verb: string) =>
    setVerbFilter((prev) => (prev === verb ? "all" : verb));

  const scrollBy = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      <HubHero
        icon={Combine}
        gradient="from-violet-500 to-purple-500"
        eyebrow="Nomen-Verb-Verbindungen"
        title="Kollokationen"
        description="Feste Verbindungen aus Nomen und Verb – lerne sie als Einheit und klinge natürlich und präzise im B2-Beruf-Gespräch."
      />

      {/* Theme + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={themeParam} onValueChange={setTheme}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Alle Themen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Themen</SelectItem>
            {themes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.titleDe}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Nomen, Übersetzung …"
            className="w-full rounded-lg border border-input bg-surface py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Verb chips */}
      <div className="flex items-center gap-1">
        {/* Pinned "Alle Verben" */}
        <button
          onClick={() => setVerbFilter("all")}
          className={cn(pillBase, verbFilter === "all" ? pillActive : pillIdle, "mr-1")}
        >
          Alle Verben
        </button>

        {/* Left arrow */}
        {!expanded && (
          <button
            onClick={() => scrollBy("left")}
            className="shrink-0 rounded-full border border-border/60 bg-white p-1 text-muted-foreground shadow-sm hover:text-foreground dark:bg-white/8 dark:border-white/15"
            aria-label="Nach links scrollen"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Chips row — scrollable or expanded */}
        <div
          ref={expanded ? undefined : scrollRef}
          className={cn(
            "flex gap-1.5 flex-1 min-w-0",
            expanded
              ? "flex-wrap"
              : "overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {availableVerbs.map((verb) => (
            <button
              key={verb}
              onClick={() => toggleVerb(verb)}
              className={cn(
                pillBase,
                "font-mono",
                verbFilter === verb ? pillActive : pillIdle,
              )}
            >
              {verb}
            </button>
          ))}
        </div>

        {/* Right arrow + expand toggle */}
        <div className="flex shrink-0 items-center gap-0.5 ml-1">
          {!expanded && (
            <button
              onClick={() => scrollBy("right")}
              className="shrink-0 rounded-full border border-border/60 bg-white p-1 text-muted-foreground shadow-sm hover:text-foreground dark:bg-white/8 dark:border-white/15"
              aria-label="Nach rechts scrollen"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 rounded-full border border-border/60 bg-white p-1 text-muted-foreground shadow-sm hover:text-foreground dark:bg-white/8 dark:border-white/15"
            aria-label={expanded ? "Weniger anzeigen" : "Alle anzeigen"}
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Count + register legend + quiz CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length} Kollokation{filtered.length !== 1 ? "en" : ""}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-border bg-card" />
              Neutral
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-300/70 dark:bg-indigo-400/40" />
              Formal
            </span>
          </div>
        </div>
        {activeTheme && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/quiz?theme=${activeTheme.id}&level=2`)}
          >
            <ListChecks className="h-3.5 w-3.5" /> Quiz: {activeTheme.titleDe}
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          Keine Ergebnisse. Versuche einen anderen Filter oder Begriff.
        </div>
      ) : (
        // key forces a full remount + fade whenever the filter set changes,
        // eliminating stuck-card states from index-based animation delays.
        <motion.div
          key={`${themeParam}__${verbFilter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((c) => (
            <CollocationCard key={c.id} c={c} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
