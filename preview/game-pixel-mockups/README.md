# Anmeldung mission: pixel-art direction mockups (pre-G1)

Three mockup scenes of the Anmeldung vertical slice (`docs/strategy/GAME_CONCEPT.md`) in the
proposed retro GBA-era pixel style, produced for the founder's art blessing per
`docs/plans/GAME_IMPLEMENTATION_PLAN.md` (pre-G1 row of the task map). **Mockups only. No game
code, no purchases.**

## The scenes

- `scene1-termin.png` — Scene 1, the parody Termin booking website ("Nächster freier Termin:
  IN 8 WOCHEN") with the wait-vs-6-Uhr choice in the dialogue box.
- `scene2-wartezimmer.png` — Scene 3, the Bürgeramt waiting room: number board (Aufruf 087,
  your ticket 112), seated NPCs, ambient listening hook.
- `scene3-frau-schmidt.png` — Scene 4, the boss dialogue battle: Frau Schmidt with a GEDULD
  bar, the player with a MUT bar, Redemittel moves (Konjunktiv II crits).

Three additional takes on the Frau Schmidt boss (founder request, same session), each testing a
different beat of the battle (`scenes2.py`):

- `scene4-schalter-closeup.png` — close-up confrontation at the Schalter: a large 2x Frau
  Schmidt bust looming behind the glass, your documents on the counter with the missing
  Wohnungsgeberbestätigung as a red dashed slot.
- `scene5-kritischer-treffer.png` — the crit moment: Konjunktiv II lands, gold KRITISCH!
  banner, -18 GEDULD, her bar in the red.
- `scene6-sieg-meldebestaetigung.png` — the victory screen: dither-dimmed room, gold-bordered
  Schlüssel-Item card for the Meldebestätigung (+120 XP) and the chapter-3 bank hook. This is
  the one place the app's reserved reward-gold token family is used, matching the loot-only
  gold rule.

Every scene carries the D/E chips (German explanation / English translation) and the brand
indigo `#5b5be6` in the dialogue chrome.

## Modern restyle (founder feedback: GBA palette read as 90s)

The founder judged scenes 1–6 honest to the art form but dated in color and element design.
`scenes3.py` restyles the same battle picture in a contemporary indie-pixel direction (the
LimeZu / Eastward register the plan references) while keeping the 2D pixel form:

- `scene7-modern-hell.png` — light theme: muted warm palette, wood floor + plants + modern
  Bürgeramt furniture, soft colored outlines instead of black, floating rounded UI cards with
  soft shadows, thin rounded progress bars, pill buttons, sentence case, bottom sheet with grab
  handle (mirrors the app's own UI language).
- `scene8-modern-dunkel.png` — the same scene in dark mode at dusk: night window, dithered
  lamp-pool lighting, dark UI surfaces.

Technique note: the world stays chunky (240x160) while the UI layer is drawn at 480x320
(half-size pixels), the crisp-UI-over-pixel-world convention of modern pixel games.

## Format and provenance (zero spend)

- Native resolution 240x160 (authentic GBA), upscaled 4x nearest-neighbor to 960x640.
- **All art is original, authored in code for this repo** (`scenes.py` composes the scenes;
  `pixfont.py` is a hand-drawn bitmap pixel font with umlauts and ß). No third-party assets
  were used or purchased: the planned free sources (kenney.nl, OpenGameArt, itch.io) are
  blocked by the sandbox network policy, so the mockups were hand-pixelled instead, imitating
  the Kenney / LimeZu modern-city reference style named in the implementation plan. Nothing
  here needs a license row beyond "authored".
- Regenerate with `python3 scenes.py` and `python3 scenes2.py` (needs Pillow; writes to `out/`).

These images are direction mockups, not shipping assets. If the direction is blessed, G2 buys
or sources the real packs per the plan's tooling table.
