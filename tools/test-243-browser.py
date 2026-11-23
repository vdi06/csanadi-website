#!/usr/bin/env python3
"""Valódi Chromium-komponensteszt. about:blank + Blob modulok: a környezet blokkolja a helyi HTTP-címeket."""
from pathlib import Path
import json,re,os,shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
CFG=json.loads((ROOT/'shared/data/site.json').read_text(encoding='utf-8'))
OUT=Path(os.environ.get('CSANADI_QA','/tmp/csanadi_243_qa')); OUT.mkdir(parents=True,exist_ok=True)
pat=re.compile(r'([\'\"])(\.{1,2}/[^\'\"]+\.js(?:\?v=[0-9.]+)?)\1')
sources={}
order=[]
def visit(p):
 p=p.resolve(); key=p.relative_to(ROOT).as_posix()
 if key in sources:return
 sources[key]=None  # Előre rögzített modulazonosító: ciklikus ESM-importok támogatása.
 code=p.read_text(encoding='utf-8');deps={}
 for _,spec in pat.findall(code):
  target=(p.parent/spec.split('?')[0]).resolve()
  depkey=target.relative_to(ROOT).as_posix()
  visit(target)
  deps[spec]=depkey
 for old,dep in deps.items():
  code=code.replace('\"'+old+'\"','\"csanadi:'+dep+'\"').replace("'"+old+"'","'csanadi:"+dep+"'")
 sources[key]={'key':key,'src':code}
 order.append(sources[key])
for plat in ('desktop','mobile'):
 visit(ROOT/plat/'centers.js')
 visit(ROOT/plat/'app.js')
css=(ROOT/'shared/css/base.css').read_text()+'\n'+(ROOT/'desktop/styles.css').read_text()+'\n'+(ROOT/'mobile/styles.css').read_text()
js_import=r'''async (payload)=>{
  const urls={};
  for(const mod of payload.modules){
    urls[mod.key]=URL.createObjectURL(new Blob([mod.src],{type:'text/javascript'}));
  }
  const imports={};
  for(const [key,url] of Object.entries(urls))imports['csanadi:'+key]=url;
  const importmap=document.createElement('script');importmap.type='importmap';
  importmap.textContent=JSON.stringify({imports});document.head.append(importmap);
  const mod=await import(urls[payload.platform+'/centers.js']);
  window.__featureCreate=payload.platform==='desktop'?mod.createDesktopFeatureCenter:mod.createMobileFeatureCenter;
  window.__featureConfig=payload.config;
  window.__featureApp=await import(urls[payload.platform+'/app.js']);
  return true;
}'''
checks=0;issues=[]
def check(ok,msg):
 global checks
 checks+=1
 if not ok:issues.append(msg)
with sync_playwright() as p:
 executable=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('google-chrome')
 options={'executable_path':executable} if executable else {}
 b=p.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'],**options)
 for width,platform,theme in [(1440,'desktop','dark'),(1440,'desktop','light'),(390,'mobile','dark'),(390,'mobile','light'),(320,'mobile','dark')]:
  page=b.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
  page.set_content('<!doctype html><html lang="hu"><head><meta charset="utf-8"><style>'+css+'</style></head><body><main id="feature-root"></main></body></html>')
  try:page.evaluate(js_import,{'modules':order,'platform':platform,'config':CFG})
  except Exception as ex:issues.append(f'bootstrap {platform}/{width}: {str(ex)[:450]}');page.close();continue
  page.evaluate('''mode=>{const style=mode==='dark'?window.__featureConfig.theme:window.__featureConfig.appearance.light; for(const [k,v] of Object.entries(style))document.documentElement.style.setProperty('--'+k,v);document.documentElement.dataset.theme=mode;}''',theme)
  for route,kind in [('education-programs','education'),('sports-disciplines','sports'),('sports-facilities','sports'),('education-exams','exams'),('education-years','exams'),('news-events','community'),('news-community','community'),('education-community','community')]:
   try:
    page.evaluate('''({route,kind})=>{const host=document.getElementById('feature-root');host.replaceChildren(window.__featureCreate(window.__featureConfig,kind,route).section);}''',{'route':route,'kind':kind})
    selector=f'.{platform}-feature-center.feature-{kind}'
    check(page.locator(selector).count()==1,f'{width} {theme}: {route} missing')
    check(page.locator(selector+' h2').count()==1,f'{width} {theme}: {route} heading')
    check(page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),f'{width} {theme}: {route} overflow')
    check(page.locator(selector+' a.feature-link').count()>=1,f'{width} {theme}: {route} no links')
    if kind in ('sports','exams','community') and route!='sports-facilities':
     search=page.locator(selector+' input[type=search]');check(search.count()==1,f'{width}: {route} no search')
     if search.count():
      search.fill('nincs-ilyen-elem-xxx');check('0' in page.locator(selector+' .feature-count').inner_text(),f'{width}: {route} search broken')
      search.fill('')
    if kind=='education':
     check(page.locator(selector+' .'+('desktop-feature-program' if platform=='desktop' else 'mobile-feature-program')).count()==2,f'{width} education count')
     if platform=='desktop':
      toggles=page.locator('.feature-education-controls button')
      toggles.nth(2).click()
      check(page.locator('.desktop-feature-program:visible').count()==1,f'{width} education filter broken')
      toggles.nth(0).click()
      check(page.locator('.desktop-feature-program:visible').count()==2,f'{width} education comparison reset')
     else:
      ds=page.locator('.mobile-feature-program')
      ds.first.locator('summary').click()
      check(ds.first.get_attribute('open') is not None,f'{width} mobile education accordion')
    if kind=='exams' and route=='education-exams':
     if platform=='desktop':
      page.locator('.feature-filter[data-category="exam"]').click()
      check(page.locator('.desktop-feature-event').count()==24,f'{width} exam filter count')
     else:
      page.locator('.feature-select').select_option('exam')
      check(page.locator('.mobile-feature-event').count()==24,f'{width} mobile exam count')
    if kind=='community' and route=='news-community':
     if platform=='desktop':
      page.locator('.feature-filter[data-category="community"]').click()
      check(page.locator('.desktop-feature-event').count()==11,f'{width} community filter count')
     else:
      page.locator('.feature-select').select_option('community')
      check(page.locator('.mobile-feature-event').count()==11,f'{width} mobile community count')
    if kind=='exams':check('vizsga' in page.locator(selector).inner_text().lower(),f'{width} exams missing content')
    if kind=='community':check('csanádi' in page.locator(selector).inner_text().lower(),f'{width} community content missing')
    if width==1440 and theme=='dark' and route in ['education-programs','sports-disciplines','education-exams','news-community']:
     page.screenshot(path=str(OUT/f'{route}_{platform}_{theme}.png'),full_page=False)
    if width==390 and theme=='light' and route in ['education-programs','sports-disciplines','education-exams','news-community']:
     page.screenshot(path=str(OUT/f'{route}_{platform}_{theme}.png'),full_page=False)
   except Exception as ex:issues.append(f'{width} {theme}: {route}: {str(ex)[:400]}')
  # Full browser mount of every existing menu destination, not just the new components.
  pages=[p['id'] for section in CFG['menu']['items'] for p in section['children']]
  for route in pages:
   try:
    page.evaluate("""route=>{const root=document.getElementById('feature-root');
      window.__dispose?.();location.hash='#/oldal/'+route;
      window.__dispose=window.__featureApp.mount(root,window.__featureConfig,'page:'+route);
    }""",route)
    check(page.locator(f'.{platform}-page-title').count()==1,f'{width} {theme}: old page {route} missing')
    check(page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2'),f'{width} {theme}: old page {route} overflow')
   except Exception as ex:issues.append(f'{width} {theme}: full page {route}: {str(ex)[:350]}')
  # The pre-existing home Carousel must remain limited to its three approved panels.
  try:
   page.evaluate('''()=>{window.__dispose?.();location.hash='#/kezdolap';
     window.__dispose=window.__featureApp.mount(document.getElementById('feature-root'),window.__featureConfig,'home');}''')
   check(page.locator('.home-carousel-tab').count()==3,f'{width} {theme}: homepage tab count')
   check(page.locator('.home-carousel-item').count()==3,f'{width} {theme}: homepage panel count')
   check(page.locator('.home-carousel-controls button:not(.home-carousel-tab)').count()==0,f'{width} {theme}: arrows/pause button unexpectedly present')
   check(page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),f'{width} {theme}: homepage overflow')
  except Exception as ex:issues.append(f'{width} {theme}: home mount {str(ex)[:350]}')
  page.evaluate('window.__dispose?.()')
  page.close()
 b.close()
print(f'2.43 Chromium-komponenstesztek: {checks-len(issues)}/{checks} ellenőrzés; {len(issues)} hiba')
if issues:
 print('\n'.join(issues[:25]));raise SystemExit(1)
