import json,mimetypes,urllib.parse,os
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent;C=json.loads((R/'shared/data/site.json').read_text())
def serve(r):
 f=(R/urllib.parse.unquote(urllib.parse.urlparse(r.request.url).path).lstrip('/')).resolve()
 if not f.is_relative_to(R) or not f.is_file():r.fulfill(status=404,body='no');return
 r.fulfill(status=200,body=f.read_bytes(),headers={'content-type':mimetypes.guess_type(f.name)[0] or 'application/octet-stream'})
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for w in tuple(int(x) for x in os.getenv("CSANADI_FOCUS_WIDTHS","320,390,1024,1440").split(",")):
  c=b.new_context(viewport={'width':w,'height':850},reduced_motion='reduce',has_touch=w<768,is_mobile=w<768)
  c.route('https://csanadi-local.test/**',serve);c.route('https://cdn.jsdelivr.net/**',lambda r:r.abort())
  page=c.new_page();page.goto('about:blank#/oldal/sports-gallery')
  page.set_content(f'<html><head><base href="https://csanadi-local.test/"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="shared/css/base.css?v={C['release']}"></head><body><div id="app"></div><script type="module" src="shared/js/entry.js?v={C['release']}"></script></body></html>')
  plat='mobile' if w<768 else 'desktop'
  root=page.locator(f'.{plat}-media-center');root.wait_for(timeout=15000)
  search=root.locator('input[type=search]');grid=root.locator(f'.{plat}-media-grid');dlg=root.locator('dialog.media-dialog')
  results=[]
  for n in range(int(os.getenv("CSANADI_FOCUS_CYCLES","20"))):
   search.fill('robotika')
   a=search.input_value();s=grid.locator('button').count()
   grid.locator('button').first.click()
   modal=dlg.locator('.media-dialog-counter').inner_text()
   dlg.locator('.media-dialog-close').click()
   search.fill('')
   ctext=search.input_value();ss=grid.locator('button').count()
   grid.locator('button').first.click()
   dlg.press('ArrowRight');counter=dlg.locator('.media-dialog-counter').inner_text()
   results.append({'cycle':n,'robotsearch':a,'robotcards':s,'modalRobot':modal,'afterClear':ctext,'afterClearCards':ss,'counter':counter})
   dlg.locator('.media-dialog-close').click()
   if counter!='2 / 22':print('FAILED',w,results[-1],flush=True)
  print(w,'PASSED',sum(v['counter']=='2 / 22' for v in results),'OF',len(results),flush=True)
  import json
  assert all(v['counter']=='2 / 22' and v['afterClear']=='' and v['afterClearCards']>1 for v in results), f'Rapid search/modal race at {w}';
  c.close()
 b.close()
