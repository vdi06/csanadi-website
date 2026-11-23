#!/usr/bin/env python3
"""2.47: actual localhost HTTP Chromium E2E for gate, footer, navigation, and forbidden links.
External Bootstrap CDN is intentionally blocked locally; this is not live CDN E2E.
"""
from pathlib import Path
import contextlib,json,os,subprocess,sys,time
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parent.parent
CFG=json.loads((R/'shared/data/site.json').read_text(encoding='utf8'))
PAGES=[leaf['id'] for section in CFG['menu']['items'] for leaf in section['children']]
assert len(PAGES)==49
OUT=Path(os.getenv('CSANADI_QA_OUTPUT', str(R.parent/'_csanadi247_qa')))
OUT.mkdir(exist_ok=True)
PORT=18747
ORIGIN=f'http://127.0.0.1:{PORT}'
log=open(OUT/'http-server.log','w')
server=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=R,stdout=log,stderr=subprocess.STDOUT)
checks=0
failures=[]
report=[]
try:
  import urllib.request
  for _ in range(30):
    try:
      with urllib.request.urlopen(ORIGIN+'/index.html',timeout=1) as resp:
        if resp.status==200:break
    except Exception:time.sleep(.15)
  else:raise RuntimeError('HTTP server not responding')
  with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for platform,width,height,mode in [('desktop',1440,900,'dark'),('desktop',1024,768,'light'),('mobile',390,844,'dark'),('mobile',320,700,'light')]:
      context=browser.new_context(viewport={'width':width,'height':height},color_scheme=mode,reduced_motion='reduce' if mode=='light' else 'no-preference',is_mobile=platform=='mobile',has_touch=platform=='mobile')
      # Network-prohibited CDN, unlike all first-party files genuinely served from localhost.
      context.route('https://cdn.jsdelivr.net/**',lambda route:route.abort())
      page=context.new_page()
      errors=[]
      notfound=[]
      page.on('pageerror',lambda err:errors.append(str(err)))
      page.on('response',lambda res:notfound.append(res.url) if res.status>=400 and res.url.startswith(ORIGIN) else None)
      name=f'{platform}-{mode}'
      count=0
      def c(value,message):
        global checks
        if not value:raise AssertionError(name+': '+message)
        checks+=1
      try:
        page.goto(ORIGIN+'/#/',wait_until='domcontentloaded',timeout=20000)
        page.locator('.gate-door-button').wait_for(timeout=20000)
        c(page.locator('.gate-skip').count()==0,'unexpected gate skip button')
        c(page.locator('.gate-frame').count()==30,'missing gate frames')
        c(page.locator('.gate-frame').first.evaluate('(e)=>e.complete && e.naturalWidth>50'),'first gate frame broken')
        c(page.locator('.gate-door-button').is_visible(),'gate interaction invisible')
        page.screenshot(path=str(OUT/f'gate-{name}.png'),animations='disabled')
        page.locator('.gate-door-button').click(force=True)
        page.locator('.home-carousel-tab').first.wait_for(timeout=15000)
        c(page.locator(f'.{platform}-home').count()==1,'home fails after gate')
        c(page.locator('.gate-screen').count()==0,'gate remains after opening')
        c(page.locator('.site-footer').count()==1,'footer missing')
        footer=page.locator('.site-footer')
        metrics=footer.evaluate('''f=>{const c=f.querySelector('.footer-contact');const r=f.getBoundingClientRect();const cr=c.getBoundingClientRect();return {height:r.height,centerDelta:Math.abs((cr.left+cr.right)/2 - innerWidth/2),border:getComputedStyle(c).borderStyle,canRead:!!c.textContent.includes('Verzió:')};}''')
        c(metrics['centerDelta']<2,f"footer center delta {metrics['centerDelta']}")
        c(metrics['border']=='none','footer should have no border')
        c(metrics['height']<(230 if platform=='mobile' else 160),f"footer too tall: {metrics['height']}")
        c(metrics['canRead'],'footer version missing')
        footer.screenshot(path=str(OUT/f'footer-{name}.png'),animations='disabled')
        # Exercise every page through real hash-routing on localhost.
        for leaf in PAGES:
          page.evaluate('(leaf)=>location.hash=`#/oldal/${leaf}`',leaf)
          page.locator('main h1').first.wait_for(timeout=5000)
          c(page.locator(f'.{platform}-page-title').count()==1,f'{leaf}: h1 absent')
          c(page.locator('a[href*="csanadi-bp.edu.hu"]').count()==0,f'{leaf}: old domain link remains')
          c(page.evaluate('document.documentElement.scrollWidth<=innerWidth+2'),f'{leaf}: horizontal overflow')
          count+=1
        c(not errors,f'uncaught JS errors: {errors[:3]}')
        c(not notfound,f'missing first-party assets: {notfound[:4]}')
        report.append({'case':name,'status':'PASS','pages':count,'footerHeight':round(metrics['height'],1),'footerCenterDelta':round(metrics['centerDelta'],1),'local404':len(notfound),'jsErrors':len(errors)})
        print('PASS',name,'49 pages; footer height:',round(metrics['height'],1),'checks so far',checks,flush=True)
      except Exception as err:
        failures.append({'case':name,'error':str(err)[:900],'javascript':errors[:4],'http404':notfound[:4]})
        print('FAIL',name,str(err)[:500],flush=True)
      finally:
        context.close()
    browser.close()
finally:
  server.terminate()
  with contextlib.suppress(Exception): server.wait(timeout=3)
  log.close()
(OUT/'http-summary.json').write_text(json.dumps({'checks':checks,'failures':failures,'cases':report,'note':'Local HTTP browser E2E; CDN network test not possible'},ensure_ascii=False,indent=2),encoding='utf8')
print('LOCAL HTTP SUMMARY:',checks,'checks',len(failures),'failures',flush=True)
sys.exit(1 if failures else 0)
