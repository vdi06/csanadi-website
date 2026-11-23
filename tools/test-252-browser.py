#!/usr/bin/env python3
"""2.53 independent resilience/accessible UI QA. Load the ACTUAL index.html into Chromium about:blank
(sandbox prohibits HTTP navigation); first-party requests served from real extracted files. CDN aborted.
This is NOT a real CDN or real http://localhost end-to-end test.
"""
import json, os, mimetypes, re, time, urllib.parse, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
C=json.loads((R/'shared/data/site.json').read_text(encoding='utf8'))
REPORT=Path(os.getenv('CSANADI252_REPORT', '/mnt/data/Csanadi_2.53_qa'))
REPORT.mkdir(exist_ok=True,parents=True)
CASES=[]; checks=0; errors=[]; requests=[]
ORIGIN='https://csanadi-local.test/'
html=(R/'index.html').read_text(encoding='utf8').replace('<head>','<head><base href="'+ORIGIN+'">',1)

def check(expr,label):
 global checks
 if not expr: raise AssertionError(label)
 checks+=1

def serve(route):
 p=urllib.parse.urlsplit(route.request.url)
 rel=urllib.parse.unquote(p.path).lstrip('/') or 'index.html'
 f=(R/rel).resolve()
 if f.is_relative_to(R) and f.is_file():
  route.fulfill(status=200,body=f.read_bytes(),headers={'content-type':mimetypes.guess_type(f.name)[0] or 'application/octet-stream','access-control-allow-origin':'*'})
 else:
  requests.append((404,route.request.url))
  route.fulfill(status=404,body='missing')

def newpage(browser,width=390,height=844,scheme='light',route='#/kezdolap',fault=None,slow_ms=0):
 mobile=width<768
 ctx=browser.new_context(viewport={'width':width,'height':height},color_scheme=scheme,
  has_touch=mobile,is_mobile=mobile,reduced_motion='reduce')
 ctx.route('https://cdn.jsdelivr.net/**',lambda r:r.abort('blockedbyclient'))
 def intercept(r):
  path=urllib.parse.urlsplit(r.request.url).path
  if path.endswith('/shared/data/site.json') and fault:
   fault['count']=fault.get('count',0)+1
   if fault['count']<=fault.get('fail_first',0):
    if fault.get('invalid'):r.fulfill(status=200,body='{BROKEN',content_type='application/json');return
    if fault.get('abort'):r.abort('failed');return
    r.fulfill(status=503,body='temporarily unavailable');return
  if slow_ms and (path.endswith('.js') or path.endswith('.css')):time.sleep(slow_ms/1000)
  serve(r)
 ctx.route('https://csanadi-local.test/**',intercept)
 page=ctx.new_page();page.on('pageerror',lambda exc:errors.append(str(exc)))
 page.goto('about:blank'+route)
 page.set_content(html,wait_until='domcontentloaded')
 return ctx,page

def visible_a11y(page):
 return page.evaluate('''() => {
  const shown=e=>{const s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&!e.closest('[inert],[aria-hidden=true]')&&e.getClientRects().length>0};
  const invalid=[];
  for(const el of document.querySelectorAll('button,a[href],input,select,textarea')){
   if(!shown(el))continue;
   const tag=el.tagName.toLowerCase();
   const accessibleName=(el.getAttribute('aria-label')||el.getAttribute('title')||el.innerText||el.textContent||el.getAttribute('alt')||'').trim();
   const hasLabel=el.labels?.length>0||el.getAttribute('aria-labelledby')||el.getAttribute('placeholder');
   if((tag==='button'||tag==='a')&&!accessibleName)invalid.push(tag+':'+el.outerHTML.slice(0,150));
   if(['input','select','textarea'].includes(tag)&&el.type!=='hidden'&&!accessibleName&&!hasLabel)invalid.push(tag+':'+el.outerHTML.slice(0,150));
  }
  let blankImgs=[];
  for (const e of document.images){if(shown(e)&&!e.hasAttribute('alt'))blankImgs.push(e.outerHTML.slice(0,100))}
  const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
  const dup=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  return {invalid,blankImgs,dup,scroll:document.documentElement.scrollWidth-innerWidth,h1:[...document.querySelectorAll('h1')].filter(shown).length};
 }''')

with sync_playwright() as playwright:
 browser=playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 # 1. Exact index HTML, four browsers, keyboard accessibility, sample routes.
 for w,h,scheme in [(320,700,'light'),(390,844,'dark'),(768,1024,'light'),(1440,900,'dark')]:
  ctx,page=newpage(browser,w,h,scheme)
  pl='mobile' if w<768 else 'desktop'
  try:
   page.locator(f'.{pl}-home').wait_for(timeout=18000)
   check(page.title().startswith('Csanádi'),'title '+str(w))
   check(page.locator('.gate-skip').count()==0,'removed skip '+str(w))
   check(page.locator('.home-carousel-tab').count()==3,'carousel '+str(w))
   check(page.locator(f'.{pl}-search-toggle').count()==1,'search '+str(w))
   check(not page.evaluate('document.documentElement.scrollWidth>innerWidth+3'),'home overflow '+str(w))
   audit=visible_a11y(page)
   CASES.append({'type':'home_accessibility','width':w,'scheme':scheme,**audit})
   check(not audit['invalid'],'unnamed controls '+str(w)+':'+str(audit['invalid'][:5]))
   check(not audit['blankImgs'],'missing alt on rendered image '+str(w)+':'+str(audit['blankImgs'][:4]))
   check(not audit['dup'],'duplicate ids '+str(w)+':'+str(audit['dup'][:5]))
   page.locator(f'.{pl}-search-toggle').click()
   inp=page.locator(f'.{pl}-search-input');inp.fill('sport');
   check(page.locator(f'.{pl}-search-result').count()>0,'search results '+str(w))
   page.keyboard.press('Escape')
   check(page.locator(f'.{pl}-search-toggle').evaluate('e=>document.activeElement===e'),'search focus '+str(w))
   # Rapid resize / dynamic switching with async module imports.
   if w==390:
    for i,v in enumerate([769,320,1025,390,768,320,1440,390]):
     page.set_viewport_size({'width':v,'height':800})
     plat='mobile' if v<768 else 'desktop'
     page.locator(f'.{plat}-home').wait_for(timeout=10000)
     check(page.locator('link[data-platform-style]').count()==1,'style after resize #'+str(i))
     check(not page.evaluate('document.documentElement.scrollWidth>innerWidth+4'),'resize overflow #'+str(i))
   if w in (320,1440):
    for pageid in ['sports-gallery','information-documents','admission-secondary','education-programs','school-history','news-calendar']:
     page.evaluate('(r)=>location.hash=r','#/oldal/'+pageid)
     page.locator(f'.{pl}-page-title').wait_for(timeout=10000)
     st=visible_a11y(page)
     check(not st['invalid'],'a11y bad '+pageid+' '+str(st['invalid'][:5]))
     check(not st['dup'],'dups '+pageid+':'+str(st['dup'][:5]))
     check(st['scroll']<=3,'overflow '+pageid+' '+str(w))
     if pageid=='admission-secondary' and w==320:
      detail=page.locator('.mobile-admission-event').first
      detail.evaluate('(e)=>e.open=true')
      link=detail.locator('a.admission-mobile-link').first
      check(link.bounding_box()['height']>=30,'admission tap target >=30 px')
      steps=page.locator('.mobile-admission-process').first
      steps.evaluate('(e)=>e.open=true')
      check(steps.locator('a.admission-mobile-link').first.bounding_box()['height']>=30,'admission step link >=30 px')
   if w==390:
    page.evaluate("location.hash='#/oldal/sports-gallery'")
    page.locator('.mobile-media-center').wait_for(timeout=10000)
    page.locator('.mobile-media-grid button').first.click()
    dialog=page.locator('dialog.media-dialog')
    check(dialog.evaluate('e=>e.matches(":modal")'),'gallery dialog modal')
    page.keyboard.press('Tab')
    check(dialog.evaluate('e=>e.contains(document.activeElement)'),'gallery focus trap')
    page.keyboard.press('Escape')
    check(not dialog.evaluate('e=>e.open'),'gallery escape')
   check(not errors,'JS errors '+str(errors[-4:]))
   print('PASS original-index DOM',w,scheme,flush=True)
  finally:ctx.close()
 # 2. JSON response failures, manual recovery.
 for fault in [dict(fail_first=1,abort=True),dict(fail_first=1,invalid=True),dict(fail_first=1)]:
  ctx,page=newpage(browser,390,844,'dark',fault=fault)
  try:
   page.locator('.offline-screen').wait_for(timeout=14000)
   check(page.locator('.offline-retry').count()==1,'offline retry must exist')
   check(page.locator('.offline-title').inner_text()=='Átmeneti offline nézet','offline heading')
   page.locator('.offline-retry').click()
   page.locator('.mobile-home').wait_for(timeout=16000)
   check(page.locator('.offline-screen').count()==0,'offline removed')
   check(fault['count']>=2,'two json requests')
   CASES.append({'type':'offline_recovery','mode':('abort' if fault.get('abort') else 'bad-json' if fault.get('invalid') else '503'),'attempts':fault['count']})
   print('PASS recovery',CASES[-1],flush=True)
  finally:ctx.close()
 # 3. Intermittent CSS during breakpoint change must recover without reloading the page.
 ctx,page=newpage(browser,390,844,'dark')
 try:
  page.locator('.mobile-home').wait_for(timeout=14000)
  cssfault={'requests':0}
  def temporary_css_failure(r):
   cssfault['requests']+=1
   if cssfault['requests']==1:r.abort('failed')
   else:serve(r)
  ctx.route('https://csanadi-local.test/desktop/styles.css*',temporary_css_failure)
  page.set_viewport_size({'width':1440,'height':900})
  page.locator('.desktop-home').wait_for(timeout=9000)
  check(cssfault['requests']>=2,'must retry transient CSS failure')
  check(page.locator('link[data-platform-style]').count()==1,'only 1 active stylesheet after recovery')
  check(page.evaluate('document.documentElement.dataset.platform')=='desktop','correct platform after recovery')
  CASES.append({'type':'interrupted_platform_css','attempts':cssfault['requests'],'recovered':True})
  print('PASS CSS platform retry after first failure',flush=True)
 finally:ctx.close()
 # 4. Delayed delivery and rapid search/filter/modal interaction.
 for width in [320,1440]:
  ctx,page=newpage(browser,width,850,'light',route='#/oldal/sports-gallery',slow_ms=15)
  plat='mobile' if width<768 else 'desktop'
  try:
   page.locator(f'.{plat}-media-center').wait_for(timeout=24000)
   search=page.locator(f'.{plat}-media-search')
   grid=page.locator(f'.{plat}-media-grid')
   for i in range(12):
    search.fill('robotika')
    grid.locator('button').first.click()
    d=page.locator('dialog.media-dialog')
    check(d.evaluate('e=>e.open'), 'modal slow '+str(width))
    d.locator('.media-dialog-close').click()
    search.fill('')
    check(search.input_value()=='','search clears '+str(width))
    check(grid.locator('button').count()>1,'grid restored '+str(width))
   check(not page.evaluate('document.documentElement.scrollWidth>innerWidth+4'),'slow overflows')
   print('PASS slow delivery and rapid actions',width,flush=True)
  finally:ctx.close()
 browser.close()
print(json.dumps({'checks':checks,'cases':CASES,'errors':errors[:10],'missing_assets':requests[:15]},ensure_ascii=False,indent=2))
(REPORT/'test-252-report.json').write_text(json.dumps({'checks':checks,'cases':CASES,'errors':errors,'missing_assets':requests},ensure_ascii=False,indent=2),encoding='utf8')
