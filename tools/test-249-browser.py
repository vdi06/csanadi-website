#!/usr/bin/env python3
"""2.49: A kezdőlap, keresés, billentyűzet/fókusz, üres állapot, reszponzivitás tesztje.
Helyi Chromium eszköz-/hálózatszimuláció; nem élő CDN-es vagy képernyőolvasós audit.
"""
import json,mimetypes
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
C=json.loads((R/'shared/data/site.json').read_text(encoding='utf-8'))
P=Path('/mnt/data/Csanadi_2.49_qa');P.mkdir(exist_ok=True)
count=0

def ck(value,what):
 global count
 if not value: raise AssertionError(what)
 count+=1

def serve(route):
 name=route.request.url.split('csanadi-local.test/',1)[-1].split('?',1)[0].split('#',1)[0]
 file=(R/(name or 'index.html')).resolve()
 if not file.is_relative_to(R) or not file.is_file():
  route.fulfill(status=404,body='missing');return
 route.fulfill(status=200,body=file.read_bytes(),headers={'content-type':mimetypes.guess_type(file.name)[0] or 'text/plain','access-control-allow-origin':'*'})

with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height,scheme in [(1440,900,'dark'),(1024,768,'light'),(390,844,'dark'),(320,700,'light')]:
  plat='desktop' if width>=768 else 'mobile';name=f'{plat}-{scheme}-{width}'
  ctx=browser.new_context(viewport={'width':width,'height':height},color_scheme=scheme,is_mobile=plat=='mobile',has_touch=plat=='mobile',reduced_motion='reduce')
  ctx.route('https://csanadi-local.test/**',serve)
  ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())
  page=ctx.new_page(); errors=[]
  page.on('pageerror',lambda exc:errors.append(str(exc)))
  html=f'''<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://csanadi-local.test/"><link rel="stylesheet" href="shared/css/base.css?v={C['release']}"></head><body><div id="app"></div><script type="module" src="shared/js/entry.js?v={C['release']}"></script></body></html>'''
  page.goto('about:blank#/');page.set_content(html)
  page.locator('.gate-door-button').wait_for(timeout=25000)
  ck(page.locator('.gate-skip').count()==0,name+' no gate skip')
  ck(page.locator('.gate-frame').count()==30,name+' correct gate frames')
  page.evaluate("location.hash='#/kezdolap'")
  page.locator(f'.{plat}-home-highlights').wait_for(timeout=20000)
  section=page.locator(f'.{plat}-home-highlights')
  ck(section.locator('h2').inner_text()==C['home']['homeHighlights']['title'],name+' intro title')
  ck(section.locator('a').count()==3,name+' three quick links')
  ck(section.locator('a').evaluate_all('xs=>xs.every(x=>x.getAttribute("href")?.startsWith("#/oldal/"))'),name+' internal links')
  ck(page.locator('.home-carousel-tab').count()==3,name+' original carousel')
  ck(page.locator('.home-carousel-pause').count()==0,name+' pause button removed')
  ck(page.locator('.home-carousel-controls button').count()==3,name+' only 3 tabs')
  ck(not page.evaluate('document.documentElement.scrollWidth > innerWidth + 3'),name+' homepage overflow')
  if plat=='desktop':
   page.wait_for_function('document.querySelector(".desktop-hero-photo")?.naturalWidth>0',timeout=13000)
   ck(page.locator('.desktop-hero-photo').evaluate('e=>e.naturalWidth')>=500,name+' hero rendered')
  page.screenshot(path=str(P/f'{name}-home.png'),full_page=True)
  # Focused / search open
  opener=page.locator(f'.{plat}-search-toggle');opener.click()
  dialog=page.locator(f'.{plat}-search-dialog');dialog.wait_for()
  field=page.locator(f'.{plat}-search-input')
  ck(field.evaluate('(e)=>document.activeElement===e'),name+' focus on search input')
  ck(field.get_attribute('aria-controls')==f'{plat}-search-results-list',name+' search results accessible association')
  ck(page.locator(f'.{plat}-search-count').get_attribute('aria-live')=='polite',name+' accessible live count')
  ck(dialog.get_attribute('role')=='dialog' and dialog.get_attribute('aria-modal')=='true',name+' modal ARIA')
  field.fill('MINTA')
  filters=page.locator(f'.{plat}-search-category')
  ck(filters.count()>=2,name+' facets available')
  count_text=page.locator(f'.{plat}-search-count').inner_text()
  total=int(count_text.split()[0]); ck(total>50,name+' shows real >50 total')
  result=page.locator(f'.{plat}-search-result')
  ck(result.count()==12,name+' initial first 12')
  more=page.locator(f'.{plat}-search-more')
  ck(more.is_visible(),name+' load more available')
  more.click();ck(result.count()==24,name+' 24 results after load')
  ck(page.locator(f".{plat}-search-category[aria-pressed=\"true\"]").count()==1,name+' exactly one chosen facet')
  # Facet category with a less generic query
  field.fill('sport')
  page.screenshot(path=str(P/f'{name}-search.png'),full_page=False)
  filters=page.locator(f'.{plat}-search-category')
  ck(filters.count()>2,name+' cross-category query')
  chosen=filters.filter(has_text='Sport').last
  chosen.click()
  ck(chosen.get_attribute('aria-pressed')=='true',name+' facet active')
  ck(page.locator(f'.{plat}-search-count').inner_text().split()[0].isdigit(),name+' filtered count is numeric')
  # Empty states
  field.fill('zxcvb757575nonexisting')
  ck(result.count()==0,name+' empty results')
  ck(page.locator(f'.{plat}-search-empty').count()==1,name+' empty card')
  ck(page.locator(f'.{plat}-search-count').inner_text().startswith('0'),name+' 0 result')
  # Accessibility: tab trap and Escape focus restoration
  field.focus();page.keyboard.press('Shift+Tab')
  ck(page.evaluate('document.activeElement?.closest("[role=dialog]")!==null'),name+' focus trapped')
  page.keyboard.press('Escape')
  ck(page.locator(f'.{plat}-search-overlay').is_hidden(),name+' escape closed')
  ck(opener.evaluate('(e)=>document.activeElement===e'),name+' returned focus to opener')
  ck(not page.evaluate('document.documentElement.scrollWidth > innerWidth + 3'),name+' no overflow after modal')
  # Quicklink navigation and document title
  quick_href=section.locator('a').first.get_attribute('href')
  ck(quick_href=='#/oldal/education-programs',name+' quick link href')
  page.evaluate('(href)=>location.hash=href',quick_href)
  page.locator(f'.{plat}-page-title').wait_for(timeout=18000)
  ck(page.evaluate("location.hash==='\x23/oldal/education-programs'"),name+' quick link route')
  ck(not page.evaluate('document.documentElement.scrollWidth > innerWidth + 3'),name+' page no overflow')
  ck(not errors,name+' runtime console errors '+str(errors[:2]))
  print(name+f': SUCCESS, {count} cumulative checks',flush=True)
  ctx.close()
 browser.close()
print(f'2.49 CHROMIUM UI: {count}/{count} successful',flush=True)
