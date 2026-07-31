"""Generate site favicons from the Fee Auditor FA logo.

Small sizes crop tightly to the FA letters (no corner brackets) and scale
the mark up so it reads in 16–32px tabs/bookmarks.
"""
from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image, ImageFilter

SRC = Path(
    r"C:\Users\ksant\.cursor\projects\c-project\assets"
    r"\c__Users_ksant_AppData_Roaming_Cursor_User_workspaceStorage"
    r"_3cc614202410d0027f2ce616f7f43f99_images"
    r"_feeauditor-icon-128x128-dae2ba87-aa9d-4087-861f-9dafbe1afd5c.png"
)
OUT = Path(__file__).resolve().parents[1] / "public"
BG = (0, 0, 0, 255)
# Empirically measured FA glyph bounds in the 128 source (excludes corner brackets).
FA_BOX = (28, 34, 104, 94)  # left, top, right, bottom
FILL = 0.92  # how much of the canvas the FA mark should occupy


def lift_dark_blues(im: Image.Image) -> Image.Image:
    """Raise navy 'F' luminance so it doesn't vanish on black at 16–32px."""
    out = im.copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 128:
                continue
            # Dark navy glyph pixels (not the bright A / checkmark).
            if b >= r and b >= g and b < 120 and max(r, g, b) > 20:
                px[x, y] = (
                    min(255, int(r * 2.4) + 24),
                    min(255, int(g * 2.6) + 48),
                    min(255, int(b * 2.1) + 72),
                    a,
                )
    return out


def make_mark(src: Image.Image, size: int, *, boost_tiny: bool = False) -> Image.Image:
    crop = src.crop(FA_BOX)
    canvas = Image.new("RGBA", (size, size), BG)

    target = max(1, int(size * FILL))
    # Keep aspect ratio of the FA crop.
    cw, ch = crop.size
    scale = min(target / cw, target / ch)
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    mark = crop.resize((nw, nh), Image.Resampling.LANCZOS)

    if boost_tiny and size <= 48:
        mark = lift_dark_blues(mark)
        mark = mark.filter(ImageFilter.SHARPEN)

    x = (size - nw) // 2
    y = (size - nh) // 2
    canvas.alpha_composite(mark, (x, y))
    return canvas


def main() -> None:
    src = Image.open(SRC).convert("RGBA")
    print("source", src.size, "fa_box", FA_BOX)

    # Keep a larger master for PWA / schema; still zoomed for consistency.
    make_mark(src, 128).save(OUT / "icon-128.png", optimize=True)

    for size, name in [
        (16, "favicon-16.png"),
        (32, "favicon-32.png"),
        (48, "favicon-48.png"),
        (180, "apple-touch-icon.png"),
        (192, "icon-192.png"),
        (512, "icon-512.png"),
    ]:
        mark = make_mark(src, size, boost_tiny=True)
        mark.save(OUT / name, optimize=True)
        print("wrote", name, (OUT / name).stat().st_size)

    ico_sizes = [16, 32, 48]
    ico_images = [make_mark(src, s, boost_tiny=True) for s in ico_sizes]
    ico_images[-1].save(
        OUT / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[:-1],
    )
    print("wrote favicon.ico", (OUT / "favicon.ico").stat().st_size)

    master = make_mark(src, 128)
    buf = io.BytesIO()
    master.save(buf, format="PNG", optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" '
        'role="img" aria-label="Fee Auditor">\n'
        f'  <image href="data:image/png;base64,{b64}" width="128" height="128" />\n'
        "</svg>\n"
    )
    (OUT / "favicon.svg").write_text(svg, encoding="utf-8")
    print("wrote favicon.svg", (OUT / "favicon.svg").stat().st_size)
    print("done")


if __name__ == "__main__":
    main()
