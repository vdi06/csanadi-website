/* v1.38.0 – valós böngészős, telefonos/asztali menü- és aloldalregresszió. */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const base=process.argv[2]||'http://127.0.0.1:8798/';
const results=[],pageErrors=[];
const check=async(label,fn)=>{try{const details=await fn();results.push({label,result:'OK',details:details||''});}catch(e){results.push({label,result:'HIBA',error:String(e.message||e).slice(0,550)});}};
const navigation=async(page,route='#/')=>{
 await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>window.__CSANADI_STARTED__===true,{timeout:30000});
};
function expect(value,message){if(!value)throw Error(message);}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CSANADI_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await desktop.addInitScript(()=>localStorage.setItem('csanadi-portal-visit-v3',new Date().toISOString().slice(0,10)));
  const page=await desktop.newPage();page.on('pageerror',e=>pageErrors.push('desktop '+e.message.slice(0,280)));
  await check('Hat főmenü és 28 második szint a katalógusban',async()=>{
   await navigation(page);
   const x=await page.evaluate(async()=>{const {buildCatalog,childrenOf}=await import('./js/content.js?v=1.38.0');const catalog=await buildCatalog();return {roots:catalog.roots.length,counts:catalog.roots.map(r=>childrenOf(catalog,r).length),pages:catalog.items.length,third:catalog.items.filter(x=>x.depth===3).length};});
   expect(x.roots===6&&x.counts.join(',')==='6,6,4,3,4,5',JSON.stringify(x));
   expect(x.pages>=60&&x.third>=20,'Eltűnt tartalom: '+JSON.stringify(x));return JSON.stringify(x);
  });
  await check('Asztali körmenü és harmadik szint hiánya',async()=>{
   await page.evaluate(()=>document.querySelector('#orbit-open').click());
   await page.waitForSelector('#site-map-overlay:not([hidden])');
   expect(await page.locator('#site-map-categories .compass26-choice').count()===6,'Nem hat a főmenü');
   await page.locator('.compass26-choice-toggle').nth(2).click();
   await page.waitForTimeout(120);
   expect(await page.locator('.csn26-outer-link').count()===4,'Felvételi: nem négy almenü');
   expect(await page.locator('.csn26-third-toggle,.csn26-third-link,.compass26-expand,.compass26-nested:not([hidden])').count()===0,'Látható harmadik navigációs szint');
   await page.locator('#site-map-close').click();
  });
  await check('Tartalmi csempék megőrzik a korábbi al-aloldalakat',async()=>{
   await navigation(page,'#/oktatas/kepzeseink');
   await page.waitForSelector('.cs-nav-detail-tiles .features-grid a',{timeout:30000});
   const links=await page.locator('.cs-nav-detail-tiles .features-grid a').count();expect(links===3,'Képzési csempék: '+links);return `${links} közvetlen csempe`;
  });
  await check('Könyvtár oldalra összevont szolgáltatástartalom',async()=>{
   await navigation(page,'#/oktatas/konyvtar');
   await page.waitForSelector('.article-section h2',{timeout:30000});
   expect(await page.locator('.article-section h2').filter({hasText:'Miben segíthet a könyvtár?'}).count()>0,'Hiányzik az átemelt tartalom');
  });
  await check('Asztali kompakt szalag: körmenü, oldalnév és olvasási sáv',async()=>{
   await navigation(page,'#/iskolank/bemutatkozas');
   await page.waitForSelector('.content-tiles h2',{timeout:30000});
   await page.evaluate(()=>window.scrollTo(0,1100));await page.waitForTimeout(350);
   const v=await page.evaluate(()=>({compact:document.body.classList.contains('cs-header-condensed'),name:document.querySelector('.cs-subpage-ribbon-title')?.textContent,progress:document.querySelector('.cs-subpage-reading-progress>span')?.style.width,crest:!!document.querySelector('#cs-subpage-menu')}));
   expect(v.compact&&v.name&&v.progress&&v.crest,'Hibás kompakt szalag: '+JSON.stringify(v));return JSON.stringify(v);
  });
  await check('Láblécbe áthelyezett oldalak',async()=>{
   for(const route of ['#/informaciok/allaspalyazatok','#/informaciok/adatvedelem','#/iskolank/a-honlap-szuletese'])expect(await page.locator(`.site-footer a[href="${route}"]`).count()===1,'Hiányzó lábléc: '+route);
  });
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await mobile.addInitScript(()=>localStorage.setItem('csanadi-portal-visit-v3',new Date().toISOString().slice(0,10)));
  const phone=await mobile.newPage();phone.on('pageerror',e=>pageErrors.push('telefon '+e.message.slice(0,280)));
  await check('Telefonos teljes kör – hat főmenü, módválasztó nélkül',async()=>{
   await navigation(phone);
   await phone.locator('#ext26-mobile-nav [data-nav-id="menu"]').click();
   expect(await phone.locator('#cs-phone-wheel').isVisible(),'Nincs telefonos körmenü');
   expect(await phone.locator('#cs-phone-wheel .cs-phone-wheel-item').count()===6,'Nem hat főmenüpont');
   expect(await phone.locator('#mobile-menu-mode-switch,#mobile-conventional-navigation').count()===0,'A régi módválasztó megmaradt');
  });
  await check('Telefonos második kör – négy felvételi almenü',async()=>{
   await phone.locator('.cs-phone-wheel-item[aria-label="Felvételi"]').click();
   expect(await phone.locator('#cs-phone-wheel').getAttribute('data-level')==='2','Nem váltott második körre');
   expect(await phone.locator('#cs-phone-wheel a.cs-phone-wheel-item').count()===4,'Nem négy felvételi almenü');
   expect(await phone.locator('#cs-phone-wheel-overview').isVisible(),'Hiányzik az áttekintés link');
  });
  await check('Visszalépés és Escape: nincs harmadik kör',async()=>{
   await phone.keyboard.press('Escape');
   expect(await phone.locator('#cs-phone-wheel').getAttribute('data-level')==='1','Escape nem lépett vissza a főmenübe');
   await phone.keyboard.press('Escape');expect(await phone.locator('#site-map-overlay').isHidden(),'Escape nem zárta be');
  });
  await check('Telefonos kör: tényleges érintés, route és bezárás',async()=>{
   await phone.locator('#ext26-mobile-nav [data-nav-id="menu"]').click();
   await phone.locator('.cs-phone-wheel-item[aria-label="Sportélet"]').click();
   await phone.locator('.cs-phone-wheel-item[aria-label="Képgaléria"]').click();
   await phone.waitForURL(/#\/sport\/sportgaleriak/);
   expect(await phone.locator('#site-map-overlay').isHidden(),'Navigáció után maradt nyitva');
  });
  await check('320 px telefon – a gyűrű érintési célpontjai nem fedik egymást',async()=>{
   await phone.setViewportSize({width:320,height:700});
   await phone.locator('#ext26-mobile-nav [data-nav-id="menu"]').click();
   const rects=await phone.locator('#cs-phone-wheel .cs-phone-wheel-item').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};}));
   expect(rects.every(r=>r.x>=-1&&r.x+r.w<=321),'Kicsúszó gomb: '+JSON.stringify(rects));
   for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
    const a=rects[i],b=rects[j];expect(!(a.x<b.x+b.w-3&&a.x+a.w>b.x+3&&a.y<b.y+b.h-3&&a.y+a.h>b.y+3),'Átfedő gombok: '+i+'/'+j);
   }
  });
  await check('Fekvő telefon – új körmenü, tablet méretben nincs új kör',async()=>{
   await phone.setViewportSize({width:844,height:390});
   expect(await phone.locator('#cs-phone-wheel').isVisible(),'Fekvő telefonon nincs körmenü');
   await phone.locator('#site-map-close').click();
   await phone.setViewportSize({width:390,height:844});
  });
  const report={version:'1.38.0',testedAt:new Date().toISOString(),base,checks:results.length,passed:results.filter(x=>x.result==='OK').length,failed:results.filter(x=>x.result==='HIBA'),pageErrors:pageErrors.slice(0,20),results};
  const output=path.resolve(__dirname,'../dokumentacio/menu-es-mobilkor-tesztnaplo-v1-38.json');
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({version:report.version,checks:report.checks,passed:report.passed,failed:report.failed,pageErrors:report.pageErrors}));
  if(report.failed.length||report.pageErrors.length)process.exitCode=1;
  await desktop.close();await mobile.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
