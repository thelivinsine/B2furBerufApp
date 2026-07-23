import React, { Suspense } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { RouteError } from "@/components/layout/RouteError";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { isFounder } from "@/lib/admin";
import { LandingPage } from "@/features/landing/LandingPage";
// Impressum: the ROUTE is always mounted (Steuerung guardrail: visibility
// toggles never unmount routes), but every LINK to it stays hidden behind the
// remote `impressumEnabled` flag until the founder fills the real name/address
// and enables it from /admin/steuerung (§H3). Deep-linking /impressum directly
// still resolves; it just shows the placeholder body until enabled. Lazy so it
// stays off the eager main chunk like the other legal pages.
import { Dashboard } from "@/features/dashboard/Dashboard";
import { recoverFromStaleAssets, isChunkLoadError } from "@/lib/recover";

// When a dynamic import fails (stale SW cached an old index.html that points at
// chunk hashes which no longer exist after a deploy), clear the SW caches and
// reload to pick up the fresh asset manifest. recoverFromStaleAssets() guards
// against reload loops; we re-reject so the error boundary shows if it can't.
function lazyWithReload<T extends React.ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return React.lazy(() =>
    factory().catch((err: unknown) => {
      if (isChunkLoadError(err)) void recoverFromStaleAssets();
      return Promise.reject(err) as never;
    }),
  );
}

const Onboarding = lazyWithReload(() =>
  import("@/features/onboarding/Onboarding").then((m) => ({ default: m.Onboarding })),
);
const LibraryHub = lazyWithReload(() =>
  import("@/features/library/LibraryHub").then((m) => ({ default: m.LibraryHub })),
);
const AnwendenHub = lazyWithReload(() =>
  import("@/features/anwenden/AnwendenHub").then((m) => ({ default: m.AnwendenHub })),
);
const QuizHub = lazyWithReload(() =>
  import("@/features/quiz/QuizHub").then((m) => ({ default: m.QuizHub })),
);
const WritingHub = lazyWithReload(() =>
  import("@/features/writing/WritingHub").then((m) => ({ default: m.WritingHub })),
);
const SimulationHub = lazyWithReload(() =>
  import("@/features/simulation/SimulationHub").then((m) => ({ default: m.SimulationHub })),
);
const ExamHub = lazyWithReload(() =>
  import("@/features/exam/ExamHub").then((m) => ({ default: m.ExamHub })),
);
const QuickRevision = lazyWithReload(() =>
  import("@/features/revision/QuickRevision").then((m) => ({ default: m.QuickRevision })),
);
const Session = lazyWithReload(() =>
  import("@/features/session/Session").then((m) => ({ default: m.Session })),
);
const Analytics = lazyWithReload(() =>
  import("@/features/analytics/Analytics").then((m) => ({ default: m.Analytics })),
);
// Lazy: the bag view walks the vocabulary bank for collection levels, so it
// stays off the eager path like the other content-bank consumers.
const Sammlung = lazyWithReload(() =>
  import("@/features/collection/Sammlung").then((m) => ({ default: m.Sammlung })),
);
const Settings = lazyWithReload(() =>
  import("@/features/settings/Settings").then((m) => ({ default: m.Settings })),
);
// Lazy: the Neuland game world (G1 Beta) walks the mission + vocabulary banks
// and carries its own pixel assets; strictly off the eager path.
const Welt = lazyWithReload(() =>
  import("@/features/welt/Welt").then((m) => ({ default: m.Welt })),
);
// Lazy: the Sources page pulls in the full provenance register (~800 rows), so
// keep it out of the main bundle and load it only when /sources is visited.
const Sources = lazyWithReload(() =>
  import("@/features/legal/Sources").then((m) => ({ default: m.Sources })),
);
// The founder-only review table on its own sub-page (same lazy chunk as Sources).
const SourcesWorkbench = lazyWithReload(() =>
  import("@/features/legal/Sources").then((m) => ({ default: m.SourcesWorkbench })),
);
// Lazy: the bilingual legal bodies + About are long text components that are
// rarely visited from inside the app; no reason to ship them eagerly.
const PrivacyPolicy = lazyWithReload(() =>
  import("@/features/legal/PrivacyPolicy").then((m) => ({ default: m.PrivacyPolicy })),
);
const TermsOfService = lazyWithReload(() =>
  import("@/features/legal/TermsOfService").then((m) => ({ default: m.TermsOfService })),
);
const About = lazyWithReload(() =>
  import("@/features/about/About").then((m) => ({ default: m.About })),
);
const Impressum = lazyWithReload(() =>
  import("@/features/legal/Impressum").then((m) => ({ default: m.Impressum })),
);
// Lazy: the public help/blog section (/hilfe). Off the eager path; it carries
// its own bilingual content bank and is prerendered to static HTML at build
// time (scripts/prerender-help.mjs) for SEO.
const HelpHub = lazyWithReload(() =>
  import("@/features/help/HelpHub").then((m) => ({ default: m.HelpHub })),
);
const HelpArticle = lazyWithReload(() =>
  import("@/features/help/HelpArticle").then((m) => ({ default: m.HelpArticle })),
);
// Lazy: the admin control center (founder-only). A single chunk for the whole
// /admin/* subtree — it statically imports the provenance register + generated
// verification map for the trust funnel, so it must never touch eager code.
const AdminApp = lazyWithReload(() =>
  import("@/features/admin/AdminApp").then((m) => ({ default: m.AdminApp })),
);

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const onboarded = useSettingsStore((s) => s.onboarded);
  const status = useAuthStore((s) => s.status);
  const syncHydrated = useAuthStore((s) => s.syncHydrated);
  // Already onboarded on this device → straight in.
  if (onboarded) return <>{children}</>;
  // Auth is still resolving (e.g. we just returned from a Google OAuth redirect
  // and Supabase is establishing the session). Don't decide yet, or we would
  // bounce a valid account out to the landing page.
  if (status === "loading") return null;
  // The account may have onboarded on ANOTHER device: the `onboarded` flag
  // lives in the cloud profile and only arrives via the first cloud-sync pull.
  // On a fresh device (e.g. right after reinstalling the PWA) the local flag is
  // still false, so a signed-in / guest user must wait for that pull to land
  // before we treat them as "not onboarded". Only a truly signed-out visitor,
  // or one whose cloud pull finished still-not-onboarded, goes to /welcome.
  if (status !== "signedOut" && !syncHydrated) return null;
  return <Navigate to="/welcome" replace />;
}

// Founder gate for /admin. Mirrors RequireOnboarding: while auth is still
// resolving we render nothing (avoids a redirect flash for a founder whose
// session has not loaded yet); a resolved non-founder or logged-out visitor is
// sent home. This is the CLIENT gate only — every privileged read is enforced
// server-side by the founder-email RLS/RPC, so forcing the UI reveals nothing.
function RequireFounder({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  if (status === "loading") return null;
  if (!isFounder(user)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Phase 5 hard merge: the standalone library routes now redirect into the
// unified /library hub, forwarding to the matching segment tab and preserving
// every existing query param (theme, sub, cefr, q, cat, …) so deep links and
// cross-module "Verbunden" jumps keep working.
function LibraryRedirect({ tab }: { tab: string }) {
  const { search } = useLocation();
  const p = new URLSearchParams(search);
  p.set("tab", tab);
  return <Navigate to={`/library?${p.toString()}`} replace />;
}

// Onboarding has its own Suspense boundary since it renders outside AppShell.
const OnboardingRoute = (
  <Suspense fallback={null}>
    <Onboarding />
  </Suspense>
);

// Per-route error boundary (audit D5): attached to every CHILD route inside
// the AppShell layout, so a page crash renders inside the Outlet and the
// shell (header, nav) survives. Standalone routes get it directly. Errors
// bubble to the nearest errorElement, so without the per-child placement one
// broken page would take down the whole layout.
const routeError = <RouteError />;

/** Add the shared errorElement to a route unless it defines its own. */
function withRouteError<T extends { errorElement?: React.ReactNode }>(route: T): T {
  return { errorElement: routeError, ...route };
}

export const router = createBrowserRouter([
  {
    path: "/welcome",
    element: <LandingPage />,
    errorElement: routeError,
  },
  {
    path: "/about",
    errorElement: routeError,
    element: (
      <Suspense fallback={null}>
        <About />
      </Suspense>
    ),
  },
  {
    path: "/privacy",
    errorElement: routeError,
    element: (
      <Suspense fallback={null}>
        <PrivacyPolicy />
      </Suspense>
    ),
  },
  {
    path: "/terms",
    errorElement: routeError,
    element: (
      <Suspense fallback={null}>
        <TermsOfService />
      </Suspense>
    ),
  },
  {
    path: "/sources",
    errorElement: routeError,
    element: (
      <Suspense fallback={null}>
        <Sources />
      </Suspense>
    ),
  },
  // Founder-only review table, split off /sources so that page stays short.
  {
    path: "/sources/werkbank",
    errorElement: routeError,
    element: (
      <Suspense fallback={null}>
        <RequireFounder>
          <SourcesWorkbench />
        </RequireFounder>
      </Suspense>
    ),
  },
  {
    // Always mounted so a deep link resolves; the links to it are gated on the
    // remote `impressumEnabled` flag (Steuerung §H3). Lazy so it stays off the
    // eager main chunk like the other legal pages.
    path: "/impressum",
    errorElement: routeError,
    element: (
      <Suspense fallback={null}>
        <Impressum />
      </Suspense>
    ),
  },
  // Admin control center (founder-only). Standalone like /sources: it renders
  // its own full-screen shell, outside the AppShell chrome. The /admin/* splat
  // lets the lazy AdminApp own its descendant routing in a single chunk.
  {
    path: "/admin/*",
    errorElement: routeError,
    element: (
      <Suspense fallback={null}>
        <RequireFounder>
          <AdminApp />
        </RequireFounder>
      </Suspense>
    ),
  },
  // Public help/blog section. Login-free and outside the AppShell so crawlers
  // and logged-out visitors can read it; each page is also prerendered to a
  // static HTML file at build time for SEO (scripts/prerender-help.mjs).
  {
    path: "/hilfe",
    errorElement: routeError,
    element: (
      <Suspense fallback={null}>
        <HelpHub />
      </Suspense>
    ),
  },
  {
    path: "/hilfe/:slug",
    errorElement: routeError,
    element: (
      <Suspense fallback={null}>
        <HelpArticle />
      </Suspense>
    ),
  },
  // Impressum route temporarily disabled (see import note above). /impressum
  // falls through to the catch-all redirect until re-enabled.
  {
    path: "/start",
    element: OnboardingRoute,
    errorElement: routeError,
  },
  {
    element: <AppShell />,
    errorElement: routeError,
    children: ([
      {
        path: "/",
        element: (
          <RequireOnboarding>
            <Dashboard />
          </RequireOnboarding>
        ),
      },
      {
        path: "/library",
        element: (
          <RequireOnboarding>
            <LibraryHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/anwenden",
        element: (
          <RequireOnboarding>
            <AnwendenHub />
          </RequireOnboarding>
        ),
      },
      // Old library routes → unified /library hub (params preserved).
      { path: "/vocabulary", element: <LibraryRedirect tab="woerter" /> },
      { path: "/collocations", element: <LibraryRedirect tab="kollokationen" /> },
      { path: "/redemittel", element: <LibraryRedirect tab="redemittel" /> },
      { path: "/grammar", element: <LibraryRedirect tab="grammatik" /> },
      {
        path: "/quiz",
        element: (
          <RequireOnboarding>
            <QuizHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/writing",
        element: (
          <RequireOnboarding>
            <WritingHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/simulation",
        element: (
          <RequireOnboarding>
            <SimulationHub />
          </RequireOnboarding>
        ),
      },
      {
        path: "/exam",
        element: (
          <RequireOnboarding>
            <ExamHub />
          </RequireOnboarding>
        ),
      },
      {
        // The Neuland game world (G1, Beta): off the nav, reached via the
        // Anwenden hub card and the /welt deep link (same pattern as /quiz).
        path: "/welt",
        element: (
          <RequireOnboarding>
            <Welt />
          </RequireOnboarding>
        ),
      },
      {
        path: "/session",
        element: (
          <RequireOnboarding>
            <Session />
          </RequireOnboarding>
        ),
      },
      {
        path: "/revision",
        element: (
          <RequireOnboarding>
            <QuickRevision />
          </RequireOnboarding>
        ),
      },
      {
        path: "/analytics",
        element: (
          <RequireOnboarding>
            <Analytics />
          </RequireOnboarding>
        ),
      },
      {
        // Off the nav ("deep link only", like /quiz): reached from the
        // Fortschritt quest board's "Meine Sammlung" entry card.
        path: "/sammlung",
        element: (
          <RequireOnboarding>
            <Sammlung />
          </RequireOnboarding>
        ),
      },
      {
        path: "/settings",
        element: (
          <RequireOnboarding>
            <Settings />
          </RequireOnboarding>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ] as RouteObject[]).map(withRouteError),
  },
]);
