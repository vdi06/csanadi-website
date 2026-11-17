/* A teljesen statikus médiakezelő valódi Chromium-alapú, írásmentes QA-ja. */
'use strict';
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const errors=[],checks=[];
const mime={'html':'text/html','js':'text/javascript','mjs':'text/javascript','css':'text/css','json':'application/json','webp':'image/webp','pdf':'application/pdf'};
const server=http.createServer((request,response)=>{
  let name;
  try{name=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname).replace(/^\/+/, '')||'index.html';}
  catch{response.writeHead(400).end();return;}
  const filename=path.resolve(root,name);
  if(!filename.startsWith(root+path.sep)){response.writeHead(403).end();return;}
  fs.stat(filename,(error,stat)=>{
    if(error||!stat.isFile()){response.writeHead(404).end();return;}
    response.writeHead(200,{'Content-Type':mime[name.split('.').pop()]||'application/octet-stream'});
    fs.createReadStream(filename).pipe(response);
  });
});
async function check(name,fn){try{await fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:String(error.message||error).slice(0,500)});}}
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port+'/';
  const browser=await chromium.launch({executablePath:process.env.CSANADI_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    const context=await browser.newContext({viewport:{width:1260,height:850},acceptDownloads:true,reducedMotion:'reduce'});
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await check('Munkaközpont és hatrészes közös menü',async()=>{
      await page.goto(base+'tools/index.html',{waitUntil:'networkidle'});
      if(await page.locator('.cs-tools-global-nav a').count()!==6)throw Error('Nem teljes az eszköznavigáció');
      if(await page.locator('.cs-tools-global-nav [aria-current="page"]').count()!==1)throw Error('Nincs aktív állapot');
    });
    await check('Világos és sötét téma választása',async()=>{
      const before=await page.locator('html').getAttribute('data-theme-preference');
      await page.locator('#tool-theme-toggle').click();
      const after=await page.locator('html').getAttribute('data-theme-preference');
      if(before===after)throw Error('Nem váltott a témabeállítás');
    });
    await check('748 fájl és katalógusbetöltés',async()=>{
      await page.goto(base+'tools/eszkoz-mediator.html',{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>document.querySelector('#mm-count')?.textContent==='748',{timeout:20000});
      if(await page.locator('#mm-list .mm-item').count()!==748)throw Error('Nem az összes fájl látható');
    });
    await check('Keresés, típus és részlet-előnézet',async()=>{
      await page.locator('#mm-filter').fill('csanadi-cimer');
      if(await page.locator('#mm-list .mm-item').count()<1)throw Error('Nincs keresési találat');
      await page.locator('#mm-list .mm-item').first().click();
      if(!(await page.locator('#mm-form').isVisible()))throw Error('A fájl nem szerkeszthető');
      await page.locator('#mm-filter').fill('');
    });
    await check('Új PDF helyi hozzáadása',async()=>{
      await page.locator('#mm-add').setInputFiles({name:'minosegi-prueba.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n% Local test only\n')});
      await page.waitForFunction(()=>document.querySelector('#mm-count')?.textContent==='629');
      if(!await page.locator('#mm-current-path').textContent().then(s=>s.includes('minosegi-prueba.pdf')))throw Error('Az új fájl nem szerkeszthető');
    });
    await check('Jóváhagyás hiányában a publikálás blokkolt',async()=>{
      await page.locator('#mm-title').fill('Teszt PDF');
      await page.locator('#mm-publish').check();
      await page.locator('#mm-save').click();
      const message=await page.locator('#mm-status').textContent();
      if(!message.includes('intézményi jóváhagyás'))throw Error('A közzétételi kapu nem blokkolta a műveletet: '+message);
    });
    await check('Dokumentált intézményi jóváhagyás és szerkesztés',async()=>{
      await page.locator('#mm-rights-ok').check();
      await page.locator('#mm-institution-ok').check();
      await page.locator('#mm-rights-holder').fill('Teszt jogosult');
      await page.locator('#mm-rights-license').fill('Teszt engedély');
      await page.locator('#mm-rights-source').fill('TESZT-IKT-123');
      await page.locator('#mm-rights-reviewer').fill('Teszt felelős');
      await page.locator('#mm-description').fill('Automatizált ellenőrzésből származó tesztdokumentum.');
      await page.locator('#mm-save').click();
      if(!(await page.locator('#mm-status').textContent()).includes('előkészítve'))throw Error('A szerkesztés nem menthető');
    });
    await check('Változásokat tartalmazó ZIP készíthető',async()=>{
      const pending=page.waitForEvent('download',{timeout:30000});
      await page.locator('#mm-export-changes').click();
      const download=await pending;
      if(download.suggestedFilename()!=='csanadi-mediatar-valtozasok.zip')throw Error('Hibás ZIP neve');
      const stat=fs.statSync(await download.path());
      if(stat.size<1200)throw Error('Üres ZIP');
      if(!(await page.locator('#mm-status').textContent()).includes('ZIP'))throw Error('Nem jelzi a kiadás státuszát');
    });
    await check('Mobilon vízszintesen lapozható navigáció',async()=>{
      await page.setViewportSize({width:390,height:844});
      await page.goto(base+'tools/eszkoz-mediator.html',{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>document.querySelector('#mm-count')?.textContent==='748',{timeout:20000});
      const outcome=await page.evaluate(()=>{
        const nav=document.querySelector('.cs-tools-global-nav-inner');
        return {scrollWidth:nav.scrollWidth,clientWidth:nav.clientWidth,overflow:getComputedStyle(nav).overflowX};
      });
      if(outcome.scrollWidth<=outcome.clientWidth||outcome.overflow!=='auto')throw Error('A keskeny menü nem görgethető: '+JSON.stringify(outcome));
    });
    await context.close();
  }finally{await browser.close();}
})().catch(error=>{errors.push(error.message);}).finally(()=>{
  server.close();
  const failed=checks.filter(x=>!x.passed);
  console.log(JSON.stringify({release:'1.39.4',browser:'Chromium',checks:checks.length,passed:checks.length-failed.length,failed,pageErrors:errors},null,2));
  if(failed.length||errors.length||checks.length===0)process.exitCode=1;
  if(failed.length||errors.length)process.exitCode=1;
});
