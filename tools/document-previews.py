#!/usr/bin/env python3
"""Helyi, kiadás előtti PDF előnézetgenerálás a 2.40 dokumentumközponthoz.

Külső kiszolgálót nem igényel. Használat:
    pip install pymupdf pillow
    python tools/document-previews.py --write
A működő weboldal csak a generált WebP-ket, PDF-eket és JSON-t használja.
"""
import argparse, io, json
from pathlib import Path
import fitz
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
CONFIG=ROOT/'shared/data/site.json'
def process(write=False):
    config=json.loads(CONFIG.read_text(encoding='utf8'))
    total=0
    for item in config['documentCenter']['items']:
        if item['status']!='available' or item['kind']!='pdf':continue
        source=(ROOT/item['file'].removeprefix('./')).resolve()
        assert source.is_relative_to(ROOT/'shared/assets/documents') and source.is_file(), f"Hiányzik PDF: {source}"
        pdf=fitz.open(source)
        assert not pdf.needs_pass, f"Titkosított PDF nem publikálható: {source.name}"
        previews=[];text=[]
        for index,page in enumerate(pdf,1):
            dest=ROOT/'shared/assets/documents/previews'/f"{source.stem}_{index}.webp"
            if write:
                dest.parent.mkdir(exist_ok=True,parents=True)
                pix=page.get_pixmap(matrix=fitz.Matrix(1.45,1.45),alpha=False)
                Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(dest,'WEBP',quality=79,method=5)
            previews.append('./'+dest.relative_to(ROOT).as_posix())
            text.append(page.get_text().strip() or 'Ezen az oldalon nincs kinyerhető szöveg.')
        if write:
            item['pages']=previews;item['pageCount']=len(pdf);item['pageTexts']=text
        else:
            assert item.get('pages')==previews and item.get('pageCount')==len(pdf),f"Elavult előnézeti lista: {source}"
            assert all((ROOT/p.removeprefix('./')).is_file() for p in previews),f"Hiányzó előnézet: {source}"
        total+=len(pdf)
    if write:CONFIG.write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(f"PDF ellenőrzött oldalak: {total}; mód: {'előnézetgenerálás' if write else 'ellenőrzés'}")
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true')
    process(parser.parse_args().write)
