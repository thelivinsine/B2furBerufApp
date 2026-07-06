# Generates the G1 placeholder art for the /welt feature from the blessed
# modern pixel direction (scene7-modern-hell.png, docs/DECISIONS.md "Game art
# direction"). Self-contained on purpose: scenes.py runs its mockup generation
# at import time, so the reusable palettes/grids are copied here instead.
#
# Output: src/features/welt/assets/*.png at NATIVE resolution (backdrops
# 240x160, sprites as-is). The app upscales with CSS image-rendering: pixelated,
# so the files stay tiny. All art is original, authored in code for this repo
# (zero spend, no third-party assets); replace with licensed packs in G2.
#
# WORLD SCALE (locked after founder feedback s74: "chairs bigger than the
# player, player squished"). On the 240x160 world:
#   - a standing adult is 28-32 px tall and 14-16 px wide (3.5-4 heads tall)
#   - a seated adult is ~20 px tall
#   - a waiting-room chair is ~19 px tall including legs (below shoulder
#     height of a standing adult), ~14 px wide
#   - desks/counters are ~18-24 px tall in the 3/4 view (surface + depth)
#   - doors are ~40-44 px
# Every sprite and prop must respect these ratios; G2 pack purchases must be
# checked against them too.
#
# Run: python3 welt_assets.py   (needs Pillow)
from PIL import Image, ImageDraw
import os

W, H = 240, 160
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "src", "features", "welt", "assets")

# ---- modern palette (scenes3.py, the blessed reference) ----
INDIGO = (91, 91, 230)
OUT = (70, 60, 68)             # soft warm outline, never pure black
SKIN = (240, 204, 168)
WALL = (233, 229, 221)
WALL_LINE = (212, 208, 200)
BASE = (246, 244, 240)
BASE_LINE = (208, 200, 188)
PLANK_A = (227, 203, 165)
PLANK_B = (221, 196, 158)
PLANK_LINE = (205, 180, 142)
PLANK_JOINT = (208, 184, 146)

SCHMIDT_CMAP = {'k': OUT, 'h': (200, 202, 210), 's': SKIN, 'w': (250, 250, 248),
                't': (219, 166, 77), 'p': (100, 106, 128), 'b': (64, 64, 74),
                'r': (202, 128, 116)}
PLAYER_CMAP = {'k': OUT, 'h': (86, 64, 50), 's': SKIN, 'j': INDIGO,
               'r': (228, 180, 114), 'p': (118, 132, 162), 'b': (242, 242, 240)}

PLANT = [
    "..g.gg.g..",
    ".gggGGggg.",
    "gGGgggggGg",
    ".ggGGGGgg.",
    "g.gGGGGg.g",
    ".gggGGggg.",
    "..gggggg..",
    "...tttt...",
    "..kttttk..",
    "..kttttk..",
    "...tttt...",
]
PLANT_CMAP = {'g': (134, 172, 128), 'G': (100, 144, 98), 't': (198, 142, 106),
              'k': (160, 110, 82)}

# player, back view, 16x30 (world scale: a standing adult; the old 16x22
# grid read as vertically squished, founder feedback s74)
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
    ".kjkrrrrrrrrkjk.",
    ".kjkrkkkkkkrkjk.",
    ".kjkrrrrrrrrkjk.",
    "..kjkrrrrrrkjk..",
    "..kjjjjjjjjjjk..",
    "...kjjjjjjjjk...",
    "....kppppppk....",
    "....kppkkppk....",
    "....kppk.kppk...",
    "....kppk.kppk...",
    "....kppk.kppk...",
    "....kppk.kppk...",
    "....kppk.kppk...",
    "....kbbk.kbbk...",
    "....kbbk.kbbk...",
    "....kkkk.kkkk...",
]

# Frau Schmidt, front, 26x32 (scenes.py grid, modern palette)
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

# seated NPC, front, 14x20 (world scale: a seated adult is ~2/3 of standing)
NPC_SEAT = [
    "....kkkkkk....",
    "...khhhhhhk...",
    "..khhhhhhhhk..",
    "..khkssssshk..",
    "..khkssksshk..",
    "..khsssssshk..",
    "...kssssssk...",
    "....kssssk....",
    "..kjjjjjjjjk..",
    ".kjjjjjjjjjjk.",
    ".kjjjjjjjjjjk.",
    ".kjjksssskjjk.",
    ".kjjjjjjjjjjk.",
    "..kppppppppk..",
    "..kppppppppk..",
    "..kppk..kppk..",
    "..kppk..kppk..",
    "..kppk..kppk..",
    "..kbbk..kbbk..",
    "..kkkk..kkkk..",
]

def npc_cmap(hair, jacket, pants=(108, 114, 134)):
    return {'k': OUT, 'h': hair, 's': SKIN, 'j': jacket, 'p': pants, 'b': (64, 64, 74)}

def rect(img, x, y, w, h, c):
    ImageDraw.Draw(img).rectangle([x, y, x + w - 1, y + h - 1], fill=c)

def hline(img, x, y, w, c):
    rect(img, x, y, w, 1, c)

def sprite(img, x, y, rows, cmap):
    for ry, row in enumerate(rows):
        for rx, ch in enumerate(row):
            c = cmap.get(ch)
            if c is not None and 0 <= x + rx < img.width and 0 <= y + ry < img.height:
                img.putpixel((x + rx, y + ry), c)

def dim_ellipse(img, x0, y0, x1, y1, f=0.92):
    m = Image.new('L', (img.width, img.height), 0)
    ImageDraw.Draw(m).ellipse([x0, y0, x1, y1], fill=255)
    for yy in range(max(0, y0), min(img.height, y1 + 1)):
        for xx in range(max(0, x0), min(img.width, x1 + 1)):
            if m.getpixel((xx, yy)):
                pr, pg, pb = img.getpixel((xx, yy))
                img.putpixel((xx, yy), (int(pr * f), int(pg * f), int(pb * f)))

def wall_and_wood(img, wall_h=64):
    rect(img, 0, 0, W, wall_h, WALL)
    rect(img, 0, wall_h, W, 6, BASE)
    hline(img, 0, wall_h, W, WALL_LINE)
    hline(img, 0, wall_h + 5, W, BASE_LINE)
    for py in range(wall_h + 6, H, 9):
        shade = PLANK_A if (py // 9) % 2 == 0 else PLANK_B
        rect(img, 0, py, W, 9, shade)
        hline(img, 0, py, W, PLANK_LINE)
        off = (py // 9 % 3) * 34
        for jx in range(off, W, 80):
            rect(img, jx, py + 1, 1, 8, PLANK_JOINT)

def window(img, x=16, y=8, w=52, h=38):
    rect(img, x, y, w, h, BASE)
    rect(img, x + 4, y + 4, w - 8, h - 8, (176, 208, 230))
    rect(img, x + 4, y + 22, w - 8, 6, (196, 222, 238))
    rect(img, x + 4, y + 28, w - 8, 6, (170, 202, 168))
    rect(img, x + w // 2 - 2, y + 4, 3, h - 8, BASE)
    rect(img, x + 4, y + 18, w - 8, 2, BASE)
    hline(img, x, y + h, w, (204, 198, 188))

def shelf(img, x=196, y=12):
    rect(img, x, y, 38, 38, (218, 190, 150))
    hline(img, x, y + 18, 38, (188, 158, 118))
    hline(img, x, y + 37, 38, (188, 158, 118))
    for i, c in enumerate([(120, 126, 190), (100, 150, 134), (219, 166, 77),
                           (160, 120, 130), (120, 126, 190)]):
        rect(img, x + 4 + i * 5, y + 6, 4, 12, c)
    rect(img, x + 6, y + 22, 26, 15, (244, 242, 236))
    hline(img, x + 6, y + 29, 26, (216, 212, 202))
    sprite(img, x + 24, y - 10, PLANT, PLANT_CMAP)

def floor_plant(img, x=206, y=50):
    for ry, row in enumerate(PLANT):
        for rx, ch in enumerate(row):
            c = PLANT_CMAP.get(ch)
            if c is not None:
                rect(img, x + rx * 2, y + ry * 2, 2, 2, c)

# ---------------------------------------------------------------
def backdrop_amt():
    """The Bürgeramt service room: scene-7's world without baked characters."""
    img = Image.new('RGB', (W, H), WALL)
    wall_and_wood(img)
    window(img)
    shelf(img)
    floor_plant(img)
    # ground shadows for desk + the two sprite anchor spots
    dim_ellipse(img, 148, 71, 202, 79)
    dim_ellipse(img, 34, 101, 66, 108)
    dim_ellipse(img, 118, 76, 164, 83, 0.93)
    # modern service desk with monitor
    rect(img, 118, 62, 46, 18, (240, 238, 233))
    hline(img, 118, 71, 46, (222, 218, 210))
    rect(img, 116, 56, 50, 6, (250, 249, 246))
    hline(img, 116, 61, 50, (216, 212, 204))
    rect(img, 126, 44, 20, 12, (52, 56, 72))
    rect(img, 128, 46, 16, 8, (98, 112, 150))
    hline(img, 129, 48, 10, (150, 164, 198))
    rect(img, 134, 56, 4, 2, (52, 56, 72))
    rect(img, 150, 52, 10, 4, (250, 250, 248))
    hline(img, 151, 53, 8, (210, 206, 198))
    return img

def backdrop_wartezimmer():
    """Waiting room: chair rows, number board, ticket machine, quiet dread."""
    img = Image.new('RGB', (W, H), WALL)
    wall_and_wood(img)
    # number board (dark panel; live numbers come from the DOM ticker card)
    rect(img, 96, 10, 48, 22, (52, 56, 72))
    rect(img, 98, 12, 44, 18, (40, 44, 58))
    rect(img, 102, 18, 16, 7, (98, 112, 150))
    rect(img, 122, 18, 16, 7, (219, 166, 77))
    # posters
    rect(img, 24, 12, 26, 32, (244, 242, 236))
    hline(img, 28, 20, 18, (200, 196, 188))
    hline(img, 28, 26, 18, (200, 196, 188))
    hline(img, 28, 32, 12, (200, 196, 188))
    rect(img, 170, 14, 22, 28, (244, 242, 236))
    rect(img, 174, 18, 14, 10, (170, 202, 168))
    # ticket machine on the right wall
    rect(img, 216, 34, 14, 30, (120, 126, 148))
    rect(img, 218, 38, 10, 8, (219, 166, 77))
    rect(img, 220, 50, 6, 4, (250, 250, 248))
    # two rows of modern chairs, some occupied (world scale: chair ~19 px
    # incl. legs, clearly SMALLER than a 30 px standing adult)
    for row_y, seats in ((88, (16, 46, 76, 130, 160, 190)), (124, (30, 62, 114, 178))):
        for sx in seats:
            dim_ellipse(img, sx - 2, row_y + 17, sx + 16, row_y + 21, 0.94)
            rect(img, sx, row_y, 14, 3, (150, 156, 176))      # backrest
            rect(img, sx, row_y + 3, 14, 7, (170, 176, 196))  # back
            rect(img, sx, row_y + 10, 14, 4, (150, 156, 176)) # seat
            rect(img, sx + 1, row_y + 14, 2, 5, (110, 114, 132))
            rect(img, sx + 11, row_y + 14, 2, 5, (110, 114, 132))
    # seated people: hips on the seat surface, heads above the chair backs
    sprite(img, 46, 79, NPC_SEAT, npc_cmap((90, 62, 40), (168, 128, 84)))
    sprite(img, 130, 79, NPC_SEAT, npc_cmap((200, 202, 210), (118, 132, 162)))
    sprite(img, 62, 115, NPC_SEAT, npc_cmap((60, 46, 40), (100, 144, 98)))
    floor_plant(img, 6, 44)
    return img

def backdrop_wohnung():
    """The player's room: bed, desk, the suitcase life starts from."""
    img = Image.new('RGB', (W, H), WALL)
    wall_and_wood(img)
    window(img, 96, 8, 48, 36)
    # bed, left
    dim_ellipse(img, 12, 116, 84, 124, 0.94)
    rect(img, 14, 84, 68, 34, (222, 210, 192))    # frame
    rect(img, 14, 80, 68, 10, (250, 249, 246))    # pillow end
    rect(img, 16, 88, 64, 22, (146, 152, 208))    # duvet
    hline(img, 16, 96, 64, (128, 134, 190))
    rect(img, 14, 80, 4, 38, (198, 174, 138))
    rect(img, 78, 80, 4, 38, (198, 174, 138))
    # desk with laptop, right (world scale: desk ~24 px in the 3/4 view)
    dim_ellipse(img, 158, 96, 224, 103, 0.94)
    rect(img, 158, 74, 66, 6, (250, 249, 246))
    hline(img, 158, 79, 66, (216, 212, 204))
    rect(img, 160, 80, 4, 18, (218, 190, 150))
    rect(img, 218, 80, 4, 18, (218, 190, 150))
    rect(img, 180, 64, 18, 10, (52, 56, 72))
    rect(img, 182, 66, 14, 6, (98, 112, 150))
    # suitcase by the door (about knee-to-hip height on a 30 px adult)
    rect(img, 122, 102, 22, 14, (168, 84, 64))
    hline(img, 122, 108, 22, (140, 66, 50))
    rect(img, 130, 98, 6, 4, (140, 66, 50))
    dim_ellipse(img, 120, 114, 148, 120, 0.94)
    # plant + poster
    floor_plant(img, 8, 44)
    rect(img, 176, 12, 24, 30, (244, 242, 236))
    rect(img, 180, 16, 16, 12, (219, 166, 77))
    return img

def backdrop_strasse():
    """Outside the Bürgeramt: modern concrete-and-glass, morning light."""
    img = Image.new('RGB', (W, H), (196, 220, 236))
    # sky gradient bands + clouds
    rect(img, 0, 0, W, 18, (188, 214, 234))
    rect(img, 20, 10, 26, 5, (238, 244, 248))
    rect(img, 150, 16, 34, 6, (238, 244, 248))
    # building
    rect(img, 24, 22, 192, 76, (214, 210, 200))
    hline(img, 24, 22, 192, (188, 184, 174))
    for fx in range(36, 204, 28):
        rect(img, fx, 32, 16, 12, (166, 192, 210))
        hline(img, fx, 38, 16, (146, 172, 190))
        rect(img, fx, 56, 16, 12, (166, 192, 210))
        hline(img, fx, 62, 16, (146, 172, 190))
    # entrance: glass double door + indigo sign strip
    rect(img, 100, 58, 40, 40, (120, 126, 148))
    rect(img, 104, 62, 14, 36, (150, 176, 194))
    rect(img, 122, 62, 14, 36, (150, 176, 194))
    rect(img, 100, 50, 40, 6, INDIGO)
    # pavement + street
    rect(img, 0, 98, W, 26, (206, 202, 194))
    hline(img, 0, 98, W, (182, 178, 170))
    for jx in range(0, W, 24):
        rect(img, jx, 106, 1, 18, (190, 186, 178))
    rect(img, 0, 124, W, 36, (146, 150, 162))
    hline(img, 0, 124, W, (120, 124, 136))
    for jx in range(8, W, 40):
        rect(img, jx, 140, 18, 3, (222, 224, 230))
    # tree + bike rack on the pavement
    rect(img, 20, 74, 6, 26, (160, 110, 82))
    for (tx, ty, tw, th) in ((8, 52, 30, 18), (12, 44, 22, 12)):
        rect(img, tx, ty, tw, th, (100, 144, 98))
        rect(img, tx + 4, ty - 4, tw - 8, 8, (134, 172, 128))
    rect(img, 196, 88, 30, 2, (110, 114, 132))
    rect(img, 200, 90, 2, 8, (110, 114, 132))
    rect(img, 220, 90, 2, 8, (110, 114, 132))
    return img

# open travel bag, front view, 26x20 (loadout stage centerpiece)
BAG = [
    "....kkkkkkkkkkkkkkkkkk....",
    "...kwwwwwwwwwwwwwwwwwwk...",
    "..kwkkkkkkkkkkkkkkkkkkwk..",
    ".kbbkbbbbbbbbbbbbbbbbkbbk.",
    ".kbbbbbbbbbbbbbbbbbbbbbbk.",
    ".kbbbbbbbbbbbbbbbbbbbbbbk.",
    ".kbbjjjjjjjjjjjjjjjjjjbbk.",
    ".kbbjjjjjjjjjjjjjjjjjjbbk.",
    ".kbbbbbbbbbbbbbbbbbbbbbbk.",
    ".kbbbbbbbbbbbbbbbbbbbbbbk.",
    ".kbbbbbbbbbbbbbbbbbbbbbbk.",
    ".kbbbbbbbbbbbbbbbbbbbbbbk.",
    "..kbbbbbbbbbbbbbbbbbbbbk..",
    "...kkkkkkkkkkkkkkkkkkkk...",
]
BAG_CMAP = {'k': OUT, 'b': (168, 84, 64), 'j': (219, 166, 77), 'w': (140, 66, 50)}

# document icons, 12x14: ID card / plain contract / signed confirmation
DOC_AUSWEIS = [
    "kkkkkkkkkkkk",
    "kjjjjjjjjjjk",
    "kjjjjjjjjjjk",
    "kwwwwwwwwwwk",
    "kwsskwwwwwwk",
    "kwsskwllllwk",
    "kwsskwwwwwwk",
    "kwwwwwllllwk",
    "kwwwwwwwwwwk",
    "kwllllllwwwk",
    "kwwwwwwwwwwk",
    "kkkkkkkkkkkk",
]
DOC_VERTRAG = [
    "kkkkkkkkkk..",
    "kwwwwwwwwkk.",
    "kwwwwwwwwwk.",
    "kwllllllwwk.",
    "kwwwwwwwwwk.",
    "kwllllllwwk.",
    "kwwwwwwwwwk.",
    "kwllllwwwwk.",
    "kwwwwwwwwwk.",
    "kwllllllwwk.",
    "kwwwwwwwwwk.",
    "kkkkkkkkkkk.",
]
DOC_WGB = [
    "kkkkkkkkkk..",
    "kwwwwwwwwkk.",
    "kwwwwwwwwwk.",
    "kwllllllwwk.",
    "kwwwwwwwwwk.",
    "kwllllwwwwk.",
    "kwwwwwwwwwk.",
    "kwwwwwttwwk.",
    "kwzzzwttwwk.",
    "kwwwwwwwwwk.",
    "kwwwwwwwwwk.",
    "kkkkkkkkkkk.",
]
DOC_CMAP = {'k': OUT, 'w': (250, 250, 248), 'l': (196, 200, 210), 'j': INDIGO,
            's': SKIN, 'z': (90, 96, 140), 't': (100, 144, 98)}

# Wörterbuch, 14x12: the bag's rationed English lifeline (indigo cover, D/E
# page block)
DICT = [
    "..kkkkkkkkkk..",
    ".kjjjjjjjjjjk.",
    "kjjwwwwwwwwjjk",
    "kjjwkkwwkkwjjk",
    "kjjwwwwwwwwjjk",
    "kjjwkkkkkkwjjk",
    "kjjwwwwwwwwjjk",
    "kjjwkkkwwwwjjk",
    "kjjwwwwwwwwjjk",
    ".kjjjjjjjjjjk.",
    "..kkkkkkkkkk..",
    "...kkkkkkkk...",
]
DICT_CMAP = {'k': OUT, 'j': INDIGO, 'w': (250, 250, 248)}

def sprite_png(rows, cmap, name):
    img = Image.new('RGBA', (len(rows[0]), len(rows)), (0, 0, 0, 0))
    for ry, row in enumerate(rows):
        for rx, ch in enumerate(row):
            c = cmap.get(ch)
            if c is not None:
                img.putpixel((rx, ry), c + (255,))
    img.save(os.path.join(OUT_DIR, name))

os.makedirs(OUT_DIR, exist_ok=True)
backdrop_amt().save(os.path.join(OUT_DIR, "amt.png"))
backdrop_wartezimmer().save(os.path.join(OUT_DIR, "wartezimmer.png"))
backdrop_wohnung().save(os.path.join(OUT_DIR, "wohnung.png"))
backdrop_strasse().save(os.path.join(OUT_DIR, "strasse.png"))
sprite_png(SCHMIDT, SCHMIDT_CMAP, "schmidt.png")
sprite_png(PLAYER_BACK, PLAYER_CMAP, "player.png")
sprite_png(BAG, BAG_CMAP, "bag.png")
sprite_png(DOC_AUSWEIS, DOC_CMAP, "doc-ausweis.png")
sprite_png(DOC_VERTRAG, DOC_CMAP, "doc-vertrag.png")
sprite_png(DOC_WGB, DOC_CMAP, "doc-wgb.png")
sprite_png(DICT, DICT_CMAP, "dict.png")

# proportion check sheet (not shipped): player, chair row, Schmidt at 4x so
# the world-scale ratios above are verifiable at a glance
check = Image.new('RGB', (120, 50), (233, 229, 221))
sprite(check, 6, 14, PLAYER_BACK, PLAYER_CMAP)
rect(check, 30, 25, 14, 3, (150, 156, 176))
rect(check, 30, 28, 14, 7, (170, 176, 196))
rect(check, 30, 35, 14, 4, (150, 156, 176))
rect(check, 31, 39, 2, 5, (110, 114, 132))
rect(check, 41, 39, 2, 5, (110, 114, 132))
sprite(check, 50, 24, NPC_SEAT, npc_cmap((90, 62, 40), (168, 128, 84)))
sprite(check, 72, 12, SCHMIDT, SCHMIDT_CMAP)
check = check.resize((480, 200), Image.NEAREST)
check.save(os.path.join(os.path.dirname(__file__), "proportions-check.png"))

print("welt assets written to", os.path.abspath(OUT_DIR))
