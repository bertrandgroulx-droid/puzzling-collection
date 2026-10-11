#!/usr/bin/env python3
"""Draw each Puzzling game's app icon and rasterise the full icon set.

House style, shared with the studio's other apps (Fauxcabulary, Acronumbskull): one bold
glyph built from flat-cut blocks, azure on a near-black ground, so it reads on a light or a
dark home screen. Puzzling adds one rule of its own: in every icon, the single white piece
is the move the game asks of you (the letter you take away, the one you swap, the overlap
you find).

Each glyph is drawn on a 100 x 100 grid. The grid sits in the middle 64% of the icon, and in
the middle 46% of the maskable version, which Android crops to a circle.

    pip install cairosvg pillow
    python3 tools/make-icons.py

Writes, for every game folder and for the home page (icons/ at the root), plus each
folder's manifest.webmanifest (name, description, icons) so it installs as its own app:
    icons/icon.svg  icons/maskable.svg
    icons/apple-touch-icon.png (180)  icons/icon-192.png  icons/icon-512.png
    icons/icon-maskable-512.png  icons/favicon-32.png  icons/favicon-16.png
and tools/icons-preview.png, a contact sheet of all of them.

Rasterised with cairosvg, as in the studio's tools: a headless browser capture can leave the
bottom of the canvas unpainted. Every PNG is flattened to opaque RGB, because iOS composites
black behind transparency.
"""
import json
import os

GROUND = "#12141c"   # near-black, as in the studio's icons
BLUE = "#5aa9ff"     # the studio's azure
MOVE = "#f2f2f4"     # the move the game asks of you
R = 2.2              # corner rounding, in grid units
BOX = 512

def rect(x, y, w, h, fill=BLUE, rot=0, r=R):
    t = f' transform="rotate({rot} {x + w / 2:g} {y + h / 2:g})"' if rot else ""
    return f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" rx="{r:g}" fill="{fill}"{t}/>'

def poly(points, fill=BLUE):
    return '<polygon points="' + " ".join(f"{x:g},{y:g}" for x, y in points) + f'" fill="{fill}"/>'

def row(n, size, gap, y, fill=BLUE, centre=50, skip=(), whites=()):
    """n square blocks in a centred row; skip leaves a slot empty, whites paints a slot white."""
    x0 = centre - (n * size + (n - 1) * gap) / 2
    return [rect(x0 + i * (size + gap), y, size, size, MOVE if i in whites else fill) for i in range(n) if i not in skip]

# ---- the eight glyphs ----

def common_thread():
    # Three words stacked, one thread running through them all.
    return [rect(4, 13, 62, 18), rect(26, 41, 68, 18), rect(10, 69, 60, 18),
            rect(45.5, 4, 9, 92, MOVE)]

def whittle():
    # A word whittled down a letter at a time: six, five, four, three. The white block is
    # the letter just taken away, falling clear.
    out = []
    for i, n in enumerate((5, 4, 3)):
        out += row(n, 16, 4.5, 6 + i * 22, centre=43)
    return out + [rect(70, 70, 20, 20, MOVE, rot=24)]

def tumble():
    # Five letter blocks tumbling into a new order; the white one is mid-leap.
    spots = [(14, 70, -14), (34, 58, 9), (66, 56, 15), (86, 72, -10)]
    out = [rect(cx - 12, cy - 12, 24, 24, rot=a) for cx, cy, a in spots]
    return out + [rect(38, 8, 24, 24, MOVE, rot=-18)]

def stowaway():
    # A word with a gap, and one white letter slipping in from above.
    return row(5, 18.5, 2, 62, skip=(2,)) + [rect(40.5, 12, 19, 19, MOVE, rot=14),
            poly([(42, 39), (58, 39), (50, 51)], MOVE)]

def soundalike():
    # Two speech bubbles, the same sound in each.
    def bubble(x, fill, tail_left):
        t = [(x + 6, 62), (x + 18, 62), (x + 3, 76)] if tail_left else [(x + 26, 62), (x + 38, 62), (x + 41, 76)]
        waves = [rect(x + 9 + i * 7.5, 38 - h / 2 + 4, 4.5, h, GROUND, r=2) for i, h in enumerate((10, 20, 14, 6))]
        return [rect(x, 24, 44, 40, fill, r=6), poly(t, fill)] + waves
    return bubble(3, BLUE, True) + bubble(53, MOVE, False)

def switcheroo():
    # A word ladder: each rung changes one letter (white) from the rung above.
    out = row(4, 17, 5, 8.5)
    for r, c in ((1, 1), (2, 3), (3, 0)):
        out += row(4, 17, 5, 8.5 + r * 22, whites=(c,))
    return out

def three_of_a_kind():
    # Three matching pieces, and the one thing they share underneath.
    out = [rect(cx - 12, 24, 24, 24, rot=45) for cx in (17, 50, 83)]
    return out + [rect(2, 68, 96, 12, MOVE)]

def splice():
    # Two words overlapping; the white part is where they join.
    return [rect(4, 20, 60, 38), rect(36, 42, 60, 38), rect(36, 42, 28, 16, MOVE, r=0)]

def puzzling():
    # The collection: a block P, its last piece (white) just dropping into place.
    return [rect(20, 6, 19, 88), rect(20, 6, 58, 19), rect(20, 47, 58, 19, r=0), rect(20, 47, 58, 19),
            rect(61, 25, 19, 22, MOVE, rot=12)]

GLYPHS = {
    "common-thread": common_thread, "whittle": whittle, "tumble": tumble, "stowaway": stowaway,
    "soundalike": soundalike, "switcheroo": switcheroo, "three-of-a-kind": three_of_a_kind, "splice": splice,
    ".": puzzling,
}

def svg(parts, share, note=""):
    off = BOX * (1 - share) / 2
    scale = BOX * share / 100
    body = "\n".join("    " + p for p in parts)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {BOX} {BOX}">\n' + note +
            f'  <rect width="{BOX}" height="{BOX}" fill="{GROUND}"/>\n'
            f'  <g transform="translate({off:g} {off:g}) scale({scale:g})">\n{body}\n  </g>\n</svg>\n')

# Name and one-line description per app; the descriptions match the home page and shozbot.com cards.
APPS = {
    "common-thread": ("Common Thread", "Three words, and one missing word that pairs with every one of them."),
    "whittle": ("Whittle", "Take one letter away at a time to match three clues before the clock runs out."),
    "tumble": ("Tumble", "An anagram game: rearrange the letters to fit the clue, then find a bonus word in the same letters."),
    "stowaway": ("Stowaway", "Two clues, two words: the second is the first with one letter smuggled in."),
    "soundalike": ("Soundalike", "Two clues, two words that sound the same but are spelled differently."),
    "switcheroo": ("Switcheroo", "Change one letter at a time to climb a three-step word ladder."),
    "three-of-a-kind": ("Three of a Kind", "Three words have something in common. Spot what it is."),
    "splice": ("Splice", "Two clues, two words, blended into one where they overlap."),
    ".": ("Puzzling", "Eight quick word games for your phone, each with a new puzzle every day."),
}

def manifest(folder):
    name, desc = APPS[folder]
    icons = [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
             {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
             {"src": "icons/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
             {"src": "icons/icon.svg", "sizes": "any", "type": "image/svg+xml"}]
    return json.dumps({"name": name, "short_name": name, "description": desc, "start_url": "./", "scope": "./",
                       "display": "standalone", "orientation": "portrait", "background_color": "#ffffff",
                       "theme_color": "#ffffff", "icons": icons}, indent=2) + "\n"

PNGS = [("icon.svg", "apple-touch-icon.png", 180), ("icon.svg", "icon-192.png", 192), ("icon.svg", "icon-512.png", 512),
        ("maskable.svg", "icon-maskable-512.png", 512), ("icon.svg", "favicon-32.png", 32), ("icon.svg", "favicon-16.png", 16)]

if __name__ == "__main__":
    import cairosvg
    from PIL import Image, ImageDraw
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for folder, draw in GLYPHS.items():
        d = os.path.join(root, folder, "icons")
        os.makedirs(d, exist_ok=True)
        parts = draw()
        open(os.path.join(d, "icon.svg"), "w").write(svg(parts, 0.64))
        open(os.path.join(d, "maskable.svg"), "w").write(svg(parts, 0.46, "  <!-- Android crops to a circle of about 66% width, so the mark sits inside that safe zone -->\n"))
        for src, out, px in PNGS:
            path = os.path.join(d, out)
            cairosvg.svg2png(url=os.path.join(d, src), write_to=path, output_width=px, output_height=px)
            Image.open(path).convert("RGB").save(path)
        open(os.path.join(root, folder, "manifest.webmanifest"), "w").write(manifest(folder))
        print("wrote", os.path.relpath(d, root), "and the manifest")

    # Contact sheet: each icon large, masked round as Android shows it, and at favicon size.
    names = list(GLYPHS)
    cell, pad = 220, 24
    sheet = Image.new("RGB", (pad + len(names) * (cell + pad), 2 * cell + 140), "#ffffff")
    dr = ImageDraw.Draw(sheet)
    for i, folder in enumerate(names):
        d = os.path.join(root, folder, "icons")
        x = pad + i * (cell + pad)
        big = Image.open(os.path.join(d, "icon-512.png")).resize((cell, cell), Image.LANCZOS)
        m = Image.new("L", (cell, cell), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, cell - 1, cell - 1), radius=cell * 0.22, fill=255)
        sheet.paste(big, (x, pad), m)
        mk = Image.open(os.path.join(d, "icon-maskable-512.png")).resize((cell, cell), Image.LANCZOS)
        c = Image.new("L", (cell, cell), 0); ImageDraw.Draw(c).ellipse((0, 0, cell - 1, cell - 1), fill=255)
        sheet.paste(mk, (x, cell + 2 * pad), c)
        for j, s in enumerate((32, 16)):
            sheet.paste(Image.open(os.path.join(d, f"favicon-{s}.png")), (x + j * 48, 2 * cell + 3 * pad))
        dr.text((x + 100, 2 * cell + 3 * pad + 8), "puzzling" if folder == "." else folder, fill="#333333")
    out = os.path.join(root, "tools", "icons-preview.png")
    sheet.save(out)
    print("wrote tools/icons-preview.png")
