import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Combine, ListChecks, Search, X } from "lucide-react";
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

export function CollocationsBrowser() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const themeParam = params.get("theme") ?? "all";
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list =
      themeParam === "all" ? collocations : collocations.filter((c) => c.themeId === themeParam);
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
  }, [themeParam, search]);

  const activeTheme = themeParam !== "all" ? themeById(themeParam) : null;

  const setTheme = (val: string) => {
    const p = new URLSearchParams(params);
    if (val === "all") p.delete("theme");
    else p.set("theme", val);
    setParams(p, { replace: true });
  };

  return (
    <div className="space-y-6">
      <HubHero
        icon={Combine}
        gradient="from-violet-500 to-purple-500"
        eyebrow="Nomen-Verb-Verbindungen"
        title="Kollokationen"
        description="Feste Verbindungen aus Nomen und Verb – lerne sie als Einheit und klinge natürlich und präzise im B2-Beruf-Gespräch."
      />

      {/* Filters */}
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
            placeholder="Suche nach Verb, Nomen, Übersetzung …"
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

      {/* Result count + quiz CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filtered.length} Kollokation{filtered.length !== 1 ? "en" : ""}
          {themeParam !== "all" && activeTheme ? ` · ${activeTheme.titleDe}` : ""}
        </p>
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
          Keine Ergebnisse für „{search}" — versuche einen anderen Begriff.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => {
            const theme = c.themeId ? themeById(c.themeId) : null;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.4) }}
              >
                <Card className={cn("h-full overflow-hidden")}>
                  {theme && <div className={`h-1 w-full bg-gradient-to-r ${theme.accent}`} />}
                  <CardContent className="space-y-3 p-4">
                    {/* Phrase + TTS */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base font-bold leading-snug">{c.full}</p>
                      <SpeakButton text={c.full} className="mt-0.5 shrink-0" />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="muted" className="font-mono text-xs">
                        + {c.verb}
                      </Badge>
                      {c.register === "formal" && (
                        <Badge variant="muted" className="text-xs">
                          formal
                        </Badge>
                      )}
                      {theme && (
                        <Badge variant="muted" className="text-xs">
                          {theme.titleDe}
                        </Badge>
                      )}
                    </div>

                    {/* Translation */}
                    <p className="text-sm italic text-muted-foreground">{c.en}</p>

                    {/* Example */}
                    <div className="space-y-0.5 border-t border-border pt-2.5">
                      <div className="flex items-start gap-1.5">
                        <p className="flex-1 text-sm leading-relaxed">{c.example.de}</p>
                        <SpeakButton text={c.example.de} className="mt-0.5 shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground">{c.example.en}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
