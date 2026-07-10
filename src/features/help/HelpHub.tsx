import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HelpChrome } from "./HelpChrome";
import {
  helpArticles,
  helpCategories,
  helpHub,
  type HelpCategory,
  type Lang,
} from "./content";

const CATEGORY_ORDER: HelpCategory[] = ["grundlagen", "ueben", "spielen"];

/** Public help hub (/hilfe): grouped article index + a short FAQ. */
export function HelpHub() {
  const [lang, setLang] = useState<Lang>("de");
  const navigate = useNavigate();

  return (
    <HelpChrome lang={lang} setLang={setLang} title={helpHub.title[lang]}>
      <p className="mb-8 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        {helpHub.intro[lang]}
      </p>

      <div className="space-y-8">
        {CATEGORY_ORDER.map((cat) => {
          const items = helpArticles.filter((a) => a.category === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {helpCategories[cat][lang]}
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {items.map((a) => {
                  const Icon =
                    (Icons[a.icon as keyof typeof Icons] as React.ComponentType<{
                      className?: string;
                    }>) ?? Icons.BookOpen;
                  return (
                    <button
                      key={a.slug}
                      onClick={() => navigate(`/hilfe/${a.slug}`)}
                      className="group flex items-start gap-3 rounded-2xl border border-border bg-surface/70 p-4 text-left shadow-soft backdrop-blur transition-colors hover:border-primary/40"
                    >
                      <span className="mt-0.5 inline-flex shrink-0 rounded-xl bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 font-semibold">
                          {a.title[lang]}
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {a.description[lang]}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {lang === "de" ? "Häufige Fragen" : "Common questions"}
        </h2>
        <div className="space-y-3">
          {helpHub.faq.map((f) => (
            <details
              key={f.q[lang]}
              className="group rounded-2xl border border-border bg-surface/70 p-4 shadow-soft backdrop-blur [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold">
                {f.q[lang]}
                <ArrowRight className="h-4 w-4 shrink-0 text-primary transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a[lang]}</p>
            </details>
          ))}
        </div>
      </section>

      <Card className="mt-8">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {lang === "de"
              ? "Bereit? Leg direkt los und probiere Üben und Spielen aus."
              : "Ready? Jump in and try Üben and Spielen for yourself."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {lang === "de" ? "Zur App" : "Open the app"} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </CardContent>
      </Card>
    </HelpChrome>
  );
}
