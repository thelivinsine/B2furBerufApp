# Frau Schmidt boss scene variants (B: counter close-up, C: crit moment, D: victory loot)
from PIL import Image, ImageDraw
import pixfont as pf
from scenes import (W, H, INK, WHITE, CREAM, CREAM_D, GREY, GREY_L, INDIGO,
                    INDIGO_D, INDIGO_L, TEAL, RED, RED_D, YELLOW, GREEN, AMBER,
                    SKIN, SKIN_D, canvas, rect, frame, hline, text, text_scaled,
                    dlgbox, chip, de_chips, sprite, upscale_save,
                    PLAYER_BACK, PLAYER_CMAP, SCHMIDT, SCHMIDT_CMAP)

GOLD    = (212, 164, 44)
GOLD_L  = (244, 212, 104)
GOLD_D  = (150, 112, 28)

def sprite_scaled(img, x, y, rows, cmap, s=2):
    for ry, row in enumerate(rows):
        for rx, ch in enumerate(row):
            c = cmap.get(ch)
            if c is not None:
                rect(img, x + rx * s, y + ry * s, s, s, c)

# ---------- big Frau Schmidt bust (44x42, mirror-built) ----------
HALF = [
    "..............kkkkkkkk",  # 0  bun
    "............kkhhhhhhhh",  # 1
    "...........khhhhHhhhhh",  # 2
    "..........khhHhhhhhhhh",  # 3
    "..........khhhhhhhhhhh",  # 4
    "..........khhhhhhhhhhh",  # 5
    "...........khhhhhhhhhh",  # 6
    ".........kkhhhhhhhhhhh",  # 7  head top
    ".......kkhhhhhhhhhhhhh",  # 8
    "......khhhhhhhhhhhhhhh",  # 9
    ".....khhhhhhhhhhhhhhhh",  # 10
    "....khhhhhhhhhhhhhhhhh",  # 11
    "....khhhhhssssssssssss",  # 12 forehead
    "...khhhhhsssssssssssss",  # 13
    "...khhhhssssssssssssss",  # 14
    "...khhhsssssssssssssss",  # 15
    "...khhsssskkkkkkksssss",  # 16 stern brow
    "...khhssgggggggggsssss",  # 17 glasses top rim
    "...khhssgwwwwwwwgssggg",  # 18 lens + bridge
    "...khhssgwwkkwwwgsssss",  # 19 pupil
    "...khhssgwwwwwwwgsssss",  # 20
    "...khhssgggggggggsssss",  # 21 glasses bottom rim
    "...khhssssssssssssssss",  # 22 cheek
    "...khhssssssssssssssss",  # 23
    "...khhsssssssssssssssS",  # 24 nose shade
    "...khhsssssssssssssssS",  # 25
    "....khhssssssssssssSSS",  # 26
    "....khhssssssssssssrrr",  # 27 frown
    "....khhsssssssssssssss",  # 28 chin
    ".....khhssssssssssssss",  # 29
    "......khhsssssssssssss",  # 30
    ".......khhhsssssssssss",  # 31
    "........kkhhssssssssss",  # 32
    "..........kkssssssssss",  # 33 neck
    "..........kkSSSSSSSSSS",  # 34
    "........kkwwwwwwwwwwww",  # 35 blouse collar
    "....kkkttttwwwwwwwwwww",  # 36 cardigan shoulders
    "..ktttttttttttwwwwwwww",  # 37
    ".kttttttttttttttwwwwww",  # 38
    "kttttttttttttttttwwwww",  # 39
    "kttttttttttttttttttwww",  # 40
    "kttttttttttttttttttttw",  # 41
]
for i, r in enumerate(HALF):
    assert len(r) == 22, (i, len(r))
SCHMIDT_BIG = [r + r[::-1] for r in HALF]
SCHMIDT_BIG_CMAP = {'k': INK, 'h': (176, 176, 186), 'H': (146, 146, 158),
                    's': SKIN, 'S': SKIN_D, 'w': WHITE, 'g': (60, 60, 78),
                    't': TEAL, 'r': (150, 82, 76)}

SPARKLE = ["..y..", "..y..", "yywyy", "..y..", "..y.."]
SPARKLE_CMAP = {'y': YELLOW, 'w': WHITE}

def enemy_box(img, pct):
    rect(img, 6, 8, 108, 30, CREAM)
    frame(img, 6, 8, 108, 30, INK)
    text(img, 11, 10, "FRAU SCHMIDT", INK)
    text(img, 86, 10, "B2", INDIGO_D)
    text(img, 11, 21, "GEDULD", (140, 120, 60))
    rect(img, 45, 24, 62, 5, INK)
    rect(img, 46, 25, 60, 3, (70, 70, 80))
    fill = max(1, int(60 * pct))
    rect(img, 46, 25, fill, 3, YELLOW if pct > 0.2 else RED)

# =====================================================================
# Variant B — Am Schalter (close-up confrontation)
# =====================================================================
def scene_schalter():
    img = canvas((198, 208, 218))
    for yy in range(6, 96, 10):
        hline(img, 0, yy, W, (188, 198, 209))
    # hanging sign (right of Frau Schmidt so she can't loom over it)
    rect(img, 156, 8, 64, 16, (30, 34, 52))
    frame(img, 156, 8, 64, 16, INK)
    rect(img, 166, 0, 2, 8, INK)
    rect(img, 206, 0, 2, 8, INK)
    text(img, 162, 11, "SCHALTER 3", WHITE)

    # glass divider posts + glare
    rect(img, 8, 22, 5, 82, (168, 178, 190))
    frame(img, 8, 22, 5, 82, INK)
    rect(img, 227, 22, 5, 82, (168, 178, 190))
    frame(img, 227, 22, 5, 82, INK)
    for gx0 in (40, 52, 168, 180):
        for i in range(26):
            x = gx0 + i
            y = 30 + i
            if y < 96 and img.getpixel((x, y)) not in (INK,):
                img.putpixel((x, y), (222, 230, 238))

    # Frau Schmidt looming behind the glass (2x bust)
    sprite_scaled(img, 76, 12, SCHMIDT_BIG, SCHMIDT_BIG_CMAP, 2)

    # speech holes in the glass
    for hy in (78, 84):
        for hx in range(196, 221, 6):
            rect(img, hx, hy, 2, 2, (150, 160, 172))

    # counter
    rect(img, 0, 96, W, 6, (216, 200, 168))
    hline(img, 0, 96, W, (240, 228, 204))
    rect(img, 0, 102, W, 14, (176, 142, 96))
    hline(img, 0, 102, W, (120, 92, 58))

    # documents on the counter: Ausweis, Mietvertrag, missing slot
    rect(img, 18, 88, 30, 19, (168, 196, 214))          # Personalausweis
    frame(img, 18, 88, 30, 19, INK)
    rect(img, 21, 91, 9, 10, (216, 228, 238))
    frame(img, 21, 91, 9, 10, (110, 130, 150))
    sprite(img, 23, 93, ["kk", "kk", "ss"], {'k': (90, 110, 130), 's': (90, 110, 130)})
    for ly in (92, 95, 98):
        hline(img, 33, ly, 12, (110, 130, 150))
    text(img, 20, 106, "Ausweis", (86, 62, 34))

    rect(img, 62, 86, 26, 21, WHITE)                     # Mietvertrag
    frame(img, 62, 86, 26, 21, INK)
    for ly in (90, 93, 96, 99, 102):
        hline(img, 65, ly, 20, GREY_L)
    rect(img, 78, 98, 7, 6, (200, 60, 60))
    text(img, 60, 106, "Vertrag", (86, 62, 34))

    d = ImageDraw.Draw(img)                              # missing doc slot
    for i in range(0, 30, 4):
        hline(img, 104 + i, 86, 2, RED)
        hline(img, 104 + i, 106, 2, RED)
    for i in range(0, 21, 4):
        rect(img, 104, 86 + i, 1, 2, RED)
        rect(img, 133, 86 + i, 1, 2, RED)
    text(img, 115, 90, "?", RED)
    text(img, 103, 106, "???", RED_D)

    enemy_box(img, 0.55)

    # dialogue box
    dlgbox(img, 0, 116, W, 44)
    de_chips(img, 214, 120)
    text(img, 8, 118, '"Die Wohnungsgeberbestätigung fehlt.', INK)
    text(img, 8, 128, 'So kann ich Sie nicht anmelden."', INK)
    text(img, 12, 139, "▶ Höflich nachfragen (Konjunktiv II)", INDIGO_D)
    text(img, 12, 149, "  Tasche durchsuchen", GREY)
    return img

# =====================================================================
# Variant C — Kritischer Treffer (Konjunktiv II lands)
# =====================================================================
def scene_krit():
    img = canvas((206, 216, 224))
    rect(img, 0, 0, W, 8, (176, 190, 202))
    for yy in range(8, 104, 12):
        hline(img, 0, yy, W, (196, 208, 218))
    # window + cabinet backdrop (same room as variant A)
    rect(img, 122, 8, 40, 28, (168, 206, 228))
    frame(img, 122, 8, 40, 28, (120, 132, 150))
    frame(img, 121, 7, 42, 30, INK)
    rect(img, 141, 8, 2, 28, (120, 132, 150))
    hline(img, 122, 21, 40, (120, 132, 150))
    rect(img, 198, 6, 30, 44, (150, 158, 172))
    frame(img, 198, 6, 30, 44, INK)
    for dy in (6, 17, 28, 39):
        hline(img, 198, dy + 11, 30, INK)
        rect(img, 210, dy + 4, 8, 2, (96, 102, 116))
    rect(img, 24, 44, 24, 18, WHITE)
    frame(img, 24, 44, 24, 18, GREY)
    text(img, 29, 46, "AMT", GREY_L)
    hline(img, 28, 56, 16, GREY_L)

    d = ImageDraw.Draw(img)
    d.ellipse([118, 66, 226, 92], fill=(186, 196, 206), outline=(158, 168, 180))
    d.ellipse([-20, 96, 108, 126], fill=(186, 196, 206), outline=(158, 168, 180))

    # desk
    rect(img, 124, 62, 30, 16, (172, 138, 96))
    frame(img, 124, 62, 30, 16, INK)
    rect(img, 128, 58, 12, 4, WHITE)
    frame(img, 128, 58, 12, 4, GREY)
    rect(img, 144, 56, 6, 6, (90, 60, 100))
    frame(img, 144, 56, 6, 6, INK)

    # Schmidt reels back (shifted), impact burst + sweat drop
    sprite(img, 162, 40, SCHMIDT, SCHMIDT_CMAP)
    for (sx, sy) in [(150, 42), (196, 34), (200, 52), (154, 62)]:
        sprite(img, sx, sy, SPARKLE, SPARKLE_CMAP)
    sprite(img, 186, 40, [".bb", "bbb", "bw."], {'b': (110, 170, 230), 'w': WHITE})

    # player leans in
    sprite(img, 42, 80, PLAYER_BACK, PLAYER_CMAP)

    enemy_box(img, 0.12)
    text_scaled(img, 126, 42, "-18", RED, 2, shadow=(238, 214, 208))

    # KRITISCH! banner in the open mid-field
    text_scaled(img, 38, 52, "KRITISCH!", GOLD, 2, shadow=GOLD_D)
    sprite(img, 26, 56, SPARKLE, SPARKLE_CMAP)
    sprite(img, 122, 64, SPARKLE, SPARKLE_CMAP)

    # player info box
    rect(img, 128, 88, 106, 24, CREAM)
    frame(img, 128, 88, 106, 24, INK)
    text(img, 133, 90, "DU", INK)
    text(img, 208, 90, "B1", INDIGO_D)
    text(img, 133, 100, "MUT", (60, 120, 70))
    rect(img, 156, 102, 62, 5, INK)
    rect(img, 157, 103, 60, 3, (70, 70, 80))
    rect(img, 157, 103, 56, 3, GREEN)

    # full-width message box (mid-attack, no move menu)
    dlgbox(img, 0, 116, W, 44)
    de_chips(img, 214, 120)
    text(img, 8, 119, "Du setzt KONJUNKTIV II ein:", GREY)
    text(img, 8, 130, '"Könnten Sie mir bitte weiterhelfen?"', INK)
    text(img, 8, 143, "Volltreffer! Frau Schmidt ist beeindruckt.", INDIGO_D)
    return img

# =====================================================================
# Variant D — Sieg: Meldebestätigung erhalten (reward gold)
# =====================================================================
def scene_sieg():
    img = canvas((206, 216, 224))
    rect(img, 0, 0, W, 8, (176, 190, 202))
    for yy in range(8, 104, 12):
        hline(img, 0, yy, W, (196, 208, 218))
    rect(img, 198, 6, 30, 44, (150, 158, 172))
    frame(img, 198, 6, 30, 44, INK)
    for dy in (6, 17, 28, 39):
        hline(img, 198, dy + 11, 30, INK)
    d = ImageDraw.Draw(img)
    d.ellipse([118, 66, 226, 92], fill=(186, 196, 206), outline=(158, 168, 180))
    sprite(img, 20, 80, PLAYER_BACK, PLAYER_CMAP)

    # retro dither-dim everything behind the loot card
    for y in range(0, 116):
        for x in range(W):
            if (x + y) % 2 == 0:
                r, g_, b = img.getpixel((x, y))
                img.putpixel((x, y), (r * 2 // 5, g_ * 2 // 5, b * 2 // 5))

    # loot card
    cx, cy, cw, ch = 62, 18, 116, 88
    rect(img, cx - 2, cy - 2, cw + 4, ch + 4, GOLD_D)
    rect(img, cx - 1, cy - 1, cw + 2, ch + 2, GOLD_L)
    rect(img, cx, cy, cw, ch, GOLD)
    rect(img, cx + 2, cy + 2, cw - 4, ch - 4, CREAM)
    # document icon with red seal
    ix, iy = cx + 44, cy + 8
    rect(img, ix, iy, 28, 34, WHITE)
    frame(img, ix, iy, 28, 34, INK)
    rect(img, ix + 20, iy - 3, 12, 8, (222, 230, 238))
    for ly in (6, 10, 14, 18):
        hline(img, ix + 4, iy + ly, 20, GREY_L)
    d.ellipse([ix + 15, iy + 21, ix + 24, iy + 30], fill=(206, 76, 70), outline=RED_D)
    rect(img, ix + 4, iy + 24, 8, 2, (110, 130, 150))
    # sparkles
    for (sx, sy) in [(cx + 8, cy + 8), (cx + cw - 14, cy + 12),
                     (cx + 12, cy + ch - 20), (cx + cw - 12, cy + ch - 26)]:
        sprite(img, sx, sy, SPARKLE, SPARKLE_CMAP)
    text(img, cx + 20, cy + 48, "SCHLÜSSEL-ITEM", GOLD_D)
    text(img, cx + 10, cy + 60, "MELDEBESTÄTIGUNG", INK)
    text(img, cx + 34, cy + 74, "+120 XP", (120, 96, 30))

    # dialogue box
    dlgbox(img, 0, 116, W, 44)
    de_chips(img, 214, 120)
    text(img, 8, 118, "Geschafft! Du bist offiziell angemeldet.", INK)
    text(img, 8, 128, "Frau Schmidt lächelt. Fast.", GREY)
    text(img, 8, 141, "Die Bank in Kapitel 3 will dieses Papier …", INDIGO_D)
    return img

import os
os.makedirs('out', exist_ok=True)
upscale_save(scene_schalter(), 'out/scene4-schalter-closeup.png')
upscale_save(scene_krit(), 'out/scene5-kritischer-treffer.png')
upscale_save(scene_sieg(), 'out/scene6-sieg-meldebestaetigung.png')
print('done2')
