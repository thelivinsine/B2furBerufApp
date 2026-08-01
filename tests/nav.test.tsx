import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { navItems, DEFAULT_PINNED_TABS, ROUTE_SUCCESSOR } from "@/components/layout/nav-items";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { useSettingsStore } from "@/store/useSettingsStore";

afterEach(cleanup);

/**
 * The nav after s182 (founder: "just move schreiben to anwenden and rename
 * anwenden as prufung").
 *
 * The bar is FIVE slots and stays five: Praktisch · Bibliothek · Prüfung ·
 * Fortschritt · Einstellungen. Schreiben is a card inside the Prüfung hub, not
 * a tab, and `/writing` keeps its route so every deep link and every resumed
 * draft still resolves.
 */
const barPaths = () =>
  Array.from(document.querySelectorAll("nav a")).map((a) => a.getAttribute("href"));

describe("bottom tab bar: five slots, in order", () => {
  it("renders exactly five tabs in the locked order", () => {
    useSettingsStore.getState().resetSettings();
    render(
      <MemoryRouter initialEntries={["/"]}>
        <BottomTabBar />
      </MemoryRouter>,
    );
    expect(barPaths()).toEqual(["/", "/library", "/anwenden", "/analytics", "/settings"]);
  });

  it("an order persisted while Schreiben was a tab still yields five slots", () => {
    // A learner who pinned the 2026-07-22 layout has "/writing" in their store.
    useSettingsStore.getState().setPinnedTabs(["/", "/writing", "/library", "/analytics"]);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <BottomTabBar />
      </MemoryRouter>,
    );
    const paths = barPaths();
    expect(paths).toHaveLength(5);
    expect(paths).not.toContain("/writing");
    expect(paths).toContain("/anwenden");
    useSettingsStore.getState().resetSettings();
  });
});

describe("nav registry", () => {
  it("Schreiben is not a top-level entry, and Prüfung is", () => {
    expect(navItems.map((i) => i.to)).not.toContain("/writing");
    const pruefung = navItems.find((i) => i.to === "/anwenden");
    expect(pruefung?.label).toBe("Prüfung");
  });

  it("a pinned /writing remaps to the hub that now holds it", () => {
    expect(ROUTE_SUCCESSOR["/writing"]).toBe("/anwenden");
  });

  it("every default pin is a real nav entry", () => {
    for (const path of DEFAULT_PINNED_TABS)
      expect(navItems.some((i) => i.to === path), path).toBe(true);
  });
});
