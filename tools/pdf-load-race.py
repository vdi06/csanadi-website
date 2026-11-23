#!/usr/bin/env python3
"""2.41 PDF.js késleltetett betöltés – gyors lapozás, nagyítás, bezárás és fájlcsere.
A PDF-megjelenítő helyettesített késleltetett CDN-modult használ; külön, valós CDN E2E nem állítás.
"""
import json, mimetypes, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
RELEASE=json.loads((ROOT/'shared/data/site.json').read_text())['release']
FAKE_PDF_JS='''
export const GlobalWorkerOptions={workerSrc:''};
export function getDocument(){return {promise:new Promise(resolve=>setTimeout(()=>resolve({
 numPages:2,
 destroy(){},
 async getPage(){return {
 getViewport({scale}){return {width:700*scale,height:1000*scale}},
 async getTextContent(){return {items:[{str:'Késleltetett próbapéldány – dokumentumközpont'}]}},
 render({canvasContext}){canvasContext.fillStyle='#777';canvasContext.fillRect(0,0,40,40);
 return {promise:Promise.resolve(),cancel(){}}}
 }}
}),900))};}
'''
def serve(route):
    sub=route.request.url.split('csanadi-local.test/',1)[-1].split('?',1)[0]
    file=(ROOT/sub).resolve()
    if not file.is_relative_to(ROOT) or not file.is_file():route.fulfill(status=404,body='missing');return
    route.fulfill(status=200,body=file.read_bytes(),headers={
        'content-type':mimetypes.guess_type(file.name)[0] or 'application/javascript',
        'access-control-allow-origin':'*','cache-control':'no-store'})
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for platform,width in [('desktop',1440),('mobile',390)]:
        ctx=browser.new_context(viewport={'width':width,'height':850},is_mobile=platform=='mobile',has_touch=platform=='mobile')
        ctx.route('https://cdn.jsdelivr.net/**',lambda route:route.abort())
        ctx.route('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs',
            lambda route:route.fulfill(status=200,body=FAKE_PDF_JS,headers={'content-type':'text/javascript','access-control-allow-origin':'*'}))
        ctx.route('https://csanadi-local.test/**',serve)
        page=ctx.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('about:blank#/oldal/information-documents')
        page.set_content(f'''<!doctype html><html lang="hu"><head><meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <base href="https://csanadi-local.test/">
            <link rel="stylesheet" href="shared/css/base.css?v={RELEASE}"></head>
            <body><div id="app"></div><script type="module" src="shared/js/entry.js?v={RELEASE}"></script></body></html>''')
        open_pdf=page.locator('.document-card',has_text='A dokumentumközpont használata').locator('.document-card-open')
        open_pdf.wait_for(timeout=10000);open_pdf.click(force=True)
        reader=page.locator('.document-reader[open]')
        reader.wait_for(timeout=5000)
        # A PDF-objektum 900 ms után válik elérhetővé. Eddig az olvasóban már lapozunk és nagyítunk.
        reader.get_by_role('button',name='Következő dokumentumoldal').click(force=True)
        reader.get_by_role('button',name='Nagyítás').click(force=True)
        page.wait_for_function("() => document.querySelector('.document-reader[open] .document-reader-canvas') !== null",timeout=8000)
        assert reader.locator('.document-reader-page').inner_text()=='2. / 2. oldal',(platform,'page reset after PDF loaded')
        assert reader.locator('.document-reader-zoom').inner_text()=='120%',(platform,'zoom reset after PDF loaded')
        assert reader.locator('.document-reader-canvas').count()==1,(platform,'dynamic canvas missing')
        assert not errors,(platform,errors)
        # A felhasználó a PDF megnyitása után azonnal másik dokumentumra léphet.
        page.keyboard.press('Escape')
        assert not reader.count(),(platform,'close reader')
        txt=page.locator('.document-card',has_text='Dokumentumközzétételi ellenőrzőlista').locator('.document-card-open')
        txt.click(force=True)
        page.locator('.document-reader[open] .document-reader-text').wait_for(timeout=8000)
        assert 'NEM hivatalos' in reader.locator('.document-reader-text').inner_text()
        assert len(ctx.pages)==1 and not errors,(platform,errors)
        print('PASS',platform,'PDF race, render, zoom, page, close, TXT after PDF')
        results.append(platform)
        ctx.close()
    browser.close()
assert results==['desktop','mobile']
print('SUMMARY 2/2, no errors')
