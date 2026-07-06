# Anmeldung mission pixel mockups. 240x160 native (GBA), 4x nearest upscale.
from PIL import Image, ImageDraw
import pixfont as pf

W, H = 240, 160
SCALE = 4

# ---------- palette ----------
INK      = (34, 34, 74)
WHITE    = (248, 248, 244)
CREAM    = (240, 234, 214)
CREAM_D  = (222, 212, 184)
GREY     = (150, 152, 166)
GREY_L   = (208, 210, 220)
INDIGO   = (91, 91, 230)
INDIGO_D = (58, 58, 156)
INDIGO_L = (170, 170, 246)
TEAL     = (46, 160, 134)
RED      = (198, 52, 52)
RED_D    = (150, 36, 36)
YELLOW   = (240, 192, 64)
GREEN    = (86, 182, 86)
AMBER    = (240, 150, 50)

WALL     = (226, 214, 182)
WALL_D   = (204, 188, 148)
WALL_DD  = (176, 158, 116)
FLOOR    = (188, 194, 184)
FLOOR_D  = (172, 178, 168)
CHAIR    = (66, 112, 210)
CHAIR_D  = (44, 78, 156)

SKIN     = (240, 202, 162)
SKIN_D   = (214, 168, 126)

def canvas(bg=WHITE):
    return Image.new('RGB', (W, H), bg)

def rect(img, x, y, w, h, c):
    ImageDraw.Draw(img).rectangle([x, y, x + w - 1, y + h - 1], fill=c)

def frame(img, x, y, w, h, c):
    ImageDraw.Draw(img).rectangle([x, y, x + w - 1, y + h - 1], outline=c)

def hline(img, x, y, w, c):
    rect(img, x, y, w, 1, c)

def text(img, x, y, s, c, shadow=None):
    return pf.draw_text(img, x, y, s, c, shadow)

def text_scaled(img, x, y, s, c, scale=2, shadow=None):
    w = pf.measure(s) + 2
    tmp = Image.new('RGBA', (w, 12), (0, 0, 0, 0))
    pts, _ = pf._pixels(0, 0, s)
    for (px_, py_) in pts:
        if shadow is not None:
            tmp.putpixel((px_ + 1, py_ + 1), shadow + (255,))
    for (px_, py_) in pts:
        tmp.putpixel((px_, py_), c + (255,))
    tmp = tmp.resize((w * scale, 12 * scale), Image.NEAREST)
    img.paste(tmp, (x, y), tmp)

# GBA dialogue box: white fill, ink outer border, indigo inner border
def dlgbox(img, x, y, w, h):
    rect(img, x, y, w, h, INK)
    rect(img, x + 1, y + 1, w - 2, h - 2, INDIGO_L)
    rect(img, x + 2, y + 2, w - 4, h - 4, INDIGO_D)
    rect(img, x + 3, y + 3, w - 6, h - 6, WHITE)

def chip(img, x, y, label, bg):
    rect(img, x, y, 9, 9, INK)
    rect(img, x + 1, y + 1, 7, 7, bg)
    text(img, x + 3 if label != 'D' else x + 3, y - 1, label, WHITE)

def de_chips(img, x, y):
    chip(img, x, y, 'D', INDIGO)
    chip(img, x + 11, y, 'E', TEAL)

def sprite(img, x, y, rows, cmap):
    for ry, row in enumerate(rows):
        for rx, ch in enumerate(row):
            c = cmap.get(ch)
            if c is not None:
                if 0 <= x + rx < W and 0 <= y + ry < H:
                    img.putpixel((x + rx, y + ry), c)

# ---------- sprites ----------
# k outline, h hair, s skin, S skin shade, j jacket, J jacket shade,
# r accent/backpack, p pants, b shoes, w white, t cloth2, g grey

PLAYER_BACK = [
    "....kkkkkkkk....",
    "...khhhhhhhhk...",
    "..khhhhhhhhhhk..",
    "..khhhhhhhhhhk..",
    "..khhhhhhhhhhk..",
    "..khhhhhhhhhhk..",
    "...khhhhhhhhk...",
    "....kssssssk....",
    "...kjjjjjjjjk...",
    "..kjjjjjjjjjjk..",
    ".kjjkrrrrrrkjjk.",
    ".kjkrrrrrrrrkjk.",
    ".kjkrrrrrrrrkjk.",
    ".kjkrrrrrrrrkjk.",
    ".kjkrkkkkkkrkjk.",
    "..kjkrrrrrrkjk..",
    "...kjjjjjjjjk...",
    "....kppkkppk....",
    "....kppk.kppk...",
    "....kppk.kppk...",
    "....kbbk.kbbk...",
    "....kkkk.kkkk...",
]
PLAYER_CMAP = {'k': INK, 'h': (52, 40, 40), 's': SKIN, 'j': INDIGO,
               'J': INDIGO_D, 'r': RED, 'p': (60, 66, 92), 'b': (40, 40, 48)}

# Frau Schmidt, front, 26x32: grey bun, glasses, teal cardigan, arms crossed
SCHMIDT = [
    "..........kkkkk...........",
    ".........khhhhhk..........",
    "........khhhhhhhk.........",
    ".......khhhhhhhhhk........",
    "......khhkkkkkkkhhk.......",
    "......khkssssssskhk.......",
    "......khkssssssskhk.......",
    "......kkwwkssskwwkk.......",
    "......kkwwkssskwwkk.......",
    "......khkssssssskhk.......",
    "......khkssrrssskhk.......",
    ".......kksssssskk.........",
    "........kkssssk...........",
    ".......kttttttttk.........",
    "......kttttttttttk........",
    ".....kttttttttttttk.......",
    "....kttkttttttttkttk......",
    "....kttkttttttttkttk......",
    "....kttksssssssskttk......",
    "....kttttkkkkkkttttk......",
    "....ktttttttttttttk.......",
    "....ktttttttttttttk.......",
    ".....kttttttttttk.........",
    ".....kppppppppppk.........",
    ".....kppppppppppk.........",
    ".....kppppppppppk.........",
    "......kpppppppppk.........",
    "......kppppppppk..........",
    ".......kssk.kssk..........",
    ".......kssk.kssk..........",
    ".......kbbk.kbbk..........",
    ".......kkkk.kkkk..........",
]
SCHMIDT_CMAP = {'k': INK, 'h': (176, 176, 186), 's': SKIN, 'w': WHITE,
                't': TEAL, 'p': (94, 98, 120), 'b': (52, 52, 60), 'r': (196, 120, 110)}

# seated NPC, front, 12x15 (sits on a chair drawn behind)
NPC_SEAT = [
    "...kkkkkk...",
    "..khhhhhhk..",
    ".khhhhhhhhk.",
    ".khkssssskk.",
    ".khksskssk..",
    ".khsssssshk.",
    "..ksssssk...",
    ".kjjjjjjjjk.",
    "kjjjjjjjjjjk",
    "kjjksssskjjk",
    "kjjjjjjjjjjk",
    ".kppppppppk.",
    ".kppk..kppk.",
    ".kppk..kppk.",
    ".kbbk..kbbk.",
]
def npc_cmap(hair, jacket, pants=(70, 74, 96)):
    return {'k': INK, 'h': hair, 's': SKIN, 'j': jacket, 'p': pants, 'b': (44, 44, 52)}

PLANT = [
    "....gg....",
    "..gggggg..",
    ".gggGGggg.",
    ".ggGGGGgg.",
    "..gGGGGg..",
    ".gggGGggg.",
    "..gggggg..",
    "....tt....",
    "...kttk...",
    "...kttk...",
    "..kttttk..",
    "..kkkkkk..",
]
PLANT_CMAP = {'g': (96, 168, 96), 'G': (60, 128, 70), 't': (176, 110, 70), 'k': INK}

def chair_front(img, x, y):
    # back rest
    rect(img, x, y, 16, 7, CHAIR_D)
    frame(img, x, y, 16, 7, INK)
    # seat
    rect(img, x, y + 7, 16, 6, CHAIR)
    frame(img, x, y + 7, 16, 6, INK)
    # legs
    rect(img, x + 1, y + 13, 2, 4, INK)
    rect(img, x + 13, y + 13, 2, 4, INK)

def upscale_save(img, path):
    img.resize((W * SCALE, H * SCALE), Image.NEAREST).save(path)

# =====================================================================
# Scene 1 — Der Termin (parody booking site)
# =====================================================================
def scene_termin():
    img = canvas((214, 218, 228))
    # browser chrome
    rect(img, 0, 0, W, 14, (196, 200, 212))
    hline(img, 0, 13, W, (160, 164, 180))
    for i, c in enumerate([RED, YELLOW, GREEN]):
        rect(img, 5 + i * 6, 5, 3, 3, c)
    rect(img, 26, 2, 190, 10, WHITE)
    frame(img, 26, 2, 190, 10, GREY)
    text(img, 30, 1, "amt.berlin.de/termine/anmeldung", (96, 100, 116))

    # page header
    rect(img, 0, 14, W, 20, (172, 44, 44))
    rect(img, 0, 32, W, 2, (120, 28, 28))
    # crest: tiny white shield with bear-ish mark
    rect(img, 8, 17, 12, 14, WHITE)
    frame(img, 8, 17, 12, 14, INK)
    sprite(img, 10, 19, ["..k..k..", ".kkkkkk.", ".kkkkkk.", "kkkkkkkk", ".kk..kk.",
                          ".k....k."], {'k': (40, 40, 44)})
    text(img, 26, 17, "SERVICEPORTAL", WHITE)
    text(img, 26, 25, "Bürgeramt Mitte", (244, 200, 200))

    # page body
    rect(img, 0, 34, W, 76, WHITE)
    text(img, 10, 38, "Start → Termine → Anmeldung einer Wohnung", GREY)
    text(img, 10, 50, "Terminvereinbarung", INK)
    hline(img, 10, 60, 96, GREY_L)

    # result panel
    rect(img, 10, 64, 220, 34, CREAM)
    frame(img, 10, 64, 220, 34, CREAM_D)
    frame(img, 9, 63, 222, 36, GREY_L)
    text(img, 16, 67, "Nächster freier Termin:", INK)
    text_scaled(img, 16, 76, "IN 8 WOCHEN", RED, 2, shadow=(238, 210, 200))

    # buttons + joke line
    rect(img, 10, 101, 74, 12, INDIGO)
    frame(img, 10, 101, 74, 12, INDIGO_D)
    text(img, 15, 102, "AKTUALISIEREN", WHITE)
    text(img, 92, 103, "Zuletzt geprüft: vor 3 Sekunden", GREY)
    # mouse cursor
    sprite(img, 66, 106, ["k....", "kk...", "kwk..", "kwwk.", "kwwwk",
                           "kwkkk", "kk..."], {'k': INK, 'w': WHITE})

    # dialogue box
    dlgbox(img, 0, 116, W, 44)
    de_chips(img, 214, 120)
    text(img, 8, 118, "Acht Wochen?! Ohne Anmeldung kein Konto,", INK)
    text(img, 8, 128, "kein Handyvertrag. Was tust du?", INK)
    text(img, 12, 138, "▶ Warten und Termin sichern", INDIGO_D)
    text(img, 12, 148, "  Spontan um 6 Uhr hingehen (schwer)", GREY)
    return img

# =====================================================================
# Scene 2 — Das Wartezimmer
# =====================================================================
def scene_warteraum():
    img = canvas(WALL)
    # wall texture + wainscot
    for yy in range(0, 44, 8):
        hline(img, 0, yy, W, (231, 220, 191))
    rect(img, 0, 44, W, 8, WALL_D)
    hline(img, 0, 44, W, WALL_DD)
    hline(img, 0, 52, W, WALL_DD)

    # LED call board
    rect(img, 86, 6, 70, 24, (30, 34, 52))
    frame(img, 86, 6, 70, 24, (90, 94, 110))
    frame(img, 85, 5, 72, 26, INK)
    text(img, 92, 7, "AUFRUF", (120, 200, 160))
    text(img, 126, 7, "087", (255, 92, 74))
    text(img, 92, 18, "SCHALTER", (120, 200, 160))
    text(img, 136, 18, "3", AMBER)

    # poster
    rect(img, 18, 8, 30, 36, WHITE)
    frame(img, 18, 8, 30, 36, INK)
    rect(img, 24, 12, 18, 10, (216, 226, 240))
    sprite(img, 30, 13, ["..kk..", ".kkkk.", ".kkkk.", "..kk..", "..kk..",
                          ".kkkk."], {'k': (110, 140, 190)})
    text(img, 22, 23, "BITTE", (110, 120, 140))
    text(img, 24, 32, "RUHE", (110, 120, 140))

    # door + sign
    rect(img, 168, 6, 30, 46, (188, 172, 138))
    frame(img, 168, 6, 30, 46, WALL_DD)
    frame(img, 167, 5, 32, 48, INK)
    rect(img, 172, 24, 4, 6, (120, 104, 70))
    rect(img, 172, 10, 22, 9, WHITE)
    frame(img, 172, 10, 22, 9, INK)
    text(img, 175, 10, "Z.12", INK)

    # clock
    rect(img, 214, 10, 14, 14, WHITE)
    frame(img, 214, 10, 14, 14, INK)
    rect(img, 220, 13, 2, 5, INK)
    rect(img, 221, 16, 4, 2, INK)

    # floor
    for ty in range(52, H, 8):
        for tx in range(0, W, 8):
            img_c = FLOOR if ((tx // 8 + ty // 8) % 2 == 0) else FLOOR_D
            rect(img, tx, ty, 8, 8, img_c)

    # chairs + seated NPCs (row 1)
    row1_y = 62
    xs1 = [24, 52, 80, 108, 136]
    for cx in xs1:
        chair_front(img, cx, row1_y)
    sprite(img, 26, row1_y - 6, NPC_SEAT, npc_cmap((90, 62, 40), (168, 84, 64)))
    sprite(img, 54, row1_y - 6, NPC_SEAT, npc_cmap((180, 180, 188), (110, 120, 150)))
    sprite(img, 110, row1_y - 6, NPC_SEAT, npc_cmap((228, 190, 100), (72, 140, 108)))

    # chairs row 2
    row2_y = 92
    xs2 = [38, 66, 94, 122, 150]
    for cx in xs2:
        chair_front(img, cx, row2_y)
    sprite(img, 68, row2_y - 6, NPC_SEAT, npc_cmap((60, 46, 40), (150, 108, 170)))
    sprite(img, 124, row2_y - 6, NPC_SEAT, npc_cmap((150, 150, 158), (190, 150, 70)))

    # plant
    sprite(img, 216, 40, PLANT, PLANT_CMAP)
    sprite(img, 4, 88, PLANT, PLANT_CMAP)

    # player standing, back view, looking at the board
    sprite(img, 182, 84, PLAYER_BACK, PLAYER_CMAP)

    # ticket chip UI
    rect(img, 178, 56, 56, 14, WHITE)
    frame(img, 178, 56, 56, 14, INK)
    text(img, 182, 58, "Deine Nr.", GREY)
    text(img, 220, 58, "112", RED)

    # dialogue box
    dlgbox(img, 0, 116, W, 44)
    de_chips(img, 214, 120)
    text(img, 8, 119, "Die Frau neben dir seufzt:", GREY)
    text(img, 8, 130, '"Ich warte hier schon seit zwei Stunden."', INK)
    text(img, 8, 143, "▶ Hören üben: Was wurde gerade aufgerufen?", INDIGO_D)
    return img

# =====================================================================
# Scene 3 — Boss: Frau Schmidt (dialogue battle)
# =====================================================================
def scene_boss():
    img = canvas((206, 216, 224))
    # office backdrop
    rect(img, 0, 0, W, 8, (176, 190, 202))
    for yy in range(8, 104, 12):
        hline(img, 0, yy, W, (196, 208, 218))
    # window
    rect(img, 122, 8, 40, 28, (168, 206, 228))
    frame(img, 122, 8, 40, 28, (120, 132, 150))
    frame(img, 121, 7, 42, 30, INK)
    rect(img, 141, 8, 2, 28, (120, 132, 150))
    hline(img, 122, 21, 40, (120, 132, 150))
    # file cabinet
    rect(img, 198, 6, 30, 44, (150, 158, 172))
    frame(img, 198, 6, 30, 44, INK)
    for dy in (6, 17, 28, 39):
        hline(img, 198, dy + 11, 30, INK)
        rect(img, 210, dy + 4, 8, 2, (96, 102, 116))
    # amt poster on wall
    rect(img, 24, 44, 24, 18, WHITE)
    frame(img, 24, 44, 24, 18, GREY)
    text(img, 29, 46, "AMT", GREY_L)
    hline(img, 28, 56, 16, GREY_L)

    # platforms
    d = ImageDraw.Draw(img)
    d.ellipse([118, 66, 226, 92], fill=(186, 196, 206), outline=(158, 168, 180))
    d.ellipse([-20, 96, 108, 126], fill=(186, 196, 206), outline=(158, 168, 180))

    # desk on opponent platform (stamp + papers)
    rect(img, 124, 62, 30, 16, (172, 138, 96))
    frame(img, 124, 62, 30, 16, INK)
    rect(img, 128, 58, 12, 4, WHITE)
    frame(img, 128, 58, 12, 4, GREY)
    rect(img, 144, 56, 6, 6, (90, 60, 100))
    frame(img, 144, 56, 6, 6, INK)

    # Frau Schmidt
    sprite(img, 158, 42, SCHMIDT, SCHMIDT_CMAP)
    # crit sparkle next to Frau Schmidt
    for (sx, sy) in [(148, 44), (194, 38)]:
        sprite(img, sx, sy, ["..y..", "..y..", "yywyy", "..y..", "..y.."],
               {'y': YELLOW, 'w': WHITE})

    # player, back view
    sprite(img, 36, 82, PLAYER_BACK, PLAYER_CMAP)

    # enemy info box
    rect(img, 6, 8, 108, 30, CREAM)
    frame(img, 6, 8, 108, 30, INK)
    rect(img, 7, 9, 106, 1, WHITE)
    text(img, 11, 10, "FRAU SCHMIDT", INK)
    text(img, 86, 10, "B2", INDIGO_D)
    text(img, 11, 21, "GEDULD", (140, 120, 60))
    rect(img, 45, 24, 62, 5, INK)
    rect(img, 46, 25, 60, 3, (70, 70, 80))
    rect(img, 46, 25, 22, 3, YELLOW)

    # player info box
    rect(img, 128, 88, 106, 24, CREAM)
    frame(img, 128, 88, 106, 24, INK)
    text(img, 133, 90, "DU", INK)
    text(img, 208, 90, "B1", INDIGO_D)
    text(img, 133, 100, "MUT", (60, 120, 70))
    rect(img, 156, 102, 62, 5, INK)
    rect(img, 157, 103, 60, 3, (70, 70, 80))
    rect(img, 157, 103, 46, 3, GREEN)

    # battle UI strip
    rect(img, 0, 116, W, 44, INK)
    # message panel (left)
    rect(img, 2, 118, 128, 40, INDIGO_D)
    frame(img, 2, 118, 128, 40, INDIGO_L)
    text(img, 7, 121, "FRAU SCHMIDT will die", WHITE)
    text(img, 7, 131, "Wohnungsgeber-", WHITE)
    text(img, 7, 141, "bestätigung sehen!", WHITE)
    de_chips(img, 108, 146)
    # move panel (right)
    rect(img, 132, 118, 106, 40, WHITE)
    frame(img, 132, 118, 106, 40, INDIGO_L)
    text(img, 137, 121, "▶ KONJ. II", INK)
    text(img, 191, 121, "FRAGEN", INK)
    text(img, 137, 133, "DOKUMENT", INK)
    text(img, 191, 133, "TASCHE", INK)
    hline(img, 137, 146, 96, GREY_L)
    text(img, 137, 147, "Höflich trifft kritisch!", TEAL)
    return img

import os
os.makedirs('out', exist_ok=True)
upscale_save(scene_termin(), 'out/scene1-termin.png')
upscale_save(scene_warteraum(), 'out/scene2-wartezimmer.png')
upscale_save(scene_boss(), 'out/scene3-frau-schmidt.png')
print('done')
