"""Regenerate the social card from the existing Silverspark print mark."""
from PIL import Image, ImageDraw, ImageFont, ImageOps
from pathlib import Path
root = Path(__file__).resolve().parents[1]
card = Image.new('RGB',(1200,630),'#0e1828')
draw = ImageDraw.Draw(card)
def font(size, bold=False):
    return ImageFont.truetype('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf',size)
mark = ImageOps.contain(Image.open(root/'src/assets/silverspark-mark-print.png').convert('RGBA'),(70,70))
draw.rounded_rectangle((72,62,166,156),radius=13,fill='#f7f8f9')
card.paste(mark,(119-mark.width//2,109-mark.height//2),mark)
draw.text((193,92),'SILVERSPARK CONSULTING',font=font(25,True),fill='#e5e9ef')
draw.line((72,195,1128,195),fill='#8793a3',width=2)
draw.text((64,220),'Compass',font=font(108,True),fill='white')
draw.text((72,389),'AI readiness for your business',font=font(42),fill='#edf1f5')
draw.text((72,532),'Strategy in Action',font=font(24),fill='#bbc4ce')
card.save(root/'src/assets/social-preview.png',optimize=True)
