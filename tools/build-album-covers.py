#!/usr/bin/env python3
"""2.46: illusztrációkból készülő, egyedi, sötétkék–arany prémium WebP-albumborítók.
python tools/build-album-covers.py [--check]
"""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFilter
import json,sys
R=Path(__file__).resolve().parent.parent
C=json.loads((R/'shared/data/site.json').read_text())
items={x['id']:x for x in C['mediaCenter']['items']}
check='--check' in sys.argv
count=0
for dimension,albums in C['mediaCenter']['albums'].items():
    for album in albums:
        if not album.get('coverId'):continue
        cover=items[album['coverId']]
        dest=R/f'shared/assets/media/gallery/covers/{dimension}-{album["id"]}.webp'
        assert album.get('cover')=='./'+dest.relative_to(R).as_posix(),album['id']
        if check:
            with Image.open(dest) as image:assert image.format=='WEBP' and image.size==(1200,690)
        else:
            src=R/cover['responsive']['1280'].removeprefix('./')
            with Image.open(src) as source:
                im=ImageOps.fit(source.convert('RGB'),(1200,690),Image.Resampling.LANCZOS)
            overlay=Image.new('RGBA',im.size,(0,0,0,0));draw=ImageDraw.Draw(overlay)
            for y in range(690):
                shade=int(10+75*(y/689)**2)
                draw.line((0,y,1200,y),fill=(3,17,34,shade),width=1)
            draw.polygon([(930,0),(1170,0),(930,690),(730,690)],fill=(218,178,99,20))
            draw.line([(0,12),(180,12)],fill=(236,195,115,180),width=6)
            canvas=Image.alpha_composite(im.convert('RGBA'),overlay).convert('RGB')
            dest.parent.mkdir(parents=True,exist_ok=True)
            canvas.save(dest,'WEBP',quality=82,method=5)
        count+=1
print(f'2.46 egyedi albumborító: {count} WebP '+('ellenőrizve' if check else 'generálva'))
