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

Every scene carries the D/E chips (German explanation / English translation) and the brand
indigo `#5b5be6` in the dialogue chrome.

## Format and provenance (zero spend)

- Native resolution 240x160 (authentic GBA), upscaled 4x nearest-neighbor to 960x640.
- **All art is original, authored in code for this repo** (`scenes.py` composes the scenes;
  `pixfont.py` is a hand-drawn bitmap pixel font with umlauts and ß). No third-party assets
  were used or purchased: the planned free sources (kenney.nl, OpenGameArt, itch.io) are
  blocked by the sandbox network policy, so the mockups were hand-pixelled instead, imitating
  the Kenney / LimeZu modern-city reference style named in the implementation plan. Nothing
  here needs a license row beyond "authored".
- Regenerate with `python3 scenes.py` (needs Pillow; writes to `out/`).

These images are direction mockups, not shipping assets. If the direction is blessed, G2 buys
or sources the real packs per the plan's tooling table.
