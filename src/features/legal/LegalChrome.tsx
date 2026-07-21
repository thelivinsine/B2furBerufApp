import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";

export type Lang = "de" | "en";

/**
 * Shared shell for the standalone legal routes (/privacy, /terms). Renders the
 * Genauly header, a back button, and a Deutsch / English toggle at the top so
 * each page can be read in either language. Both pages keep their content in a
 * `{ de, en }` shape and switch on the `lang` state the parent owns.
 */
export function LegalChrome({
  lang,
  setLang,
  title,
  lastUpdated,
  children,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Mirror PrivacyPolicy's original back behaviour: go back one step, but fall
  // back to "/" when the page was opened directly (no prior in-app history,
  // which react-router marks with the "default" key).
  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  };

  const backLabel = lang === "de" ? "Zurück" : "Back";
  const updatedLabel = lang === "de" ? "Zuletzt aktualisiert" : "Last updated";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-page">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <button
          onClick={() => navigate("/welcome")}
          className="flex items-center gap-2.5 text-left"
        >
          <Logo variant="wordmark" className="h-8 w-auto" />
        </button>
        <Button variant="ghost" onClick={handleBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-display text-2xl sm:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {updatedLabel}: {lastUpdated}
            </p>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        <div className="space-y-5">{children}</div>
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

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}
