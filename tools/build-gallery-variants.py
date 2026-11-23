#!/usr/bin/env python3
"""2.45: ellenőrzött forrás-illusztrációk 400/800/1280 képernyőszélességű WebP-változatai.
Használat: python tools/build-gallery-variants.py [--check]
Kizárólag a helyi site.json forrásfájljait kezeli. Pillow csak a fejlesztési munkakörnyezetben kell.
"""
from PIL import Image,ImageOps
from pathlib import Path
import json,sys
R=Path(__file__).resolve().parent.parent
D=json.loads((R/'shared/data/site.json').read_text())
check='--check' in sys.argv
count=0
for item in D['mediaCenter']['items']:
    src=(R/item['src'].removeprefix('./')).resolve()
    assert src.is_relative_to(R/'shared/assets/media/web') and src.exists(),item['id']
    with Image.open(src) as original:
        if not check: original=ImageOps.exif_transpose(original.convert('RGB'))
        for w in (400,800,1280):
            target=(R/item['responsive'][str(w)].removeprefix('./')).resolve()
            assert target.is_relative_to(R/'shared/assets/media/gallery'),str(target)
            if check:
                assert target.is_file() and target.stat().st_size>800 and Image.open(target).size[0]==w,(item['id'],w)
            else:
                target.parent.mkdir(parents=True,exist_ok=True)
                h=round(original.height*w/original.width)
                im=original.resize((w,h),Image.Resampling.LANCZOS)
                im.save(target,'WEBP',quality={400:73,800:76,1280:79}[w],method=5)
            count+=1
print(f'Galéria: {count} válaszoló WebP fájl '+('ellenőrizve' if check else 'generálva'))
