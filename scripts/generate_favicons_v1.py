"""Generate site favicons from the Fee Auditor FA logo."""
from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image

SRC = Path(
    r"C:\Users\ksant\.cursor\projects\c-project\assets"
    r"\c__Users_ksant_AppData_Roaming_Cursor_User_workspaceStorage"
    r"_3cc614202410d0027f2ce616f7f43f99_images"
    r"_feeauditor-icon-128x128-dae2ba87-aa9d-4087-861f-9dafbe1afd5c.png"
)
OUT = Path(__file__).resolve().parents[1] / "public"


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    print("source", img.size, img.mode)

    img.resize((128, 128), Image.Resampling.LANCZOS).save(OUT / "icon-128.png", optimize=True)

    for size, name in [
        (16, "favicon-16.png"),
        (32, "favicon-32.png"),
        (48, "favicon-48.png"),
        (180, "apple-touch-icon.png"),
        (192, "icon-192.png"),
        (512, "icon-512.png"),
    ]:
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        if size == 180:
            bg = Image.new("RGBA", (size, size), (0, 0, 0, 255))
            bg.alpha_composite(resized)
            resized = bg
        resized.save(OUT / name, optimize=True)
        print("wrote", name, (OUT / name).stat().st_size)

    ico_sizes = [16, 32, 48]
    ico_images = [img.resize((s, s), Image.Resampling.LANCZOS) for s in ico_sizes]
    ico_images[-1].save(
        OUT / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[:-1],
    )
    print("wrote favicon.ico", (OUT / "favicon.ico").stat().st_size)

    buf = io.BytesIO()
    img.resize((128, 128), Image.Resampling.LANCZOS).save(buf, format="PNG", optimize=True)
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
