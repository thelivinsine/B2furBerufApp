import { Component, StrictMode } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
