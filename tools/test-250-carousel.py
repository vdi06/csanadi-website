#!/usr/bin/env python3
"""A 30 másodperces Carousel időzítésének gyorsított böngészőórás vizsgálata."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,mimetypes
R=Path(__file__).resolve().parent.parent
C=json.loads((R/'shared/data/site.json').read_text('utf8'))
N=0
def ck(v,msg):
 global N
 if not v:raise AssertionError(msg)
 N+=1
def serve(route):
 path=route.request.url.split('csanadi-local.test/',1)[-1].split('?',1)[0].split('#',1)[0]
 file=(R/(path or 'index.html')).resolve()
 if not file.is_file() or not file.is_relative_to(R):return route.fulfill(status=404,body='not found')
 route.fulfill(status=200,body=file.read_bytes(),headers={'content-type':mimetypes.guess_type(file.name)[0] or 'application/octet-stream'})
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1440,900),(390,844)]:
  plat='mobile' if width<768 else 'desktop'
  ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=plat=='mobile',has_touch=plat=='mobile',reduced_motion='no-preference')
  ctx.route('https://csanadi-local.test/**',serve);ctx.route('https://cdn.jsdelivr.net/**',lambda route:route.abort())
  page=ctx.new_page();page.clock.install()
  html=f'<!doctype html><html lang="hu"><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://csanadi-local.test/"><link rel="stylesheet" href="shared/css/base.css?v={C["release"]}"></head><body><div id="app"></div><script type="module" src="shared/js/entry.js?v={C["release"]}"></script></body></html>'
  page.goto('about:blank#/');page.set_content(html);page.locator('.gate-door-button').wait_for(timeout=20000)
  page.evaluate('location.hash="#/kezdolap"');s=page.locator('.home-feature-carousel');s.wait_for(timeout=20000)
  s.scroll_into_view_if_needed();page.wait_for_timeout(600)
  selected=lambda: page.locator('.home-carousel-tab[aria-selected="true"]').get_attribute('data-panel-type')
  ck(selected()=='successes',plat+' initial slide')
  page.clock.fast_forward(31000);page.wait_for_timeout(250)
  ck(selected()=='calendar',plat+' autoplayer advances in 30s')
  p=page.locator('.home-carousel-pause');p.click();ck(p.get_attribute('aria-pressed')=='true',plat+' pause sets pressed')
  page.clock.fast_forward(35000);page.wait_for_timeout(200)
  ck(selected()=='calendar',plat+' pause stops 30s rotation')
  p.click();ck(p.get_attribute('aria-pressed')=='false',plat+' resumed status')
  print(plat,'PASS',flush=True)
  ctx.close()
 browser.close()
print(f'2.50 CAROUSEL: {N}/{N} PASS')
