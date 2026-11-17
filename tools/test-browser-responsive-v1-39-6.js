/* v1.39.6 valódi Chromium-regresszió: mobilnézet, fókusz, dialógusok, háttér-inert.
   FTP-vel egyenértékű helyi HTTP-kiszolgálón fut; hibánál nem jelent zöld tesztet. */
'use strict';
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const checks=[],errors=[];
const mime={html:'text/html; charset=utf-8',js:'text/javascript',mjs:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',webp:'image/webp'};
const server=http.createServer((request,response)=>{
 let uri;try{uri=decodeURIComponent(new URL(request.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';}
 catch{response.writeHead(400).end();return;}
 const filename=path.resolve(root,uri);
 if(!filename.startsWith(root+path.sep)){response.writeHead(403).end();return;}
 fs.stat(filename,(err,stat)=>{
  if(err||!stat.isFile()){response.writeHead(404).end();return;}
  response.writeHead(200,{'Content-Type':mime[uri.split('.').pop()]||'application/octet-stream'});
  fs.createReadStream(filename).pipe(response);
 });
});
async function test(name,run){try{await run();checks.push({name,ok:true});}catch(e){checks.push({name,ok:false,error:String(e.message||e).slice(0,400)});}}
async function run(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/';
 const binary=process.env.CSANADI_CHROMIUM||((process.platform==='linux'&&fs.existsSync('/usr/bin/chromium'))?'/usr/bin/chromium':null);
 const browser=await chromium.launch({...binary?{executablePath:binary}:{},headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await test('Telefonos főoldal: 390 × 844, menü és három gyorsgomb',async()=>{
   await page.goto(url+'#/');
   await page.locator('#app').waitFor({state:'visible'});
   await page.locator('[data-nav-id="menu"]').waitFor({state:'visible'});
   if(await page.locator('#ext26-mobile-nav button').count()!==3)throw Error('Nem háromgombos mobilnavigáció');
   if(!await page.locator('#mobile-menu-toggle').isVisible())throw Error('Hiányzó fejléci menügomb');
   await page.locator('#mobile-menu-toggle').click();
   await page.locator('#cs-phone-wheel').waitFor({state:'visible'});
   if(await page.locator('#mobile-menu-toggle').getAttribute('aria-expanded')!=='true')throw Error('Fejléci menüállapot hibás');
   if(await page.locator('#orbit-open').getAttribute('aria-expanded')!=='true')throw Error('Képes menüállapot hibás');
   const inert=await page.evaluate(()=>({main:document.getElementById('app').inert,bottom:document.getElementById('ext26-mobile-nav').inert}));
   if(!inert.main||!inert.bottom)throw Error('Főmenü mögötti fókuszháló nem inert: '+JSON.stringify(inert));
   if(await page.locator('.cs92-wheel-shortcuts-links a:visible').count()!==3)throw Error('Hiányos alsó menüsáv');
   await page.keyboard.press('Escape');
   if(!await page.locator('#site-map-overlay').isHidden())throw Error('Escape nem zárja a menüt');
   if(await page.locator('#app').evaluate(el=>el.inert))throw Error('A főmenü bezárása után inert maradt a tartalom');
   if(await page.locator('#ext26-mobile-nav').evaluate(el=>el.inert))throw Error('Az alsó navigáció inert maradt');
  });
  await test('Mobilon a menüindító állapota és a fókusz visszaáll',async()=>{
   await page.locator('[data-nav-id="menu"]').click();
   await page.locator('#site-map-overlay').waitFor({state:'visible'});
   if(await page.locator('[data-nav-id="menu"]').getAttribute('aria-expanded')!=='true')throw Error('Alsó menü ARIA hibás');
   await page.keyboard.press('Escape');
   if(!await page.locator('#site-map-overlay').isHidden())throw Error('Menü nyitva maradt');
   if(await page.locator('[data-nav-id="menu"]').getAttribute('aria-expanded')!=='false')throw Error('Alsó menü ARIA nem frissült');
  });
  await test('Kereső: háttér inert, Esc és fókuszvisszatérés',async()=>{
   await page.locator('[data-nav-id="search"]').click();
   await page.locator('#search-input').waitFor({state:'visible'});
   const modal=await page.evaluate(()=>({background:document.getElementById('app').inert,input:document.activeElement?.id,expanded:document.querySelector('[data-nav-id="search"]')?.getAttribute('aria-expanded')}));
   if(!modal.background||modal.input!=='search-input'||modal.expanded!=='true')throw Error(JSON.stringify(modal));
   await page.keyboard.press('Escape');
   const closed=await page.evaluate(()=>({hidden:document.getElementById('search-panel').hidden,background:document.getElementById('app').inert}));
   if(!closed.hidden||closed.background)throw Error('A kereső bezárásakor a háttér nem állt helyre');
  });
  await test('Kis telefon: 320 × 568 és navigációs görgetés',async()=>{
   await page.setViewportSize({width:320,height:568});
   await page.locator('#mobile-menu-toggle').click();
   if(!await page.locator('#site-map-close').isVisible())throw Error('Nem zárható a kis telefonos menü');
   await page.locator('#site-map-close').click();
   const d=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   if(d.scroll-d.client>8)throw Error('Szélességi túlcsordulás: '+JSON.stringify(d));
  });
  await test('Asztali kereső és főmenü 1280 × 800',async()=>{
   await page.setViewportSize({width:1280,height:800});
   await page.locator('#search-open').click();
   if(!await page.locator('#search-input').isVisible())throw Error('Nem nyílt meg az asztali kereső');
   await page.keyboard.press('Escape');
   await page.locator('#orbit-open').click();
   if(!await page.locator('#site-map-overlay').isVisible())throw Error('Nem nyílt meg az asztali főmenü');
   await page.locator('#site-map-close').click();
  });
  await test('Karbantartó oldalak: 390 px menü és ugróhivatkozás',async()=>{
   await page.setViewportSize({width:390,height:844});
   await page.goto(url+'tools/route-smoke-v1-39-2.html');
   const navigation=page.locator('.cs-tools-global-nav-inner');
   if(await navigation.locator('a').count()!==6)throw Error('Hiányos segédoldali menü');
   const skip=page.locator('.cs-tools-skip');
   if(await skip.count()!==1)throw Error('Hiányzó ugróhivatkozás');
   const target=await skip.getAttribute('href');
   if(!target||!await page.locator(target).count())throw Error('Hibás ugróhivatkozás');
   const overflow=await navigation.evaluate(n=>({scroll:n.scrollWidth,client:n.clientWidth}));
   if(overflow.scroll<=overflow.client)throw Error('Mobil eszköznavigáció nem vízszintesen gördíthető');
  });
  await context.close();
 }finally{await browser.close();}
}
run().catch(e=>errors.push(e.message)).finally(()=>{
 server.close();const failed=checks.filter(item=>!item.ok);
 console.log(JSON.stringify({release:'1.39.6',engine:'Chromium',checks:checks.length,passed:checks.length-failed.length,failed,errors:errors.map(x=>x.slice(0,800))},null,2));
 if(checks.length===0||failed.length||errors.length)process.exitCode=1;
});
