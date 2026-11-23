#!/usr/bin/env python3
"""2.45: galéria, albumok, valódi WebP srcset, pinch/pan/double tap, localhost szerkesztő, akadálymentes vezérlés.
Kizárólag local asset route, nem tévesztendő össze valódi Bootstrap-CDN-es end-to-end teszttel.
"""
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
for platform in ('desktop','mobile'): walk(R/platform/'gallery.js')
CSS='\n'.join((R/p).read_text() for p in ('shared/css/base.css','desktop/styles.css','mobile/styles.css'))
QA=Path(os.getenv('CSANADI_QA','/mnt/data/Csanadi_2.45_qa'))
QA.mkdir(parents=True,exist_ok=True)
passed=0
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path=shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    for platform,width in [('desktop',1440),('desktop',1024),('mobile',390),('mobile',320)]:
        for mode in ('dark','light'):
            page=browser.new_page(viewport={'width':width,'height':850},has_touch=True)
            page.set_default_timeout(6500)
            def assets(route):
                rel=route.request.url.split('csanadi.test/',1)[-1].split('?',1)[0]
                p=(R/rel).resolve()
                if p.is_file() and p.is_relative_to(R):route.fulfill(status=200,body=p.read_bytes(),content_type='image/webp')
                else:route.fulfill(status=404)
            page.route('https://csanadi.test/**',assets)
            page.set_content('<!doctype html><html lang="hu"><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://csanadi.test/"><style>'+CSS+'</style></head><body><main id="root" class="'+platform+'-home" data-theme="'+mode+'"></main></body></html>')
            page.evaluate('''data=>{
              const style=data.mode==='dark'?data.config.theme:data.config.appearance.light;
              for(const [key,value] of Object.entries(style))document.documentElement.style.setProperty('--'+key,value);
              const mapped={};for(const [k,code] of Object.entries(data.modules))mapped['csanadi:'+k]=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
              const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports:mapped});document.head.append(map);window.__cfg=data.config;
            }''',{'mode':mode,'config':CFG,'modules':modules})
            page.evaluate('''async platform=>{const m=await import('csanadi:'+platform+'/gallery.js');window.__gallery=(platform==='desktop'?m.createDesktopMedia:m.createMobileMedia)(window.__cfg);document.getElementById('root').append(window.__gallery.section);}''',platform)
            root=page.locator('.'+platform+'-media-center')
            grid=page.locator('.'+platform+'-media-grid')
            controls=root.locator('.media-album-select')
            assert controls.count()==4
            assert not root.locator('.media-editor-launch').count() # nincs szerkesztő nyilvános címen
            passed+=2
            assert grid.locator('button').count()==CFG['mediaCenter']['desktopInitialCount' if platform=='desktop' else 'mobileInitialCount'];passed+=1
            # Sportági album (atlétika) + szűrő + válogatás csoportosítva
            controls.nth(0).select_option('atletika')
            assert grid.locator('button').count()==1;passed+=1
            controls.nth(0).select_option('all')
            controls.nth(2).select_option('sportnap')
            assert grid.locator('button').count()==1;passed+=1
            controls.nth(2).select_option('all')
            controls.nth(1).select_option('2026-2027')
            assert grid.locator('button').count()>2;passed+=1
            controls.nth(1).select_option('all')
            controls.nth(3).select_option('sport')
            assert grid.locator('.media-album-heading').count()>1;passed+=1
            assert any('Atlétika' in x for x in grid.locator('.media-album-heading').all_inner_texts());passed+=1
            controls.nth(3).select_option('none')
            # Keresés kontraszt, képkártyák a célhoz méretezett képből
            search=root.locator('input[type=search]');search.fill('robotika')
            assert grid.locator('button').count()==1;passed+=1
            card=grid.locator('button').first
            assert card.locator('img').get_attribute('srcset').count('w')>=3;passed+=1
            card.scroll_into_view_if_needed() # 2.46: új albumborítók alatt a lazy kép ténylegesen viewportba kerüljön
            card.locator('img').wait_for(state='visible')
            page.wait_for_function('(img)=>img.complete&&img.naturalWidth>0',arg=card.locator('img').element_handle())
            imgstate=card.locator('img').evaluate('e=>({ok:e.complete&&e.naturalWidth>0,src:e.currentSrc})')
            assert imgstate['ok'],imgstate
            assert '/gallery/' in imgstate['src'],imgstate;passed+=2
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2');passed+=1
            # Középre rendezés
            b=card.bounding_box();c=grid.bounding_box();assert abs(b['x']+b['width']/2-(c['x']+c['width']/2))<2;passed+=1
            card.click()
            dialog=root.locator('dialog.media-dialog')
            assert dialog.evaluate('e=>e.matches(":modal")');passed+=1
            assert dialog.locator('img.media-dialog-image').get_attribute('srcset').count('w')>=3;passed+=1
            zoom=dialog.locator('.media-dialog-zoom');zoom.click()
            assert dialog.locator('.media-dialog-viewport').get_attribute('data-zoomed')=='true';passed+=1
            zoom.click();assert dialog.locator('.media-dialog-viewport').get_attribute('data-zoomed')=='false';passed+=1
            dialog.locator('.media-dialog-close').click()
            assert card.evaluate('e=>document.activeElement===e');passed+=1
            # Teljes album + billentyűzetes lapozás
            search.fill('');grid.locator('button').first.click()
            dialog.press('ArrowRight');assert dialog.locator('.media-dialog-counter').inner_text()=='2 / 22';passed+=1
            dialog.press('ArrowLeft');assert dialog.locator('.media-dialog-counter').inner_text()=='1 / 22';passed+=1
            if platform=='mobile':
                viewport=dialog.locator('.media-dialog-viewport')
                # Kétujjas távolítás: 80 -> 200 px, látható nagyítás
                viewport.evaluate('''v=>{let t=v.querySelector('img');let a=(x,y,id)=>new Touch({identifier:id,target:t,clientX:x,clientY:y});
                  v.dispatchEvent(new TouchEvent('touchstart',{touches:[a(140,200,1),a(220,200,2)],bubbles:true}));
                  v.dispatchEvent(new TouchEvent('touchmove',{touches:[a(80,200,1),a(280,200,2)],bubbles:true,cancelable:true}));
                  v.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[a(80,200,1),a(280,200,2)],bubbles:true}));
                }''')
                assert viewport.get_attribute('data-zoomed')=='true';passed+=1
                # Nagyított kép mozgatása
                before=viewport.locator('img').evaluate('e=>e.style.transform')
                viewport.evaluate('''v=>{let t=v.querySelector('img');let a=(x,y)=>new Touch({identifier:1,target:t,clientX:x,clientY:y});
                  v.dispatchEvent(new TouchEvent('touchstart',{touches:[a(160,220)],bubbles:true}));
                  v.dispatchEvent(new TouchEvent('touchmove',{touches:[a(200,240)],bubbles:true,cancelable:true}));
                  v.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[a(200,240)],bubbles:true}));
                }''')
                assert viewport.locator('img').evaluate('e=>e.style.transform')!=before;passed+=1
                zoom.click();assert viewport.get_attribute('data-zoomed')=='false';passed+=1
                # Két külön gyors koppintás
                viewport.evaluate('''v=>{let t=v.querySelector('img');let a=()=>new Touch({identifier:1,target:t,clientX:200,clientY:240});
                  for(let i=0;i<2;i++){v.dispatchEvent(new TouchEvent('touchstart',{touches:[a()],bubbles:true}));v.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[a()],bubbles:true}));}
                }''')
                assert viewport.get_attribute('data-zoomed')=='true';passed+=1
            page.keyboard.press('Escape');assert not dialog.evaluate('e=>e.open');passed+=1
            if width in (1440,390) and mode=='dark':
                search.fill('');controls.nth(3).select_option('sport');root.screenshot(path=str(QA/f'album-{platform}.png'),animations='disabled')
            page.evaluate('window.__gallery.destroy()');page.close()
    # Helyi, kizárólag szerkesztői mód, export működése
    page=browser.new_page(viewport={'width':1440,'height':900},accept_downloads=True)
    page.set_default_timeout(8000)
    def local_virtual(route):
        p=(R/route.request.url.split('csanadi.test/')[-1].split('?')[0]).resolve()
        if p.is_file() and p.is_relative_to(R):route.fulfill(status=200,body=p.read_bytes(),content_type='image/webp')
        else:route.fulfill(status=404)
    page.route('https://csanadi.test/**',local_virtual)
    page.set_content('<html lang="hu"><head><base href="https://csanadi.test/"><style>'+CSS+'</style></head><body><main id="root" class="desktop-home" data-theme="dark"></main></body></html>')
    page.evaluate('''data=>{const m={};for(const [k,s] of Object.entries(data.modules))m['csanadi:'+k]=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));const e=document.createElement('script');e.type='importmap';e.textContent=JSON.stringify({imports:m});document.head.append(e);window.__cfg=data.config;}''',{'config':CFG,'modules':modules})
    page.evaluate('''async()=>{const m=await import('csanadi:desktop/gallery.js');window.__g=m.createDesktopMedia(window.__cfg);document.getElementById('root').append(window.__g.section);const guard=await import('csanadi:shared/js/gallery-ui.js');if(guard.allowLocalMediaEditor())throw new Error('Public editor unexpectedly visible');const editor=await import('csanadi:shared/js/media-editor.js');window.__editor=editor.createMediaEditor(window.__g.section,window.__cfg,()=>{});}''')
    assert page.locator('.media-editor-launch').count()==1;passed+=1
    page.locator('.media-editor-launch button').click()
    assert page.locator('.media-editor-dialog').evaluate('e=>e.matches(":modal")');passed+=1
    page.locator('.media-editor-form label').first.locator('input').fill('Módosított próbacím')
    page.locator('.media-editor-form button').click()
    assert 'Sikeresen' in page.locator('.media-editor-status').inner_text();passed+=1
    with page.expect_download() as dl:page.get_by_role('button',name='Ellenőrzött site.json letöltése').click()
    download=dl.value
    assert download.suggested_filename=='site.json';passed+=1
    exported=json.loads(Path(download.path()).read_text())
    assert exported['mediaCenter']['items'][0]['title']=='Módosított próbacím';passed+=1
    assert CFG['mediaCenter']['items'][0]['title']!='Módosított próbacím';passed+=1
    page.close();browser.close()
print(f'2.45 galéria + album + mobil zoom + szerkesztő: {passed}/{passed} sikeres teszt; 0 hiba')
print(f'Képernyőképek: {QA}')
