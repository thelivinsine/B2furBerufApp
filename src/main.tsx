import { Component, StrictMode } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { recoverFromStaleAssets, isChunkLoadError } from "./lib/recover";
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
 * the user often can't reach (e.g. mobile). This paints the error straight into
 * #root via the DOM so a crash is always visible. Keep it as a permanent net.
 */
function paintFatal(label: string, detail: unknown): void {
  const root = document.getElementById("root");
  if (!root || root.dataset.fatal === "1") return;
  root.dataset.fatal = "1";
  const msg = detail instanceof Error ? detail.message : String(detail);
  const stack = detail instanceof Error ? detail.stack ?? "" : "";
  root.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.setAttribute(
    "style",
    "padding:2rem;font-family:monospace;max-width:640px;margin:0 auto;color:#e2e8f0",
  );
  const h = document.createElement("h2");
  h.setAttribute("style", "color:#f87171");
  h.textContent = label;
  const pre = document.createElement("pre");
  pre.setAttribute(
    "style",
    "background:#1e293b;padding:1rem;border-radius:8px;overflow-x:auto;font-size:13px;white-space:pre-wrap;word-break:break-word",
  );
  pre.textContent = `${msg}\n\n${stack}`;
  wrap.append(h, pre);
  root.appendChild(wrap);
}

// A failed dynamic-chunk import (stale SW after a deploy) surfaces as a window
// error / unhandled rejection — and react-router shows its own "Unexpected
// Application Error" before our React boundary can. Catch it here too and
// self-heal by clearing the SW caches and reloading.
window.addEventListener("error", (e) => {
  if (isChunkLoadError(e.error ?? e.message)) {
    void recoverFromStaleAssets();
    return;
  }
  paintFatal("App failed to load", e.error ?? e.message);
});
window.addEventListener("unhandledrejection", (e) => {
  const reason = (e as PromiseRejectionEvent).reason;
  if (isChunkLoadError(reason)) {
    void recoverFromStaleAssets();
    return;
  }
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
