import { Construction } from "lucide-react";
import { useAdminLang } from "./adminI18n";

/**
 * Stand-in for admin screens that land in later build chunks (Prüfmodus =
 * chunk 4, Feedback = 5, System/Launch = 6, Steuerung = 7, Inhalte = 9,
 * Nutzer = 13). The nav item and route resolve today so the shell is complete
 * and deep links never 404; each chunk swaps this element for the real screen.
 */
export function AdminPlaceholder({ titleDe, titleEn }: { titleDe: string; titleEn: string }) {
  const { t } = useAdminLang();
  return (
    <div className="space-y-3">
      <h1 className="text-display text-xl font-extrabold tracking-tight sm:text-2xl">{t(titleDe, titleEn)}</h1>
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-surface/60 p-5 text-sm text-muted-foreground">
        <Construction className="h-5 w-5 shrink-0 text-warning" />
        {t("Dieser Bereich folgt in einem späteren Build-Schritt.", "This area lands in a later build step.")}
      </div>
    </div>
  );
}
