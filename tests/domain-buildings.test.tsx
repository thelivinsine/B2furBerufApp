import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import {
  DOMAIN_BUILDINGS,
  DomainBuildingIcon,
  domainBuildingById,
} from "@/components/city/domain-buildings";

afterEach(cleanup);

const REWARD = "hsl(var(--reward))";

describe("domain-buildings registry", () => {
  it("has exactly the six city buildings with unique ids and base colors", () => {
    expect(DOMAIN_BUILDINGS.map(b => b.id)).toEqual([
      "buero",
      "buergeramt",
      "bank",
      "arztpraxis",
      "wohnhaus",
      "pruefungshalle",
    ]);
    const colors = new Set(DOMAIN_BUILDINGS.map(b => b.color));
    expect(colors.size).toBe(DOMAIN_BUILDINGS.length);
  });

  it("keeps every mastery source unambiguous (no domain or theme lights two buildings)", () => {
    const domains = DOMAIN_BUILDINGS.flatMap(b => b.domains);
    const themes = DOMAIN_BUILDINGS.flatMap(b => b.themeIds);
    expect(new Set(domains).size).toBe(domains.length);
    expect(new Set(themes).size).toBe(themes.length);
  });
});

describe("DomainBuildingIcon", () => {
  it("renders every building on the shared 20-unit grid", () => {
    for (const b of DOMAIN_BUILDINGS) {
      const { container, unmount } = render(<DomainBuildingIcon id={b.id} />);
      const svg = container.querySelector("svg");
      expect(svg?.getAttribute("viewBox")).toBe("0 0 20 20");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
      unmount();
    }
  });

  it("uses reward gold only in the lit state", () => {
    for (const b of DOMAIN_BUILDINGS) {
      const unlit = render(<DomainBuildingIcon id={b.id} />);
      expect(unlit.container.innerHTML).not.toContain(REWARD);
      unlit.unmount();

      const lit = render(<DomainBuildingIcon id={b.id} lit />);
      expect(lit.container.innerHTML).toContain(REWARD);
      lit.unmount();
    }
  });

  it("looks up buildings by id", () => {
    expect(domainBuildingById("arztpraxis").label).toBe("Arztpraxis");
  });
});
