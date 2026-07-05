import { useRouteError } from "react-router-dom";
import { Link } from "react-router-dom";
import { isChunkLoadError, recoverFromStaleAssets } from "@/lib/recover";

/**
 * Per-route error boundary (audit D5). Before this, any render error in one
 * page unmounted the ENTIRE app to the root crash screen (or react-router's
 * default "Unexpected Application Error"). Attached as `errorElement` to the
 * routes in router.tsx, it contains the crash to the page area: the shell
 * (nav, header) stays alive and the learner gets a way back.
 */
export function RouteError() {
  const error = useRouteError();

  if (isChunkLoadError(error)) {
    // Stale service worker after a deploy: self-heal (guarded against loops
    // inside recoverFromStaleAssets) and offer the manual reload as fallback.
    void recoverFromStaleAssets();
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h2 className="text-lg font-semibold">Neue Version verfügbar</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Die App wurde aktualisiert. Bitte lade neu, um weiterzumachen.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Neu laden
        </button>
      </div>
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-lg font-semibold">Hier ist etwas schiefgelaufen</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Dieser Bereich konnte nicht geladen werden. Dein Lernfortschritt ist gespeichert.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-muted/50 p-3 text-left text-xs text-muted-foreground">
        {message}
      </pre>
      <div className="mt-5 flex justify-center gap-2">
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
        >
          Neu laden
        </button>
        <Link
          to="/"
          reloadDocument
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Zur Übersicht
        </Link>
      </div>
    </div>
  );
}
