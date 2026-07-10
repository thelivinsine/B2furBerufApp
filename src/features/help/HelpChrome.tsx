import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HelpBlock, Lang } from "./content";

/**
 * Shared shell for the public help routes (/hilfe and /hilfe/:slug). Mirrors the
 * LegalChrome look (Genauly header, back button, Deutsch/English toggle) but adds
 * a breadcrumb row so an article reads as part of the help section. Rendered
 * outside the AppShell/onboarding gate so crawlers and logged-out users can read
 * it. The prerender script (scripts/prerender-help.mjs) emits a matching static
 * HTML snapshot of the same content for search engines.
 */
export function HelpChrome({
  lang,
  setLang,
  title,
  updated,
  breadcrumb,
  children,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  title: string;
  updated?: string;
  breadcrumb?: { label: string; to: string }[];
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const backLabel = lang === "de" ? "Zurück" : "Back";
  const updatedLabel = lang === "de" ? "Zuletzt aktualisiert" : "Last updated";
  const helpLabel = lang === "de" ? "Hilfe" : "Help";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <button onClick={() => navigate("/welcome")} className="flex items-center gap-2.5 text-left">
          <img
            src="/genauly-default-logo-transparent-corners.png"
            alt=""
            className="h-9 w-9 rounded-lg shadow-glow"
          />
          <span className="text-lg font-semibold tracking-tight">Genauly</span>
        </button>
        <Button variant="ghost" onClick={() => navigate("/hilfe")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <button onClick={() => navigate("/hilfe")} className="hover:text-foreground hover:underline">
            {helpLabel}
          </button>
          {breadcrumb?.map((b) => (
            <span key={b.to} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              <button onClick={() => navigate(b.to)} className="hover:text-foreground hover:underline">
                {b.label}
              </button>
            </span>
          ))}
        </nav>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {updated && (
              <p className="mt-1 text-sm text-muted-foreground">
                {updatedLabel}: {updated}
              </p>
            )}
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        {children}
      </main>
    </div>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Sprache / Language"
      className="inline-grid shrink-0 grid-cols-2 gap-1 self-start rounded-lg bg-muted p-1 sm:self-auto"
    >
      {(["de", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={lang === l}
          onClick={() => setLang(l)}
          className={cn(
            "h-8 rounded-md px-3 text-sm font-medium transition-colors",
            lang === l
              ? "bg-surface text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l === "de" ? "Deutsch" : "English"}
        </button>
      ))}
    </div>
  );
}

/** Renders the article body blocks. Kept in lockstep with the plain-HTML
 *  serializer in scripts/prerender-help.mjs so both surfaces match. */
export function HelpBlocks({ blocks, lang }: { blocks: HelpBlock[]; lang: Lang }) {
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-muted-foreground">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} className="pt-2 text-xl font-semibold tracking-tight text-foreground">
                {b[lang]}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="pt-1 text-base font-semibold text-foreground">
                {b[lang]}
              </h3>
            );
          case "p":
            return <p key={i}>{b[lang]}</p>;
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5">
                {b[lang].map((li, j) => (
                  <li key={j}>{li}</li>
                ))}
              </ul>
            );
          case "steps":
            return (
              <ol key={i} className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-primary">
                {b[lang].map((li, j) => (
                  <li key={j}>{li}</li>
                ))}
              </ol>
            );
          case "note":
            return (
              <div
                key={i}
                className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground"
              >
                {b[lang]}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
