/* v1.39.10: valódi Chromium tesztek a kezdőlapi összefüggő menü- és képváltósávra. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const checks=[],pageErrors=[];
const mime={html:'text/html; charset=utf-8',js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',webp:'image/webp',png:'image/png',jpg:'image/jpeg'};
const server=http.createServer((request,response)=>{
 let uri;try{uri=decodeURIComponent(new URL(request.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';}
 catch{response.writeHead(400).end();return;}
 const file=path.resolve(root,uri);
 if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
 fs.stat(file,(error,stat)=>{
  if(error||!stat.isFile()){response.writeHead(404).end();return;}
  response.writeHead(200,{'Content-Type':mime[uri.split('.').pop()]||'application/octet-stream'});
  fs.createReadStream(file).pipe(response);
 });
});
const test=async(name,fn)=>{try{await fn();checks.push({name,ok:true});}
 catch(error){checks.push({name,ok:false,error:String(error.message||error).slice(0,500)});}};
const nearly=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<=1,`${label}: ${actual} vs ${expected}`);
async function geometry(page){return page.evaluate(()=>{
 const rect=selector=>{
  const element=document.querySelector(selector),r=element?.getBoundingClientRect(),style=element&&getComputedStyle(element);
  return r?{x:r.x,y:r.y,width:r.width,height:r.height,radius:style.borderTopLeftRadius,display:style.display}:null;
 };
 return {header:rect('#site-header'),hero:rect('#global-hero'),row:rect('.csn26-visual-row'),
  left:rect('.csn26-visual-wing--left .csn26-wing-surface'),right:rect('.csn26-visual-wing--right .csn26-wing-surface'),
  prev:rect('.csn26-edge-arrow--left'),next:rect('.csn26-edge-arrow--right'),
  mini:rect('#cs39-mini-hero'),
  mainH1:[...document.querySelectorAll('main h1,#global-hero h1')].map(node=>({text:node.textContent.trim(),visuallyHidden:node.classList.contains('visually-hidden')})),
  width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
  miniParent:document.querySelector('#cs39-mini-hero')?.parentElement?.id,
  heroParent:document.querySelector('#global-hero')?.parentElement?.id,
  removedText:!!document.querySelector('.csn26-visual-heading'),
  condensed:document.body.classList.contains('cs-home-condensed'),
  heroInert:document.getElementById('global-hero')?.inert,
  heroAriaHidden:document.getElementById('global-hero')?.getAttribute('aria-hidden')};
});}
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}/`;
 const browser=await chromium.launch({executablePath:fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const width of [1366,768,390,320]){
   const context=await browser.newContext({viewport:{width,height:width===1366?900:844},reducedMotion:'reduce'});
   const page=await context.newPage();page.on('pageerror',error=>pageErrors.push(`${width}px: ${error.message}`));
   await page.goto(url+'#/');
   await page.locator('.csn26-visual-row').waitFor({state:'visible'});
   await test(`${width}px: nincsen látható bevezető, de marad H1`,async()=>{
    const g=await geometry(page);
    assert.equal(g.removedText,false);
    assert.ok(g.mainH1.some(h=>h.visuallyHidden&&h.text.includes('Csanádi')),'Hiányzó akadálymentes oldalcím');
    assert.equal(g.heroParent,'cs39-home-shell');assert.equal(g.miniParent,'site-header');
   });
   await test(`${width}px: szögletes képek és pontosan illeszkedő nyilak`,async()=>{
    const g=await geometry(page);
    assert.equal(g.left.radius,'0px');assert.equal(g.prev.radius,'0px');assert.equal(g.next.radius,'0px');
    nearly(g.prev.x+g.prev.width,g.left.x,'bal nyíl → kép');
    if(g.right.display!=='none'){
     nearly(g.left.x+g.left.width,g.right.x,'két kép');
     nearly(g.right.x+g.right.width,g.next.x,'jobb kép → nyíl');
    }else nearly(g.left.x+g.left.width,g.next.x,'mobilkép → jobb nyíl');
    nearly(g.header.y+g.header.height,g.hero.y,'fejléc → képsáv');
    assert.ok(g.scrollWidth-g.width<=8,`Vízszintes túlcsordulás: ${g.scrollWidth-g.width}px`);
   });
   await test(`${width}px: a képsáv összehúzódik a menübe, visszaáll`,async()=>{
    const before=await geometry(page);
    await page.evaluate(()=>scrollTo({top:700,behavior:'instant'}));
    await page.waitForFunction(()=>document.body.classList.contains('cs-home-condensed'));
    const after=await geometry(page);
    assert.equal(after.condensed,true);assert.equal(after.heroInert,true);assert.equal(after.heroAriaHidden,'true');
    assert.equal(after.mini.display,'flex');assert.equal(after.miniParent,'site-header');
    assert.ok(after.header.height<before.header.height+before.hero.height,'Nem lett kisebb a teljes fejlécegység');
    const prev=page.locator('#cs39-mini-hero .cs39-mini-step').first();
    await prev.click();
    await page.locator('#cs39-mini-hero .cs39-mini-preview').waitFor({state:'visible'});
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await page.waitForFunction(()=>!document.body.classList.contains('cs-home-condensed'));
    const restored=await geometry(page);assert.equal(restored.heroInert,false);assert.notEqual(restored.heroAriaHidden,'true');
   });
   await context.close();
  }
 }finally{await browser.close();}
}
main().catch(error=>pageErrors.push(error.stack||error.message)).finally(()=>{
 server.close();const failed=checks.filter(c=>!c.ok);
 console.log(JSON.stringify({release:'1.39.10',engine:'Chromium',viewportWidths:[1366,768,390,320],checks:checks.length,passed:checks.length-failed.length,failed,pageErrors},null,2));
 if(failed.length||pageErrors.length||checks.length!==12)process.exitCode=1;
});
