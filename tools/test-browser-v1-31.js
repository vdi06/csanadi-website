/* Valódi Chromium-alapú helyi regressziós ellenőrzés, statikus kiszolgálón. */
'use strict';
const {chromium}=require('playwright');
const base=process.argv[2]||'http://127.0.0.1:8795/';
const checks=[],errors=[];
const test=async(name,fn)=>{try{await fn();checks.push({name,ok:true});}catch(error){checks.push({name,ok:false,error:String(error.message||error).slice(0,500)});}};
const go=async(page,hash)=>{await page.goto(base+(hash||''),{waitUntil:'domcontentloaded',timeout:20000});await page.waitForFunction(()=>document.querySelector('#app')?.children.length>0,{timeout:20000});};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CSANADI_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const desktop=await browser.newContext({viewport:{width:1365,height:850},reducedMotion:'reduce'});
  await desktop.addInitScript(()=>{localStorage.setItem('csanadi-portal-visit-v3',new Date().toISOString().slice(0,10));});
  const page=await desktop.newPage();page.on('pageerror',error=>errors.push(String(error.message).slice(0,250)));
  await test('D: első képernyő és SPA indulása',async()=>{await go(page,'#/');await page.waitForSelector('#site-header');if(!await page.locator('#app').isVisible())throw Error('Nem látható az alkalmazás');});
  await test('H: asztali szakaszmenü megnyitható',async()=>{const t=page.locator('.cs29-nav-trigger');await t.waitFor({state:'visible'});await t.click();if(await page.locator('.cs29-nav-drawer').isHidden())throw Error('Zárt menü');});
  await test('H: asztali menü billentyűzetes járhatósága',async()=>{const first=page.locator('.cs29-nav-item').first();await first.focus();await page.keyboard.press('ArrowDown');if(await page.evaluate(()=>document.activeElement?.classList.contains('cs29-nav-item'))!==true)throw Error('Fókusz elhagyta a menüt');await page.keyboard.press('Escape');});
  await test('B: asztali szakaszugrás figyelembe veszi a fejlécet',async()=>{await page.locator('.cs29-nav-trigger').click();const target=page.locator('.cs29-nav-item').nth(2);await target.click();await page.waitForTimeout(250);const top=await page.evaluate(()=>document.querySelector('#cs29-section-daily')?.getBoundingClientRect().top);if(top===undefined||top<0)throw Error('A célpont a fejléc alá került');});
  await test('G: JSON-aloldal navigáció után megjelenik',async()=>{await go(page,'#/iskolank/bemutatkozas');await page.waitForSelector('.content-tiles h2',{timeout:20000});});
  await test('J: a diagnosztika a meglévő láblécben elérhető',async()=>{const d=page.locator('#footer-diagnostics-disclosure');await d.locator('summary').click();if(!(await d.getAttribute('open')!==null))throw Error('A panel nem nyílt meg');});
  await test('E: a kézi sötét téma megmarad az oldal visszatérésekor',async()=>{await page.evaluate(()=>{localStorage.setItem('csanadi-theme','dark');window.dispatchEvent(new Event('pageshow'));});const s=await page.locator('html').getAttribute('data-theme');if(s!=='dark')throw Error('Téma: '+s);});
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',colorScheme:'dark'});
  await mobile.addInitScript(()=>{localStorage.setItem('csanadi-portal-visit-v3',new Date().toISOString().slice(0,10));localStorage.setItem('csanadi-theme','system');});
  const phone=await mobile.newPage();phone.on('pageerror',error=>errors.push(String(error.message).slice(0,250)));
  await test('E: mobilos rendszer-sötét mód helyesen jelenik meg',async()=>{await go(phone,'#/iskolank/bemutatkozas');await phone.waitForSelector('.content-tiles h2');if(await phone.locator('html').getAttribute('data-theme')!=='dark')throw Error('Nem sötét');});
  await test('A: mobilos szakaszmenü aloldalon is megjelenik',async()=>{await phone.waitForTimeout(350);if(!await phone.locator('.cs32-mobile-bar:not([hidden])').count())throw Error('Nincs mobil szakaszmenü');});
  await test('F: szakaszlista feliratai olvashatók',async()=>{await phone.locator('[data-action="sections"]').click();const names=await phone.locator('.cs32-mobile-list-item').allTextContents();if(names.length<2||names.some(name=>!name.trim()))throw Error('Hiányzó szakasz');});
  await test('H: mobilos párbeszéd Escape billentyűvel bezárható',async()=>{await phone.keyboard.press('Escape');if(!await phone.locator('.cs32-mobile-sheet').isHidden())throw Error('Nyitva maradt');});
  await test('B: mobil szakaszugrás elérhető célpontra visz',async()=>{await phone.locator('[data-action="sections"]').click();await phone.locator('.cs32-mobile-list-item').nth(1).click();await phone.waitForTimeout(300);const v=await phone.evaluate(()=>({scroll:scrollY,menu:document.querySelector('.cs32-mobile-sheet')?.hidden}));if(!v.menu||v.scroll<0)throw Error('Hibás szakaszugrás');});
  await test('A: fekvő mobilnézetben szakaszmenü használható',async()=>{await phone.setViewportSize({width:740,height:390});await phone.waitForTimeout(200);const y=await phone.locator('.cs32-mobile-bar').evaluate(el=>getComputedStyle(el).bottom);if(!y||y==='auto')throw Error('Nincs rögzített pozíció');});
  await test('D: beágyazott térképes aloldal szakaszadatai megérkeznek',async()=>{await go(phone,'#/megkozelites-es-tanulas/terkep');await phone.waitForSelector('.cs-arrival-frame');await phone.waitForTimeout(1600);const count=await phone.locator('.cs32-mobile-list-item').count();if(count<2)throw Error('Nem érkezett térképes szakaszlista: '+count);});
  await test('C: térképes aloldalon nincs régi lap tetejére gomb',async()=>{if(await phone.locator('#be2026-top,.be2026-top').count())throw Error('Régi lebegő gomb');});
  await test('I: a fotók képbetöltési attribútumai adatforgalom-kímélők',async()=>{await go(phone,'#/sport/sportgaleriak');await phone.waitForTimeout(650);const imgs=await phone.locator('.media26-tile img').count();if(imgs){const lazy=await phone.locator('.media26-tile img[loading="lazy"]').count();if(!lazy&&imgs>3)throw Error('Hiányzó késleltetett képek');}});
  console.log(JSON.stringify({version:'1.31.0',browser:'Chromium',checks:checks.length,passed:checks.filter(x=>x.ok).length,failed:checks.filter(x=>!x.ok),pageErrors:errors.slice(0,10)}));
  if(checks.some(x=>!x.ok)||errors.length)process.exitCode=1;
  await desktop.close();await mobile.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
