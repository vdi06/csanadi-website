#!/usr/bin/env python3
"""A 49 oldal és a kezdőlap által megjelenített belső hash-hivatkozások vizsgálata."""
import json,mimetypes,collections,re
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
D=json.loads((R/'shared/data/site.json').read_text('utf8'))
IDS={p['id'] for g in D['menu']['items'] for p in g['children']}
links=set();pages=[];errors=[]
def serve(route):
 path=route.request.url.split('csanadi-local.test/',1)[-1].split('?',1)[0].split('#',1)[0]
 f=(R/(path or 'index.html')).resolve()
 if not f.is_file() or not f.is_relative_to(R):route.fulfill(status=404,body='missing');return
 route.fulfill(status=200,body=f.read_bytes(),headers={'content-type':mimetypes.guess_type(f.name)[0] or 'text/plain'})
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 ctx=b.new_context(reduced_motion='reduce')
 ctx.route('https://csanadi-local.test/**',serve);ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())
 page=ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 wrapper=f'<html lang="hu"><head><base href="https://csanadi-local.test/"><link rel="stylesheet" href="shared/css/base.css?v={D["release"]}"></head><body><div id="app"></div><script type="module" src="shared/js/entry.js?v={D["release"]}"></script></body></html>'
 page.goto('about:blank#/');page.set_content(wrapper);page.locator('.gate-door-button').wait_for(timeout=20000)
 for id in ['kezdolap',*sorted(IDS)]:
  page.evaluate('(v)=>location.hash=v',f'#/oldal/{id}' if id!='kezdolap' else '#/kezdolap')
  page.wait_for_function('(arg)=>!!document.querySelector(arg.sel)',arg={'sel':'.desktop-home-highlights' if id=='kezdolap' else '.desktop-page-title'},timeout=20000)
  links.update(page.locator('a[href^="#/"]').evaluate_all('els=>els.map(e=>e.getAttribute("href"))'))
  pages.append(id)
 ctx.close();b.close()
bad=[]
for l in sorted(links):
 if l in ('#/','#/kezdolap'):continue
 parts=l.split('/')
 if l.startswith('#/oldal/') and len(parts)>=3 and parts[2] in IDS:continue
 if l.startswith('#/kezdolap/') and len(parts)>=4:continue
 bad.append(l)
print('LINK AUDIT: pages',len(pages),'distinct internal links',len(links),'invalid',len(bad),'js errors',len(errors))
if bad:print('BAD',bad[:30])
if errors:print('ERRORS',errors[:5])
assert not bad and not errors
