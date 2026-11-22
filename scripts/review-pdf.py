"""Build a visual review sheet from the synthetic browser export in CI."""
from pathlib import Path
from base64 import b64encode
import io
from PIL import Image, ImageOps, ImageDraw, ImageFont

proof = Path.cwd()
pages = sorted(proof.glob("page-*.jpg"))
assert pages, "No rendered report pages"
tiles = []
for path in pages:
    with Image.open(path) as page:
        tiles.append(ImageOps.contain(page.convert("RGB"), (320, 458)))
sheet = Image.new("RGB",(3*336, ((len(tiles)+2)//3)*478), "#c6cbd3")
for i, tile in enumerate(tiles):
    sheet.paste(tile, (8+(i%3)*336, 8+(i//3)*478))
sheet.save(proof/"contact-sheet.jpg",quality=82)
# Only synthetic public test documents are emitted. Include a small preview for remote review.
small = io.BytesIO()
sheet.save(small, format="JPEG", quality=65)
print("COMPASS_SYNTHETIC_PREVIEW="+b64encode(small.getvalue()).decode())

