/** M20/D: opcionális, valódi Chromium mobil/asztali füstteszt.
    Futás: CSANADI_PLAYWRIGHT_PACKAGE=/path/to/playwright node tools/verify-m20-browser.mjs
    Külső CDN- és valódi iOS/Android-készülékfüggés külön nyitott marad. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
let chromium;
try{({chromium}=require(process.env.CSANADI_PLAYWRIGHT_PACKAGE||'playwright'));}
catch(error){throw new Error('Playwright nem telepített. Állítsd a CSANADI_PLAYWRIGHT_PACKAGE környezeti változót a Playwright csomag útvonalára. '+error.message);}
const root=path.resolve(import.meta.dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css',
 '.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg',
 '.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url||'/',`http://${req.headers.host}`);
 let wanted;
 try{wanted=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end();return;}
 const file=path.resolve(root,'.'+wanted.replace(/\/$/,'/index.html'));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(error,data)=>{
  if(error){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':(mime[path.extname(file)]||'application/octet-stream')+'; charset=utf-8',
   'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(data);
 });
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const endpoint=`http://127.0.0.1:${server.address().port}/?preview=1`;
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CSANADI_CHROMIUM||'/usr/bin/chromium',
  args:['--no-sandbox','--disable-dev-shm-usage']});
 const runs=[{width:320,height:640,mobile:true},{width:390,height:844,mobile:true},
  {width:768,height:1024,mobile:true},{width:1024,height:768,mobile:false},
  {width:1440,height:900,mobile:false}];
 for(const spec of runs){
  const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},
   isMobile:spec.mobile,hasTouch:spec.mobile,deviceScaleFactor:1,serviceWorkers:'block'});
  const page=await context.newPage();
  const uncaught=[];
  page.on('pageerror',err=>uncaught.push(String(err.message)));
  await page.goto(endpoint+'#/',{waitUntil:'domcontentloaded',timeout:35000});
  await page.waitForTimeout(2500);
  const info=await page.evaluate(()=>{
   const header=document.querySelector('#cs-mobile-rebuild');
   const hero=document.querySelector('.cs-mb-cinema');
   const notice=document.querySelector('body > .csn20-language-bar');
   const hc=header?.getBoundingClientRect();
   return {
    href:location.href,
    header:!!header,headerShown:!!hc&&hc.width>0&&getComputedStyle(header).display!=='none',
    heroShown:!!hero&&hero.getBoundingClientRect().height>0,
    heroCount:hero?.querySelector('.cs-mb-film-count')?.textContent||'',
    arrows:hero?.querySelectorAll('.cs-mb-film-arrow').length||0,
    headerBounds:hc?{left:hc.left,right:hc.right,width:hc.width}:null,
    noticeToggle:!!notice?.querySelector('.cs-mb-notice-toggle'),
    pageWidth:document.documentElement.scrollWidth,
    screenWidth:document.documentElement.clientWidth,
    error:document.querySelector('#app > section h1')?.textContent||''
   };
  });
  assert.ok(!info.error.includes('Nem sikerült betölteni'),`${spec.width}px: SPA-hiba: ${info.error}`);
  assert.ok(info.pageWidth<=info.screenWidth+2,
   `${spec.width}px: vízszintes túlfutás ${info.pageWidth} / ${info.screenWidth}`);
  assert.equal(info.headerShown,spec.mobile,`${spec.width}px: mobilfejléc állapota`);
  assert.equal(info.heroShown,spec.mobile,`${spec.width}px: mobil-képváltó állapota`);
  if(spec.mobile){
   assert.equal(info.arrows,2,`${spec.width}px: képváltó gombok`);
   assert.match(info.heroCount,/\d+\s*\/\s*\d+/,`${spec.width}px: képszámláló`);
   assert.ok(info.headerBounds.right<=spec.width+2,`${spec.width}px: fejléc túlnyúlik`);
   await page.locator('.cs-mb-film-arrow').last().click({timeout:9000});
   await page.waitForTimeout(400);
   const nextCount=await page.locator('.cs-mb-film-count').first().textContent();
   assert.notEqual(nextCount,info.heroCount,`${spec.width}px: képváltás nem lépett tovább`);
  }
  // Másodlagos útvonal: az aloldali tájékoztatók és a mobilos nyelvválasztó.
  await page.goto(endpoint+'#/informaciok/dokumentumtar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1600);
  if(spec.mobile){
   const toggle=page.locator('body > .csn20-language-bar > .cs-mb-notice-toggle');
   if(await toggle.count()){
    assert.equal(await toggle.getAttribute('aria-expanded'),'false',`${spec.width}px: nyitott alapállapot`);
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'),'true',`${spec.width}px: nyitás`);
    const inside=page.locator('body > .csn20-language-bar > .cs-mb-notice-body button').first();
    await inside.focus();
    await inside.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false',`${spec.width}px: Escape zárás`);
   }
  }else{
   assert.equal(await page.locator('.cs-mb-notice-toggle').count(),0,`${spec.width}px: desktop tájékoztató marad`);
  }
  assert.deepEqual(uncaught,[],`${spec.width}px: böngészős JS-kivétel`);
  console.log(`Chromium ${spec.width}×${spec.height} PASS: fejléc, lapozás, aloldal, túlfutás, konzol`);
  await context.close();
 }
}finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
