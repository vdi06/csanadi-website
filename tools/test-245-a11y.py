#!/usr/bin/env python3
"""A11y smoke QA: 2.45-as galériavezérlők nevei, billentyűzet, kontraszt, csökkentett mozgás, töréspontok.
Nem teljes WCAG/screenreader tanúsítás; helyi, virtualizált böngészőforrásokkal.
"""
from pathlib import Path
import json,re,shutil
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
CFG=json.loads((R/'shared/data/site.json').read_text())
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
for k in ['desktop','mobile']:walk(R/k/'gallery.js')
CSS='\n'.join((R/p).read_text() for p in ('shared/css/base.css','desktop/styles.css','mobile/styles.css'))
PASS=0
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    for width in [320,390,768,1024,1440]:
      plat='mobile' if width<768 else 'desktop'
      for theme in ['light','dark']:
        page=browser.new_page(viewport={'width':width,'height':860},reduced_motion='reduce',has_touch=plat=='mobile')
        page.set_default_timeout(5000)
        def serve(route):
            path=(R/route.request.url.split('csanadi.test/')[-1].split('?',1)[0]).resolve()
            if path.is_file() and path.is_relative_to(R):route.fulfill(status=200,body=path.read_bytes(),content_type='image/webp')
            else:route.fulfill(status=404)
        page.route('https://csanadi.test/**',serve)
        page.set_content('<!doctype html><html lang="hu"><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://csanadi.test/"><style>'+CSS+'</style></head><body><main id="root" class="'+plat+'-home" data-theme="'+theme+'"></main></body></html>')
        page.evaluate('''d=>{const t=d.theme==='light'?d.config.appearance.light:d.config.theme;for(const [k,v] of Object.entries(t))document.documentElement.style.setProperty('--'+k,v);const m={};for(const [k,s] of Object.entries(d.modules))m['csanadi:'+k]=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));const x=document.createElement('script');x.type='importmap';x.textContent=JSON.stringify({imports:m});document.head.append(x);window.__cfg=d.config;}''',{'modules':modules,'config':CFG,'theme':theme})
        page.evaluate('''async plat=>{const m=await import('csanadi:'+plat+'/gallery.js');window.__g=(plat==='desktop'?m.createDesktopMedia:m.createMobileMedia)(window.__cfg);document.getElementById('root').append(window.__g.section)}''',plat)
        root=page.locator(f'.{plat}-media-center')
        assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'),(plat,width,theme,'overflow');PASS+=1
        ctrls=root.locator('.media-album-select')
        assert ctrls.count()==4 and all(ctrls.nth(i).get_attribute('aria-label') for i in range(4));PASS+=1
        # Már a minimum 44pt magas mozgó/célzott vezérlők látszanak.
        for n in [root.locator(f'.{plat}-media-filter').first,ctrls.first,root.locator('.media-album-reset')]:
            assert n.bounding_box()['height']>=43,(plat,width,theme,'hit target');PASS+=1
        # Kontraszt: natív select és kereső közvetlen szöveg/háttér színpárjai.
        for element in [ctrls.first,root.locator(f'.{plat}-media-search')]:
            ratio=element.evaluate('''e=>{const c=getComputedStyle(e);const rgb=s=>{const a=s.match(/[0-9.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return a[0]*.2126+a[1]*.7152+a[2]*.0722};const L1=rgb(c.color),L2=rgb(c.backgroundColor);return (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05)}''')
            assert ratio>=4.5,(plat,width,theme,'contrast',ratio);PASS+=1
        first=root.locator(f'.{plat}-media-grid button').first
        assert first.get_attribute('aria-label').startswith('Kép megnyitása:');PASS+=1
        first.focus()
        assert first.evaluate('e=>getComputedStyle(e).outlineStyle!="none"');PASS+=1
        page.keyboard.press('Enter')
        d=page.locator('dialog.media-dialog')
        assert d.evaluate('e=>e.matches(":modal")');PASS+=1
        assert d.get_attribute('aria-labelledby') and d.get_attribute('aria-describedby');PASS+=1
        assert d.locator('.media-dialog-close').evaluate('e=>document.activeElement===e');PASS+=1
        assert d.evaluate('e=>getComputedStyle(e).animationName==="none"'),(width,theme,'reduced motion');PASS+=1
        d.locator('.media-dialog-zoom').click()
        assert d.locator('.media-dialog-zoom').get_attribute('aria-pressed')=='true';PASS+=1
        page.keyboard.press('Escape');assert not d.evaluate('e=>e.open');PASS+=1
        assert first.evaluate('e=>document.activeElement===e');PASS+=1
        page.evaluate('window.__g.destroy()');page.close()
    browser.close()
print(f'2.45 célzott kontraszt-, billentyűzet-, fókusz-, érintési és reduced-motion vizsgálat: {PASS}/{PASS} sikeres')
