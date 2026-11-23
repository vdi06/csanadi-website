#!/usr/bin/env python3
"""2.53 független kiadási integritás, CDN-SRI, verzió- és médiaellenőrzés."""
from pathlib import Path
from collections import Counter
from bs4 import BeautifulSoup
from PIL import Image
import json,re
R=Path(__file__).resolve().parent.parent
C=json.loads((R/'shared/data/site.json').read_text(encoding='utf8'))
assert C['release']=='2.53'
html=(R/'index.html').read_text(encoding='utf8')
soup=BeautifulSoup(html,'html.parser')
checks=0
def ck(ok,msg):
 global checks
 assert ok,msg
 checks+=1
assert soup.select_one('html[lang="hu"]')
ck(soup.select_one('meta[name=viewport]') is not None,'viewport')
ck(soup.select_one('meta[name=robots]')['content']=='noindex,follow','noindex test edition')
ck(soup.select_one('link[href="./shared/css/base.css?v=2.53"]') is not None,'css cache')
ck(soup.select_one('script[src="./shared/js/entry.js?v=2.53"]') is not None,'js cache')
css=soup.select_one('link[href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"]')
js=soup.select_one('script[src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"]')
ck(css is not None and css.get('integrity')=='sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB','official CSS SRI')
ck(js is not None and js.get('integrity')=='sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI','official JS SRI')
ck(css.get('crossorigin')=='anonymous' and js.get('crossorigin')=='anonymous','crossorigin on CDN')
ck(not list(R.rglob('*bootstrap*')), 'no local Bootstrap duplicates')
refs=[]
for folder in ('shared/js','desktop','mobile'):
 for f in (R/folder).glob('*.js'):
  s=f.read_text(encoding='utf8')
  for match in re.finditer(r'\?v=(\d+\.\d+)',s):refs.append((f.relative_to(R).as_posix(),match.group(1)))
ck(bool(refs) and all(v=='2.53' for _,v in refs),'all module query versions')
paths=list((R/'share/page').glob('*/index.html')) + list((R/'share/album').glob('*/*/index.html'))
ck(len(paths)==63,'63 static SEO previews')
for p in paths:
 h=p.read_text(encoding='utf8')
 ck('noindex' in h and '2.53' in h, 'SEO generation version '+p.as_posix())
 ck('csanadi-bp.edu.hu' not in h,'former website reference '+p.as_posix())
imgfiles=[p for p in (R/'shared/assets/media').rglob('*') if p.suffix.lower() in ['.jpg','.jpeg','.png','.webp']]
for file in imgfiles:
 with Image.open(file) as img:
  img.verify()
 ck(file.stat().st_size>150,'empty image '+file.as_posix())
files=[p for p in R.rglob('*') if p.is_file()]
ck(all(not str(p.relative_to(R)).startswith('node_modules/') for p in files),'no deps')
print(f'2.53 RELEASE CHECK: {checks}/{checks} PASSED; {len(refs)} module query versions, {len(paths)} previews, {len(imgfiles)} media images, {len(files)} files')
