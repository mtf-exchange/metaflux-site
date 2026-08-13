#!/usr/bin/env python3
"""Derive shots/desk.webp from shots/desk.png, and report what the page must say.

shoot-desk.mjs writes the PNG at devicePixelRatio 2, so the file is twice the
CSS size the <img> declares. Both formats ship: the WebP is what nearly every
visitor gets (roughly a third of the bytes), the PNG is the <picture> fallback.

Run after tools/shoot-desk.mjs. It prints the width/height attributes to paste
into index.html — those are load-bearing, not decoration: without them the
image has no intrinsic ratio until it downloads and the hero jumps when it
lands, which is the layout shift the whole page is otherwise built to avoid.
"""

import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(os.path.dirname(HERE), "shots")

png = os.path.join(SHOTS, "desk.png")
im = Image.open(png).convert("RGB")

# quality 90 is the point where the order book's 11px numerals stop showing
# ringing on their stems; below it the type is visibly soft at 1x.
im.save(os.path.join(SHOTS, "desk.webp"), "WEBP", quality=90, method=6)
im.save(png, "PNG", optimize=True)

css_w, css_h = im.width // 2, im.height // 2
for name in ("desk.webp", "desk.png"):
    kb = round(os.path.getsize(os.path.join(SHOTS, name)) / 1024)
    print(f"{name:10} {kb:>5} KB")
print(f"\nintrinsic {im.width}x{im.height} (DPR 2)  →  put in index.html:")
print(f'  width="{css_w}" height="{css_h}"')
