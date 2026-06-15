import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems, DEFAULT_PINNED_TABS } from "./nav-items";
import { useSettingsStore } from "@/store/useSettingsStore";

const MORE_COLOR = "#5b5be6";
const MORE_BG    = "rgba(91,91,230,.08)";

// Icon glyph size. Bumped ~20% (was 24) for clearer, more legible icons.
const IZ = 29;

// ── Context strip metadata for any path ───────────────────────
function getContextMeta(pathname: string, pinnedTabs: string[]) {
  // Exact match among pinned tabs first
  const exact = navItems.find(i => i.to === pathname);
  if (exact) return { label: exact.label, color: exact.color, bg: exact.bg };
  // Prefix match for nested routes
  const prefix = navItems.find(i => i.to !== "/" && pathname.startsWith(i.to));
  if (prefix) return { label: prefix.label, color: prefix.color, bg: prefix.bg };
  // "Mehr" fallback when on a secondary page opened from the drawer
  const mehr = navItems.find(i => pinnedTabs.includes(i.to) === false && pathname.startsWith(i.to));
  return { label: mehr?.label ?? "Mehr", color: MORE_COLOR, bg: MORE_BG };
}

// ── Custom SVG icons for the 4 original primary tabs ──────────
// (24px canvas, ~20% larger than the old h-5 w-5 for Duolingo-style readability)

function IcoDashboard({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      <rect x="2"  y="2"  width="7" height="7" rx="1.5" fill="#5b5be6" />
      <rect x="11" y="2"  width="7" height="7" rx="1.5" fill="#5b5be6" opacity=".72" />
      <rect x="2"  y="11" width="7" height="7" rx="1.5" fill="#5b5be6" opacity=".72" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#5b5be6" opacity=".45" />
    </svg>
  );
}

function IcoBook({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      {/* Pages expanded to fill the viewBox — from y≈2.5 to y≈17.5, x=2→18 */}
      <path d="M10 2.5C7.5 1.5 4.5 1.5 2 2.5V17.5c2.5-1 5.5-1 8 0V2.5Z"
        fill="#5b5be6" />
      <path d="M10 2.5c2.5-1 5.5-1 8 0V17.5c-2.5-1-5.5-1-8 0V2.5Z"
        fill="#10b7cf" />
      {active && (
        <>
          <line x1="4.5"  y1="7"   x2="8.5"  y2="7"   stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.7} />
          <line x1="4.5"  y1="10"  x2="8.5"  y2="10"  stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.5} />
          <line x1="4.5"  y1="13"  x2="8.5"  y2="13"  stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.35} />
          <line x1="11.5" y1="7"   x2="15.5" y2="7"   stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.5} />
          <line x1="11.5" y1="10"  x2="15.5" y2="10"  stroke="white" strokeWidth="1" strokeLinecap="round" opacity={.35} />
        </>
      )}
    </svg>
  );
}

function IcoQuiz({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      {/* r=9 fills the viewBox like the dashboard squares do */}
      <circle cx="10" cy="10" r="9" fill="#f59e0b" />
      <polyline
        points="6,10.5 8.5,13 14,7"
        stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

function IcoAnalytics({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      <rect x="2.5"  y="12"  width="3.5" height="6"    rx="1.2" fill="#10b7cf" />
      <rect x="8.25" y="7.5" width="3.5" height="10.5" rx="1.2" fill="#10b7cf" opacity=".8" />
      <rect x="14"   y="3"   width="3.5" height="15"   rx="1.2" fill="#10b7cf" opacity=".55" />
    </svg>
  );
}

function IcoMore({ active }: { active: boolean }) {
  return (
    <svg width={IZ} height={IZ} viewBox="0 0 20 20" fill="none" aria-hidden="true" opacity={active ? 1 : 0.38}>
      <circle cx="5.5"  cy="5.5"  r="1.9" fill="#5b5be6" opacity=".9"  />
      <circle cx="10"   cy="5.5"  r="1.9" fill="#5b5be6" opacity=".7"  />
      <circle cx="14.5" cy="5.5"  r="1.9" fill="#5b5be6" opacity=".5"  />
      <circle cx="5.5"  cy="10"   r="1.9" fill="#5b5be6" opacity=".7"  />
      <circle cx="10"   cy="10"   r="1.9" fill="#5b5be6" opacity=".5"  />
      <circle cx="14.5" cy="10"   r="1.9" fill="#5b5be6" opacity=".35" />
      <circle cx="5.5"  cy="14.5" r="1.9" fill="#5b5be6" opacity=".45" />
      <circle cx="10"   cy="14.5" r="1.9" fill="#5b5be6" opacity=".3"  />
      <circle cx="14.5" cy="14.5" r="1.9" fill="#5b5be6" opacity=".2"  />
    </svg>
  );
}

// Tabs with a hand-crafted SVG icon — others fall back to the lucide icon.
const CUSTOM_ICON: Record<string, (active: boolean) => React.ReactNode> = {
  "/":           a => <IcoDashboard active={a} />,
  "/vocabulary": a => <IcoBook      active={a} />,
  "/quiz":       a => <IcoQuiz      active={a} />,
  "/analytics":  a => <IcoAnalytics active={a} />,
};

function TabIcon({ path, active, color }: { path: string; active: boolean; color: string }) {
  if (path in CUSTOM_ICON) return <>{CUSTOM_ICON[path](active)}</>;
  const item = navItems.find(i => i.to === path);
  if (!item) return null;
  const Icon = item.icon;
  return (
    <Icon
      className="transition-opacity"
      style={{ color, opacity: active ? 1 : 0.38, width: IZ, height: IZ }}
    />
  );
}

// ── Component ──────────────────────────────────────────────────
interface Props {
  onMore: () => void;
}

export function BottomTabBar({ onMore }: Props) {
  const location    = useLocation();
  const pathname    = location.pathname;
  // Guard against an older persisted settings object that predates pinnedTabs.
  const pinnedRaw   = useSettingsStore(s => s.pinnedTabs);
  const pinnedTabs  = pinnedRaw && pinnedRaw.length > 0 ? pinnedRaw : DEFAULT_PINNED_TABS;
  const moreActive  = !pinnedTabs.includes(pathname);
  const ctx         = getContextMeta(pathname, pinnedTabs);

  // Resolve the pinned tabs in navItems order, with their metadata
  const tabs = navItems.filter(i => pinnedTabs.includes(i.to));

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex flex-col border-t border-border bg-surface/95 backdrop-blur-xl pb-safe lg:hidden"
      // iOS Safari drops the compositing layer of a position:fixed element that
      // uses backdrop-filter when a sibling has a 3D transform (the flashcard's
      // perspective/preserve-3d), making this bar flicker or vanish on scroll.
      // Pinning it to its own GPU layer keeps it painted and stable. The high
      // bg opacity is a fallback so the bar is solid even if the blur drops.
      style={{ transform: "translateZ(0)", willChange: "transform" }}
    >

      {/* ── Context strip (name bar) ── */}
      <div
        className="flex items-center gap-2 px-4 py-[7px]"
        style={{ background: ctx.bg, borderBottom: "1px solid rgba(0,0,0,.05)" }}
      >
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: ctx.color }}
        />
        <span
          className="text-[13px] font-semibold leading-snug tracking-[0.01em]"
          style={{ color: ctx.color }}
        >
          {ctx.label}
        </span>
      </div>

      {/* ── Icon rail — no text labels ── */}
      <div className="flex h-[62px] items-stretch">

        {tabs.map(({ to, end, label, color, bg }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className="flex flex-1 p-1"
          >
            {({ isActive }) => (
              <div
                className={cn(
                  "relative flex flex-1 items-center justify-center rounded-xl transition-colors duration-150",
                )}
                style={isActive ? { background: bg } : {}}
              >
                <TabIcon path={to} active={isActive} color={color} />
                {isActive && (
                  <span
                    className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-6 rounded-full"
                    style={{ height: 3, background: color }}
                  />
                )}
              </div>
            )}
          </NavLink>
        ))}

        {/* Mehr — always shown as the last item */}
        <button
          onClick={onMore}
          aria-label="Mehr"
          className="flex flex-1 p-1"
        >
          <div
            className="relative flex flex-1 items-center justify-center rounded-xl transition-colors duration-150"
            style={moreActive ? { background: MORE_BG } : {}}
          >
            <IcoMore active={moreActive} />
            {moreActive && (
              <span
                className="absolute bottom-[8px] left-1/2 -translate-x-1/2 w-6 rounded-full"
                style={{ height: 3, background: MORE_COLOR }}
              />
            )}
          </div>
        </button>

      </div>
    </nav>
  );
}
