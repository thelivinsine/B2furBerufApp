/**
 * Preview harness for the sign-up / log-in dialog (s174 rework).
 *
 * Mounts the REAL `AuthDialog`, not a redrawn copy, so the sheet cannot flatter
 * the implementation: what renders here is what ships. Run with
 * `pnpm dev` and open http://localhost:5173/preview/auth-dialog.html
 *
 * Only the resting sign-up state is mountable from outside (the "check your
 * inbox" and "already registered" panels are internal state reached by
 * submitting). Those two are pinned by `tests/authDialog.test.tsx` instead.
 */
import { createRoot } from "react-dom/client";
import { AuthDialog } from "@/features/auth/AuthDialog";
import "@fontsource-variable/inter";
import "../src/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthDialog open onOpenChange={() => {}} intent="signup" />,
);
