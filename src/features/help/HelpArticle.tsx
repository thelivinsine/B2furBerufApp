import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HelpBlocks, HelpChrome } from "./HelpChrome";
import { getHelpArticle, helpArticles, helpCategories, type Lang } from "./content";

/** Public help article reader (/hilfe/:slug). */
export function HelpArticle() {
  const { slug = "" } = useParams();
  const [lang, setLang] = useState<Lang>("de");
  const navigate = useNavigate();
  const article = getHelpArticle(slug);

  // Unknown slug: send readers back to the hub rather than a crash/404.
  if (!article) return <Navigate to="/hilfe" replace />;

  const related = (article.related ?? [])
    .map((s) => getHelpArticle(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <HelpChrome
      lang={lang}
      setLang={setLang}
      title={article.title[lang]}
      updated={article.updated}
      breadcrumb={[{ label: helpCategories[article.category][lang], to: "/hilfe" }]}
    >
      <article>
        <p className="mb-6 max-w-2xl text-base leading-relaxed text-foreground/90">
          {article.description[lang]}
        </p>

        <HelpBlocks blocks={article.body} lang={lang} />

        {article.faq && article.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-xl font-semibold tracking-tight">
              {lang === "de" ? "Häufige Fragen" : "Common questions"}
            </h2>
            <div className="space-y-3">
              {article.faq.map((f) => (
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
        )}
      </article>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {lang === "de" ? "Passt dazu" : "Related"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <button
                key={r.slug}
                onClick={() => navigate(`/hilfe/${r.slug}`)}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/70 p-4 text-left shadow-soft backdrop-blur transition-colors hover:border-primary/40"
              >
                <span className="font-medium">{r.title[lang]}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              </button>
            ))}
          </div>
        </section>
      )}

      <Card className="mt-8">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {lang === "de"
              ? "Alle Anleitungen findest du in der Übersicht."
              : "You can find all guides in the overview."}
          </p>
          <button
            onClick={() => navigate("/hilfe")}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {lang === "de" ? "Alle Hilfe-Themen" : "All help topics"} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </CardContent>
      </Card>
    </HelpChrome>
  );
}

// Re-export so the router can lazy-load both from one module if desired.
export { helpArticles };
