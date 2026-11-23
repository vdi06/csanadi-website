#!/usr/bin/env python3
"""2.45: Galéria kereső, hiányos sor középre, animált, natív képnéző desktop/mobil Chromium."""
from pathlib import Path
import json,re,os,shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
CFG=json.loads((ROOT/'shared/data/site.json').read_text())
PAT=re.compile(r'([\'\"])(\.{1,2}/[^\'\"]+\.js(?:\?v=[0-9.]+)?)\1')
modules={}
def visit(p):
    p=p.resolve();key=p.relative_to(ROOT).as_posix()
    if key in modules:return
    code=p.read_text();modules[key]=None
    for _,spec in PAT.findall(code):
        dep=(p.parent/spec.split('?')[0]).resolve()
        visit(dep)
        code=code.replace('"'+spec+'"','"csanadi:'+dep.relative_to(ROOT).as_posix()+'"').replace("'"+spec+"'","'csanadi:"+dep.relative_to(ROOT).as_posix()+"'")
    modules[key]=code
for plat in ('desktop','mobile'):
    visit(ROOT/plat/'gallery.js')
CSS='\n'.join((ROOT/path).read_text() for path in ('shared/css/base.css','desktop/styles.css','mobile/styles.css'))
qa=Path(os.environ.get('CSANADI_QA','/tmp/csanadi-gallery-qa'))
qa.mkdir(exist_ok=True,parents=True)
with sync_playwright() as pw:
    binary=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('google-chrome')
    browser=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'],**({'executable_path':binary} if binary else {}))
    passed=0
    for platform,width in (('desktop',1440),('desktop',1024),('mobile',390),('mobile',320)):
        for mode in ('dark','light'):
            page=browser.new_page(viewport={'width':width,'height':880},has_touch=(platform=='mobile'))
            # A valódi, helyi WebP-ket helyi HTTP-szerver nélkül is HTTP válaszként adja vissza a teszt.
            def serve_assets(route):
                url=route.request.url
                rel=url.split('csanadi.test/',1)[-1].split('?',1)[0]
                target=(ROOT/rel).resolve()
                if target.is_file() and target.is_relative_to(ROOT):
                    route.fulfill(status=200,body=target.read_bytes(),content_type='image/webp')
                else:route.fulfill(status=404,body='')
            page.route('https://csanadi.test/**',serve_assets)
            page.set_content('<!doctype html><html lang="hu"><head><meta charset="utf-8"><base href="https://csanadi.test/"><style>'+CSS+'</style></head><body><div id="root" class="'+platform+'-home" data-theme="'+mode+'"></div></body></html>')
            page.evaluate('''payload=>{
              const style=payload.mode==='dark'?payload.cfg.theme:payload.cfg.appearance.light;
              for(const [k,v] of Object.entries(style))document.documentElement.style.setProperty('--'+k,v);
              const mapped={};for(const [key,code] of Object.entries(payload.modules))mapped['csanadi:'+key]=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
              const im=document.createElement('script');im.type='importmap';im.textContent=JSON.stringify({imports:mapped});document.head.append(im);
              window.__cfg=payload.cfg;
            }''',{'modules':modules,'cfg':CFG,'mode':mode})
            page.evaluate('''async platform=>{
              const m=await import('csanadi:'+platform+'/gallery.js');
              window.__gallery=platform==='desktop'?m.createDesktopMedia(window.__cfg):m.createMobileMedia(window.__cfg);
              document.getElementById('root').append(window.__gallery.section);
            }''',platform)
            # Szűrés után 1 kép marad és geometriailag középen áll.
            search=page.locator('.'+platform+'-media-search')
            search.fill('Robotika')
            grid=page.locator('.'+platform+'-media-grid')
            cards=grid.locator('button')
            assert cards.count()==1,(platform,width,mode,cards.count())
            card=cards.first.bounding_box(); gr=grid.bounding_box()
            delta=abs(card['x']+card['width']/2-gr['x']-gr['width']/2)
            assert delta<2,(platform,width,mode,'középre rendezés',delta)
            passed+=2
            search.fill('röpLABDA')
            assert cards.count()==1
            search.fill('robotika')
            passed+=2
            color=search.evaluate('e=>getComputedStyle(e).webkitTextFillColor')
            ph=search.evaluate('e=>getComputedStyle(e,"::placeholder").color')
            assert ('247, 240, 229' in color if mode=='dark' else '20, 43, 64' in color),(platform,mode,color)
            assert ('208, 218, 226' in ph if mode=='dark' else '72, 96, 112' in ph),(platform,mode,ph)
            passed+=2
            cards.first.click()
            dialog=page.locator('dialog.media-dialog')
            assert dialog.evaluate('el=>el.open')
            assert dialog.evaluate('el=>el.matches(":modal")')
            assert dialog.locator('.media-dialog-counter').inner_text()=='1 / 1'
            assert dialog.locator('.media-dialog-image').get_attribute('src').endswith('robotika.webp') or dialog.locator('.media-dialog-image').get_attribute('src').endswith('.webp')
            assert 'csanadi-gallery-open' in dialog.evaluate('e=>getComputedStyle(e).animationName')
            passed+=5
            dialog.locator('.media-dialog-close').click()
            assert not dialog.evaluate('el=>el.open')
            assert cards.first.evaluate('e=>document.activeElement===e')
            passed+=2
            search.fill('')
            initial_count=CFG['mediaCenter']['desktopInitialCount' if platform=='desktop' else 'mobileInitialCount']
            page.wait_for_function('''args=>document.querySelectorAll('.'+args.platform+'-media-grid button').length===args.initial''',arg={'platform':platform,'initial':initial_count})
            cards.first.click()
            assert dialog.locator('.media-dialog-counter').inner_text()=='1 / 22'
            dialog.press('ArrowRight')
            assert dialog.locator('.media-dialog-counter').inner_text()=='2 / 22'
            dialog.press('ArrowLeft')
            assert dialog.locator('.media-dialog-counter').inner_text()=='1 / 22'
            passed+=4
            if platform=='mobile':
                dialog.evaluate('''el=>{
                  const target=el.querySelector('.media-dialog-image');
                  const a=new Touch({identifier:1,target,clientX:250,clientY:300});
                  const b=new Touch({identifier:1,target,clientX:80,clientY:310});
                  target.dispatchEvent(new TouchEvent('touchstart',{touches:[a],bubbles:true}));
                  target.dispatchEvent(new TouchEvent('touchend',{changedTouches:[b],bubbles:true}));
                }''')
                assert dialog.locator('.media-dialog-counter').inner_text()=='2 / 22'
                passed+=1
            page.keyboard.press('Escape')
            assert not dialog.evaluate('el=>el.open')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2'),(platform,width,mode,'túlcsordulás')
            passed+=2
            if width in (1440,390) and mode=='dark':
                page.locator('.'+platform+'-media-center').screenshot(path=str(qa/f'galeria-{platform}.png'))
                cards.first.click()
                dialog.screenshot(path=str(qa/f'kepnezo-{platform}.png'))
            page.evaluate('window.__gallery.destroy()')
            page.close()
    browser.close()
    print(f'Képgaléria és képnéző Chromium: {passed}/{passed} sikeres, 0 hiba')
    print('Tesztképek:',qa)
