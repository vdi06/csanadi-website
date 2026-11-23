#!/usr/bin/env python3
import json,mimetypes,collections,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent; C=json.loads((R/'shared/data/site.json').read_text('utf8'))
PAGES=[c['id'] for m in C['menu']['items'] for c in m['children']]
AUDIT=Path('/mnt/data/_csanadi250_testlogs');AUDIT.mkdir(exist_ok=True)
issues=[]; observations=[]
def serve(route):
 try:
  path=route.request.url.split('csanadi-local.test/',1)[-1].split('?',1)[0].split('#',1)[0]
  file=(R/(path or 'index.html')).resolve()
  if not file.is_relative_to(R) or not file.is_file():route.fulfill(status=404,body='missing');return
  route.fulfill(status=200,body=file.read_bytes(),headers={'content-type':mimetypes.guess_type(file.name)[0] or 'text/plain','access-control-allow-origin':'*'})
 except Exception as e: print('route failed',e)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height,scheme in [(1440,900,'dark'),(390,844,'light')]:
  plat='desktop' if width>=768 else 'mobile'; name=f'{plat}-{scheme}'
  ctx=browser.new_context(viewport={'width':width,'height':height},color_scheme=scheme,is_mobile=plat=='mobile',has_touch=plat=='mobile',reduced_motion='reduce')
  ctx.route('https://csanadi-local.test/**',serve);ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())
  page=ctx.new_page();error=[]; responses=[]
  page.on('pageerror',lambda ex:error.append(str(ex)))
  page.on('response',lambda resp:responses.append({'status':resp.status,'url':resp.url}) if resp.status>=400 and 'csanadi-local' in resp.url else None)
  html=f'''<!doctype html><html lang="hu"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="https://csanadi-local.test/"><link rel="stylesheet" href="shared/css/base.css?v={C['release']}"></head><body><div id="app"></div><script type="module" src="shared/js/entry.js?v={C['release']}"></script></body></html>'''
  page.goto('about:blank#/');page.set_content(html);page.locator('.gate-door-button').wait_for(timeout=10000)
  for id in ['kezdolap']+PAGES:
   u='#/kezdolap' if id=='kezdolap' else '#/oldal/'+id
   page.evaluate('(v)=>location.hash=v',u)
   page.wait_for_function('(arg)=>document.querySelector("main") && (arg.id==="kezdolap" ? document.querySelector(".home-carousel-tab"):document.querySelector("."+arg.plat+"-page-title"))',arg={'id':id,'plat':plat},timeout=10000)
   try:
    row=page.evaluate('''() => {
      const vis=e=>{const st=getComputedStyle(e),r=e.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0&&!e.closest('[hidden],[inert]')};
      const bad={}; const dups=Array.from(document.querySelectorAll('[id]')).map(e=>e.id).filter(Boolean).filter((id,i,a)=>a.indexOf(id)!==i);
      bad.dupIds=[...new Set(dups)]; bad.h1=[...document.querySelectorAll('h1')].filter(vis).map(e=>e.textContent.trim().slice(0,90));
      bad.unnamedLinks=[...document.querySelectorAll('a')].filter(vis).filter(e=>!((e.getAttribute('aria-label')||e.getAttribute('title')||e.textContent||'').trim())&&!e.querySelector('img[alt]:not([alt=""])')).map(e=>e.outerHTML.slice(0,160));
      bad.unnamedButtons=[...document.querySelectorAll('button')].filter(vis).filter(e=>!((e.getAttribute('aria-label')||e.getAttribute('title')||e.textContent||'').trim())).map(e=>e.outerHTML.slice(0,160));
      bad.badHref=[...document.querySelectorAll('a[href]')].filter(vis).filter(e=>['#','', 'javascript:void(0)'].includes(e.getAttribute('href'))).map(e=>e.outerHTML.slice(0,160));
      bad.images=[...document.querySelectorAll('img')].filter(vis).map(e=>({src:e.currentSrc||e.src, loaded:e.complete&&e.naturalWidth>0,alt:e.getAttribute('alt')}));
      bad.imagesBroken=bad.images.filter(e=>!e.loaded);
      bad.smallTargets=[...document.querySelectorAll('button,a,[role=button]')].filter(vis).filter(e=>{let r=e.getBoundingClientRect();return (r.width<24||r.height<24) && !e.closest('.home-carousel-track')}).map(e=>({c:e.className,txt:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30),w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)})).slice(0,15);
      bad.overflow=document.documentElement.scrollWidth-innerWidth;
      return bad;
    }''')
    observations.append({'case':name,'page':id,'data':row})
    for k in ['dupIds','unnamedLinks','unnamedButtons','badHref']:
     if row[k]:issues.append((name,id,k,row[k][:3]))
    if row['overflow']>3:issues.append((name,id,'overflow',row['overflow']))
    if len(row['h1'])!=1:issues.append((name,id,'h1',row['h1']))
    if row['smallTargets'] and id in ['kezdolap','information-documents','sports-gallery','admission-faq','news-calendar']:issues.append((name,id,'smallTargets',row['smallTargets'][:5]))
    if row['imagesBroken'] and id in ['kezdolap','sports-gallery','sports-disciplines']:issues.append((name,id,'imagesBroken',row['imagesBroken'][:3]))
   except Exception as ex:issues.append((name,id,'probeError',str(ex)[:200]))
  issues.append((name,'ALL','pageerrors',error[:5])) if error else None
  issues.append((name,'ALL','http_errors',responses[:10])) if responses else None
  ctx.close()
 browser.close()
(AUDIT/'audit-initial.json').write_text(json.dumps({'issues':issues,'observations':observations},ensure_ascii=False,indent=2),encoding='utf8')
print('ISSUES',len(issues))
for issue,count in collections.Counter((x[0],x[2],str(x[3])[:80]) for x in issues).most_common(50):print(count,issue)
