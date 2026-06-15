import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import { useSettingsStore } from "@/store/useSettingsStore";

const MORE_COLOR = "#5b5be6";
const MORE_BG    = "rgba(91,91,230,.08)";

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
  const c = active ? "#5b5be6" : "#c2c4d6";
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2"  y="2"  width="7" height="7" rx="1.5" fill={c} />
      <rect x="11" y="2"  width="7" height="7" rx="1.5" fill={c} opacity={active ? .72 : .8} />
      <rect x="2"  y="11" width="7" height="7" rx="1.5" fill={c} opacity={active ? .72 : .7} />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill={c} opacity={active ? .45 : .5} />
    </svg>
  );
}

function IcoBook({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4C8 3.2 5.5 3.2 3.5 4V16c2-.8 4.5-.8 6.5 0V4Z"
        fill={active ? "#5b5be6" : "#c2c4d6"} />
      <path d="M10 4c2-.8 4.5-.8 6.5 0V16c-2-.8-4.5-.8-6.5 0V4Z"
        fill={active ? "#10b7cf" : "#c2c4d6"} opacity={active ? 1 : .7} />
      {active && (
        <>
          <line x1="5"    y1="7.5" x2="8.5" y2="7.5" stroke="white" strokeWidth=".9" strokeLinecap="round" opacity={.7} />
          <line x1="5"    y1="10"  x2="8.5" y2="10"  stroke="white" strokeWidth=".9" strokeLinecap="round" opacity={.5} />
          <line x1="11.5" y1="7.5" x2="15"  y2="7.5" stroke="white" strokeWidth=".9" strokeLinecap="round" opacity={.5} />
          <line x1="11.5" y1="10"  x2="15"  y2="10"  stroke="white" strokeWidth=".9" strokeLinecap="round" opacity={.35} />
        </>
      )}
    </svg>
  );
}

function IcoQuiz({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill={active ? "#f59e0b" : "#c2c4d6"} />
      <polyline
        points="6.5,10 9,12.5 13.5,7.5"
        stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

function IcoAnalytics({ active }: { active: boolean }) {
  const c = active ? "#10b7cf" : "#c2c4d6";
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5"  y="12"  width="3.5" height="6"    rx="1.2" fill={c} />
      <rect x="8.25" y="7.5" width="3.5" height="10.5" rx="1.2" fill={c} opacity={.8} />
      <rect x="14"   y="3"   width="3.5" height="15"   rx="1.2" fill={c} opacity={.55} />
    </svg>
  );
}

function IcoMore({ active }: { active: boolean }) {
  const c = active ? "#5b5be6" : "#c2c4d6";
  return (
    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="5.5"  cy="5.5"  r="1.9" fill={c} opacity={active ? .9  : .8}  />
      <circle cx="10"   cy="5.5"  r="1.9" fill={c} opacity={active ? .7  : .6}  />
      <circle cx="14.5" cy="5.5"  r="1.9" fill={c} opacity={active ? .5  : .45} />
      <circle cx="5.5"  cy="10"   r="1.9" fill={c} opacity={active ? .7  : .6}  />
      <circle cx="10"   cy="10"   r="1.9" fill={c} opacity={active ? .5  : .45} />
      <circle cx="14.5" cy="10"   r="1.9" fill={c} opacity={active ? .35 : .3}  />
      <circle cx="5.5"  cy="14.5" r="1.9" fill={c} opacity={active ? .45 : .4}  />
      <circle cx="10"   cy="14.5" r="1.9" fill={c} opacity={active ? .3  : .25} />
      <circle cx="14.5" cy="14.5" r="1.9" fill={c} opacity={active ? .2  : .18} />
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
      className="h-6 w-6 transition-colors"
      style={{ color: active ? color : "#c2c4d6" }}
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
  const pinnedTabs  = useSettingsStore(s => s.pinnedTabs);
  const moreActive  = !pinnedTabs.includes(pathname);
  const ctx         = getContextMeta(pathname, pinnedTabs);

  // Resolve the pinned tabs in navItems order, with their metadata
  const tabs = navItems.filter(i => pinnedTabs.includes(i.to));

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex flex-col border-t border-border bg-surface/80 backdrop-blur-xl pb-safe lg:hidden">

      {/* ── Context strip ── */}
      <div
        className="flex items-center px-4 py-1"
        style={{ background: ctx.bg, borderBottom: "1px solid rgba(0,0,0,.05)" }}
      >
        <span
          className="text-[11px] font-extrabold tracking-wide leading-none"
          style={{ color: ctx.color }}
        >
          {ctx.label}
        </span>
      </div>

      {/* ── Icon rail — no text labels ── */}
      <div className="flex h-[52px] items-stretch">

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
                    className="absolute bottom-[7px] left-1/2 -translate-x-1/2 w-5 rounded-full"
                    style={{ height: 2.5, background: color }}
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
                className="absolute bottom-[7px] left-1/2 -translate-x-1/2 w-5 rounded-full"
                style={{ height: 2.5, background: MORE_COLOR }}
              />
            )}
          </div>
        </button>

      </div>
    </nav>
  );
}
