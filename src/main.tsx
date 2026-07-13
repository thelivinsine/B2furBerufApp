import { Component, StrictMode } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import {
  recoverFromStaleAssets,
  isChunkLoadError,
  isServiceWorkerError,
} from "./lib/recover";
import { watchSwUpdates } from "./lib/swUpdate";
// Self-hosted Inter (variable). Replaces the third-party rsms.me stylesheet —
// no external font dependency, no IP leak, and a tighter CSP.
import "@fontsource-variable/inter";
import "./index.css";

/**
 * Last-resort, framework-free crash reporter. The React error boundary below
 * can only catch errors that happen *after* React mounts. Anything that throws
 * during module evaluation (a circular-chunk TDZ ReferenceError, a missing
 * chunk, an unsupported browser API at import time) crashes before
 * createRoot() ever runs, leaving a blank page with the error only in a console
 * the user often can't reach (e.g. mobile). This paints a friendly, branded
 * recovery screen straight into #root via the DOM so a crash is always
 * handled gracefully. Keep it as a permanent net.
 *
 * The user-facing card is calm and on-brand (headline + "Neu laden" button);
 * the raw error + stack stay available behind a collapsed "Technische Details"
 * expander, preserving the mobile-debug value without showing a scary wall of
 * monospace text to a learner.
 */
function paintFatal(_label: string, detail: unknown): void {
  const root = document.getElementById("root");
  if (!root || root.dataset.fatal === "1") return;
  root.dataset.fatal = "1";
  const msg = detail instanceof Error ? detail.message : String(detail);
  const stack = detail instanceof Error ? detail.stack ?? "" : "";
  root.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.setAttribute(
    "style",
    "min-height:100dvh;display:flex;align-items:center;justify-content:center;" +
      "padding:1.5rem;box-sizing:border-box;" +
      "font-family:'Inter Variable',Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;",
  );

  const card = document.createElement("div");
  card.setAttribute(
    "style",
    "width:100%;max-width:24rem;background:#ffffff;border:1px solid #e5e7eb;" +
      "border-radius:1rem;box-shadow:0 10px 40px -12px rgba(30,41,59,0.25);" +
      "padding:2rem 1.75rem;text-align:center;color:#0f172a;",
  );

  const badge = document.createElement("div");
  badge.setAttribute(
    "style",
    "width:3rem;height:3rem;margin:0 auto 1.25rem;border-radius:0.875rem;" +
      "background:linear-gradient(135deg,#6366f1,#8b5cf6);" +
      "display:flex;align-items:center;justify-content:center;" +
      "font-size:1.5rem;font-weight:700;color:#fff;" +
      "box-shadow:0 8px 24px -8px rgba(99,102,241,0.6);",
  );
  badge.textContent = "G";

  const h = document.createElement("h1");
  h.setAttribute(
    "style",
    "margin:0 0 0.5rem;font-size:1.25rem;font-weight:700;letter-spacing:-0.01em;",
  );
  h.textContent = "Kurz nicht erreichbar";

  const p = document.createElement("p");
  p.setAttribute(
    "style",
    "margin:0 0 1.5rem;font-size:0.9375rem;line-height:1.5;color:#475569;",
  );
  p.textContent =
    "Beim Laden ist etwas schiefgelaufen. Das liegt oft an einer wackeligen Verbindung. Bitte lade die App neu.";

  const btn = document.createElement("button");
  btn.setAttribute(
    "style",
    "width:100%;padding:0.75rem 1.5rem;border:none;border-radius:0.75rem;" +
      "background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;" +
      "font-size:1rem;font-weight:600;cursor:pointer;" +
      "box-shadow:0 8px 24px -8px rgba(99,102,241,0.6);" +
      "font-family:inherit;",
  );
  btn.textContent = "Neu laden";
  btn.addEventListener("click", () => window.location.reload());

  const details = document.createElement("details");
  details.setAttribute("style", "margin-top:1.25rem;text-align:left;");
  const summary = document.createElement("summary");
  summary.setAttribute(
    "style",
    "cursor:pointer;font-size:0.8125rem;color:#94a3b8;user-select:none;" +
      "text-align:center;list-style:none;",
  );
  summary.textContent = "Technische Details";
  const pre = document.createElement("pre");
  pre.setAttribute(
    "style",
    "margin:0.75rem 0 0;background:#f1f5f9;padding:0.875rem;border-radius:0.5rem;" +
      "overflow-x:auto;font-size:0.75rem;line-height:1.5;color:#475569;" +
      "white-space:pre-wrap;word-break:break-word;" +
      "font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;",
  );
  pre.textContent = stack ? `${msg}\n\n${stack}` : msg;
  details.append(summary, pre);

  card.append(badge, h, p, btn, details);
  wrap.appendChild(card);
  root.appendChild(wrap);
}

// A failed dynamic-chunk import (stale SW after a deploy) surfaces as a window
// error / unhandled rejection — and react-router shows its own "Unexpected
// Application Error" before our React boundary can. Catch it here too and
// self-heal by clearing the SW caches and reloading.
watchSwUpdates();

window.addEventListener("error", (e) => {
  const err = e.error ?? e.message;
  if (isChunkLoadError(err)) {
    void recoverFromStaleAssets();
    return;
  }
  // A Service Worker registration/update failure is non-fatal — the app runs
  // from the precache. Never let it crash the UI into the fatal screen.
  if (isServiceWorkerError(err)) return;
  paintFatal("App failed to load", err);
});
window.addEventListener("unhandledrejection", (e) => {
  const reason = (e as PromiseRejectionEvent).reason;
  if (isChunkLoadError(reason)) {
    void recoverFromStaleAssets();
    return;
  }
  if (isServiceWorkerError(reason)) return;
  paintFatal("App failed to load", reason);
});

class RootErrorBoundary extends Component<
  { children: ReactNode },
  { error: unknown }
> {
  state: { error: unknown } = { error: null };
  static getDerivedStateFromError(error: unknown) {
    return { error };
  }
  render() {
    const { error } = this.state;
    if (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (isChunkLoadError(error)) {
        // Attempt a silent self-heal; the prompt below is the fallback if the
        // recovery is rate-limited (already tried in the last few seconds).
        void recoverFromStaleAssets();
        return (
          <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 480, margin: "4rem auto", textAlign: "center" }}>
            <h2 style={{ color: "#e53e3e", marginBottom: "0.5rem" }}>Neue Version verfügbar</h2>
            <p style={{ color: "#4a5568", marginBottom: "1.5rem" }}>
              Die App wurde aktualisiert. Bitte neu laden, um die aktuelle Version zu verwenden.
            </p>
            <button
              style={{ padding: "0.625rem 1.5rem", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}
              onClick={() => window.location.reload()}
            >
              Neu laden
            </button>
          </div>
        );
      }
      const stack = error instanceof Error ? error.stack : "";
      return (
        <div style={{ padding: "2rem", fontFamily: "monospace", maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ color: "#e53e3e" }}>Something went wrong</h2>
          <pre style={{ background: "#f7f7f7", padding: "1rem", borderRadius: 8, overflowX: "auto", fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {msg}
            {"\n\n"}
            {stack}
          </pre>
          <button
            style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>,
  );
} catch (err) {
  paintFatal("App failed to start", err);
}
