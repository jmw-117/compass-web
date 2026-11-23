"""Build a visual review sheet from the synthetic browser export in CI."""
from pathlib import Path
from base64 import b64encode
import io
import json
import subprocess
from PIL import Image, ImageOps, ImageDraw, ImageFont

proof = Path.cwd()
# Compare the independent browser preview with the actual text embedded in the export.
expected = json.loads((proof / "preview-content.json").read_text(encoding="utf-8"))

def extracted(*crop):
    text = subprocess.check_output(["pdftotext", "-raw", "-r", "72", *crop,
                                    "synthetic-report.pdf", "-"], encoding="utf-8")
    return "".join(text.split())

def verify_in_order(values, text):
    start = 0
    for value in values:
        needle = "".join(value.split())
        position = text.find(needle, start)
        assert needle and position >= 0, f"Missing or reordered PDF content: {value}"
        start = position + len(needle)

full = extracted()
for field in ("actions", "decisions", "metadata", "concerns"):
    verify_in_order(expected[field], full)
verify_in_order([expected["firstAction"]], full)
# Read each evidence column independently, including rows that wrap or cross pages.
verify_in_order(expected["prompts"], extracted("-x", "46", "-y", "0", "-W", "227", "-H", "842"))
verify_in_order(expected["answers"], extracted("-x", "285", "-y", "0", "-W", "266", "-H", "842"))
print(f"Verified preview/PDF parity for {len(expected['actions'])} action lines and {len(expected['answers'])} answers.")

pages = sorted(proof.glob("page-*.jpg"))
assert len(pages) == 4
for i, title in enumerate(["Executive Decision", "Priority Action Plan", "Evidence & Methodology", "Source responses"], 1):
    verify_in_order([title], extracted("-f", str(i), "-l", str(i)))
tiles = []
for path in pages:
    with Image.open(path) as page:
        tiles.append(ImageOps.contain(page.convert("RGB"), (320, 458)))
sheet = Image.new("RGB",(2*336, ((len(tiles)+1)//2)*478), "#c6cbd3")
for i, tile in enumerate(tiles):
    sheet.paste(tile, (8+(i%2)*336, 8+(i//2)*478))
sheet.save(proof/"contact-sheet.jpg",quality=82)
# Only synthetic public test documents are emitted. Include a small preview for remote review.
small = io.BytesIO()
sheet.save(small, format="JPEG", quality=65)
print("COMPASS_SYNTHETIC_PREVIEW="+b64encode(small.getvalue()).decode())

