# Heute redesign previews (session 86, 2026-07-10)

Standalone HTML previews from the session-86 Heute redesign. Open any file in a
browser to view; they use system fonts and the app's real dark palette. These are
the **design contracts** the founder reviewed before the work shipped to `main`.

| File | What it is |
| --- | --- |
| `heute-option-b.html` | The header + bottom-bar cleanup and the "Option B" Heute mockup (before the Üben tab became the Neuland map). Header slimmed to logo · streak · account; bottom bar Mehr → Einstellungen. |
| `uben-concepts.html` | Three concepts for reimagining the **Üben** tab as a learning path: **A** Lernpfad (winding path), **B** Kapitel-Roadmap (chapter cards), **C** Neuland-Karte (pixel city map). Founder chose **C**. |
| `neuland-map-concept-c.html` | Concept C iterated: the bird's-eye **pixel Neuland city map** (street grid, buildings, route, "Du bist hier"), with the "Als Nächstes" tile. |
| `uben-tab-final.html` | The **final polished full Üben tab** (header, toggle, simplified map, stepper legend, action tile, bottom nav). This is what shipped, rendered at phone width. Matches `src/features/dashboard/UebenPath.tsx`. |

The pixel map is drawn to a low-res `<canvas>` and upscaled crisp (`image-rendering: pixelated`),
the same technique as the shipped component. The map iteration harnesses (used with
headless Chromium to catch a banner-collision bug and tune sizing) were scratch and are
not committed.

See `docs/DECISIONS.md` ("Heute Üben tab → Neuland city-map path") and the session-86
handoff in `docs/PROJECT_STATUS.md` for the rationale.
