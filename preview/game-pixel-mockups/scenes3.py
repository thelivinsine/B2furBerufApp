# Modern restyle of the Frau Schmidt battle: same picture, contemporary palette +
# app-like UI. World drawn at 240x160, UI drawn at 480x320 (half-size pixels, the
# crisp-UI-over-chunky-world convention of modern indie pixel games), final 960x640.
from PIL import Image, ImageDraw
import pixfont as pf
from scenes import W, H, rect, hline, sprite, SCHMIDT, PLAYER_BACK

FINE_W, FINE_H = 480, 320

INDIGO   = (91, 91, 230)
INDIGO_SOFT = (233, 233, 250)
TEAL     = (44, 156, 132)
TEAL_SOFT = (223, 243, 238)
AMBER    = (243, 166, 74)
SLATE    = (51, 56, 74)
SLATE_MID = (118, 124, 144)

SKIN     = (240, 204, 168)

# modern sprite palettes: soft outlines, muted cloth
OUT = (70, 60, 68)
SCHMIDT_CMAP_M = {'k': OUT, 'h': (200, 202, 210), 's': SKIN, 'w': (250, 250, 248),
                  't': (219, 166, 77), 'p': (100, 106, 128), 'b': (64, 64, 74),
                  'r': (202, 128, 116)}
PLAYER_CMAP_M = {'k': OUT, 'h': (86, 64, 50), 's': SKIN, 'j': INDIGO,
                 'r': (228, 180, 114), 'p': (118, 132, 162), 'b': (242, 242, 240)}

PLANT_M = [
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
PLANT_M_CMAP = {'g': (134, 172, 128), 'G': (100, 144, 98), 't': (198, 142, 106),
                'k': (160, 110, 82)}

def mask_rounded(w, h, r):
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)
    return m

def dim_rounded(img, x, y, w, h, r, f):
    m = mask_rounded(w, h, r)
    for yy in range(h):
        for xx in range(w):
            if m.getpixel((xx, yy)) and 0 <= x + xx < img.width and 0 <= y + yy < img.height:
                pr, pg, pb = img.getpixel((x + xx, y + yy))
                img.putpixel((x + xx, y + yy), (int(pr * f), int(pg * f), int(pb * f)))

def dim_ellipse(img, x0, y0, x1, y1, f):
    m = Image.new('L', (img.width, img.height), 0)
    ImageDraw.Draw(m).ellipse([x0, y0, x1, y1], fill=255)
    for yy in range(max(0, y0), min(img.height, y1 + 1)):
        for xx in range(max(0, x0), min(img.width, x1 + 1)):
            if m.getpixel((xx, yy)):
                pr, pg, pb = img.getpixel((xx, yy))
                img.putpixel((xx, yy), (int(pr * f), int(pg * f), int(pb * f)))

def glow_ellipse(img, x0, y0, x1, y1, fr, fg, fb):
    # dithered two-step falloff: full glow in the inner ellipse, checkerboard in the ring
    mo = Image.new('L', (img.width, img.height), 0)
    ImageDraw.Draw(mo).ellipse([x0, y0, x1, y1], fill=255)
    mi = Image.new('L', (img.width, img.height), 0)
    ix = (x1 - x0) // 10
    iy = (y1 - y0) // 10
    ImageDraw.Draw(mi).ellipse([x0 + ix, y0 + iy, x1 - ix, y1 - iy], fill=255)
    for yy in range(max(0, y0), min(img.height, y1 + 1)):
        for xx in range(max(0, x0), min(img.width, x1 + 1)):
            if not mo.getpixel((xx, yy)):
                continue
            inner = mi.getpixel((xx, yy))
            if not inner and (xx + yy) % 2:
                continue
            pr, pg, pb = img.getpixel((xx, yy))
            img.putpixel((xx, yy), (min(255, int(pr * fr)),
                                    min(255, int(pg * fg)),
                                    min(255, int(pb * fb))))

def card(img, x, y, w, h, r, fill, outline=None):
    dim_rounded(img, x + 1, y + 3, w, h, r, 0.86)   # soft drop shadow
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([x, y, x + w - 1, y + h - 1], radius=r, fill=fill, outline=outline)

def pill(img, x, y, w, h, fill, outline, label, tcolor):
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([x, y, x + w - 1, y + h - 1], radius=h // 2, fill=fill, outline=outline)
    pf.draw_text(img, x + (w - pf.measure(label)) // 2, y + (h - 9) // 2, label, tcolor)

def bar(img, x, y, w, track, fill, pct):
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([x, y, x + w - 1, y + 4], radius=2, fill=track)
    fw = max(5, int(w * pct))
    d.rounded_rectangle([x, y, x + fw - 1, y + 4], radius=2, fill=fill)

# ---------------------------------------------------------------
def world_modern():
    img = Image.new('RGB', (W, H), (233, 229, 221))
    # baseboard + wall
    rect(img, 0, 64, W, 6, (246, 244, 240))
    hline(img, 0, 64, W, (212, 208, 200))
    hline(img, 0, 69, W, (208, 200, 188))

    # window with greenery outside
    rect(img, 16, 8, 52, 38, (248, 247, 244))
    rect(img, 20, 12, 44, 30, (176, 208, 230))
    rect(img, 20, 30, 44, 6, (196, 222, 238))
    rect(img, 20, 36, 44, 6, (170, 202, 168))
    rect(img, 40, 12, 3, 30, (248, 247, 244))
    rect(img, 20, 26, 44, 2, (248, 247, 244))
    hline(img, 16, 46, 52, (204, 198, 188))

    # minimal wall signage (clear of the floating enemy card)
    pf.draw_text(img, 104, 20, "BÜRGERAMT", (176, 170, 160))
    rect(img, 104, 32, 20, 2, INDIGO)

    # shelf with books + plant
    rect(img, 196, 12, 38, 38, (218, 190, 150))
    hline(img, 196, 30, 38, (188, 158, 118))
    hline(img, 196, 49, 38, (188, 158, 118))
    for i, c in enumerate([(120, 126, 190), (100, 150, 134), (219, 166, 77),
                            (160, 120, 130), (120, 126, 190)]):
        rect(img, 200 + i * 5, 18, 4, 12, c)
    rect(img, 202, 34, 26, 15, (244, 242, 236))
    hline(img, 202, 41, 26, (216, 212, 202))
    sprite(img, 220, 2, PLANT_M, PLANT_M_CMAP)

    # wood plank floor
    for py in range(70, H, 9):
        shade = (227, 203, 165) if (py // 9) % 2 == 0 else (221, 196, 158)
        rect(img, 0, py, W, 9, shade)
        hline(img, 0, py, W, (205, 180, 142))
        off = (py // 9 % 3) * 34
        for jx in range(off, W, 80):
            rect(img, jx, py + 1, 1, 8, (208, 184, 146))

    # big floor plant right (drawn 2x)
    for ry, row in enumerate(PLANT_M):
        for rx, ch in enumerate(row):
            c = PLANT_M_CMAP.get(ch)
            if c is not None:
                rect(img, 206 + rx * 2, 50 + ry * 2, 2, 2, c)

    # ground shadows (soft)
    dim_ellipse(img, 148, 71, 202, 79, 0.92)
    dim_ellipse(img, 34, 101, 66, 108, 0.92)
    dim_ellipse(img, 118, 76, 164, 83, 0.93)

    # modern desk with monitor
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

    # characters (modern palettes)
    sprite(img, 158, 38, SCHMIDT, SCHMIDT_CMAP_M)
    sprite(img, 36, 80, PLAYER_BACK, PLAYER_CMAP_M)
    return img

# ---------------------------------------------------------------
def scene_modern(theme='light'):
    world = world_modern()
    if theme == 'dark':
        for yy in range(H):
            for xx in range(W):
                r, g, b = world.getpixel((xx, yy))
                world.putpixel((xx, yy), (int(r * 0.58), int(g * 0.62), int(b * 0.80)))
        # night outside the window
        rect(world, 20, 12, 44, 30, (54, 62, 100))
        rect(world, 20, 32, 44, 10, (44, 52, 84))
        rect(world, 40, 12, 3, 30, (150, 150, 156))
        rect(world, 20, 26, 44, 2, (150, 150, 156))
        for (sx, sy) in [(26, 16), (52, 15), (58, 22), (33, 21)]:
            world.putpixel((sx, sy), (222, 226, 240))
        rect(world, 46, 17, 3, 3, (238, 238, 230))
        glow_ellipse(world, 120, 42, 206, 84, 1.24, 1.17, 1.02)

    img = world.resize((FINE_W, FINE_H), Image.NEAREST)

    if theme == 'light':
        CARD, TXT, SUB = (252, 252, 251), SLATE, SLATE_MID
        TRACK = (229, 231, 235)
        SHEET = (252, 252, 251)
        HANDLE = (212, 214, 222)
        PILL_BG, PILL_LINE, PILL_TXT = None, (204, 208, 220), SLATE
        DBG, EBG = INDIGO_SOFT, TEAL_SOFT
    else:
        CARD, TXT, SUB = (38, 41, 56), (235, 237, 245), (152, 158, 178)
        TRACK = (58, 62, 82)
        SHEET = (30, 33, 46)
        HANDLE = (74, 78, 98)
        PILL_BG, PILL_LINE, PILL_TXT = None, (92, 96, 120), (208, 212, 226)
        DBG, EBG = (58, 58, 104), (34, 78, 68)

    # enemy card
    card(img, 14, 14, 178, 52, 8, CARD)
    pf.draw_text(img, 28, 24, "Frau Schmidt", TXT)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([146, 22, 178, 37], radius=7, fill=DBG)
    pf.draw_text(img, 156, 25, "B2", INDIGO if theme == 'light' else (168, 168, 246))
    pf.draw_text(img, 28, 44, "Geduld", SUB)
    bar(img, 76, 47, 100, TRACK, AMBER, 0.35)

    # player card
    card(img, 292, 186, 174, 52, 8, CARD)
    pf.draw_text(img, 306, 196, "Du", TXT)
    d.rounded_rectangle([420, 194, 452, 209], radius=7, fill=DBG)
    pf.draw_text(img, 430, 197, "B1", INDIGO if theme == 'light' else (168, 168, 246))
    pf.draw_text(img, 306, 216, "Mut", SUB)
    bar(img, 350, 219, 100, TRACK, INDIGO, 0.8)

    # bottom sheet
    card(img, 8, 234, 464, 82, 10, SHEET)
    d.rounded_rectangle([228, 240, 251, 243], radius=1, fill=HANDLE)
    pf.draw_text(img, 26, 248, "FRAU SCHMIDT", INDIGO if theme == 'light' else (168, 168, 246))
    pf.draw_text(img, 26, 262, '"Die Wohnungsgeberbestätigung,', TXT)
    pf.draw_text(img, 26, 274, 'bitte."', TXT)
    pf.draw_text(img, 26, 296, "Wähle deine Antwort", SUB)

    # D/E chips
    for i, (lbl, bg, fg) in enumerate([("D", DBG, INDIGO if theme == 'light' else (188, 188, 250)),
                                        ("E", EBG, TEAL if theme == 'light' else (120, 214, 190))]):
        d.rounded_rectangle([414 + i * 22, 244, 431 + i * 22, 261], radius=5, fill=bg)
        pf.draw_text(img, 420 + i * 22, 247, lbl, fg)

    # move pills, 2x2
    px0, py0 = 252, 268
    pill(img, px0, py0, 96, 18, INDIGO, None, "Konjunktiv II", (255, 255, 255))
    pill(img, px0 + 104, py0, 82, 18, PILL_BG, PILL_LINE, "Nachfragen", PILL_TXT)
    pill(img, px0, py0 + 24, 108, 18, PILL_BG, PILL_LINE, "Dokument zeigen", PILL_TXT)
    pill(img, px0 + 116, py0 + 24, 56, 18, PILL_BG, PILL_LINE, "Tasche", PILL_TXT)

    return img.resize((FINE_W * 2, FINE_H * 2), Image.NEAREST)

import os
os.makedirs('out', exist_ok=True)
scene_modern('light').save('out/scene7-modern-hell.png')
scene_modern('dark').save('out/scene8-modern-dunkel.png')
print('done3')
