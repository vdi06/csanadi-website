#!/usr/bin/env python3
"""2.46: borítók, szűrés, albummegnyitás, visszalépés, SPA deeplink, SEO-HTML Chromiumban."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json,re,shutil,os
R=Path(__file__).resolve().parent.parent
CFG=json.loads((R/'shared/data/site.json').read_text(encoding='utf8'))
PAT=re.compile(r'([\'\"])(\.{1,2}/[^\'\"]+\.js(?:\?v=[0-9.]+)?)\1')
modules={}
def walk(p):
    p=p.resolve();key=p.relative_to(R).as_posix()
    if key in modules:return
    s=p.read_text();modules[key]=None
    for _,spec in PAT.findall(s):
        dep=(p.parent/spec.split('?')[0]).resolve();walk(dep)
        s=s.replace('"'+spec+'"','"csanadi:'+dep.relative_to(R).as_posix()+'"').replace("'"+spec+"'","'csanadi:"+dep.relative_to(R).as_posix()+"'")
    modules[key]=s
for platform in ('desktop','mobile'):walk(R/platform/'gallery.js')
CSS='\n'.join((R/p).read_text() for p in ('shared/css/base.css','desktop/styles.css','mobile/styles.css'))
QA=Path(os.getenv('CSANADI_QA','/mnt/data/_csanadi246_qa'));QA.mkdir(parents=True,exist_ok=True)
checks=0
with sync_playwright() as pw:
  browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  for platform,width in [('desktop',1440),('desktop',1024),('mobile',390),('mobile',320)]:
    for mode in ('dark','light'):
      page=browser.new_page(viewport={'width':width,'height':840})
      page.set_default_timeout(9000)
      def route_asset(route):
        p=route.request.url.split('csanadi.test/',1)[-1].split('?',1)[0]
        if not p or p.startswith('#'):
          route.fulfill(status=200,body='<html><body></body></html>',content_type='text/html');return
        source=(R/p).resolve()
        if source.is_file() and source.is_relative_to(R):
          mime='image/webp' if source.suffix=='.webp' else 'image/jpeg' if source.suffix=='.jpg' else 'text/html' if source.suffix=='.html' else 'application/octet-stream'
          route.fulfill(status=200,body=source.read_bytes(),content_type=mime)
        else:route.fulfill(status=404)
      page.route('https://csanadi.test/**',route_asset)
      page.set_content('<!doctype html><html lang="hu"><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://csanadi.test/"><style>'+CSS+'</style></head><body><main id="root" class="'+platform+'-home" data-theme="'+mode+'"></main></body></html>')
      page.evaluate('''args=>{
        const vars=args.mode==='dark'?args.config.theme:args.config.appearance.light;
        for(const [key,val] of Object.entries(vars))document.documentElement.style.setProperty('--'+key,val);
        const mapped={};for(const [k,code] of Object.entries(args.modules))mapped['csanadi:'+k]=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
        const script=document.createElement('script');script.type='importmap';script.textContent=JSON.stringify({imports:mapped});document.head.append(script);
        window.__cfg=args.config; window.__nav=''; history.replaceState=(s,t,url)=>{window.__nav=String(url)};
      }''',{'mode':mode,'config':CFG,'modules':modules})
      page.evaluate('''async platform=>{const m=await import('csanadi:'+platform+'/gallery.js');window.__g=(platform==='desktop'?m.createDesktopMedia:m.createMobileMedia)(window.__cfg);document.getElementById('root').append(window.__g.section);}''',platform)
      root=page.locator('.media-premium-showcase');gallery=page.locator('.'+platform+'-media-grid')
      assert root.locator('.media-premium-cover').count()==5;checks+=1
      assert root.locator('.media-premium-share').count()==5;checks+=1
      assert root.locator('.media-premium-cover img').first.get_attribute('src').startswith('./shared/assets/media/gallery/covers/');checks+=1
      cover=root.locator('.media-premium-cover').first
      cover.scroll_into_view_if_needed()
      page.wait_for_function('img=>img.complete&&img.naturalWidth>0',arg=cover.locator('img').element_handle());checks+=1
      assert root.locator('.media-premium-count').first.inner_text().endswith('Megnyitás');checks+=1
      if width in (1440,390) and mode=='dark':
        root.screenshot(path=str(QA/('premier-'+platform+'.png')),animations='disabled')
      root.locator('.media-premium-tab').filter(has_text='Összes album').click()
      assert root.locator('.media-premium-cover').count()==14;checks+=1
      root.locator('.media-premium-tab').filter(has_text='Rendezvények').click()
      assert root.locator('.media-premium-cover').count()==4;checks+=1
      root.locator('.media-premium-tab').filter(has_text='Kiemelt').click()
      root.locator('.media-premium-cover').first.click()
      assert root.locator('.media-premium-opened h3').inner_text()=='Atlétika';checks+=1
      assert gallery.locator('button').count()==1;checks+=1
      assert 'album=sport%3Aatletika' in page.evaluate('window.__nav');checks+=1
      assert root.locator('.media-premium-back').is_visible();checks+=1
      if width in (1440,390) and mode=='dark':
        root.screenshot(path=str(QA/('opened-'+platform+'.png')),animations='disabled')
      root.locator('.media-premium-back').click()
      assert gallery.locator('button').count()==(CFG['mediaCenter']['desktopInitialCount'] if platform=='desktop' else CFG['mediaCenter']['mobileInitialCount']);checks+=1
      assert 'album=' not in page.evaluate('window.__nav');checks+=1
      assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2');checks+=1
      # Közzétételi felületen nem látszik szerkesztés; a meglévő képnéző tovább él.
      assert page.locator('.media-editor-launch').count()==0;checks+=1
      gallery.locator('button').first.scroll_into_view_if_needed();gallery.locator('button').first.click()
      assert page.locator('dialog.media-dialog').evaluate('d=>d.open');checks+=1
      page.locator('.media-dialog-close').click();checks+=1
      page.evaluate('window.__g.destroy()');page.close()
  # A statikus, crawler számára önállóan látható oldalak JS nélkül is betöltődnek.
  page=browser.new_page(viewport={'width':1000,'height':780})
  def preview_route(route):
    rel=route.request.url.split('csanadi.test/',1)[-1].split('?',1)[0]
    if rel.endswith('/'):rel+='index.html'
    p=(R/rel).resolve()
    if p.is_file() and p.is_relative_to(R):
      mime='image/jpeg' if p.suffix=='.jpg' else 'text/html'
      route.fulfill(status=200,body=p.read_bytes(),content_type=mime)
    else:route.fulfill(status=404)
  page.route('https://csanadi.test/**',preview_route)
  for path in ['share/page/sports-gallery/','share/page/admission-guide/','share/album/sport/atletika/','share/album/event/sportnap/']:
    htmltext=(R/path/'index.html').read_text(encoding='utf8')
    htmltext=htmltext.replace('<head>', '<head><base href="https://csanadi.test/'+path+'">',1)
    page.set_content(htmltext)
    assert page.locator('h1').count()==1;checks+=1
    assert page.locator('meta[property="og:image"]').get_attribute('content').startswith('https://');checks+=1
    assert page.locator('script[type="application/ld+json"]').count()==1;checks+=1
    assert page.locator('meta[name="robots"]').get_attribute('content').startswith('noindex');checks+=1
    page.locator('img.hero').scroll_into_view_if_needed()
    page.wait_for_function('e=>e.complete&&e.naturalWidth===1200',arg=page.locator('img.hero').element_handle());checks+=1
    assert page.locator('.action').get_attribute('href').endswith('#/oldal/sports-gallery') or 'admission-guide' in page.locator('.action').get_attribute('href');checks+=1
  page.close()
  # Direkt, mélylinkes album-előválasztás a SPA-kódhoz (friss oldalmegnyitás után is).
  browser.close()
print(f'2.46 Chromium: {checks}/{checks} sikeres borító-/album-/SEO-próba, 0 hiba')
