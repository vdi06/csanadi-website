/* v1.40.3 – valódi Chromium-teszt különböző mobil/tablet/asztali nézetekben. */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createReadStream,statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=createServer((req,res)=>{
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 const relative=pathname.replace(/^\/+/, '')||'index.html';
 const absolute=path.resolve(root,relative);
 if(!absolute.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{const stat=statSync(absolute);if(!stat.isFile())throw Error('not file');
  res.writeHead(200,{'Content-Type':types[path.extname(absolute)]||'application/octet-stream','Content-Length':stat.size});createReadStream(absolute).pipe(res);
 }catch{res.writeHead(404).end();}
});

const failures=[];let checks=0;
const check=async(name,fn)=>{checks++;try{await fn();}catch(error){failures.push({name,message:String(error.message||error).slice(0,280)});}};
const browser=await chromium.launch({headless:true,executablePath:process.env.CSANADI_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const url=`http://127.0.0.1:${server.address().port}/`;
 const sizes=[{width:320,height:700},{width:350,height:780},{width:390,height:844},{width:768,height:1024},{width:1024,height:768},{width:1366,height:900}];
 for(const viewport of sizes){
  for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport,isMobile:viewport.width<=390,hasTouch:viewport.width<=390,reducedMotion:'reduce'});
   await context.addInitScript(mode=>{localStorage.setItem('csanadi-theme',mode);localStorage.setItem('csanadi-portal-visit-v3',new Date().toISOString().slice(0,10));},theme);
   const page=await context.newPage();const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
   for(const route of ['#/','#/iskolank/bemutatkozas']){
    const label=`${viewport.width}px ${theme} ${route}`;
    await check(label+' render',async()=>{
     await page.goto(url+route,{waitUntil:'domcontentloaded',timeout:20000});
     await page.waitForFunction(()=>!!document.querySelector('#app')?.textContent?.trim(),{timeout:20000});
     await page.waitForTimeout(350);
     const state=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,theme:document.documentElement.dataset.theme,title:document.title,controls:['#search-open','#theme-toggle','#mobile-menu-toggle','.header-kreta'].map(sel=>{const el=document.querySelector(sel);if(!el)return {sel,missing:true};const rect=el.getBoundingClientRect(),style=getComputedStyle(el);return {sel,x:rect.x,right:rect.right,width:rect.width,display:style.display,visibility:style.visibility};})}));
     assert.equal(state.theme,theme,'téma');
     assert.ok(state.title.includes('Csanádi Sportiskola'),'oldalcím');
     assert.ok(state.scrollWidth<=state.width+2,`vízszintes túlcsordulás: ${state.scrollWidth} > ${state.width}`);
     for(const control of state.controls){
      if(control.sel==='#mobile-menu-toggle'&&viewport.width>=1024)continue;
      if(control.sel==='.header-kreta'&&viewport.width<=350&&control.display==='none')continue;
      assert.ok(!control.missing,`${control.sel} nem található`);
      if(control.display==='none'||control.visibility==='hidden')continue;
      assert.ok(control.width>=16&&control.x>=-2&&control.right<=viewport.width+2,`${control.sel} kilóg: ${JSON.stringify(control)}`);
     }
    });
   }
   await check(`${viewport.width}px ${theme} kereső`,async()=>{
    await page.locator('#search-open').click({timeout:4000});
    await page.locator('#search-panel .search-dialog').waitFor({state:'visible',timeout:3000});
    await page.locator('#search-close').click({timeout:3000});
   });
   if(viewport.width<=768){await check(`${viewport.width}px ${theme} mobil-/táblagépmenü`,async()=>{
    await page.locator('#mobile-menu-toggle:visible,#cs-subpage-menu:visible,#orbit-open:visible').first().click({timeout:4000});
    await page.locator('#site-map-overlay').waitFor({state:'visible',timeout:4000});
    await page.locator('#site-map-close').click({timeout:4000});
   });}
   await check(`${viewport.width}px ${theme} script-hibák`,async()=>{assert.deepEqual(pageErrors,[]);});
   if(viewport.width===390&&theme==='light')await page.screenshot({path:path.resolve(root,'../qa-mobile-390-v1403.png'),fullPage:false});
   if(viewport.width===768&&theme==='light')await page.screenshot({path:path.resolve(root,'../qa-tablet-768-v1403.png'),fullPage:false});
   await context.close();
  }
 }
 const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 await context.addInitScript(()=>{localStorage.setItem('csanadi-theme','light');localStorage.setItem('csanadi-portal-visit-v3',new Date().toISOString().slice(0,10));});
 const page=await context.newPage();const heroErrors=[];page.on('pageerror',e=>heroErrors.push(e.message));
 await page.goto(url+'#/');await page.waitForSelector('.csn26-visual-wing[data-slide="1"]',{timeout:20000});
 const imageSources=[];
 for(let i=1;i<=30;i++){
  await check(`30 fotó: ${i}. dia`,async()=>{
   if(i>1){await page.getByRole('button',{name:'Következő képes tartalom'}).click();await page.waitForSelector(`.csn26-visual-wing[data-slide="${i}"]`,{timeout:5000});}
   const image=await page.evaluate(()=>{const img=document.querySelector('.csn26-wing-photo img');return img?{src:img.currentSrc||img.src,loaded:img.complete&&img.naturalWidth>0,naturalWidth:img.naturalWidth}:null;});
   assert.ok(image?.loaded,`A(z) ${i}. dia képe nem töltődött be`);imageSources.push(image.src);
  });
 }
 await check('30 fotó: 30 eltérő böngészős forrás',async()=>assert.equal(new Set(imageSources).size,30));
 await check('30 fotó: nincs JavaScript-hiba',async()=>assert.deepEqual(heroErrors,[]));
 await context.close();
 console.log(JSON.stringify({version:'1.40.3',browser:'Chromium',viewports:sizes.map(x=>x.width),themes:['light','dark'],routesPerViewport:2,slideCount:30,checks,passed:checks-failures.length,failed:failures},null,2));
 if(failures.length)process.exitCode=1;
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
