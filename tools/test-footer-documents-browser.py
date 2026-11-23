#!/usr/bin/env python3
"""2.45 patch: Chromium render + footer and single-document placement for both platforms."""
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
    visit(ROOT/plat/'documents.js')
visit(ROOT/'shared/js/footer.js')
CSS='\n'.join((ROOT/path).read_text() for path in ('shared/css/base.css','desktop/styles.css','mobile/styles.css'))
with sync_playwright() as pw:
    executable=os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium') or shutil.which('google-chrome')
    b=pw.chromium.launch(headless=True,args=['--no-sandbox','--disable-dev-shm-usage'],**({'executable_path':executable} if executable else {}))
    passed=0
    screenshots=Path(os.environ.get('CSANADI_QA','/tmp/csanadi_footer_qa'))
    screenshots.mkdir(exist_ok=True,parents=True)
    for platform,width in (('desktop',1440),('desktop',1024),('mobile',390),('mobile',320)):
        for mode in ('dark','light'):
            page=b.new_page(viewport={'width':width,'height':920})
            page.set_content('<!doctype html><html lang="hu"><head><meta charset="utf-8"><style>'+CSS+'</style></head><body><main id="root"></main></body></html>')
            page.evaluate('''payload=>{
              const style=payload.mode==='dark'?payload.cfg.theme:payload.cfg.appearance.light;
              for(const [k,v] of Object.entries(style))document.documentElement.style.setProperty('--'+k,v);
              document.documentElement.dataset.theme=payload.mode;
              const mapped={};for(const [key,code] of Object.entries(payload.modules))mapped['csanadi:'+key]=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));
              const im=document.createElement('script');im.type='importmap';im.textContent=JSON.stringify({imports:mapped});document.head.append(im);
              window.__cfg=payload.cfg;
              window.fetch=async()=>({ok:true,json:async()=>window.__cfg});
            }''',{'modules':modules,'cfg':CFG,'mode':mode})
            page.evaluate('''async platform=>{
              const footerMod=await import('csanadi:shared/js/footer.js');
              const docs=await import('csanadi:'+platform+'/documents.js');
              window.__foot=footerMod.makeFooter(window.__cfg,platform);
              window.__docs=platform==='desktop'?docs.createDesktopDocuments(window.__cfg):docs.createMobileDocuments(window.__cfg);
              document.getElementById('root').append(window.__docs.section,window.__foot.footer);
            }''',platform)
            page.wait_for_timeout(150)
            footer=page.locator('footer.site-footer')
            assert footer.count()==1
            assert footer.locator('.footer-contact').count()==1
            assert footer.locator('.footer-links,.footer-documents-link,.footer-mobile-tabs').count()==0
            assert footer.locator('.footer-updated').inner_text()=='Utolsó frissítés: 2026. 11. 23.'
            assert footer.locator('.footer-checked').inner_text().startswith('Ellenőrizve: ')
            assert footer.locator('.footer-version').inner_text()==f'Verzió: {CFG["release"]}'
            assert 'none'==footer.evaluate('(el)=>getComputedStyle(el).borderTopStyle')
            assert footer.evaluate('(el)=>getComputedStyle(el).boxShadow')!='none'
            assert 'gradient' in footer.evaluate('(el)=>getComputedStyle(el).backgroundImage')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
            passed+=11
            search=page.locator('#desktop-document-search' if platform=='desktop' else '#mobile-document-search')
            search.fill('dokumentumközpont használata')
            cards=page.locator('.document-card')
            assert cards.count()==1,(platform,width,mode,cards.count())
            coords=cards.first.bounding_box();grid=page.locator('.desktop-document-grid' if platform=='desktop' else '.mobile-document-list').bounding_box()
            centers=abs((coords['x']+coords['width']/2)-(grid['x']+grid['width']/2))
            assert centers<2,(platform,width,mode,centers,coords,grid)
            assert coords['width']<=grid['width']+1
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
            passed+=4
            search.fill('')
            assert cards.count()>1
            passed+=1
            if width in (1440,390) and mode=='dark':
                page.locator('footer').screenshot(path=str(screenshots/f'footer-{platform}.png'))
                search.fill('dokumentumközpont használata')
                page.locator('.document-center').screenshot(path=str(screenshots/f'document-{platform}.png'))
            page.evaluate('''()=>{window.__foot.destroy();window.__docs.destroy();}''')
            page.close()
    b.close()
    print(f'Footer + egyetlen dokumentum Chromium-teszt: {passed}/{passed} sikeres, 0 hiba')
    print('Képernyőmentések:',screenshots)
