#!/usr/bin/env python3
"""2.48 célzott négyféle böngészős teljes oldalbejárás, tényleges JS/CSS modullal.
A CDN-hálózati próbát nem helyettesíti; lokális, izolált Chromium teszt.
"""
from pathlib import Path
import json,mimetypes,os
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
C=json.loads((R/'shared/data/site.json').read_text('utf-8'))
LEAVES=[(g['label'],p['id'],p['label']) for g in C['menu']['items'] for p in g['children']]
COUNT=0
out=Path('/mnt/data/Csanadi_2.48_qa');out.mkdir(exist_ok=True)

def check(value,message):
 global COUNT
 if not value:raise AssertionError(message)
 COUNT+=1

def route_file(route):
 u=route.request.url
 relative=u.split('csanadi-local.test/',1)[-1].split('?',1)[0].split('#',1)[0]
 p=(R/relative).resolve()
 if not p.is_relative_to(R) or not p.is_file():route.fulfill(status=404,body='not found',headers={'access-control-allow-origin':'*'});return
 route.fulfill(status=200,body=p.read_bytes(),headers={'content-type':mimetypes.guess_type(p.name)[0] or 'text/plain','access-control-allow-origin':'*','cache-control':'no-store'})

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,width,height,scheme in [('desktop-dark',1440,900,'dark'),('desktop-light',1024,800,'light'),('mobile-dark',390,844,'dark'),('mobile-light',320,700,'light')]:
  platform='mobile' if width<768 else 'desktop'
  ctx=browser.new_context(viewport={'width':width,'height':height},color_scheme=scheme,is_mobile=platform=='mobile',has_touch=platform=='mobile',reduced_motion='reduce')
  ctx.route('https://csanadi-local.test/**',route_file)
  ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  wrapper=f'''<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://csanadi-local.test/"><link rel="stylesheet" href="shared/css/base.css?v={C['release']}"></head><body><div id="app"></div><script type="module" src="shared/js/entry.js?v={C['release']}"></script></body></html>'''
  page.goto('about:blank#/');page.set_content(wrapper)
  page.locator('.gate-door-button').wait_for(timeout=20000)
  check(page.locator('.gate-skip').count()==0,f'{name}: unexpected gate skip')
  check(page.locator('.gate-frame').count()==30,f'{name}: gate frames')
  page.evaluate("location.hash='#/kezdolap'")
  page.locator(f'.{platform}-home').wait_for(timeout=20000)
  check(page.locator('.home-carousel-tab').count()==3,f'{name}: homepage carousel')
  for _,id,label in LEAVES:
   page.evaluate(f"location.hash='#/oldal/{id}'")
   page.wait_for_function("(args)=>location.hash==='#/oldal/'+args.id && document.querySelector('.'+args.platform+'-page-title')?.textContent.trim()===args.label",arg={'id':id,'platform':platform,'label':label},timeout=15000)
   page.wait_for_timeout(12)
   heading=page.locator(f'.{platform}-page-title')
   check(heading.count()==1,f'{name}/{id}: page title count')
   check(heading.inner_text().strip()==label,f'{name}/{id}: title mismatch: {heading.inner_text()}')
   check(page.locator('.page-share-preview,.media-premium-share').count()==0,f'{name}/{id}: technical share link visible')
   check(page.locator('a[href*="csanadi-bp.edu.hu"]').count()==0,f'{name}/{id}: old school link')
   overflow=page.evaluate('document.documentElement.scrollWidth > innerWidth + 3')
   check(not overflow, f'{name}/{id}: overflow {page.evaluate("document.documentElement.scrollWidth")} > {width}')
   if id in {'school-history','school-introduction','information-contact','sports-olympic'}:
    check(page.locator(f'.{platform}-page-card').count()>=3,f'{name}/{id}: useful content not visible')
   if id in {'education-programs','sports-disciplines','news-community','education-exams','sports-facilities','education-years','news-events','education-community'}:
    check(page.locator(f'.{platform}-page-intro').count()==0,f'{name}/{id}: duplicated feature center intro')
   if id=='information-documents':
    check(page.locator(f'.{platform}-page-intro').count()==0,f'{name}/{id}: duplicated document intro')
   if id in {'school-history','sports-gallery','information-documents','education-programs'}:
    page.screenshot(path=str(out/f'{name}-{id}.png'),full_page=False)
  check(not errors, f'{name}: JS runtime errors: {errors[:4]}')
  print(f'{name}: 49/49 oldalt bejártam, 0 hiba, összes sikeres állítás eddig {COUNT}',flush=True)
  ctx.close()
 browser.close()
print('2.48 CHROMIUM QA:',COUNT,'/',COUNT,'SUCCESS',flush=True)
