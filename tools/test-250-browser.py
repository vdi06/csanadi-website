#!/usr/bin/env python3
"""2.50 – valós DOM-mal, izolált helyi fájlforgalommal végzett funkcionális és vizuális Chromium minőségellenőrzés.
Megjegyzés: a CDN-hálózatot nem ellenőrzi, a biztonsági sandbox tiltja a localhost-navigációt.
"""
from pathlib import Path
import json,mimetypes
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
D=json.loads((R/'shared/data/site.json').read_text('utf8'))
O=Path('/mnt/data/Csanadi_2.50_qa');O.mkdir(parents=True,exist_ok=True)
checks=0

def ck(b,label):
 global checks
 if not b:raise AssertionError(label)
 checks+=1

def serve(route):
 key=route.request.url.split('csanadi-local.test/',1)[-1].split('?',1)[0].split('#',1)[0]
 file=(R/(key or 'index.html')).resolve()
 if not file.is_relative_to(R) or not file.is_file():return route.fulfill(status=404,body='Missing file')
 return route.fulfill(status=200,body=file.read_bytes(),headers={'content-type':mimetypes.guess_type(file.name)[0] or 'application/octet-stream','access-control-allow-origin':'*'})

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for name,width,height,theme in [('desktop-dark',1440,900,'dark'),('desktop-light',1024,768,'light'),('mobile-dark',390,844,'dark'),('mobile-light',320,700,'light'),('desktop-edge',768,1024,'dark'),('mobile-edge',767,850,'light')]:
  platform='mobile' if width<768 else 'desktop'
  ctx=browser.new_context(viewport={'width':width,'height':height},color_scheme=theme,has_touch=platform=='mobile',is_mobile=platform=='mobile',reduced_motion='reduce')
  ctx.route('https://csanadi-local.test/**',serve);ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())
  page=ctx.new_page();runtime=[];network=[]
  page.on('pageerror',lambda e:runtime.append(str(e)))
  page.on('response',lambda resp:network.append((resp.status,resp.url)) if resp.status>=400 and 'csanadi-local' in resp.url else None)
  wrapper=f'''<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://csanadi-local.test/"><link rel="stylesheet" href="shared/css/base.css?v={D['release']}"></head><body><div id="app"></div><script type="module" src="shared/js/entry.js?v={D['release']}"></script></body></html>'''
  page.goto('about:blank#/');page.set_content(wrapper)
  page.locator('.gate-door-button').wait_for(timeout=20000)
  ck(page.locator('.gate-skip').count()==0, name+' gate skip absent')
  ck(page.locator('.gate-frame').count()==30, name+' gate 30 frames')
  page.evaluate('location.hash="#/kezdolap"');page.locator(f'.{platform}-successes-card').first.wait_for(timeout=25000)
  heading=page.locator(f'.{platform}-successes-heading h2').inner_text()
  ck('bemutatóadatok' in heading.lower(), name+' sample heading')
  ck(page.locator(f'.{platform}-successes-card').count()==6, name+' six highlighted success cards')
  ck(page.locator(f'.{platform}-successes-card-sample').count()==6, name+' all six sample badges')
  ck(page.locator(f'.{platform}-successes-card').first.get_attribute('aria-label').startswith('MINTA'), name+' card accessible sample name')
  card=page.locator(f'.{platform}-successes-card').first
  card.scroll_into_view_if_needed(timeout=20000)
  page.wait_for_function('(selector)=>{let i=document.querySelector(selector);return !!i && i.complete && i.naturalWidth>0}',arg=f'.{platform}-successes-card-image',timeout=10000)
  ck(not page.evaluate('document.documentElement.scrollWidth > innerWidth + 3'),name+' home no horizontal overflow')
  if name in ('desktop-dark','mobile-light'):
   page.locator(f'.{platform}-successes-section').screenshot(path=str(O/f'sportsikerek-{name}.png'),animations='disabled')
  card.click()
  dialog=page.locator(f'.{platform}-successes-dialog');dialog.wait_for()
  ck(page.locator('.successes-verification-warning').count()==1,name+' detail verification warning')
  ck('nem hitelesített' in page.locator('.successes-verification-warning').inner_text().lower(), name+' plain verification text')
  if name in ('desktop-dark','mobile-light'):
   dialog.screenshot(path=str(O/f'sportsikerek-reszlet-{name}.png'),animations='disabled')
  page.keyboard.press('Escape')
  ck(page.locator(f'.{platform}-successes-overlay').is_hidden(), name+' dialog escape close')
  ck(card.evaluate('(e)=>document.activeElement===e'), name+' detail restores focus')
  footer=page.locator('.footer-contact-main a[href^="mailto:"]')
  bbox=footer.bounding_box()
  ck(bbox['height']>=26,name+' footer mail hit target min 26px')
  ck(page.locator('.site-footer').bounding_box()['height']< (230 if platform=='mobile' else 160),name+' footer compact')
  ck(page.locator('a[href*="'+'csanadi-'+'bp.edu.hu'+'"]').count()==0,name+' no former school links')
  opener=page.locator(f'.{platform}-search-toggle');opener.click()
  inp=page.locator(f'.{platform}-search-input');inp.fill('Nagy Lilla')
  page.locator(f'.{platform}-search-result').first.wait_for(timeout=12000)
  ck(page.locator(f'.{platform}-search-result-title').first.inner_text().startswith('MINTA'),name+' sample label in search results')
  ck('mintabejegyzés' in page.locator(f'.{platform}-search-result-summary').first.inner_text().lower(),name+' sample search summary')
  page.keyboard.press('Escape')
  ck(opener.evaluate('(e)=>document.activeElement===e'),name+' search focus restored')
  # Narrow viewports and one of the longer routes
  page.evaluate('location.hash="#/oldal/information-documents"')
  page.locator(f'.{platform}-page-title').wait_for(timeout=10000)
  ck(not page.evaluate('document.documentElement.scrollWidth>innerWidth+3'),name+' documents no overflow')
  page.evaluate('location.hash="#/oldal/sports-gallery"')
  page.locator(f'.{platform}-page-title').wait_for(timeout=10000)
  ck(not page.evaluate('document.documentElement.scrollWidth>innerWidth+3'),name+' gallery no overflow')
  ck(not runtime, name+' JS runtime errors '+str(runtime[:3]))
  ck(not network, name+' local file missing '+str(network[:3]))
  page.screenshot(path=str(O/f'{name}-gallery.png'),animations='disabled',full_page=False)
  print(name,': passed; cumulative',checks,flush=True)
  ctx.close()
 # Real animation: no reduced motion, click the actual gate instead of hash bypass
 ctx=browser.new_context(viewport={'width':1280,'height':800},reduced_motion='no-preference')
 ctx.route('https://csanadi-local.test/**',serve);ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 wrapper=f'''<!doctype html><html lang="hu"><head><meta charset="utf-8"><base href="https://csanadi-local.test/"><link rel="stylesheet" href="shared/css/base.css?v={D['release']}"></head><body><div id="app"></div><script type="module" src="shared/js/entry.js?v={D['release']}"></script></body></html>'''
 page.goto('about:blank#/');page.set_content(wrapper)
 btn=page.locator('.gate-door-button');btn.wait_for(timeout=20000)
 btn.click()
 page.locator('.desktop-home-highlights').wait_for(timeout=25000)
 ck(page.locator('.gate-screen').count()==0,'animated gate entered home')
 ck(page.evaluate('location.hash==="#/kezdolap"'),'gate changes route to homepage')
 ck(not errors,'animated gate has no page errors '+str(errors))
 ctx.close();browser.close()
print(f'2.50 CUSTOM BROWSER QA: {checks}/{checks} PASSED')
